import React from 'react';

interface AdminDashboardProps {
  onNavigateTo: (section: string) => void;
}

const mockAdminData = {
  stats: {
    totalCourses: 12,
    activeCourses: 8,
    totalStudents: 156,
    activeStudents: 142,
    totalTests: 45,
    completedTests: 38,
    totalAssignments: 89,
    pendingAssignments: 12,
  },
  recentActivity: [
    {
      id: '1',
      type: 'course',
      title: 'Tạo khóa học mới: Vật Lý 11',
      user: 'Nguyễn Văn A',
      date: '2024-07-15T10:30:00',
    },
    {
      id: '2',
      type: 'test',
      title: 'Tạo bài thi: Hóa học tuần 4',
      user: 'Trần Thị B',
      date: '2024-07-14T15:45:00',
    },
    {
      id: '3',
      type: 'student',
      title: 'Thêm 5 học sinh mới',
      user: 'Admin',
      date: '2024-07-14T09:15:00',
    },
    {
      id: '4',
      type: 'assignment',
      title: 'Chấm xong 20 bài tập Toán',
      user: 'Lê Văn C',
      date: '2024-07-13T16:20:00',
    },
  ],
  courseStats: [
    {
      id: 'course1',
      name: 'Hóa Học 12',
      students: 45,
      tests: 8,
      assignments: 12,
      avgScore: 8.2,
    },
    {
      id: 'course2',
      name: 'Toán Học 12',
      students: 52,
      tests: 10,
      assignments: 15,
      avgScore: 7.8,
    },
    {
      id: 'course3',
      name: 'Vật Lý 12',
      students: 38,
      tests: 6,
      assignments: 10,
      avgScore: 8.5,
    },
  ],
  upcomingDeadlines: [
    {
      id: '1',
      type: 'test',
      title: 'Bài thi Hóa học tuần 4',
      course: 'Hóa Học 12',
      deadline: '2024-07-20',
      students: 45,
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Chấm bài tập Toán tuần 3',
      course: 'Toán Học 12',
      deadline: '2024-07-18',
      submissions: 48,
    },
  ],
  performanceMetrics: {
    testCompletionRate: 84,
    assignmentSubmissionRate: 87,
    averageTestScore: 7.9,
    studentEngagement: 92,
  },
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTo }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course': return '🎓';
      case 'test': return '📝';
      case 'student': return '👥';
      case 'assignment': return '📚';
      default: return '📌';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'course': return 'text-blue-600 bg-blue-100';
      case 'test': return 'text-green-600 bg-green-100';
      case 'student': return 'text-purple-600 bg-purple-100';
      case 'assignment': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Quản trị</h1>
          <p className="text-gray-600">Tổng quan hệ thống thi trực tuyến</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Khóa học</p>
                <p className="text-2xl font-bold text-gray-800">{mockAdminData.stats.totalCourses}</p>
                <p className="text-xs text-green-600">+{mockAdminData.stats.activeCourses} đang hoạt động</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Học sinh</p>
                <p className="text-2xl font-bold text-gray-800">{mockAdminData.stats.totalStudents}</p>
                <p className="text-xs text-green-600">+{mockAdminData.stats.activeStudents} đang học</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Bài thi</p>
                <p className="text-2xl font-bold text-gray-800">{mockAdminData.stats.totalTests}</p>
                <p className="text-xs text-blue-600">+{mockAdminData.stats.completedTests} đã hoàn thành</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Bài tập</p>
                <p className="text-2xl font-bold text-gray-800">{mockAdminData.stats.totalAssignments}</p>
                <p className="text-xs text-orange-600">+{mockAdminData.stats.pendingAssignments} chờ chấm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Chỉ số hiệu suất</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Tỷ lệ hoàn thành bài thi</span>
                  <span className="text-sm font-bold text-gray-800">{mockAdminData.performanceMetrics.testCompletionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${mockAdminData.performanceMetrics.testCompletionRate}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Tỷ lệ nộp bài tập</span>
                  <span className="text-sm font-bold text-gray-800">{mockAdminData.performanceMetrics.assignmentSubmissionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${mockAdminData.performanceMetrics.assignmentSubmissionRate}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Điểm trung bình bài thi</span>
                  <span className="text-sm font-bold text-gray-800">{mockAdminData.performanceMetrics.averageTestScore}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${mockAdminData.performanceMetrics.averageTestScore * 10}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Mức độ tương tác học sinh</span>
                  <span className="text-sm font-bold text-gray-800">{mockAdminData.performanceMetrics.studentEngagement}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${mockAdminData.performanceMetrics.studentEngagement}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động gần đây</h2>
            <div className="space-y-3">
              {mockAdminData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.user} • {formatDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Statistics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thống kê khóa học</h2>
            <div className="space-y-4">
              {mockAdminData.courseStats.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">{course.name}</h3>
                    <span className="text-sm text-gray-600">{course.students} học sinh</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Bài thi:</span>
                      <span className="font-medium ml-1">{course.tests}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Bài tập:</span>
                      <span className="font-medium ml-1">{course.assignments}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Điểm TB:</span>
                      <span className="font-medium ml-1">{course.avgScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigateTo('manage-course')}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quản lý khóa học
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hạn chót sắp tới</h2>
            <div className="space-y-4">
              {mockAdminData.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{deadline.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deadline.type === 'test' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {deadline.type === 'test' ? 'Bài thi' : 'Chấm bài'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{deadline.course}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Hạn: {deadline.deadline}</span>
                    <span className="text-sm font-medium text-orange-600">
                      {deadline.type === 'test' ? `${deadline.students} học sinh` : `${deadline.submissions} bài nộp`}
                    </span>
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

export default AdminDashboard; 