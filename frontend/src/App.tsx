import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TeacherDashboard from './pages/teacher-dashboard/TeacherDashboard';
import TeacherExamManagement from './pages/teacher-exam/TeacherExamManagement';
import TeacherStudentManagement from './pages/teacher-student/TeacherStudentManagement';
import TeacherQuestionManagement from './pages/teacher-question/TeacherQuestionManagement';
import TeacherReports from './pages/teacher-reports/TeacherReports';
import TeacherProfile from './pages/teacher-profile/TeacherProfile';
import Login from './pages/login/Login';
import StudentDashboard from './pages/student-dashboard/StudentDashboard';
import TakeExam from './pages/student-exam/TakeExam';
import ExamResult from './pages/student-result/ExamResult';
import StudentResults from './pages/student-results/StudentResults';
import StudentProfile from './pages/student-profile/StudentProfile';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/exams" element={<TeacherExamManagement />} />
            <Route path="/teacher/questions" element={<TeacherQuestionManagement />} />
            <Route path="/teacher/students" element={<TeacherStudentManagement />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/teacher/reports" element={<TeacherReports />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/exam/:id" element={<TakeExam />} />
            <Route path="/student/result/:attemptId" element={<ExamResult />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
