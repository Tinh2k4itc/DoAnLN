import React, { useEffect, useState } from 'react';
import { fetchTests, createTest, updateTest, deleteTest, toggleTestStatus, Test } from './TestApi';
import { fetchCourses, Course } from '../manage-course/courseApi';
import { fetchParts, Part } from '../manage-part/PartApi';
import { fetchQuestionBanks, QuestionBank } from '../manage-question/QuestionBankApi';

const emptyTest: Omit<Test, 'id'> = {
  name: '',
  description: '',
  courseId: '',
  courseName: '',
  partId: '',
  partName: '',
  questionBankId: '',
  questionBankName: '',
  totalQuestions: 10,
  timeLimit: 60,
  totalScore: 100,
  difficulty: 'mixed',
  startDate: '',
  endDate: '',
  isActive: true,
  showAnswers: false
};

const ManageTest: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState<Omit<Test, 'id'>>(emptyTest);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [testData, courseData, partData, bankData] = await Promise.all([
        fetchTests(),
        fetchCourses(),
        fetchParts(),
        fetchQuestionBanks()
      ]);
      setTests(testData);
      setCourses(courseData);
      setParts(partData);
      setQuestionBanks(bankData);
      
      if (courseData.length === 0) {
        setLoadError('Không có dữ liệu môn học. Vui lòng tạo môn học trước!');
      } else if (partData.length === 0) {
        setLoadError('Không có dữ liệu bài thi. Vui lòng tạo bài thi trước!');
      } else if (bankData.length === 0) {
        setLoadError('Không có dữ liệu ngân hàng câu hỏi. Vui lòng tạo ngân hàng câu hỏi trước!');
      }
    } catch {
      setLoadError('Lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData(emptyTest);
    setShowCreate(true);
  };

  const handleOpenEdit = (test: Test) => {
    setEditId(test.id);
    setFormData({
      name: test.name,
      description: test.description,
      courseId: test.courseId,
      courseName: test.courseName,
      partId: test.partId,
      partName: test.partName,
      questionBankId: test.questionBankId,
      questionBankName: test.questionBankName,
      totalQuestions: test.totalQuestions,
      timeLimit: test.timeLimit,
      totalScore: test.totalScore,
      difficulty: test.difficulty,
      startDate: test.startDate || '',
      endDate: test.endDate || '',
      isActive: test.isActive,
      showAnswers: test.showAnswers || false
    });
    setShowEdit(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa bài thi này?')) return;
    try {
      await deleteTest(id);
      await loadData();
    } catch {
      alert('Lỗi khi xóa bài thi!');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleTestStatus(id, !isActive);
      await loadData();
    } catch {
      alert('Lỗi khi thay đổi trạng thái bài thi!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalQuestions' || name === 'timeLimit' || name === 'totalScore' 
        ? parseInt(value) || 0 
        : value
    }));

    // Tự động cập nhật tên khi chọn ID
    if (name === 'courseId') {
      const course = courses.find(c => c.id === value);
      setFormData(prev => ({ ...prev, courseName: course ? course.name : '' }));
    }
    if (name === 'partId') {
      const part = parts.find(p => p.id === value);
      setFormData(prev => ({ ...prev, partName: part ? part.name : '' }));
    }
    if (name === 'questionBankId') {
      const bank = questionBanks.find(b => b.id === value);
      setFormData(prev => ({ ...prev, questionBankName: bank ? bank.name : '' }));
    }
  };

  const isDuplicateName = (name: string, courseId: string, ignoreId?: string) => {
    return tests.some(t => t.name.trim().toLowerCase() === name.trim().toLowerCase() && t.courseId === courseId && t.id !== ignoreId);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.partId || !formData.questionBankId) {
      alert('Vui lòng chọn đầy đủ thông tin!');
      return;
    }
    if (isDuplicateName(formData.name, formData.courseId)) {
      alert('Tên bài thi đã tồn tại trong môn học này!');
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('Thời gian bắt đầu phải trước thời gian kết thúc!');
      return;
    }
    try {
      await createTest(formData);
      setShowCreate(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data || 'Lỗi khi tạo bài thi!');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!formData.courseId || !formData.partId || !formData.questionBankId) {
      alert('Vui lòng chọn đầy đủ thông tin!');
      return;
    }
    if (isDuplicateName(formData.name, formData.courseId, editId)) {
      alert('Tên bài thi đã tồn tại trong môn học này!');
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('Thời gian bắt đầu phải trước thời gian kết thúc!');
      return;
    }
    try {
      await updateTest(editId, formData);
      setShowEdit(false);
      setEditId(undefined);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data || 'Lỗi khi cập nhật bài thi!');
    }
  };

  // Lọc danh sách theo tìm kiếm
  const filteredTests = tests.filter(test => {
    const keyword = search.trim().toLowerCase();
    const courseKeyword = searchCourse.trim().toLowerCase();
    
    const matchesSearch = test.name.toLowerCase().includes(keyword) ||
                         test.description.toLowerCase().includes(keyword);
    
    const matchesCourse = !searchCourse || test.courseId === searchCourse;
    
    return matchesSearch && matchesCourse;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Chưa đặt';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getTestStatus = (test: Test) => {
    if (!test.isActive) return { text: 'Tạm khóa', color: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const startDate = test.startDate ? new Date(test.startDate) : null;
    const endDate = test.endDate ? new Date(test.endDate) : null;
    
    if (startDate && endDate) {
      if (now < startDate) {
        return { text: 'Chưa mở', color: 'bg-yellow-100 text-yellow-800' };
      } else if (now > endDate) {
        return { text: 'Đã kết thúc', color: 'bg-red-100 text-red-800' };
      } else {
        return { text: 'Đang mở', color: 'bg-green-100 text-green-800' };
      }
    } else {
      return { text: 'Luôn mở', color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Quản lý bài thi</h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm bài thi..."
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
            disabled={!!loadError}
          >
            + Tạo bài thi
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTests.map(test => {
            const testStatus = getTestStatus(test);
            return (
              <div key={test.id} className="bg-white rounded-lg shadow p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{test.name}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${testStatus.color}`}>
                      {testStatus.text}
                    </span>
                  </div>
                  <div className="text-slate-600 text-sm mb-1">Môn học: <span className="font-mono">{test.courseName}</span></div>
                  <div className="text-slate-600 text-sm mb-1">Bài thi: {test.partName}</div>
                  <div className="text-slate-600 text-sm mb-1">Ngân hàng: {test.questionBankName}</div>
                  <div className="text-slate-600 text-sm mb-1">Số câu: {test.totalQuestions}</div>
                  <div className="text-slate-600 text-sm mb-1">Thời gian: {test.timeLimit} phút</div>
                  <div className="text-slate-600 text-sm mb-1">Điểm: {test.totalScore}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty === 'mixed' ? 'Hỗn hợp' : 
                       test.difficulty === 'easy' ? 'Dễ' :
                       test.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs space-y-1">
                    <div>Bắt đầu: {formatDateTime(test.startDate)}</div>
                    <div>Kết thúc: {formatDateTime(test.endDate)}</div>
                    <div className="flex items-center gap-1">
                      <span>Đáp án:</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${test.showAnswers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {test.showAnswers ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs mt-2">{test.description}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="flex-1 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    onClick={() => handleOpenEdit(test)}
                  >Sửa</button>
                  <button
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => handleToggleStatus(test.id!, test.isActive)}
                  >{test.isActive ? 'Khóa' : 'Mở'}</button>
                  <button
                    className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(test.id)}
                  >Xóa</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tạo bài thi */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowCreate(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Tạo bài thi mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Tên bài thi" 
                className="w-full px-3 py-2 border rounded" 
                required 
              />
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Mô tả bài thi" 
                className="w-full px-3 py-2 border rounded" 
                rows={3}
              />
              
              <select 
                name="courseId" 
                value={formData.courseId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded" 
                required
              >
                <option value="">Chọn môn học</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                ))}
              </select>

              <select 
                name="partId" 
                value={formData.partId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded" 
                required
              >
                <option value="">Chọn bài thi</option>
                {parts.filter(part => !formData.courseId || part.courseId === formData.courseId).map(part => (
                  <option key={part.id} value={part.id}>{part.name}</option>
                ))}
              </select>

              <select 
                name="questionBankId" 
                value={formData.questionBankId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded" 
                required
              >
                <option value="">Chọn ngân hàng câu hỏi</option>
                {questionBanks.filter(bank => !formData.courseId || bank.courseId === formData.courseId).map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  name="totalQuestions" 
                  value={formData.totalQuestions} 
                  onChange={handleChange} 
                  placeholder="Số câu hỏi" 
                  className="w-full px-3 py-2 border rounded" 
                  min={1}
                  required
                />
                <input 
                  type="number" 
                  name="timeLimit" 
                  value={formData.timeLimit} 
                  onChange={handleChange} 
                  placeholder="Thời gian (phút)" 
                  className="w-full px-3 py-2 border rounded" 
                  min={1}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  name="totalScore" 
                  value={formData.totalScore} 
                  onChange={handleChange} 
                  placeholder="Tổng điểm" 
                  className="w-full px-3 py-2 border rounded" 
                  min={1}
                  required
                />
                <select 
                  name="difficulty" 
                  value={formData.difficulty} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded" 
                  required
                >
                  <option value="mixed">Hỗn hợp</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Thời gian mở đề thi</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Thời gian bắt đầu</label>
                    <input 
                      type="datetime-local" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border rounded text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Thời gian kết thúc</label>
                    <input 
                      type="datetime-local" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border rounded text-sm" 
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Để trống nếu muốn đề thi luôn mở</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showAnswers"
                  name="showAnswers"
                  checked={formData.showAnswers}
                  onChange={(e) => setFormData(prev => ({ ...prev, showAnswers: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="showAnswers" className="text-sm font-medium text-gray-700">
                  Hiển thị đáp án sau khi học sinh làm xong bài
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => setShowCreate(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa bài thi */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowEdit(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa bài thi</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Tên bài thi" 
                className="w-full px-3 py-2 border rounded" 
                required 
              />
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Mô tả bài thi" 
                className="w-full px-3 py-2 border rounded" 
                rows={3}
              />
              
              <select 
                name="courseId" 
                value={formData.courseId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded" 
                required
              >
                <option value="">Chọn môn học</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                ))}
              </select>

              <select 
                name="partId" 
                value={formData.partId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded" 
                required
              >
                <option value="">Chọn bài thi</option>
                {parts.filter(part => !formData.courseId || part.courseId === formData.courseId).map(part => (
                  <option key={part.id} value={part.id}>{part.name}</option>
                ))}
              </select>

              <select 
                name="questionBankId" 
                value={formData.questionBankId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded" 
                required
              >
                <option value="">Chọn ngân hàng câu hỏi</option>
                {questionBanks.filter(bank => !formData.courseId || bank.courseId === formData.courseId).map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  name="totalQuestions" 
                  value={formData.totalQuestions} 
                  onChange={handleChange} 
                  placeholder="Số câu hỏi" 
                  className="w-full px-3 py-2 border rounded" 
                  min={1}
                  required
                />
                <input 
                  type="number" 
                  name="timeLimit" 
                  value={formData.timeLimit} 
                  onChange={handleChange} 
                  placeholder="Thời gian (phút)" 
                  className="w-full px-3 py-2 border rounded" 
                  min={1}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  name="totalScore" 
                  value={formData.totalScore} 
                  onChange={handleChange} 
                  placeholder="Tổng điểm" 
                  className="w-full px-3 py-2 border rounded" 
                  min={1}
                  required
                />
                <select 
                  name="difficulty" 
                  value={formData.difficulty} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded" 
                  required
                >
                  <option value="mixed">Hỗn hợp</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Thời gian mở đề thi</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Thời gian bắt đầu</label>
                    <input 
                      type="datetime-local" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border rounded text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Thời gian kết thúc</label>
                    <input 
                      type="datetime-local" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border rounded text-sm" 
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Để trống nếu muốn đề thi luôn mở</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showAnswers"
                  name="showAnswers"
                  checked={formData.showAnswers}
                  onChange={(e) => setFormData(prev => ({ ...prev, showAnswers: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="showAnswers" className="text-sm font-medium text-gray-700">
                  Hiển thị đáp án sau khi học sinh làm xong bài
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTest; 