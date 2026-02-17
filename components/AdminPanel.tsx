
import React, { useState, useEffect } from 'react';
import { 
  Plus, Eye, Edit3, Trash2, FileText, 
  CheckCircle2, Loader2, Info, Download, Mail, 
  UserPlus, UserCheck, UserCircle,
  ShieldCheck
} from 'lucide-react';
import { Document, User, UserRole, DocArea } from '../types';
import { supabaseService } from '../services/supabase.ts';
import { MOCK_DOCS, MOCK_USERS, DEMO_DOCS_KEY, DEMO_USERS_KEY } from '../constants';

interface AdminPanelProps {
  role: UserRole;
  activeTab: 'docs' | 'users';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ role, activeTab: initialTab }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados para el modal de confirmación de eliminación de usuario
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');

  // Estados para el modal de confirmación de eliminación de documento
  const [showDocDeleteConfirmModal, setShowDocDeleteConfirmModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [docConfirmMessage, setDocConfirmMessage] = useState('');


  const [formData, setFormData] = useState({
    title: '',
    code: '',
    version: '1.0',
    area: DocArea.GENERAL,
    description: '',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Valor por defecto
    status: 'published' as 'published' | 'draft' | 'archived'
  });

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: UserRole.USER,
    area: DocArea.GENERAL
  });

  const canManageUsers = role === UserRole.ADMIN;
  const canEditDocs = role === UserRole.ADMIN || role === UserRole.EDITOR;
  
  const [currentTab, setCurrentTab] = useState<'docs' | 'users'>(canManageUsers ? initialTab : 'docs');

  // Sincronizar el tab actual si cambia la prop inicialTab (desde el Sidebar)
  useEffect(() => {
    if (canManageUsers) {
      setCurrentTab(initialTab);
    }
  }, [initialTab, canManageUsers]);

  // Helper para validar si un ID es UUID (real de DB)
  const isRealUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const fetchData = async () => {
    setIsLoading(true);
    let currentIsDemoMode = false;
    try {
      const docsData = await supabaseService.getDocuments();
      const usersData = canManageUsers ? await supabaseService.getUsers() : [];
      
      const hasRealDocs = docsData && docsData.length > 0;
      const hasRealUsers = usersData && usersData.length > 0;
      
      currentIsDemoMode = !hasRealDocs || (canManageUsers && !hasRealUsers);

      if (currentIsDemoMode) {
        const storedDemoDocs = localStorage.getItem(DEMO_DOCS_KEY);
        const storedDemoUsers = localStorage.getItem(DEMO_USERS_KEY);

        if (storedDemoDocs) {
          setDocs(JSON.parse(storedDemoDocs));
        } else {
          setDocs(MOCK_DOCS as any);
        }

        if (canManageUsers) {
          if (storedDemoUsers) {
            setUsers(JSON.parse(storedDemoUsers));
          } else {
            setUsers(MOCK_USERS);
          }
        }
      } else {
        setDocs(docsData);
        if (canManageUsers) setUsers(usersData);
        localStorage.removeItem(DEMO_DOCS_KEY);
        localStorage.removeItem(DEMO_USERS_KEY);
      }

    } catch (error) {
      currentIsDemoMode = true;
      const storedDemoDocs = localStorage.getItem(DEMO_DOCS_KEY);
      const storedDemoUsers = localStorage.getItem(DEMO_USERS_KEY);

      if (storedDemoDocs) {
        setDocs(JSON.parse(storedDemoDocs));
      } else {
        setDocs(MOCK_DOCS as any);
      }
      
      if (canManageUsers) {
        if (storedDemoUsers) {
          setUsers(JSON.parse(storedDemoUsers));
        } else {
          setUsers(MOCK_USERS);
        }
      }
    } finally {
      setIsDemoMode(currentIsDemoMode);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_DOCS_KEY, JSON.stringify(docs));
    } else {
      localStorage.removeItem(DEMO_DOCS_KEY);
    }
  }, [docs, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    } else {
      localStorage.removeItem(DEMO_USERS_KEY);
    }
  }, [users, isDemoMode]);


  const handleOpenCreateDoc = () => {
    setEditingDocId(null);
    setFormData({
      title: '',
      code: '',
      version: '1.0',
      area: DocArea.GENERAL,
      description: '',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditDoc = (doc: Document) => {
    setEditingDocId(doc.id);
    setFormData({
      title: doc.title,
      code: doc.code,
      version: doc.version,
      area: doc.area,
      description: doc.description || '',
      file_url: doc.fileUrl || (doc as any).file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: doc.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteDoc = async (docId: string, docTitle: string) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    setDocToDelete(doc);
    setDocConfirmMessage(`¿Está seguro de que desea eliminar la norma: "${docTitle}"?\nEsta acción es definitiva.`);
    setShowDocDeleteConfirmModal(true);
  };

  const handleConfirmDeleteDoc = async () => {
    if (!docToDelete) return;

    setDocs(currentDocs => {
      return currentDocs.filter(d => d.id !== docToDelete.id);
    });
    
    if (!isDemoMode) {
      try {
        await supabaseService.deleteDocument(docToDelete.id);
      } catch (err) {
        console.error("Error eliminando en servidor:", err);
        alert("Hubo un error en el servidor.");
      }
    }

    setShowDocDeleteConfirmModal(false);
    setDocToDelete(null);
    setDocConfirmMessage('');
  };

  const handleCancelDeleteDoc = () => {
    setShowDocDeleteConfirmModal(false);
    setDocToDelete(null);
    setDocConfirmMessage('');
  };


  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, file_url: formData.file_url };
      
      if (!isDemoMode) {
        if (editingDocId && isRealUUID(editingDocId)) {
          await supabaseService.updateDocument(editingDocId, payload);
        } else if (!editingDocId) {
          await supabaseService.createDocument(payload);
        }
        fetchData();
      } else {
        if (editingDocId) {
          setDocs(prev => prev.map(d => d.id === editingDocId ? { ...d, ...payload, updatedAt: new Date().toISOString() } : d));
        } else {
          setDocs(prev => [{ 
            ...payload, 
            id: `demo-${Date.now()}`, 
            updatedAt: new Date().toISOString(), 
            tags: []
          } as any, ...prev]);
        }
      }
      
      setSuccessMsg("Operación exitosa.");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.error("[DocSubmit Error]:", err);
      alert(`Error al guardar documento: ${err.message || err.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      area: user.area
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
      alert("Acción cancelada: No se puede eliminar al último administrador del sistema.");
      return;
    }
    
    setUserToDelete(user);
    setConfirmModalMessage(`¿Está seguro de que desea eliminar el acceso de "${user.name}"? Esta acción es definitiva.`);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setUsers(currentUsers => {
      return currentUsers.filter(u => u.id !== userToDelete.id);
    });

    if (!isDemoMode) {
      try {
        await supabaseService.deleteProfile(userToDelete.id);
        alert(`Usuario "${userToDelete.name}" eliminado exitosamente de la base de datos.`);
      } catch (err: any) {
        console.error("[DeleteUser Error]:", err);
        alert(`Error en la comunicación con el servidor.`);
      }
    } else {
      alert(`Usuario "${userToDelete.name}" eliminado exitosamente del modo demo.`);
    }
    
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
  };

  const handleCancelDeleteUser = () => {
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...userFormData };
      
      if (!isDemoMode) {
        if (editingUserId && isRealUUID(editingUserId)) {
          await supabaseService.updateProfile(editingUserId, payload);
        } else if (!editingUserId) {
          await supabaseService.createProfile(payload);
        }
        await fetchData();
      } else {
        if (editingUserId) {
          setUsers(prev => prev.map(u => u.id === editingUserId ? { ...u, ...payload } : u));
        } else {
          setUsers(prev => [{ ...payload, id: `demo-${Date.now()}` } as any, ...prev]);
        }
      }
      setSuccessMsg("Usuario actualizado.");
      setTimeout(() => {
        setIsUserModalOpen(false);
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.error("[UserSubmit Error]:", err);
      alert(`Error en la gestión de perfiles.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (doc: Document) => {
    const url = doc.fileUrl || (doc as any).file_url;
    if (url) window.open(url, '_blank');
  };

  const activeTabName = canManageUsers ? currentTab : 'docs';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Cargando Panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">
              {activeTabName === 'docs' ? 'Consola Normativa' : 'Control de Acceso'}
            </h1>
            {isDemoMode && (
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-200">Audit Mode</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500">Administración de la infraestructura de gobernanza retail.</p>
        </div>
        
        <div className="flex gap-2">
          {activeTabName === 'docs' && canEditDocs && (
            <button onClick={handleOpenCreateDoc} className="flex items-center gap-2 bg-[#D92121] text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 transition-all shadow-lg active:scale-95">
              <Plus size={14} /> Nueva Norma
            </button>
          )}
          {activeTabName === 'users' && canManageUsers && (
            <button onClick={() => { setEditingUserId(null); setIsUserModalOpen(true); }} className="flex items-center gap-2 bg-[#003366] text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-800 transition-all shadow-lg active:scale-95">
              <UserPlus size={14} /> Alta Usuario
            </button>
          )}
        </div>
      </header>

      {/* NAVEGACIÓN TABS */}
      {canManageUsers && (
        <div className="flex bg-white rounded-t-[32px] border-b border-gray-100 px-6 shadow-sm overflow-hidden">
          <button 
            onClick={() => setCurrentTab('docs')} 
            className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest border-b-4 transition-all ${currentTab === 'docs' ? 'border-[#D92121] text-[#D92121]' : 'border-transparent text-gray-400'}`}
          >
            Repositorio
          </button>
          <button 
            onClick={() => setCurrentTab('users')} 
            className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest border-b-4 transition-all ${currentTab === 'users' ? 'border-[#003366] text-[#003366]' : 'border-transparent text-gray-400'}`}
          >
            Colaboradores
          </button>
        </div>
      )}

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Entidad</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Área Funcional</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Referencia</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTabName === 'docs' ? docs.map(doc => (
                <tr key={doc.id} className="hover:bg-blue-50/10 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition-all">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm leading-tight">{doc.title}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{doc.code} v{doc.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><span className="text-[9px] font-black text-gray-500 uppercase">{doc.area}</span></td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[8px] font-black uppercase border border-green-100">Vigente</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingDoc(doc)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Visualizar"><Eye size={18} /></button>
                      <button onClick={() => handleOpenEditDoc(doc)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteDoc(doc.id, doc.title)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 text-white rounded-lg flex items-center justify-center font-black text-xs ${user.role === UserRole.ADMIN ? 'bg-red-600' : 'bg-blue-800'}`}>
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm leading-tight">{user.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><span className="text-[9px] font-black text-gray-500 uppercase">{user.area}</span></td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${user.role === UserRole.ADMIN ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{user.role}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingUser(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ficha"><Eye size={18} /></button>
                      <button onClick={() => handleOpenEditUser(user)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteUser(user)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Baja"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(activeTabName === 'docs' ? docs : users).length === 0 && (
          <div className="p-20 text-center text-gray-400">
            <Info size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold uppercase text-[10px] tracking-widest">No hay registros vigentes en esta sección.</p>
          </div>
        )}
      </div>

      {/* MODAL: VISUALIZAR DOC */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-8 bg-[#003366] text-white">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">{viewingDoc.code}</span>
                <button onClick={() => setViewingDoc(null)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{viewingDoc.title}</h2>
            </div>
            <div className="p-8 space-y-6 text-gray-600">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Área Emisora</p>
                    <p className="font-bold text-gray-800">{viewingDoc.area}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Versión</p>
                    <p className="font-bold text-gray-800">{viewingDoc.version}</p>
                  </div>
               </div>
               <div className="italic p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm">
                 {viewingDoc.description || "Sin descripción de alcance registrada."}
               </div>
               <div className="flex gap-3">
                 <button onClick={() => setViewingDoc(null)} className="flex-1 py-4 text-gray-500 font-black uppercase text-[9px] hover:bg-gray-100 rounded-2xl">Cerrar</button>
                 <button onClick={() => handleDownload(viewingDoc)} className="flex-[2] py-4 bg-[#D92121] text-white font-black uppercase text-[9px] rounded-2xl shadow-lg active:scale-95 flex items-center justify-center gap-2">
                   <Download size={16} /> Descargar PDF
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR USUARIO */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden">
             <div className="p-10 bg-[#003366] text-white text-center relative">
               <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 transition-transform"><X size={24} /></button>
               <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                 <UserCircle size={48} className="text-blue-200" />
               </div>
               <h2 className="text-xl font-black">{viewingUser.name}</h2>
               <p className="text-blue-300 text-xs tracking-wide">{viewingUser.email}</p>
             </div>
             <div className="p-8 text-center space-y-6">
               <div className="flex divide-x divide-gray-100 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                 <div className="flex-1">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Nivel</p>
                   <p className="font-bold text-gray-800 text-xs">{viewingUser.role}</p>
                 </div>
                 <div className="flex-1">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Sede/Área</p>
                   <p className="font-bold text-gray-800 text-xs">{viewingUser.area}</p>
                 </div>
               </div>
               <button onClick={() => setViewingUser(null)} className="w-full py-4 bg-gray-900 text-white font-black uppercase text-[9px] rounded-2xl">Cerrar Perfil</button>
             </div>
          </div>
        </div>
      )}

      {/* MODALES DE EDICIÓN/ALTA */}
      {(isModalOpen || isUserModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
              <div className={`p-6 text-white flex items-center justify-between ${isModalOpen ? 'bg-[#D92121]' : 'bg-[#003366]'}`}>
                <h2 className="text-[10px] font-black uppercase tracking-widest">{isModalOpen ? 'Gestión de Norma' : 'Gestión de Identidad'}</h2>
                <button onClick={() => { setIsModalOpen(false); setIsUserModalOpen(false); }}><X size={20} /></button>
              </div>
              <div className="p-8">
                {successMsg ? (
                  <div className="py-10 text-center animate-in zoom-in duration-300">
                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                    <p className="font-black text-gray-900 tracking-tight">{successMsg}</p>
                  </div>
                ) : (
                  <form onSubmit={isModalOpen ? handleDocSubmit : handleUserSubmit} className="space-y-4">
                    {isModalOpen ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Título</label>
                          <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Código</label>
                            <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Versión</label>
                            <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Área Emisora</label>
                          <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value as DocArea})}>
                            {Object.values(DocArea).map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                          <textarea rows={3} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">URL del Archivo (PDF)</label>
                          <input 
                            required 
                            type="url"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" 
                            value={formData.file_url} 
                            onChange={e => setFormData({...formData, file_url: e.target.value})} 
                            placeholder="Ej: https://ejemplo.com/documento.pdf"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                          <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                          <input required type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Rol</label>
                            <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                              {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Sede</label>
                            <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" value={userFormData.area} onChange={e => setUserFormData({...userFormData, area: e.target.value as DocArea})}>
                              {Object.values(DocArea).map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                    <button disabled={isSubmitting} className="w-full py-4 bg-gray-900 text-white font-black uppercase text-[10px] rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-lg active:scale-95">
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Guardar Registro'}
                    </button>
                  </form>
                )}
              </div>
           </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL for User Deletion */}
      {showDeleteConfirmModal && userToDelete && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-message"
        >
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#D92121] text-white flex items-center justify-between">
              <h2 id="confirm-delete-title" className="text-[10px] font-black uppercase tracking-widest">Confirmar Eliminación</h2>
              <button onClick={handleCancelDeleteUser} className="hover:rotate-90 transition-transform" aria-label="Cerrar"><X size={20} /></button>
            </div>
            <div className="p-8 text-center space-y-6">
              <p id="confirm-delete-message" className="text-gray-700 text-sm font-medium leading-relaxed">
                {confirmModalMessage}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleCancelDeleteUser} 
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDeleteUser} 
                  className="flex-1 py-4 bg-[#D92121] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL for Document Deletion */}
      {showDocDeleteConfirmModal && docToDelete && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-doc-delete-title"
          aria-describedby="confirm-doc-delete-message"
        >
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#D92121] text-white flex items-center justify-between">
              <h2 id="confirm-doc-delete-title" className="text-[10px] font-black uppercase tracking-widest">Confirmar Eliminación de Norma</h2>
              <button onClick={handleCancelDeleteDoc} className="hover:rotate-90 transition-transform" aria-label="Cerrar"><X size={20} /></button>
            </div>
            <div className="p-8 text-center space-y-6">
              <p id="confirm-doc-delete-message" className="text-gray-700 text-sm font-medium leading-relaxed">
                {docConfirmMessage}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleCancelDeleteDoc} 
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDeleteDoc} 
                  className="flex-1 py-4 bg-[#D92121] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                >
                  Eliminar
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

export default AdminPanel;
