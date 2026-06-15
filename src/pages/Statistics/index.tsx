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
  X,
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
  const { patients, assessments, progressData, trendData, groups, checkins, appointments, prescriptions, currentDoctor } = useAppStore();
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'individual' | 'monthly' | 'stage'>('individual');
  const [exportPatientId, setExportPatientId] = useState('');
  const [exportMonth, setExportMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [exportStage, setExportStage] = useState('早期');
  const [exportPreviewMode, setExportPreviewMode] = useState(false);

  const filteredPatients = selectedPatient === 'all' ? patients.filter((p) => p.status === 'active') : patients.filter((p) => p.id === selectedPatient);
  const filteredCheckins = selectedPatient === 'all' ? checkins : checkins.filter((c) => c.patientId === selectedPatient);
  const filteredAssessments = selectedPatient === 'all' ? assessments : assessments.filter((a) => a.patientId === selectedPatient);
  const filteredPrescriptions = selectedPatient === 'all' ? prescriptions : prescriptions.filter((pr) => pr.patientId === selectedPatient);

  const activePatients = selectedPatient === 'all' ? patients.filter((p) => p.status === 'active').length : filteredPatients.length;
  const totalAssessments = filteredAssessments.length;
  const avgCheckinRate = filteredCheckins.length > 0 ? Math.round((filteredCheckins.filter((c) => c.status === 'approved').length / filteredCheckins.length) * 100) : 0;
  const avgRecoveryScore = filteredAssessments.filter((a) => a.maxScore > 0).length > 0
    ? Math.round(filteredAssessments.filter((a) => a.maxScore > 0).reduce((s, a) => s + (a.totalScore / a.maxScore) * 100, 0) / filteredAssessments.filter((a) => a.maxScore > 0).length)
    : 0;

  const assessmentTypeToCategory: Record<string, string> = {
    'Fugl-Meyer 评分': 'Fugl-Meyer',
    'Fugl-Meyer': 'Fugl-Meyer',
    '膝关节ROM': '膝关节ROM',
    '关节活动度评估': '膝关节ROM',
    'Barthel指数': 'Barthel指数',
    'Barthel 指数': 'Barthel指数',
  };

  const buildChartData = () => {
    if (selectedPatient !== 'all') {
      const validAssessments: { date: string; category: string; score: number }[] = [];

      filteredAssessments.forEach((a) => {
        const cat = assessmentTypeToCategory[a.typeName];
        if (cat && a.maxScore > 0) {
          validAssessments.push({
            date: a.date,
            category: cat,
            score: Math.round((a.totalScore / a.maxScore) * 100),
          });
        } else if (a.type === 'rom' && a.romData && a.romData.length > 0) {
          const avgRom = a.romData.reduce((sum, r) => {
            const normalMatch = r.normalRange.match(/\d+-\d+/);
            if (normalMatch) {
              const [_, maxStr] = normalMatch[0].split('-');
              const max = parseFloat(maxStr);
              if (max > 0) {
                return sum + Math.max(r.activeRange, r.passiveRange) / max * 100;
              }
            }
            return sum;
          }, 0) / a.romData.filter((r) => r.normalRange.includes('-')).length;
          if (!isNaN(avgRom) && avgRom > 0) {
            validAssessments.push({
              date: a.date,
              category: '膝关节ROM',
              score: Math.round(Math.min(avgRom, 100)),
            });
          }
        }
      });

      if (validAssessments.length === 0) {
        return { data: [], hasData: { fugl: false, rom: false, barthel: false } };
      }

      const dateMap: Record<string, Record<string, number>> = {};
      validAssessments.forEach((p) => {
        if (!dateMap[p.date]) dateMap[p.date] = {};
        dateMap[p.date][p.category] = p.score;
      });

      const dates = Object.keys(dateMap).sort();
      const data = dates.map((date) => ({
        date: date.slice(5),
        'Fugl-Meyer': dateMap[date]['Fugl-Meyer'] ?? null,
        '膝关节ROM': dateMap[date]['膝关节ROM'] ?? null,
        'Barthel指数': dateMap[date]['Barthel指数'] ?? null,
      }));

      const hasData = {
        fugl: data.some((d) => d['Fugl-Meyer'] !== null),
        rom: data.some((d) => d['膝关节ROM'] !== null),
        barthel: data.some((d) => d['Barthel指数'] !== null),
      };
      return { data, hasData };
    }

    const dateMap: Record<string, Record<string, number>> = {};
    progressData.forEach((point) => {
      if (!dateMap[point.date]) dateMap[point.date] = {};
      dateMap[point.date][point.category] = point.score;
    });

    const dates = Object.keys(dateMap).sort();
    const data = dates.map((date) => ({
      date,
      'Fugl-Meyer': dateMap[date]['Fugl-Meyer'] ?? null,
      '膝关节ROM': dateMap[date]['膝关节ROM'] ?? null,
      'Barthel指数': dateMap[date]['Barthel指数'] ?? null,
    }));

    return {
      data,
      hasData: {
        fugl: data.some((d) => d['Fugl-Meyer'] !== null),
        rom: data.some((d) => d['膝关节ROM'] !== null),
        barthel: data.some((d) => d['Barthel指数'] !== null),
      },
    };
  };

  const { data: chartData, hasData: chartHasData } = buildChartData();

  const weekCheckinData = selectedPatient === 'all'
    ? [
        { day: '周一', 打卡数: 28, 异常数: 2 },
        { day: '周二', 打卡数: 32, 异常数: 1 },
        { day: '周三', 打卡数: 25, 异常数: 3 },
        { day: '周四', 打卡数: 30, 异常数: 2 },
        { day: '周五', 打卡数: 35, 异常数: 1 },
        { day: '周六', 打卡数: 22, 异常数: 4 },
        { day: '周日', 打卡数: 18, 异常数: 2 },
      ]
    : (() => {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date();
        const weekdayOffset = (today.getDay() + 6) % 7;
        const weekDates = days.map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - weekdayOffset + i);
          return d.toISOString().split('T')[0];
        });
        return days.map((day, i) => ({
          day,
          打卡数: filteredCheckins.filter((c) => c.date === weekDates[i]).length,
          异常数: filteredCheckins.filter((c) => c.date === weekDates[i] && c.status !== 'approved').length,
        }));
      })();

  const getDaysSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const followupGroups = (() => {
    if (selectedPatient !== 'all') {
      const p = filteredPatients[0];
      if (!p) return { key: [], normal: [], review: [] };
      const lastCheckin = filteredCheckins.length > 0 ? filteredCheckins[0].date : p.joinDate;
      const lastAssessment = filteredAssessments.length > 0 ? filteredAssessments[0].date : p.joinDate;
      const daysSinceCheckin = getDaysSince(lastCheckin);
      const daysSinceAssessment = getDaysSince(lastAssessment);
      const isKey = p.riskLevel === 'high' || daysSinceCheckin > 3 || daysSinceAssessment > 14;
      const isReview = !isKey && daysSinceAssessment > 10;
      return {
        key: isKey ? [p] : [],
        normal: !isKey && !isReview ? [p] : [],
        review: isReview ? [p] : [],
      };
    }

    const keyPatients: typeof patients = [];
    const normalPatients: typeof patients = [];
    const reviewPatients: typeof patients = [];

    filteredPatients.forEach((p) => {
      const pCheckins = checkins.filter((c) => c.patientId === p.id);
      const pAssessments = assessments.filter((a) => a.patientId === p.id);
      const lastCheckin = pCheckins.length > 0 ? pCheckins[0].date : p.joinDate;
      const lastAssessment = pAssessments.length > 0 ? pAssessments[0].date : p.joinDate;
      const daysSinceCheckin = getDaysSince(lastCheckin);
      const daysSinceAssessment = getDaysSince(lastAssessment);

      if (p.riskLevel === 'high' || daysSinceCheckin > 3 || daysSinceAssessment > 14) {
        keyPatients.push(p);
      } else if (daysSinceAssessment > 10) {
        reviewPatients.push(p);
      } else {
        normalPatients.push(p);
      }
    });

    return {
      key: keyPatients,
      normal: normalPatients,
      review: reviewPatients,
    };
  })();

  const [expandedFollowup, setExpandedFollowup] = useState<string | null>(null);

  const diagnosisDistribution = selectedPatient === 'all'
    ? [
        { name: '膝关节术后', value: 12, color: '#165DFF' },
        { name: '脑卒中', value: 8, color: '#0E7368' },
        { name: '肩袖损伤', value: 6, color: '#FF7D00' },
        { name: '脊柱康复', value: 10, color: '#722ED1' },
        { name: '其他', value: 5, color: '#86909C' },
      ]
    : (() => {
        const patient = filteredPatients[0];
        return [{ name: patient?.diagnosis || '暂无诊断', value: 1, color: '#165DFF' }];
      })();

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

  const openExportModal = (type: 'individual' | 'monthly' | 'stage') => {
    setExportType(type);
    if (type === 'individual' && selectedPatient !== 'all') {
      setExportPatientId(selectedPatient);
    } else {
      setExportPatientId('');
    }
    setExportPreviewMode(false);
    setShowExportModal(true);
  };

  const generateReport = (type: 'individual' | 'monthly' | 'stage', options?: { patientId?: string; month?: string; stage?: string }) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const separator = '='.repeat(60);
    const divider = '-'.repeat(60);
    let content = '';
    let targetPatients: typeof patients = [];

    if (type === 'individual') {
      const patientId = options?.patientId;
      targetPatients = patientId ? patients.filter((p) => p.id === patientId) : patients.filter((p) => p.status === 'active');
      const targetPatient = targetPatients[0];
      const targetName = targetPatient ? targetPatient.name : '全部患者';

      content = `患者个人康复报告\n患者: ${targetName}\n生成时间: ${now}\n生成医生: ${currentDoctor.name}\n${separator}\n\n`;
      targetPatients.forEach((patient) => {
        content += `【患者基本信息】\n`;
        content += `  姓名: ${patient.name}\n`;
        content += `  年龄: ${patient.age}岁  性别: ${patient.gender}\n`;
        content += `  诊断: ${patient.diagnosis}\n`;
        content += `  风险等级: ${patient.riskLevel === 'low' ? '低' : patient.riskLevel === 'medium' ? '中' : '高'}\n`;
        content += `  康复阶段: ${patient.stage}\n`;
        content += `  连续打卡: ${patient.checkinStreak}天\n`;
        const pAssessments = assessments.filter((a) => a.patientId === patient.id);
        if (pAssessments.length > 0) {
          content += `\n  【评估记录】共${pAssessments.length}次\n`;
          pAssessments.forEach((a) => {
            content += `    ${a.date} ${a.typeName}: ${a.totalScore}/${a.maxScore}`;
            if (a.maxScore > 0) content += ` (${Math.round((a.totalScore / a.maxScore) * 100)}%)`;
            content += `\n`;
            if (a.summary) content += `      总结: ${a.summary}\n`;
          });
        }
        const pCheckins = checkins.filter((c) => c.patientId === patient.id);
        if (pCheckins.length > 0) {
          content += `\n  【打卡记录】共${pCheckins.length}次\n`;
          pCheckins.forEach((c) => {
            content += `    ${c.date} ${c.time} - ${c.status === 'approved' ? '已通过' : c.status === 'pending' ? '待审核' : '已驳回'}`;
            if (c.painLevel !== undefined) content += ` 疼痛:${c.painLevel}`;
            content += `\n`;
          });
        }
        const pPrescriptions = prescriptions.filter((pr) => pr.patientId === patient.id);
        if (pPrescriptions.length > 0) {
          content += `\n  【训练处方】共${pPrescriptions.length}条\n`;
          pPrescriptions.forEach((pr) => {
            content += `    ${pr.name} (${pr.startDate}~${pr.endDate}) 状态:${pr.status === 'active' ? '进行中' : pr.status === 'completed' ? '已完成' : '已暂停'}\n`;
          });
        }
        content += `\n${divider}\n\n`;
      });
    } else if (type === 'monthly') {
      const month = options?.month || exportMonth;
      const [year, m] = month.split('-');
      const monthStart = `${year}-${m}-01`;
      const nextMonth = parseInt(m) + 1;
      const nextMonthStr = String(nextMonth > 12 ? 1 : nextMonth).padStart(2, '0');
      const nextYear = nextMonth > 12 ? parseInt(year) + 1 : year;
      const monthEnd = `${nextYear}-${nextMonthStr}-01`;

      const monthPatients = patients.filter((p) => {
        const pCheckins = checkins.filter((c) => c.patientId === p.id && c.date >= monthStart && c.date < monthEnd);
        const pAssessments = assessments.filter((a) => a.patientId === p.id && a.date >= monthStart && a.date < monthEnd);
        return pCheckins.length > 0 || pAssessments.length > 0 || p.status === 'active';
      });
      const monthCheckins = checkins.filter((c) => c.date >= monthStart && c.date < monthEnd);
      const monthAssessments = assessments.filter((a) => a.date >= monthStart && a.date < monthEnd);
      const monthPrescriptions = prescriptions.filter((p) => p.startDate >= monthStart && p.startDate < monthEnd);
      const monthAppointments = appointments.filter((a) => a.date >= monthStart && a.date < monthEnd);

      content = `科室康复统计月报\n统计月份: ${year}年${parseInt(m)}月\n生成时间: ${now}\n科室: ${currentDoctor.department}\n${separator}\n\n`;
      content += `【总体概况】\n`;
      content += `  在管患者数: ${monthPatients.length}\n`;
      content += `  评估总次数: ${monthAssessments.length}\n`;
      content += `  打卡总次数: ${monthCheckins.length}\n`;
      content += `  处方总数: ${monthPrescriptions.length}\n`;
      content += `  预约总数: ${monthAppointments.length}\n\n`;
      content += `【分组统计】\n`;
      groups.forEach((g) => {
        const cnt = monthPatients.filter((p) => p.groupId === g.id).length;
        content += `  ${g.name}: ${cnt}人\n`;
      });
      content += `\n【诊断分布】\n`;
      const diagMap: Record<string, number> = {};
      monthPatients.forEach((p) => { diagMap[p.diagnosis] = (diagMap[p.diagnosis] || 0) + 1; });
      Object.entries(diagMap).forEach(([d, c]) => { content += `  ${d}: ${c}人\n`; });
      content += `\n【风险分级】\n`;
      content += `  低风险: ${monthPatients.filter((p) => p.riskLevel === 'low').length}人\n`;
      content += `  中风险: ${monthPatients.filter((p) => p.riskLevel === 'medium').length}人\n`;
      content += `  高风险: ${monthPatients.filter((p) => p.riskLevel === 'high').length}人\n\n`;
      content += `【预约统计】\n`;
      content += `  待确认: ${monthAppointments.filter((a) => a.status === 'pending').length}\n`;
      content += `  已确认: ${monthAppointments.filter((a) => a.status === 'confirmed').length}\n`;
      content += `  已完成: ${monthAppointments.filter((a) => a.status === 'completed').length}\n`;
      content += `  已取消: ${monthAppointments.filter((a) => a.status === 'cancelled').length}\n\n`;
      content += `【评估统计】\n`;
      const typeMap: Record<string, number> = {};
      monthAssessments.forEach((a) => { typeMap[a.typeName] = (typeMap[a.typeName] || 0) + 1; });
      Object.entries(typeMap).forEach(([t, c]) => { content += `  ${t}: ${c}次\n`; });
      if (monthAssessments.length > 0) {
        const scored = monthAssessments.filter((a) => a.maxScore > 0);
        if (scored.length > 0) {
          const avgRecovery = Math.round(scored.reduce((s, a) => s + (a.totalScore / a.maxScore) * 100, 0) / scored.length);
          content += `  平均恢复度: ${avgRecovery}%\n`;
        }
      }
    } else {
      const stage = options?.stage || exportStage;
      const sp = patients.filter((p) => p.stage === stage);

      content = `阶段康复总结报告\n康复阶段: ${stage}\n生成时间: ${now}\n生成医生: ${currentDoctor.name}\n${separator}\n\n`;
      content += `【${stage}康复阶段】\n`;
      content += `  患者数: ${sp.length}\n`;
      if (sp.length > 0) {
        content += `  患者: ${sp.map((p) => p.name).join('、')}\n`;
        const sa = assessments.filter((a) => sp.some((p) => p.id === a.patientId));
        if (sa.length > 0) {
          const scored = sa.filter((a) => a.maxScore > 0);
          if (scored.length > 0) {
            const avg = Math.round(scored.reduce((s, a) => s + (a.totalScore / a.maxScore) * 100, 0) / scored.length);
            content += `  平均恢复度: ${avg}%\n`;
          }
          content += `  评估次数: ${sa.length}\n`;
        }
        const sc = checkins.filter((c) => sp.some((p) => p.id === c.patientId));
        content += `  打卡次数: ${sc.length}\n`;
        const approved = sc.filter((c) => c.status === 'approved').length;
        if (sc.length > 0) content += `  审核通过率: ${Math.round((approved / sc.length) * 100)}%\n`;
        const highRisk = sp.filter((p) => p.riskLevel === 'high').length;
        if (highRisk > 0) content += `  高风险患者: ${highRisk}人\n`;
      }
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    let filename = '';
    if (type === 'individual') {
      const name = options?.patientId && targetPatients[0] ? targetPatients[0].name : '全部';
      filename = `患者个人康复报告_${name}.txt`;
    } else if (type === 'monthly') {
      const m = options?.month || exportMonth;
      filename = `科室康复统计月报_${m}.txt`;
    } else {
      const s = options?.stage || exportStage;
      filename = `阶段康复总结报告_${s}.txt`;
    }
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

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
          <button className="btn-primary flex items-center" onClick={() => openExportModal('monthly')}>
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
              {patients.filter((p) => p.status === 'active').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Activity className="w-10 h-10 text-neutral-200 mb-2" />
                <p className="text-sm text-neutral-300">暂无评估数据</p>
                <p className="text-xs text-neutral-200 mt-1">完成评估后可查看康复趋势</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                  {chartHasData.fugl && <Area type="monotone" dataKey="Fugl-Meyer" stroke="#165DFF" fill="url(#colorFugl)" strokeWidth={2.5} connectNulls />}
                  {chartHasData.rom && <Area type="monotone" dataKey="膝关节ROM" stroke="#0E7368" fill="url(#colorRom)" strokeWidth={2.5} connectNulls />}
                  {chartHasData.barthel && <Area type="monotone" dataKey="Barthel指数" stroke="#FF7D00" fill="url(#colorBarthel)" strokeWidth={2.5} connectNulls />}
                </AreaChart>
              </ResponsiveContainer>
            )}
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
            <Users className="w-4 h-4 mr-2 text-primary-500" />
            患者随访看板
          </h3>
          <p className="text-xs text-neutral-300">按风险、打卡、评估自动分类，重点关注需跟进患者</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              key: 'key',
              title: '重点跟进',
              desc: '高风险/未打卡>3天/超14天未评估',
              count: followupGroups.key.length,
              color: 'from-red-500 to-red-700',
              bg: 'bg-red-50',
              text: 'text-red-600',
              patients: followupGroups.key,
            },
            {
              key: 'normal',
              title: '正常康复',
              desc: '风险可控，打卡评估规律',
              count: followupGroups.normal.length,
              color: 'from-green-500 to-green-700',
              bg: 'bg-green-50',
              text: 'text-green-600',
              patients: followupGroups.normal,
            },
            {
              key: 'review',
              title: '待复评',
              desc: '超10天未评估，建议安排复评',
              count: followupGroups.review.length,
              color: 'from-orange-500 to-orange-700',
              bg: 'bg-orange-50',
              text: 'text-orange-600',
              patients: followupGroups.review,
            },
          ].map((group) => (
            <div key={group.key} className={`border border-neutral-100 rounded-xl overflow-hidden ${expandedFollowup === group.key ? 'ring-2 ring-primary-500' : ''}`}>
              <div
                className={`p-4 cursor-pointer transition-all hover:bg-neutral-50`}
                onClick={() => setExpandedFollowup(expandedFollowup === group.key ? null : group.key)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm font-semibold ${group.text}`}>{group.title}</h4>
                    <p className="text-xs text-neutral-300 mt-1">{group.desc}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center text-white text-lg font-bold`}>
                    {group.count}
                  </div>
                </div>
              </div>
              {expandedFollowup === group.key && group.patients.length > 0 && (
                <div className="border-t border-neutral-100 max-h-64 overflow-y-auto">
                  {group.patients.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-50 last:border-0">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                          {p.name.charAt(0)}
                        </div>
                        <div className="ml-2.5">
                          <p className="text-sm font-medium text-neutral-500">{p.name}</p>
                          <p className="text-xs text-neutral-300">{p.diagnosis} · {p.stage}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.riskLevel === 'high' ? 'bg-red-100 text-red-600' : p.riskLevel === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {p.riskLevel === 'high' ? '高风险' : p.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {expandedFollowup === group.key && group.patients.length === 0 && (
                <div className="border-t border-neutral-100 p-6 text-center">
                  <p className="text-sm text-neutral-300">暂无患者</p>
                </div>
              )}
            </div>
          ))}
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
              type: 'individual' as const,
            },
            {
              title: '科室康复统计月报',
              desc: '全科室患者康复数据汇总、分组对比、趋势分析、效果评估',
              icon: BarChart3,
              color: 'from-medical-teal to-medical-tealLight',
              format: 'PDF / Excel',
              type: 'monthly' as const,
            },
            {
              title: '阶段康复总结报告',
              desc: '按康复阶段生成总结报告，包含阶段目标达成情况与下一步建议',
              icon: Calendar,
              color: 'from-purple-500 to-purple-700',
              format: 'PDF',
              type: 'stage' as const,
            },
          ].map((report, index) => {
            const Icon = report.icon;
            return (
              <div
                key={index}
                className="border border-neutral-100 rounded-xl p-5 hover:shadow-card-hover transition-all cursor-pointer group"
                onClick={() => openExportModal(report.type)}
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

      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn">
          <div className={`bg-white rounded-2xl ${exportPreviewMode ? 'w-[720px]' : 'w-[480px]'} max-w-[90vw] max-h-[85vh] shadow-2xl flex flex-col animate-slideUp`}>
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-neutral-500">
                  {exportType === 'individual' ? '患者个人康复报告' : exportType === 'monthly' ? '科室康复统计月报' : '阶段康复总结报告'}
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {exportPreviewMode ? '预览报告内容，确认无误后下载' : '请选择报告参数'}
                </p>
              </div>
              <button className="p-1.5 hover:bg-neutral-100 rounded-lg" onClick={() => setShowExportModal(false)}>
                <X className="w-4 h-4 text-neutral-300" />
              </button>
            </div>

            {!exportPreviewMode ? (
              <>
                <div className="p-5 space-y-4 flex-shrink-0">
                  {exportType === 'individual' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-2">选择患者</label>
                      <select
                        value={exportPatientId}
                        onChange={(e) => setExportPatientId(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="">全部患者</option>
                        {patients.filter((p) => p.status === 'active').map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {exportType === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-2">选择月份</label>
                      <input
                        type="month"
                        value={exportMonth}
                        onChange={(e) => setExportMonth(e.target.value)}
                        className="input-field w-full"
                      />
                    </div>
                  )}
                  {exportType === 'stage' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-2">选择康复阶段</label>
                      <select
                        value={exportStage}
                        onChange={(e) => setExportStage(e.target.value)}
                        className="input-field w-full"
                      >
                        {['早期', '中期', '后期', '维持期'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-3 p-5 border-t border-neutral-100 flex-shrink-0">
                  <button className="btn-secondary" onClick={() => setShowExportModal(false)}>取消</button>
                  <button
                    className="btn-primary"
                    onClick={() => setExportPreviewMode(true)}
                  >
                    <FileText className="w-4 h-4 mr-1.5 inline" />
                    预览报告
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-500">
                          {exportType === 'individual' && (exportPatientId ? patients.find((p) => p.id === exportPatientId)?.name : '全部患者')}
                          {exportType === 'monthly' && `${exportMonth.split('-')[0]}年${parseInt(exportMonth.split('-')[1])}月`}
                          {exportType === 'stage' && `${exportStage}康复阶段`}
                        </h4>
                        <p className="text-xs text-neutral-300 mt-0.5">生成医生: {currentDoctor.name} · 康复科</p>
                      </div>
                      <span className="tag tag-success">已生成</span>
                    </div>
                  </div>

                  {exportType === 'individual' && (() => {
                    const p = exportPatientId ? patients.find((pt) => pt.id === exportPatientId) : null;
                    const targetPatients = p ? [p] : patients.filter((pt) => pt.status === 'active');
                    const targetAssessments = p ? assessments.filter((a) => a.patientId === p.id) : assessments;
                    const targetCheckins = p ? checkins.filter((c) => c.patientId === p.id) : checkins;
                    const targetPrescriptions = p ? prescriptions.filter((pr) => pr.patientId === p.id) : prescriptions;
                    const stageSummaries = targetAssessments.filter((a) => a.type === 'stage_summary');

                    return (
                      <div className="space-y-4">
                        <div className="border border-neutral-100 rounded-xl overflow-hidden">
                          <div className="bg-primary-50 px-4 py-2.5 border-b border-primary-100">
                            <h5 className="text-sm font-semibold text-primary-600">基本信息</h5>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-3">
                            {p ? (
                              <>
                                <div>
                                  <p className="text-xs text-neutral-300">姓名</p>
                                  <p className="text-sm text-neutral-500 mt-0.5">{p.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-300">诊断</p>
                                  <p className="text-sm text-neutral-500 mt-0.5">{p.diagnosis}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-300">康复阶段</p>
                                  <p className="text-sm text-neutral-500 mt-0.5">{p.stage}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-300">风险等级</p>
                                  <p className="text-sm text-neutral-500 mt-0.5">
                                    {p.riskLevel === 'high' ? '高风险' : p.riskLevel === 'medium' ? '中风险' : '低风险'}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <p className="text-xs text-neutral-300">在管患者</p>
                                  <p className="text-sm text-neutral-500 mt-0.5">{targetPatients.length} 人</p>
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-300">评估总数</p>
                                  <p className="text-sm text-neutral-500 mt-0.5">{targetAssessments.length} 次</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="border border-neutral-100 rounded-xl overflow-hidden">
                          <div className="bg-medical-teal/10 px-4 py-2.5 border-b border-medical-teal/20">
                            <h5 className="text-sm font-semibold text-medical-teal">评估记录 <span className="font-normal text-xs text-neutral-300 ml-2">共 {targetAssessments.length} 次</span></h5>
                          </div>
                          <div className="p-2 max-h-48 overflow-y-auto">
                            {targetAssessments.length > 0 ? targetAssessments.slice(0, 8).map((a) => (
                              <div key={a.id} className="flex items-center justify-between px-2 py-2 hover:bg-neutral-50 rounded-lg">
                                <div>
                                  <p className="text-sm text-neutral-500">{a.typeName}</p>
                                  <p className="text-xs text-neutral-300">{a.date}</p>
                                </div>
                                {a.maxScore > 0 && (
                                  <span className="text-sm font-medium text-primary-500">
                                    {a.totalScore}/{a.maxScore}
                                  </span>
                                )}
                              </div>
                            )) : (
                              <p className="text-sm text-neutral-300 text-center py-4">暂无评估记录</p>
                            )}
                          </div>
                        </div>

                        <div className="border border-neutral-100 rounded-xl overflow-hidden">
                          <div className="bg-green-50 px-4 py-2.5 border-b border-green-100">
                            <h5 className="text-sm font-semibold text-green-600">打卡记录 <span className="font-normal text-xs text-neutral-300 ml-2">共 {targetCheckins.length} 次</span></h5>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                                <p className="text-xs text-neutral-300">总打卡</p>
                                <p className="text-lg font-bold text-neutral-500 mt-0.5">{targetCheckins.length}</p>
                              </div>
                              <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                                <p className="text-xs text-neutral-300">已通过</p>
                                <p className="text-lg font-bold text-green-500 mt-0.5">{targetCheckins.filter((c) => c.status === 'approved').length}</p>
                              </div>
                              <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                                <p className="text-xs text-neutral-300">待审核</p>
                                <p className="text-lg font-bold text-orange-500 mt-0.5">{targetCheckins.filter((c) => c.status === 'pending').length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border border-neutral-100 rounded-xl overflow-hidden">
                          <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100">
                            <h5 className="text-sm font-semibold text-purple-600">训练处方 <span className="font-normal text-xs text-neutral-300 ml-2">共 {targetPrescriptions.length} 条</span></h5>
                          </div>
                          <div className="p-2">
                            {targetPrescriptions.length > 0 ? targetPrescriptions.map((pr) => (
                              <div key={pr.id} className="flex items-center justify-between px-2 py-2 hover:bg-neutral-50 rounded-lg">
                                <div>
                                  <p className="text-sm text-neutral-500">{pr.name}</p>
                                  <p className="text-xs text-neutral-300">{pr.startDate} ~ {pr.endDate}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  pr.status === 'active' ? 'bg-green-100 text-green-600' : pr.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {pr.status === 'active' ? '进行中' : pr.status === 'completed' ? '已完成' : '已暂停'}
                                </span>
                              </div>
                            )) : (
                              <p className="text-sm text-neutral-300 text-center py-4">暂无处方</p>
                            )}
                          </div>
                        </div>

                        {stageSummaries.length > 0 && (
                          <div className="border border-neutral-100 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-100">
                              <h5 className="text-sm font-semibold text-orange-600">阶段总结 <span className="font-normal text-xs text-neutral-300 ml-2">共 {stageSummaries.length} 份</span></h5>
                            </div>
                            <div className="p-3 space-y-2">
                              {stageSummaries.map((s) => (
                                <div key={s.id} className="bg-white border border-neutral-100 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-neutral-500">{s.date} · 阶段综合评分 {s.totalScore}/{s.maxScore}</p>
                                  </div>
                                  <p className="text-xs text-neutral-400 whitespace-pre-line leading-relaxed">{s.summary}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {exportType === 'monthly' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-primary-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-primary-400">在管患者</p>
                          <p className="text-2xl font-bold text-primary-600 mt-1">
                            {patients.filter((p) => p.status === 'active').length}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-green-500">评估次数</p>
                          <p className="text-2xl font-bold text-green-600 mt-1">{assessments.length}</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-orange-500">打卡总数</p>
                          <p className="text-2xl font-bold text-orange-600 mt-1">{checkins.length}</p>
                        </div>
                      </div>

                      <div className="border border-neutral-100 rounded-xl overflow-hidden">
                        <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                          <h5 className="text-sm font-semibold text-neutral-500">分组统计</h5>
                        </div>
                        <div className="p-3 space-y-1.5">
                          {groups.map((g) => {
                            const cnt = patients.filter((p) => p.groupId === g.id).length;
                            return (
                              <div key={g.id} className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">{g.name}</span>
                                <span className="font-medium text-neutral-500">{cnt} 人</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border border-neutral-100 rounded-xl overflow-hidden">
                        <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                          <h5 className="text-sm font-semibold text-neutral-500">风险分级</h5>
                        </div>
                        <div className="p-3 flex items-center justify-around">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-500">{patients.filter((p) => p.riskLevel === 'low').length}</p>
                            <p className="text-xs text-neutral-300">低风险</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-orange-500">{patients.filter((p) => p.riskLevel === 'medium').length}</p>
                            <p className="text-xs text-neutral-300">中风险</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-500">{patients.filter((p) => p.riskLevel === 'high').length}</p>
                            <p className="text-xs text-neutral-300">高风险</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {exportType === 'stage' && (() => {
                    const sp = patients.filter((p) => p.stage === exportStage);
                    const sa = assessments.filter((a) => sp.some((p) => p.id === a.patientId));
                    const sc = checkins.filter((c) => sp.some((p) => p.id === c.patientId));
                    const stageSummaries = sa.filter((a) => a.type === 'stage_summary');

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-primary-50 rounded-xl p-4 text-center">
                            <p className="text-xs text-primary-400">患者数</p>
                            <p className="text-2xl font-bold text-primary-600 mt-1">{sp.length}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-xs text-green-500">评估次数</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{sa.length}</p>
                          </div>
                          <div className="bg-orange-50 rounded-xl p-4 text-center">
                            <p className="text-xs text-orange-500">打卡次数</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{sc.length}</p>
                          </div>
                        </div>

                        <div className="border border-neutral-100 rounded-xl overflow-hidden">
                          <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                            <h5 className="text-sm font-semibold text-neutral-500">阶段患者名单</h5>
                          </div>
                          <div className="p-2 max-h-40 overflow-y-auto">
                            {sp.length > 0 ? sp.map((patient) => (
                              <div key={patient.id} className="flex items-center justify-between px-2 py-2 hover:bg-neutral-50 rounded-lg">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs">
                                    {patient.name.charAt(0)}
                                  </div>
                                  <span className="ml-2 text-sm text-neutral-500">{patient.name}</span>
                                </div>
                                <span className="text-xs text-neutral-300">{patient.diagnosis}</span>
                              </div>
                            )) : (
                              <p className="text-sm text-neutral-300 text-center py-4">暂无患者</p>
                            )}
                          </div>
                        </div>

                        {stageSummaries.length > 0 && (
                          <div className="border border-neutral-100 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-100">
                              <h5 className="text-sm font-semibold text-orange-600">阶段总结记录</h5>
                            </div>
                            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                              {stageSummaries.map((s) => {
                                const patient = patients.find((p) => p.id === s.patientId);
                                return (
                                  <div key={s.id} className="bg-white border border-neutral-100 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-medium text-neutral-500">
                                        {patient?.name || ''} · {s.date}
                                      </p>
                                      <span className="text-xs text-orange-600 font-medium">{s.totalScore}/{s.maxScore}分</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 whitespace-pre-line leading-relaxed">{s.summary}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center justify-between p-5 border-t border-neutral-100 flex-shrink-0">
                  <button className="btn-secondary" onClick={() => setExportPreviewMode(false)}>
                    ← 返回修改
                  </button>
                  <div className="flex items-center space-x-3">
                    <button className="btn-secondary" onClick={() => setShowExportModal(false)}>关闭</button>
                    <button
                      className="btn-primary"
                      onClick={() => generateReport(exportType, {
                        patientId: exportPatientId || undefined,
                        month: exportMonth,
                        stage: exportStage,
                      })}
                    >
                      <Download className="w-4 h-4 mr-1.5 inline" />
                      下载报告
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
