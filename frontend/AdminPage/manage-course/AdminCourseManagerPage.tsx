import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseSidebar from './left-bar/CourseSidebar';
import ManagePart from '../manage-part/ManagePart';
import ManageQuestion from '../manage-question/ManageQuestion';
import ExamResults from '../manage-tests/ExamResults';
import CourseStudentManager from './course-student/CourseStudentManager';

const AdminCourseManagerPage: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CourseSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Mã môn học: {id}</h1>
        {activeTab === 'questions' && <ManageQuestion courseId={id} />}
        {activeTab === 'tests' && <ManagePart courseId={id} />}
        {activeTab === 'scores' && <ExamResults courseId={id} />}
        {activeTab === 'students' && id && <CourseStudentManager courseId={id} />}
      </main>
    </div>
  );
};

export default AdminCourseManagerPage; 