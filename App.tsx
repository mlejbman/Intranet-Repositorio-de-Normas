
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import RepositoryView from './components/RepositoryView';
import MetricsView from './components/MetricsView';
import { UserRole, User as UserType, DocArea, Area } from './types';
import { supabaseService } from './services/supabase.ts';
import { MOCK_USERS, MOCK_AREAS } from './constants';
import { 
  Menu, 
  Loader2, 
  Database, 
  RefreshCw, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  UserCircle,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const initApp = async () => {
    setIsInitializing(true);
    setConnectionError(null);
    try {
      const { success, error: connError } = await supabaseService.testConnection();
      console.log("[App] Supabase connection status:", success ? "Connected" : "Not Configured/Error", connError || "");
      
      if (!success) {
        if (connError === 'TABLES_MISSING') {
          setConnectionError("Conexión exitosa, pero no se encontraron las tablas. Por favor, ejecute el script SQL en Supabase.");
        } else if (connError === 'SUPABASE_NOT_CONFIGURED') {
          setConnectionError("Supabase no está configurado. Usando entorno de demostración.");
        } else {
          setConnectionError(`Error de conexión: ${connError || "Verifique las credenciales en .env"}`);
        }
      }

      const [users, fetchedAreas] = await Promise.all([
        supabaseService.getUsers(),
        supabaseService.getAreas()
      ]);
      
      const finalUsers = (users && users.length > 0) ? users : MOCK_USERS;
      setAllUsers(finalUsers);
      setIsDemoMode(!(users && users.length > 0));

      const sortAreas = (areasList: any[]) => {
        return [...areasList].sort((a, b) => {
          if (a.name === 'General') return -1;
          if (b.name === 'General') return 1;
          return a.name.localeCompare(b.name);
        });
      };

      if (!(users && users.length > 0)) {
        const storedAreas = localStorage.getItem('retail_hub_demo_areas');
        const initialAreas = storedAreas ? JSON.parse(storedAreas) : (fetchedAreas && fetchedAreas.length > 0) ? fetchedAreas : MOCK_AREAS;
        setAreas(sortAreas(initialAreas));
      } else {
        setAreas(sortAreas(fetchedAreas && fetchedAreas.length > 0 ? fetchedAreas : MOCK_AREAS));
      }

      const savedUserId = localStorage.getItem('retail_hub_user_id');
      if (savedUserId) {
        const found = finalUsers.find(u => u.id === savedUserId);
        if (found) setCurrentUser(found);
      }
    } catch (err: any) {
      console.warn("Error crítico en initApp, activando Modo Demo forzado:", err?.message || "Error desconocido");
      setAllUsers(MOCK_USERS);
      setIsDemoMode(true);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleSelectUser = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('retail_hub_user_id', user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('retail_hub_user_id');
    setActiveView('dashboard');
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={64} strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <p className="mt-8 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Verificando Credenciales...</p>
        
        <button 
          onClick={() => {
            setAllUsers(MOCK_USERS);
            setAreas(MOCK_AREAS);
            setIsDemoMode(true);
            setIsInitializing(false);
          }}
          className="mt-12 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
        >
          Omitir y usar Modo Demo
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-blue-50">
          <div className="bg-[#003366] p-12 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 rounded-full -ml-24 -mb-24"></div>
             
             <div>
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/20">
                 <ShieldCheck className="text-blue-300" />
               </div>
               <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight uppercase">Retail<br/>Argentina</h1>
               <p className="text-blue-200 text-lg font-medium leading-relaxed">
                 Acceso a la Intranet de Gobernanza y Repositorio de Normas.
               </p>
             </div>
             
             {isDemoMode && (
               <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl flex items-start gap-3 backdrop-blur-sm">
                 <Info className="text-amber-400 shrink-0" size={20} />
                 <div>
                    <p className="text-[11px] font-black text-amber-100 uppercase tracking-widest mb-1">Entorno de Demostración</p>
                    <p className="text-[11px] text-amber-200/80 leading-snug">
                      {connectionError || "No se detectaron usuarios en Supabase. Usando perfiles de auditoría local."}
                    </p>
                 </div>
               </div>
             )}

             <div className="mt-8">
               <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Seguridad Nivel 4</p>
               <div className="flex gap-1.5">
                 <div className="w-8 h-1 rounded-full bg-blue-400"></div>
                 <div className="w-2 h-1 rounded-full bg-blue-400/30"></div>
                 <div className="w-2 h-1 rounded-full bg-blue-400/30"></div>
               </div>
             </div>
          </div>

          <div className="p-10 flex flex-col justify-center bg-white">
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium italic">Selecciona tu perfil corporativo para continuar.</p>
            
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {allUsers.length > 0 ? allUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center justify-between p-5 rounded-3xl border-2 border-gray-50 hover:border-blue-500 hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-xl border-2 border-white/20 ${
                      user.role === UserRole.ADMIN ? 'bg-[#D92121]' : 
                      user.role === UserRole.EDITOR ? 'bg-amber-500' : 'bg-[#003366]'
                    }`}>
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-base leading-tight group-hover:text-blue-900">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg tracking-widest uppercase border ${
                          user.role === UserRole.ADMIN ? 'bg-red-50 text-red-600 border-red-100' :
                          user.role === UserRole.EDITOR ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">• {user.area}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              )) : (
                <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-sm font-bold text-gray-400">Error: No se pudieron cargar perfiles.</p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-2 text-gray-400">
                <Database size={14} />
                <p className="text-[9px] font-black uppercase tracking-widest">{isDemoMode ? 'Demostración Local' : 'Supabase Sincronizado'}</p>
               </div>
               <button 
                 onClick={initApp} 
                 className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest border border-gray-100"
               >
                  <RefreshCw size={12} />
                  Recargar
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeView === 'dashboard') return <Dashboard currentUser={currentUser} />;
    if (activeView === 'repository') return <RepositoryView currentUser={currentUser} />;
    if (activeView === 'favorites') return <RepositoryView showOnlyFavorites={true} currentUser={currentUser} />;
    
    if (activeView.startsWith('admin-')) {
      if (activeView === 'admin-metrics') return <MetricsView />;
      let tab: 'docs' | 'users' | 'areas' = 'docs';
      if (activeView === 'admin-users') tab = 'users';
      if (activeView === 'admin-areas') tab = 'areas';
      return <AdminPanel role={currentUser.role} activeTab={tab} onAreasChange={setAreas} />;
    }

    if (activeView.startsWith('area-')) {
      const area = activeView.replace('area-', '') as DocArea;
      return <RepositoryView filterArea={area} currentUser={currentUser} />;
    }

    return <Dashboard currentUser={currentUser} />;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        currentRole={currentUser.role} 
        onNavigate={setActiveView} 
        activeView={activeView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        areas={areas}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 lg:hidden">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"><Menu size={24} /></button>
             <span className="font-extrabold text-[#003366] text-lg tracking-tighter uppercase">Retail Hub</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight">Organización</span>
              <span className="text-sm font-black text-gray-800 tracking-tight">Retail Argentina S.A.</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${isDemoMode ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDemoMode ? 'bg-amber-500' : 'bg-green-500'}`}></div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isDemoMode ? 'text-amber-700' : 'text-green-700'}`}>
                {isDemoMode ? 'Auditoría' : 'En Línea'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#D92121] hover:bg-red-50 rounded-2xl transition-all text-[10px] font-black border border-gray-100 hover:border-red-100 uppercase tracking-widest"
            >
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Salir</span>
            </button>
            <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{currentUser.name}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">{currentUser.area}</span>
                   <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase border ${
                    currentUser.role === UserRole.ADMIN ? 'bg-red-50 text-red-600 border-red-100' :
                    currentUser.role === UserRole.EDITOR ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                   }`}>
                    {currentUser.role}
                   </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 shadow-sm border border-gray-200">
                <UserCircle size={26} />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-auto bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto w-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
