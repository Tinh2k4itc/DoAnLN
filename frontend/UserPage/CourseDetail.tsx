import React, { useState } from 'react';
import CourseTests from './CourseTests';
import CourseAssignments from './CourseAssignments';
import CourseGrades from './CourseGrades';

interface CourseDetailProps {
  courseId: string | null;
  onBack: () => void;
}

const mockCourseData = {
  course1: {
    name: 'Hóa Học 12',
    code: 'CHEM12',
    teacher: 'Nguyễn Văn A',
    description: 'Khóa học Hóa học lớp 12, ôn thi THPT Quốc gia.',
  },
  course2: {
    name: 'Toán Học 12',
    code: 'MATH12',
    teacher: 'Trần Thị B',
    description: 'Khóa học Toán học lớp 12, luyện thi đại học.',
  },
};

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'assignments' | 'grades'>('tests');
  
  if (!courseId) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p>Không tìm thấy khóa học</p>
        </div>
      </div>
    );
  }

  const course = mockCourseData[courseId as keyof typeof mockCourseData];

  const tabs = [
    { id: 'tests', label: 'Bài thi', icon: '📝' },
    { id: 'assignments', label: 'Bài tập', icon: '📚' },
    { id: 'grades', label: 'Điểm', icon: '📊' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tests':
        return <CourseTests courseId={courseId} />;
      case 'assignments':
        return <CourseAssignments courseId={courseId} />;
      case 'grades':
        return <CourseGrades courseId={courseId} />;
      default:
        return <CourseTests courseId={courseId} />;
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách khóa học
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{course?.name}</h1>
          <p className="text-gray-600">Mã: {course?.code} | Giáo viên: {course?.teacher}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'tests' | 'assignments' | 'grades')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CourseDetail; 