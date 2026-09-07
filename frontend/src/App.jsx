import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePatient } from './context/PatientContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useLocale } from './context/LocaleContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import PatientDetailPage from './pages/PatientDetailPage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import PatientModePage from './pages/PatientModePage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import AssessmentsPage from './pages/AssessmentsPage.jsx';
import CaseloadPage from './pages/CaseloadPage.jsx';
import AppShell from './components/AppShell.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh' }}>{t('common.loading')}</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { patientMode } = usePatient();

  if (patientMode) {
    return (
      <Routes>
        <Route path="/play/*" element={<PatientModePage />} />
        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="patients/:id/games" element={<GamesPage />} />
        <Route path="patients/:id/reminders" element={<RemindersPage />} />
        <Route path="patients/:id/assessments" element={<AssessmentsPage />} />
        <Route path="caseload" element={<CaseloadPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
