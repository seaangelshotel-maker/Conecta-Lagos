import { bindNativeEvents, watchKeyboard } from './services/native';
import { OfflineBanner } from './components/OfflineBanner';
import { ConsentBanner } from './components/ConsentBanner';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './hooks/useLanguage';
import { NotificationProvider } from './components/NotificationSystem';
import { NavBar } from './components/NavBar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { getCurrentUser, logout, getAppConfig, isAuthInitialized } from './services/dataService';
import { captureReferral } from './services/interactionService';
import { setNavigationOrigin } from './services/navigation';
import { User, UserRole } from './types';
import { LoadingState } from './components/ui/States';

// Telas carregadas sob demanda (divide o JavaScript em partes menores e acelera a abertura do app).
const UserDashboard = lazy(() => import('./pages/UserDashboard').then(m => ({ default: m.UserDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const JournalistDashboard = lazy(() => import('./pages/JournalistDashboard').then(m => ({ default: m.JournalistDashboard })));
const JournalistPublicPage = lazy(() => import('./pages/JournalistPublicPage').then(m => ({ default: m.JournalistPublicPage })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const SearchPage = lazy(() => import('./pages/Search').then(m => ({ default: m.SearchPage })));
const BusinessGuide = lazy(() => import('./pages/BusinessGuide').then(m => ({ default: m.BusinessGuide })));
const PrivacyPolicy = lazy(() => import('./pages/Legal').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./pages/Legal').then(m => ({ default: m.TermsOfUse })));
const InstallPage = lazy(() => import('./pages/Install').then(m => ({ default: m.InstallPage })));
const DeleteAccountPage = lazy(() => import('./pages/Legal').then(m => ({ default: m.DeleteAccountPage })));
const BusinessDetail = lazy(() => import('./pages/BusinessDetail').then(m => ({ default: m.BusinessDetail })));
const Discover = lazy(() => import('./pages/Discover').then(m => ({ default: m.Discover })));
const GuideArticle = lazy(() => import('./pages/GuideArticle').then(m => ({ default: m.GuideArticle })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogDetail = lazy(() => import('./pages/BlogDetail').then(m => ({ default: m.BlogDetail })));
const Collections = lazy(() => import('./pages/Collections').then(m => ({ default: m.Collections })));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail').then(m => ({ default: m.CollectionDetail })));
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const CreateBusiness = lazy(() => import('./pages/CreateBusiness').then(m => ({ default: m.CreateBusiness })));
const PricingPlans = lazy(() => import('./pages/PricingPlans').then(m => ({ default: m.PricingPlans })));
const OpportunitiesPage = lazy(() => import('./pages/Opportunities').then(m => ({ default: m.OpportunitiesPage })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const EventDetail = lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail').then(m => ({ default: m.OpportunityDetail })));
const OpportunityForm = lazy(() => import('./pages/OpportunityForm').then(m => ({ default: m.OpportunityForm })));
const MyOpportunities = lazy(() => import('./pages/MyOpportunities').then(m => ({ default: m.MyOpportunities })));
const OpportunityManage = lazy(() => import('./pages/OpportunityManage').then(m => ({ default: m.OpportunityManage })));

import { cityLandingBySlug, cityLandingByCityId } from './services/seoRoutes';

type Route = { page: string; params: any };

const parseUrl = (): Route => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  const businessMatch = path.match(/^\/business\/([^/]+)/);
  if (businessMatch) return { page: 'business-detail', params: { businessId: decodeURIComponent(businessMatch[1]) } };

  const blogMatch = path.match(/^\/blog\/([^/]+)/);
  if (blogMatch) return { page: 'blog-detail', params: { postId: decodeURIComponent(blogMatch[1]) } };

  const guiaMatch = path.match(/^\/guia\/([^/]+)/);
  if (guiaMatch) return { page: 'guide-article', params: { slug: decodeURIComponent(guiaMatch[1]) } };

  const journalistMatch = path.match(/^\/journalist\/([^/]+)/);
  if (journalistMatch) return { page: 'journalist-profile', params: { journalistId: decodeURIComponent(journalistMatch[1]) } };

  const colMatch = path.match(/^\/collection\/([^/]+)/);
  if (colMatch) return { page: 'collection-detail', params: { collectionId: decodeURIComponent(colMatch[1]) } };

  // Agenda de eventos
  if (path === '/eventos') return { page: 'events', params: null };
  const eventMatch = path.match(/^\/eventos\/([^/]+)/);
  if (eventMatch) return { page: 'event-detail', params: { eventId: decodeURIComponent(eventMatch[1]) } };

  // Ajuda Colaborativa
  if (path === '/ajuda') return { page: 'opportunities', params: null };
  if (path === '/ajuda/publicar') return { page: 'opportunity-form', params: null };
  if (path === '/ajuda/minhas') return { page: 'my-opportunities', params: null };
  if (path === '/ajuda/interesses') return { page: 'my-opportunities', params: { tab: 'interests' } };
  const editMatch = path.match(/^\/ajuda\/editar\/([^/]+)/);
  if (editMatch) return { page: 'opportunity-form', params: { opportunityId: decodeURIComponent(editMatch[1]) } };
  const manageMatch = path.match(/^\/ajuda\/gerenciar\/([^/]+)/);
  if (manageMatch) return { page: 'opportunity-manage', params: { opportunityId: decodeURIComponent(manageMatch[1]) } };
  const oppMatch = path.match(/^\/ajuda\/([^/]+)/);
  if (oppMatch) return { page: 'opportunity-detail', params: { opportunityId: decodeURIComponent(oppMatch[1]) } };

  switch (path) {
    case '/guide': return { page: 'guide', params: null };
    case '/search': return { page: 'search', params: null };
    case '/descubra': return { page: 'discover', params: null };
    case '/privacidade': return { page: 'privacy', params: null };
    case '/termos': return { page: 'terms', params: null };
    case '/excluir-conta': return { page: 'delete-account', params: null };
    case '/instalar': return { page: 'install', params: null };
    case '/blog': return { page: 'blog', params: null };
    case '/collections': return { page: 'collections', params: null };
    case '/map': return { page: 'map', params: null };
    // Página antiga do "Clube" (botões sem ação e valores fictícios) foi retirada; o link leva aos planos.
    case '/subscribe': return { page: 'pricing-plans', params: null };
    case '/login': return { page: 'login', params: null };
    case '/user-dashboard': return { page: 'user-dashboard', params: null };
    case '/admin-dashboard': return { page: 'admin-dashboard', params: null };
    case '/super-admin-dashboard': return { page: 'admin-dashboard', params: null };
    case '/journalist-dashboard': return { page: 'journalist-dashboard', params: null };
    case '/create-business': return { page: 'create-business', params: null };
    case '/pricing-plans': return { page: 'pricing-plans', params: null };
    case '/': return { page: 'home', params: null };
    default: {
      // Páginas por cidade (/arraial-do-cabo, /cabo-frio, /buzios) abrem os lugares já filtrados.
      const city = cityLandingBySlug(path.slice(1));
      if (city) return { page: 'discover', params: { city: city.cityId, citySlug: city.slug } };
      return { page: 'not-found', params: null };
    }
  }
};

const buildUrl = (page: string, params?: any): string => {
  const id = (v?: string) => encodeURIComponent(v || '');
  switch (page) {
    case 'home': return '/';
    case 'guide': return '/guide';
    case 'search': return '/search';
    case 'blog': return '/blog' + (params?.tipo ? `?tipo=${encodeURIComponent(params.tipo)}` : '');
    case 'discover': {
      // Só a cidade escolhida: usa o endereço da página da cidade (melhor para o Google e para compartilhar).
      const landing = params?.citySlug ? { slug: params.citySlug } : (params?.city ? cityLandingByCityId(params.city) : undefined);
      if (landing && !['q', 'cat', 'f', 'am', 'n'].some(k => params?.[k])) return `/${landing.slug}`;
      const qs = new URLSearchParams();
      ['q', 'cat', 'f', 'city', 'n'].forEach(k => { if (params?.[k]) qs.set(k, params[k]); });
      const str = qs.toString();
      return '/descubra' + (str ? `?${str}` : '');
    }
    case 'guide-article': return `/guia/${id(params?.slug)}`;
    case 'collections': return '/collections';
    case 'privacy': return '/privacidade';
    case 'terms': return '/termos';
    case 'delete-account': return '/excluir-conta';
    case 'install': return '/instalar';
    case 'map': return '/map';
    case 'login': return '/login';
    case 'user-dashboard': return '/user-dashboard';
    case 'admin-dashboard': return '/admin-dashboard' + (params?.view ? `?view=${encodeURIComponent(params.view)}` : '');
    case 'events': return '/eventos';
    case 'event-detail': return `/eventos/${id(params?.eventId)}`;
    case 'journalist-dashboard': return '/journalist-dashboard';
    case 'create-business': return '/create-business';
    case 'pricing-plans': return '/pricing-plans';
    case 'business-detail': return `/business/${id(params?.businessId)}`;
    case 'blog-detail': return `/blog/${id(params?.postId)}`;
    case 'journalist-profile': return `/journalist/${id(params?.journalistId)}`;
    case 'collection-detail': return `/collection/${id(params?.collectionId)}`;
    case 'opportunities': return '/ajuda';
    case 'opportunity-detail': return `/ajuda/${id(params?.opportunityId)}`;
    case 'opportunity-form': return params?.opportunityId ? `/ajuda/editar/${id(params.opportunityId)}` : '/ajuda/publicar';
    case 'my-opportunities': return params?.tab === 'interests' ? '/ajuda/interesses' : '/ajuda/minhas';
    case 'opportunity-manage': return `/ajuda/gerenciar/${id(params?.opportunityId)}`;
    default: return '/';
  }
};

/** Telas que exigem login. Ao entrar, a pessoa volta para a tela que pediu. */
const AUTH_PAGES = new Set([
  'user-dashboard', 'admin-dashboard', 'journalist-dashboard', 'create-business',
  'opportunity-form', 'my-opportunities', 'opportunity-manage'
]);

/** Telas com cabeçalho próprio em tela cheia (sem barra superior no desktop). */
const FULLSCREEN_PAGES = new Set(['event-detail', 'business-detail', 'blog-detail', 'guide-article', 'collection-detail', 'map', 'pricing-plans', 'create-business']);

export default function App() {
  return (
    <HelmetProvider>
      <NotificationProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </NotificationProvider>
    </HelmetProvider>
  );
}

/** Redireciona depois da renderização (evita mudar estado durante o render). */
const Redirect: React.FC<{ to: string; onNavigate: (page: string) => void }> = ({ to, onNavigate }) => {
  useEffect(() => { onNavigate(to); }, [to]);
  return null;
};

function AppContent() {
  const [route, setRoute] = useState<Route>(() => parseUrl());
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isAuthReady, setIsAuthReady] = useState(isAuthInitialized());
  const [afterLogin, setAfterLogin] = useState<Route | null>(null);
  const { page, params: pageParams } = route;

  useEffect(() => {
    captureReferral();

    const handlePopState = () => {
        setRoute(parseUrl());
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

  // Ponte nativa (Capacitor): links profundos, botão voltar do Android e teclado virtual. No navegador não faz nada além do teclado.
  useEffect(() => {
    const unbindNative = bindNativeEvents({
      goTo: (path) => { window.history.pushState({}, '', path); setRoute(parseUrl()); window.scrollTo(0, 0); },
      canGoBack: () => window.history.length > 1 && window.location.pathname !== '/',
    });
    const unbindKb = watchKeyboard();
    return () => { unbindNative(); unbindKb(); };
  }, []);

  // Guarda a tela protegida que pediu login, para voltar a ela depois de entrar.
  useEffect(() => {
    if (AUTH_PAGES.has(page) && !user) setAfterLogin({ page, params: pageParams });
  }, [page, user]);

  const updateBranding = () => {
      const config = getAppConfig();
      document.title = `${config.appName} ${config.appNameHighlight}`;
  };

  const handleNavigate = (newPage: string, params?: any) => {
      const nextParams = params ?? null;
      if (page === newPage && JSON.stringify(nextParams) === JSON.stringify(pageParams)) return;
      setNavigationOrigin(page);
      const url = buildUrl(newPage, nextParams);
      window.history.pushState({}, '', url);
      setRoute({ page: newPage, params: nextParams });
      window.scrollTo(0, 0);
  };

  const homeFor = (u: User | null) => {
    if (!u) return 'home';
    if (u.role === UserRole.SUPER_ADMIN || u.role === UserRole.COMPANY) return 'admin-dashboard';
    if (u.role === UserRole.JOURNALIST) return 'journalist-dashboard';
    return 'home';
  };

  const handleLoginSuccess = async () => {
    const u = getCurrentUser();
    setUser(u);
    if (afterLogin && u) {
      const target = afterLogin;
      setAfterLogin(null);
      handleNavigate(target.page, target.params);
      return;
    }
    handleNavigate(homeFor(u));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    handleNavigate('home');
  };

  if (!isAuthReady) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-8 w-8 border-4 border-ocean-500 rounded-full border-t-transparent" aria-label="Carregando"></div></div>;
  }

  const requireLogin = () => <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;

  const renderPage = () => {
    if (AUTH_PAGES.has(page) && !user) return requireLogin();

    switch (page) {
      case 'home':
        return <Home currentUser={user} onNavigate={handleNavigate} />;
      case 'guide':
        return <BusinessGuide currentUser={user} initialCategory={pageParams?.category} initialSubcategory={pageParams?.subcategory} onNavigate={handleNavigate} />;
      case 'business-detail':
        return <BusinessDetail businessId={pageParams?.businessId} onNavigate={handleNavigate} />;
      case 'search':
        return <SearchPage initialCategory={pageParams?.category} initialQuery={pageParams?.query} onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleNavigate} currentUser={user} />;
      case 'terms':
        return <TermsOfUse onNavigate={handleNavigate} />;
      case 'install':
        return <InstallPage onNavigate={handleNavigate} />;
      case 'delete-account':
        return <DeleteAccountPage onNavigate={handleNavigate} currentUser={user} />;
      case 'discover':
        return <Discover onNavigate={handleNavigate} initialCity={pageParams?.city} />;
      case 'not-found':
        return <NotFound onNavigate={handleNavigate} />;
      case 'guide-article':
        return <GuideArticle slug={pageParams?.slug} onNavigate={handleNavigate} />;
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
        return <UserDashboard currentUser={user!} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (user!.role !== UserRole.COMPANY && user!.role !== UserRole.SUPER_ADMIN) {
            return <Redirect to="user-dashboard" onNavigate={handleNavigate} />;
        }
        return <AdminDashboard currentUser={user!} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'journalist-dashboard':
        if (user!.role !== UserRole.JOURNALIST && user!.role !== UserRole.CONTENT_CREATOR) {
            return <Redirect to="user-dashboard" onNavigate={handleNavigate} />;
        }
        return <JournalistDashboard currentUser={user!} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'create-business':
        return <CreateBusiness currentUser={user!} onNavigate={handleNavigate} />;
      case 'pricing-plans':
        return <PricingPlans currentUser={user} onNavigate={handleNavigate} />;
      case 'login':
        if (user) return <Redirect to={homeFor(user)} onNavigate={handleNavigate} />;
        return <Login onLogin={handleLoginSuccess} onNavigate={handleNavigate} />;
      case 'map':
         return <MapPage />;
      case 'opportunities':
        return <OpportunitiesPage currentUser={user} onNavigate={handleNavigate} />;
      case 'events':
        return <Events currentUser={user} onNavigate={handleNavigate} />;
      case 'event-detail':
        return <EventDetail eventId={pageParams?.eventId} currentUser={user} onNavigate={handleNavigate} />;
      case 'opportunity-detail':
        return <OpportunityDetail opportunityId={pageParams?.opportunityId} currentUser={user} onNavigate={handleNavigate} />;
      case 'opportunity-form':
        return <OpportunityForm key={pageParams?.opportunityId || 'new'} currentUser={user!} opportunityId={pageParams?.opportunityId} onNavigate={handleNavigate} />;
      case 'my-opportunities':
        return <MyOpportunities currentUser={user!} initialTab={pageParams?.tab === 'interests' ? 'interests' : 'posts'} onNavigate={handleNavigate} />;
      case 'opportunity-manage':
        return <OpportunityManage opportunityId={pageParams?.opportunityId} currentUser={user!} onNavigate={handleNavigate} />;
      default:
        return <Home currentUser={user} onNavigate={handleNavigate} />;
    }
  };

  const content = (
    <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
      {renderPage()}
    </Suspense>
  );

  if (page === 'login' || (AUTH_PAGES.has(page) && !user)) return content;

  const showChrome = !FULLSCREEN_PAGES.has(page);

  return (
    <div className="min-h-screen font-sans text-ocean-950 bg-slate-50 selection:bg-ocean-200">
      <OfflineBanner />
      <ConsentBanner onNavigate={handleNavigate} />
      {showChrome && (
          <NavBar
            currentUser={user}
            onNavigate={handleNavigate}
            currentPage={page}
            onLogout={handleLogout}
          />
      )}
      <main className={`animate-in fade-in duration-300 ${showChrome ? 'md:pt-16' : ''}`}>
        {content}
      </main>
    </div>
  );
}
