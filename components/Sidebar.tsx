
import React from 'react';
import { 
  FileText, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  X,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Cpu,
  Calculator,
  Star,
  MapPin
} from 'lucide-react';
import { UserRole, DocArea, Area, User } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
  activeView: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  areas?: Area[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onNavigate, activeView, isOpen, onClose, onLogout, areas = [] }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, roles: [UserRole.USER, UserRole.EDITOR, UserRole.ADMIN] },
    { id: 'repository', label: 'Repositorio Central', icon: BookOpen, roles: [UserRole.USER, UserRole.EDITOR, UserRole.ADMIN] },
    { id: 'favorites', label: 'Mis Favoritos', icon: Star, roles: [UserRole.USER, UserRole.EDITOR, UserRole.ADMIN] },
  ];

  const adminItems = [
    { id: 'admin-docs', label: 'Gestión de Normas', icon: Settings, roles: [UserRole.EDITOR, UserRole.ADMIN] },
    { id: 'admin-users', label: 'Usuarios y Permisos', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'admin-areas', label: 'Gestión de Áreas', icon: MapPin, roles: [UserRole.ADMIN] },
    { id: 'admin-metrics', label: 'Métricas y Reportes', icon: FileText, roles: [UserRole.EDITOR, UserRole.ADMIN] },
  ];

  const areaIcons: Record<string, any> = {
    [DocArea.GENERAL]: ShieldCheck,
    [DocArea.FINANCE]: Calculator,
    [DocArea.COMMERCIAL]: Briefcase,
    [DocArea.OPERATIONS]: Settings,
    [DocArea.HR]: Users,
    [DocArea.IT]: Cpu,
  };

  return (
    <>
      {/* Sidebar Overlay (Mobile Only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#003366] text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="p-6 border-b border-blue-900/50 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">RETAIL HUB</h1>
              <p className="text-[10px] text-blue-300 mt-0.5 uppercase tracking-widest font-semibold">Repositorio Normativo</p>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-blue-800 rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {/* Navegación Principal */}
            <div>
              <p className="px-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Principal</p>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1.5 ${
                    activeView === item.id 
                    ? 'bg-blue-800 text-white shadow-inner border border-blue-700' 
                    : 'text-blue-100 hover:bg-blue-800/40 hover:translate-x-1'
                  }`}
                >
                  <item.icon size={18} className={activeView === item.id ? 'text-white' : 'text-blue-400'} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Administración */}
            {currentRole !== UserRole.USER && (
              <div>
                <p className="px-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Control y Gestión</p>
                {adminItems.filter(item => item.roles.includes(currentRole)).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1.5 ${
                      activeView === item.id 
                      ? 'bg-[#D92121] text-white shadow-lg border border-red-600' 
                      : 'text-blue-100 hover:bg-red-900/20 hover:text-red-100 hover:translate-x-1'
                    }`}
                  >
                    <item.icon size={18} className={activeView === item.id ? 'text-white' : 'text-red-400'} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Áreas */}
            <div>
              <p className="px-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Normativa por Área</p>
              <div className="space-y-1">
                {(areas.length > 0 ? areas.map(a => a.name) : Object.values(DocArea)).map(area => {
                  const Icon = areaIcons[area as DocArea] || FileText;
                  return (
                    <button
                      key={area}
                      onClick={() => { onNavigate(`area-${area}`); onClose(); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                        activeView === `area-${area}`
                        ? 'bg-blue-800/60 text-white border border-blue-700/50'
                        : 'text-blue-100 hover:bg-blue-800/40'
                      }`}
                    >
                      <Icon size={16} className={activeView === `area-${area}` ? 'text-white' : 'text-blue-400 group-hover:text-white transition-colors'} />
                      <span className="text-xs font-medium truncate">{area}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-blue-900/50 bg-[#002b55]">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors font-semibold text-sm group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
