import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import './TakeExam.css';

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/student/exams/${id}`);
        setExam(response.data);
        setQuestions(response.data.questions);
        setTimeLeft(response.data.duration_mins * 60);
      } catch (error) {
        console.error('Failed to fetch exam:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option: string) => {
    const qId = questions[currentIndex].id;
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = async (isAuto = false) => {
    if (isAuto || window.confirm('Bạn có chắc chắn muốn nộp bài không?')) {
      try {
        const response = await api.post(`/student/exams/${id}/submit`, { answers });
        navigate(`/student/result/${response.data.attemptId}`);
      } catch (error) {
        console.error('Failed to submit exam:', error);
        alert('Nộp bài thất bại. Vui lòng thử lại.');
      }
    }
  };

  if (loading) return <div>Loading exam...</div>;
  if (!exam) return <div>Exam not found.</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="exam-take-layout">
      <header className="exam-header">
        <div className="exam-title">
          <h2>Bài thi: {exam.name}</h2>
          <span className="exam-id-badge">ID: {id}</span>
        </div>
        <div className={`exam-timer ${timeLeft < 300 ? 'danger' : ''}`}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <button className="btn-primary submit-btn" onClick={() => handleSubmit()}>Nộp bài</button>
      </header>

      <div className="exam-body">
        <div className="question-main-area">
          <div className="question-card">
            <div className="question-header">
              <span className="question-label">Câu hỏi {currentIndex + 1} / {questions.length}</span>
            </div>
            <p className="question-content">{currentQ.content}</p>
            
            <div className="options-list">
              {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey) => (
                <label 
                  key={optKey} 
                  className={`option-item ${answers[currentQ.id] === currentQ[optKey] ? 'selected' : ''}`}
                >
                  <div className="option-radio">
                    <input 
                      type="radio" 
                      name={`q-${currentQ.id}`} 
                      value={currentQ[optKey]}
                      checked={answers[currentQ.id] === currentQ[optKey]}
                      onChange={() => handleSelectOption(currentQ[optKey])}
                    />
                    <span className="radio-custom"></span>
                  </div>
                  <span className="option-text">{currentQ[optKey]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-navigation">
            <button 
              className="btn-outline nav-btn" 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={18} /> Câu trước
            </button>
            <button 
              className="btn-primary nav-btn" 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Câu tiếp <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <aside className="exam-sidebar-nav">
          <div className="sidebar-nav-header">
            <h3>Bảng điều hướng</h3>
          </div>
          <div className="question-grid">
            {questions.map((q, idx) => (
              <button 
                key={q.id}
                className={`q-nav-btn ${answers[q.id] ? 'answered' : ''} ${currentIndex === idx ? 'current' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="nav-legend">
            <div className="legend-item"><span className="dot current"></span> Đang xem</div>
            <div className="legend-item"><span className="dot answered"></span> Đã trả lời</div>
            <div className="legend-item"><span className="dot"></span> Chưa trả lời</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TakeExam;
