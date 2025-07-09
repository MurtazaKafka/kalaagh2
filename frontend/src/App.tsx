import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './i18n/config'; // Initialize i18n
import VintageApp from './VintageApp';
import { TestConnection } from './pages/TestConnection';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './stores/authStore';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useAuthStore();
  
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { token } = useAuthStore();
  
  // Initialize auth on app load
  useEffect(() => {
    if (token) {
      // Token exists from persisted state, fetch user profile
      useAuthStore.getState().fetchProfile().catch(() => {
        // If profile fetch fails, logout
        useAuthStore.getState().logout();
      });
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <VintageApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <VintageApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;