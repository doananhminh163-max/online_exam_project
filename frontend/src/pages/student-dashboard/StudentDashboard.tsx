import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, BookOpen, ChevronRight, X, PlayCircle, AlertCircle, Activity, Repeat, Target } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/student/exams');
        setExams(response.data);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const openExams = exams.filter(exam => {
    const remaining = exam.attempts_num - (exam.exam_attempts?.length || 0);
    return remaining > 0;
  });

  

  const handleStartExam = async (exam: any) => {
    const confirmStart = window.confirm(
      `BẠN CÓ CHẮC CHẮN MUỐN BẮT ĐẦU BÀI THI?\n\n` +
      `Môn thi: ${exam.name}\n` +
      `Thời gian: ${exam.duration_mins} phút\n\n` +
      `Lưu ý: Sau khi bắt đầu, thời gian sẽ bắt đầu tính ngược và không thể tạm dừng.`
    );
    
    if (confirmStart) {
      try {
        const response = await api.post(`/student/exams/${exam.id}/start`);
        const { attemptId, questions } = response.data;
        // Navigate to TakeExam and pass attemptId + questions in state
        navigate(`/student/exam/${exam.id}`, { 
          state: { attemptId, initialQuestions: questions } 
        });
      } catch (error: any) {
        console.error('Failed to start exam:', error);
        alert(error.response?.data?.message || 'Không thể bắt đầu bài thi. Vui lòng thử lại.');
      }
    }
  };

  const resultsByExam = exams.reduce((acc, exam) => {
    const attempts = exam.exam_attempts || [];
    if (attempts.length > 0) {
      const maxScore = Math.max(...attempts.map((a: any) => a.score || 0));
      acc[exam.id] = {
        examId: exam.id,
        examName: exam.name,
        maxScore: maxScore
      };
    }
    return acc;
  }, {} as any);

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Header */}
      <header className="main-header">
        <div className="header-greeting">
          <h1>Chào mừng, {user?.full_name?.replace(/^SV\.\s*/i, '') || 'Sinh viên'}! 👋</h1>
        </div>
      </header>


      {/* Content Area */}
      <div className="dashboard-content">
        {/* Open Exams Card */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap primary">
                <BookOpen size={20} />
              </div>
              <h2>Kỳ thi đang mở</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="exam-cards-container">
              {openExams.length > 0 ? (
                openExams.map((exam, idx) => {
                  const remainingAttempts = exam.attempts_num - (exam.exam_attempts?.length || 0);
                  const getStatus = () => {
                    const now = new Date();
                    const start = new Date(exam.start_time);
                    const end = new Date(exam.end_time);
                    if (now < start) return { label: 'Sắp diễn ra', class: 'status-draft' };
                    if (now >= start && now <= end) return { label: 'Đang diễn ra', class: 'status-active' };
                    return { label: 'Đã kết thúc', class: 'status-completed' };
                  };
                  const status = getStatus();

                  return (
                    <div
                      key={exam.id}
                      className="student-exam-card"
                      onClick={() => {
                        setSelectedExam(exam);
                        setShowModal(true);
                      }}
                      style={{ animationDelay: `${0.1 * idx}s` }}
                    >
                      <div className="exam-card-top">
                        <div className="exam-card-icon">
                          <BookOpen size={20} />
                        </div>
                        <span className={`status-badge ${status.class}`}>{status.label}</span>
                      </div>
                      <div className="exam-card-info">
                        <h3>{exam.name}</h3>
                        <div className="exam-meta">
                          <span><Clock size={15} /> {exam.duration_mins} phút</span>
                          <span><Activity size={15} /> {exam.questions_num || 0} câu hỏi</span>
                        </div>
                      </div>
                      <div className="exam-card-footer">
                        <div className="exam-attempts-info">
                          <Repeat size={15} />
                          <span>Còn <strong>{remainingAttempts}</strong> lượt</span>
                        </div>
                        <div className="exam-card-arrow">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-exams-dash">
                  <CheckCircle size={48} />
                  <h3>Tuyệt vời! 🎉</h3>
                  <p>Bạn đã hoàn thành tất cả các kỳ thi hiện có.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Final Results Summary Table */}
        <div className="content-card dashboard-chart-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap primary">
                <Target size={20} />
              </div>
              <div>
                <h2>Bảng điểm tổng kết</h2>
              </div>
            </div>
          </div>
          <div className="card-body">
            {Object.keys(resultsByExam).length > 0 ? (
              <div className="table-responsive">
                <table className="exams-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>MÔN THI</th>
                      <th>ĐIỂM (MAX)</th>
                      <th>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(resultsByExam).map((item: any, idx) => (
                      <tr key={item.examId}>
                        <td>{idx + 1}</td>
                        <td><strong>{item.examName}</strong></td>
                        <td>
                          <span className="score-cell-bold">{item.maxScore.toFixed(1)}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${item.maxScore >= 5 ? 'status-active' : 'status-draft'}`}>
                            {item.maxScore >= 5 ? 'Đạt' : 'Chưa đạt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-info">
                <p>Bạn chưa có kết quả thi nào để hiển thị trong bảng điểm tổng kết.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam Details Modal */}
      {showModal && selectedExam && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="exam-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-icon-title">
                <div className="header-icon">
                  <BookOpen size={24} />
                </div>
                <h3>Thông tin bài thi</h3>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="exam-main-info">
                <span className="exam-category">Kỳ thi Học kỳ</span>
                <h2>{selectedExam.name}</h2>
                <div className="exam-tags">
                  <span className="tag-item">
                    <Clock size={16} /> {selectedExam.duration_mins} phút
                  </span>
                  <span className="tag-item">
                    <Activity size={16} /> {selectedExam.questions_num || 0} câu hỏi
                  </span>
                  <span className="tag-item">
                    <AlertCircle size={16} /> 10 điểm tối đa
                  </span>
                </div>
              </div>

              <div className="exam-description-section">
                <h4>Mô tả môn thi</h4>
                <div className="description-content">
                  {selectedExam.description || "Bài thi này nhằm đánh giá kiến thức toàn diện của sinh viên về nội dung môn học. Vui lòng đọc kỹ câu hỏi và làm bài cẩn thận."}
                </div>
              </div>

              <div className="exam-rules">
                <h4>Quy định phòng thi</h4>
                <ul>
                  <li>Không được phép sử dụng tài liệu trong quá trình làm bài.</li>
                  <li>Hệ thống sẽ tự động nộp bài khi hết thời gian.</li>
                  <li>Mỗi câu hỏi có thể có một hoặc nhiều lựa chọn đúng.</li>
                  <li>Bạn còn <strong>{selectedExam.attempts_num - (selectedExam.exam_attempts?.length || 0)} lượt</strong> làm bài cho môn thi này.</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Để sau
              </button>
              <button 
                className="btn-primary start-btn" 
                onClick={() => handleStartExam(selectedExam)}
              >
                <PlayCircle size={20} /> Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentDashboard;
