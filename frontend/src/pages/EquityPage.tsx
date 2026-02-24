import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MemberEquity {
  userId: string;
  fullName: string;
  totalContributed: number;
  memberUnits: number;
  equityPercentage: number;
}

interface EquityData {
  totalUnits: number;
  totalPool?: number; 
  members: MemberEquity[];
  calculatedAt: string;
}

export const EquityPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EquityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const equityData = await apiService.getEquity();
      // Sort by equity percentage descending
      equityData.members.sort((a, b) => b.equityPercentage - a.equityPercentage);
      setData(equityData);
    } catch (error) {
      console.error('Failed to load equity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentUserData = data?.members.find(m => m.userId === user?.id);

  return (
    <div className="py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block mb-2">Equity Breakdown</h1>
        <p className="text-slate-500">Real-time ownership distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card bg-gradient-to-br from-primary to-primary-light text-white border-none text-center transform hover:-translate-y-1 transition-transform">
          <div className="text-sm font-medium uppercase tracking-wider text-white/80 mb-2">Total Units</div>
          <div className="text-4xl font-bold mb-1">{data?.totalUnits.toFixed(4)}</div>
          <div className="text-sm text-white/70">Circulating Supply</div>
        </div>
        
        <div className="card text-center">
          <div className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-2">Members</div>
          <div className="text-4xl font-bold text-slate-800 mb-1">{data?.members.length}</div>
          <div className="text-sm text-slate-400">Active Investors</div>
        </div>

        <div className="card text-center border-primary/20 bg-primary/5">
          <div className="text-sm font-medium uppercase tracking-wider text-primary mb-2">Your Share</div>
          <div className="text-4xl font-bold text-primary mb-1">
            {currentUserData?.equityPercentage.toFixed(2)}%
          </div>
          <div className="text-sm text-primary/70">{currentUserData?.memberUnits.toFixed(4)} Units</div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-xl font-bold text-slate-800">Member Distribution</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[80px]">Rank</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Units Held</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Equity Share</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[30%]">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.members.map((member, index) => (
                <tr key={member.userId} className={`hover:bg-slate-50 transition-colors ${member.userId === user?.id ? 'bg-primary/5 hover:bg-primary/10' : ''}`}>
                  <td className="p-4">
                     <span className={`font-bold text-lg ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-slate-400' :
                      index === 2 ? 'text-amber-700' :
                      'text-slate-300'
                     }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-slate-800">
                        {member.fullName}
                        {member.userId === user?.id && <span className="ml-2 bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600">
                    {member.memberUnits.toFixed(4)}
                  </td>
                  <td className="p-4 text-right font-bold text-primary">
                    {member.equityPercentage.toFixed(2)}%
                  </td>
                  <td className="p-4">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${member.equityPercentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
