import React from 'react';

interface UserDashboardProps {
  onNavigateTo: (section: string) => void;
}

const mockDashboardData = {
  userInfo: {
    name: 'Nguyễn Văn A',
    email: 'student@example.com',
    studentId: 'SV001',
    avatar: 'https://picsum.photos/seed/student99/100/100',
  },
  stats: {
    totalCourses: 5,
    activeCourses: 3,
    completedTests: 12,
    averageScore: 8.5,
    totalAssignments: 20,
    submittedAssignments: 18,
  },
  recentActivity: [
    {
      id: '1',
      type: 'test',
      title: 'Hoàn thành bài thi Hóa học tuần 3',
      course: 'Hóa Học 12',
      score: 9.0,
      date: '2024-07-15',
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Nộp bài tập Toán tuần 2',
      course: 'Toán Học 12',
      date: '2024-07-14',
    },
    {
      id: '3',
      type: 'course',
      title: 'Tham gia khóa học Vật Lý 12',
      course: 'Vật Lý 12',
      date: '2024-07-13',
    },
  ],
  upcomingDeadlines: [
    {
      id: '1',
      type: 'test',
      title: 'Bài thi Hóa học tuần 4',
      course: 'Hóa Học 12',
      deadline: '2024-07-20',
      timeLeft: '5 ngày',
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Bài tập Toán tuần 3',
      course: 'Toán Học 12',
      deadline: '2024-07-18',
      timeLeft: '3 ngày',
    },
  ],
  courseProgress: [
    {
      id: 'course1',
      name: 'Hóa Học 12',
      progress: 75,
      completedLessons: 15,
      totalLessons: 20,
      averageScore: 8.8,
    },
    {
      id: 'course2',
      name: 'Toán Học 12',
      progress: 60,
      completedLessons: 12,
      totalLessons: 20,
      averageScore: 8.2,
    },
  ],
};

const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigateTo }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'test': return '📝';
      case 'assignment': return '📚';
      case 'course': return '🎓';
      default: return '📌';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'test': return 'text-green-600 bg-green-100';
      case 'assignment': return 'text-blue-600 bg-blue-100';
      case 'course': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xin chào, {mockDashboardData.userInfo.name}!</h1>
          <p className="text-gray-600">Đây là tổng quan về tiến độ học tập của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Khóa học đang học</p>
                <p className="text-2xl font-bold text-gray-800">{mockDashboardData.stats.activeCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Bài thi đã làm</p>
                <p className="text-2xl font-bold text-gray-800">{mockDashboardData.stats.completedTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Điểm trung bình</p>
                <p className="text-2xl font-bold text-gray-800">{mockDashboardData.stats.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Bài tập đã nộp</p>
                <p className="text-2xl font-bold text-gray-800">{mockDashboardData.stats.submittedAssignments}/{mockDashboardData.stats.totalAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Progress */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tiến độ khóa học</h2>
            <div className="space-y-4">
              {mockDashboardData.courseProgress.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">{course.name}</h3>
                    <span className="text-sm text-gray-600">{course.completedLessons}/{course.totalLessons} bài</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ: {course.progress}%</span>
                    <span className="text-gray-600">Điểm TB: {course.averageScore}</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigateTo('courses')}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả khóa học
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động gần đây</h2>
            <div className="space-y-3">
              {mockDashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.course} • {activity.date}</p>
                    {activity.score && (
                      <p className="text-xs text-green-600 font-medium">Điểm: {activity.score}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hạn nộp sắp tới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockDashboardData.upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{deadline.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    deadline.type === 'test' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {deadline.type === 'test' ? 'Bài thi' : 'Bài tập'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{deadline.course}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Hạn: {deadline.deadline}</span>
                  <span className="text-sm font-medium text-orange-600">{deadline.timeLeft}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 