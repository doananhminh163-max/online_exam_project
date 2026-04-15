import React, { useState } from 'react';
import { BookOpen, Users, Database, Activity, TrendingUp, User, LogOut, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherSidebar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

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
          <li className={isActive('/teacher/dashboard')}><Link to="/teacher/dashboard"><Activity size={20}/> <span>Tổng quan</span></Link></li>
          <li className={isActive('/teacher/exams')}><Link to="/teacher/exams"><BookOpen size={20}/> <span>Quản lý Môn thi</span></Link></li>
          <li className={isActive('/teacher/questions')}><Link to="/teacher/questions"><Database size={20}/> <span>Ngân hàng câu hỏi</span></Link></li>
          <li className={isActive('/teacher/students')}><Link to="/teacher/students"><Users size={20}/> <span>Thí sinh</span></Link></li>
          <li><Link to="#reports"><TrendingUp size={20}/> <span>Báo cáo & Thống kê</span></Link></li>
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
              <span className="user-name">{user?.full_name || 'Giảng viên'}</span>
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

export default TeacherSidebar;
