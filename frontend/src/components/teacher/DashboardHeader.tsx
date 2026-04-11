import React from 'react';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  // onCreateClick: () => void; (Removed as per user request)
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  return (
    <header className="main-header">
      <div className="header-greeting">
        <h1>Chào mừng trở lại, Thầy A 👋</h1>
        <p>Đây là tổng quan về tình hình các học phần và môn thi hôm nay.</p>
      </div>
    </header>
  );
};

export default DashboardHeader;
