import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Calendar, ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '@/store';
import type { NotificationItem } from '@/types';

const getNotificationIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'checkin':
      return '✓';
    case 'abnormal':
      return '⚠';
    case 'message':
      return '💬';
    case 'assessment':
      return '📋';
    case 'appointment':
      return '📅';
    default:
      return 'ℹ';
  }
};

const getNotificationColor = (type: NotificationItem['type']) => {
  switch (type) {
    case 'abnormal':
      return 'bg-red-100 text-medical-danger';
    case 'checkin':
      return 'bg-primary-50 text-primary-500';
    case 'message':
      return 'bg-green-50 text-medical-success';
    default:
      return 'bg-orange-50 text-medical-warning';
  }
};

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
          <input
            type="text"
            placeholder="搜索患者姓名、诊断..."
            className="w-72 h-9 pl-9 pr-4 bg-neutral-50 border border-transparent rounded-lg text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center text-sm text-neutral-400 mr-4">
          <Calendar className="w-4 h-4 mr-2" />
          {today}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            className="relative w-9 h-9 rounded-lg hover:bg-neutral-50 flex items-center justify-center transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-neutral-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-medical-danger text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-dropdown border border-neutral-100 overflow-hidden animate-slide-down">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-500">通知中心</h3>
                {unreadCount > 0 && (
                  <button
                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center"
                    onClick={() => markAllNotificationsRead()}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-primary-50/30' : ''
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-500">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-medical-danger flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-neutral-200 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50">
                <button className="w-full text-sm text-primary-500 hover:text-primary-600 text-center">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="w-9 h-9 rounded-lg hover:bg-neutral-50 flex items-center justify-center transition-colors">
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </button>
      </div>
    </header>
  );
};

export default Header;
