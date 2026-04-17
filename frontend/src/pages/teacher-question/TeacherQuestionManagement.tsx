import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { Plus, Edit, Trash2, X, FileUp, HelpCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import ImportModal from '../../components/teacher/ImportModal';
import './TeacherQuestionManagement.css';

interface Question {
  id: number;
  exam_id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  explain: string | null;
  exam: {
    name: string;
  };
}

interface Exam {
  id: number;
  name: string;
}

const TeacherQuestionManagement: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const [formData, setFormData] = useState({
    exam_id: '',
    content: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    answer: 'A',
    explain: ''
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (error) {
      console.error('Failed to fetch exams', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedExamId) params.exam_id = selectedExamId;
      if (search) params.search = search;

      const res = await api.get('/admin/questions', { params });
      setQuestions(res.data);
    } catch (error) {
      console.error('Failed to fetch questions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        exam_id: String(question.exam_id),
        content: question.content,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        answer: question.answer,
        explain: question.explain || ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        exam_id: selectedExamId || (exams.length > 0 ? String(exams[0].id) : ''),
        content: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        answer: 'A',
        explain: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, formData);
      } else {
        await api.post('/admin/questions', formData);
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to save question', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      try {
        await api.delete(`/admin/questions/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error('Failed to delete question', error);
        alert('Có lỗi xảy ra khi xóa.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <TeacherSidebar />

      <main className="dashboard-main question-management">
        <div className="page-header">
          <div className="header-title">
            <h1>Ngân hàng câu hỏi</h1>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setIsImportModalOpen(true)}>
              <FileUp size={18} />
              <span>Nhập câu hỏi</span>
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={18} />
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        </div>

        <div className="management-toolbar">
          <form className="search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-search">Tìm kiếm</button>
          </form>

          <div className="toolbar-filters">
            <div className="filter-group">
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="premium-select-sm"
              >
                <option value="">Tất cả Môn thi</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="questions-container">
          {loading ? (
            <div className="loading-state content-card">Đang tải câu hỏi...</div>
          ) : questions.length === 0 ? (
            <div className="empty-state-card content-card">
              <HelpCircle size={48} />
              <h3>Không tìm thấy câu hỏi nào</h3>
              <p>Hãy thử thay đổi bộ lọc hoặc thêm câu hỏi mới vào hệ thống.</p>
            </div>
          ) : (
            <div className="questions-grid">
              {questions.map((q, index) => (
                <div key={q.id} className="question-card content-card">
                  <div className="q-card-header">
                    <div className="q-meta">
                      <span className="q-id">#{index + 1}</span>
                      <span className="q-exam-tag">{q.exam.name}</span>
                    </div>
                    <div className="q-actions">
                      <button className="btn-icon edit" title="Chỉnh sửa" onClick={() => handleOpenModal(q)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(q.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="q-body">
                    <p className="q-content-text">{q.content}</p>
                    <div className="q-options-list">
                      {[
                        { label: 'A', text: q.option_a },
                        { label: 'B', text: q.option_b },
                        { label: 'C', text: q.option_c },
                        { label: 'D', text: q.option_d }
                      ].map((opt) => (
                        <div key={opt.label} className={`q-option-item ${q.answer === opt.label ? 'is-correct' : ''}`}>
                          <span className="opt-marker">{opt.label}</span>
                          <span className="opt-text">{opt.text}</span>
                          {q.answer === opt.label && <CheckCircle2 size={14} className="correct-icon" />}
                        </div>
                      ))}
                    </div>
                    {q.explain && (
                      <div className="q-explanation-box">
                        <span className="explain-label">Giải thích:</span>
                        <p className="explain-text">{q.explain}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container premium-modal question-modal">
            <div className="modal-header">
              <div className="modal-header-content">
                <h2>{editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
                <p>Thiết lập nội dung và đáp án cho câu hỏi trắc nghiệm</p>
              </div>
              <button className="btn-close-circle" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-sections">
                  <div className="form-group full-width">
                    <label className="premium-label">Môn thi <span className="text-danger">*</span></label>
                    <select name="exam_id" value={formData.exam_id} onChange={handleInputChange} required className="premium-input">
                      <option value="">Chọn môn thi cho câu hỏi này</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="premium-label">Nội dung câu hỏi <span className="text-danger">*</span></label>
                    <textarea
                      name="content"
                      className="premium-textarea"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Nhập nội dung câu hỏi chi tiết tại đây..."
                      required
                      rows={4}
                    />
                  </div>

                  <div className="options-input-grid">
                    {[
                      { name: 'option_a', label: 'Phương án A' },
                      { name: 'option_b', label: 'Phương án B' },
                      { name: 'option_c', label: 'Phương án C' },
                      { name: 'option_d', label: 'Phương án D' }
                    ].map(opt => (
                      <div key={opt.name} className="form-group">
                        <label className="premium-label">{opt.label} <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name={opt.name}
                          className="premium-input"
                          value={(formData as any)[opt.name]}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="premium-label">Đáp án đúng <span className="text-danger">*</span></label>
                      <select name="answer" value={formData.answer} onChange={handleInputChange} required className="premium-input">
                        <option value="A">Phương án A</option>
                        <option value="B">Phương án B</option>
                        <option value="C">Phương án C</option>
                        <option value="D">Phương án D</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="premium-label">Giải thích (không bắt buộc)</label>
                    <textarea
                      name="explain"
                      className="premium-textarea"
                      value={formData.explain}
                      onChange={handleInputChange}
                      placeholder="Gợi ý hoặc giải thích tại sao chọn đáp án này..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-flat" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary-gradient">
                  <span>{editingQuestion ? 'Lưu thay đổi' : 'Tạo câu hỏi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="questions"
      />
    </div>
  );
};

export default TeacherQuestionManagement;
