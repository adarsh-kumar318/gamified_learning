import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to auth if no token
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
