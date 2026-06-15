import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Calendar,
  AlertCircle,
  Shield,
  Users,
  ChevronLeft,
  FileText,
  Activity,
  CheckSquare,
  ClipboardList,
  UserCheck,
  Key,
  Download,
  Edit,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Patient, RiskLevel, PatientStage, PatientStatus } from '@/types';

const riskLevelMap: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: '低风险', className: 'tag-success' },
  medium: { label: '中风险', className: 'tag-warning' },
  high: { label: '高风险', className: 'tag-danger' },
};

const statusMap: Record<PatientStatus, { label: string; className: string }> = {
  active: { label: '康复中', className: 'tag-success' },
  paused: { label: '暂停', className: 'tag-warning' },
  discharged: { label: '已出院', className: 'tag-neutral' },
};

const stageColorMap: Record<PatientStage, string> = {
  '早期': 'bg-blue-100 text-blue-600',
  '中期': 'bg-purple-100 text-purple-600',
  '后期': 'bg-green-100 text-green-600',
  '维持期': 'bg-gray-100 text-gray-600',
};

const PatientList = () => {
  const navigate = useNavigate();
  const { patients, groups } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  const filteredPatients = patients.filter((p) => {
    const matchSearch =
      p.name.includes(searchQuery) || p.diagnosis.includes(searchQuery);
    const matchGroup = selectedGroup === 'all' || p.groupId === selectedGroup;
    const matchRisk = selectedRisk === 'all' || p.riskLevel === selectedRisk;
    return matchSearch && matchGroup && matchRisk;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">患者档案</h1>
        <p className="page-subtitle">管理和查看所有康复患者信息</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="搜索患者姓名、诊断..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-50"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-9 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="all">全部分组</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="h-9 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="all">全部风险</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
          </select>
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-1.5" />
            更多筛选
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary">
            <Users className="w-4 h-4 mr-1.5 inline" />
            分组管理
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-1.5 inline" />
            添加患者
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-sm text-neutral-400">
          <Users className="w-4 h-4 mr-1.5" />
          共 <span className="text-neutral-500 font-medium mx-1">{filteredPatients.length}</span> 位患者
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">患者信息</th>
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">诊断</th>
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">分组/阶段</th>
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">风险等级</th>
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">打卡情况</th>
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">状态</th>
              <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">入组日期</th>
              <th className="text-center text-xs font-medium text-neutral-300 px-5 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr
                key={patient.id}
                className={`border-b border-neutral-50 hover:bg-primary-50/30 cursor-pointer transition-colors ${
                  index === filteredPatients.length - 1 ? 'border-b-0' : ''
                }`}
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-500">
                        {patient.name}
                        <span className="text-neutral-300 ml-2 text-xs">
                          {patient.gender} · {patient.age}岁
                        </span>
                      </p>
                      <p className="text-xs text-neutral-300 flex items-center mt-0.5">
                        <Phone className="w-3 h-3 mr-1" />
                        {patient.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-neutral-500">{patient.diagnosis}</p>
                  {patient.surgeryDate && (
                    <p className="text-xs text-neutral-300 mt-0.5">
                      手术日期: {patient.surgeryDate}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm text-neutral-500">
                      {groups.find((g) => g.id === patient.groupId)?.name}
                    </p>
                    <span className={`tag text-xs mt-1 ${stageColorMap[patient.stage]}`}>
                      {patient.stage}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`tag ${riskLevelMap[patient.riskLevel].className}`}>
                    {riskLevelMap[patient.riskLevel].label}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-medical-success mr-1.5" />
                    <span className="text-sm text-neutral-500">
                      连续 {patient.checkinStreak} 天
                    </span>
                  </div>
                  {!patient.lastCheckinDate && patient.status === 'active' && (
                    <p className="text-xs text-medical-warning mt-0.5 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      今日未打卡
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`tag ${statusMap[patient.status].className}`}>
                    {statusMap[patient.status].label}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-neutral-500">{patient.joinDate}</p>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4 text-neutral-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, groups, prescriptions, checkins, assessments } = useAppStore();
  const [activeTab, setActiveTab] = useState<'info' | 'prescription' | 'checkins' | 'assessments' | 'family'>('info');

  const patient = patients.find((p) => p.id === id);
  if (!patient) {
    return <div>患者不存在</div>;
  }

  const patientPrescriptions = prescriptions.filter((p) => p.patientId === id);
  const patientCheckins = checkins.filter((c) => c.patientId === id);
  const patientAssessments = assessments.filter((a) => a.patientId === id);
  const group = groups.find((g) => g.id === patient.groupId);

  const tabs = [
    { key: 'info', label: '基本信息', icon: FileText },
    { key: 'prescription', label: '训练处方', icon: ClipboardList },
    { key: 'checkins', label: '打卡记录', icon: CheckSquare },
    { key: 'assessments', label: '评估记录', icon: Activity },
    { key: 'family', label: '家属授权', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          className="p-2 hover:bg-white rounded-lg mr-3 transition-colors"
          onClick={() => navigate('/patients')}
        >
          <ChevronLeft className="w-5 h-5 text-neutral-400" />
        </button>
        <div>
          <h1 className="page-title mb-0">{patient.name}</h1>
          <p className="text-sm text-neutral-300">
            {patient.gender} · {patient.age}岁 · {patient.diagnosis}
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <span className={`tag ${riskLevelMap[patient.riskLevel].className}`}>
            {riskLevelMap[patient.riskLevel].label}
          </span>
          <span className={`tag ${stageColorMap[patient.stage]}`}>{patient.stage}</span>
          <span className={`tag ${statusMap[patient.status].className}`}>
            {statusMap[patient.status].label}
          </span>
          <button className="btn-primary ml-2">
            <Edit className="w-4 h-4 mr-1.5 inline" />
            编辑档案
          </button>
        </div>
      </div>

      <div className="card p-0">
        <div className="border-b border-neutral-100 px-5 pt-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-neutral-300 hover:text-neutral-500'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="section-title">基本信息</h3>
                <div className="space-y-3">
                  {[
                    { label: '姓名', value: patient.name },
                    { label: '性别', value: patient.gender },
                    { label: '年龄', value: `${patient.age}岁` },
                    { label: '联系电话', value: patient.phone },
                    { label: '入组日期', value: patient.joinDate },
                  ].map((item) => (
                    <div key={item.label} className="flex">
                      <span className="text-sm text-neutral-300 w-24">{item.label}</span>
                      <span className="text-sm text-neutral-500">{item.value}</span>
                    </div>
                  ))}
                </div>

                <h3 className="section-title mt-6">病史信息</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-sm text-neutral-300 w-24">主要诊断</span>
                    <span className="text-sm text-neutral-500">{patient.diagnosis}</span>
                  </div>
                  {patient.surgeryDate && (
                    <div className="flex">
                      <span className="text-sm text-neutral-300 w-24">手术日期</span>
                      <span className="text-sm text-neutral-500">{patient.surgeryDate}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="text-sm text-neutral-300 w-24">既往病史</span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.medicalHistory.map((h) => (
                        <span key={h} className="tag tag-neutral">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="section-title">康复概况</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">所属分组</p>
                    <p className="text-sm font-medium text-primary-600 mt-1">{group?.name}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">连续打卡</p>
                    <p className="text-sm font-medium text-medical-success mt-1">{patient.checkinStreak} 天</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">在管处方</p>
                    <p className="text-sm font-medium text-medical-warning mt-1">{patientPrescriptions.filter(p => p.status === 'active').length} 个</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">评估次数</p>
                    <p className="text-sm font-medium text-purple-600 mt-1">{patientAssessments.length} 次</p>
                  </div>
                </div>

                <h3 className="section-title mt-6">最近打卡</h3>
                <div className="space-y-2">
                  {patientCheckins.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="text-sm text-neutral-500">{c.date} {c.time}</p>
                        <p className="text-xs text-neutral-300 mt-0.5">
                          完成 {c.exercisesCompleted.filter(e => e.completed).length}/{c.exercisesCompleted.length} 个动作
                        </p>
                      </div>
                      <span className={`tag ${c.status === 'approved' ? 'tag-success' : c.status === 'pending' ? 'tag-warning' : 'tag-danger'}`}>
                        {c.status === 'approved' ? '已通过' : c.status === 'pending' ? '待审核' : '已驳回'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prescription' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-300">共 {patientPrescriptions.length} 个处方</p>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-1.5 inline" />
                  新建处方
                </button>
              </div>
              {patientPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-neutral-100 rounded-xl p-4 hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-500">{prescription.name}</h4>
                      <p className="text-xs text-neutral-300 mt-1">
                        创建于 {prescription.createdAt} · {prescription.doctorName}
                      </p>
                    </div>
                    <span className={`tag ${prescription.status === 'active' ? 'tag-success' : 'tag-neutral'}`}>
                      {prescription.status === 'active' ? '进行中' : prescription.status === 'completed' ? '已完成' : '已暂停'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prescription.exercises.map((e) => (
                      <span key={e.exerciseId} className="tag tag-info">
                        {e.exerciseName} · {e.sets}组{e.reps}次
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-50 flex items-center text-xs text-neutral-300">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {prescription.startDate} 至 {prescription.endDate} · {prescription.frequency}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'checkins' && (
            <div className="space-y-3">
              {patientCheckins.map((checkin) => (
                <div key={checkin.id} className="border border-neutral-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                        <CheckSquare className="w-4.5 h-4.5 text-primary-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-500">
                          {checkin.date} {checkin.time}
                        </p>
                        <p className="text-xs text-neutral-300">
                          疼痛评分: {checkin.painLevel ?? '未记录'} 分
                        </p>
                      </div>
                    </div>
                    <span className={`tag ${checkin.status === 'approved' ? 'tag-success' : checkin.status === 'pending' ? 'tag-warning' : 'tag-danger'}`}>
                      {checkin.status === 'approved' ? '已通过' : checkin.status === 'pending' ? '待审核' : '已驳回'}
                    </span>
                  </div>
                  {checkin.abnormalFeedback && (
                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-medical-danger font-medium">异常反馈</p>
                      <p className="text-sm text-neutral-500 mt-1">{checkin.abnormalFeedback}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {checkin.exercisesCompleted.map((e) => (
                      <div key={e.exerciseId} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">{e.exerciseName}</span>
                        <div className="flex items-center space-x-3">
                          {e.quality && (
                            <span className="text-xs text-neutral-300">质量: {e.quality}/5</span>
                          )}
                          <span className={e.completed ? 'text-medical-success' : 'text-medical-danger'}>
                            {e.completed ? '✓ 已完成' : '✗ 未完成'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {checkin.doctorFeedback && (
                    <div className="mt-3 pt-3 border-t border-neutral-50">
                      <p className="text-xs text-primary-500 font-medium">医生反馈</p>
                      <p className="text-sm text-neutral-500 mt-1">{checkin.doctorFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button className="btn-primary">
                  <UserCheck className="w-4 h-4 mr-1.5 inline" />
                  发起评估
                </button>
              </div>
              {patientAssessments.map((assessment) => (
                <div key={assessment.id} className="border border-neutral-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-500">{assessment.typeName}</h4>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        {assessment.date} · {assessment.doctorName}
                      </p>
                    </div>
                    {assessment.maxScore > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-500">
                          {assessment.totalScore}
                          <span className="text-sm text-neutral-300 font-normal">/{assessment.maxScore}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  {assessment.romData && assessment.romData.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {assessment.romData.map((rom, i) => (
                        <div key={i} className="bg-neutral-50 rounded-lg p-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-neutral-300">{rom.joint} ({rom.side})</p>
                            <p className="text-xs text-neutral-300">正常值: {rom.normalRange}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-1.5">
                            <div>
                              <p className="text-xs text-neutral-300">主动</p>
                              <p className="text-sm font-semibold text-primary-500">
                                {rom.activeRange}{rom.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-300">被动</p>
                              <p className="text-sm font-semibold text-medical-teal">
                                {rom.passiveRange}{rom.unit}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-primary-50/50 rounded-lg p-3">
                    <p className="text-xs text-primary-500 font-medium">评估总结</p>
                    <p className="text-sm text-neutral-500 mt-1">{assessment.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-300">已授权家属可查看患者康复进度</p>
                <button className="btn-primary">
                  <Shield className="w-4 h-4 mr-1.5 inline" />
                  添加家属授权
                </button>
              </div>
              {patient.familyMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-neutral-200 mx-auto" />
                  <p className="text-sm text-neutral-300 mt-3">暂无家属授权</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.familyMembers.map((fm) => (
                    <div key={fm.id} className="flex items-center justify-between border border-neutral-100 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium">
                          {fm.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-500">
                            {fm.name}
                            <span className="text-neutral-300 ml-2 text-xs">{fm.relation}</span>
                          </p>
                          <p className="text-xs text-neutral-300 mt-0.5">{fm.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-neutral-50 rounded-lg px-3 py-1.5 flex items-center">
                          <Key className="w-3.5 h-3.5 text-neutral-300 mr-1.5" />
                          <span className="text-sm font-mono text-neutral-500">{fm.authCode}</span>
                        </div>
                        <span className={`tag ${fm.isActive ? 'tag-success' : 'tag-neutral'}`}>
                          {fm.isActive ? '已启用' : '已停用'}
                        </span>
                        <button className="btn-secondary !py-1.5 !px-3 !text-xs">
                          <Download className="w-3.5 h-3.5 mr-1 inline" />
                          下载授权函
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Patients = () => {
  const { id } = useParams<{ id: string }>();
  return id ? <PatientDetail /> : <PatientList />;
};

export default Patients;
