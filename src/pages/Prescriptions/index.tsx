import { useState } from 'react';
import {
  Plus,
  Search,
  Play,
  Clock,
  Target,
  ChevronRight,
  X,
  User,
  Calendar,
  FileText,
  Save,
  AlertCircle,
  Info,
  Upload,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Exercise, Difficulty, PrescriptionExercise } from '@/types';

const difficultyMap: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: '简单', className: 'tag-success' },
  medium: { label: '中等', className: 'tag-warning' },
  hard: { label: '困难', className: 'tag-danger' },
};

const ExerciseCard = ({
  exercise,
  selected,
  onSelect,
}: {
  exercise: Exercise;
  selected: boolean;
  onSelect: () => void;
}) => (
  <div
    className={`card p-0 overflow-hidden cursor-pointer transition-all ${
      selected
        ? 'ring-2 ring-primary-500 shadow-card-hover'
        : 'hover:shadow-card-hover'
    }`}
    onClick={onSelect}
  >
    <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 relative flex items-center justify-center">
      <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur flex items-center justify-center">
        <Play className="w-7 h-7 text-primary-600 ml-1" fill="currentColor" />
      </div>
      <span className={`absolute top-3 right-3 tag ${difficultyMap[exercise.difficulty].className}`}>
        {difficultyMap[exercise.difficulty].label}
      </span>
    </div>
    <div className="p-4">
      <h4 className="text-sm font-semibold text-neutral-500">{exercise.name}</h4>
      <p className="text-xs text-neutral-300 mt-1 line-clamp-2">{exercise.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-neutral-300">
        <span className="flex items-center">
          <Target className="w-3.5 h-3.5 mr-1" />
          {exercise.targetArea}
        </span>
        <span className="flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {exercise.duration}
        </span>
      </div>
    </div>
  </div>
);

const Prescriptions = () => {
  const { exercises, prescriptions, patients, addPrescription, addExercise } = useAppStore();
  const [activeTab, setActiveTab] = useState<'library' | 'prescriptions'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<PrescriptionExercise[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [prescriptionName, setPrescriptionName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('每日2次，早晚各一次');
  const [painSurveyEnabled, setPainSurveyEnabled] = useState(true);
  const [painSurveyType, setPainSurveyType] = useState<'NRS' | 'VAS'>('NRS');
  const [targetAreaFilter, setTargetAreaFilter] = useState('all');

  const [exName, setExName] = useState('');
  const [exDescription, setExDescription] = useState('');
  const [exTargetArea, setExTargetArea] = useState('');
  const [exDifficulty, setExDifficulty] = useState<Difficulty>('easy');
  const [exSets, setExSets] = useState(3);
  const [exReps, setExReps] = useState(10);
  const [exDuration, setExDuration] = useState('10分钟');
  const [exTips, setExTips] = useState('');

  const targetAreas = Array.from(new Set(exercises.map((e) => e.targetArea.split('、')[0])));

  const filteredExercises = exercises.filter((e) => {
    const matchSearch = e.name.includes(searchQuery) || e.description.includes(searchQuery);
    const matchArea =
      targetAreaFilter === 'all' || e.targetArea.includes(targetAreaFilter);
    return matchSearch && matchArea;
  });

  const toggleExercise = (exercise: Exercise) => {
    const exists = selectedExercises.find((e) => e.exerciseId === exercise.id);
    if (exists) {
      setSelectedExercises(selectedExercises.filter((e) => e.exerciseId !== exercise.id));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: exercise.defaultSets,
          reps: exercise.defaultReps,
          order: selectedExercises.length + 1,
        },
      ]);
    }
  };

  const updateExerciseConfig = (
    id: string,
    field: 'sets' | 'reps',
    value: number
  ) => {
    setSelectedExercises(
      selectedExercises.map((e) =>
        e.exerciseId === id ? { ...e, [field]: value } : e
      )
    );
  };

  const handleSavePrescription = () => {
    if (!prescriptionName || !selectedPatient || !startDate || !endDate || selectedExercises.length === 0) return;
    const patient = patients.find((p) => p.id === selectedPatient);
    addPrescription({
      patientId: selectedPatient,
      patientName: patient?.name || '',
      name: prescriptionName,
      exercises: selectedExercises.map((ex, i) => ({ ...ex, order: i + 1 })),
      startDate,
      endDate,
      frequency,
      painSurveyConfig: painSurveyEnabled
        ? { enabled: true, type: painSurveyType, frequency: 'every_checkin' }
        : undefined,
      status: 'active',
    });
    setShowCreateModal(false);
    setPrescriptionName('');
    setSelectedPatient('');
    setStartDate('');
    setEndDate('');
    setFrequency('每日2次，早晚各一次');
    setPainSurveyEnabled(true);
    setPainSurveyType('NRS');
    setSelectedExercises([]);
    setActiveTab('prescriptions');
  };

  const handleSaveExercise = () => {
    if (!exName || !exDescription || !exTargetArea) return;
    addExercise({
      name: exName,
      description: exDescription,
      targetArea: exTargetArea,
      difficulty: exDifficulty,
      defaultSets: exSets,
      defaultReps: exReps,
      duration: exDuration,
      tips: exTips ? exTips.split('\n').filter(Boolean) : [],
    });
    setShowExerciseModal(false);
    setExName('');
    setExDescription('');
    setExTargetArea('');
    setExDifficulty('easy');
    setExSets(3);
    setExReps(10);
    setExDuration('10分钟');
    setExTips('');
  };

  const activePrescriptions = prescriptions.filter((p) => p.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">训练处方</h1>
        <p className="page-subtitle">管理康复动作库，为患者制定个性化训练处方</p>
      </div>

      <div className="flex items-center border-b border-neutral-100 mb-6">
        <button
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'library'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-neutral-300 hover:text-neutral-500'
          }`}
          onClick={() => setActiveTab('library')}
        >
          康复动作库
        </button>
        <button
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'prescriptions'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-neutral-300 hover:text-neutral-500'
          }`}
          onClick={() => setActiveTab('prescriptions')}
        >
          处方管理
          {activePrescriptions.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-50 text-primary-500 text-xs rounded-full">
              {activePrescriptions.length}
            </span>
          )}
        </button>
        <div className="ml-auto">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5 inline" />
            新建处方
          </button>
        </div>
      </div>

      {activeTab === 'library' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input
                  type="text"
                  placeholder="搜索动作名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-9 pl-9 pr-4 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <select
                value={targetAreaFilter}
                onChange={(e) => setTargetAreaFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">全部部位</option>
                {targetAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-secondary" onClick={() => setShowExerciseModal(true)}>
              <Upload className="w-4 h-4 mr-1.5 inline" />
              上传新动作
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                selected={selectedExercises.some((e) => e.exerciseId === exercise.id)}
                onSelect={() => toggleExercise(exercise)}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            const patient = patients.find((p) => p.id === prescription.patientId);
            return (
              <div key={prescription.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-neutral-500">
                        {prescription.name}
                      </h3>
                      <div className="flex items-center mt-1.5 text-xs text-neutral-300 space-x-4">
                        <span className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1" />
                          {prescription.patientName}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {prescription.startDate} 至 {prescription.endDate}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {prescription.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`tag ${
                        prescription.status === 'active'
                          ? 'tag-success'
                          : prescription.status === 'paused'
                          ? 'tag-warning'
                          : 'tag-neutral'
                      }`}
                    >
                      {prescription.status === 'active'
                        ? '进行中'
                        : prescription.status === 'paused'
                        ? '已暂停'
                        : '已完成'}
                    </span>
                    <button className="btn-secondary !py-1.5 !px-3 !text-xs">
                      查看详情
                      <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-50">
                  <div className="flex flex-wrap gap-2">
                    {prescription.exercises.map((ex) => (
                      <div
                        key={ex.exerciseId}
                        className="flex items-center px-3 py-1.5 bg-neutral-50 rounded-lg text-xs"
                      >
                        <span className="text-neutral-500 font-medium">{ex.exerciseName}</span>
                        <span className="text-neutral-300 mx-2">·</span>
                        <span className="text-neutral-300">{ex.sets}组 × {ex.reps}次</span>
                      </div>
                    ))}
                  </div>
                  {prescription.painSurveyConfig?.enabled && (
                    <div className="flex items-center mt-3 text-xs text-neutral-300">
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-medical-warning" />
                      已配置疼痛评估 ({prescription.painSurveyConfig.type}评分)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[900px] max-h-[90vh] overflow-hidden flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-500">新建训练处方</h2>
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
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                    处方名称
                  </label>
                  <input
                    type="text"
                    value={prescriptionName}
                    onChange={(e) => setPrescriptionName(e.target.value)}
                    placeholder="如：膝关节置换术后第一阶段"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                    选择患者
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
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
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                    训练频次
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="input-field"
                  >
                    <option>每日1次</option>
                    <option>每日2次，早晚各一次</option>
                    <option>每日3次，早中晚各一次</option>
                    <option>隔日1次</option>
                    <option>每周3次（一、三、五）</option>
                    <option>每周5次（工作日）</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-neutral-500">
                    选择康复动作
                    <span className="text-neutral-300 font-normal ml-2">
                      已选 {selectedExercises.length} 个
                    </span>
                  </h3>
                </div>

                {selectedExercises.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {selectedExercises.map((ex, index) => (
                      <div
                        key={ex.exerciseId}
                        className="flex items-center bg-primary-50/50 rounded-xl p-3"
                      >
                        <span className="w-7 h-7 rounded-full bg-primary-500 text-white text-sm font-medium flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-neutral-500 flex-1">
                          {ex.exerciseName}
                        </span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="text-xs text-neutral-300 mr-2">组数</span>
                            <input
                              type="number"
                              min={1}
                              value={ex.sets}
                              onChange={(e) =>
                                updateExerciseConfig(
                                  ex.exerciseId,
                                  'sets',
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 h-8 px-2 bg-white border border-neutral-200 rounded-lg text-sm text-center"
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-neutral-300 mr-2">次数</span>
                            <input
                              type="number"
                              min={1}
                              value={ex.reps}
                              onChange={(e) =>
                                updateExerciseConfig(
                                  ex.exerciseId,
                                  'reps',
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 h-8 px-2 bg-white border border-neutral-200 rounded-lg text-sm text-center"
                            />
                          </div>
                          <button
                            className="p-1.5 hover:bg-white rounded-lg"
                            onClick={() =>
                              setSelectedExercises(
                                selectedExercises.filter((e) => e.exerciseId !== ex.exerciseId)
                              )
                            }
                          >
                            <X className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-neutral-50 rounded-xl mb-4">
                    <Info className="w-8 h-8 text-neutral-200 mx-auto" />
                    <p className="text-sm text-neutral-300 mt-2">
                      请先从动作库中选择康复动作
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-3">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedExercises.some((e) => e.exerciseId === exercise.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-100 hover:border-primary-200 hover:bg-neutral-50'
                      }`}
                      onClick={() => toggleExercise(exercise)}
                    >
                      <p className="text-sm font-medium text-neutral-500">{exercise.name}</p>
                      <p className="text-xs text-neutral-300 mt-0.5">{exercise.targetArea}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-500">疼痛问卷配置</h3>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      设置是否在打卡时要求患者评估疼痛程度
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={painSurveyEnabled}
                      onChange={(e) => setPainSurveyEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
                {painSurveyEnabled && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <label className="block text-sm font-medium text-neutral-500 mb-2">
                      疼痛评分类型
                    </label>
                    <div className="flex space-x-3">
                      {(['NRS', 'VAS'] as const).map((type) => (
                        <label
                          key={type}
                          className={`flex items-center px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                            painSurveyType === type
                              ? 'border-primary-500 bg-primary-50 text-primary-600'
                              : 'border-neutral-200 bg-white text-neutral-500 hover:border-primary-200'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={painSurveyType === type}
                            onChange={() => setPainSurveyType(type)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">
                            {type} - {type === 'NRS' ? '数字评分法' : '视觉模拟评分法'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-neutral-100">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                disabled={!prescriptionName || !selectedPatient || !startDate || !endDate || selectedExercises.length === 0}
                onClick={handleSavePrescription}
              >
                <Save className="w-4 h-4 mr-1.5 inline" />
                保存处方
              </button>
            </div>
          </div>
        </div>
      )}

      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[600px] max-h-[90vh] overflow-hidden flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-500">新增康复动作</h2>
              <button
                className="p-1.5 hover:bg-neutral-100 rounded-lg"
                onClick={() => setShowExerciseModal(false)}
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">动作名称</label>
                <input
                  type="text"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  placeholder="如：直腿抬高训练"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">动作描述</label>
                <textarea
                  value={exDescription}
                  onChange={(e) => setExDescription(e.target.value)}
                  placeholder="详细描述动作要领和执行方式..."
                  className="input-field h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">目标部位</label>
                  <input
                    type="text"
                    value={exTargetArea}
                    onChange={(e) => setExTargetArea(e.target.value)}
                    placeholder="如：大腿肌群、髋屈肌"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">难度等级</label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value as Difficulty)}
                    className="input-field"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">默认组数</label>
                  <input
                    type="number"
                    min={1}
                    value={exSets}
                    onChange={(e) => setExSets(parseInt(e.target.value) || 1)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">默认次数</label>
                  <input
                    type="number"
                    min={1}
                    value={exReps}
                    onChange={(e) => setExReps(parseInt(e.target.value) || 1)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">建议时长</label>
                  <input
                    type="text"
                    value={exDuration}
                    onChange={(e) => setExDuration(e.target.value)}
                    placeholder="如：10-15分钟"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                  动作要点（每行一条）
                </label>
                <textarea
                  value={exTips}
                  onChange={(e) => setExTips(e.target.value)}
                  placeholder="保持腰部贴紧床面&#10;动作缓慢有控制&#10;避免腰部代偿"
                  className="input-field h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-neutral-100">
              <button className="btn-secondary" onClick={() => setShowExerciseModal(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                disabled={!exName || !exDescription || !exTargetArea}
                onClick={handleSaveExercise}
              >
                <Save className="w-4 h-4 mr-1.5 inline" />
                保存动作
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
