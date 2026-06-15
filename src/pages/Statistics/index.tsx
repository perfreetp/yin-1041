import { useState } from 'react';
import {
  Download,
  TrendingUp,
  Users,
  CheckCircle,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  FileDown,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useAppStore } from '@/store';

const Statistics = () => {
  const { patients, assessments, progressData, trendData, groups, checkins, currentDoctor } = useAppStore();
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  const activePatients = patients.filter((p) => p.status === 'active').length;
  const totalAssessments = assessments.length;
  const avgCheckinRate = 86.5;
  const avgRecoveryScore = 72;

  const diagnosisDistribution = [
    { name: '膝关节术后', value: 12, color: '#165DFF' },
    { name: '脑卒中', value: 8, color: '#0E7368' },
    { name: '肩袖损伤', value: 6, color: '#FF7D00' },
    { name: '脊柱康复', value: 10, color: '#722ED1' },
    { name: '其他', value: 5, color: '#86909C' },
  ];

  const stageDistribution = [
    { stage: '早期', count: 10 },
    { stage: '中期', count: 15 },
    { stage: '后期', count: 8 },
    { stage: '维持期', count: 4 },
  ];

  const radarData = [
    { subject: '上肢功能', A: 65, fullMark: 100 },
    { subject: '下肢功能', A: 78, fullMark: 100 },
    { subject: '平衡能力', A: 58, fullMark: 100 },
    { subject: '关节活动度', A: 72, fullMark: 100 },
    { subject: '日常生活', A: 68, fullMark: 100 },
    { subject: '疼痛控制', A: 85, fullMark: 100 },
  ];

  const recoveryByGroup = groups.map((g) => ({
    name: g.name.replace('组', ''),
    平均恢复度: 60 + Math.floor(Math.random() * 30),
    打卡完成率: 70 + Math.floor(Math.random() * 25),
  }));

  const weekCheckinData = [
    { day: '周一', 打卡数: 28, 异常数: 2 },
    { day: '周二', 打卡数: 32, 异常数: 1 },
    { day: '周三', 打卡数: 25, 异常数: 3 },
    { day: '周四', 打卡数: 30, 异常数: 2 },
    { day: '周五', 打卡数: 35, 异常数: 1 },
    { day: '周六', 打卡数: 22, 异常数: 4 },
    { day: '周日', 打卡数: 18, 异常数: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">数据统计</h1>
          <p className="page-subtitle">康复进度分析与效果评估数据</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-lg border border-neutral-200 p-0.5">
            {['7', '14', '30', '90'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-300 hover:text-neutral-500'
                }`}
              >
                近{range}天
              </button>
            ))}
          </div>
          <button className="btn-primary flex items-center">
            <FileDown className="w-4 h-4 mr-1.5" />
            导出康复报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: '在管患者',
            value: activePatients,
            change: '+3',
            changeType: 'up',
            icon: Users,
            gradient: 'from-primary-500 to-primary-700',
          },
          {
            label: '平均打卡率',
            value: `${avgCheckinRate}%`,
            change: '+2.5%',
            changeType: 'up',
            icon: CheckCircle,
            gradient: 'from-medical-teal to-medical-tealLight',
          },
          {
            label: '评估次数',
            value: totalAssessments,
            change: '+8',
            changeType: 'up',
            icon: FileText,
            gradient: 'from-medical-warning to-orange-500',
          },
          {
            label: '平均恢复度',
            value: `${avgRecoveryScore}%`,
            change: '+4.2%',
            changeType: 'up',
            icon: TrendingUp,
            gradient: 'from-purple-500 to-purple-700',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-300">{stat.label}</p>
                  <p className="text-3xl font-bold text-neutral-500 mt-2">{stat.value}</p>
                  <div className={`flex items-center mt-2 text-xs ${
                    stat.changeType === 'up' ? 'text-medical-success' : 'text-medical-danger'
                  }`}>
                    {stat.changeType === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    <span>{stat.change} 较上期</span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary-500" />
              康复进度趋势
            </h3>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="h-8 px-3 text-sm border border-neutral-200 rounded-lg focus:outline-none"
            >
              <option value="all">全部患者平均</option>
              {patients.slice(0, 5).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorFugl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#165DFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#165DFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7368" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0E7368" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBarthel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7D00" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF7D00" stopOpacity={0} />
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
                <Area type="monotone" dataKey="Fugl-Meyer" stroke="#165DFF" fill="url(#colorFugl)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="膝关节ROM" stroke="#0E7368" fill="url(#colorRom)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Barthel指数" stroke="#FF7D00" fill="url(#colorBarthel)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title flex items-center">
            <PieChart className="w-4 h-4 mr-2 text-primary-500" />
            诊断分布
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={diagnosisDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {diagnosisDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {diagnosisDistribution.map((item) => (
              <div key={item.name} className="flex items-center">
                <span
                  className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-neutral-400 truncate">{item.name}</span>
                <span className="text-xs font-medium text-neutral-500 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <h3 className="section-title flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-primary-500" />
            康复阶段分布
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" name="患者数" radius={[6, 6, 0, 0]}>
                  {stageDistribution.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === 0
                          ? '#165DFF'
                          : index === 1
                          ? '#0E7368'
                          : index === 2
                          ? '#FF7D00'
                          : '#722ED1'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title flex items-center">
            <Activity className="w-4 h-4 mr-2 text-primary-500" />
            综合能力雷达图
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E6EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#86909C' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#C9CDD4' }} axisLine={false} />
                <Radar
                  name="当前水平"
                  dataKey="A"
                  stroke="#165DFF"
                  fill="#165DFF"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-primary-500" />
            本周打卡情况
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekCheckinData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="打卡数" fill="#165DFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="异常数" fill="#F53F3F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title mb-0 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-primary-500" />
            分组康复效果对比
          </h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recoveryByGroup}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#86909C' }} axisLine={false} tickLine={false} />
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
              <Bar dataKey="平均恢复度" fill="#165DFF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="打卡完成率" fill="#0E7368" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title mb-0 flex items-center">
            <FileDown className="w-4 h-4 mr-2 text-primary-500" />
            康复报告导出
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: '患者个人康复报告',
              desc: '包含患者基本信息、评估记录、打卡情况、康复进度曲线等完整数据',
              icon: FileText,
              color: 'from-primary-500 to-primary-700',
              format: 'PDF',
            },
            {
              title: '科室康复统计月报',
              desc: '全科室患者康复数据汇总、分组对比、趋势分析、效果评估',
              icon: BarChart3,
              color: 'from-medical-teal to-medical-tealLight',
              format: 'PDF / Excel',
            },
            {
              title: '阶段康复总结报告',
              desc: '按康复阶段生成总结报告，包含阶段目标达成情况与下一步建议',
              icon: Calendar,
              color: 'from-purple-500 to-purple-700',
              format: 'PDF',
            },
          ].map((report, index) => {
            const Icon = report.icon;
            return (
              <div
                key={index}
                className="border border-neutral-100 rounded-xl p-5 hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-500">{report.title}</h4>
                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">{report.desc}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-50">
                  <span className="text-xs text-neutral-300">{report.format}</span>
                  <button className="flex items-center text-xs text-primary-500 font-medium group-hover:translate-x-0.5 transition-transform">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    生成报告
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
