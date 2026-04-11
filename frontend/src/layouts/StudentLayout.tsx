import React from 'react';
import StudentSidebar from '../components/student/StudentSidebar';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-container">
      <StudentSidebar />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;
