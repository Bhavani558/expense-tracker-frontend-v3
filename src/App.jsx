import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Budget from './pages/Budget';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
          } />
          <Route path="/expenses" element={
            <PrivateRoute><Layout><Expenses /></Layout></PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute><Layout><Reports /></Layout></PrivateRoute>
          } />
          <Route path="/budget" element={
            <PrivateRoute><Layout><Budget /></Layout></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
