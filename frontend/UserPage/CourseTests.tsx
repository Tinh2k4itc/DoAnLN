import React, { useState } from 'react';

interface CourseTestsProps {
  courseId: string;
}

const mockTests = [
  {
    id: 'test1',
    title: 'Bài thi Hóa học tuần 1',
    duration: 60,
    totalQuestions: 20,
    status: 'Chưa làm',
    score: null,
  },
  {
    id: 'test2',
    title: 'Bài thi Hóa học tuần 2',
    duration: 45,
    totalQuestions: 15,
    status: 'Đã làm',
    score: 8.5,
  },
  {
    id: 'test3',
    title: 'Bài thi Hóa học tuần 3',
    duration: 90,
    totalQuestions: 30,
    status: 'Đã làm',
    score: 9.0,
  },
];

const CourseTests: React.FC<CourseTestsProps> = ({ courseId }) => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const handleStartTest = (testId: string) => {
    setSelectedTest(testId);
    // TODO: Navigate to test taking page
    console.log('Starting test:', testId);
  };

  const handleViewResult = (testId: string) => {
    // TODO: Navigate to test result page
    console.log('Viewing result for test:', testId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách bài thi</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-3 px-4 text-left">Tên bài thi</th>
              <th className="py-3 px-4 text-left">Thời gian</th>
              <th className="py-3 px-4 text-left">Số câu</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-left">Điểm</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {mockTests.map((test) => (
              <tr key={test.id} className="border-b last:border-none">
                <td className="py-3 px-4 font-medium">{test.title}</td>
                <td className="py-3 px-4">{test.duration} phút</td>
                <td className="py-3 px-4">{test.totalQuestions} câu</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    test.status === 'Chưa làm' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {test.status}
                  </span>
                </td>
                <td className="py-3 px-4">{test.score !== null ? test.score : '-'}</td>
                <td className="py-3 px-4">
                  {test.status === 'Chưa làm' ? (
                    <button 
                      onClick={() => handleStartTest(test.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    >
                      Làm bài
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleViewResult(test.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                      Xem kết quả
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTests; 