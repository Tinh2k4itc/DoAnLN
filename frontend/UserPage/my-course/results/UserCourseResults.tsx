import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../../shared/firebase-config';

const UserCourseResults: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [results, setResults] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<any|null>(null);
  const [parts, setParts] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('http://localhost:8080/api/exam-results');
      const partRes = await axios.get('http://localhost:8080/api/parts');
      setParts(partRes.data);
      // Lọc kết quả của user hiện tại và các bài thi thuộc courseId
      const myResults = res.data.filter((r:any) => r.userName === (user?.displayName || user?.email) && parts.some((p:any) => p.id === r.testName && p.courseId === courseId));
      setResults(myResults);
    };
    fetchData();
  }, [courseId, user, parts.length]);

  const getPart = (partId: string) => parts.find((p:any) => p.id === partId);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Kết quả bài thi</h2>
      {results.length === 0 ? <div>Bạn chưa có kết quả bài thi nào.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((r, idx) => {
            const part = getPart(r.testName);
            return (
              <div key={idx} className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-lg border border-slate-100" onClick={() => setShowDetail({result: r, part})}>
                <div className="font-semibold text-lg mb-2">{part?.name || 'Bài thi'}</div>
                <div className="text-slate-600 text-sm mb-1">Điểm: <span className="font-bold text-green-600">{r.score}</span> / {r.details.length}</div>
                <div className="text-slate-600 text-sm mb-1">Số câu đúng: <span className="font-bold">{r.score}</span></div>
                <div className="text-slate-600 text-sm mb-1">Số câu sai: <span className="font-bold text-red-600">{r.details.length - r.score}</span></div>
                <div className="text-slate-500 text-xs">Nộp lúc: {new Date(r.submittedAt).toLocaleString('vi-VN', { hour12: false })}</div>
              </div>
            );
          })}
        </div>
      )}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl text-left relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-2xl font-bold" onClick={()=>setShowDetail(null)}>&times;</button>
            <h2 className="text-2xl font-bold mb-2">Chi tiết kết quả</h2>
            <div className="mb-2 font-semibold">{showDetail.part?.name || 'Bài thi'}</div>
            <div className="mb-2">Điểm: <span className="font-bold text-green-600">{showDetail.result.score}</span> / {showDetail.result.details.length}</div>
            <div className="mb-2">Số câu đúng: <span className="font-bold">{showDetail.result.score}</span></div>
            <div className="mb-2">Số câu sai: <span className="font-bold text-red-600">{showDetail.result.details.length - showDetail.result.score}</span></div>
            <div className="mb-2">Thời gian nộp: {new Date(showDetail.result.submittedAt).toLocaleString('vi-VN', { hour12: false })}</div>
            {showDetail.part?.showAnswerAfterSubmit ? (
              <div className="mt-6">
                <h3 className="font-bold mb-2">Chi tiết từng câu hỏi</h3>
                {showDetail.result.details.map((d:any, idx:number) => {
                  const q = showDetail.part?.questions?.[idx];
                  let correctIdxs: number[] = Array.isArray(q?.correctAnswers) ? q.correctAnswers : [];
                  let isCorrect = d.correct;
                  return (
                    <div key={idx} className="mb-4 p-3 rounded border bg-slate-50">
                      <div className="font-semibold mb-1">Câu {idx+1}: {q?.content}</div>
                      <div className="mb-1">Đáp án của bạn: <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{q && q.type === 'multiple_choice'
                        ? (d.answer ? d.answer.split(',').map((idx2:string) => q.options?.[Number(idx2)]?.text || '').join(', ') : '')
                        : (typeof d.answer === 'string' && d.answer !== '' ? (q.options?.[Number(d.answer)]?.text || '') : '')}</span></div>
                      <div>Đáp án đúng: <span className="text-green-700 font-bold">{q && q.type === 'multiple_choice'
                        ? correctIdxs.map(idx2 => q.options?.[Number(idx2)]?.text || '').join(', ')
                        : q.options?.[Number(q.answer)]?.text}</span></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 text-center text-slate-500">Bạn không được phép xem lại đáp án sau khi nộp bài.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCourseResults; 