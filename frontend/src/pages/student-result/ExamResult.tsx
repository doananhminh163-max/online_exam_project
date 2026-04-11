import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Home, ArrowRight } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import api from '../../services/api';
import './ExamResult.css';

const ExamResult: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/student/results/${attemptId}`);
        setResult(response.data);
      } catch (error) {
        console.error('Failed to fetch result:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) return <StudentLayout><div>Loading results...</div></StudentLayout>;
  if (!result) return <StudentLayout><div>Result not found.</div></StudentLayout>;

  const correctCount = result.attempt_details.filter((d: any) => d.is_correct).length;
  const totalCount = result.attempt_details.length;
  const wrongCount = totalCount - correctCount;

  return (
    <StudentLayout>
      <div className="result-container">
        <div className="result-card">
          <div className="result-header">
            <div className="score-ring">
              <svg viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="45"></circle>
                <circle 
                  className="ring-progress" 
                  cx="50" cy="50" r="45" 
                  style={{ strokeDashoffset: 45 * 2 * Math.PI * (1 - result.score / 10) }}
                ></circle>
              </svg>
              <div className="score-content">
                <span className="score-value">{result.score}</span>
                <span className="score-max">/ 10</span>
              </div>
            </div>
            <h2>{result.score >= 5 ? 'Tuyệt vời!' : 'Cố gắng hơn nhé!'} Bạn đã hoàn thành bài thi</h2>
            <p>Bài thi: {result.exam.name}</p>
          </div>
          
          <div className="result-stats-row">
            <div className="r-stat-item">
              <div className="r-stat-icon success">
                <CheckCircle size={20} />
              </div>
              <div className="r-stat-info">
                <span className="r-stat-label">Câu trả lời đúng</span>
                <span className="r-stat-value">{correctCount}/{totalCount}</span>
              </div>
            </div>
            <div className="r-stat-item">
              <div className="r-stat-icon danger">
                <XCircle size={20} />
              </div>
              <div className="r-stat-info">
                <span className="r-stat-label">Câu trả lời sai</span>
                <span className="r-stat-value">{wrongCount}/{totalCount}</span>
              </div>
            </div>
          </div>

          <div className="result-details-grid">
            <div className="detail-box">
              <span className="detail-label">Thời gian nộp bài</span>
              <span className="detail-value">{new Date(result.end_time).toLocaleString()}</span>
            </div>
            <div className="detail-box">
              <span className="detail-label">Trạng thái</span>
              <span className="detail-value">{result.score >= 5 ? 'Đạt' : 'Chưa đạt'}</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn-outline" onClick={() => navigate('/student/dashboard')}>
              <Home size={18} /> Về trang chủ
            </button>
            <button className="btn-primary">
              Xem chi tiết <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ExamResult;
