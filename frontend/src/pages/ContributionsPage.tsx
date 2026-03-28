import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ContributionModal } from '../components/ContributionModal';

interface Contribution {
  id: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  reference?: string;
  user?: {
    id: string;
    fullName: string;
  };
  month?: {
    name: string;
    year: number;
  };
}

export const ContributionsPage: React.FC = () => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');

  // Filters
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const contributionsData = await apiService.getAllContributions();
      setContributions(contributionsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContributionSuccess = () => {
    setSuccess('Contribution submitted successfully!');
    loadData();
    setTimeout(() => setSuccess(''), 5000);
  };

  // Derive unique members list for the filter dropdown
  const members = useMemo(() => {
    const seen = new Map<string, string>();
    contributions.forEach((c) => {
      if (c.user && !seen.has(c.user.id)) {
        seen.set(c.user.id, c.user.fullName);
      }
    });
    return Array.from(seen.entries()).map(([id, fullName]) => ({ id, fullName }));
  }, [contributions]);

  // Apply filters
  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      const matchesMember = memberFilter === 'all' || c.user?.id === memberFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesMember && matchesStatus;
    });
  }, [contributions, memberFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block mb-2">
            Contributions
          </h1>
          <p className="text-slate-500">All member contributions — transparent and up to date</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Contribution
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-green-50 border-l-4 border-success text-green-700 mb-6 flex items-center gap-3">
          <span>✅</span> {success}
        </div>
      )}

      <div className="card">
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-xl font-bold text-slate-800">All Contributions</h3>
          <div className="flex flex-wrap gap-3">
            {/* Member filter */}
            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
            >
              <option value="all">All Members</option>
              {user && (
                <option value={user.id}>My Contributions</option>
              )}
              {members
                .filter((m) => m.id !== user?.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
            </select>

            {/* Status filter */}
            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <p className="text-slate-500 mb-6">
              {contributions.length === 0
                ? 'No contributions yet'
                : 'No contributions match the selected filters'}
            </p>
            {contributions.length === 0 && (
              <button className="btn-primary py-2 px-4 text-sm" onClick={() => setShowModal(true)}>
                Make your first contribution
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((contribution) => (
                  <tr key={contribution.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          {contribution.user?.fullName || 'Unknown'}
                        </span>
                        {contribution.user?.id === user?.id && (
                          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-900">
                      ₦{Number(contribution.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-slate-700">
                      {contribution.month
                        ? `${contribution.month.name} ${contribution.month.year}`
                        : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${
                        contribution.status === 'verified' ? 'bg-green-100 text-green-700' :
                        contribution.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {contribution.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleContributionSuccess}
      />
    </div>
  );
};
