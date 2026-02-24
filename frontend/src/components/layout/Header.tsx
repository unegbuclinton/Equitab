import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
            <span className="font-heading font-bold text-xl text-slate-800 tracking-tight">Equity<span className="text-primary">Ledger</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors relative ${isActive('/') ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Dashboard
              {isActive('/') && <span className="absolute -bottom-5 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
            </Link>
            <Link
              to="/contributions"
              className={`text-sm font-medium transition-colors relative ${isActive('/contributions') ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Contributions
              {isActive('/contributions') && <span className="absolute -bottom-5 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
            </Link>
            <Link
              to="/equity"
              className={`text-sm font-medium transition-colors relative ${isActive('/equity') ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Equity
              {isActive('/equity') && <span className="absolute -bottom-5 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
            </Link>
            {user?.isAdmin && (
              <Link
                to="/verification"
                className={`text-sm font-medium transition-colors relative flex items-center gap-2 ${isActive('/verification') ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Verification
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">Admin</span>
                {isActive('/verification') && <span className="absolute -bottom-5 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                {user?.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-semibold text-slate-800 leading-none">{user?.fullName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{user?.isAdmin ? 'Administrator' : 'Member'}</div>
              </div>
            </div>
            
            <button onClick={handleLogout} className="btn-secondary btn-sm rounded-full">
              Logout
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-3 shadow-lg">
          <Link to="/" className="block py-2 text-slate-700 font-medium">Dashboard</Link>
          <Link to="/contributions" className="block py-2 text-slate-700 font-medium">Contributions</Link>
          <Link to="/equity" className="block py-2 text-slate-700 font-medium">Equity</Link>
          {user?.isAdmin && (
            <Link to="/verification" className="block py-2 text-slate-700 font-medium">Verification (Admin)</Link>
          )}
        </div>
      )}
    </header>
  );
};
