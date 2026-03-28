import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ContributionModal } from '../components/ContributionModal';

interface EquityData {
  totalUnits: number;
  members: Array<{
    userId: string;
    fullName: string;
    memberUnits: number;
    equityPercentage: number;
  }>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [equity, setEquity] = useState<EquityData | null>(null);
  const [myEquity, setMyEquity] = useState<any>(null);
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [allContributions, setAllContributions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showContributionModal, setShowContributionModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [equityData, myEquityData, allContribsData, monthsData] =
        await Promise.all([
          apiService.getEquity(),
          user ? apiService.getMemberEquity(user.id) : Promise.resolve(null),
          apiService.getAllContributions(),
          apiService.getMonths(),
        ]);

      setEquity(equityData);
      setMyEquity(myEquityData);
      setRecentContributions(allContribsData.slice(0, 10));
      setAllContributions(allContribsData);
      setMonths(monthsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter all contributions by selected month, then sum verified amounts
  const filteredContributions = useMemo(() => {
    if (selectedMonthId === 'all') return allContributions;
    return allContributions.filter(c => c.monthId === selectedMonthId);
  }, [allContributions, selectedMonthId]);

  const totalVerifiedSum = useMemo(() =>
    filteredContributions
      .filter(c => c.status === 'verified')
      .reduce((sum, c) => sum + Number(c.amount), 0),
    [filteredContributions]
  );

  const totalPendingCount = useMemo(() =>
    filteredContributions.filter(c => c.status === 'pending').length,
    [filteredContributions]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-lg text-slate-500">Here's your investment overview</p>
        </div>
        <button
          className="btn-primary whitespace-nowrap"
          onClick={() => setShowContributionModal(true)}
        >
          + Add Contribution
        </button>
      </div>

      {/* Equity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card bg-gradient-to-br from-primary to-primary-light text-white border-none transform hover:-translate-y-1 transition-transform">
          <div className="text-4xl mb-4">📈</div>
          <div className="flex-1">
            <div className="text-sm font-medium uppercase tracking-wider text-white/80 mb-1">Your Equity</div>
            <div className="text-3xl font-bold mb-1">
              {myEquity?.equityPercentage.toFixed(2)}%
            </div>
            <div className="text-xs text-white/70">
              {myEquity?.totalUnits.toFixed(4)} units
            </div>
          </div>
        </div>

        <div className="card group hover:border-primary/30">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🏦</div>
          <div className="flex-1">
            <div className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-1">Total Group Units</div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {equity?.totalUnits.toFixed(4)}
            </div>
            <div className="text-xs text-slate-400">
              {equity?.members.length} members
            </div>
          </div>
        </div>

        {/* Total Contributions — real ₦ sum, filterable by month */}
        <div className="card group hover:border-primary/30">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Total Contributions
              </div>
              <select
                id="total-contributions-month-filter"
                className="text-[11px] border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-500 bg-white focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer max-w-[90px]"
                value={selectedMonthId}
                onChange={e => setSelectedMonthId(e.target.value)}
              >
                <option value="all">All time</option>
                {months.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name ?? `Month ${m.month}`} {m.year}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              ₦{totalVerifiedSum.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              {totalPendingCount} pending
            </div>
          </div>
        </div>

        <div className="card group hover:border-primary/30">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
          <div className="flex-1">
            <div className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-1">Your Rank</div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              #{equity && equity?.members.findIndex(m => m.userId === user?.id) + 1 || '-'}
            </div>
            <div className="text-xs text-slate-400">
              of {equity?.members.length} members
            </div>
          </div>
        </div>
      </div>

      {/* Equity Progress */}
      <div className="card mb-10">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-xl font-bold text-slate-800">Your Equity Growth</h3>
        </div>
        <div className="py-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
              style={{ width: `${myEquity?.equityPercentage || 0}%` }}
            />
          </div>
          <div className="text-center mt-4 text-sm text-slate-500">
            <span className="font-semibold text-primary">{myEquity?.equityPercentage.toFixed(2)}%</span> of total group equity
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="card h-full">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-slate-800 m-0">Recent Contributions</h3>
            <Link to="/contributions" className="text-primary hover:text-primary-dark text-sm font-medium transition-colors">
              View All →
            </Link>
          </div>

          {recentContributions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-50">📝</div>
              <p className="text-slate-500 mb-6">No contributions yet</p>
              <Link to="/contributions" className="btn-primary py-2 px-4 text-sm">
                Make Your First Contribution
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentContributions.map((contribution) => (
                <div key={contribution.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">
                        {contribution.user?.fullName || 'Unknown'}
                      </span>
                      {contribution.user?.id === user?.id && (
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono font-medium text-slate-600">
                        ₦{Number(contribution.amount).toLocaleString()}
                      </span>
                      <span>·</span>
                      <span>
                        {contribution.month
                          ? `${contribution.month.name} ${contribution.month.year}`
                          : new Date(contribution.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ml-3 shrink-0 ${
                    contribution.status === 'verified' ? 'bg-green-100 text-green-700' :
                    contribution.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {contribution.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card h-full">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-slate-800 m-0">Top Contributors</h3>
            <Link to="/equity" className="text-primary hover:text-primary-dark text-sm font-medium transition-colors">
              Full Breakdown →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {equity?.members.slice(0, 5).map((member, index) => (
              <div key={member.userId} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`text-xl font-bold min-w-[30px] ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-slate-400' :
                  index === 2 ? 'text-amber-700' :
                  'text-slate-300'
                }`}>#{index + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    {member.fullName}
                    {member.userId === user?.id &&
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                    }
                  </div>
                  <div className="text-xs text-slate-400">
                    {member.memberUnits.toFixed(4)} units
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">
                  {member.equityPercentage.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.isAdmin && (
          <>
            <Link to="/months" className="card group hover:border-primary/50 text-center block no-underline transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📅</div>
              <div className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">Manage Months</div>
              <div className="text-sm text-slate-500">Admin: Create & close periods</div>
            </Link>
          </>
        )}
      </div>

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
