import { Resend } from "resend";

// Only initialize if API key is provided
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export class EmailService {
  async sendContributionNotification(
    adminEmails: string[],
    memberName: string,
    amount: number,
    monthName: string,
    year: number,
  ) {
    if (!resend) {
      console.log(
        "📧 [Email Service - Mock] Notification would be sent to:",
        adminEmails,
      );
      console.log(`Subject: New Contribution - ${memberName}`);
      console.log(
        `Body: ${memberName} has added a new contribution of ₦${amount.toLocaleString()} for ${monthName} ${year}.`,
      );
      return;
    }

    try {
      const subject = `New Contribution Pending Verification - ${memberName}`;
      const amountFormatted = `₦${amount.toLocaleString()}`;

      const { data, error } = await resend.emails.send({
        // In a real app you need a verified domain. Using generic for testing if allowed,
        // or a testing email
        from: "Equity Ledger <onboarding@resend.dev>",
        to: ["zemus241@gmail.com"],
        subject,
        html: `
          <h2>New Contribution Alert</h2>
          <p>Hello Admin,</p>
          <p>A new contribution has been submitted and is pending verification.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Member:</strong> ${memberName}</p>
            <p><strong>Amount:</strong> ${amountFormatted}</p>
            <p><strong>Month:</strong> ${monthName} ${year}</p>
          </div>
          <p>Please log in to the dashboard to review and verify this contribution.</p>
        `,
      });

      if (error) {
        console.error("Error sending email via Resend:", error);
      } else {
        console.log("Email sent successfully:", data);
      }
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  }
}

export const emailService = new EmailService();
