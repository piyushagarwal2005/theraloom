import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  // Automatically detect GitHub Pages repository subpath if hosted on *.github.io
  const isGitHubPages =
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('github.io');
  const pathSegments =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/').filter(Boolean)
      : [];
  const basename =
    isGitHubPages && pathSegments.length > 0 ? `/${pathSegments[0]}` : '';

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F2421]">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
