import React, { useEffect, useState } from 'react';
import { fetchParts, Part } from '../../../AdminPage/manage-part/PartApi';
import { useNavigate } from 'react-router-dom';

const UserCourseTests: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParts().then(all => setParts(all.filter(p => p.courseId === courseId)));
  }, [courseId]);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bài thi của tôi</h2>
      {parts.length === 0 ? <div>Chưa có bài thi nào cho môn học này.</div> : (
        <ul className="space-y-4">
          {parts.map(part => (
            <li key={part.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <div>
                <div className="font-semibold text-lg">{part.name}</div>
                <div className="text-slate-500 text-sm">Thời gian: {part.duration} phút</div>
                <div className="text-slate-500 text-sm">Số câu hỏi: {part.questions?.length || 0}</div>
              </div>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700" onClick={() => navigate(`user-test/${part.id}`)}>
                Làm bài
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserCourseTests; 