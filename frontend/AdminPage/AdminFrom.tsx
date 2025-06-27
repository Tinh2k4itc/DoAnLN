// AdminForm.tsx
import React, { useState } from 'react';
import Sidebar from './left-bar/Sidebar';
import CourseCreateForm from './manage-course/CourseCreateForm';
import CourseUpdateForm from  './manage-course/CourseUpdateForm';
import ManageCourse from './manage-course/ManageCourse';
import ManagePart from './manage-part/ManagePart';
import ManageQuestion from './manage-question/ManageQuestion';
import ManageUser from './manage-user/ManageUser';

const AdminForm: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'manage-courses':
        return <ManageCourse />;
      case 'manage-parts':
        return <ManagePart />;
      case 'manage-questions':
        return <ManageQuestion />;
      case 'manage-users':
        return <ManageUser />;
      case 'dashboard':
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-slate-500">Select an item from the sidebar to manage content.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeItemId={activeSection} 
        onItemClick={setActiveSection} 
      />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white text-slate-800">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default AdminForm;