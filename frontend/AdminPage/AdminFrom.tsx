// AdminForm.tsx
import React, { useState } from 'react';
import Sidebar from './left-bar/Sidebar';
import CourseCreateForm from './manage-course/CourseCreateForm';
import CourseUpdateForm from  './manage-course/CourseUpdateForm';

const AdminForm: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'manage-courses':
        return (
          <div className="space-y-6">
            <CourseCreateForm />
            <CourseUpdateForm />
          </div>
        );
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