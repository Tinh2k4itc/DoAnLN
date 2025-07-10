import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { getPartById, Part } from '../../../AdminPage/manage-part/PartApi';
import { auth } from '../../../shared/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../shared/firebase-config';

interface Question {
  id: string;
  content: string;
  options: string[];
  correct: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  return arr
    .map(v => ({ sort: Math.random(), value: v }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const EXAM_TIME = 60; // phút

interface UserFormProps {
  partId: string;
  onBack: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ partId, onBack }) => {
  const [part, setPart] = useState<Part | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: number | number[] | null }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [marked, setMarked] = useState<{[id: string]: boolean}>({});
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number|null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [antiCheatWarning, setAntiCheatWarning] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    if (!partId) return;
    getPartById(partId).then(p => {
      setPart(p);
      let qs = p.questions || [];
      if (p.randomizeQuestions) {
        qs = shuffleArray(qs);
      }
      setQuestions(qs);
      setAnswers(Object.fromEntries(qs.map((q:any) => [q.id, isMultiChoice(q) ? [] : null])));
      setTimeLeft((p.duration || 60) * 60);
      setSubmitted(false);
    });
  }, [partId]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (submitted) return;
    if (questions.length === 0) return; // Chưa load xong đề thì không làm gì
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, submitted, questions.length]);

  // Chống gian lận: cảnh báo khi chuyển tab
  useEffect(() => {
    const handleBlur = () => setAntiCheatWarning('Bạn đã chuyển tab hoặc thu nhỏ cửa sổ! Vui lòng không gian lận.');
    const handleFocus = () => setAntiCheatWarning('');
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Chống copy/paste
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleSelect = (qid: string, idx: number) => {
    if (submitted) return;
    setAnswers(a => {
      const q = questions.find(q => q.id === qid);
      if (isMultiChoice(q)) {
        const arr = Array.isArray(a[qid]) ? [...(a[qid] as number[])] : [];
        if (arr.includes(idx)) {
          return { ...a, [qid]: arr.filter(i => i !== idx) };
        } else {
          return { ...a, [qid]: [...arr, idx] };
        }
      } else {
        return { ...a, [qid]: idx };
      }
    });
  };

  const handleSubmit = async () => {
    if (!submitted) {
      setShowConfirmModal(true);
      return;
    }
    setSubmitted(true);
    setAntiCheatWarning('');
    setEndTime(Date.now());
    setShowResultModal(true);
    // Tính điểm và gửi kết quả lên backend
    const user = auth.currentUser;
    const details = questions.map(q => {
      const ans = answers[q.id];
      let answerStr = '';
      if (isMultiChoice(q)) {
        // Loại bỏ trùng lặp, chỉ lấy các index hợp lệ
        const uniqueIdx = Array.isArray(ans) ? Array.from(new Set(ans as number[])) : [];
        answerStr = uniqueIdx.map(idx => (q.options?.[idx] || '')).join(',');
      } else {
        answerStr = typeof ans === 'number' ? (q.options?.[ans] || '') : '';
      }
      return {
        question: q.content,
        answer: answerStr,
      };
    });
    const resultPayload = {
      userName: user?.displayName || user?.email || 'Học sinh',
      testName: part?.id, // testName là partId
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      details,
    };
    try {
      await axios.post('http://localhost:8080/api/exam-results', resultPayload);
      // Sau khi nộp bài, lấy lại kết quả từ backend (nếu muốn)
      const res = await axios.get('http://localhost:8080/api/exam-results');
      // Tìm kết quả mới nhất của user cho part này
      const allResults = res.data;
      const myResult = allResults.reverse().find((r:any) => r.userName === resultPayload.userName && r.testName === resultPayload.testName);
      setResultData(myResult);
    } catch (e) {
      console.error('Lỗi gửi/lấy kết quả thi:', e);
      setResultData(null);
    }
  };

  // Tính trạng thái từng câu hỏi
  const questionStatus = useMemo(() => questions.map(q => ({
    id: q.id,
    answered: typeof answers[q.id] !== 'undefined',
    marked: !!marked[q.id],
  })), [questions, answers, marked]);

  // Đếm số câu đã trả lời
  const answeredCount = questionStatus.filter(q => q.answered).length;

  // Xử lý chuyển câu hỏi (nếu muốn highlight câu đang xem)
  const [currentIdx, setCurrentIdx] = useState(0);

  // Tính thời gian làm bài dạng hh:mm:ss
  const timeTaken = useMemo(() => {
    if (!endTime) return null;
    const totalSec = Math.floor((endTime - startTime) / 1000);
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [endTime, startTime]);

  // Hàm format ngày giờ
  function formatDateTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleString('vi-VN', { hour12: false });
  }

  const user = auth.currentUser;

  // Thêm hàm xác định loại câu hỏi
  function isMultiChoice(q: any) {
    // Ưu tiên trường type backend trả về
    if (q.type === 'multiple_choice') return true;
    if (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 1) return true;
    return false;
  }

  // Thêm hàm xác định loại câu hỏi true/false
  function isTrueFalse(q: any) {
    return q.type === 'true_false' || (Array.isArray(q.options) && q.options.length === 2 && q.options.some((o:any) => o === 'Đúng' || o === 'Sai'));
  }

  // Sửa nút nộp bài: chỉ cho nộp khi tất cả câu hỏi đã chọn ít nhất 1 đáp án
  const canSubmit = questions.every(q => {
    const ans = answers[q.id];
    if (isMultiChoice(q)) return Array.isArray(ans) && ans.length > 0;
    return typeof ans === 'number';
  });

  // Thêm useMemo để tính score toàn cục
  const score = React.useMemo(() => {
    return questions.filter(q => {
      const ans = answers[q.id];
      if (isMultiChoice(q)) {
        // So sánh set
        const correctIdxs: number[] = Array.isArray(q.correctAnswers) ? q.correctAnswers : (Array.isArray(q.options) ? q.options.map((o:any,i:number)=>o.isCorrect?i:null).filter((i:any)=>i!==null) : []);
        if (!Array.isArray(ans) || correctIdxs.length === 0 || ans.length !== correctIdxs.length) return false;
        const set1 = new Set(ans);
        const set2 = new Set(correctIdxs);
        if (set1.size !== set2.size) return false;
        for (let v of set1) if (!set2.has(v)) return false;
        return true;
      } else {
        // Single/True-false
        const correctIdx = typeof q.correct === 'number' ? q.correct : (Array.isArray(q.correctAnswers) ? q.correctAnswers[0] : null);
        return typeof ans === 'number' && ans === correctIdx;
      }
    }).length;
  }, [answers, questions]);

  if (!part) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Thanh trên cùng */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div className="flex gap-2 items-center">
            <button type="button" className="px-4 py-2 bg-green-100 text-green-700 border border-green-400 rounded flex items-center gap-2 font-semibold hover:bg-green-200" onClick={handleSubmit} disabled={submitted || !canSubmit}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              NỘP BÀI
            </button>
            <button type="button" className="px-2 py-2 bg-slate-100 text-slate-600 border border-slate-300 rounded hover:bg-slate-200 flex items-center" onClick={onBack}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center px-3 py-1 rounded bg-blue-500 text-white font-bold min-w-[60px]">
              <span className="text-lg">{Math.floor(timeLeft/3600)}</span>
              <span className="text-xs">GIỜ</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1 rounded bg-green-500 text-white font-bold min-w-[60px]">
              <span className="text-lg">{Math.floor((timeLeft%3600)/60)}</span>
              <span className="text-xs">PHÚT</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1 rounded bg-yellow-400 text-white font-bold min-w-[60px]">
              <span className="text-lg">{(timeLeft%60).toString().padStart(2,'0')}</span>
              <span className="text-xs">GIÂY</span>
            </div>
          </div>
        </div>
        {/* Block thông tin đề thi */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 w-full max-w-xl mx-auto">
          <div className="text-xl font-bold mb-2 text-sky-700">ĐỀ THI: {part?.name}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="font-semibold">Môn học:</span> {part?.courseName || ''}</div>
            <div><span className="font-semibold">Mã đề:</span> {part?.id}</div>
            <div><span className="font-semibold">Học sinh:</span> Học sinh demo</div>
            <div><span className="font-semibold">Thời gian:</span> {part?.duration} phút</div>
            <div><span className="font-semibold">Số câu hỏi:</span> {questions.length}</div>
            <div><span className="font-semibold">Ngày giờ bắt đầu:</span> {formatDateTime(startTime)}</div>
            {typeof part?.maxRetake === 'number' && <div><span className="font-semibold">Số lần thi lại còn lại:</span> {part?.maxRetake}</div>}
          </div>
        </div>
        {/* Câu hỏi */}
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="w-full max-w-xl mx-auto">
          {questions[currentIdx] && (
            <div key={questions[currentIdx].id} className={`mb-5 bg-white rounded-lg border shadow-sm p-4 ring-2 ring-sky-400`}>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-600 text-white font-bold mr-3">{currentIdx + 1}</span>
                <span className="font-semibold text-base sm:text-lg">{questions[currentIdx].content}</span>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {(questions[currentIdx].options||[]).map((opt: any, i: number) => (
                  <label key={i} className={`inline-flex items-center gap-2 px-3 py-2 rounded transition cursor-pointer text-base border ${isMultiChoice(questions[currentIdx])
                    ? (Array.isArray(answers[questions[currentIdx].id]) && (answers[questions[currentIdx].id] as number[]).includes(i) ? 'bg-sky-600 text-white border-sky-600 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-sky-50')
                    : (answers[questions[currentIdx].id] === i ? 'bg-sky-600 text-white border-sky-600 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-sky-50')
                  }` } style={{width:'auto',maxWidth:'100%'}}>
                    <input
                      type={isMultiChoice(questions[currentIdx]) ? 'checkbox' : 'radio'}
                      name={questions[currentIdx].id}
                      checked={isMultiChoice(questions[currentIdx])
                        ? Array.isArray(answers[questions[currentIdx].id]) && (answers[questions[currentIdx].id] as number[]).includes(i)
                        : answers[questions[currentIdx].id] === i}
                      onChange={() => handleSelect(questions[currentIdx].id, i)}
                      disabled={submitted}
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-base sm:text-base">{String.fromCharCode(65+i)}. {typeof opt === 'string' ? opt : (opt.text || opt)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <button type="button" className="px-4 py-2 bg-slate-200 rounded font-semibold" disabled={currentIdx===0} onClick={()=>setCurrentIdx(i=>Math.max(0,i-1))}>Câu trước</button>
            <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded font-semibold" disabled={currentIdx===questions.length-1} onClick={()=>setCurrentIdx(i=>Math.min(questions.length-1,i+1))}>Câu sau</button>
          </div>
        </form>
        {submitted && !endTime && (
          <div className="mt-6 text-xl font-bold text-green-700 text-center">Bạn làm đúng {score}/{questions.length} câu hỏi!</div>
        )}
        {submitted && endTime && showResultModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center relative">
              <button className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-2xl font-bold" onClick={()=>setShowResultModal(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-2">Kết quả</h2>
              <hr className="mb-6" />
              {resultData ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <div className="text-3xl font-extrabold text-green-600">{resultData.details.length}</div>
                        <div className="text-sm text-slate-500">Tổng số câu</div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-green-600">{resultData.score}</div>
                        <div className="text-sm text-slate-500">Câu trả lời đúng</div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-red-600">{resultData.details.length - resultData.score}</div>
                        <div className="text-sm text-slate-500">Câu trả lời sai</div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="text-3xl font-extrabold text-red-600">{Math.round((resultData.score/(resultData.details.length||1))*100)}</div>
                        <div className="text-sm text-slate-500">Điểm số</div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-slate-600">{timeTaken || '--:--:--'}</div>
                        <div className="text-sm text-slate-500">Thời gian</div>
                      </div>
                    </div>
                  </div>
                  {part?.showAnswerAfterSubmit && (
                    <div className="mt-8 text-left">
                      <h3 className="text-lg font-bold mb-2">Xem lại câu hỏi và đáp án</h3>
                      {questions.map((q, idx) => {
                        const d = resultData.details[idx];
                        let correctIdxs: number[] = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                        let isCorrect = d.correct;
                        return (
                          <div key={q.id} className="mb-4 p-3 rounded border bg-slate-50">
                            <div className="font-semibold mb-1">Câu {idx+1}: {q.content}</div>
                            <div className="mb-1">Đáp án của bạn: <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{isMultiChoice(q)
                              ? (d.answer ? d.answer.split(',').map((idx2:string) => q.options?.[Number(idx2)]?.text || '').join(', ') : '')
                              : (typeof d.answer === 'string' && d.answer !== '' ? (q.options?.[Number(d.answer)]?.text || '') : '')}</span></div>
                            <div>Đáp án đúng: <span className="text-green-700 font-bold">{isMultiChoice(q)
                              ? correctIdxs.map(idx2 => q.options?.[Number(idx2)]?.text || '').join(', ')
                              : q.options?.[Number(q.answer)]?.text}</span></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!part?.showAnswerAfterSubmit && (
                    <div className="mt-8 text-center text-slate-500">Bạn không được phép xem lại đáp án sau khi nộp bài.</div>
                  )}
                </>
              ) : (
                <div>Đang tải kết quả...</div>
              )}
            </div>
          </div>
        )}
        {submitted && !part.showAnswerAfterSubmit && (
          <div className="mt-6 text-slate-500 text-center text-sm">Đáp án sẽ được công bố sau khi giáo viên cho phép.</div>
        )}
      </div>
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="font-bold mb-2">Câu hỏi</div>
          <div className="grid grid-cols-6 sm:grid-cols-5 md:grid-cols-3 gap-2 mb-3">
            {questions.map((q, idx) => (
              <button key={q.id} type="button" onClick={()=>setCurrentIdx(idx)}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-base
                  ${questionStatus[idx]?.answered ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-500'}
                  ${questionStatus[idx]?.marked ? 'ring-2 ring-yellow-400' : ''}
                  ${currentIdx===idx ? 'bg-sky-600 text-white border-sky-600' : ''}
                `}>
                {idx+1}
              </button>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-50 border-2 border-blue-500 inline-block"></span> Câu đã trả lời</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 inline-block"></span> Câu chưa trả lời</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full ring-2 ring-yellow-400 border border-yellow-300 inline-block"></span> Câu đánh dấu</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-sky-600 inline-block"></span> Đang xem</div>
          </div>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-xl font-bold mb-4">Hồ sơ cá nhân</h2>
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + (user?.displayName || user?.email)} alt="avatar" className="w-16 h-16 rounded-full border" />
            <div>
              <div className="font-semibold text-lg">{user?.displayName || 'Chưa đặt tên'}</div>
              <div className="text-slate-500 text-sm">Email: {user?.email}</div>
              <div className="text-slate-500 text-sm">UID: {user?.uid}</div>
            </div>
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center relative">
            <h2 className="text-xl font-bold mb-4">Xác nhận nộp bài</h2>
            <div className="mb-6">Bạn có chắc chắn muốn nộp bài không? Sau khi nộp sẽ không thể thay đổi đáp án.</div>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded font-bold" onClick={() => { setShowConfirmModal(false); setSubmitted(true); setEndTime(Date.now()); setShowResultModal(true); handleSubmit(); }}>Xác nhận</button>
              <button className="px-4 py-2 bg-slate-200 rounded font-bold" onClick={() => setShowConfirmModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;