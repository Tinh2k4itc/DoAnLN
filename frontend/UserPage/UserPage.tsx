import React, { useEffect, useState } from 'react';
import Sidebar from './left-bar/Sidebar';
import UserForm from './UserForm';
import { fetchParts, Part } from '../AdminPage/manage-part/PartApi';
import { fetchCourses, Course } from '../AdminPage/manage-course/courseApi';

const UserPage: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    fetchParts().then(setParts);
    fetchCourses().then(setCourses);
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      <Sidebar />
      <div className="flex-1 p-8">
        {!selectedPartId ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">Chọn đề thi để làm bài</h1>
            <ul className="space-y-4">
              {parts.map(part => {
                const course = courses.find(c => c.id === part.courseId);
                return (
                  <li key={part.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                    <div>
                      <div className="font-semibold text-lg">{part.name}</div>
                      <div className="text-slate-500 text-sm">Môn học: {course?.name || ''}</div>
                      <div className="text-slate-500 text-sm">Thời gian: {part.duration} phút</div>
                      <div className="text-slate-500 text-sm">Số câu hỏi: {part.questions?.length || 0}</div>
                      {typeof part.maxRetake === 'number' && <div className="text-slate-500 text-sm">Số lần thi lại còn lại: {part.maxRetake}</div>}
                    </div>
                    <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700" onClick={() => setSelectedPartId(part.id!)}>
                      Làm bài
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <UserForm partId={selectedPartId} onBack={() => setSelectedPartId(null)} />
        )}
      </div>
    </div>
  );
};

export default UserPage;