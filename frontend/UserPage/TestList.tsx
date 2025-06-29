import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableTests, Test } from '../AdminPage/manage-test/TestApi';

const TestList: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading available tests...');
        const testData = await fetchAvailableTests();
        console.log('Tests loaded:', testData);
        setTests(testData);
      } catch (err) {
        console.error('Error loading tests:', err);
        setError('Lỗi khi tải danh sách bài thi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const getTestStatus = (test: Test) => {
    const now = new Date();
    const startDate = test.startDate ? new Date(test.startDate) : null;
    const endDate = test.endDate ? new Date(test.endDate) : null;
    
    if (startDate && endDate) {
      if (now < startDate) {
        return { text: 'Chưa mở', color: 'bg-yellow-100 text-yellow-800', disabled: true };
      } else if (now > endDate) {
        return { text: 'Đã kết thúc', color: 'bg-red-100 text-red-800', disabled: true };
      } else {
        return { text: 'Đang mở', color: 'bg-green-100 text-green-800', disabled: false };
      }
    } else {
      return { text: 'Luôn mở', color: 'bg-blue-100 text-blue-800', disabled: false };
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Không giới hạn';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return 'Ngày không hợp lệ';
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || test.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const uniqueCourses = Array.from(new Set(tests.map(test => test.courseId)))
    .map(courseId => tests.find(test => test.courseId === courseId))
    .filter(Boolean);

  const handleStartTest = (test: Test) => {
    const status = getTestStatus(test);
    if (!status.disabled) {
      console.log('Starting test:', test.id, test.name);
      navigate(`/test-taking/${test.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách bài thi</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách bài thi</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Lỗi: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách bài thi</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">Không có bài thi nào khả dụng.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách bài thi</h1>
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm bài thi
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên bài thi hoặc môn học..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo môn học
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả môn học</option>
                {uniqueCourses.map(course => (
                  <option key={course!.courseId} value={course!.courseId}>
                    {course!.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test List */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có bài thi nào</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCourse 
                ? 'Không tìm thấy bài thi phù hợp với bộ lọc'
                : 'Hiện tại không có bài thi nào khả dụng'
              }
            </p>
            {tests.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Tổng số bài thi: 0
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map(test => {
              const status = getTestStatus(test);
              return (
                <div key={test.id} className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{test.name}</h2>
                  <p className="text-gray-600 mb-4">{test.courseName}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Thời gian:</span>
                      <span className="font-medium">{test.timeLimit} phút</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Số câu:</span>
                      <span className="font-medium">{test.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Điểm tối đa:</span>
                      <span className="font-medium">{test.totalScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {test.difficulty === 'easy' ? 'Dễ' :
                       test.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                    
                    <button
                      onClick={() => handleStartTest(test)}
                      disabled={status.disabled}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        status.disabled
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {status.disabled ? 'Không khả dụng' : 'Bắt đầu làm bài'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestList;