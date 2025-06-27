import React, { useEffect, useState } from 'react';
import { fetchQuestionBanks, createQuestionBank, deleteQuestionBank, QuestionBank } from './QuestionBankApi';
import { fetchCourses, Course } from '../manage-course/courseApi';
import QuestionForm from './QuestionForm';
import ImportQuestionExcel from './ImportQuestionExcel';
import QuestionList from './QuestionList';

const emptyBank: Omit<QuestionBank, 'id'|'totalQuestions'|'easyCount'|'mediumCount'|'hardCount'> = {
  name: '',
  courseId: '',
  courseName: '',
  description: ''
};

const ManageQuestion: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState(emptyBank);
  const [search, setSearch] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState<{ open: boolean; bankId: string | null }>({ open: false, bankId: null });
  const [showImportExcel, setShowImportExcel] = useState<{ open: boolean; bankId: string | null }>({ open: false, bankId: null });
  const [showQuestionList, setShowQuestionList] = useState<{ open: boolean; bankId: string | null }>({ open: false, bankId: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bankData, courseData] = await Promise.all([
        fetchQuestionBanks(search, searchCourse),
        fetchCourses()
      ]);
      setBanks(bankData);
      setCourses(courseData);
    } catch {
      alert('Lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [search, searchCourse]);

  const handleOpenCreate = () => {
    setFormData(emptyBank);
    setShowCreate(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Nếu chọn courseId thì tự động set courseName
    if (name === 'courseId') {
      const course = courses.find(c => c.id === value);
      setFormData(prev => ({ ...prev, courseName: course ? course.name : '' }));
    }
    // Nếu chọn courseName thì tự động set courseId
    if (name === 'courseName') {
      const course = courses.find(c => c.name === value);
      setFormData(prev => ({ ...prev, courseId: course && course.id ? course.id : '' }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.courseId) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      await createQuestionBank(formData);
      setShowCreate(false);
      await loadData();
    } catch {
      alert('Lỗi khi tạo ngân hàng đề!');
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa ngân hàng đề này?')) return;
    try {
      await deleteQuestionBank(id);
      await loadData();
    } catch {
      alert('Lỗi khi xóa ngân hàng đề!');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Quản lý ngân hàng đề</h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên ngân hàng đề..."
            className="px-3 py-2 border rounded w-full sm:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 border rounded w-full sm:w-64"
            value={searchCourse}
            onChange={e => setSearchCourse(e.target.value)}
          >
            <option value="">Tất cả môn học</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 focus:outline-none"
            onClick={handleOpenCreate}
          >
            + Tạo ngân hàng đề
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-slate-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {banks.map(bank => (
            <div key={bank.id} className="bg-white rounded-lg shadow p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{bank.name}</h2>
                <div className="text-slate-600 text-sm mb-1">Môn học: <span className="font-mono">{bank.courseName}</span></div>
                <div className="text-slate-600 text-sm mb-1">Mã môn học: {bank.courseId}</div>
                <div className="text-slate-600 text-sm mb-1">Tổng số câu hỏi: {bank.totalQuestions ?? 0}</div>
                <div className="text-slate-600 text-sm mb-1">Dễ: {bank.easyCount ?? 0} | Trung bình: {bank.mediumCount ?? 0} | Khó: {bank.hardCount ?? 0}</div>
                <div className="text-slate-500 text-xs mt-2">{bank.description}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => setShowQuestionForm({ open: true, bankId: bank.id! })}>Thêm câu hỏi</button>
                <button className="flex-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setShowImportExcel({ open: true, bankId: bank.id! })}>Import Excel</button>
                <button className="flex-1 px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600" onClick={() => setShowQuestionList({ open: true, bankId: bank.id! })}>Xem câu hỏi</button>
                <button className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDelete(bank.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo ngân hàng đề */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowCreate(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Tạo ngân hàng đề</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên ngân hàng đề" className="w-full px-3 py-2 border rounded" required />
              <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
                <option value="">Chọn mã môn học</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                ))}
              </select>
              <input type="text" name="courseName" value={formData.courseName} onChange={handleChange} placeholder="Tên môn học" className="w-full px-3 py-2 border rounded" required />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả ngắn" className="w-full px-3 py-2 border rounded" />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => setShowCreate(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm câu hỏi */}
      {showQuestionForm.open && showQuestionForm.bankId && (
        <QuestionForm
          bankId={showQuestionForm.bankId}
          onSuccess={async () => {
            setShowQuestionForm({ open: false, bankId: null });
            await loadData();
          }}
          onClose={() => setShowQuestionForm({ open: false, bankId: null })}
        />
      )}

      {/* Modal Import Excel */}
      {showImportExcel.open && showImportExcel.bankId && (
        <ImportQuestionExcel
          bankId={showImportExcel.bankId}
          onSuccess={async () => {
            setShowImportExcel({ open: false, bankId: null });
            await loadData();
          }}
          onClose={() => setShowImportExcel({ open: false, bankId: null })}
        />
      )}

      {showQuestionList.open && showQuestionList.bankId && (
        <QuestionList
          bankId={showQuestionList.bankId}
          onClose={async () => {
            setShowQuestionList({ open: false, bankId: null });
            await loadData();
          }}
        />
      )}
    </div>
  );
};

export default ManageQuestion; 