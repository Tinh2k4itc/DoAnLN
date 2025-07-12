import React, { useEffect, useState } from 'react';
import { Part } from '../../../AdminPage/manage-part/PartApi';
import { auth } from '../../../shared/firebase-config';
import axios from 'axios';

interface TestCardProps {
  part: Part;
  onStartTest: (partId: string) => void;
  onViewResults: (partId: string) => void;
}

interface TestAttemptInfo {
  attemptCount: number;
  canTake: boolean;
  lastScore?: number;
  lastSubmittedAt?: string;
}

const TestCard: React.FC<TestCardProps> = ({ part, onStartTest, onViewResults }) => {
  const [attemptInfo, setAttemptInfo] = useState<TestAttemptInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttemptInfo = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Chưa đăng nhập');
          setLoading(false);
          return;
        }

        const userName = user.uid || user.email || 'unknown';
        
        // Lấy số lượt thi đã sử dụng
        const attemptCountResponse = await axios.get(
          `http://localhost:8080/api/exam-results/attempt-count/${encodeURIComponent(userName)}/${encodeURIComponent(part.id!)}`
        );
        const attemptCount = attemptCountResponse.data;

        // Kiểm tra có thể thi không
        const canTakeResponse = await axios.get(
          `http://localhost:8080/api/exam-results/can-take-test/${encodeURIComponent(userName)}/${encodeURIComponent(part.id!)}/${part.maxRetake || 1}`
        );
        const canTake = canTakeResponse.data;

        // Lấy kết quả gần nhất nếu có
        let lastScore: number | undefined;
        let lastSubmittedAt: string | undefined;
        
        if (attemptCount > 0) {
          try {
            const resultsResponse = await axios.get('http://localhost:8080/api/exam-results');
            const userResults = resultsResponse.data.filter((result: any) => 
              result.userName === userName && result.testName === part.id
            );
            
            if (userResults.length > 0) {
              // Sắp xếp theo thời gian nộp, lấy kết quả gần nhất
              const sortedResults = userResults.sort((a: any, b: any) => 
                new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
              );
              const lastResult = sortedResults[0];
              lastScore = lastResult.score;
              lastSubmittedAt = lastResult.submittedAt;
            }
          } catch (e) {
            console.warn('Không thể lấy kết quả gần nhất:', e);
          }
        }

        setAttemptInfo({
          attemptCount,
          canTake,
          lastScore,
          lastSubmittedAt
        });
      } catch (e) {
        console.error('Lỗi khi lấy thông tin lượt thi:', e);
        setError('Không thể tải thông tin bài thi');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptInfo();
  }, [part.id, part.maxRetake]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-red-200">
        <div className="text-red-600 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{part.name}</h3>
          {part.description && (
            <p className="text-slate-600 text-sm mb-3">{part.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {part.showAnswerAfterSubmit && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Xem đáp án
            </span>
          )}
          {part.enableAntiCheat && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Chống gian lận
            </span>
          )}
        </div>
      </div>

      {/* Thông tin bài thi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{part.questions?.length || 0}</div>
          <div className="text-xs text-slate-500">Số câu hỏi</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{formatDuration(part.duration || 60)}</div>
          <div className="text-xs text-slate-500">Thời gian</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{part.score || 10}</div>
          <div className="text-xs text-slate-500">Điểm tối đa</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{attemptInfo?.attemptCount || 0}/{part.maxRetake || 1}</div>
          <div className="text-xs text-slate-500">Lượt thi</div>
        </div>
      </div>

      {/* Kết quả gần nhất */}
      {attemptInfo?.lastScore !== undefined && (
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Kết quả gần nhất</h4>
              <p className="text-sm text-slate-600">
                Nộp lúc: {formatDate(attemptInfo.lastSubmittedAt!)}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                attemptInfo.lastScore >= (part.score || 10) * 0.5 ? 'text-green-600' : 'text-red-600'
              }`}>
                {attemptInfo.lastScore.toFixed(1)}/{part.score || 10}
              </div>
              <div className="text-xs text-slate-500">Điểm</div>
            </div>
          </div>
        </div>
      )}

      {/* Cài đặt bài thi */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Xáo trộn câu hỏi:</span>
          <span className={part.randomizeQuestions ? 'text-green-600' : 'text-red-600'}>
            {part.randomizeQuestions ? 'Có' : 'Không'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Cảnh báo chuyển tab:</span>
          <span className={part.enableTabWarning ? 'text-green-600' : 'text-red-600'}>
            {part.enableTabWarning ? 'Có' : 'Không'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Số lần thi tối đa:</span>
          <span className="font-semibold">{part.maxRetake || 1}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {attemptInfo?.canTake ? (
          <button
            onClick={() => onStartTest(part.id!)}
            className="flex-1 bg-sky-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Bắt đầu làm bài
          </button>
        ) : (
          <button
            disabled
            className="flex-1 bg-slate-300 text-slate-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Đã hết lượt thi
          </button>
        )}

                 {(attemptInfo?.attemptCount || 0) > 0 && (
          <button
            onClick={() => onViewResults(part.id!)}
            className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Xem kết quả
          </button>
        )}
      </div>
    </div>
  );
};

export default TestCard; 