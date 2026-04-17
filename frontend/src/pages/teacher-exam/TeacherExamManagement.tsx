import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { Plus, Edit, Trash2, Calendar, Clock, BookOpen, Shield, X } from 'lucide-react';
import api from '../../services/api';
import './TeacherExamManagement.css';

interface Exam {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    duration_mins: number;
    attempts_num: number;
    questions_num: number;
}

export const TeacherExamManagement: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        start_time: '',
        end_time: '',
        duration_mins: 60,
        attempts_num: 1,
        questions_num: 10
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/exams');
            setExams(res.data);
        } catch (error) {
            console.error('Failed to fetch exams', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (exam?: Exam) => {
        if (exam) {
            setEditingExam(exam);
            setFormData({
                name: exam.name,
                start_time: exam.start_time.split('.')[0].slice(0, 16), // Format to datetime-local
                end_time: exam.end_time.split('.')[0].slice(0, 16),
                duration_mins: exam.duration_mins,
                attempts_num: exam.attempts_num,
                questions_num: exam.questions_num || 0
            });
        } else {
            setEditingExam(null);
            setFormData({
                name: '',
                start_time: '',
                end_time: '',
                duration_mins: 60,
                attempts_num: 1,
                questions_num: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // ISO format handling
            const dataToSubmit = {
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString()
            };

            if (editingExam) {
                await api.put(`/exams/${editingExam.id}`, dataToSubmit);
            } else {
                await api.post('/exams', dataToSubmit);
            }
            setIsModalOpen(false);
            fetchExams();
        } catch (error) {
            console.error('Failed to save exam', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa môn thi này? Hành động này không thể hoàn tác.')) {
            try {
                await api.delete(`/exams/${id}`);
                fetchExams();
            } catch (error) {
                console.error('Failed to delete exam', error);
                alert('Có lỗi xảy ra khi xóa.');
            }
        }
    };

    return (
        <div className="dashboard-container">
            <TeacherSidebar />

            <main className="dashboard-main exam-management">
                <div className="page-header">
                    <div className="header-title">
                        <h1>Quản lý Môn thi</h1>
                        <p>Danh sách và cấu hình các bài thi trong hệ thống</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Tạo Môn thi</span>
                    </button>
                </div>

                <div className="content-card">
                    {loading ? (
                        <div className="loading-state">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Tên Môn thi</th>
                                        <th>Thời gian</th>
                                        <th>Thời lượng</th>
                                        <th>SỐ CÂU</th>
                                        <th>Lượt làm bài</th>
                                        <th className="action-col">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="empty-state">Chưa có môn thi nào.</td>
                                        </tr>
                                    ) : (
                                        exams.map(exam => (
                                            <tr key={exam.id}>
                                                <td className="font-semibold">{exam.name}</td>
                                                <td>
                                                    <div className="time-col">
                                                        <span className="time-item"><Calendar size={14} /> {new Date(exam.start_time).toLocaleString()}</span>
                                                        <span className="time-item text-muted">đến {new Date(exam.end_time).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td><Clock size={14} className="inline-icon" /> {exam.duration_mins} phút</td>
                                                <td><BookOpen size={14} className="inline-icon" /> {exam.questions_num} câu</td>
                                                <td>{exam.attempts_num} lần</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-icon edit" onClick={() => handleOpenModal(exam)}>
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn-icon delete" onClick={() => handleDelete(exam.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container premium-modal">
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <h2>{editingExam ? 'Chỉnh sửa Môn thi' : 'Tạo Môn thi Mới'}</h2>
                                <p>{editingExam ? 'Cập nhật thông tin cấu hình cho môn thi' : 'Thiết lập thông số cho môn thi mới trên hệ thống'}</p>
                            </div>
                            <button className="btn-close-circle" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-sections">
                                <div className="form-group full-width">
                                    <label>Tên môn thi <span className="text-danger">*</span></label>
                                    <div className="premium-input-wrapper">
                                        <BookOpen size={20} className="input-icon" />
                                        <input 
                                            type="text" 
                                            name="name" 
                                            placeholder="Ví dụ: Kiểm tra Giữa kỳ II - Lập trình Java"
                                            value={formData.name} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Thời gian mở bài <span className="text-danger">*</span></label>
                                        <div className="premium-input-wrapper">
                                            <Calendar size={20} className="input-icon" />
                                            <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian đóng bài <span className="text-danger">*</span></label>
                                        <div className="premium-input-wrapper">
                                            <Calendar size={20} className="input-icon" />
                                            <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Thời lượng (phút) <span className="text-danger">*</span></label>
                                        <div className="premium-input-wrapper">
                                            <Clock size={20} className="input-icon" />
                                            <input type="number" name="duration_mins" value={formData.duration_mins} onChange={handleInputChange} min="1" required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Số lần làm tối đa <span className="text-danger">*</span></label>
                                        <div className="premium-input-wrapper">
                                            <Shield size={20} className="input-icon" />
                                            <input type="number" name="attempts_num" value={formData.attempts_num} onChange={handleInputChange} min="1" required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Số lượng câu hỏi <span className="text-danger">*</span></label>
                                        <div className="premium-input-wrapper">
                                            <BookOpen size={20} className="input-icon" />
                                            <input type="number" name="questions_num" value={formData.questions_num} onChange={handleInputChange} min="0" required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary-flat" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-primary-gradient">
                                    <span>{editingExam ? 'Cập nhật thay đổi' : 'Khởi tạo môn thi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherExamManagement;
