import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';

function ScrollToTopAndHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If navigating with an in-page section hash (e.g. #patterns, #directory)
      const id = hash.replace('#', '');
      const scrollToEl = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };

      scrollToEl();
      const timer1 = setTimeout(scrollToEl, 100);
      const timer2 = setTimeout(scrollToEl, 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Whenever navigating to a page without a hash, reset scroll position immediately to the top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, hash]);

  return null;
}

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
      <ScrollToTopAndHash />
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
