import React from 'react';

const UserForm: React.FC = () => {
  return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold text-slate-800 mb-4">Welcome, Student!</h1>
        <p className="text-slate-600 text-lg">
          Select an option from the menu to view your information.
        </p>
        {/* Placeholder for dynamic content based on sidebar selection */}
      </div>
    </main>
  );
};

export default UserForm;