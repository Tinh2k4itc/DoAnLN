import React, { useState } from 'react';
import Sidebar from './left-bar/Sidebar';
import AdminDashboard from './Dashboard';
import AdminReport from './Report';
import AdminTestResults from './TestResults';
import ManageCourse from './manage-course/ManageCourse';
import ManagePart from './manage-part/ManagePart';
import ManageQuestion from './manage-question/ManageQuestion';
import ManageUser from './manage-user/ManageUser';
import ManageTest from './manage-test/ManageTest';
import Profile from './Profile';

const AdminForm: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'profile':
        return <Profile />;
      case 'report':
        return <AdminReport />;
      case 'test-results':
        return <AdminTestResults />;
      case 'manage-courses':
        return <ManageCourse />;
      case 'manage-parts':
        return <ManagePart />;
      case 'manage-questions':
        return <ManageQuestion />;
      case 'manage-users':
        return <ManageUser />;
      case 'manage-tests':
        return <ManageTest />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-slate-500">Chọn một mục từ sidebar để quản lý nội dung.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeItemId={activeSection} 
        onItemClick={setActiveSection} 
        menuItems={[
          { id: 'dashboard', label: 'Dashboard tổng quan' },
          { id: 'manage-courses', label: 'Quản lý khóa học' },
          { id: 'manage-parts', label: 'Quản lý phần học' },
          { id: 'manage-questions', label: 'Quản lý câu hỏi' },
          { id: 'manage-tests', label: 'Quản lý bài thi' },
          { id: 'manage-users', label: 'Quản lý người dùng' },
          { id: 'test-results', label: 'Kết quả thi' },
          { id: 'report', label: 'Báo cáo & Thống kê' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50 text-slate-800">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default AdminForm;