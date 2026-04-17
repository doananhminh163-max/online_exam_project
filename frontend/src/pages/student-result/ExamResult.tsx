import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Clock, Target, HelpCircle, Calendar, Printer } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import api from '../../services/api';
import './ExamResult.css';

const ExamResult: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

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

  if (loading) {
    return (
      <StudentLayout>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Đang tải kết quả...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!result) {
    return (
      <StudentLayout>
        <div className="loading-container">
          <p>Không tìm thấy kết quả.</p>
          <button className="btn-primary" onClick={() => navigate('/student/results')}>
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </StudentLayout>
    );
  }

  const correctCount = result.attempt_details.filter((d: any) => d.is_correct).length;
  const totalCount = result.attempt_details.length;
  const wrongCount = totalCount - correctCount;
  const unanswered = result.attempt_details.filter((d: any) => !d.user_answer).length;
  const isPassed = result.score >= 5;

  const optionLabels: Record<string, string> = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };

  return (
    <StudentLayout>
      <div className="result-detail-container">
        {/* Back button */}
        <div className="result-header-row">
          <button className="btn-back" onClick={() => navigate('/student/results')}>
            <ArrowLeft size={18} /> Quay lại danh sách kết quả
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            <Printer size={18} /> In phiếu điểm
          </button>
        </div>

        {/* Score Hero Card */}
        <div className="result-hero">
          <div className="result-hero-left">
            <div className={`hero-score-ring ${isPassed ? 'ring-pass' : 'ring-fail'}`}>
              <svg viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="42" />
                <circle
                  className="ring-progress"
                  cx="50" cy="50" r="42"
                  style={{
                    strokeDasharray: 42 * 2 * Math.PI,
                    strokeDashoffset: 42 * 2 * Math.PI * (1 - result.score / 10)
                  }}
                />
              </svg>
              <div className="hero-score-content">
                <span className="hero-score-value">{result.score.toFixed(1)}</span>
                <span className="hero-score-max">/ 10</span>
              </div>
            </div>
          </div>

          <div className="result-hero-right">
            <span className={`status-badge ${isPassed ? 'status-active' : 'status-draft'}`}>
              {isPassed ? 'Đạt' : 'Chưa đạt'}
            </span>
            <h1>{result.exam.name}</h1>
            <div className="hero-meta">
              <span>
                <Calendar size={15} />
                <strong>Bắt đầu:</strong> {new Date(result.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(result.start_time).toLocaleDateString('vi-VN')}
              </span>
              <span>
                <Clock size={15} />
                <strong>Kết thúc:</strong> {new Date(result.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(result.end_time).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="result-stats-grid">
          <div className="r-stat-card">
            <div className="r-stat-icon-wrap success">
              <CheckCircle size={22} />
            </div>
            <div>
              <span className="r-stat-label">Câu đúng</span>
              <span className="r-stat-number">{correctCount}<small>/{totalCount}</small></span>
            </div>
          </div>
          <div className="r-stat-card">
            <div className="r-stat-icon-wrap danger">
              <XCircle size={22} />
            </div>
            <div>
              <span className="r-stat-label">Câu sai</span>
              <span className="r-stat-number">{wrongCount}<small>/{totalCount}</small></span>
            </div>
          </div>
          <div className="r-stat-card">
            <div className="r-stat-icon-wrap warning">
              <HelpCircle size={22} />
            </div>
            <div>
              <span className="r-stat-label">Bỏ trống</span>
              <span className="r-stat-number">{unanswered}<small>/{totalCount}</small></span>
            </div>
          </div>
          <div className="r-stat-card">
            <div className="r-stat-icon-wrap primary">
              <Target size={22} />
            </div>
            <div>
              <span className="r-stat-label">Tỷ lệ đúng</span>
              <span className="r-stat-number">{totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}<small>%</small></span>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="content-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Chi tiết bài làm</h2>
            <button 
              className="btn-text" 
              onClick={() => setShowAnswers(!showAnswers)}
              style={{ fontWeight: 'bold' }}
            >
              {showAnswers ? 'Ẩn đáp án đúng' : 'Xem đáp án đúng'}
            </button>
          </div>
          <div className="card-body">
            <div className="questions-review">
              {result.attempt_details.map((detail: any, idx: number) => {
                const q = detail.question;
                const isCorrect = detail.is_correct;
                const userAnswer = detail.user_answer;

                return (
                  <div
                    key={detail.id}
                    className={`question-review-item ${isCorrect ? 'q-correct' : userAnswer ? 'q-wrong' : 'q-skipped'}`}
                  >
                    <div className="q-header">
                      <span className="q-number">Câu {idx + 1}</span>
                      <div className="q-status-info">
                        <span className={`q-status-tag ${isCorrect ? 'tag-correct' : userAnswer ? 'tag-wrong' : 'tag-skipped'}`}>
                          {isCorrect ? 'ĐÚNG' : userAnswer ? 'SAI' : 'CHƯA LÀM'}
                        </span>
                        <span className={`q-status-icon ${isCorrect ? 'icon-correct' : userAnswer ? 'icon-wrong' : 'icon-skipped'}`}>
                          {isCorrect ? <CheckCircle size={18} /> : userAnswer ? <XCircle size={18} /> : <HelpCircle size={18} />}
                        </span>
                      </div>
                    </div>
                    <p className="q-content">{q.content}</p>

                    <div className="q-options">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optionKey = optionLabels[opt];
                        const optionText = q[optionKey];
                        const isUserChoice = userAnswer?.toUpperCase() === opt;
                        const isCorrectAnswer = q.answer?.toUpperCase() === opt;

                        let optClass = 'q-option';
                        
                        // Highlight ONLY the user's choice
                        if (userAnswer && isUserChoice) {
                          if (isCorrect) optClass += ' option-correct';
                          else optClass += ' option-wrong';
                        } else if (showAnswers && isCorrectAnswer) {
                           optClass += ' option-correct print-no-style';
                        }

                        return (
                          <div key={opt} className={optClass}>
                            <span className="option-letter">{opt}</span>
                            <span className="option-text">{optionText}</span>
                            {userAnswer && isUserChoice && (
                              <span className={`option-tag ${isCorrect ? 'correct-tag' : 'wrong-tag'}`}>
                                {isCorrect ? 'ĐÁP ÁN ĐÚNG' : 'ĐÁP ÁN SAI'}
                              </span>
                            )}
                            {showAnswers && isCorrectAnswer && !isUserChoice && (
                              <span className="option-tag correct-tag print-hidden">ĐÁP ÁN ĐÚNG</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {showAnswers && !isCorrect && q.explain && (
                      <div className="q-explanation print-hidden">
                        <strong>Giải thích:</strong> {q.explain}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ExamResult;
