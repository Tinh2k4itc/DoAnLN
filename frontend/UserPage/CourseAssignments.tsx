import React, { useState } from 'react';

interface CourseAssignmentsProps {
  courseId: string;
}

const mockAssignments = [
  {
    id: 'a1',
    title: 'Bài tập Hóa tuần 1',
    dueDate: '2024-07-10',
    status: 'Chưa nộp',
    score: null,
  },
  {
    id: 'a2',
    title: 'Bài tập Hóa tuần 2',
    dueDate: '2024-07-17',
    status: 'Đã nộp',
    score: 8.5,
  },
  {
    id: 'a3',
    title: 'Bài tập Hóa tuần 3',
    dueDate: '2024-07-24',
    status: 'Đã chấm',
    score: 9.0,
  },
];

const CourseAssignments: React.FC<CourseAssignmentsProps> = ({ courseId }) => {
  const handleSubmitAssignment = (assignmentId: string) => {
    // TODO: Open assignment submission modal/form
    console.log('Submitting assignment:', assignmentId);
  };

  const handleViewAssignment = (assignmentId: string) => {
    // TODO: View assignment details
    console.log('Viewing assignment:', assignmentId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách bài tập</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-3 px-4 text-left">Tên bài tập</th>
              <th className="py-3 px-4 text-left">Hạn nộp</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-left">Điểm</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {mockAssignments.map((assignment) => (
              <tr key={assignment.id} className="border-b last:border-none">
                <td className="py-3 px-4 font-medium">{assignment.title}</td>
                <td className="py-3 px-4">{assignment.dueDate}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    assignment.status === 'Chưa nộp' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : assignment.status === 'Đã nộp'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="py-3 px-4">{assignment.score !== null ? assignment.score : '-'}</td>
                <td className="py-3 px-4">
                  {assignment.status === 'Chưa nộp' ? (
                    <button 
                      onClick={() => handleSubmitAssignment(assignment.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    >
                      Nộp bài
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleViewAssignment(assignment.id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                    >
                      Xem chi tiết
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

export default CourseAssignments; 