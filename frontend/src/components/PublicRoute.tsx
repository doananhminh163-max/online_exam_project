import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
