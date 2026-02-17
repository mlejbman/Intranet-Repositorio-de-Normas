
import React, { useEffect, useState } from 'react';
import { 
  FileCheck, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Search,
  Sparkles,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react';
import { Document, User, UserRole, DocArea } from '../types';
import { MOCK_DOCS } from '../constants';
import { summarizeDocument } from '../services/geminiService';
import { supabaseService } from '../services/supabase.ts';

interface DashboardProps {
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isPageLoading, setIsLoadingPage] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        let data = await supabaseService.getDocuments();
        if (!data || data.length === 0) {
          data = MOCK_DOCS as any;
        }

        if (currentUser.role === UserRole.USER) {
          data = data.filter(doc => 
            doc.area === DocArea.GENERAL || doc.area === currentUser.area
          );
        }

        setDocs(data);
      } catch (error) {
        console.error("Error loading dashboard documents:", error);
        let fallbackDocs = MOCK_DOCS as any;
        if (currentUser.role === UserRole.USER) {
          fallbackDocs = fallbackDocs.filter(doc => 
            doc.area === DocArea.GENERAL || doc.area === currentUser.area
          );
        }
        setDocs(fallbackDocs);
      } finally {
        setIsLoadingPage(false);
      }
    };
    loadData();
  }, [currentUser]);

  const handleSummarize = async (doc: Document) => {
    setIsLoadingSummary(true);
    const res = await summarizeDocument(doc.title, doc.description);
    setSummary(res || "Resumen no disponible.");
    setIsLoadingSummary(false);
  };

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando con Repositorio Central...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Buenas tardes, Colaborador</h1>
          <p className="text-gray-500 font-medium">Visualizando {docs.length} documentos oficiales vigentes.</p>
        </div>
        <div className="relative group w-full lg:w-96">
          <input 
            type="text" 
            placeholder="Buscar por norma, código o palabra clave..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none shadow-sm font-medium placeholder:text-gray-400"
          />
          <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Vigentes', val: docs.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50', icon: FileCheck },
          { label: 'Vencen pronto', val: Math.ceil(docs.length * 0.1).toString(), color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
          { label: 'Normas Totales', val: docs.length.toString(), color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
          { label: 'En Revisión', val: Math.floor(docs.length * 0.05).toString(), color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-default">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-800">Actualizaciones Críticas</h2>
            <button className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:text-blue-800 transition-colors">Ver repositorio completo</button>
          </div>
          <div className="grid gap-4">
            {filteredDocs.length > 0 ? (
              filteredDocs.map(doc => (
                <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all shadow-sm group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tighter bg-gray-100 text-gray-600 rounded-sm">
                          {doc.code} • v{doc.version}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-tighter">{doc.area}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">{doc.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1 leading-relaxed">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleSummarize(doc)}
                        disabled={isLoadingSummary}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                      >
                        {isLoadingSummary ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Resumen IA
                      </button>
                      <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 rounded-[32px] border border-dashed border-gray-200 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                  <Info size={32} />
                </div>
                <p className="font-bold text-gray-400">No se encontraron documentos que coincidan con su búsqueda.</p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">Limpiar búsqueda</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#003366] text-white p-6 rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden">
            <Sparkles className="absolute -bottom-4 -right-4 text-blue-400/20" size={100} />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-400/20 rounded-lg">
                  <Sparkles size={18} className="text-blue-300" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest">Asistente de Compliance</h2>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-h-[150px] flex items-center justify-center">
                {isLoadingSummary ? (
                   <div className="flex flex-col items-center gap-2 text-center p-4">
                      <Loader2 size={24} className="animate-spin text-blue-300" />
                      <span className="text-xs font-bold text-blue-200">Consultando normativas y regulaciones ARCA/Retail...</span>
                   </div>
                ) : (
                  <p className="text-sm font-medium leading-relaxed text-blue-50 italic text-center p-4">
                    {summary || "Selecciona una norma para obtener un resumen ejecutivo enfocado en cumplimiento operativo."}
                  </p>
                )}
              </div>
              {summary && !isLoadingSummary && (
                <button 
                  onClick={() => setSummary(null)}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors"
                >
                  Limpiar Consulta
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Nube de Normas</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(docs.flatMap(d => d.tags))).slice(0, 10).map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 cursor-pointer transition-all">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
