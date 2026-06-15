import {
  Users,
  CheckSquare,
  FileText,
  AlertTriangle,
  MessageCircle,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Bell,
  ArrowRight,
  Video,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  gradient,
}: {
  icon: any;
  label: string;
  value: string | number;
  change: string;
  changeType: 'up' | 'down';
  gradient: string;
}) => (
  <div className={`card card-hover relative overflow-hidden`}>
    <div className={`absolute inset-0 ${gradient} opacity-5`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-300">{label}</p>
        <p className="text-2xl font-bold text-neutral-500 mt-2">{value}</p>
        <div className={`flex items-center mt-2 text-xs ${changeType === 'up' ? 'text-medical-success' : 'text-medical-warning'}`}>
          {changeType === 'up' ? (
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
          )}
          <span>{change} 较昨日</span>
        </div>
      </div>
      <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center text-white`}>
        <Icon className="w-5.5 h-5.5" />
      </div>
    </div>
  </div>
);

const TodoItem = ({
  icon: Icon,
  label,
  count,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors group">
    <div className="flex items-center">
      <div className={`w-9 h-9 rounded-lg ${bgColor} ${color} flex items-center justify-center mr-3`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <span className="text-sm font-medium text-neutral-500">{label}</span>
    </div>
    <div className="flex items-center">
      <span className={`text-sm font-semibold ${count > 0 ? color : 'text-neutral-200'}`}>
        {count}项
      </span>
      <ArrowRight className="w-4 h-4 text-neutral-200 ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    patients,
    checkins,
    assessments,
    messages,
    appointments,
    notifications,
    trendData,
  } = useAppStore();

  const activePatients = patients.filter((p) => p.status === 'active').length;
  const todayCheckins = checkins.filter(
    (c) => c.date === new Date().toISOString().split('T')[0]
  ).length;
  const pendingCheckins = checkins.filter((c) => c.status === 'pending').length;
  const pendingAssessments = 5;
  const abnormalCount = checkins.filter((c) => c.abnormalFeedback && c.status === 'pending').length;
  const unreadMessages = messages.filter((m) => !m.isRead && m.sender === 'patient').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;

  const uncheckedPatients = patients.filter(
    (p) => !p.lastCheckinDate && p.status === 'active'
  ).slice(0, 5);

  const abnormalCheckins = checkins.filter((c) => c.abnormalFeedback).slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">工作台</h1>
        <p className="page-subtitle">欢迎回来，今日待处理事项如下</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="在管患者"
          value={activePatients}
          change="+2"
          changeType="up"
          gradient="bg-gradient-to-br from-primary-500 to-primary-700"
        />
        <StatCard
          icon={CheckSquare}
          label="今日打卡"
          value={todayCheckins}
          change="+5"
          changeType="up"
          gradient="bg-gradient-to-br from-medical-teal to-medical-tealLight"
        />
        <StatCard
          icon={FileText}
          label="待处理评估"
          value={pendingAssessments}
          change="-1"
          changeType="down"
          gradient="bg-gradient-to-br from-medical-warning to-orange-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="异常反馈"
          value={abnormalCount}
          change="+1"
          changeType="up"
          gradient="bg-gradient-to-br from-medical-danger to-red-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">今日待办</h2>
              <span className="text-xs text-neutral-300">
                共 {pendingCheckins + unreadMessages + pendingAssessments + pendingAppointments} 项
              </span>
            </div>
            <div className="space-y-1">
              <TodoItem
                icon={Video}
                label="待审核打卡"
                count={pendingCheckins}
                color="text-primary-500"
                bgColor="bg-primary-50"
              />
              <TodoItem
                icon={MessageCircle}
                label="待回复咨询"
                count={unreadMessages}
                color="text-medical-success"
                bgColor="bg-green-50"
              />
              <TodoItem
                icon={FileText}
                label="待确认评估"
                count={pendingAssessments}
                color="text-medical-warning"
                bgColor="bg-orange-50"
              />
              <TodoItem
                icon={CalendarCheck}
                label="待确认预约"
                count={pendingAppointments}
                color="text-medical-teal"
                bgColor="bg-teal-50"
              />
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">康复数据趋势</h2>
              <div className="flex space-x-1">
                <button className="px-3 py-1 text-xs rounded-md bg-primary-50 text-primary-500 font-medium">
                  近7天
                </button>
                <button className="px-3 py-1 text-xs rounded-md text-neutral-300 hover:bg-neutral-50 font-medium">
                  近30天
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData.slice(-7)}>
                  <defs>
                    <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165DFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#165DFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E7368" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0E7368" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="checkins"
                    name="打卡数"
                    stroke="#165DFF"
                    fill="url(#colorCheckins)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="assessments"
                    name="评估数"
                    stroke="#0E7368"
                    fill="url(#colorAssessments)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0 flex items-center">
                <Bell className="w-4 h-4 mr-2 text-medical-warning" />
                未打卡提醒
              </h2>
              <button className="text-xs text-primary-500 hover:text-primary-600">
                一键提醒
              </button>
            </div>
            <div className="space-y-3">
              {uncheckedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-50 cursor-pointer"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-medical-warning flex items-center justify-center text-white text-xs font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="ml-2.5">
                      <p className="text-sm font-medium text-neutral-500">{patient.name}</p>
                      <p className="text-xs text-neutral-300">{patient.diagnosis}</p>
                    </div>
                  </div>
                  <span className="tag tag-warning">连续{Math.floor(Math.random() * 4) + 1}天</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-medical-danger" />
                异常告警
              </h2>
              <button className="text-xs text-primary-500 hover:text-primary-600">
                查看全部
              </button>
            </div>
            <div className="space-y-3">
              {abnormalCheckins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-start p-3.5 rounded-xl bg-red-50/50 border border-red-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5 text-medical-danger" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-500">
                        {checkin.patientName}
                        <span className="text-xs text-neutral-300 ml-2">{checkin.date} {checkin.time}</span>
                      </p>
                      {checkin.painLevel !== undefined && checkin.painLevel >= 4 && (
                        <span className="tag tag-danger">疼痛 {checkin.painLevel} 分</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">{checkin.abnormalFeedback}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        className="btn-primary !py-1.5 !px-3 !text-xs"
                        onClick={() => navigate('/checkins')}
                      >
                        立即处理
                      </button>
                      <button className="btn-secondary !py-1.5 !px-3 !text-xs">
                        联系患者
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
