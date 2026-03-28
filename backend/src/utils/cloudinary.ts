import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import streamifier from 'streamifier';

// Initialize Cloudinary with fallback for local dev
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
  secure: true,
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'equity_ledger/contributions'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Only throw if we actually need the real keys in production
    if (!process.env.CLOUDINARY_CLOUD_NAME && process.env.NODE_ENV === 'production') {
      return reject(new Error('Cloudinary credentials missing'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Handles images, raw files, pdfs
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed - no result from Cloudinary'));
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};