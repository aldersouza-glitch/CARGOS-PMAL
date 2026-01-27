
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { OfficerData, RankPost, OfficerDetail } from './types';
import { INITIAL_DATA } from './constants';
import DashboardCards from './components/DashboardCards';

const App: React.FC = () => {
  const [data, setData] = useState<OfficerData[]>(() => {
    try {
      const saved = localStorage.getItem('pmal_v8_stable');
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
    localStorage.setItem('pmal_v8_stable', JSON.stringify(data));
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
      alert('Erro no processamento. Verifique o formato do texto colado.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b-2 border-cyan-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-2">
                PMAL <span className="text-cyan-500 text-xs not-italic font-bold border-l border-slate-700 pl-2">ESTRATÉGICO</span>
              </h1>
              <p className="text-slate-500 text-[8px] font-bold tracking-widest uppercase">Diretoria de Pessoal - PMAL</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            Importar Dados
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <DashboardCards data={data} onSelectRank={setSelectedRank} selectedRank={selectedRank} />
        
        <div ref={detailRef} className="mt-8 scroll-mt-24">
          {selectedRank === 'VAGOS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-rose-900/10 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-tight text-white">Mapa de Vacâncias</h3>
                <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vacancyList.map((v, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                      <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{v.rank}</span>
                      <p className="text-3xl font-black text-white leading-none">{v.vacant}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedRank && selectedRank !== 'VAGOS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-cyan-900/10 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">{selectedRank}</h3>
                  <p className="text-cyan-600 text-[9px] font-bold uppercase tracking-widest">Oficiais um Posto Acima</p>
                </div>
                <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-0 overflow-x-auto">
                {selectedData?.surplusOfficers && selectedData.surplusOfficers.length > 0 ? (
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800">
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest w-12 text-center">Ord.</th>
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest w-16 text-center">Ant.</th>
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Oficial</th>
                        <th className="px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-widest">Lotação / Função</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {selectedData.surplusOfficers.map((off, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 text-slate-600 font-bold text-xs text-center">{idx + 1}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-cyan-500 font-black text-xs">{off.antiquity || '--'}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-100 text-xs uppercase">{off.name}</td>
                          <td className="px-6 py-4">
                            <p className="text-slate-400 text-[10px] font-medium leading-tight mb-1">{off.role}</p>
                            <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest">{off.sector}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-16 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">Sem Registros Disponíveis</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-8">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">Sincronizar Efetivo</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Cole os dados brutos do relatório nominal</p>
              
              <textarea 
                className="w-full h-72 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-500 focus:border-cyan-700 outline-none transition-all"
                placeholder="Cole o dump aqui..."
                value={pasteArea}
                onChange={(e) => setPasteArea(e.target.value)}
              />

              <div className="mt-6 flex gap-4">
                <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2 rounded-lg font-bold text-slate-500 uppercase text-[10px] hover:bg-slate-800 transition-colors">Cancelar</button>
                <button onClick={() => processDataString(pasteArea)} disabled={!pasteArea.trim()} className="flex-1 bg-cyan-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-600 disabled:opacity-50 transition-all">Processar Dados</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
