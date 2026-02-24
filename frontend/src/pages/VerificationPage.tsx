import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface PendingContribution {
  id: string;
  amount: number;
  userId: string;
  user: {
    fullName: string;
    email: string;
  };
  createdAt: string;
  reference?: string;
  month?: {
    name: string;
    year: number;
  };
}

export const VerificationPage: React.FC = () => {
  const [pending, setPending] = useState<PendingContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const data = await apiService.getPendingContributions();
      setPending(data);
    } catch (error) {
      console.error('Failed to load pending contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    if (!window.confirm('Are you sure you want to verify this contribution?')) return;
    
    setProcessingId(id);
    try {
      await apiService.verifyContribution(id);
      setPending(pending.filter(p => p.id !== id));
    } catch (error) {
      alert('Failed to verify contribution');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (!reason) return;

    setProcessingId(id);
    try {
      await apiService.rejectContribution(id, reason);
      setPending(pending.filter(p => p.id !== id));
    } catch (error) {
      alert('Failed to reject contribution');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block mb-2">Pending Verifications</h1>
        <p className="text-slate-500">Review and approve member contributions</p>
      </div>

      <div className="card">
        {pending.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">✅</div>
            <p className="text-slate-500">All caught up! No pending contributions.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map(item => (
              <div key={item.id} className="border border-slate-200 rounded-lg border-l-4 border-l-warning flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-slate-900">₦{Number(item.amount).toLocaleString()}</h3>
                    <span className="badge bg-amber-100 text-amber-700">Pending</span>
                  </div>
                  <div className="text-slate-500 text-sm mb-1">
                    <strong className="text-slate-700">Contributor:</strong> {item.user.fullName} ({item.user.email})
                  </div>
                  <div className="text-slate-500 text-sm mb-1">
                    <strong className="text-slate-700">Date:</strong> {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  {item.month && (
                    <div className="text-slate-500 text-sm mb-1">
                      <strong className="text-slate-700">Month:</strong> {item.month.name} {item.month.year}
                    </div>
                  )}
                  {item.reference && (
                    <div className="text-slate-500 text-sm">
                      <strong className="text-slate-700">Ref:</strong> {item.reference}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="btn-success btn-sm"
                    onClick={() => handleVerify(item.id)}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? 'Processing...' : 'Verify'}
                  </button>
                  <button 
                    className="btn-error btn-sm"
                    onClick={() => handleReject(item.id)}
                    disabled={processingId === item.id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
