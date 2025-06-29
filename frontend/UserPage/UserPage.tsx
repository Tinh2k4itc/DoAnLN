import React, { useState, useEffect } from 'react';
import Sidebar from './left-bar/Sidebar';
import TestList from './TestList';
import TestTaking from './TestTaking';
import TestResult from './TestResult';
import MyCourses from './MyCourses';
import CourseDetail from './CourseDetail';
import UserDashboard from './UserDashboard';
import UserProfile from './UserProfile';
import UserNotifications from './UserNotifications';
import { useParams } from 'react-router-dom';
import MyAssignments from './MyAssignments';
import MyGrades from './MyGrades';

const UserPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { testId } = useParams<{ testId: string }>();

  useEffect(() => {
    console.log('UserPage mounted with activeSection:', activeSection);
  }, [activeSection]);

  const handleSectionChange = (section: string) => {
    console.log('Changing section from', activeSection, 'to', section);
    setActiveSection(section);
    setSelectedCourse(null); // Reset selected course when changing section
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setActiveSection('course-detail');
  };

  const handleNavigateTo = (section: string) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    console.log('Rendering active section:', activeSection);
    switch (activeSection) {
      case 'dashboard':
        return <UserDashboard onNavigateTo={handleNavigateTo} />;
      case 'courses':
        return <MyCourses onCourseSelect={handleCourseSelect} />;
      case 'course-detail':
        return <CourseDetail courseId={selectedCourse} onBack={() => setActiveSection('courses')} />;
      case 'tests':
        return <TestList />;
      case 'my-assignments':
        return <MyAssignments />;
      case 'my-grades':
        return <MyGrades />;
      case 'profile':
        return <UserProfile onBack={() => setActiveSection('dashboard')} />;
      case 'notifications':
        return <UserNotifications onBack={() => setActiveSection('dashboard')} />;
      case 'settings':
        return (
          <div className="flex-1 p-6 lg:p-8">
            <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col items-center justify-center">
              <h1 className="text-3xl font-semibold text-slate-800 mb-4">Cài đặt</h1>
              <p className="text-slate-600 text-lg">
                Tính năng đang được phát triển.
              </p>
            </div>
          </div>
        );
      default:
        console.log('Default case, rendering UserDashboard');
        return <UserDashboard onNavigateTo={handleNavigateTo} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeItemId={activeSection} onItemClick={handleSectionChange} />
      <main className="flex-1 overflow-auto">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default UserPage;