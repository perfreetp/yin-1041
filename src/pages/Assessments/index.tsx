import { useState } from 'react';
import {
  Plus,
  Activity,
  FileText,
  User,
  Calendar,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Search,
  X,
  Save,
  Gauge,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import type { Assessment, AssessmentType } from '@/types';

const assessmentTypeInfo: Record<AssessmentType, { name: string; desc: string; icon: any; color: string }> = {
  fugl_meyer: {
    name: 'Fugl-Meyer运动功能评分',
    desc: '评估脑卒中患者运动功能、平衡、感觉等',
    icon: Activity,
    color: 'from-blue-400 to-blue-600',
  },
  berg: {
    name: 'Berg平衡量表',
    desc: '评估患者平衡功能，预测跌倒风险',
    icon: Gauge,
    color: 'from-green-400 to-green-600',
  },
  barthel: {
    name: 'Barthel指数',
    desc: '评估日常生活活动能力',
    icon: BarChart3,
    color: 'from-purple-400 to-purple-600',
  },
  rom: {
    name: '关节活动度评估',
    desc: '记录各关节主动/被动活动范围',
    icon: TrendingUp,
    color: 'from-orange-400 to-orange-600',
  },
  stage_summary: {
    name: '康复阶段总结',
    desc: '阶段性康复效果评估与总结',
    icon: FileText,
    color: 'from-teal-400 to-teal-600',
  },
};

const Assessments = () => {
  const { assessments, patients } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [newAssessmentType, setNewAssessmentType] = useState<AssessmentType>('fugl_meyer');
  const [newPatientId, setNewPatientId] = useState('');
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState('');

  const filteredAssessments = assessments.filter((a) => {
    const matchSearch = a.patientName.includes(searchQuery);
    const matchType = selectedType === 'all' || a.type === selectedType;
    return matchSearch && matchType;
  });

  const getAssessmentProgressData = () => {
    const patientAssessments = assessments
      .filter((a) => a.maxScore > 0)
      .slice(0, 10);
    return patientAssessments.map((a) => ({
      date: a.date.slice(5),
      [a.typeName]: Math.round((a.totalScore / a.maxScore) * 100),
    }));
  };

  const scaleItems = [
    { id: 'upper_limb', name: '上肢功能', maxScore: 36 },
    { id: 'lower_limb', name: '下肢功能', maxScore: 34 },
    { id: 'balance', name: '平衡功能', maxScore: 14 },
    { id: 'sensation', name: '感觉功能', maxScore: 24 },
    { id: 'joint_rom', name: '关节活动度', maxScore: 24 },
    { id: 'pain', name: '疼痛', maxScore: 8 },
  ];

  const romJoints = [
    { joint: '肩关节屈曲', side: '患侧', normal: '0-180°' },
    { joint: '肩关节外展', side: '患侧', normal: '0-180°' },
    { joint: '肘关节屈伸', side: '患侧', normal: '0-145°' },
    { joint: '髋关节屈曲', side: '患侧', normal: '0-120°' },
    { joint: '膝关节屈伸', side: '患侧', normal: '0-135°' },
    { joint: '踝关节背伸', side: '患侧', normal: '0-20°' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">评估中心</h1>
        <p className="page-subtitle">标准化康复量表评估与关节活动度记录</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              type="text"
              placeholder="搜索患者姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 h-9 pl-9 pr-4 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="all">全部评估类型</option>
            <option value="fugl_meyer">Fugl-Meyer评分</option>
            <option value="berg">Berg平衡量表</option>
            <option value="barthel">Barthel指数</option>
            <option value="rom">关节活动度</option>
            <option value="stage_summary">阶段总结</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5 inline" />
          发起评估
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(Object.entries(assessmentTypeInfo) as [AssessmentType, typeof assessmentTypeInfo[AssessmentType]][]).map(
          ([type, info]) => {
            const count = assessments.filter((a) => a.type === type).length;
            const Icon = info.icon;
            return (
              <div
                key={type}
                className="card card-hover cursor-pointer"
                onClick={() => setSelectedType(type)}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-neutral-500">{info.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-neutral-500">{count}</p>
                  <ChevronRight className="w-4 h-4 text-neutral-200" />
                </div>
              </div>
            );
          }
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredAssessments.map((assessment) => {
            const info = assessmentTypeInfo[assessment.type];
            const patient = patients.find((p) => p.id === assessment.patientId);
            return (
              <div
                key={assessment.id}
                className={`card p-4 cursor-pointer transition-all ${
                  selectedAssessment?.id === assessment.id
                    ? 'ring-2 ring-primary-500'
                    : 'hover:shadow-card-hover'
                }`}
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary-500">{info.name}</span>
                  <span className="text-xs text-neutral-300">{assessment.date}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {assessment.patientName.charAt(0)}
                  </div>
                  <div className="ml-2.5 flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-500 truncate">
                      {assessment.patientName}
                    </p>
                    <p className="text-xs text-neutral-300">{patient?.diagnosis}</p>
                  </div>
                </div>
                {assessment.maxScore > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-300">评估得分</span>
                      <span className="text-neutral-500 font-medium">
                        {assessment.totalScore}/{assessment.maxScore}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
                        style={{ width: `${(assessment.totalScore / assessment.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="col-span-2 space-y-4">
          {selectedAssessment ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-500">
                      {assessmentTypeInfo[selectedAssessment.type].name}
                    </h3>
                    <p className="text-sm text-neutral-300 mt-0.5">
                      {selectedAssessment.patientName} · {selectedAssessment.date}
                    </p>
                  </div>
                  {selectedAssessment.maxScore > 0 && (
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary-500">
                        {selectedAssessment.totalScore}
                        <span className="text-base text-neutral-300 font-normal ml-1">
                          /{selectedAssessment.maxScore}
                        </span>
                      </p>
                      <p className="text-xs text-medical-success mt-0.5">
                        恢复度 {Math.round((selectedAssessment.totalScore / selectedAssessment.maxScore) * 100)}%
                      </p>
                    </div>
                  )}
                </div>

                {Object.keys(selectedAssessment.scores).length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {Object.entries(selectedAssessment.scores).map(([key, value]) => (
                      <div key={key} className="bg-neutral-50 rounded-xl p-3">
                        <p className="text-xs text-neutral-300">{key}</p>
                        <p className="text-xl font-bold text-neutral-500 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAssessment.romData && selectedAssessment.romData.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-neutral-500 mb-3">关节活动度记录</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAssessment.romData.map((rom, i) => (
                        <div key={i} className="border border-neutral-100 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-neutral-500">{rom.joint}</p>
                            <span className="text-xs text-neutral-300">{rom.side}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-xs text-neutral-300">主动</p>
                              <p className="text-lg font-semibold text-primary-500">
                                {rom.activeRange}
                                <span className="text-xs text-neutral-300 ml-0.5">{rom.unit}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-300">被动</p>
                              <p className="text-lg font-semibold text-medical-teal">
                                {rom.passiveRange}
                                <span className="text-xs text-neutral-300 ml-0.5">{rom.unit}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-300">正常值</p>
                              <p className="text-lg font-semibold text-neutral-300">{rom.normalRange}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-primary-50 to-medical-teal/10 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-primary-600 mb-2">评估总结</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {selectedAssessment.summary}
                  </p>
                  <p className="text-xs text-neutral-300 mt-3">评估医生: {selectedAssessment.doctorName}</p>
                </div>
              </div>

              <div className="card">
                <h3 className="section-title">康复趋势</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getAssessmentProgressData()}>
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
                      <Line type="monotone" dataKey="Fugl-Meyer运动功能评分" stroke="#165DFF" strokeWidth={2.5} dot={{ fill: '#165DFF', r: 4 }} />
                      <Line type="monotone" dataKey="Berg平衡量表" stroke="#0E7368" strokeWidth={2.5} dot={{ fill: '#0E7368', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="card h-[500px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                <FileText className="w-10 h-10 text-neutral-200" />
              </div>
              <p className="text-base font-medium text-neutral-400 mt-4">选择一条评估记录</p>
              <p className="text-sm text-neutral-300 mt-1">点击左侧列表中的评估记录查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-500">发起评估</h2>
              <button
                className="p-1.5 hover:bg-neutral-100 rounded-lg"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">选择患者</label>
                  <select
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">请选择患者</option>
                    {patients
                      .filter((p) => p.status === 'active')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.diagnosis}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">评估类型</label>
                  <select
                    value={newAssessmentType}
                    onChange={(e) => setNewAssessmentType(e.target.value as AssessmentType)}
                    className="input-field"
                  >
                    {Object.entries(assessmentTypeInfo).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newAssessmentType === 'fugl_meyer' && (
                <div className="mb-6">
                  <h3 className="section-title">Fugl-Meyer 评分项</h3>
                  <div className="space-y-3">
                    {scaleItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">{item.name}</p>
                          <p className="text-xs text-neutral-300">满分 {item.maxScore} 分</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min={0}
                            max={item.maxScore}
                            value={assessmentScores[item.id] || 0}
                            onChange={(e) =>
                              setAssessmentScores({
                                ...assessmentScores,
                                [item.id]: parseInt(e.target.value),
                              })
                            }
                            className="w-40 mr-4 accent-primary-500"
                          />
                          <span className="text-lg font-bold text-primary-500 w-10 text-right">
                            {assessmentScores[item.id] || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newAssessmentType === 'rom' && (
                <div className="mb-6">
                  <h3 className="section-title">关节活动度记录</h3>
                  <div className="space-y-3">
                    {romJoints.map((joint, index) => (
                      <div key={index} className="p-3 bg-neutral-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-neutral-500">{joint.joint}</p>
                            <p className="text-xs text-neutral-300">{joint.side} · 正常值: {joint.normal}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center flex-1">
                            <label className="text-xs text-neutral-300 w-12">主动</label>
                            <input
                              type="number"
                              placeholder="0"
                              className="input-field !py-1.5 flex-1"
                            />
                            <span className="text-xs text-neutral-300 ml-1">°</span>
                          </div>
                          <div className="flex items-center flex-1">
                            <label className="text-xs text-neutral-300 w-12">被动</label>
                            <input
                              type="number"
                              placeholder="0"
                              className="input-field !py-1.5 flex-1"
                            />
                            <span className="text-xs text-neutral-300 ml-1">°</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(newAssessmentType === 'berg' || newAssessmentType === 'barthel') && (
                <div className="mb-6">
                  <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">
                      {assessmentTypeInfo[newAssessmentType].name}问卷将在正式环境中提供完整量表题目
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">评估总结</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="请输入评估总结和康复建议..."
                  className="input-field h-28 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-neutral-100">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={() => setShowCreateModal(false)}>
                <Save className="w-4 h-4 mr-1.5 inline" />
                保存评估
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;
