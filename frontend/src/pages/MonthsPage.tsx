import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';

interface Month {
  id: string;
  year: number;
  month: number;
  isClosed: boolean;
  minimumContribution: number;
  closedAt?: string;
  _count?: {
    contributions: number;
  };
}

export const MonthsPage: React.FC = () => {
  const { user } = useAuth();
  const [months, setMonths] = useState<Month[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [minimumContribution, setMinimumContribution] = useState('50000');

  useEffect(() => {
    loadMonths();
  }, []);

  const loadMonths = async () => {
    try {
      const monthsData = await apiService.getMonths();
      setMonths(monthsData);
    } catch (err) {
      console.error('Failed to load months:', err);
      setError('Failed to load months data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await apiService.createMonth({
        year: parseInt(year),
        month: parseInt(month),
        minimumContribution: parseFloat(minimumContribution)
      });

      setSuccess('Month created successfully!');
      setShowCreateModal(false);
      setYear(new Date().getFullYear().toString());
      setMonth((new Date().getMonth() + 1).toString());
      setMinimumContribution('50000');
      loadMonths();
    } catch (err: any) {
      console.error('Failed to create month:', err);
      setError(err.message || 'Failed to create month');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseMonth = async (monthId: string) => {
    if (!confirm('Are you sure you want to close this month? All contributions must be verified first.')) {
      return;
    }

    try {
      await apiService.closeMonth(monthId);
      setSuccess('Month closed successfully!');
      loadMonths();
    } catch (err: any) {
      setError(err.message || 'Failed to close month');
    }
  };

  const handleReopenMonth = async (monthId: string) => {
    if (!confirm('Are you sure you want to reopen this month?')) {
      return;
    }

    try {
      await apiService.reopenMonth(monthId);
      setSuccess('Month reopened successfully!');
      loadMonths();
    } catch (err: any) {
      setError(err.message || 'Failed to reopen month');
    }
  };

  const getMonthName = (monthNum: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthNum - 1];
  };

  if (!user?.isAdmin) {
    return (
      <div className="py-8">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Access Required</h2>
          <p className="text-slate-500">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

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
            Months Management
          </h1>
          <p className="text-slate-500">Create and manage contribution periods</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreateModal(true)}
        >
          + Create Month
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border-l-4 border-error text-red-700 mb-6 flex items-center gap-3">
          <span>⚠️</span> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 border-l-4 border-success text-green-700 mb-6 flex items-center gap-3">
          <span>✅</span> {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {months.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📅</div>
            <p className="text-slate-500 mb-6">No months created yet</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              Create First Month
            </button>
          </div>
        ) : (
          months.map((monthItem) => (
            <div
              key={monthItem.id}
              className={`card ${monthItem.isClosed ? 'bg-slate-50' : 'bg-white border-primary/20'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {getMonthName(monthItem.month)} {monthItem.year}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {monthItem._count?.contributions || 0} contributions
                  </p>
                </div>
                <span className={`badge ${
                  monthItem.isClosed 
                    ? 'bg-slate-200 text-slate-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {monthItem.isClosed ? '🔒 Closed' : '✅ Open'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Minimum</span>
                  <span className="font-bold text-slate-800">
                    ₦{Number(monthItem.minimumContribution).toLocaleString()}
                  </span>
                </div>

                {monthItem.closedAt && (
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Closed</span>
                    <span className="text-sm text-slate-700">
                      {new Date(monthItem.closedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {monthItem.isClosed ? (
                  <button
                    onClick={() => handleReopenMonth(monthItem.id)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    🔓 Reopen
                  </button>
                ) : (
                  <button
                    onClick={() => handleCloseMonth(monthItem.id)}
                    className="btn-primary flex-1 text-sm"
                  >
                    🔒 Close Month
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Month Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="📅 Create New Month"
      >
        <form onSubmit={handleCreateMonth}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  min="2020"
                  max="2100"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month <span className="text-error">*</span>
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Contribution (₦) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={minimumContribution}
                onChange={(e) => setMinimumContribution(e.target.value)}
                required
                min="0"
                step="0.01"
                className="input-field text-lg"
              />
              <p className="text-xs text-slate-500 mt-1">
                Set the minimum amount members must contribute this month
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              type="submit" 
              className="btn-primary flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Month'}
            </button>
            <button 
              type="button" 
              className="btn-secondary px-6"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
