import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const teacherName = user?.full_name || 'Giảng viên';

  return (
    <header className="main-header">
      <div className="header-greeting">
        <h1>Chào mừng trở lại, {teacherName} 👋</h1>
      </div>
    </header>
  );
};

export default DashboardHeader;
