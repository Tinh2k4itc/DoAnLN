import React, { useState } from 'react';

const mockGrades = [
  {
    id: 'g1',
    course: 'Hóa Học 12',
    assignments: 9.0,
    tests: 8.5,
    final: 8.8,
    total: 8.7,
  },
  {
    id: 'g2',
    course: 'Toán Học 12',
    assignments: 8.0,
    tests: 9.0,
    final: 8.5,
    total: 8.6,
  },
];

const courseOptions = ['Tất cả', ...mockGrades.map(g => g.course)];

const MyGrades: React.FC = () => {
  const [filter, setFilter] = useState('Tất cả');
  const filtered = filter === 'Tất cả' ? mockGrades : mockGrades.filter(g => g.course === filter);

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Điểm số của tôi</h1>
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium">Lọc theo môn học:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-md">
            {courseOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">Môn học</th>
                <th className="py-2 px-4 text-left">Điểm bài tập</th>
                <th className="py-2 px-4 text-left">Điểm bài thi</th>
                <th className="py-2 px-4 text-left">Điểm cuối kỳ</th>
                <th className="py-2 px-4 text-left">Tổng kết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b last:border-none">
                  <td className="py-2 px-4 font-medium">{g.course}</td>
                  <td className="py-2 px-4">{g.assignments}</td>
                  <td className="py-2 px-4">{g.tests}</td>
                  <td className="py-2 px-4">{g.final}</td>
                  <td className="py-2 px-4 font-bold text-blue-700">{g.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyGrades; 