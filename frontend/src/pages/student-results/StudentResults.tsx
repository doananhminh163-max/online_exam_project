import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronRight, Search, BarChart3 } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import api from '../../services/api';
import './StudentResults.css';

interface AttemptWithExam {
  id: number;
  exam_id: number;
  score: number;
  start_time: string;
  end_time: string;
  examName: string;
  totalQuestions: number;
  correctCount: number;
}

const StudentResults: React.FC = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptWithExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/student/exams');
        const exams = response.data;

        const allAttempts: AttemptWithExam[] = exams.flatMap((exam: any) =>
          (exam.exam_attempts || []).map((attempt: any) => ({
            id: attempt.id,
            exam_id: exam.id,
            score: attempt.score,
            start_time: attempt.start_time,
            end_time: attempt.end_time,
            examName: exam.name,
            totalQuestions: exam._count?.questions || 0,
            correctCount: attempt.attempt_details
              ? attempt.attempt_details.filter((d: any) => d.is_correct).length
              : 0,
          }))
        );

        allAttempts.sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());
        setAttempts(allAttempts);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = a.examName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'passed' && a.score >= 5) ||
      (filterStatus === 'failed' && a.score < 5);
    return matchesSearch && matchesFilter;
  });


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

  return (
    <StudentLayout>
      {/* Header */}
      <header className="main-header">
        <div className="header-greeting">
          <h1>Kết quả học tập 📊</h1>
        </div>
      </header>


      {/* Results List */}
      <div className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h2>Lịch sử làm bài</h2>
          </div>

          {/* Filters Bar */}
          <div className="results-filters">
            <div className="results-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên môn thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="results-filter-tabs">
              <button
                className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                Tất cả ({attempts.length})
              </button>
              <button
                className={`filter-tab tab-pass ${filterStatus === 'passed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('passed')}
              >
                <CheckCircle size={14} /> Đạt ({attempts.filter(a => a.score >= 5).length})
              </button>
              <button
                className={`filter-tab tab-fail ${filterStatus === 'failed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('failed')}
              >
                <XCircle size={14} /> Chưa đạt ({attempts.filter(a => a.score < 5).length})
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="card-body">
            {filteredAttempts.length > 0 ? (
              <div className="table-responsive">
                <table className="exams-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>MÔN THI</th>
                      <th className="text-center">NGÀY THI</th>
                      <th className="text-center">THỜI GIAN LÀM</th>
                      <th className="text-center">ĐIỂM</th>
                      <th className="text-center">TRẠNG THÁI</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts.map((attempt, idx) => {
                      const isPassed = attempt.score >= 5;
                      const start = new Date(attempt.start_time).getTime();
                      const end = new Date(attempt.end_time).getTime();
                      const diffMs = end - start;
                      const mins = Math.floor(diffMs / 60000);
                      const secs = Math.floor((diffMs % 60000) / 1000);

                      return (
                        <tr 
                          key={attempt.id} 
                          className="result-row"
                          onClick={() => navigate(`/student/result/${attempt.id}`)}
                        >
                          <td className="stt-cell">{idx + 1}</td>
                          <td className="exam-name-cell">
                            <strong>{attempt.examName}</strong>
                          </td>
                          <td className="date-cell">
                            {new Date(attempt.end_time).toLocaleDateString('vi-VN')} {new Date(attempt.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="time-cell">{mins}p {secs}s</td>
                          <td className="score-cell-bold text-center">{attempt.score.toFixed(1)}</td>
                          <td className="status-cell text-center">
                            <span className={`status-badge ${isPassed ? 'status-active' : 'status-draft'}`}>
                              {isPassed ? 'Đạt' : 'Chưa đạt'}
                            </span>
                          </td>
                          <td className="action-cell">
                            <ChevronRight size={18} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-results">
                <BarChart3 size={48} />
                <h3>Chưa có kết quả nào</h3>
                <p>
                  {searchTerm || filterStatus !== 'all'
                    ? 'Không tìm thấy kết quả phù hợp với bộ lọc.'
                    : 'Hãy tham gia các kỳ thi để xem kết quả tại đây.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentResults;
