
import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './components/NotificationSystem';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { JournalistDashboard } from './pages/JournalistDashboard';
import { JournalistPublicPage } from './pages/JournalistPublicPage';
import { SearchPage } from './pages/Search';
import { BusinessGuide } from './pages/BusinessGuide';
import { BusinessDetail } from './pages/BusinessDetail';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { Login } from './pages/Login';
import { MapPage } from './pages/MapPage';
import { SubscribePage } from './pages/Subscribe';
import { CreateBusiness } from './pages/CreateBusiness';
import { PricingPlans } from './pages/PricingPlans';
import { getCurrentUser, logout, getAppConfig, isAuthInitialized } from './services/dataService';
import { User, UserRole } from './types';

const parseUrl = (): { page: string; params: any } => {
  const path = window.location.pathname;
  
  const businessMatch = path.match(/^\/business\/([^/]+)/);
  if (businessMatch) return { page: 'business-detail', params: { businessId: businessMatch[1] } };

  const blogMatch = path.match(/^\/blog\/([^/]+)/);
  if (blogMatch) return { page: 'blog-detail', params: { postId: blogMatch[1] } };

  const journalistMatch = path.match(/^\/journalist\/([^/]+)/);
  if (journalistMatch) return { page: 'journalist-profile', params: { journalistId: journalistMatch[1] } };

  const colMatch = path.match(/^\/collection\/([^/]+)/);
  if (colMatch) return { page: 'collection-detail', params: { collectionId: colMatch[1] } };

  switch (path) {
    case '/guide': return { page: 'guide', params: null };
    case '/search': return { page: 'search', params: null };
    case '/blog': return { page: 'blog', params: null };
    case '/collections': return { page: 'collections', params: null };
    case '/map': return { page: 'map', params: null };
    case '/subscribe': return { page: 'subscribe', params: null };
    case '/login': return { page: 'login', params: null };
    case '/user-dashboard': return { page: 'user-dashboard', params: null };
    case '/admin-dashboard': return { page: 'admin-dashboard', params: null };
    case '/journalist-dashboard': return { page: 'journalist-dashboard', params: null };
    case '/create-business': return { page: 'create-business', params: null };
    case '/pricing-plans': return { page: 'pricing-plans', params: null };
    default: return { page: 'home', params: null };
  }
};

const buildUrl = (page: string, params?: any): string => {
  switch (page) {
    case 'home': return '/';
    case 'guide': return '/guide';
    case 'search': return '/search';
    case 'blog': return '/blog';
    case 'collections': return '/collections';
    case 'map': return '/map';
    case 'subscribe': return '/subscribe';
    case 'login': return '/login';
    case 'user-dashboard': return '/user-dashboard';
    case 'admin-dashboard': return '/admin-dashboard';
    case 'journalist-dashboard': return '/journalist-dashboard';
    case 'create-business': return '/create-business';
    case 'pricing-plans': return '/pricing-plans';
    case 'business-detail': return `/business/${params?.businessId}`;
    case 'blog-detail': return `/blog/${params?.postId}`;
    case 'journalist-profile': return `/journalist/${params?.journalistId}`;
    case 'collection-detail': return `/collection/${params?.collectionId}`;
    default: return '/';
  }
};

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </HelmetProvider>
  );
}

