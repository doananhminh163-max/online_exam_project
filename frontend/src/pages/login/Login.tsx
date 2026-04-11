import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import './Login.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/login', { identifier, password });
      const { user } = response.data;
      
      login(user);
      
      if (user.role === 'ADMIN') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="brand-logo">
            <span className="brand-dot"></span>
            <h2>Exam<span>Pro</span></h2>
          </div>
          <h1>Nền tảng<br/>thi trực tuyến</h1>
          <p>Hệ thống thi tập trung hiện đại, hỗ trợ tối đa cho việc học tập, giảng dạy và đánh giá chất lượng giáo dục.</p>
          
          <div className="features-list">
             <div className="feature-item">
               <div className="feature-icon check">✓</div>
               <span>Tham gia kỳ thi mọi lúc mọi nơi</span>
             </div>
             <div className="feature-item">
               <div className="feature-icon check">✓</div>
               <span>Kết quả tức thì và phân tích chi tiết</span>
             </div>
             <div className="feature-item">
               <div className="feature-icon check">✓</div>
               <span>Bảo mật dữ liệu và chống gian lận</span>
             </div>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
               <h2>Đăng Nhập</h2>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              {error && <div className="login-error-alert">{error}</div>}
              <div className="form-group">
                <label>Email / Tên đăng nhập</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email hoặc tên đăng nhập"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-options">
                 <label className="remember-me">
                    <input type="checkbox" defaultChecked />
                    <span>Ghi nhớ đăng nhập</span>
                 </label>
                 <a href="#" className="forgot-password">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                 <span>{loading ? 'Đang xử lý...' : 'Truy cập hệ thống'}</span>
                 <LogIn size={20} />
              </button>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
