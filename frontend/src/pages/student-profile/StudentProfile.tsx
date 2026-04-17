import React, { useState, useRef } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { Mail, Hash, User, Clock, Camera, Key, Lock, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import './StudentProfile.css';

const StudentProfile: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    if (!user) {
        return (
            <StudentLayout>
                <div className="profile-container">
                    <p>Đang tải thông tin...</p>
                </div>
            </StudentLayout>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            await api.post('/student/profile/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await refreshUser();
            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }

        setChangingPassword(true);
        try {
            await api.post('/student/profile/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Hệ thống sẽ tự đăng xuất sau 2 giây...' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            
            // Auto logout after 2 seconds
            setTimeout(() => {
                logout();
            }, 2000);
            
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <StudentLayout>
            <div className="profile-container">
                
                {/* Profile Hero */}
                <div className="profile-hero">
                    <div className="avatar-section">
                        <div className="avatar-wrapper" onClick={handleAvatarClick}>
                            {user.image ? (
                                <img 
                                    src={`http://localhost:8080${user.image}`} 
                                    alt={user.full_name} 
                                    className="profile-avatar-img"
                                />
                            ) : (
                                <span className="avatar-initials">{getInitials(user.full_name)}</span>
                            )}
                            <div className="avatar-upload-overlay">
                                <Camera size={24} />
                            </div>
                            {uploading && (
                                <div className="avatar-loading">
                                    <RefreshCw className="animate-spin" size={32} />
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                        />
                    </div>
                    
                    <div className="hero-info">
                        <span className="hero-role-badge">
                            {user.role === 'ADMIN' ? 'Giảng viên' : 'Sinh viên'}
                        </span>
                        <h1>{user.full_name}</h1>
                    </div>
                </div>

                <div className="profile-grid-main">
                    {/* Left Column - Info */}
                    <div className="profile-column">
                        <h2 className="section-title">
                            <ShieldCheck size={20} /> Thông tin cá nhân
                        </h2>
                        <div className="profile-details-grid">
                            <div className="info-card">
                                <div className="info-icon-wrap primary">
                                    <User size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Họ và tên</span>
                                    <span className="info-value">{user.full_name}</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon-wrap purple">
                                    <Hash size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Mã số {user.role === 'ADMIN' ? 'GV' : 'SV'}</span>
                                    <span className="info-value">{user.code || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon-wrap warning">
                                    <Mail size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Email liên hệ</span>
                                    <span className="info-value">{user.email || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon-wrap success">
                                    <Clock size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Trạng thái</span>
                                    <span className="info-value">Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Change Password */}
                    <div className="profile-column">
                        <h2 className="section-title">
                            <Key size={20} /> Đổi mật khẩu
                        </h2>
                        <div className="password-card">
                            <form onSubmit={handlePasswordChange}>
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} />
                                        <input 
                                            type={showOldPassword ? "text" : "password"} 
                                            placeholder="Nhập mật khẩu cũ"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <div className="input-with-icon">
                                        <Key size={18} />
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <div className="input-with-icon">
                                        <ShieldCheck size={18} />
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {passwordMessage.text && (
                                    <div className={`form-message ${passwordMessage.type}`}>
                                        {passwordMessage.text}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="btn-change-password"
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? <RefreshCw className="animate-spin" size={18} /> : 'Cập nhật mật khẩu'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </StudentLayout>
    );
};

export default StudentProfile;
