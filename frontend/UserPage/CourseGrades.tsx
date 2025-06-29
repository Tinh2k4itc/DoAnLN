import React from 'react';

interface CourseGradesProps {
  courseId: string;
}

const mockGradeData = {
  assignments: 9.0,
  tests: 8.5,
  final: 8.8,
  total: 8.7,
  history: [
    { week: 'Tuần 1', assignment: 8.5, test: 8.0 },
    { week: 'Tuần 2', assignment: 9.0, test: 8.5 },
    { week: 'Tuần 3', assignment: 9.5, test: 9.0 },
    { week: 'Tuần 4', assignment: 8.0, test: 8.5 },
  ],
};

const CourseGrades: React.FC<CourseGradesProps> = ({ courseId }) => {
  const renderGradeCard = (title: string, score: number, color: string) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
      <h3 className={`text-${color}-700 font-medium text-sm mb-1`}>{title}</h3>
      <p className={`text-${color}-900 text-2xl font-bold`}>{score}</p>
    </div>
  );

  const renderProgressBar = (percentage: number, color: string) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`bg-${color}-600 h-2 rounded-full`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Grade Summary Cards */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tổng quan điểm số</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderGradeCard('Điểm bài tập', mockGradeData.assignments, 'blue')}
          {renderGradeCard('Điểm bài thi', mockGradeData.tests, 'green')}
          {renderGradeCard('Điểm cuối kỳ', mockGradeData.final, 'purple')}
          {renderGradeCard('Tổng kết', mockGradeData.total, 'indigo')}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tiến độ học tập</h2>
        <div className="space-y-4">
          {mockGradeData.history.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-600">{item.week}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Bài tập: {item.assignment}</span>
                  {renderProgressBar((item.assignment / 10) * 100, 'blue')}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Bài thi: {item.test}</span>
                  {renderProgressBar((item.test / 10) * 100, 'green')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân bố điểm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Điểm bài tập</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>8.0 - 10.0</span>
                <span className="font-medium">75%</span>
              </div>
              {renderProgressBar(75, 'blue')}
              <div className="flex justify-between text-sm">
                <span>6.0 - 7.9</span>
                <span className="font-medium">20%</span>
              </div>
              {renderProgressBar(20, 'blue')}
              <div className="flex justify-between text-sm">
                <span>0.0 - 5.9</span>
                <span className="font-medium">5%</span>
              </div>
              {renderProgressBar(5, 'blue')}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Điểm bài thi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>8.0 - 10.0</span>
                <span className="font-medium">60%</span>
              </div>
              {renderProgressBar(60, 'green')}
              <div className="flex justify-between text-sm">
                <span>6.0 - 7.9</span>
                <span className="font-medium">30%</span>
              </div>
              {renderProgressBar(30, 'green')}
              <div className="flex justify-between text-sm">
                <span>0.0 - 5.9</span>
                <span className="font-medium">10%</span>
              </div>
              {renderProgressBar(10, 'green')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGrades; 