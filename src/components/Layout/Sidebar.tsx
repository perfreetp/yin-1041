import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CheckSquare,
  Stethoscope,
  MessageSquare,
  BarChart3,
  Heart,
} from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { path: '/patients', label: '患者档案', icon: Users },
  { path: '/prescriptions', label: '训练处方', icon: ClipboardList },
  { path: '/checkins', label: '打卡管理', icon: CheckSquare },
  { path: '/assessments', label: '评估中心', icon: Stethoscope },
  { path: '/communication', label: '沟通中心', icon: MessageSquare },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

const Sidebar = () => {
  const location = useLocation();
  const currentDoctor = useAppStore((state) => state.currentDoctor);

  return (
    <aside className="w-60 bg-gradient-to-b from-primary-700 to-primary-800 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-5 border-b border-primary-600/50">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mr-3">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-base leading-tight">康复云平台</h1>
          <p className="text-primary-200 text-xs">Rehabilitation Cloud</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-primary-100 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-medical-tealLight" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-600/50">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-medical-teal to-medical-tealLight flex items-center justify-center text-white font-semibold text-sm">
            {currentDoctor.name.charAt(0)}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentDoctor.name}</p>
            <p className="text-primary-200 text-xs truncate">{currentDoctor.title}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
