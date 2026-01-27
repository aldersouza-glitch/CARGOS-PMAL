
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { OfficerData, RankPost, OfficerDetail } from './types';
import { INITIAL_DATA } from './constants';
import DashboardCards from './components/DashboardCards';

const App: React.FC = () => {
  const [data, setData] = useState<OfficerData[]>(() => {
    try {
      const saved = localStorage.getItem('pmal_v7_deploy_ready');
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch (e) {
      return INITIAL_DATA;
    }
  });
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pasteArea, setPasteArea] = useState('');
  const [selectedRank, setSelectedRank] = useState<RankPost | 'VAGOS' | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('pmal_v7_deploy_ready', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (selectedRank && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedRank]);

  const processDataString = (text: string) => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const officerLists: Record<string, OfficerDetail[]> = {
        [RankPost.TC]: [],
        [RankPost.MAJ]: [],
        [RankPost.MAJ_QOE]: [],
        [RankPost.CAP_MAJ_QOE]: [],
        [RankPost.CAP]: [],
      };

      let currentCategory = "";

      lines.forEach(line => {
        const upper = line.toUpperCase();
        if (upper.includes('TC - CEL')) currentCategory = RankPost.TC;
        else if (upper.includes('MAJ - TC QOE')) currentCategory = RankPost.MAJ_QOE;
        else if (upper.includes('CAP - MAJ QOE')) currentCategory = RankPost.CAP_MAJ_QOE;
        else if (upper.includes('MAJ - TC')) currentCategory = RankPost.MAJ;
        else if (upper.includes('CAP - MAJ')) currentCategory = RankPost.CAP;
        
        if (currentCategory && /^\d+/.test(line)) {
          const parts = line.split(/\t| {2,}/).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length >= 3) {
            const hasAnt = !isNaN(Number(parts[1]));
            const nameIdx = hasAnt ? 2 : 1;
            const roleIdx = hasAnt ? 3 : 2;
            const sectorIdx = hasAnt ? 4 : 3;

            officerLists[currentCategory].push({
              name: (parts[nameIdx] || "").replace(/ - \d+$/, "").trim(),
              role: parts[roleIdx] || "N/A",
              sector: parts[sectorIdx] || "N/A",
              antiquity: hasAnt ? parts[1] : undefined
            });
          }
        }
      });

      setData(prev => prev.map(item => {
        if (officerLists[item.rank] && officerLists[item.rank].length > 0) {
          return {
            ...item,
            surplus: officerLists[item.rank].length,
            surplusOfficers: officerLists[item.rank]
          };
        }
        return item;
      }));

      setIsImportModalOpen(false);
      setPasteArea('');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar dados. Verifique o formato.');
    }
  };

  const selectedData = useMemo(() => {
    if (!selectedRank || selectedRank === 'VAGOS') return null;
    return data.find(d => d.rank === selectedRank);
  }, [selectedRank, data]);

  const vacancyList = useMemo(() => {
    return data.map(d => ({
      rank: d.rank,
      fixed: d.fixed,
      occupied: d.occupied,
      vacant: Math.max(0, d.fixed - d.occupied)
    })).filter(v => v.vacant > 0);
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b-2 border-cyan-900/50 shadow-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.4)]">
              <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-2">
                PMAL <span className="text-cyan-500 text-xs not-italic font-bold border-l border-slate-700 pl-2 uppercase tracking-widest">ESTRATÉGICO</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-bold tracking-[0.4em] uppercase">Gestão de Oficiais de Alagoas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="bg-cyan-700 hover:bg-cyan-600 active:scale-95 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all border-b-2 border-cyan-900 shadow-lg"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Importar Dados
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <DashboardCards data={data} onSelectRank={setSelectedRank} selectedRank={selectedRank} />
        
        <div ref={detailRef} className="scroll-mt-24">
          {selectedRank === 'VAGOS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-rose-900/10 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500/10 p-2 rounded-lg text-rose-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">Mapa de Vacâncias</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vacancyList.map((v, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                      <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{v.rank}</span>
                      <p className="text-3xl font-black text-white leading-none">{v.vacant}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedRank && selectedRank !== 'VAGOS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-cyan-900/10 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">{selectedRank}</h3>
                    <p className="text-cyan-600 text-[9px] font-bold uppercase tracking-widest">Relatório de Oficiais um Posto Acima</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-0 overflow-x-auto">
                {selectedData?.surplusOfficers && selectedData.surplusOfficers.length > 0 ? (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800">
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest w-12 text-center">Ord.</th>
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest w-16 text-center">Antig.</th>
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Oficial</th>
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Lotação e Função</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {selectedData.surplusOfficers.map((off, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-3 text-slate-600 font-bold text-xs text-center">{String(idx + 1).padStart(2, '0')}</td>
                          <td className="px-6 py-3 text-center">
                            <span className="text-cyan-500 font-black text-xs">{off.antiquity || '--'}</span>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-bold text-slate-100 text-xs uppercase">{off.name}</p>
                          </td>
                          <td className="px-6 py-3">
                            <p className="text-slate-400 text-[10px] font-medium leading-relaxed mb-0.5">{off.role}</p>
                            <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest">{off.sector}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center gap-4 opacity-30">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest">Sem Registros Nominais</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 border-dashed">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-inner">
              <span className="text-xl font-black text-slate-500">PMAL</span>
            </div>
            <div>
              <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Gabinete de Operações</p>
              <h2 className="text-lg font-black text-white tracking-tight uppercase italic">Controle Nominal GSCG</h2>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
             <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
             <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
          </div>
        </footer>
      </main>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="bg-cyan-600 p-3 rounded-xl text-slate-950">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6" /></svg>
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Sync Data</h2>
                   <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Importação de Relatórios QOEM</p>
                 </div>
              </div>
              
              <textarea 
                className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-500 focus:border-cyan-700 outline-none transition-all placeholder:text-slate-900"
                placeholder="Cole o dump das tabelas de oficiais aqui..."
                value={pasteArea}
                onChange={(e) => setPasteArea(e.target.value)}
              />

              <div className="mt-6 flex gap-4">
                <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2 rounded-lg font-bold text-slate-500 uppercase text-[10px] hover:bg-slate-800 transition-colors">Cancelar</button>
                <button onClick={() => processDataString(pasteArea)} disabled={!pasteArea.trim()} className="flex-1 bg-cyan-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-600 disabled:opacity-10 transition-all">Processar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
