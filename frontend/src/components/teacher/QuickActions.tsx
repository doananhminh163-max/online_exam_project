import React from 'react';
import { Database, Users, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  onImportClick: (type: 'questions' | 'students') => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onImportClick }) => {
  return (
    <div className="content-card quick-actions">
      <div className="card-header">
        <h2>Hành Động Nhanh</h2>
      </div>
      <div className="card-body">
        <div className="action-grid">
          <button 
            className="action-button group" 
            onClick={() => onImportClick('questions')}
          >
            <div className="action-icon action-import"><Database size={24} /></div>
            <div className="action-button-content">
              <span>Nhập Ngân Hàng Câu Hỏi</span>
              <p>Tải lên Excel/CSV</p>
            </div>
            <ChevronRight className="action-arrow" size={20} />
          </button>
          <button 
            className="action-button group"
            onClick={() => onImportClick('students')}
          >
            <div className="action-icon action-students"><Users size={24} /></div>
            <div className="action-button-content">
              <span>Nhập Danh Sách Sinh Viên</span>
              <p>Tải lên Excel/CSV</p>
            </div>
            <ChevronRight className="action-arrow" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
