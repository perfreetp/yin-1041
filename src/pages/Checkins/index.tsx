import { useState } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Video,
  MessageSquare,
  Send,
  User,
  Calendar,
  X,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Checkin, CheckinStatus } from '@/types';

const statusMap: Record<CheckinStatus, { label: string; className: string; icon: any }> = {
  pending: { label: '待审核', className: 'tag-warning', icon: Clock },
  approved: { label: '已通过', className: 'tag-success', icon: CheckCircle },
  rejected: { label: '已驳回', className: 'tag-danger', icon: XCircle },
};

const Checkins = () => {
  const { checkins, updateCheckinStatus, currentDoctor } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [doctorFeedback, setDoctorFeedback] = useState('');

  const filteredCheckins = checkins.filter((c) => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchSearch = c.patientName.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const pendingCount = checkins.filter((c) => c.status === 'pending').length;

  const handleReview = (status: CheckinStatus) => {
    if (selectedCheckin) {
      updateCheckinStatus(selectedCheckin.id, status, doctorFeedback);
      setSelectedCheckin(null);
      setDoctorFeedback('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">打卡管理</h1>
        <p className="page-subtitle">审核患者训练打卡，确认动作完成质量</p>
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
          <div className="flex bg-white rounded-lg border border-neutral-200 p-0.5">
            {[
              { key: 'all', label: '全部' },
              { key: 'pending', label: `待审核 ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
              { key: 'approved', label: '已通过' },
              { key: 'rejected', label: '已驳回' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  filterStatus === tab.key
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-300 hover:text-neutral-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-1.5" />
            日期筛选
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
          {filteredCheckins.map((checkin) => {
            const StatusIcon = statusMap[checkin.status].icon;
            return (
              <div
                key={checkin.id}
                className={`card p-0 overflow-hidden cursor-pointer transition-all ${
                  selectedCheckin?.id === checkin.id
                    ? 'ring-2 ring-primary-500'
                    : 'hover:shadow-card-hover'
                }`}
                onClick={() => setSelectedCheckin(checkin)}
              >
                <div className="h-32 bg-gradient-to-br from-neutral-800 to-neutral-900 relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                  </div>
                  {checkin.abnormalFeedback && (
                    <div className="absolute top-3 left-3 flex items-center px-2 py-1 bg-medical-danger text-white text-xs rounded-md">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      异常反馈
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 tag ${statusMap[checkin.status].className}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusMap[checkin.status].label}
                  </span>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                    {checkin.time}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                        {checkin.patientName.charAt(0)}
                      </div>
                      <div className="ml-2.5">
                        <p className="text-sm font-medium text-neutral-500">
                          {checkin.patientName}
                        </p>
                        <p className="text-xs text-neutral-300">{checkin.date}</p>
                      </div>
                    </div>
                    {checkin.painLevel !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-neutral-300">疼痛</p>
                        <p
                          className={`text-sm font-bold ${
                            checkin.painLevel >= 5
                              ? 'text-medical-danger'
                              : checkin.painLevel >= 3
                              ? 'text-medical-warning'
                              : 'text-medical-success'
                          }`}
                        >
                          {checkin.painLevel}/10
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-neutral-300">
                      完成 {checkin.exercisesCompleted.filter((e) => e.completed).length}/
                      {checkin.exercisesCompleted.length} 动作
                    </span>
                    <span className="text-primary-500 flex items-center">
                      查看详情
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-3">
          {selectedCheckin ? (
            <div className="card p-0 overflow-hidden h-[calc(100vh-240px)] flex flex-col">
              <div className="h-72 bg-gradient-to-br from-neutral-800 to-neutral-900 relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-white font-medium">{selectedCheckin.patientName}</p>
                      <p className="text-white/60 text-sm">
                        {selectedCheckin.date} {selectedCheckin.time}
                      </p>
                    </div>
                  </div>
                  <span className={`tag ${statusMap[selectedCheckin.status].className}`}>
                    {statusMap[selectedCheckin.status].label}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {selectedCheckin.abnormalFeedback && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-medical-danger flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-medical-danger">异常反馈</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {selectedCheckin.abnormalFeedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="section-title">动作完成情况</h3>
                <div className="space-y-2.5 mb-5">
                  {selectedCheckin.exercisesCompleted.map((exercise, index) => (
                    <div
                      key={exercise.exerciseId}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        exercise.completed ? 'bg-green-50/50' : 'bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            exercise.completed
                              ? 'bg-medical-success text-white'
                              : 'bg-medical-danger text-white'
                          }`}
                        >
                          {exercise.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-500">
                            {index + 1}. {exercise.exerciseName}
                          </p>
                          {exercise.notes && (
                            <p className="text-xs text-neutral-300 mt-0.5">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                      {exercise.quality !== undefined && (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= exercise.quality! ? 'text-yellow-500' : 'text-neutral-200'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedCheckin.painLevel !== undefined && (
                  <div className="mb-5">
                    <h3 className="section-title">疼痛评分 (NRS)</h3>
                    <div className="flex items-center space-x-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                            level === selectedCheckin.painLevel
                              ? level <= 3
                                ? 'bg-green-500 text-white'
                                : level <= 6
                                ? 'bg-orange-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-neutral-100 text-neutral-300'
                          }`}
                        >
                          {level}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-neutral-300">
                      <span>无痛</span>
                      <span>轻度疼痛</span>
                      <span>中度疼痛</span>
                      <span>重度疼痛</span>
                    </div>
                  </div>
                )}

                {selectedCheckin.doctorFeedback && (
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="flex items-start">
                      <MessageSquare className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-600">医生反馈</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {selectedCheckin.doctorFeedback}
                        </p>
                        <p className="text-xs text-neutral-300 mt-2">
                          {selectedCheckin.reviewedBy} · {selectedCheckin.reviewedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCheckin.status === 'pending' && (
                  <div className="mt-5 pt-5 border-t border-neutral-100">
                    <h3 className="section-title">审核意见</h3>
                    <textarea
                      value={doctorFeedback}
                      onChange={(e) => setDoctorFeedback(e.target.value)}
                      placeholder="请输入审核意见和康复指导建议..."
                      className="input-field h-24 resize-none"
                    />
                    <div className="flex items-center justify-end space-x-3 mt-4">
                      <button
                        className="btn-danger flex items-center"
                        onClick={() => handleReview('rejected')}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1.5" />
                        驳回
                      </button>
                      <button
                        className="btn-primary flex items-center"
                        onClick={() => handleReview('approved')}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1.5" />
                        通过审核
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-[calc(100vh-240px)] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                <Video className="w-10 h-10 text-neutral-200" />
              </div>
              <p className="text-base font-medium text-neutral-400 mt-4">选择一条打卡记录</p>
              <p className="text-sm text-neutral-300 mt-1">
                点击左侧列表中的打卡记录查看详情并进行审核
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkins;
