import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Exam {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  status?: string;
  participants?: number;
}

const RecentExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        setExams(res.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch recent exams', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const getStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { label: 'Sắp diễn ra', class: 'status-draft' };
    } else if (now >= start && now <= end) {
      return { label: 'Đang diễn ra', class: 'status-active' };
    } else {
      return { label: 'Đã kết thúc', class: 'status-completed' };
    }
  };

  return (
    <div className="content-card recent-exams">
      <div className="card-header">
        <h2>Môn thi Tương tác gần đây</h2>
        <Link to="/teacher/exams" className="btn-text">Xem tất cả <ChevronRight size={16} /></Link>
      </div>
      <div className="card-body">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
        ) : (
          <div className="table-responsive">
            <table className="exams-table">
              <thead>
                <tr>
                  <th>Tên Môn Thi</th>
                  <th>Ngày Thi</th>
                  <th>Trạng Thái</th>
                  <th>Lượt Tham Gia</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Chưa có môn thi nào.</td>
                  </tr>
                ) : (
                  exams.map(exam => {
                    const statusInfo = getStatus(exam.start_time, exam.end_time);
                    return (
                      <tr key={exam.id}>
                        <td>
                          <div className="exam-name-cell">
                            <div className="exam-icon"><Calendar size={16} /></div>
                            <span>{exam.name}</span>
                          </div>
                        </td>
                        <td>{new Date(exam.start_time).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>{typeof exam.participants === 'number' ? exam.participants : '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentExams;
