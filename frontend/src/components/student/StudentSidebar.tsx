import React, { useState } from 'react';
import { BookOpen, Activity, CheckCircle, User, LogOut, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentSidebar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <span className="brand-dot"></span>
        </div>
        <h2 className="brand-text">Exam<span className="text-primary">Pro</span></h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/student/dashboard') ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/dashboard'); }}>
              <Activity size={20}/> <span>Tổng quan</span>
            </a>
          </li>
          <li className={isActive('/student/exams') ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/exams'); }}>
              <BookOpen size={20}/> <span>Kỳ thi của tôi</span>
            </a>
          </li>
          <li className={isActive('/student/results') ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/results'); }}>
              <CheckCircle size={20}/> <span>Kết quả</span>
            </a>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="profile-menu-container">
          {showMenu && (
            <div className="profile-dropdown">
              <button className="dropdown-item">
                <User size={18} />
                <span>Trang cá nhân</span>
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
          <div 
            className={`user-profile ${showMenu ? 'active' : ''}`} 
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="user-info">
              <span className="user-name">{user?.full_name || user?.username || 'Sinh viên'}</span>
              <span className="user-role">{user?.role === 'ADMIN' ? 'Giảng viên' : 'Học sinh'}</span>
            </div>
            <ChevronUp 
              size={18} 
              className={`menu-arrow ${showMenu ? 'rotate' : ''}`} 
              style={{ marginLeft: 'auto', color: '#94a3b8' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
