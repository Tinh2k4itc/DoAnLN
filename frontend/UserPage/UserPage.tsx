import React from 'react';
import Sidebar from './left-bar/Sidebar';
import UserForm from './UserForm';

const UserPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <UserForm />
    </div>
  );
};

export default UserPage;