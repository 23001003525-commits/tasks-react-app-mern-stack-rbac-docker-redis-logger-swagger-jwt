import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  // Not logged in
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not admin
  if (userInfo.role !== 'admin' && userInfo.role !== 'superadmin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default AdminRoute;
