// AdminForm.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from './left-bar/Sidebar';
import CourseCreateForm from './manage-course/CourseCreateForm';
import CourseUpdateForm from  './manage-course/CourseUpdateForm';
import ManageCourse from './manage-course/ManageCourse';
import ManagePart from './manage-part/ManagePart';
import ManageQuestion from './manage-question/ManageQuestion';
import ManageUser from './manage-user/ManageUser';
import ManageTests from './manage-tests/ManageTests';
import ExamResults from './manage-tests/ExamResults';
import { fetchCourses, Course } from './manage-course/courseApi';
import { fetchQuestionBanks, QuestionBank } from './manage-question/QuestionBankApi';
import { fetchParts, Part } from './manage-part/PartApi';
import { fetchQuestions, Question } from './manage-question/QuestionApi';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import Notification from './Notification';
import SystemSettings from './SystemSettings';

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  useEffect(() => {
    fetchCourses().then(setCourses);
    fetchQuestionBanks().then(setBanks);
    fetchParts().then(setParts);
    // Lấy tất cả câu hỏi từ tất cả ngân hàng
    Promise.all(banks.map(b => fetchQuestions(b.id!))).then(qLists => setQuestions(qLists.flat()));
  }, []);
  // Thống kê
  const totalCourses = courses.length;
  const totalBanks = banks.length;
  const totalParts = parts.length;
  const totalQuestions = questions.length;
  // Biểu đồ số lượng đề theo môn học
  const partStats = courses.map(c => ({
    name: c.name,
    count: parts.filter(p => p.courseId === c.id).length
  }));
  // Biểu đồ số lượng câu hỏi theo ngân hàng
  const questionStats = banks.map(b => ({
    name: b.name,
    count: questions.filter(q => q.questionBankId === b.id).length
  }));
  // Lọc dữ liệu theo thời gian
  const filterByDate = (dateStr: string | undefined) => {
    if (!dateStr) return true;
    try {
      const date = parseISO(dateStr);
      const from = dateFrom ? parseISO(dateFrom) : undefined;
      const to = dateTo ? parseISO(dateTo) : undefined;
      if (from && isBefore(date, from)) return false;
      if (to && isAfter(date, to)) return false;
      return true;
    } catch {
      return true;
    }
  };
  const filteredCourses = courses.filter(c => filterByDate(typeof c.createdAt === 'string' ? c.createdAt : undefined));
  const filteredBanks = banks.filter(b => filterByDate((b as any).createdAt));
  const filteredParts = parts.filter(p => filterByDate(typeof p.createdAt === 'string' ? p.createdAt : undefined));
  const filteredQuestions = questions.filter(q => filterByDate((q as any).createdAt));
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Thống kê</h1>
      <div className="flex gap-4 mb-6 items-center">
        <label className="flex items-center gap-2">Từ ngày
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1" />
        </label>
        <label className="flex items-center gap-2">Đến ngày
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1" />
        </label>
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>{setDateFrom('');setDateTo('')}}>Xóa lọc</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-sky-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">{filteredCourses.length}</div>
          <div className="text-slate-600 mt-2">Môn học</div>
        </div>
        <div className="bg-green-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">{filteredBanks.length}</div>
          <div className="text-slate-600 mt-2">Ngân hàng câu hỏi</div>
        </div>
        <div className="bg-yellow-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">{filteredParts.length}</div>
          <div className="text-slate-600 mt-2">Đề thi</div>
        </div>
        <div className="bg-pink-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">{filteredQuestions.length}</div>
          <div className="text-slate-600 mt-2">Câu hỏi</div>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Số lượng đề thi theo môn học</h2>
        <div className="flex gap-2 items-end h-32">
          {partStats.map(stat => (
            <div key={stat.name} className="flex flex-col items-center">
              <div className="bg-sky-400 w-8" style={{height: `${stat.count * 20}px`}}></div>
              <div className="text-xs mt-1 w-16 truncate text-center">{stat.name}</div>
              <div className="text-xs">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Số lượng câu hỏi theo ngân hàng</h2>
        <div className="flex gap-2 items-end h-32">
          {questionStats.map(stat => (
            <div key={stat.name} className="flex flex-col items-center">
              <div className="bg-green-400 w-8" style={{height: `${stat.count * 10}px`}}></div>
              <div className="text-xs mt-1 w-16 truncate text-center">{stat.name}</div>
              <div className="text-xs">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminForm: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'manage-courses':
        return <ManageCourse />;
      case 'manage-parts':
        return <ManagePart />;
      case 'manage-questions':
        return <ManageQuestion />;
      case 'manage-users':
        return <ManageUser />;
      case 'manage-tests':
        return <ManageTests />;
      case 'exam-results':
        return <ExamResults />;
      case 'notification':
        return <Notification />;
      case 'system-settings':
        return <SystemSettings />;
      case 'manage-question-banks':
        return <ManageQuestion />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeItemId={activeSection} 
        onItemClick={setActiveSection} 
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white text-slate-800">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default AdminForm;