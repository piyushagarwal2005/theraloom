import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/public/Home';
import TherapistProfile from '../pages/public/TherapistProfile';
import ClientPortal from '../pages/client/ClientPortal';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/therapist/Dashboard';
import Clients from '../pages/therapist/Clients';
import Schedule from '../pages/therapist/Schedule';
import Notes from '../pages/therapist/Notes';
import Payments from '../pages/therapist/Payments';
import Chat from '../pages/therapist/Chat';
import Analytics from '../pages/therapist/Analytics';
import Subscription from '../pages/therapist/Subscription';
import Settings from '../pages/therapist/Settings';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/portal" element={<ClientPortal />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Therapist Workspace */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Public Therapist Slug Catch-All (e.g. /dr-ananya-sharma) */}
      <Route path="/:slug" element={<TherapistProfile />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
