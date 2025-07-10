import React from 'react';

const tabs = [
  { id: 'questions', label: 'Quản trị câu hỏi' },
  { id: 'tests', label: 'Quản trị bài thi' },
  { id: 'scores', label: 'Quản trị điểm số' },
  { id: 'students', label: 'Quản trị sinh viên' },
];

const CourseSidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) => (
  <aside className="w-64 bg-white border-r p-6 flex flex-col gap-4 shadow-lg">
    <h2 className="text-xl font-bold mb-4">Quản trị môn học</h2>
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={`text-left px-4 py-2 rounded font-semibold transition-colors ${activeTab === tab.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-sky-100'}`}
        onClick={() => onTabChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </aside>
);

export default CourseSidebar; 