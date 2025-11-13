import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Survey from './components/Survey';
import GWSSurvey from './components/GWSSurvey';
import SoftwareSurvey from './components/SoftwareSurvey';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/survey" element={
                <ProtectedRoute>
                  <Survey />
                </ProtectedRoute>
              } />
              <Route path="/gws-survey" element={
                <ProtectedRoute>
                  <GWSSurvey />
                </ProtectedRoute>
              } />
              <Route path="/software-survey" element={
                <ProtectedRoute>
                  <SoftwareSurvey />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