function AppContent() {
  const [page, setPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>(null);
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(isAuthInitialized());

  useEffect(() => {
    const { page: initialPage, params: initialParams } = parseUrl();
    setPage(initialPage);
    setPageParams(initialParams);

    const handlePopState = () => {
        const { page: newPage, params: newParams } = parseUrl();
        setPage(newPage);
        setPageParams(newParams);
        window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handlePopState);

    const handleDataUpdate = () => {
        setUser(getCurrentUser()); 
        setIsAuthReady(isAuthInitialized());
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    window.addEventListener('appConfigUpdated', updateBranding);

    updateBranding();

    return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('dataUpdated', handleDataUpdate);
        window.removeEventListener('appConfigUpdated', updateBranding);
    }
  }, []);

  const updateBranding = () => {
      const config = getAppConfig();
      document.title = `${config.appName} ${config.appNameHighlight}`;
  };

  const handleNavigate = (newPage: string, params?: any) => {
      if (page === newPage && JSON.stringify(params) === JSON.stringify(pageParams)) return;
      const url = buildUrl(newPage, params);
      window.history.pushState({}, '', url);
      setPage(newPage);
      if (params) setPageParams(params);
      window.scrollTo(0, 0);
  };

  const handleLoginSuccess = async () => {
    const u = getCurrentUser();
    setUser(u);
    
    if (!u) {
      handleNavigate('home');
      return;
    }

    if (u.role === UserRole.SUPER_ADMIN) {
      handleNavigate('admin-dashboard');
    } else if (u.role === UserRole.COMPANY) {
      handleNavigate('admin-dashboard');
    } else if (u.role === UserRole.JOURNALIST) {
      handleNavigate('journalist-dashboard');
    } else {
      handleNavigate('home');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    handleNavigate('home');
  };

  if (loading || !isAuthReady) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-8 w-8 border-4 border-ocean-500 rounded-full border-t-transparent"></div></div>;
  }

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home currentUser={user} onNavigate={handleNavigate} />;
      case 'guide':
        return <BusinessGuide currentUser={user} onNavigate={handleNavigate} />;
      case 'business-detail':
        return <BusinessDetail businessId={pageParams?.businessId} onNavigate={handleNavigate} />;
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      case 'blog':
        return <Blog onNavigate={handleNavigate} />;
      case 'blog-detail':
        return <BlogDetail postId={pageParams?.postId} onNavigate={handleNavigate} />;
      case 'journalist-profile':
        return <JournalistPublicPage journalistId={pageParams?.journalistId} onNavigate={handleNavigate} />;
      case 'collections':
        return <Collections onNavigate={handleNavigate} />;
      case 'collection-detail':
        return <CollectionDetail collectionId={pageParams?.collectionId} onNavigate={handleNavigate} />;
      case 'user-dashboard':
        if (!user) return <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
        return <UserDashboard currentUser={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (!user) return <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
        if (user.role !== UserRole.COMPANY && user.role !== UserRole.SUPER_ADMIN) {
            handleNavigate('home');
            return null;
        }
        return <AdminDashboard currentUser={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'journalist-dashboard':
        if (!user) return <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
        if (user.role !== UserRole.JOURNALIST) {
            handleNavigate('home');
            return null;
        }
        return <JournalistDashboard currentUser={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'create-business':
        if (!user) return <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
        if (!user.permissions?.canCreateBusiness && user.role !== UserRole.COMPANY) {
            handleNavigate('home');
            return null;
        }
        return <CreateBusiness currentUser={user} onNavigate={handleNavigate} />;
      case 'pricing-plans':
        return <PricingPlans currentUser={user} onNavigate={handleNavigate} />;
      case 'login':
        return <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
      case 'map': 
         return <MapPage />;
      case 'subscribe':
         return <SubscribePage />;
      default:
        return <Home currentUser={user} onNavigate={handleNavigate} />;
    }
  };

  if (page === 'login') return renderPage();

  const isOnboarding = page === 'pricing-plans' || page === 'create-business';

  return (
    <div className="min-h-screen font-sans text-ocean-950 bg-slate-50 selection:bg-ocean-200">
      {page !== 'business-detail' && page !== 'blog-detail' && page !== 'collection-detail' && page !== 'map' && !isOnboarding && (
          <NavBar 
            currentUser={user} 
            onNavigate={handleNavigate} 
            currentPage={page}
            onLogout={handleLogout} 
          />
      )}
      <main className={`animate-in fade-in duration-500 ${page !== 'business-detail' && page !== 'blog-detail' && page !== 'collection-detail' && page !== 'map' && !isOnboarding ? 'md:pt-16' : ''}`}>
        {renderPage()}
      </main>
    </div>
  );
}
