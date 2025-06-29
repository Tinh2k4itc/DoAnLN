import React, { useState } from 'react';

interface AdminReportsProps {
  onBack: () => void;
}

const mockReportData = {
  testResults: [
    {
      id: 'test1',
      name: 'Bài thi Hóa học tuần 1',
      course: 'Hóa Học 12',
      totalStudents: 45,
      completedStudents: 42,
      averageScore: 8.2,
      highestScore: 10.0,
      lowestScore: 5.5,
      passRate: 89,
      date: '2024-07-10',
    },
    {
      id: 'test2',
      name: 'Bài thi Toán tuần 1',
      course: 'Toán Học 12',
      totalStudents: 52,
      completedStudents: 48,
      averageScore: 7.8,
      highestScore: 9.5,
      lowestScore: 4.0,
      passRate: 85,
      date: '2024-07-12',
    },
    {
      id: 'test3',
      name: 'Bài thi Vật lý tuần 1',
      course: 'Vật Lý 12',
      totalStudents: 38,
      completedStudents: 35,
      averageScore: 8.5,
      highestScore: 10.0,
      lowestScore: 6.0,
      passRate: 92,
      date: '2024-07-15',
    },
  ],
  studentPerformance: [
    {
      id: 'student1',
      name: 'Nguyễn Văn A',
      studentId: 'SV001',
      course: 'Hóa Học 12',
      testsTaken: 8,
      averageScore: 8.8,
      assignmentsSubmitted: 12,
      assignmentAverage: 9.0,
      attendance: 95,
      rank: 3,
    },
    {
      id: 'student2',
      name: 'Trần Thị B',
      studentId: 'SV002',
      course: 'Toán Học 12',
      testsTaken: 10,
      averageScore: 9.2,
      assignmentsSubmitted: 15,
      assignmentAverage: 9.3,
      attendance: 98,
      rank: 1,
    },
    {
      id: 'student3',
      name: 'Lê Văn C',
      studentId: 'SV003',
      course: 'Vật Lý 12',
      testsTaken: 6,
      averageScore: 7.5,
      assignmentsSubmitted: 10,
      assignmentAverage: 7.8,
      attendance: 85,
      rank: 15,
    },
  ],
  courseAnalytics: [
    {
      id: 'course1',
      name: 'Hóa Học 12',
      totalStudents: 45,
      activeStudents: 42,
      completionRate: 93,
      averageScore: 8.2,
      totalTests: 8,
      totalAssignments: 12,
      studentSatisfaction: 4.5,
    },
    {
      id: 'course2',
      name: 'Toán Học 12',
      totalStudents: 52,
      activeStudents: 48,
      completionRate: 92,
      averageScore: 7.8,
      totalTests: 10,
      totalAssignments: 15,
      studentSatisfaction: 4.3,
    },
    {
      id: 'course3',
      name: 'Vật Lý 12',
      totalStudents: 38,
      activeStudents: 35,
      completionRate: 92,
      averageScore: 8.5,
      totalTests: 6,
      totalAssignments: 10,
      studentSatisfaction: 4.7,
    },
  ],
  trends: {
    monthlyStats: [
      { month: 'Tháng 1', tests: 15, assignments: 25, students: 120 },
      { month: 'Tháng 2', tests: 18, assignments: 30, students: 135 },
      { month: 'Tháng 3', tests: 20, assignments: 35, students: 142 },
      { month: 'Tháng 4', tests: 22, assignments: 40, students: 150 },
      { month: 'Tháng 5', tests: 25, assignments: 45, students: 156 },
      { month: 'Tháng 6', tests: 28, assignments: 50, students: 160 },
    ],
    scoreDistribution: [
      { range: '9-10', count: 45, percentage: 25 },
      { range: '8-9', count: 68, percentage: 38 },
      { range: '7-8', count: 52, percentage: 29 },
      { range: '6-7', count: 15, percentage: 8 },
      { range: '0-6', count: 0, percentage: 0 },
    ],
  },
};

