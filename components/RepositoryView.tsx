
import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Download, 
  Info, 
  Star,
  Loader2,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { Document, DocArea, User, UserRole } from '../types'; // Import User and UserRole
import { supabaseService } from '../services/supabase.ts';
import { MOCK_DOCS } from '../constants';

interface RepositoryViewProps {
  filterArea?: string;
  showOnlyFavorites?: boolean;
  currentUser: User; // Add currentUser prop
}

const RepositoryView: React.FC<RepositoryViewProps> = ({ filterArea, showOnlyFavorites, currentUser }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let data = await supabaseService.getDocuments();
        if (!data || data.length === 0) {
          data = MOCK_DOCS as any;
        }

        // --- FILTRADO DE VISIBILIDAD PARA ROLES 'USER' ---
        if (currentUser.role === UserRole.USER) {
          if (filterArea) {
            // Si hay un filterArea explícito, el USER solo ve documentos de ese área
            // PERO SOLO SI ese filterArea es GENERAL o su área asignada.
            data = data.filter(d => d.area === filterArea);
             if (filterArea !== DocArea.GENERAL && filterArea !== currentUser.area) {
                 data = [];
             }
          } else {
            // Si no hay filterArea explícito, el USER ve GENERAL y su área asignada.
            data = data.filter(d => d.area === DocArea.GENERAL || d.area === currentUser.area);
          }
        } else { // ADMIN or EDITOR roles
          if (filterArea) {
            data = data.filter(d => d.area === filterArea);
          }
        }
        // --- FIN FILTRADO ---

        // Note: showOnlyFavorites logic would go here if implemented (e.g., filtering `data` based on a user's favorites list)

        setDocs(data);
      } catch (error) {
        console.error("Error loading repository documents:", error);
        let fallbackDocs = MOCK_DOCS as any;
        
        // Apply fallback docs filtering if in demo mode or error
        if (currentUser.role === UserRole.USER) {
          if (filterArea) {
            fallbackDocs = fallbackDocs.filter(d => d.area === filterArea);
            if (filterArea !== DocArea.GENERAL && filterArea !== currentUser.area) {
                fallbackDocs = [];
            }
          } else {
            fallbackDocs = fallbackDocs.filter(d => 
              d.area === DocArea.GENERAL || d.area === currentUser.area
            );
          }
        } else {
          if (filterArea) {
            fallbackDocs = fallbackDocs.filter(d => d.area === filterArea);
          }
        }
        setDocs(fallbackDocs);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [filterArea, showOnlyFavorites, currentUser]); // currentUser como dependencia para re-fetch si cambia

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownload = (doc: Document) => {
    const url = doc.fileUrl || (doc as any).file_url;
    if (url) window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#003366] mb-4" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Cargando Normativas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-[#003366] rounded-lg">
              <BookOpen size={20} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {filterArea ? `Área: ${filterArea}` : showOnlyFavorites ? 'Mis Favoritos' : 'Repositorio Central'}
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 italic">
            Explora las directrices oficiales vigentes de la organización.
          </p>
        </div>

        <div className="relative group w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Filtrar documentos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#003366] transition-all outline-none font-medium text-sm"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#003366]" size={18} />
        </div>
      </header>

      {filteredDocs.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} />
          </div>
          <p className="font-bold text-gray-400">No se encontraron documentos en esta sección.</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mt-4 text-[#003366] text-xs font-black uppercase tracking-widest hover:underline">Limpiar búsqueda</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              className="bg-white p-6 rounded-[32px] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-[#003366] group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 bg-gray-900 text-white rounded-lg text-[9px] font-black tracking-widest uppercase">
                      {doc.code}
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-[#003366] rounded-lg text-[9px] font-black tracking-widest uppercase border border-blue-100">
                      v{doc.version}
                    </span>
                    {!filterArea && (
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black tracking-widest uppercase border border-amber-100">
                        {doc.area}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-[#003366] transition-colors leading-tight mb-1">{doc.title}</h3>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1 italic">{doc.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#D92121] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
                >
                  <Download size={16} />
                  Descargar
                </button>
                <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="p-3 text-gray-400 hover:text-[#003366] hover:bg-blue-50 rounded-2xl transition-all"
                >
                  <Info size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE (REUSADO DE ADMIN PANEL PERO PARA LECTURA) */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-[#003366] text-white relative">
              <button onClick={() => setSelectedDoc(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-400/20 text-blue-100 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                  REF: {selectedDoc.code}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                  VER: {selectedDoc.version}
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight pr-10">{selectedDoc.title}</h2>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <BookOpen size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Responsable</p>
                      <p className="text-sm font-bold text-gray-800">{selectedDoc.area}</p>
                   </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <Calendar size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Actualización</p>
                      <p className="text-sm font-bold text-gray-800">{new Date(selectedDoc.updatedAt).toLocaleDateString()}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <Info size={14} className="text-blue-600" />
                  Descripción del Alcance
                </h3>
                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-sm text-gray-600 leading-relaxed font-medium">
                  {selectedDoc.description || "Sin descripción disponible."}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex-[2] py-4 bg-[#D92121] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download size={18} />
                  Descargar Norma (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Close Icon for Modal
const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// Internal Calendar Icon
const Calendar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default RepositoryView;