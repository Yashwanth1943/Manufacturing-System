import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ToastProvider from './context/ToastProvider.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Login from './pages/Login/Login.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import ProductionDashboard from './pages/Production/ProductionDashboard.jsx';
import DefectsDashboard from './pages/Defects/DefectsDashboard.jsx';
import QualityDashboard from './pages/Quality/QualityDashboard.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/production"
            element={(
              <ProtectedRoute allowedRoles={['admin', 'production']}>
                <ProductionDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/defects"
            element={(
              <ProtectedRoute allowedRoles={['admin', 'defects']}>
                <DefectsDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/quality"
            element={(
              <ProtectedRoute allowedRoles={['admin', 'quality']}>
                <QualityDashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