const AdminReports: React.FC<AdminReportsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'students' | 'courses' | 'trends'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'tests', label: 'Kết quả bài thi', icon: '📝' },
    { id: 'students', label: 'Hiệu suất học sinh', icon: '👥' },
    { id: 'courses', label: 'Phân tích khóa học', icon: '🎓' },
    { id: 'trends', label: 'Xu hướng', icon: '📈' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tổng bài thi</p>
              <p className="text-2xl font-bold text-gray-800">45</p>
              <p className="text-xs text-green-600">+12% so với tháng trước</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Học sinh tham gia</p>
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-xs text-green-600">+8% so với tháng trước</p>
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
              <p className="text-2xl font-bold text-gray-800">8.2</p>
              <p className="text-xs text-green-600">+0.3 so với tháng trước</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tỷ lệ đạt</p>
              <p className="text-2xl font-bold text-gray-800">89%</p>
              <p className="text-xs text-green-600">+2% so với tháng trước</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Test Results */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Kết quả bài thi gần đây</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="py-3 px-4 text-left">Tên bài thi</th>
                <th className="py-3 px-4 text-left">Khóa học</th>
                <th className="py-3 px-4 text-left">Học sinh</th>
                <th className="py-3 px-4 text-left">Điểm TB</th>
                <th className="py-3 px-4 text-left">Tỷ lệ đạt</th>
                <th className="py-3 px-4 text-left">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {mockReportData.testResults.slice(0, 5).map((test) => (
                <tr key={test.id} className="border-b last:border-none">
                  <td className="py-3 px-4 font-medium">{test.name}</td>
                  <td className="py-3 px-4">{test.course}</td>
                  <td className="py-3 px-4">{test.completedStudents}/{test.totalStudents}</td>
                  <td className="py-3 px-4">{test.averageScore}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {test.passRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">{test.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTestResults = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Kết quả bài thi chi tiết</h2>
        <select 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">Tất cả khóa học</option>
          <option value="hóa">Hóa Học 12</option>
          <option value="toán">Toán Học 12</option>
          <option value="lý">Vật Lý 12</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-3 px-4 text-left">Tên bài thi</th>
              <th className="py-3 px-4 text-left">Khóa học</th>
              <th className="py-3 px-4 text-left">Tổng HS</th>
              <th className="py-3 px-4 text-left">Hoàn thành</th>
              <th className="py-3 px-4 text-left">Điểm TB</th>
              <th className="py-3 px-4 text-left">Cao nhất</th>
              <th className="py-3 px-4 text-left">Thấp nhất</th>
              <th className="py-3 px-4 text-left">Tỷ lệ đạt</th>
            </tr>
          </thead>
          <tbody>
            {mockReportData.testResults.map((test) => (
              <tr key={test.id} className="border-b last:border-none">
                <td className="py-3 px-4 font-medium">{test.name}</td>
                <td className="py-3 px-4">{test.course}</td>
                <td className="py-3 px-4">{test.totalStudents}</td>
                <td className="py-3 px-4">{test.completedStudents}</td>
                <td className="py-3 px-4 font-medium">{test.averageScore}</td>
                <td className="py-3 px-4 text-green-600">{test.highestScore}</td>
                <td className="py-3 px-4 text-red-600">{test.lowestScore}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    test.passRate >= 90 ? 'bg-green-100 text-green-700' :
                    test.passRate >= 80 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {test.passRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStudentPerformance = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Hiệu suất học sinh</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-3 px-4 text-left">Học sinh</th>
              <th className="py-3 px-4 text-left">Mã SV</th>
              <th className="py-3 px-4 text-left">Khóa học</th>
              <th className="py-3 px-4 text-left">Bài thi</th>
              <th className="py-3 px-4 text-left">Điểm TB bài thi</th>
              <th className="py-3 px-4 text-left">Bài tập</th>
              <th className="py-3 px-4 text-left">Điểm TB bài tập</th>
              <th className="py-3 px-4 text-left">Chuyên cần</th>
              <th className="py-3 px-4 text-left">Xếp hạng</th>
            </tr>
          </thead>
          <tbody>
            {mockReportData.studentPerformance.map((student) => (
              <tr key={student.id} className="border-b last:border-none">
                <td className="py-3 px-4 font-medium">{student.name}</td>
                <td className="py-3 px-4">{student.studentId}</td>
                <td className="py-3 px-4">{student.course}</td>
                <td className="py-3 px-4">{student.testsTaken}</td>
                <td className="py-3 px-4 font-medium">{student.averageScore}</td>
                <td className="py-3 px-4">{student.assignmentsSubmitted}</td>
                <td className="py-3 px-4">{student.assignmentAverage}</td>
                <td className="py-3 px-4">{student.attendance}%</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    student.rank <= 3 ? 'bg-green-100 text-green-700' :
                    student.rank <= 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    #{student.rank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourseAnalytics = () => (
    <div className="space-y-6">
      {mockReportData.courseAnalytics.map((course) => (
        <div key={course.id} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
            <span className="text-sm text-gray-600">{course.totalStudents} học sinh</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
              <p className="text-lg font-bold text-gray-800">{course.completionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Điểm trung bình</p>
              <p className="text-lg font-bold text-gray-800">{course.averageScore}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng bài thi</p>
              <p className="text-lg font-bold text-gray-800">{course.totalTests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Đánh giá HS</p>
              <p className="text-lg font-bold text-gray-800">{course.studentSatisfaction}/5</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Xu hướng hàng tháng</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="py-3 px-4 text-left">Tháng</th>
                <th className="py-3 px-4 text-left">Bài thi</th>
                <th className="py-3 px-4 text-left">Bài tập</th>
                <th className="py-3 px-4 text-left">Học sinh</th>
              </tr>
            </thead>
            <tbody>
              {mockReportData.trends.monthlyStats.map((stat, index) => (
                <tr key={index} className="border-b last:border-none">
                  <td className="py-3 px-4 font-medium">{stat.month}</td>
                  <td className="py-3 px-4">{stat.tests}</td>
                  <td className="py-3 px-4">{stat.assignments}</td>
                  <td className="py-3 px-4">{stat.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân bố điểm</h2>
        <div className="space-y-3">
          {mockReportData.trends.scoreDistribution.map((dist, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm font-medium text-gray-700">{dist.range}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full" 
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-right text-sm text-gray-600">
                {dist.count} ({dist.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tests':
        return renderTestResults();
      case 'students':
        return renderStudentPerformance();
      case 'courses':
        return renderCourseAnalytics();
      case 'trends':
        return renderTrends();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-800">Báo cáo & Thống kê</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminReports;