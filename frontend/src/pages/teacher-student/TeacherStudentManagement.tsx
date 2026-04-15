import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { UserPlus, Search, Edit, Trash2, Mail, ArrowUpDown, Download, Eye, X, Hash } from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import './TeacherStudentManagement.css';

interface Student {
    id: number;
    code: string;
    full_name: string;
    email: string;
    role: string;
}

const TeacherStudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // States for Add Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ full_name: '', email: '', code: '' });

    // States for Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editForm, setEditForm] = useState({ full_name: '', email: '', code: '' });

    // States for Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof Student, direction: 'asc' | 'desc' } | null>(null);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const sortedStudents = [...students].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredStudents = sortedStudents.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSort = (key: keyof Student) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setIsSortDropdownOpen(false);
    };

    const handleExport = () => {
        const dataToExport = filteredStudents.map(s => ({
            'Mã sinh viên': s.code,
            'Họ và tên': s.full_name,
            'Email': s.email
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');
        XLSX.writeFile(wb, 'Danh_sach_sinh_vien.xlsx');
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/students', addForm);
            setIsAddModalOpen(false);
            setAddForm({ full_name: '', email: '', code: '' });
            fetchStudents();
            alert(`Thêm sinh viên thành công!\nMật khẩu ngẫu nhiên: ${res.data.generatedPassword}\nHãy ghi lại mật khẩu này để cung cấp cho thí sinh.`);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Lỗi khi thêm sinh viên');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
            try {
                await api.delete(`/admin/students/${id}`);
                fetchStudents();
            } catch (error) {
                alert('Lỗi khi xóa sinh viên');
            }
        }
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setEditForm({ full_name: student.full_name, email: student.email, code: student.code });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        try {
            await api.put(`/admin/students/${editingStudent.id}`, editForm);
            setIsEditModalOpen(false);
            fetchStudents();
        } catch (error) {
            alert('Lỗi khi cập nhật thông tin sinh viên');
        }
    };

    return (
        <div className="dashboard-container">
            <TeacherSidebar />

            <main className="dashboard-main student-management">
                <div className="page-header">
                    <div className="header-title">
                        <h1>Quản lý Thí sinh</h1>
                        <p>Theo dõi và quản lý tài khoản sinh viên trong hệ thống</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={handleExport}>
                            <Download size={18} />
                            <span>Xuất dữ liệu</span>
                        </button>
                        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                            <UserPlus size={18} />
                            <span>Thêm sinh viên</span>
                        </button>
                    </div>
                </div>

                <div className="management-toolbar">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã sinh viên, tên hoặc email..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="toolbar-filters">
                        <div className="sort-dropdown-container">
                            <button className="btn-filter" onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}>
                                <ArrowUpDown size={18} />
                                <span>Sắp xếp</span>
                            </button>
                            {isSortDropdownOpen && (
                                <div className="sort-menu">
                                    <button className={`sort-item ${sortConfig?.key === 'code' ? 'active' : ''}`} onClick={() => handleSort('code')}>
                                        Theo mã sinh viên
                                    </button>
                                    <button className={`sort-item ${sortConfig?.key === 'full_name' ? 'active' : ''}`} onClick={() => handleSort('full_name')}>
                                        Theo họ và tên
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    {loading ? (
                        <div className="loading-state">Đang tải danh sách thí sinh...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('code')} style={{ cursor: 'pointer' }}>
                                            Mã sinh viên {sortConfig?.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer' }}>
                                            Họ và tên {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                            Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="action-col">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="empty-state">Không tìm thấy sinh viên nào.</td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <tr key={student.id}>
                                                <td>
                                                    <div className="code-cell">
                                                        <Hash size={14} className="cell-icon" />
                                                        <span className="code-text">{student.code}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar">
                                                            {student.full_name.charAt(0)}
                                                        </div>
                                                        <span className="user-name-text">{student.full_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="email-cell">
                                                        <Mail size={14} className="cell-icon" />
                                                        {student.email}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon view"
                                                            title="Xem thông tin các bài thi của thí sinh"
                                                            onClick={() => alert('Chức năng xem kết quả chi tiết đang được phát triển')}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className="btn-icon edit" title="Chỉnh sửa thông tin thí sinh" onClick={() => openEditModal(student)}>
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn-icon delete" title="Xóa thí sinh này" onClick={() => handleDelete(student.id)}>
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

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container premium-modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Thêm sinh viên mới</h2>
                            <button className="btn-close-circle" onClick={() => setIsAddModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label>Mã sinh viên</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="Ví dụ: SV001"
                                        value={addForm.code}
                                        onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="Nhập tên đầy đủ"
                                        value={addForm.full_name}
                                        onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="premium-input"
                                        placeholder="example@gmail.com"
                                        value={addForm.email}
                                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary-flat" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-primary-gradient">Thêm sinh viên</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container premium-modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Chỉnh sửa thông tin sinh viên</h2>
                            <button className="btn-close-circle" onClick={() => setIsEditModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label>Mã sinh viên</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        value={editForm.code}
                                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="premium-input"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary-flat" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-primary-gradient">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudentManagement;
