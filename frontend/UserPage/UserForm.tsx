import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { getPartById, Part } from '../AdminPage/manage-part/PartApi';

interface Question {
  id: string;
  content: string;
  options: string[];
  correct: number;
}

const mockQuestions: Question[] = [
  { id: '1', content: '2 + 2 = ?', options: ['3', '4', '5', '6'], correct: 1 },
  { id: '2', content: 'Thủ đô Việt Nam là?', options: ['Hà Nội', 'Hải Phòng', 'Đà Nẵng', 'TP.HCM'], correct: 0 },
  { id: '3', content: 'Màu của lá cây?', options: ['Đỏ', 'Vàng', 'Xanh', 'Tím'], correct: 2 },
];

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
  const [answers, setAnswers] = useState<{ [id: string]: number | null }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [antiCheatWarning, setAntiCheatWarning] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [marked, setMarked] = useState<{[id: string]: boolean}>({});
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number|null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (!partId) return;
    getPartById(partId).then(p => {
      setPart(p);
      setQuestions(p.questions || []);
      setAnswers(Object.fromEntries((p.questions||[]).map((q:any) => [q.id, null])));
      setTimeLeft((p.duration || 60) * 60);
      setSubmitted(false);
    });
  }, [partId]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, submitted]);

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
    setAnswers(a => ({ ...a, [qid]: idx }));
  };

  const handleSubmit = async () => {
    if (!submitted) {
      const ok = window.confirm('Bạn có chắc chắn muốn nộp bài?');
      if (!ok) return;
    }
    setSubmitted(true);
    setAntiCheatWarning('');
    setEndTime(Date.now());
    setShowResultModal(true);
    // Gửi kết quả lên backend
    try {
      await axios.post('http://localhost:8080/api/exam-results', {
        id: Date.now().toString(),
        userName: 'Học sinh demo', // TODO: lấy từ user thực tế
        testName: part?.name || 'Đề thi',
        score: correctCount,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        details: questions.map(q => ({
          question: q.content,
          answer: typeof answers[q.id] === 'number' ? (q.options?.[answers[q.id]!] || '') : '',
          correct: answers[q.id] === q.correct,
          point: answers[q.id] === q.correct ? 1 : 0,
        })),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Lỗi gửi kết quả thi:', e);
    }
  };

  const correctCount = questions.filter(q => answers[q.id] === q.correct).length;

  // Tính trạng thái từng câu hỏi
  const questionStatus = useMemo(() => questions.map(q => ({
    id: q.id,
    answered: typeof answers[q.id] === 'number',
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

  if (!part) return <div className="text-center text-slate-500">Đang tải đề thi...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Thanh trên cùng */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div className="flex gap-2 items-center">
            <button type="button" className="px-4 py-2 bg-green-100 text-green-700 border border-green-400 rounded flex items-center gap-2 font-semibold hover:bg-green-200" onClick={handleSubmit} disabled={submitted}>
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
          <div className="text-xl font-bold mb-2 text-sky-700">ĐỀ THI: {part.name}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="font-semibold">Môn học:</span> {part.courseName || ''}</div>
            <div><span className="font-semibold">Mã đề:</span> {part.id}</div>
            <div><span className="font-semibold">Học sinh:</span> Học sinh demo</div>
            <div><span className="font-semibold">Thời gian:</span> {part.duration} phút</div>
            <div><span className="font-semibold">Số câu hỏi:</span> {questions.length}</div>
            <div><span className="font-semibold">Ngày giờ bắt đầu:</span> {formatDateTime(startTime)}</div>
            {typeof part.maxRetake === 'number' && <div><span className="font-semibold">Số lần thi lại còn lại:</span> {part.maxRetake}</div>}
          </div>
        </div>
        {/* Câu hỏi */}
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="w-full max-w-xl mx-auto">
          {questions[currentIdx] && (
            <div key={questions[currentIdx].id} className={`mb-5 bg-white rounded-lg border shadow-sm p-4 ring-2 ring-sky-400`}>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-600 text-white font-bold mr-3">{currentIdx + 1}</span>
                <span className="font-semibold text-base sm:text-lg">{questions[currentIdx].content}</span>
                <button type="button" className={`ml-auto px-2 py-1 rounded ${marked[questions[currentIdx].id]?'bg-yellow-200 text-yellow-800':'bg-slate-100 text-slate-500 hover:bg-yellow-100'}`} onClick={()=>setMarked(m=>({...m,[questions[currentIdx].id]:!m[questions[currentIdx].id]}))}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
                </button>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {(questions[currentIdx].options||[]).map((opt: any, i: number) => (
                  <label key={i} className={`inline-flex items-center gap-2 px-3 py-2 rounded transition cursor-pointer text-base border ${answers[questions[currentIdx].id] === i ? 'bg-sky-600 text-white border-sky-600 font-semibold' : 'bg-slate-50 border-slate-200 hover:bg-sky-50'}` } style={{width:'auto',maxWidth:'100%'}}>
                    <input
                      type="radio"
                      name={questions[currentIdx].id}
                      checked={answers[questions[currentIdx].id] === i}
                      onChange={() => setAnswers(a => ({ ...a, [questions[currentIdx].id]: i }))}
                      disabled={submitted}
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-base sm:text-base">{String.fromCharCode(65+i)}. {typeof opt === 'string' ? opt : opt.text}</span>
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
          <div className="mt-6 text-xl font-bold text-green-700 text-center">Bạn làm đúng {correctCount}/{questions.length} câu hỏi!</div>
        )}
        {submitted && endTime && showResultModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center relative">
              <button className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-2xl font-bold" onClick={()=>setShowResultModal(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-2">Kết quả</h2>
              <hr className="mb-6" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-3xl font-extrabold text-green-600">{questions.length}</div>
                    <div className="text-sm text-slate-500">Tổng số câu</div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-green-600">{correctCount}</div>
                    <div className="text-sm text-slate-500">Câu trả lời đúng</div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-red-600">{questions.length - correctCount}</div>
                    <div className="text-sm text-slate-500">Câu trả lời sai</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-3xl font-extrabold text-red-600">{Math.round((correctCount/questions.length)*100)}</div>
                    <div className="text-sm text-slate-500">Điểm số</div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-600">{timeTaken || '--:--:--'}</div>
                    <div className="text-sm text-slate-500">Thời gian</div>
                  </div>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default UserForm;