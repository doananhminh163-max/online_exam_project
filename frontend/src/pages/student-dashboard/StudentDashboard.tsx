import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Activity, Play } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import api from '../../services/api';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <StudentLayout><div>Loading...</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="main-header">
        <div className="header-greeting">
          <h1>Chào mừng, Sinh viên! 👋</h1>
          <p>Dưới đây là tổng quan quá trình học tập của bạn.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon-wrapper">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-title">Kỳ thi đang mở</h3>
            <span className="stat-value">{exams.length}</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon-wrapper">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3 className="stat-title">Đã hoàn thành</h3>
            <span className="stat-value">0</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h2>Kỳ thi của bạn</h2>
          </div>
          <div className="card-body">
            <div className="exam-cards-container">
              {exams.map(exam => (
                <div key={exam.id} className="student-exam-card">
                  <div className="exam-card-info">
                    <h3>{exam.name}</h3>
                    <div className="exam-meta">
                      <span><Clock size={16} /> {exam.duration_mins} phút</span>
                      <span><Activity size={16} /> {exam._count.questions} câu hỏi</span>
                    </div>
                  </div>
                  <button 
                    className="btn-primary start-exam-btn"
                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                  >
                    <Play size={18} /> Bắt đầu làm bài
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
