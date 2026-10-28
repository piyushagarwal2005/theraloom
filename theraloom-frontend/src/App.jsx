import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    // If a hash is present in the URL, scroll smoothly to the corresponding element
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToEl = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };

      // Immediate attempt
      scrollToEl();
      // Deferred attempts to ensure dynamic components and images have completed their layout
      const timer1 = setTimeout(scrollToEl, 120);
      const timer2 = setTimeout(scrollToEl, 350);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [hash, pathname]);

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
      <ScrollToHash />
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
