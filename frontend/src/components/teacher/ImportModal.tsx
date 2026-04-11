import React, { useRef, useState, useEffect } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './ImportModal.css';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'questions' | 'students';
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, type }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successCount, setSuccessCount] = useState<number>(0);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && type === 'questions') {
      api.get('/exams').then((res) => {
        setExams(res.data);
        if (res.data.length > 0) setSelectedExamId(String(res.data[0].id));
      }).catch(console.error);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const title = type === 'questions' ? 'Nhập Ngân Hàng Câu Hỏi' : 'Nhập Danh Sách Sinh Viên';
  const subtitle = type === 'questions' 
    ? 'Tải lên danh sách câu hỏi trắc nghiệm dưới dạng Excel (.xlsx) hoặc CSV.'
    : 'Tải lên danh sách tài khoản sinh viên dưới dạng Excel (.xlsx) hoặc CSV.';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleUploadClick = async () => {
    if (!file) return;
    if (type === 'questions' && !selectedExamId) {
      setErrorMsg('Vui lòng chọn môn thi');
      return;
    }
    
    setUploading(true);
    setStatus('idle');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);
    if (type === 'questions') {
      formData.append('exam_id', selectedExamId);
    }

    try {
      const url = type === 'questions' ? '/admin/exams/import-questions' : '/admin/import-students';
      const res = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessCount(res.data.count || 0);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      const errRes = error.response?.data;
      if (errRes?.errors) {
         setErrorMsg(`File bị lỗi ở dòng: ${errRes.errors.map((e: any) => e.row).join(', ')}`);
      } else {
         setErrorMsg(errRes?.message || 'Lỗi hệ thống khi tải lên file');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    setSuccessCount(0);
    onClose();
  };

  const csvLink = type === 'questions' ? '/templates/mau_nhap_cau_hoi.csv' : '/templates/student_example.csv';
  const excelLink = type === 'questions' ? '/templates/mau_nhap_cau_hoi.xlsx' : '/templates/student_example.xlsx';

  return (
    <div className="modal-overlay">
      <div className="modal-container premium-modal import-modal">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="btn-close-circle" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {status === 'success' ? (
            <div className="upload-success-state">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h3>Import Thành Công!</h3>
              <p>Dữ liệu từ tệp <strong>{file?.name}</strong> đã được đồng bộ vào hệ thống.</p>
              <p className="mt-2 text-primary font-bold">Đã import {successCount} bản ghi thành công!</p>
              <button className="btn-primary-gradient mt-6" onClick={handleClose}>Hoàn tất</button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="error-alert mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                   <AlertCircle size={20} /> <span>{errorMsg}</span>
                </div>
              )}

              {type === 'questions' && (
                <div className="form-group mb-5">
                   <label>Chọn Môn thi đích <span className="text-danger">*</span></label>
                   <select 
                      className="premium-select" 
                      value={selectedExamId} 
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }}
                   >
                     {exams.length === 0 && <option value="">Không có môn thi nào</option>}
                     {exams.map(exam => (
                       <option key={exam.id} value={exam.id}>{exam.name} (ID: {exam.id})</option>
                     ))}
                   </select>
                </div>
              )}

              <div 
                className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                
                {file ? (
                  <div className="file-preview">
                    <FileSpreadsheet size={48} className="file-icon" />
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <button className="btn-remove-file" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      Xóa tệp
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <div className="upload-icon-wrapper">
                      <UploadCloud size={40} />
                    </div>
                    <h4>Kéo thả file vào đây</h4>
                    <p>Hoặc <strong>nhấn để chọn file</strong> từ máy tính</p>
                    <span className="file-hint">Hỗ trợ: .xlsx, .csv (Tối đa 5MB)</span>
                  </div>
                )}
              </div>

              <div className="template-download">
                <p>Bạn chưa có tệp mẫu?</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a href={csvLink} download className="btn-link">Tải tệp CSV mẫu tại đây</a>
                    <span style={{ color: '#64748b' }}>hoặc</span>
                    <a href={excelLink} download className="btn-link">Tải tệp Excel mẫu tại đây</a>
                </div>
              </div>
            </>
          )}
        </div>

        {status !== 'success' && (
          <div className="modal-footer">
            <button type="button" className="btn-secondary-flat" onClick={handleClose} disabled={uploading}>
              Hủy bỏ
            </button>
            <button 
              type="button" 
              className={`btn-primary-gradient ${uploading ? 'uploading' : ''}`} 
              onClick={handleUploadClick}
              disabled={!file || uploading}
            >
              {uploading ? 'Đang xử lý...' : 'Bắt đầu Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
