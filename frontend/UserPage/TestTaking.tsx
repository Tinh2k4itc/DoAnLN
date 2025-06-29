import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTestForStudent, Test } from '../AdminPage/manage-test/TestApi';

const TestTaking: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | string[] }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadTest = async () => {
      if (!testId) return;
      
      try {
        setLoading(true);
        const testData = await fetchTestForStudent(testId);
        setTest(testData);
        setTimeLeft(testData.timeLimit * 60);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('Bài thi không còn khả dụng hoặc chưa đến thời gian mở');
        } else {
          setError('Lỗi khi tải bài thi');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 300) return 'text-red-600';
    if (seconds <= 600) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleAnswerChange = (questionId: string, answer: string, type: string) => {
    setAnswers(prev => {
      if (type === 'multiple') {
        const currentAnswers = (prev[questionId] as string[]) || [];
        if (currentAnswers.includes(answer)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(a => a !== answer)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answer]
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: answer
        };
      }
    });
  };

  const calculateScore = () => {
    if (!test?.questions) return { score: 0, correct: 0, total: 0 };
    
    let score = 0;
    let correct = 0;
    const total = test.questions.length;

    test.questions.forEach(question => {
      const userAnswer = answers[question.questionId];
      const correctAnswer = question.options?.find(opt => opt.correct)?.text;
      
      if (userAnswer) {
        const isCorrect = Array.isArray(userAnswer) 
          ? userAnswer.includes(correctAnswer || '')
          : userAnswer === correctAnswer;
        
        if (isCorrect) {
          score += question.score;
          correct++;
        }
      }
    });

    return { score, correct, total };
  };

  const handleSubmitTest = async () => {
    if (!test) return;
    
    setIsSubmitting(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const { score, correct, total } = calculateScore();
    const timeSpent = test.timeLimit - Math.ceil(timeLeft / 60);
    
    navigate(`/test-result/${testId}`, {
      state: {
        answers,
        score,
        totalScore: test.totalScore,
        timeSpent,
        submittedAt: new Date(),
        correct,
        total
      }
    });
  };

  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmSubmit(false);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goToNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions!.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài thi...</p>
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

  if (!test || !test.questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy bài thi</h2>
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

  const currentQuestion = test.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = test.questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{test.name}</h1>
              <p className="text-sm text-gray-600">{test.courseName} - {test.partName}</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTimeColor(timeLeft)}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-500">Thời gian còn lại</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {currentQuestionIndex + 1} / {totalQuestions}
              </div>
              <div className="text-sm text-gray-500">Câu hỏi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Câu {currentQuestionIndex + 1}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Điểm: {currentQuestion.score}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentQuestion.level === 'easy' ? 'bg-green-100 text-green-800' :
                      currentQuestion.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentQuestion.level === 'easy' ? 'Dễ' :
                       currentQuestion.level === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-6">{currentQuestion.content}</p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type={currentQuestion.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={`question-${currentQuestion.questionId}`}
                        value={option.text}
                        checked={
                          currentQuestion.type === 'multiple'
                            ? (answers[currentQuestion.questionId] as string[])?.includes(option.text) || false
                            : answers[currentQuestion.questionId] === option.text
                        }
                        onChange={() => handleAnswerChange(currentQuestion.questionId, option.text, currentQuestion.type)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-800">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Câu trước
                </button>
                
                <div className="flex space-x-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={goToNextQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Câu tiếp →
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmSubmit}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Nộp bài
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Tổng quan</h3>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span>{answeredQuestions}/{totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Câu hỏi</h4>
                <div className="grid grid-cols-5 gap-2">
                  {test.questions.map((_, index) => {
                    const isAnswered = answers[test.questions![index].questionId];
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                          isCurrent 
                            ? 'bg-blue-600 text-white' 
                            : isAnswered 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn nộp bài thi? Sau khi nộp, bạn không thể thay đổi đáp án.
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <div>Đã trả lời: {answeredQuestions}/{totalQuestions} câu</div>
              <div>Thời gian còn lại: {formatTime(timeLeft)}</div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitTest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTaking; 