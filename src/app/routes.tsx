import { createBrowserRouter, Navigate } from 'react-router';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import ProtectedRoute from './components/ProtectedRoute';

import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Attendance from './pages/admin/Attendance';
import Fees from './pages/admin/Fees';
import Tests from './pages/admin/Tests';
import Analytics from './pages/admin/Analytics';
import Notes from './pages/admin/Notes';
import SchedulePage from './pages/admin/Schedule';
import Notifications from './pages/admin/Notifications';

import StudentDashboard from './pages/student/Dashboard';
import StudentNotes from './pages/student/Notes';
import StudentResults from './pages/student/Results';
import StudentAnalytics from './pages/student/Analytics';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'students', element: <Students /> },
      { path: 'attendance', element: <Attendance /> },
      { path: 'fees', element: <Fees /> },
      { path: 'tests', element: <Tests /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'notes', element: <Notes /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'notifications', element: <Notifications /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRole="student">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/student/dashboard" replace /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'notes', element: <StudentNotes /> },
      { path: 'results', element: <StudentResults /> },
      { path: 'analytics', element: <StudentAnalytics /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
