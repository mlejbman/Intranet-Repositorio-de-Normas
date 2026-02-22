
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { supabaseService } from '../services/supabase.ts';
import { MOCK_USERS, MOCK_DOCS, MOCK_AREAS, DEMO_USERS_KEY, DEMO_DOCS_KEY, DEMO_AREAS_KEY } from '../constants';
import { User, Document, UserRole, DocArea, Area } from '../types';

const COLORS = ['#003366', '#D92121', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6'];

const MetricsView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, d, a] = await Promise.all([
          supabaseService.getUsers(),
          supabaseService.getDocuments(),
          supabaseService.getAreas()
        ]);
        
        const hasRealUsers = u && u.length > 0;
        const hasRealDocs = d && d.length > 0;
        const hasRealAreas = a && a.length > 0;
        
        const isDemo = !hasRealDocs || !hasRealUsers;

        if (isDemo) {
          const storedUsers = localStorage.getItem(DEMO_USERS_KEY);
          const storedDocs = localStorage.getItem(DEMO_DOCS_KEY);
          const storedAreas = localStorage.getItem(DEMO_AREAS_KEY);
          
          setUsers(storedUsers ? JSON.parse(storedUsers) : MOCK_USERS);
          setDocs(storedDocs ? JSON.parse(storedDocs) : MOCK_DOCS as any);
          setAreas(storedAreas ? JSON.parse(storedAreas) : MOCK_AREAS);
        } else {
          setUsers(u);
          setDocs(d);
          setAreas(a);
        }
      } catch (error) {
        console.error("Error fetching metrics data:", error);
        setUsers(MOCK_USERS);
        setDocs(MOCK_DOCS as any);
        setAreas(MOCK_AREAS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Clock className="animate-spin text-blue-600 mr-2" />
        <span className="text-gray-500 font-medium">Cargando métricas...</span>
      </div>
    );
  }

  // Process data for charts
  const usersByRole = Object.values(UserRole).map(role => ({
    name: role,
    value: users.filter(u => u.role === role).length
  }));

  // Use dynamic areas if available, otherwise fallback to enum values
  const areaList = areas.length > 0 ? areas.map(a => a.name) : Object.values(DocArea);
  
  const docsByArea = areaList.map(areaName => ({
    name: areaName,
    count: docs.filter(d => d.area === areaName).length
  }));

  const docsByStatus = [
    { name: 'Publicados', value: docs.filter(d => d.status === 'published').length, color: '#10B981' },
    { name: 'Borradores', value: docs.filter(d => d.status === 'draft').length, color: '#F59E0B' },
    { name: 'Archivados', value: docs.filter(d => d.status === 'archived').length, color: '#6B7280' },
  ];

  // Simulated activity over time (last 6 months)
  const activityData = [
    { month: 'Ene', updates: 12, users: 4 },
    { month: 'Feb', updates: 19, users: 7 },
    { month: 'Mar', updates: 15, users: 5 },
    { month: 'Abr', updates: 22, users: 9 },
    { month: 'May', updates: 30, users: 12 },
    { month: 'Jun', updates: 25, users: 10 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Panel de Métricas</h1>
          <p className="text-gray-500 font-medium">Análisis de gobernanza, usuarios y repositorio normativo.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <TrendingUp className="text-blue-600" size={20} />
          <span className="text-blue-700 font-bold text-sm uppercase tracking-wider">Reporte en tiempo real</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Usuarios" 
          value={users.length} 
          icon={Users} 
          color="bg-blue-600" 
          trend="+12% este mes"
        />
        <StatCard 
          title="Normas Activas" 
          value={docs.filter(d => d.status === 'published').length} 
          icon={FileText} 
          color="bg-emerald-600" 
          trend="+5 nuevas"
        />
        <StatCard 
          title="Áreas Cubiertas" 
          value={new Set(docs.map(d => d.area)).size} 
          icon={ShieldCheck} 
          color="bg-amber-600" 
          trend="100% cumplimiento"
        />
        <StatCard 
          title="Revisiones Pendientes" 
          value={docs.filter(d => d.status === 'draft').length} 
          icon={AlertCircle} 
          color="bg-red-600" 
          trend="Acción requerida"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Documents by Area Chart */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Normativa por Área
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docsByArea} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#003366" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role Chart */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck size={20} className="text-red-600" />
            Distribución de Permisos
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Tendencia de Actualizaciones
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#9CA3AF' }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="updates" 
                  stroke="#003366" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#003366', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            Estado del Repositorio
          </h3>
          <div className="space-y-6">
            {docsByStatus.map((status) => (
              <div key={status.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">{status.name}</span>
                  <span className="text-xl font-black text-gray-900">{status.value}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(status.value / docs.length) * 100}%`,
                      backgroundColor: status.color
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-6 border-t border-gray-50 mt-4">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={18} />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  El 85% de las normas están vigentes. Se recomienda revisar los borradores pendientes de aprobación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-4">
      <div className={`${color} p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">
        {trend}
      </span>
    </div>
    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
    <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
  </div>
);

export default MetricsView;
