import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchTestForStudent, Test } from '../AdminPage/manage-test/TestApi';

interface TestResultState {
  answers: { [questionId: string]: string | string[] };
  score: number;
  totalScore: number;
  timeSpent: number;
  submittedAt: Date;
  correct: number;
  total: number;
}

const TestResult: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get state from navigation
  const resultData = location.state as TestResultState;

  useEffect(() => {
    const loadTest = async () => {
      if (!testId) return;
      
      try {
        setLoading(true);
        const testData = await fetchTestForStudent(testId);
        setTest(testData);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('Bài thi không còn khả dụng hoặc chưa đến thời gian mở');
        } else {
          setError('Lỗi khi tải thông tin bài thi');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins} phút`;
  };

  const getScorePercentage = () => {
    if (!resultData) return 0;
    return Math.round((resultData.score / resultData.totalScore) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/user')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!test || !resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả bài thi</h2>
          <button
            onClick={() => navigate('/user')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = getScorePercentage();
  const scoreColor = getScoreColor(scorePercentage);
  const grade = getScoreGrade(scorePercentage);
  const wrong = resultData.total - resultData.correct;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Kết quả bài thi</h1>
            <h2 className="text-xl text-gray-600 mb-4">{test.name}</h2>
            
            {/* Score Display */}
            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor}`}>
                  {resultData.score}/{resultData.totalScore}
                </div>
                <div className="text-sm text-gray-500">Điểm số</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor}`}>
                  {scorePercentage}%
                </div>
                <div className="text-sm text-gray-500">Phần trăm</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor}`}>
                  {grade}
                </div>
                <div className="text-sm text-gray-500">Xếp loại</div>
              </div>
            </div>

            {/* Question Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
              <div className="text-center">
                <div className="font-semibold text-gray-800">Câu đúng</div>
                <div className="text-green-600 font-bold text-lg">{resultData.correct}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Câu sai</div>
                <div className="text-red-600 font-bold text-lg">{wrong}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Tổng câu</div>
                <div className="text-blue-600 font-bold text-lg">{resultData.total}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Tỷ lệ đúng</div>
                <div className="text-purple-600 font-bold text-lg">
                  {Math.round((resultData.correct / resultData.total) * 100)}%
                </div>
              </div>
            </div>

            {/* Test Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-800">Thời gian làm bài</div>
                <div className="text-gray-600">{formatTime(resultData.timeSpent)}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Thời gian cho phép</div>
                <div className="text-gray-600">{test.timeLimit} phút</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Số câu hỏi</div>
                <div className="text-gray-600">{test.totalQuestions}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Nộp bài lúc</div>
                <div className="text-gray-600">{resultData.submittedAt.toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Review */}
        {test.showAnswers && test.questions && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Xem lại đáp án</h3>
            <div className="space-y-6">
              {test.questions.map((question, index) => {
                const userAnswer = resultData.answers[question.questionId];
                const correctAnswer = question.options?.find(opt => opt.correct)?.text;
                const isCorrect = Array.isArray(userAnswer) 
                  ? userAnswer.includes(correctAnswer || '')
                  : userAnswer === correctAnswer;

                return (
                  <div key={question.questionId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Câu {index + 1}: {question.content}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Điểm: {question.score}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? 'Đúng' : 'Sai'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <input
                            type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                            checked={Array.isArray(userAnswer) 
                              ? userAnswer.includes(option.text)
                              : userAnswer === option.text
                            }
                            readOnly
                            className="text-blue-600"
                          />
                          <span className={`${
                            option.correct ? 'font-semibold text-green-600' : ''
                          }`}>
                            {option.text}
                            {option.correct && ' ✓'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {!isCorrect && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="text-sm text-red-800">
                          <strong>Đáp án của bạn:</strong> {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}
                        </div>
                        <div className="text-sm text-green-800 mt-1">
                          <strong>Đáp án đúng:</strong> {correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => navigate('/user')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại trang chủ
          </button>
          {!test.showAnswers && (
            <div className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg">
              Đáp án không được hiển thị
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResult; 