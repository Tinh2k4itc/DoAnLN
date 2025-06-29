import React, { useState } from 'react';

interface UserNotificationsProps {
  onBack: () => void;
}

const mockNotifications = [
  {
    id: '1',
    type: 'test',
    title: 'Bài thi Hóa học tuần 4 sắp bắt đầu',
    message: 'Bài thi sẽ bắt đầu vào ngày 20/07/2024. Hãy chuẩn bị sẵn sàng!',
    course: 'Hóa Học 12',
    date: '2024-07-15T10:30:00',
    isRead: false,
    priority: 'high',
  },
  {
    id: '2',
    type: 'assignment',
    title: 'Bài tập Toán tuần 3 đã được chấm',
    message: 'Giáo viên đã chấm xong bài tập của bạn. Điểm: 9.0/10',
    course: 'Toán Học 12',
    date: '2024-07-14T15:45:00',
    isRead: true,
    priority: 'medium',
  },
  {
    id: '3',
    type: 'course',
    title: 'Khóa học Vật Lý 12 đã được mở',
    message: 'Bạn có thể bắt đầu học khóa học Vật Lý 12 ngay bây giờ.',
    course: 'Vật Lý 12',
    date: '2024-07-13T09:15:00',
    isRead: true,
    priority: 'low',
  },
  {
    id: '4',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống đã được cập nhật với các tính năng mới. Vui lòng làm mới trang.',
    course: null,
    date: '2024-07-12T14:20:00',
    isRead: false,
    priority: 'medium',
  },
];

const UserNotifications: React.FC<UserNotificationsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'test' | 'assignment' | 'course' | 'system'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'test': return '📝';
      case 'assignment': return '📚';
      case 'course': return '🎓';
      case 'system': return '⚙️';
      default: return '📌';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-500 bg-red-50';
    if (type === 'test') return 'border-blue-500 bg-blue-50';
    if (type === 'assignment') return 'border-green-500 bg-green-50';
    if (type === 'course') return 'border-purple-500 bg-purple-50';
    if (type === 'system') return 'border-gray-500 bg-gray-50';
    return 'border-gray-300 bg-white';
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Thông báo</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount} thông báo chưa đọc
              </p>
            </div>
            <div className="space-x-3">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('test')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'test' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bài thi
            </button>
            <button
              onClick={() => setFilter('assignment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'assignment' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bài tập
            </button>
            <button
              onClick={() => setFilter('course')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'course' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Khóa học
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'system' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hệ thống
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có thông báo</h3>
              <p className="text-gray-600">Bạn đã đọc tất cả thông báo</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${getNotificationColor(notification.type, notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    
                    {notification.course && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">Khóa học:</span>
                        <span className="font-medium text-gray-700">{notification.course}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex flex-col space-y-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotifications; 