import React, { useState } from 'react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import DashboardHeader from '../../components/teacher/DashboardHeader';
import StatGrid from '../../components/teacher/StatGrid';
import RecentExams from '../../components/teacher/RecentExams';
import QuickActions from '../../components/teacher/QuickActions';
import CreateExamModal from '../../components/teacher/CreateExamModal';
import ImportModal from '../../components/teacher/ImportModal';
import './TeacherDashboard.css';

export const TeacherDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'questions' | 'students'>('questions');

  const handleImportClick = (type: 'questions' | 'students') => {
    setImportType(type);
    setIsImportModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Component */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Header Component */}
        <DashboardHeader />

        {/* Overview Info Boxes */}
        <StatGrid />

        {/* Nội dung chi tiết */}
        <section className="dashboard-content">
           <RecentExams />
           <QuickActions onImportClick={handleImportClick} />
        </section>
      </main>

      {/* Modal Creating Exam */}
      <CreateExamModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Import Data Modal */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type={importType}
      />
    </div>
  );
};

export default TeacherDashboard;
