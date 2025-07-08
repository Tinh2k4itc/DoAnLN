import React, { useEffect, useState } from 'react';
import { fetchParts, createPart, updatePart, deletePart, Part } from './PartApi';
import { fetchCourses, Course } from '../manage-course/courseApi';
import { fetchQuestionBanks, QuestionBank } from '../manage-question/QuestionBankApi';
import { fetchQuestions, Question, updateQuestion, deleteQuestion } from '../manage-question/QuestionApi';

const emptyPart: Omit<Part, 'id'> = {
  name: '',
  description: '',
  duration: 60,
  courseId: '',
  maxRetake: 1,
  randomizeQuestions: true,
  enableAntiCheat: false,
  enableTabWarning: false,
  openTime: '',
  closeTime: '',
  showAnswerAfterSubmit: false
};

interface QuestionInTest {
  id: string;
  content: string;
  level: string;
  score: number;
  options?: any[];
  answer?: string;
}

interface ManagePartProps {
  courseId?: string;
}

const ManagePart: React.FC<ManagePartProps> = ({ courseId }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState<Omit<Part, 'id'>>(emptyPart);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [selectMode, setSelectMode] = useState<'manual'|'auto'>('manual');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [autoEasy, setAutoEasy] = useState(0);
  const [autoMedium, setAutoMedium] = useState(0);
  const [autoHard, setAutoHard] = useState(0);
  const [score, setScore] = useState(10);
  const [questionScores, setQuestionScores] = useState<{[id: string]: number}>({});
  const [totalScore, setTotalScore] = useState(10);
  const [scoreMode, setScoreMode] = useState<'total'|'per-question'>('total');
  const [showView, setShowView] = useState<{open: boolean, part: Part|null}>({open: false, part: null});
  const [editingQuestion, setEditingQuestion] = useState<any|null>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<string[]>([]);
  const [showSelectQuestionModal, setShowSelectQuestionModal] = useState(false);
  const [tempSelectedQuestions, setTempSelectedQuestions] = useState<Question[]>([]);
  const [editingModalQuestion, setEditingModalQuestion] = useState<Question|null>(null);

  const defaultOptions = {
    truefalse: [
      { text: 'Đúng', correct: true },
      { text: 'Sai', correct: false }
    ],
    single: [
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false }
    ],
    multiple: [
      { text: '', correct: false },
      { text: '', correct: false }
    ]
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [partData, courseData] = await Promise.all([
        fetchParts(),
        fetchCourses()
      ]);
      setParts(partData);
      setCourses(courseData);
      if (courseData.length === 0) {
        setLoadError('Không có dữ liệu môn học. Vui lòng tạo môn học trước khi tạo bài thi!');
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

  useEffect(() => {
    if (formData.courseId) {
      fetchQuestionBanks('', formData.courseId).then(setQuestionBanks);
    }
  }, [formData.courseId]);

  useEffect(() => {
    if (selectedBankId) {
      fetchQuestions(selectedBankId).then(setQuestions);
    }
  }, [selectedBankId]);

  const handleOpenCreate = () => {
    setFormData(courseId ? { ...emptyPart, courseId } : emptyPart);
    setShowCreate(true);
  };

  const handleOpenEdit = (part: Part) => {
    setEditId(part.id);
    setFormData({
      name: part.name,
      description: part.description,
      duration: part.duration,
      courseId: part.courseId,
      maxRetake: part.maxRetake,
      randomizeQuestions: part.randomizeQuestions,
      enableAntiCheat: part.enableAntiCheat,
      enableTabWarning: part.enableTabWarning,
      openTime: part.openTime || '',
      closeTime: part.closeTime || '',
      showAnswerAfterSubmit: part.showAnswerAfterSubmit ?? false
    });
    setShowEdit(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa bài thi này?')) return;
    try {
      await deletePart(id);
      await loadData();
    } catch {
      alert('Lỗi khi xóa bài thi!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
    if (name === 'courseId') {
      setSelectedBankId('');
      setQuestions([]);
      setSelectedQuestions([]);
      setAutoEasy(0);
      setAutoMedium(0);
      setAutoHard(0);
    }
  };

  const isDuplicateName = (name: string, courseId: string, ignoreId?: string) => {
    return parts.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && p.courseId === courseId && p.id !== ignoreId);
  };

  const handleToggleQuestion = (q: Question) => {
    setSelectedQuestions(prev => {
      const id = q.id?.toString() || '';
      const exists = prev.some(x => x.id === id);
      if (exists) {
        const filtered = prev.filter(x => x.id !== id);
        const newScores = {...questionScores};
        delete newScores[id];
        setQuestionScores(newScores);
        return filtered;
      } else {
        setQuestionScores(s => ({...s, [id]: 1}));
        return [...prev, {...q, id, options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined, answer: q.answer}];
      }
    });
  };

  const handleAutoSelect = () => {
    const easy = questions.filter(q => q.level === 'easy');
    const medium = questions.filter(q => q.level === 'medium');
    const hard = questions.filter(q => q.level === 'hard');
    const selected = [
      ...easy.slice(0, autoEasy),
      ...medium.slice(0, autoMedium),
      ...hard.slice(0, autoHard)
    ].map(q => ({...q, id: q.id?.toString() || '', options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined, answer: q.answer}));
    setSelectedQuestions(selected);
    const newScores: {[id: string]: number} = {};
    selected.forEach(q => { newScores[q.id] = 1; });
    setQuestionScores(newScores);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
      alert('Vui lòng chọn môn học!');
      return;
    }
    if (isDuplicateName(formData.name, formData.courseId)) {
      alert('Tên bài thi đã tồn tại trong môn học này!');
      return;
    }
    if (selectedQuestions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi cho bài thi!');
      return;
    }
    let questionsToSave: QuestionInTest[] = selectedQuestions.map(q => ({
      id: q.id?.toString() || '',
      content: q.content,
      level: q.level,
      score: scoreMode==='per-question' ? questionScores[q.id?.toString() || ''] || 1 : +(totalScore/selectedQuestions.length).toFixed(2),
      options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined,
      answer: q.answer
    }));
    try {
      await createPart({ ...formData, questions: questionsToSave, score: scoreMode==='total' ? totalScore : questionsToSave.reduce((a,b)=>a+b.score,0) });
      setShowCreate(false);
      setStep(1);
      setSelectedQuestions([]);
      setQuestionScores({});
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data || 'Lỗi khi tạo bài thi!');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!formData.courseId) {
      alert('Vui lòng chọn môn học!');
      return;
    }
    if (isDuplicateName(formData.name, formData.courseId, editId)) {
      alert('Tên bài thi đã tồn tại trong môn học này!');
      return;
    }
    try {
      await updatePart(editId, formData);
      setShowEdit(false);
      setEditId(undefined);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data || 'Lỗi khi cập nhật bài thi!');
    }
  };

  const filteredParts = courseId ? parts.filter(p => p.courseId === courseId) : parts.filter(part => {
    const keyword = search.trim().toLowerCase();
    const course = courses.find(c => c.id === part.courseId);
    return (
      part.name.toLowerCase().includes(keyword) ||
      (course && course.name.toLowerCase().includes(keyword)) ||
      (course && course.code.toLowerCase().includes(keyword))
    );
  });

  const handleView = (part: Part) => {
    setShowView({open: true, part});
    setEditingQuestion(null);
    setAddingQuestion(false);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!showView.part) return;
    const newQuestions = (showView.part.questions || []).filter((q: any) => q.id !== qId);
    await updatePart(String(showView.part.id), {...showView.part, questions: newQuestions});
    setShowView({open: true, part: {...showView.part, questions: newQuestions}});
  };

  const handleSaveEditQuestion = async (q: any) => {
    if (!showView.part) return;
    const newQuestions = (showView.part.questions || []).map((item: any) => item.id === q.id ? q : item);
    await updatePart(String(showView.part.id), {...showView.part, questions: newQuestions});
    setShowView({open: true, part: {...showView.part, questions: newQuestions}});
    setEditingQuestion(null);
  };

  const handleAddQuestion = async (q: any) => {
    if (!showView.part) return;
    const newQuestions = [...(showView.part.questions || []), q];
    await updatePart(String(showView.part.id), {...showView.part, questions: newQuestions});
    setShowView({open: true, part: {...showView.part, questions: newQuestions}});
    setAddingQuestion(false);
  };

  const handleOpenBankModal = async () => {
    if (!selectedBankId) return;
    const qs = await fetchQuestions(selectedBankId);
    setBankQuestions(qs);
    setSelectedBankQuestions([]);
    setShowBankModal(true);
  };

  const handleAddFromBank = async () => {
    if (!showView.part) return;
    const toAdd = bankQuestions.filter(q => selectedBankQuestions.includes(String(q.id)));
    const newQuestions = [...(showView.part.questions || []), ...toAdd];
    await updatePart(String(showView.part.id), {...showView.part, questions: newQuestions});
    setShowView({open: true, part: {...showView.part, questions: newQuestions}});
    setShowBankModal(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Quản lý bài thi</h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm bài thi, tên hoặc mã môn học..."
              className="pl-10 pr-3 py-2 border rounded-2xl w-full focus:ring-2 focus:ring-sky-300 transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className="px-4 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 focus:outline-none text-base font-semibold"
            onClick={handleOpenCreate}
          >
            + Thêm bài thi
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-slate-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {parts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center text-gray-400 mt-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4h4m-4 0H7" /></svg>
              <span className="text-lg">Chưa có bài thi nào</span>
            </div>
          ) : (
            parts.map(part => {
              const course = courses.find(c => c.id === part.courseId);
              return (
                <div
                  key={part.id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col min-h-[220px] transition-transform hover:scale-105 hover:shadow-2xl border border-slate-100 relative"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-sky-100 text-sky-600 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7" /></svg>
                    </div>
                    <div>
                      <div className="font-bold text-xl mb-1">{part.name}</div>
                      <div className="text-gray-600 text-sm">Môn học: <span className="font-semibold">{course?.name || ''}</span></div>
                      <div className="text-gray-600 text-sm">Mã môn học: <span className="font-semibold">{course?.code || ''}</span></div>
                      <div className="text-gray-600 text-sm">Thời gian: <span className="font-semibold">{part.duration} phút</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => handleOpenEdit(part)}>Chỉnh sửa</button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(part.id)}>Xóa</button>
                    <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => handleView(part)}>Xem đề thi</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => {
                setShowCreate(false);
                setStep(1);
                setSelectedQuestions([]);
                setQuestionScores({});
              }}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Thêm bài thi</h2>
            <div className="flex gap-2 mb-6">
              <div className={`flex-1 text-center py-2 rounded ${step===1?'bg-sky-600 text-white':'bg-slate-200'}`}>1. Thông tin</div>
              <div className={`flex-1 text-center py-2 rounded ${step===2?'bg-sky-600 text-white':'bg-slate-200'}`}>2. Chọn câu hỏi</div>
              <div className={`flex-1 text-center py-2 rounded ${step===3?'bg-sky-600 text-white':'bg-slate-200'}`}>3. Thiết lập điểm</div>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="block font-medium">Tên bài thi</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên bài thi" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Nhập mô tả" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Thời gian làm bài (phút)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="Thời gian (phút)" className="w-full px-3 py-2 border rounded" min={1} />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Môn học</label>
                    <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
                      <option value="">Chọn môn học</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Số lần thi lại tối đa</label>
                    <input type="number" name="maxRetake" value={formData.maxRetake ?? 1} onChange={handleChange} placeholder="Số lần thi lại tối đa" className="w-full px-3 py-2 border rounded" min={0} />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Thời gian mở đề thi</label>
                    <input type="datetime-local" name="openTime" value={formData.openTime || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Thời gian đóng đề thi</label>
                    <input type="datetime-local" name="closeTime" value={formData.closeTime || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div className="flex gap-6 items-center mt-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="randomizeQuestions" checked={!!formData.randomizeQuestions} onChange={e => setFormData(f => ({ ...f, randomizeQuestions: e.target.checked }))} />
                      Random câu hỏi
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="enableAntiCheat" checked={!!formData.enableAntiCheat} onChange={e => setFormData(f => ({ ...f, enableAntiCheat: e.target.checked }))} />
                      Chống gian lận
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="enableTabWarning" checked={!!formData.enableTabWarning} onChange={e => setFormData(f => ({ ...f, enableTabWarning: e.target.checked }))} />
                      Cảnh báo chuyển tab
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      name="showAnswerAfterSubmit"
                      checked={!!formData.showAnswerAfterSubmit}
                      onChange={e => setFormData(f => ({ ...f, showAnswerAfterSubmit: e.target.checked }))}
                    />
                    <label className="font-medium" htmlFor="showAnswerAfterSubmit">Hiển thị đáp án sau khi nộp bài</label>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded" onClick={() => setStep(2)} disabled={!formData.name || !formData.courseId}>Tiếp tục</button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setSelectMode('auto')} className={selectMode==='auto'?'bg-sky-600 text-white px-3 py-1 rounded':'bg-slate-200 px-3 py-1 rounded'}>Chọn tự động</button>
                    <button type="button" onClick={() => setSelectMode('manual')} className={selectMode==='manual'?'bg-sky-600 text-white px-3 py-1 rounded':'bg-slate-200 px-3 py-1 rounded'}>Chọn thủ công</button>
                  </div>
                  {selectMode==='auto' && (
                    <>
                      <div className="space-y-2 mb-2">
                        <label className="block font-medium">Ngân hàng đề</label>
                        <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} className="w-full border rounded mb-2">
                          <option value="">Chọn ngân hàng đề</option>
                          {questionBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <div className="mt-2">Tổng số câu đã chọn: {selectedQuestions.length}</div>
                      </div>
                    </>
                  )}
                  {selectMode==='manual' && (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1 bg-green-600 text-white rounded mb-2"
                        onClick={() => {
                          setEditingQuestion({
                            content: '',
                            type: 'truefalse',
                            level: 'easy',
                            options: defaultOptions['truefalse'],
                          });
                          setAddingQuestion(true);
                        }}
                      >
                        + Thêm câu hỏi thủ công
                      </button>
                      <div className="mt-2">Tổng số câu đã thêm: {selectedQuestions.length}</div>
                      <ul className="space-y-2 mt-2">
                        {selectedQuestions.map((q, idx) => (
                          <li key={q.id || idx} className="border rounded p-3 bg-slate-50 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{idx+1}. {q.content} <span className="ml-2 text-xs text-slate-500">({q.level})</span></span>
                              <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={()=>setEditingQuestion({...q, idx})}>Sửa</button>
                              <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>setSelectedQuestions(selectedQuestions.filter((_: any, i: number) => i !== idx))}>Xóa</button>
                            </div>
                            {editingQuestion && (editingQuestion.options || []).map((opt: any, i: number) => (
                              <li key={i} className={opt.correct ? 'font-bold text-green-600' : ''}>
                                {String.fromCharCode(65+i)}. {opt.text} {opt.correct ? '(Đúng)' : ''}
                              </li>
                            ))}
                            {typeof editingQuestion?.answer === 'string' && editingQuestion?.answer && !editingQuestion?.options && (
                              <div className="pl-8 text-green-700 font-bold">Đáp án: {editingQuestion?.answer}</div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {addingQuestion && editingQuestion && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                            <button
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                              onClick={() => {
                                setAddingQuestion(false);
                                setEditingQuestion(null);
                              }}
                              aria-label="Đóng"
                            >
                              ×
                            </button>
                            <h3 className="text-2xl font-bold mb-6 text-center">Thêm câu hỏi thủ công</h3>
                            <form onSubmit={async e => {
                              e.preventDefault();
                              if (!editingQuestion?.content || !editingQuestion?.level) { alert('Vui lòng nhập đủ nội dung và mức độ!'); return; }
                              if (editingQuestion.type==='single' && (!editingQuestion.options || editingQuestion.options.filter((o:any)=>o.correct).length !== 1)) { alert('Phải chọn đúng 1 đáp án đúng!'); return; }
                              if (editingQuestion.type==='multiple' && (!editingQuestion.options || editingQuestion.options.filter((o:any)=>o.correct).length < 1)) { alert('Phải chọn ít nhất 1 đáp án đúng!'); return; }
                              if ((editingQuestion.type==='single' || editingQuestion.type==='multiple') && (!editingQuestion.options || editingQuestion.options.some((o:any)=>!o.text))) { alert('Vui lòng nhập đầy đủ đáp án!'); return; }
                              if (showView.open && showView.part) {
                                const newQuestions = [...(showView.part.questions || []), { ...editingQuestion, id: Date.now().toString() }];
                                await updatePart(String(showView.part.id), { ...showView.part, questions: newQuestions });
                                setShowView({ open: true, part: { ...showView.part, questions: newQuestions } });
                              }
                              setEditingQuestion(null);
                              setAddingQuestion(false);
                            }} className="space-y-4">
                              <div>
                                <label className="block font-medium mb-1">Nội dung câu hỏi</label>
                                <textarea className="w-full border rounded px-3 py-2" placeholder="Nhập nội dung câu hỏi" value={editingQuestion?.content || ''} onChange={e=>setEditingQuestion({...editingQuestion, content: e.target.value})} required />
                              </div>
                              <div className="flex gap-2">
                                <select className="px-3 py-2 border rounded" value={editingQuestion?.type || 'truefalse'} onChange={e => {
                                  if (!editingQuestion) return;
                                  const t = e.target.value as 'truefalse' | 'single' | 'multiple';
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    type: t,
                                    options: defaultOptions[t]
                                  });
                                }}>
                                  <option value="truefalse">Đúng/Sai</option>
                                  <option value="single">1 đáp án đúng</option>
                                  <option value="multiple">Nhiều đáp án đúng</option>
                                </select>
                                <select className="px-3 py-2 border rounded" value={editingQuestion?.level || 'easy'} onChange={e=>{
                                  if (!editingQuestion) return;
                                  setEditingQuestion({...editingQuestion, level: e.target.value as 'easy'|'medium'|'hard'});
                                }}>
                                  <option value="easy">Dễ</option>
                                  <option value="medium">Trung bình</option>
                                  <option value="hard">Khó</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                {(editingQuestion.options || []).map((opt:any, idx:number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    {editingQuestion.type !== 'truefalse' && (
                                      <span className="text-slate-500">{String.fromCharCode(65 + idx)}.</span>
                                    )}
                                    <input
                                      type="text"
                                      value={opt.text}
                                      onChange={e => {
                                        const opts = [...(editingQuestion.options||[])];
                                        opts[idx].text = e.target.value;
                                        setEditingQuestion({...editingQuestion, options: opts});
                                      }}
                                      className="flex-1 px-3 py-2 border rounded"
                                      placeholder={editingQuestion.type === 'truefalse' ? (idx === 0 ? 'Đúng' : 'Sai') : 'Đáp án'}
                                      required
                                      disabled={editingQuestion.type === 'truefalse'}
                                    />
                                    <input
                                      type={editingQuestion.type === 'multiple' ? 'checkbox' : 'radio'}
                                      checked={opt.correct}
                                      onChange={() => {
                                        if (editingQuestion.type === 'single' || editingQuestion.type === 'truefalse') {
                                          setEditingQuestion({...editingQuestion, options: (editingQuestion.options||[]).map((o:any, i:number) => ({ ...o, correct: i === idx }))});
                                        } else {
                                          setEditingQuestion({...editingQuestion, options: (editingQuestion.options||[]).map((o:any, i:number) => i === idx ? { ...o, correct: !o.correct } : o)});
                                        }
                                      }}
                                      name="correct"
                                    />
                                    {editingQuestion.type === 'multiple' && editingQuestion.options.length > 2 && (
                                      <button type="button" className="text-red-500" onClick={() => {
                                        setEditingQuestion({...editingQuestion, options: (editingQuestion.options||[]).filter((_: any, i: number) => i !== idx)});
                                      }}>X</button>
                                    )}
                                  </div>
                                ))}
                                {editingQuestion.type === 'multiple' && (
                                  <button type="button" className="px-2 py-1 bg-slate-200 rounded" onClick={() => {
                                    setEditingQuestion({...editingQuestion, options:[...(editingQuestion.options||[]),{text:'',correct:false}]});
                                  }}>+ Thêm đáp án</button>
                                )}
                              </div>
                              <div className="flex justify-end gap-2 mt-8">
                                <button type="button" className="px-5 py-2 bg-slate-200 rounded font-semibold" onClick={()=>{setAddingQuestion(false);setEditingQuestion(null);}}>Hủy</button>
                                <button type="submit" className="px-5 py-2 bg-sky-600 text-white rounded font-semibold">Lưu</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={()=>setStep(1)}>Quay lại</button>
                    <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded" onClick={()=>setStep(3)} disabled={selectedQuestions.length===0}>Tiếp tục</button>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={()=>setScoreMode('total')} className={scoreMode==='total'?'bg-sky-600 text-white px-3 py-1 rounded':'bg-slate-200 px-3 py-1 rounded'}>Tổng điểm</button>
                    <button type="button" onClick={()=>setScoreMode('per-question')} className={scoreMode==='per-question'?'bg-sky-600 text-white px-3 py-1 rounded':'bg-slate-200 px-3 py-1 rounded'}>Điểm từng câu</button>
                  </div>
                  {scoreMode==='total' ? (
                    <input type="number" value={totalScore} onChange={e=>setTotalScore(+e.target.value)} placeholder="Tổng điểm bài thi" className="border rounded px-2" />
                  ) : (
                    <ul className="max-h-48 overflow-y-auto border rounded p-2">
                      {selectedQuestions.map(q=>(
                        <li key={q.id} className="flex items-center gap-2">
                          <span>{q.content} ({q.level})</span>
                          <input type="number" value={questionScores[q.id?.toString()||'']||1} min={1} onChange={e=>setQuestionScores(s=>({...s,[q.id?.toString()||'']: +e.target.value}))} className="border rounded px-2 w-16" />
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={()=>setStep(2)}>Quay lại</button>
                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Lưu bài thi</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowEdit(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa bài thi</h2>
            {loadError ? (
              <div className="text-red-500 mb-4">{loadError}</div>
            ) : null}
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên bài thi" className="w-full px-3 py-2 border rounded" required disabled={!!loadError} />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="w-full px-3 py-2 border rounded" disabled={!!loadError} />
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="Thời gian (phút)" className="w-full px-3 py-2 border rounded" min={1} disabled={!!loadError} />
              {courses.length > 0 ? (
                <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={!!loadError}>
                  <option value="">Chọn môn học</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                  ))}
                </select>
              ) : (
                <div className="text-slate-500">Không có môn học nào để chọn.</div>
              )}
              <input type="number" name="maxRetake" value={formData.maxRetake ?? 1} onChange={handleChange} placeholder="Số lần thi lại tối đa" className="w-full px-3 py-2 border rounded" min={0} />
              <div className="space-y-2">
                <label className="block font-medium">Thời gian mở đề thi</label>
                <input type="datetime-local" name="openTime" value={formData.openTime || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Thời gian đóng đề thi</label>
                <input type="datetime-local" name="closeTime" value={formData.closeTime || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="flex gap-4 items-center mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="randomizeQuestions" checked={!!formData.randomizeQuestions} onChange={e => setFormData(f => ({ ...f, randomizeQuestions: e.target.checked }))} />
                  Random câu hỏi
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="enableAntiCheat" checked={!!formData.enableAntiCheat} onChange={e => setFormData(f => ({ ...f, enableAntiCheat: e.target.checked }))} />
                  Chống gian lận
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="enableTabWarning" checked={!!formData.enableTabWarning} onChange={e => setFormData(f => ({ ...f, enableTabWarning: e.target.checked }))} />
                  Cảnh báo chuyển tab
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700" disabled={!!loadError || courses.length === 0}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView.open && showView.part && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowView({open: false, part: null})}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Chi tiết bài thi: {showView.part.name}</h2>
            <div className="mb-4 text-slate-600">
              <div><b>Tổng điểm:</b> {showView.part.score}</div>
              <div><b>Thời gian làm bài:</b> {showView.part.duration} phút</div>
              <div><b>Số lần thi lại tối đa:</b> {showView.part.maxRetake ?? 'Không giới hạn'}</div>
              <div><b>Random câu hỏi:</b> {showView.part.randomizeQuestions ? 'Có' : 'Không'}</div>
              <div><b>Chống gian lận:</b> {showView.part.enableAntiCheat ? 'Có' : 'Không'}</div>
              <div><b>Cảnh báo chuyển tab:</b> {showView.part.enableTabWarning ? 'Có' : 'Không'}</div>
            </div>
            <div className="flex gap-4 mb-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded font-semibold" type="button" onClick={()=>{ setEditingQuestion({ content: '', type: 'truefalse', level: 'easy', options: defaultOptions['truefalse'] }); setAddingQuestion(true); }}>
                + Thêm thủ công
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold" type="button" onClick={()=>setShowBankModal(true)}>
                + Thêm từ ngân hàng đề
              </button>
            </div>
            <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
              {(showView.part.questions||[]).map((q: any, idx: number) => (
                <li key={q.id} className="border rounded p-3 flex flex-col gap-1 bg-slate-50">
                  <div className="font-semibold">{idx + 1}. {q.content}</div>
                  <div className="text-xs text-slate-500">Loại: {q.type} | Độ khó: {q.level}</div>
                  {q.options && (
                    <ul className="pl-4 text-sm">
                      {q.options.map((opt: any, i: number) => (
                        <li key={i} className={opt.correct ? 'text-green-600 font-bold' : ''}>
                          {q.type !== 'truefalse' ? String.fromCharCode(65 + i) + '. ' : ''}{opt.text} {opt.correct ? '(Đúng)' : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.answer && !q.options && (
                    <div className="pl-4 text-green-700 font-bold">Đáp án: {q.answer}</div>
                  )}
                  <div className="flex gap-2 self-end mt-2">
                    <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={()=>setEditingQuestion(q)}>Sửa</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={()=>handleDeleteQuestion(q.id)}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
            {showBankModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                    onClick={() => setShowBankModal(false)}
                    aria-label="Đóng"
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-bold mb-4">Chọn ngân hàng đề</h3>
                  <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} className="w-full border rounded mb-4">
                    <option value="">Chọn ngân hàng đề</option>
                    {questionBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={()=>setShowBankModal(false)}>Hủy</button>
                    <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded" onClick={async()=>{
                      if (!selectedBankId) { alert('Vui lòng chọn ngân hàng đề!'); return; }
                      await fetchQuestions(selectedBankId).then(setQuestions);
                      setShowBankModal(false);
                      setShowSelectQuestionModal(true);
                    }}>Tiếp tục</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowBankModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Chọn câu hỏi từ ngân hàng đề</h3>
            <ul className="max-h-64 overflow-y-auto border rounded p-2 mb-4">
              {bankQuestions.map(q=>(
                <li key={q.id} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={selectedBankQuestions.includes(String(q.id))} onChange={()=>setSelectedBankQuestions(sel=>{
                    const idStr = String(q.id);
                    if (sel.includes(idStr)) return sel.filter(id=>id!==idStr).filter(Boolean);
                    return [...sel, idStr].filter(Boolean);
                  })} />
                  <span>{q.content} ({q.level})</span>
                  {(q as any).options && (
                    <ul className="pl-4">
                      {(q as any).options.map((opt: any, i: number) => (
                        <li key={i} className={opt.correct ? 'font-bold text-green-600' : ''}>
                          {String.fromCharCode(65+i)}. {opt.text} {opt.correct ? '(Đúng)' : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  {typeof (q as any).answer === 'string' && (q as any).answer && !q.options && (
                    <div className="text-green-700 font-bold">Đáp án: {(q as any).answer}</div>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={()=>setShowBankModal(false)}>Hủy</button>
              <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handleAddFromBank} disabled={selectedBankQuestions.length===0}>Thêm vào đề</button>
            </div>
          </div>
        </div>
      )}

      {showSelectQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => setShowSelectQuestionModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Chọn câu hỏi cho đề thi</h2>
            <ul className="space-y-4">
              {questions.map((q, idx) => (
                <li key={q.id} className="border rounded p-3 bg-slate-50 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={tempSelectedQuestions.some(x=>x.id===q.id)} onChange={()=>{
                      if(tempSelectedQuestions.some(x=>x.id===q.id)) setTempSelectedQuestions(tempSelectedQuestions.filter(x=>x.id!==q.id));
                      else setTempSelectedQuestions([...tempSelectedQuestions, {...q}]);
                    }} />
                    <span className="font-semibold">{idx+1}. {q.content} <span className="ml-2 text-xs text-slate-500">({q.level})</span></span>
                    <button className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded" onClick={()=>setEditingModalQuestion(q)}>Chỉnh sửa</button>
                  </div>
                  {editingModalQuestion && (editingModalQuestion.options || []).map((opt: any, i: number) => (
                    <li key={i} className={opt.correct ? 'font-bold text-green-600' : ''}>
                      {String.fromCharCode(65+i)}. {opt.text} {opt.correct ? '(Đúng)' : ''}
                    </li>
                  ))}
                  {typeof editingModalQuestion?.answer === 'string' && editingModalQuestion?.answer && !editingModalQuestion?.options && (
                    <div className="pl-8 text-green-700 font-bold">Đáp án: {editingModalQuestion?.answer}</div>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={()=>setShowSelectQuestionModal(false)}>Hủy</button>
              <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded" onClick={()=>{
                setSelectedQuestions(tempSelectedQuestions);
                setShowSelectQuestionModal(false);
              }}>Xác nhận chọn</button>
            </div>
            {editingModalQuestion && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                    onClick={() => setEditingModalQuestion(null)}
                    aria-label="Đóng"
                  >
                    ×
                  </button>
                  <h3 className="text-2xl font-bold mb-6 text-center">Sửa câu hỏi thủ công</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Nội dung câu hỏi</label>
                      <textarea className="w-full border rounded px-3 py-2" placeholder="Nhập nội dung câu hỏi" value={editingModalQuestion.content} onChange={e=>setEditingModalQuestion({...editingModalQuestion, content: e.target.value})} required />
                    </div>
                    <div className="flex gap-2">
                      <select className="px-3 py-2 border rounded" value={editingModalQuestion.type || 'truefalse'} onChange={e => {
                        if (!editingModalQuestion) return;
                        const t = e.target.value as 'truefalse' | 'single' | 'multiple';
                        setEditingModalQuestion({
                          ...editingModalQuestion,
                          type: t,
                          options: defaultOptions[t]
                        });
                      }}>
                        <option value="truefalse">Đúng/Sai</option>
                        <option value="single">1 đáp án đúng</option>
                        <option value="multiple">Nhiều đáp án đúng</option>
                      </select>
                      <select className="px-3 py-2 border rounded" value={editingModalQuestion.level || 'easy'} onChange={e=>{
                        if (!editingModalQuestion) return;
                        setEditingModalQuestion({...editingModalQuestion, level: e.target.value as 'easy'|'medium'|'hard'});
                      }}>
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      {(editingModalQuestion.options || []).map((opt:any, idx:number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {editingModalQuestion.type !== 'truefalse' && (
                            <span className="text-slate-500">{String.fromCharCode(65 + idx)}.</span>
                          )}
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => {
                              const opts = [...(editingModalQuestion.options||[])];
                              opts[idx].text = e.target.value;
                              setEditingModalQuestion({...editingModalQuestion, options: opts});
                            }}
                            className="flex-1 px-3 py-2 border rounded"
                            placeholder={editingModalQuestion.type === 'truefalse' ? (idx === 0 ? 'Đúng' : 'Sai') : 'Đáp án'}
                            required
                            disabled={editingModalQuestion.type === 'truefalse'}
                          />
                          <input
                            type={editingModalQuestion.type === 'multiple' ? 'checkbox' : 'radio'}
                            checked={opt.correct}
                            onChange={() => {
                              if (editingModalQuestion.type === 'single' || editingModalQuestion.type === 'truefalse') {
                                setEditingModalQuestion({...editingModalQuestion, options: (editingModalQuestion.options||[]).map((o:any, i:number) => ({ ...o, correct: i === idx }))});
                              } else {
                                setEditingModalQuestion({...editingModalQuestion, options: (editingModalQuestion.options||[]).map((o:any, i:number) => i === idx ? { ...o, correct: !o.correct } : o)});
                              }
                            }}
                            name="correct"
                          />
                          {editingModalQuestion.type === 'multiple' && editingModalQuestion.options.length > 2 && (
                            <button type="button" className="text-red-500" onClick={() => {
                              setEditingModalQuestion({...editingModalQuestion, options: (editingModalQuestion.options||[]).filter((_: any, i: number) => i !== idx)});
                            }}>X</button>
                          )}
                        </div>
                      ))}
                      {editingModalQuestion.type === 'multiple' && (
                        <button type="button" className="px-2 py-1 bg-slate-200 rounded" onClick={() => {
                          setEditingModalQuestion({...editingModalQuestion, options:[...(editingModalQuestion.options||[]),{text:'',correct:false}]});
                        }}>+ Thêm đáp án</button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-8">
                    <button type="button" className="px-5 py-2 bg-slate-200 rounded font-semibold" onClick={()=>setEditingModalQuestion(null)}>Hủy</button>
                    <button type="button" className="px-5 py-2 bg-sky-600 text-white rounded font-semibold" onClick={async()=>{
                      if(editingModalQuestion.id && selectedBankId) {
                        await updateQuestion(selectedBankId, editingModalQuestion.id, editingModalQuestion);
                      }
                      setTempSelectedQuestions(tsq=>tsq.map(q=>q.id===editingModalQuestion.id?{...editingModalQuestion}:q));
                      setEditingModalQuestion(null);
                    }}>Lưu</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showView.open && showView.part && addingQuestion && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              onClick={() => {
                setAddingQuestion(false);
                setEditingQuestion(null);
              }}
              aria-label="Đóng"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center">Thêm câu hỏi thủ công</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              if (!editingQuestion?.content || !editingQuestion?.level) { alert('Vui lòng nhập đủ nội dung và mức độ!'); return; }
              if (editingQuestion.type==='single' && (!editingQuestion.options || editingQuestion.options.filter((o:any)=>o.correct).length !== 1)) { alert('Phải chọn đúng 1 đáp án đúng!'); return; }
              if (editingQuestion.type==='multiple' && (!editingQuestion.options || editingQuestion.options.filter((o:any)=>o.correct).length < 1)) { alert('Phải chọn ít nhất 1 đáp án đúng!'); return; }
              if ((editingQuestion.type==='single' || editingQuestion.type==='multiple') && (!editingQuestion.options || editingQuestion.options.some((o:any)=>!o.text))) { alert('Vui lòng nhập đầy đủ đáp án!'); return; }
              if (showView.open && showView.part) {
                const newQuestions = [...(showView.part.questions || []), { ...editingQuestion, id: Date.now().toString() }];
                await updatePart(String(showView.part.id), { ...showView.part, questions: newQuestions });
                setShowView({ open: true, part: { ...showView.part, questions: newQuestions } });
              }
              setEditingQuestion(null);
              setAddingQuestion(false);
            }} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Nội dung câu hỏi</label>
                <textarea className="w-full border rounded px-3 py-2" placeholder="Nhập nội dung câu hỏi" value={editingQuestion?.content || ''} onChange={e=>setEditingQuestion({...editingQuestion, content: e.target.value})} required />
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded" value={editingQuestion?.type || 'truefalse'} onChange={e => {
                  if (!editingQuestion) return;
                  const t = e.target.value as 'truefalse' | 'single' | 'multiple';
                  setEditingQuestion({
                    ...editingQuestion,
                    type: t,
                    options: defaultOptions[t]
                  });
                }}>
                  <option value="truefalse">Đúng/Sai</option>
                  <option value="single">1 đáp án đúng</option>
                  <option value="multiple">Nhiều đáp án đúng</option>
                </select>
                <select className="px-3 py-2 border rounded" value={editingQuestion?.level || 'easy'} onChange={e=>{
                  if (!editingQuestion) return;
                  setEditingQuestion({...editingQuestion, level: e.target.value as 'easy'|'medium'|'hard'});
                }}>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div className="space-y-2">
                {(editingQuestion.options || []).map((opt:any, idx:number) => (
                  <div key={idx} className="flex items-center gap-2">
                    {editingQuestion.type !== 'truefalse' && (
                      <span className="text-slate-500">{String.fromCharCode(65 + idx)}.</span>
                    )}
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => {
                        const opts = [...(editingQuestion.options||[])];
                        opts[idx].text = e.target.value;
                        setEditingQuestion({...editingQuestion, options: opts});
                      }}
                      className="flex-1 px-3 py-2 border rounded"
                      placeholder={editingQuestion.type === 'truefalse' ? (idx === 0 ? 'Đúng' : 'Sai') : 'Đáp án'}
                      required
                      disabled={editingQuestion.type === 'truefalse'}
                    />
                    <input
                      type={editingQuestion.type === 'multiple' ? 'checkbox' : 'radio'}
                      checked={opt.correct}
                      onChange={() => {
                        if (editingQuestion.type === 'single' || editingQuestion.type === 'truefalse') {
                          setEditingQuestion({...editingQuestion, options: (editingQuestion.options||[]).map((o:any, i:number) => ({ ...o, correct: i === idx }))});
                        } else {
                          setEditingQuestion({...editingQuestion, options: (editingQuestion.options||[]).map((o:any, i:number) => i === idx ? { ...o, correct: !o.correct } : o)});
                        }
                      }}
                      name="correct"
                    />
                    {editingQuestion.type === 'multiple' && editingQuestion.options.length > 2 && (
                      <button type="button" className="text-red-500" onClick={() => {
                        setEditingQuestion({...editingQuestion, options: (editingQuestion.options||[]).filter((_: any, i: number) => i !== idx)});
                      }}>X</button>
                    )}
                  </div>
                ))}
                {editingQuestion.type === 'multiple' && (
                  <button type="button" className="px-2 py-1 bg-slate-200 rounded" onClick={() => {
                    setEditingQuestion({...editingQuestion, options:[...(editingQuestion.options||[]),{text:'',correct:false}]});
                  }}>+ Thêm đáp án</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePart; 