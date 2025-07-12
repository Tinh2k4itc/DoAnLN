import React, { useEffect, useState } from 'react';
import { fetchParts, Part } from '../../../AdminPage/manage-part/PartApi';
import { useNavigate } from 'react-router-dom';
import TestCard from './TestCard';

const UserCourseTests: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParts().then(all => setParts(all.filter(p => p.courseId === courseId)));
  }, [courseId]);

  const handleStartTest = (partId: string) => {
    navigate(`user-test/${partId}`);
  };

  const handleViewResults = (partId: string) => {
    // Chuyển đến tab kết quả và filter theo bài thi
    navigate(`../results?testId=${partId}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Bài thi của tôi</h2>
        <div className="text-sm text-slate-600">
          Tổng cộng: {parts.length} bài thi
        </div>
      </div>
      
      {parts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Chưa có bài thi nào</h3>
          <p className="text-slate-500">Môn học này chưa có bài thi nào được tạo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {parts.map(part => (
            <TestCard
              key={part.id}
              part={part}
              onStartTest={handleStartTest}
              onViewResults={handleViewResults}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCourseTests; 