
import React from 'react';
import { OfficerData, RankPost } from '../types';

interface Props {
  data: OfficerData[];
  onSelectRank: (rank: RankPost | 'VAGOS') => void;
  selectedRank: RankPost | 'VAGOS' | null;
}

const DashboardCards: React.FC<Props> = ({ data, onSelectRank, selectedRank }) => {
  const getRankData = (rank: RankPost) => data.find(d => d.rank === rank);

  const totalVacancies = data.reduce((acc, curr) => {
    const vacant = curr.fixed - curr.occupied;
    return vacant > 0 ? acc + vacant : acc;
  }, 0);

  const renderCard = (
    id: RankPost | 'VAGOS',
    label: string,
    value: number,
    color: string,
    icon: React.ReactNode,
    showProgress: boolean = true
  ) => {
    const rankData = typeof id !== 'string' ? getRankData(id as RankPost) : null;
    const progress = rankData && rankData.fixed > 0 ? Math.min(100, (rankData.occupied / rankData.fixed) * 100) : 0;
    const isOver = rankData ? rankData.occupied > rankData.fixed : false;
    const isActive = selectedRank === id;

    return (
      <button 
        key={id} 
        onClick={() => onSelectRank(id as any)}
        className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 text-left h-full
          ${isActive 
            ? 'bg-slate-900 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] scale-[1.02]' 
            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 shadow-lg'
          }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            {icon}
          </div>
          <div className="text-right">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
              {isActive ? 'STATUS: ACTIVE' : 'SYSTEM: OK'}
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          <p className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-4xl font-black ${isActive ? 'text-white' : color} tracking-tight leading-none`}>
              {value}
            </p>
            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-cyan-600' : 'text-slate-700'}`}>
              Acima
            </span>
          </div>
        </div>

        {showProgress && rankData && (
          <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : 'bg-cyan-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {renderCard(
        RankPost.TC,
        'TC para CEL',
        getRankData(RankPost.TC)?.surplus || 0,
        'text-cyan-500',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      )}
      {renderCard(
        RankPost.MAJ,
        'MAJ para TC',
        getRankData(RankPost.MAJ)?.surplus || 0,
        'text-cyan-500',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      )}
      {renderCard(
        RankPost.MAJ_QOE,
        'MAJ QOE para TC',
        getRankData(RankPost.MAJ_QOE)?.surplus || 0,
        'text-amber-500',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" /></svg>
      )}
      {renderCard(
        RankPost.CAP_MAJ_QOE,
        'CAP QOE para MAJ',
        getRankData(RankPost.CAP_MAJ_QOE)?.surplus || 0,
        'text-amber-500',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0" /></svg>
      )}
      {renderCard(
        RankPost.CAP,
        'CAP para MAJ',
        getRankData(RankPost.CAP)?.surplus || 0,
        'text-cyan-500',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      )}
      {renderCard(
        'VAGOS',
        'Cargos Vagos',
        totalVacancies,
        'text-rose-500',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>,
        false
      )}
    </div>
  );
};

export default DashboardCards;
