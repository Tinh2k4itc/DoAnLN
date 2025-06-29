import React, { useState } from 'react';

const mockAssignments = [
  {
    id: 'a1',
    title: 'Bài tập Hóa tuần 1',
    course: 'Hóa Học 12',
    dueDate: '2024-07-10',
    status: 'Chưa nộp',
    score: null,
  },
  {
    id: 'a2',
    title: 'Bài tập Toán tuần 1',
    course: 'Toán Học 12',
    dueDate: '2024-07-12',
    status: 'Đã nộp',
    score: 8.5,
  },
  {
    id: 'a3',
    title: 'Bài tập Hóa tuần 2',
    course: 'Hóa Học 12',
    dueDate: '2024-07-17',
    status: 'Đã chấm',
    score: 9.0,
  },
];

const statusOptions = ['Tất cả', 'Chưa nộp', 'Đã nộp', 'Đã chấm'];

const MyAssignments: React.FC = () => {
  const [filter, setFilter] = useState('Tất cả');
  const filtered = filter === 'Tất cả' ? mockAssignments : mockAssignments.filter(a => a.status === filter);

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bài tập của tôi</h1>
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium">Lọc theo trạng thái:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-md">
            {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">Tên bài tập</th>
                <th className="py-2 px-4 text-left">Môn học</th>
                <th className="py-2 px-4 text-left">Hạn nộp</th>
                <th className="py-2 px-4 text-left">Trạng thái</th>
                <th className="py-2 px-4 text-left">Điểm</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b last:border-none">
                  <td className="py-2 px-4 font-medium">{a.title}</td>
                  <td className="py-2 px-4">{a.course}</td>
                  <td className="py-2 px-4">{a.dueDate}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status === 'Chưa nộp' ? 'bg-yellow-100 text-yellow-700' : a.status === 'Đã nộp' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{a.status}</span>
                  </td>
                  <td className="py-2 px-4">{a.score !== null ? a.score : '-'}</td>
                  <td className="py-2 px-4">
                    {a.status === 'Chưa nộp' && <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Nộp bài</button>}
                    {a.status === 'Đã nộp' && <span className="text-xs text-gray-400">Đang chờ chấm</span>}
                    {a.status === 'Đã chấm' && <span className="text-xs text-green-600">Đã chấm</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAssignments; 