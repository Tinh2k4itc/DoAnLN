import React from 'react';

interface MyCoursesProps {
  onCourseSelect: (courseId: string) => void;
}

const mockCourses = [
  {
    id: 'course1',
    name: 'Hóa Học 12',
    code: 'CHEM12',
    description: 'Khóa học Hóa học lớp 12, ôn thi THPT Quốc gia.',
    credits: 3,
    teacher: 'Nguyễn Văn A',
    status: 'Đang học',
  },
  {
    id: 'course2',
    name: 'Toán Học 12',
    code: 'MATH12',
    description: 'Khóa học Toán học lớp 12, luyện thi đại học.',
    credits: 4,
    teacher: 'Trần Thị B',
    status: 'Đã hoàn thành',
  },
];

const MyCourses: React.FC<MyCoursesProps> = ({ onCourseSelect }) => {
  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Khóa học của tôi</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-700 mb-1">{course.name}</h2>
                <p className="text-sm text-gray-500 mb-2">Mã: {course.code} | Số tín chỉ: {course.credits}</p>
                <p className="text-gray-700 mb-2">{course.description}</p>
                <p className="text-sm text-gray-600">Giáo viên: <span className="font-medium">{course.teacher}</span></p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.status === 'Đang học' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{course.status}</span>
                <button 
                  onClick={() => onCourseSelect(course.id)}
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCourses; 