// src/components/PrivateRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ userType, children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute:', { userType, user, token, loading, currentPath: location.pathname });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    console.log('No user data');
    return <div>Loading user data...</div>;
  }

  if (user.user_type !== userType) {
    console.log(`User type mismatch. Expected: ${userType}, Got: ${user.user_type}`);
    return <Navigate to={`/${user.user_type}`} replace />;
  }

  console.log('Rendering protected content');
  return children;
};

export default PrivateRoute;