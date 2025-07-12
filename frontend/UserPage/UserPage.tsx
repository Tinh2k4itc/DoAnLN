import React, { useEffect, useState } from 'react';
import Sidebar from './left-bar/Sidebar';
import UserForm from './my-course/user-test/UserForm';
import UserProfile from './UserProfile';
import { fetchParts, Part } from '../AdminPage/manage-part/PartApi';
import { fetchCourses, Course } from '../AdminPage/manage-course/courseApi';
import * as CourseStudentApi from '../AdminPage/manage-course/course-student/CourseStudentApi';
import { auth } from '../shared/firebase-config';
import { useNavigate } from 'react-router-dom';

const UserPage: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('my-courses');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const myCoursesRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allCourses = await fetchCourses();
      setCourses(allCourses);
      // Lấy user hiện tại
      const user = auth.currentUser;
      if (user) {
        const my: Course[] = [];
        for (const course of allCourses) {
          if (!course.id || typeof course.id !== 'string') continue;
          try {
            const students = await CourseStudentApi.getStudents(course.id);
            const normalizedStudents = students.map((s: string) =>
              s.toLowerCase().trim().replace(/^"+|"+$/g, '')
            );
            const userEmail = (user.email || '').toLowerCase().trim();
            const userUid = (user.uid || '').toLowerCase().trim();
            if (normalizedStudents.includes(userEmail) || normalizedStudents.includes(userUid)) {
              my.push(course);
            }
          } catch {}
        }
        setMyCourses(my);
      }
      setParts(await fetchParts());
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lắng nghe sự kiện custom từ sidebar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail === 'my-courses' && myCoursesRef.current) {
        myCoursesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('user-sidebar-click', handler as EventListener);
    return () => window.removeEventListener('user-sidebar-click', handler as EventListener);
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <UserProfile />;
      case 'my-courses':
      default:
        return (
          <div ref={myCoursesRef} className="max-w-5xl mx-auto mb-8">
            <h1 className="text-2xl font-bold mb-6">Khóa học của tôi</h1>
            {loading ? <div>Đang tải...</div> : (
              myCourses.length === 0 ? <div>Bạn chưa tham gia khóa học nào.</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {myCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-lg shadow p-5 flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl border border-slate-100"
                      onClick={() => navigate(`/my-course/${course.id}`)}>
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
                        <div className="text-slate-600 text-sm mb-1">Mã: <span className="font-mono">{course.code}</span></div>
                        <div className="text-slate-600 text-sm mb-1">Khoa: {course.department}</div>
                        <div className="text-slate-600 text-sm mb-1">Số tín chỉ: {course.credits}</div>
                        <div className="text-slate-500 text-xs mt-2">{course.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      <Sidebar activeItemId={activeSection} onItemClick={setActiveSection} onExpandChange={setIsSidebarExpanded} />
      <div className={`user-main-content flex-1 p-8${!isSidebarExpanded ? ' sidebar-collapsed' : ''}`}>
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default UserPage;