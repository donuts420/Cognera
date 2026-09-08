import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useLocale } from './context/LocaleContext.jsx';
import { usePlayer } from './context/PlayerContext.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

import PlayerShell from './components/player/PlayerShell.jsx';
import PlayerLoading from './components/player/PlayerLoading.jsx';
import DashboardPage from './pages/player/DashboardPage.jsx';
import GamesLibraryPage from './pages/player/GamesLibraryPage.jsx';
import GamePlayPage from './pages/player/GamePlayPage.jsx';
import DailyPage from './pages/player/DailyPage.jsx';
import CalendarPage from './pages/player/CalendarPage.jsx';
import MilestonesPage from './pages/player/MilestonesPage.jsx';
import ProfilePage from './pages/player/ProfilePage.jsx';

import AppShell from './components/AppShell.jsx';
import CareDashboardPage from './pages/DashboardPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import PatientDetailPage from './pages/PatientDetailPage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import AssessmentsPage from './pages/AssessmentsPage.jsx';
import CaseloadPage from './pages/CaseloadPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PlayerLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequirePlayer({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { patient, loading, error, retry } = usePlayer();
  if (authLoading || loading) return <PlayerLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (error || !patient) return <PlayerLoading error onRetry={retry} />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Player experience — the person playing, logged in as themselves */}
      <Route path="/" element={<RequirePlayer><PlayerShell /></RequirePlayer>}>
        <Route index element={<DashboardPage />} />
        <Route path="games" element={<GamesLibraryPage />} />
        <Route path="play/:slug" element={<GamePlayPage />} />
        <Route path="daily" element={<DailyPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="milestones" element={<MilestonesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Care mode — kept working, restyled shell, not the default */}
      <Route path="/care" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<CareDashboardPage />} />
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
