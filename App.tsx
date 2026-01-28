
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { OfficerData, RankPost, OfficerDetail, AntiquityRecord } from './types';
import { INITIAL_DATA, TC_QOEM_ANTIQUITY, MAJ_QOEM_ANTIQUITY, MAJ_QOE_ANTIQUITY, CAP_QOEM_ANTIQUITY, CAP_QOE_ANTIQUITY, TEN_QOEM_ANTIQUITY, TEN_QOE_ANTIQUITY, TEN2_QOE_ANTIQUITY, ASP_ANTIQUITY } from './constants';
import DashboardCards from './components/DashboardCards';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ANTIGUIDADE'>('DASHBOARD');
  const [antiquityType, setAntiquityType] = useState<'TC' | 'MAJ' | 'MAJ_QOE' | 'CAP' | 'CAP_QOE' | 'TEN' | 'TEN_QOE' | 'TEN2_QOE' | 'ASP'>('TC');
  const [antiquitySearch, setAntiquitySearch] = useState('');
  
  const [data, setData] = useState<OfficerData[]>(() => {
    try {
      const saved = localStorage.getItem('pmal_v9_stable');
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
    localStorage.setItem('pmal_v9_stable', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (selectedRank && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedRank]);

  const getAvatarUrl = (name: string) => {
    const formattedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${formattedName}&background=0891b2&color=fff&bold=true&format=svg`;
  };

  const cleanOfficerName = (rawName: string): string => {
    if (!rawName) return "";
    return rawName
      .replace(/^(TC|MAJ|CAP|TEN|CEL|ASP|1º TEN|2º TEN|1 TEN|2 TEN|TC QOE|MAJ QOE|CAP QOE|2 TEN QOE|1 TEN QOE|Asp\. Of\. PM|MAT\.\s*\d+)\s+/gi, "")
      .replace(/ - \d+$/, "")
      .replace(/MAT\.\s*\d+/, "")
      .replace(/^\d+\s+/, "")
      .trim();
  };

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
            const rawName = (parts[nameIdx] || "").trim();
            const name = cleanOfficerName(rawName);

            officerLists[currentCategory].push({
              name,
              role: parts[roleIdx] || "N/A",
              sector: parts[sectorIdx] || "N/A",
              antiquity: hasAnt ? parts[1] : undefined,
              imageUrl: getAvatarUrl(name)
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
      alert('Erro no processamento dos dados.');
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

  const currentAntiquityList = useMemo(() => {
    let list: AntiquityRecord[] = [];
    switch(antiquityType) {
      case 'MAJ': list = MAJ_QOEM_ANTIQUITY; break;
      case 'MAJ_QOE': list = MAJ_QOE_ANTIQUITY; break;
      case 'CAP': list = CAP_QOEM_ANTIQUITY; break;
      case 'CAP_QOE': list = CAP_QOE_ANTIQUITY; break;
      case 'TEN': list = TEN_QOEM_ANTIQUITY; break;
      case 'TEN_QOE': list = TEN_QOE_ANTIQUITY; break;
      case 'TEN2_QOE': list = TEN2_QOE_ANTIQUITY; break;
      case 'ASP': list = ASP_ANTIQUITY; break;
      default: list = TC_QOEM_ANTIQUITY;
    }
    return list.map(item => {
      const cleanedName = cleanOfficerName(item.name);
      return { 
        ...item, 
        name: cleanedName,
        imageUrl: item.imageUrl || getAvatarUrl(cleanedName) 
      };
    });
  }, [antiquityType]);

  const filteredAntiquity = useMemo(() => {
    if (!antiquitySearch) return currentAntiquityList;
    const term = antiquitySearch.toLowerCase();
    return currentAntiquityList.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.omp.toLowerCase().includes(term) ||
      (item.antiquity && item.antiquity.includes(term))
    );
  }, [antiquitySearch, currentAntiquityList]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center z-0">
        <img 
          src="https://raw.githubusercontent.com/ai-gen-images/pmal/main/brasao_subcomando.png" 
          alt="Watermark Brasão" 
          className="w-[800px] h-auto grayscale brightness-200"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>

      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-cyan-500/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800">
                <img 
                  src="https://raw.githubusercontent.com/ai-gen-images/pmal/main/brasao_subcomando.png" 
                  alt="Brasão Subcomando" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase italic leading-none flex items-center gap-3">
                PMAL <span className="text-cyan-500 text-[10px] not-italic font-black border-l border-slate-700 pl-3 uppercase tracking-[0.3em]">ESTRATÉGICO</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                Subcomando Geral
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-cyan-900/30 hover:border-cyan-500/50 shadow-lg"
            >
              Importar Efetivo
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 flex gap-10">
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'DASHBOARD' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Painel de Controle
            </button>
            <button 
              onClick={() => setActiveTab('ANTIGUIDADE')}
              className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'ANTIGUIDADE' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Antiguidade de Oficiais
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative z-10">
        {activeTab === 'DASHBOARD' ? (
          <>
            <DashboardCards data={data} onSelectRank={setSelectedRank} selectedRank={selectedRank} />
            
            <div ref={detailRef} className="scroll-mt-36">
              {selectedRank === 'VAGOS' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-rose-900/10 px-8 py-5 flex justify-between items-center border-b border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Mapa de Vacâncias Operacionais</h3>
                    <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                      Fechar
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {vacancyList.map((v, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center group hover:border-rose-900/50 transition-all">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-rose-500 transition-colors">{v.rank}</span>
                          <p className="text-4xl font-black text-white leading-none tracking-tighter">{v.vacant}</p>
                          <span className="text-[9px] font-bold text-slate-700 uppercase mt-2">Cargos em Aberto</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedRank && selectedRank !== 'VAGOS' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-cyan-900/10 px-8 py-5 flex justify-between items-center border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white italic">{selectedRank}</h3>
                      <p className="text-cyan-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Efetivo Excedente Reconhecido</p>
                    </div>
                    <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                      Fechar
                    </button>
                  </div>

                  <div className="p-0 overflow-x-auto">
                    {selectedData?.surplusOfficers && selectedData.surplusOfficers.length > 0 ? (
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-800/20 border-b border-slate-800">
                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest w-16 text-center">QTD</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest w-24 text-center">ANTIG.</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Identificação do Militar</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Designação e Unidade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {selectedData.surplusOfficers.map((off, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="px-8 py-4 text-center">
                                <span className="text-slate-600 font-black text-[11px] italic">{idx + 1}</span>
                              </td>
                              <td className="px-8 py-4 text-center">
                                <span className="inline-flex items-center justify-center bg-slate-950 border-2 border-cyan-900/50 text-cyan-500 w-11 h-11 rounded-xl text-xs font-black shadow-xl group-hover:border-cyan-500 transition-all italic">
                                  {off.antiquity || '--'}
                                </span>
                              </td>
                              <td className="px-8 py-4">
                                <p className="font-black text-slate-100 text-xs uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                                  {off.name}
                                </p>
                              </td>
                              <td className="px-8 py-4">
                                <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-1 uppercase italic">{off.role}</p>
                                <span className="bg-slate-950 text-slate-500 text-[9px] font-black px-2 py-1 rounded border border-slate-800 uppercase tracking-[0.2em]">{off.sector}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-1 bg-slate-800 rounded-full animate-pulse mb-2"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-700 italic">Quadro Sem Registros Ativos</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {['TC', 'MAJ', 'MAJ_QOE', 'CAP', 'CAP_QOE', 'TEN', 'TEN_QOE', 'TEN2_QOE', 'ASP'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setAntiquityType(type as any)} 
                  className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${antiquityType === type ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_30px_rgba(8,145,178,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-700'}`}
                >
                  {type === 'TEN2_QOE' ? '2 TEN QOE' : type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="bg-cyan-900/10 px-8 py-8 border-b border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">
                    ANTIGUIDADE DE {antiquityType === 'TEN2_QOE' ? '2 TEN QOE' : antiquityType.replace('_', ' ')}
                  </h3>
                  <p className="text-cyan-600 text-[11px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-cyan-800"></span>
                    PMAL - Subcomando Geral
                  </p>
                </div>
                <div className="relative w-full lg:w-[450px]">
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome, Unidade ou Antiguidade..."
                    value={antiquitySearch}
                    onChange={(e) => setAntiquitySearch(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-xs text-cyan-500 focus:border-cyan-700 outline-none placeholder:text-slate-800 transition-all font-bold tracking-wide shadow-inner"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-800/30 border-b border-slate-800">
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] w-32 text-center">Antiguidade</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Nome Completo</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Unidade (OPM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredAntiquity.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-all group">
                        <td className="px-8 py-5 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-950 border-2 border-cyan-900/50 text-cyan-500 w-12 h-12 rounded-2xl text-sm font-black shadow-xl group-hover:border-cyan-500 transition-all italic">
                            {rec.antiquity || '--'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-100 text-sm uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                            {rec.name}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="bg-slate-950 text-slate-400 font-black text-[10px] px-3 py-1.5 rounded-lg border border-slate-800 uppercase tracking-[0.25em]">{rec.omp}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-2 border-slate-800">
            <div className="p-10">
              <div className="flex justify-center mb-8">
                <img 
                  src="https://raw.githubusercontent.com/ai-gen-images/pmal/main/brasao_subcomando.png" 
                  className="w-20 h-20 grayscale opacity-30" 
                  alt="Modal Brasão" 
                />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 text-center">Processamento de Efetivo Estratégico</h2>
              <textarea 
                className="w-full h-80 bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-xs font-mono text-cyan-500 focus:border-cyan-700 outline-none transition-all placeholder:text-slate-900 shadow-inner"
                placeholder="Cole o corpo do texto do boletim ou lista de antiguidade aqui para análise e indexação automática..."
                value={pasteArea}
                onChange={(e) => setPasteArea(e.target.value)}
              />
              <div className="mt-10 flex gap-6">
                <button onClick={() => setIsImportModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-slate-600 uppercase text-[11px] hover:text-slate-300 transition-colors tracking-widest italic">Descartar</button>
                <button onClick={() => processDataString(pasteArea)} disabled={!pasteArea.trim()} className="flex-1 bg-cyan-700 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-cyan-600 disabled:opacity-20 transition-all shadow-[0_10px_30px_rgba(8,145,178,0.2)]">Iniciar Indexação de Dados</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-slate-900/50 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center opacity-30 gap-4">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">PMAL - SUBCMDO GERAL © 2025</p>
          <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">Inteligência Estratégica Aplicada</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
