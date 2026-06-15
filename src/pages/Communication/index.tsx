import { useState } from 'react';
import {
  MessageSquare,
  CalendarCheck,
  Bell,
  Send,
  Plus,
  Search,
  User,
  Phone,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Paperclip,
  Image,
  Smile,
  X,
  Save,
  Calendar,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Message, Appointment, AppointmentStatus } from '@/types';

const appointmentStatusMap: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'tag-warning' },
  confirmed: { label: '已确认', className: 'tag-info' },
  completed: { label: '已完成', className: 'tag-success' },
  cancelled: { label: '已取消', className: 'tag-neutral' },
};

const Communication = () => {
  const { messages, appointments, patients, sendMessage, addAppointment, currentDoctor } = useAppStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'appointment' | 'notification'>('chat');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentPatientId, setAppointmentPatientId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentType, setAppointmentType] = useState<'复诊' | '评估' | '咨询'>('复诊');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  const chatPatients = Array.from(new Set(messages.map((m) => m.patientId))).map((pid) => {
    const patientMessages = messages.filter((m) => m.patientId === pid);
    const lastMessage = patientMessages[patientMessages.length - 1];
    const unreadCount = patientMessages.filter(
      (m) => !m.isRead && m.sender === 'patient'
    ).length;
    return {
      patientId: pid,
      patientName: lastMessage?.patientName || '',
      lastMessage: lastMessage,
      unreadCount,
    };
  });

  const currentPatient = patients.find((p) => p.id === selectedPatientId);
  const currentMessages = messages.filter((m) => m.patientId === selectedPatientId);

  const handleSendMessage = () => {
    if (selectedPatientId && messageInput.trim()) {
      sendMessage(selectedPatientId, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleCreateAppointment = () => {
    if (appointmentPatientId && appointmentDate && appointmentTime) {
      const patient = patients.find((p) => p.id === appointmentPatientId);
      addAppointment({
        patientId: appointmentPatientId,
        patientName: patient?.name || '',
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        status: 'pending',
        notes: appointmentNotes,
      });
      setShowAppointmentModal(false);
      setAppointmentPatientId('');
      setAppointmentDate('');
      setAppointmentTime('09:00');
      setAppointmentNotes('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">沟通中心</h1>
        <p className="page-subtitle">在线答疑、复诊预约与消息通知管理</p>
      </div>

      <div className="flex items-center border-b border-neutral-100 mb-6">
        <button
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center ${
            activeTab === 'chat'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-neutral-300 hover:text-neutral-500'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          在线答疑
          {chatPatients.some((p) => p.unreadCount > 0) && (
            <span className="ml-2 px-2 py-0.5 bg-medical-danger text-white text-xs rounded-full">
              {chatPatients.reduce((sum, p) => sum + p.unreadCount, 0)}
            </span>
          )}
        </button>
        <button
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center ${
            activeTab === 'appointment'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-neutral-300 hover:text-neutral-500'
          }`}
          onClick={() => setActiveTab('appointment')}
        >
          <CalendarCheck className="w-4 h-4 mr-1.5" />
          复诊预约
          <span className="ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-400 text-xs rounded-full">
            {appointments.filter((a) => a.status === 'pending').length}
          </span>
        </button>
        <button
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center ${
            activeTab === 'notification'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-neutral-300 hover:text-neutral-500'
          }`}
          onClick={() => setActiveTab('notification')}
        >
          <Bell className="w-4 h-4 mr-1.5" />
          消息通知
        </button>
        {activeTab === 'appointment' && (
          <div className="ml-auto">
            <button className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
              <Plus className="w-4 h-4 mr-1.5 inline" />
              新建预约
            </button>
          </div>
        )}
      </div>

      {activeTab === 'chat' && (
        <div className="card p-0 overflow-hidden h-[calc(100vh-240px)]">
          <div className="flex h-full">
            <div className="w-72 border-r border-neutral-100 flex flex-col">
              <div className="p-3 border-b border-neutral-100">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                  <input
                    type="text"
                    placeholder="搜索患者..."
                    className="w-full h-8 pl-9 pr-3 bg-neutral-50 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatPatients.map((chat) => (
                  <div
                    key={chat.patientId}
                    className={`flex items-center p-3.5 cursor-pointer border-b border-neutral-50 transition-colors ${
                      selectedPatientId === chat.patientId
                        ? 'bg-primary-50'
                        : 'hover:bg-neutral-50'
                    }`}
                    onClick={() => setSelectedPatientId(chat.patientId)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                        {chat.patientName.charAt(0)}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-medical-danger text-white text-xs rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-500 truncate">
                          {chat.patientName}
                        </p>
                        <span className="text-xs text-neutral-300 flex-shrink-0 ml-2">
                          {chat.lastMessage?.time?.split(' ')[1] || ''}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-0.5 truncate">
                        {chat.lastMessage?.sender === 'doctor' ? '我: ' : ''}
                        {chat.lastMessage?.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {selectedPatientId && currentPatient ? (
                <>
                  <div className="h-14 border-b border-neutral-100 flex items-center justify-between px-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                        {currentPatient.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-500">
                          {currentPatient.name}
                        </p>
                        <p className="text-xs text-neutral-300">{currentPatient.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg">
                        <Phone className="w-4 h-4 text-neutral-400" />
                      </button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg">
                        <FileText className="w-4 h-4 text-neutral-400" />
                      </button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
                    {currentMessages.map((msg, index) => {
                      const isDoctor = msg.sender === 'doctor';
                      const prevMsg = currentMessages[index - 1];
                      const showDateDivider =
                        !prevMsg || prevMsg.time.split(' ')[0] !== msg.time.split(' ')[0];

                      return (
                        <div key={msg.id}>
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-4">
                              <span className="text-xs text-neutral-300 px-3 py-1 bg-white rounded-full">
                                {msg.time.split(' ')[0]}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                            {!isDoctor && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                                {msg.senderName.charAt(0)}
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                isDoctor
                                  ? 'bg-primary-500 text-white rounded-br-md'
                                  : 'bg-white text-neutral-500 rounded-bl-md shadow-card'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isDoctor ? 'text-white/60' : 'text-neutral-300'
                                }`}
                              >
                                {msg.time.split(' ')[1]}
                                {isDoctor && msg.isRead && (
                                  <span className="ml-2">已读</span>
                                )}
                              </p>
                            </div>
                            {isDoctor && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-medical-teal to-medical-tealLight flex items-center justify-center text-white text-xs font-medium ml-2 flex-shrink-0 mt-0.5">
                                {msg.senderName.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-neutral-100 p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <button className="p-1.5 hover:bg-neutral-100 rounded-lg">
                        <Smile className="w-4.5 h-4.5 text-neutral-400" />
                      </button>
                      <button className="p-1.5 hover:bg-neutral-100 rounded-lg">
                        <Image className="w-4.5 h-4.5 text-neutral-400" />
                      </button>
                      <button className="p-1.5 hover:bg-neutral-100 rounded-lg">
                        <Paperclip className="w-4.5 h-4.5 text-neutral-400" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="输入消息..."
                        className="flex-1 h-9 px-4 bg-neutral-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                      <button
                        className="btn-primary !py-2"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-neutral-200" />
                  </div>
                  <p className="text-base font-medium text-neutral-400 mt-4">选择一位患者</p>
                  <p className="text-sm text-neutral-300 mt-1">
                    点击左侧列表中的患者开始对话
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => {
              const count = appointments.filter((a) => a.status === status).length;
              return (
                <div key={status} className="card">
                  <p className="text-sm text-neutral-300">
                    {status === 'pending'
                      ? '待确认'
                      : status === 'confirmed'
                      ? '已确认'
                      : status === 'completed'
                      ? '已完成'
                      : '已取消'}
                  </p>
                  <p className="text-2xl font-bold text-neutral-500 mt-2">{count}</p>
                </div>
              );
            })}
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">患者</th>
                  <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">日期</th>
                  <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">时间</th>
                  <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">类型</th>
                  <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">状态</th>
                  <th className="text-left text-xs font-medium text-neutral-300 px-5 py-3">备注</th>
                  <th className="text-center text-xs font-medium text-neutral-300 px-5 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, index) => (
                  <tr
                    key={apt.id}
                    className={`border-b border-neutral-50 hover:bg-primary-50/30 transition-colors ${
                      index === appointments.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                          {apt.patientName.charAt(0)}
                        </div>
                        <span className="ml-2.5 text-sm text-neutral-500">{apt.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center text-sm text-neutral-500">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-neutral-300" />
                        {apt.date}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center text-sm text-neutral-500">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-neutral-300" />
                        {apt.time}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="tag tag-info">{apt.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`tag ${appointmentStatusMap[apt.status].className}`}>
                        {appointmentStatusMap[apt.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-neutral-400 max-w-xs truncate">{apt.notes}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {apt.status === 'pending' && (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button className="p-1.5 hover:bg-green-50 rounded-lg text-medical-success">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg text-medical-danger">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notification' && (
        <div className="card p-0">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="section-title mb-0">系统通知</h3>
            <button className="text-xs text-primary-500 hover:text-primary-600">全部标记为已读</button>
          </div>
          <div className="divide-y divide-neutral-50">
            {[
              { type: 'checkin', title: '打卡审核提醒', content: '您有3位患者的打卡记录等待审核', time: '10分钟前', unread: true, icon: '✓', color: 'bg-primary-50 text-primary-500' },
              { type: 'abnormal', title: '异常反馈告警', content: '患者陈淑芬反馈膝关节剧烈疼痛伴肿胀，请及时处理', time: '30分钟前', unread: true, icon: '⚠', color: 'bg-red-50 text-medical-danger' },
              { type: 'assessment', title: '评估提醒', content: '明日有2位患者需要进行康复评估', time: '1小时前', unread: false, icon: '📋', color: 'bg-orange-50 text-medical-warning' },
              { type: 'appointment', title: '复诊预约', content: '患者杨建国申请预约下周三复诊', time: '2小时前', unread: false, icon: '📅', color: 'bg-purple-50 text-purple-600' },
              { type: 'checkin', title: '未打卡提醒', content: '您管理的患者中有5位今日未完成训练打卡', time: '3小时前', unread: false, icon: '🔔', color: 'bg-yellow-50 text-yellow-600' },
              { type: 'system', title: '系统公告', content: '康复云平台将于本周六凌晨2:00-4:00进行系统维护升级', time: '昨天', unread: false, icon: 'ℹ', color: 'bg-blue-50 text-blue-600' },
            ].map((notif, index) => (
              <div
                key={index}
                className={`p-4 hover:bg-neutral-50 transition-colors ${
                  notif.unread ? 'bg-primary-50/20' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                    {notif.icon}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-500">{notif.title}</p>
                      {notif.unread && <span className="w-2 h-2 rounded-full bg-medical-danger" />}
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">{notif.content}</p>
                    <p className="text-xs text-neutral-300 mt-2">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[500px] overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-500">新建复诊预约</h2>
              <button
                className="p-1.5 hover:bg-neutral-100 rounded-lg"
                onClick={() => setShowAppointmentModal(false)}
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">选择患者</label>
                <select
                  value={appointmentPatientId}
                  onChange={(e) => setAppointmentPatientId(e.target.value)}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">预约日期</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1.5">预约时间</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="input-field"
                  >
                    {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">预约类型</label>
                <div className="flex space-x-2">
                  {(['复诊', '评估', '咨询'] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex-1 py-2.5 rounded-lg border text-center cursor-pointer transition-colors ${
                        appointmentType === type
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-neutral-200 bg-white text-neutral-500 hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={appointmentType === type}
                        onChange={() => setAppointmentType(type)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1.5">备注</label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="请输入预约备注..."
                  className="input-field h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-neutral-100">
              <button className="btn-secondary" onClick={() => setShowAppointmentModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleCreateAppointment}>
                <Save className="w-4 h-4 mr-1.5 inline" />
                保存预约
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;
