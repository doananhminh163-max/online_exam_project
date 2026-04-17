import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { TrendingUp, Users, Clock, Trophy, ChevronRight, Search, RefreshCw, Printer } from 'lucide-react';
import api from '../../services/api';
import './TeacherReports.css';

interface ExamReport {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    totalStudents: number;
    attempted: number;
    passed: number;
    failed: number;
    notAttempted: number;
}

interface RankingItem {
    id: number;
    score: number;
    duration: number;
    start_time: string;
    user: {
        id: number;
        full_name: string;
        code: string;
        image: string | null;
    };
}

const TeacherReports: React.FC = () => {
    const [reports, setReports] = useState<ExamReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExam, setSelectedExam] = useState<ExamReport | null>(null);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [rankingLoading, setRankingLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/admin/reports/exams');
            setReports(response.data);
        } catch (error) {
            console.error('Fetch reports error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRanking = async (examId: number) => {
        setRankingLoading(true);
        try {
            const response = await api.get(`/admin/reports/exams/${examId}/ranking`);
            setRanking(response.data);
        } catch (error) {
            console.error('Fetch ranking error:', error);
        } finally {
            setRankingLoading(false);
        }
    };

    const handleViewRanking = (exam: ExamReport) => {
        setSelectedExam(exam);
        fetchRanking(exam.id);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        return `${minutes}ph ${seconds}s`;
    };

    const filteredReports = reports.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="dashboard-container">
                <TeacherSidebar />
                <main className="dashboard-main">
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Đang tải báo cáo...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <TeacherSidebar />
            <main className="dashboard-main">
                <div className="reports-container">
                    <header className="reports-header">
                        <div className="header-title">
                            <div className="icon-badge">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h1>Báo cáo & Thống kê</h1>
                                <p>Phân tích kết quả và xếp hạng thí sinh</p>
                            </div>
                        </div>
                        <div className="header-search">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm môn thi..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </header>

                    {!selectedExam ? (
                        <div className="reports-grid">
                            {filteredReports.map((report) => {
                                const passRate = report.attempted > 0 
                                    ? Math.round((report.passed / report.attempted) * 100) 
                                    : 0;
                                
                                return (
                                    <div key={report.id} className="report-card">
                                        <div className="report-card-header">
                                            <h3>{report.name}</h3>
                                            <button 
                                                className="btn-view-ranking"
                                                onClick={() => handleViewRanking(report)}
                                            >
                                                Xem xếp hạng <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        
                                        <div className="stats-row">
                                            <div className="mini-stat">
                                                <span className="label">Tham gia</span>
                                                <span className="value">{report.attempted}/{report.totalStudents}</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="label">Tỷ lệ đạt</span>
                                                <span className="value highlight">{passRate}%</span>
                                            </div>
                                        </div>

                                        <div className="participation-bar">
                                            <div 
                                                className="bar-segment passed" 
                                                style={{ width: `${(report.passed / report.totalStudents) * 100}%` }}
                                                title={`Đạt: ${report.passed}`}
                                            ></div>
                                            <div 
                                                className="bar-segment failed" 
                                                style={{ width: `${(report.failed / report.totalStudents) * 100}%` }}
                                                title={`Chưa đạt: ${report.failed}`}
                                            ></div>
                                            <div 
                                                className="bar-segment pending" 
                                                style={{ width: `${(report.notAttempted / report.totalStudents) * 100}%` }}
                                                title={`Chưa làm: ${report.notAttempted}`}
                                            ></div>
                                        </div>

                                        <div className="legend">
                                            <span className="legend-item"><span className="dot passed"></span> Đạt: {report.passed}</span>
                                            <span className="legend-item"><span className="dot failed"></span> Chưa đạt: {report.failed}</span>
                                            <span className="legend-item"><span className="dot pending"></span> Chưa làm: {report.notAttempted}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="ranking-view">
                            <div className="back-nav">
                                <button className="btn-back no-print" onClick={() => setSelectedExam(null)}>
                                    <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Quay lại danh sách
                                </button>
                                <div className="ranking-header-detail">
                                    <h2>Bảng xếp hạng: {selectedExam.name}</h2>
                                    <button className="btn-print no-print" onClick={handlePrint}>
                                        <Printer size={18} /> In báo cáo
                                    </button>
                                </div>
                            </div>

                            <div className="ranking-summary-print">
                                <div className="print-stat-item">
                                    <span className="label">Tổng thí sinh:</span>
                                    <span className="value">{selectedExam.totalStudents}</span>
                                </div>
                                <div className="print-stat-item">
                                    <span className="label">Đã tham gia:</span>
                                    <span className="value">{selectedExam.attempted}</span>
                                </div>
                                <div className="print-stat-item">
                                    <span className="label">Đạt:</span>
                                    <span className="value pass">{selectedExam.passed}</span>
                                </div>
                                <div className="print-stat-item">
                                    <span className="label">Chưa đạt:</span>
                                    <span className="value fail">{selectedExam.failed}</span>
                                </div>
                                <div className="print-stat-item">
                                    <span className="label">Chưa làm:</span>
                                    <span className="value">{selectedExam.notAttempted}</span>
                                </div>
                            </div>

                            {rankingLoading ? (
                                <div className="loading-ranking">
                                    <RefreshCw className="animate-spin" />
                                    <p>Đang tải bảng xếp hạng...</p>
                                </div>
                            ) : ranking.length > 0 ? (
                                <div className="ranking-table-container">
                                    <table className="ranking-table">
                                        <thead>
                                            <tr>
                                                <th>Hạng</th>
                                                <th>Thí sinh</th>
                                                <th>Mã số</th>
                                                <th>Điểm số</th>
                                                <th>Thời gian</th>
                                                <th>Ngày thực hiện</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ranking.map((item, index) => (
                                                <tr key={item.id} className={index < 3 ? `top-${index + 1}` : ''}>
                                                    <td className="rank-cell">
                                                        {index < 3 ? (
                                                            <Trophy size={20} className={`trophy-${index + 1}`} />
                                                        ) : (
                                                            index + 1
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="student-info-cell">
                                                            <div className="avatar-mini">
                                                                {item.user.image ? (
                                                                    <img src={`http://localhost:8080${item.user.image}`} alt="" />
                                                                ) : (
                                                                    <span className="initial">{item.user.full_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <span>{item.user.full_name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.user.code}</td>
                                                    <td className="score-cell">
                                                        <span className={`score-badge ${item.score >= 5 ? 'pass' : 'fail'}`}>
                                                            {item.score.toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="duration-cell">
                                                            <Clock size={14} />
                                                            {formatDuration(item.duration)}
                                                        </div>
                                                    </td>
                                                    <td>{new Date(item.start_time).toLocaleDateString('vi-VN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-ranking">
                                    <Users size={48} />
                                    <p>Chưa có thí sinh nào thực hiện môn thi này.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherReports;
