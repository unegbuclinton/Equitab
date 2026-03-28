import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Month {
  id: string;
  month: number;
  year: number;
  isClosed: boolean;
  minimumContribution: number;
}

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [months, setMonths] = useState<Month[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [amount, setAmount] = useState('');
  const [monthId, setMonthId] = useState('');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMonths();
    }
  }, [isOpen]);

  const loadMonths = async () => {
    try {
      const monthsData = await apiService.getMonths();
      const openMonths = monthsData.filter((m: Month) => !m.isClosed);
      setMonths(openMonths);
      
      if (openMonths.length > 0) {
        setMonthId(openMonths[0].id);
      }
    } catch (err) {
      console.error('Failed to load months:', err);
      setError('Failed to load available months');
    }
  };

  const getMonthName = (month: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!user) throw new Error('User not found');
      
      await apiService.createContribution({
        userId: user.id,
        amount: Number(amount),
        monthId,
        reference,
        file: file || undefined
      });

      // Reset form
      setAmount('');
      setReference('');
      setFile(null);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit contribution:', err);
      setError(err.message || 'Failed to submit contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💵 Add Contribution">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border-l-4 border-error text-red-700 mb-6 flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {months.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 opacity-50">📅</div>
          <p className="text-slate-500 mb-2">No open months available</p>
          <p className="text-sm text-slate-400">Please contact an admin to create a new month</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (₦) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="input-field text-lg"
                autoFocus
              />
              {monthId && months.find(m => m.id === monthId) && (
                <p className="text-xs text-slate-500 mt-1">
                  Minimum: ₦{Number(months.find(m => m.id === monthId)?.minimumContribution).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Month <span className="text-error">*</span>
              </label>
              <select
                value={monthId}
                onChange={(e) => setMonthId(e.target.value)}
                required
                className="input-field"
              >
                <option value="">Select a month</option>
                {months.map(month => (
                  <option key={month.id} value={month.id}>
                    {getMonthName(month.month)} {month.year} (Min: ₦{Number(month.minimumContribution).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reference / Note (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Bank transfer reference, etc."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Receipt/File (Optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  } else {
                    setFile(null);
                  }
                }}
                className="input-field py-2"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
            </button>
            <button 
              type="button" 
              className="btn-secondary px-6"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
