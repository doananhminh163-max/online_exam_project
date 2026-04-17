import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatGrid: React.FC = () => {
  const [data, setData] = useState({
    exams: 0,
    students: 0,
    questions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const items = [
    {
      title: "Quản lý Môn thi",
      description: "Tạo, chỉnh sửa và quản lý các môn thi trên hệ thống.",
      stat: data.exams,
      statLabel: "môn thi",
      icon: BookOpen,
      color: "blue",
      link: "/teacher/exams"
    },
    {
      title: "Ngân hàng câu hỏi",
      description: "Quản lý và import câu hỏi cho các bài thi.",
      stat: data.questions,
      statLabel: "câu hỏi",
      icon: Database,
      color: "orange",
      link: "/teacher/questions"
    },
    {
      title: "Quản lý Thí sinh",
      description: "Xem danh sách và quản lý tài khoản thí sinh.",
      stat: data.students,
      statLabel: "thí sinh",
      icon: Users,
      color: "purple",
      link: "/teacher/students"
    },
  ];

  return (
    <section className="overview-grid">
      {items.map((item, idx) => (
        <Link to={item.link} className={`overview-card overview-${item.color}`} key={idx}>
          <div className="overview-card-top">
            <div className="overview-icon-wrapper">
              <item.icon size={22} />
            </div>
            {!loading && (
              <span className="overview-badge">{item.stat.toLocaleString()} {item.statLabel}</span>
            )}
          </div>
          <h3 className="overview-title">{item.title}</h3>
          <p className="overview-desc">{item.description}</p>
          <span className="overview-link">
            Truy cập <ArrowRight size={14} />
          </span>
        </Link>
      ))}
    </section>
  );
};

export default StatGrid;
