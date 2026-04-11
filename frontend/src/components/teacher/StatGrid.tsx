import React from 'react';
import { BookOpen, Users, Database, Activity } from 'lucide-react';

const stats = [
  { title: "Môn thi đang có", value: "24", icon: BookOpen, trend: "+3 tháng này", color: "blue" },
  { title: "Tổng Thí sinh", value: "850+", icon: Users, trend: "+12% so với kỳ trước", color: "purple" },
  { title: "Ngân hàng câu hỏi", value: "4,200", icon: Database, trend: "+140 câu mới", color: "orange" },
  { title: "Tỷ lệ Hoàn thành", value: "88%", icon: Activity, trend: "+2.4% tổng quan", color: "green" },
];

const StatGrid: React.FC = () => {
  return (
    <section className="stats-grid">
      {stats.map((stat, idx) => (
        <div className={`stat-card stat-${stat.color}`} key={idx}>
          <div className="stat-icon-wrapper">
            <stat.icon size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3 className="stat-title">{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <span className="stat-trend">{stat.trend}</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatGrid;
