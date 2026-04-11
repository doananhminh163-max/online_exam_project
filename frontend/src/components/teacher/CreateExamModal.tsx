import React from 'react';
import { X, Calendar, Clock, BookOpen, Shield } from 'lucide-react';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Tạo Môn Thi Mới</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); alert('Môn thi đã được khởi tạo!'); onClose(); }}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Tên môn thi</label>
              <div className="input-with-icon">
                <BookOpen size={18} className="input-icon" />
                <input type="text" placeholder="Ví dụ: Kiểm tra Giữa kỳ II - Lập trình Java" required />
              </div>
            </div>

            <div className="form-group">
              <label>Ngày thi</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input type="date" required />
              </div>
            </div>

            <div className="form-group">
              <label>Giờ bắt đầu</label>
              <div className="input-with-icon">
                <Clock size={18} className="input-icon" />
                <input type="time" required />
              </div>
            </div>

            <div className="form-group">
              <label>Thời lượng (phút)</label>
              <div className="input-with-icon">
                <Clock size={18} className="input-icon" />
                <input type="number" placeholder="60" min="5" required />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu phòng thi (Tùy chọn)</label>
              <div className="input-with-icon">
                <Shield size={18} className="input-icon" />
                <input type="password" placeholder="••••••" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn-create-submit">
              Khởi tạo môn thi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
