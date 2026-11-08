import React, { useState, useEffect, useMemo, useRef } from "react";
import { BlogPost, PublicProfile, AppCategory, BlogAd } from "../types";
import {
  getBlogPosts,
  getPublicProfiles,
  getDicasCategories,
  getBlogAds,
} from "../services/dataService";
import {
  Calendar,
  ChevronRight,
  Search,
  Heart,
  Clock,
  Compass,
  BookOpen,
  Share2,
  Award,
  User as UserIcon,
  Utensils,
  Newspaper,
  Lightbulb,
  Layers,
  Flame,
  Sparkles,
} from "lucide-react";
import { getGuideArticles } from "../services/guideService";
import { COLLECTION_ORDER } from "../data/guideArticles";
import { ArticleCard } from "../components/GuideCards";
import { HScroller } from "../components/DiscoverUI";
import { LeadCard, CompactCard, StreamCard, contentType, openContent, ContentType, TYPE_META } from "../components/FeedCards";

interface BlogProps {
  onNavigate?: (page: string, params?: any) => void;
}

const DEFAULT_ADS: BlogAd[] = [
  {
    id: "ad1",
    title: "Passeio de Barco VIP com Capitão Arraial • 15% OFF",
    subtitle:
      "Navegue pelo Caribe de Arraial com atendimento classe A e parada exclusiva na Gruta Azul.",
    imageUrl:
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80",
    tag: "Patrocinado",
    actionLabel: "Ver Passeios",
    badgeColor: "bg-amber-500/95 text-white",
    targetCategory: "Passeios",
    active: true,
    order: 0,
  },
  {
    id: "ad2",
    title: "Festival da Lagosta em Arraial do Cabo",
    subtitle:
      "Neste final de semana, venha saborear pratos exclusivos nos melhores restaurantes com preços especiais!",
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
    tag: "Destaque Gastronômico",
    actionLabel: "Ver Gastronomia",
    badgeColor: "bg-red-500/95 text-white",
    targetCategory: "Gastronomia",
    active: true,
    order: 1,
  },
];

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const nav = onNavigate || (() => {});
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [guides, setGuides] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const initialType = (() => { try { return (new URLSearchParams(window.location.search).get("tipo") || "") as ContentType | ""; } catch { return ""; } })();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType | "">(initialType);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adsSlides, setAdsSlides] = useState<BlogAd[]>(DEFAULT_ADS);
  const [theme, setTheme] = useState<string>("");
  const [visible, setVisible] = useState(9);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (adsSlides.length === 0) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % adsSlides.length), 4500);
    return () => clearInterval(timer);
  }, [adsSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, g, u, c, ads] = await Promise.all([
          getBlogPosts().catch(() => []),
          getGuideArticles(false).catch(() => []),
          getPublicProfiles().catch(() => []),
          getDicasCategories().catch(() => []),
          getBlogAds().catch(() => []),
        ]);
        setPosts(p || []); setGuides(g || []); setUsers(u || []); setCategories(c || []);
        const activeAds = (ads || []).filter((a) => a.active);
        setAdsSlides(activeAds.length ? activeAds : DEFAULT_ADS);
      } finally { setLoading(false); }
    };
    fetchData();
    window.addEventListener("dataUpdated", fetchData);
    try { const saved = localStorage.getItem("lagos_go_liked_posts"); if (saved) setLikedPosts(JSON.parse(saved)); } catch { /* sem favoritos */ }
    return () => window.removeEventListener("dataUpdated", fetchData);
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (typeFilter) url.searchParams.set("tipo", typeFilter); else url.searchParams.delete("tipo");
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch { /* ignora */ }
  }, [typeFilter]);

  const open = (p: BlogPost) => openContent(p, nav);
  const openAuthor = (p: BlogPost) => p.authorId && nav("journalist-profile", { journalistId: p.authorId });
  const toggleLike = (p: BlogPost) => {
    const updated = likedPosts.includes(p.id) ? likedPosts.filter((id) => id !== p.id) : [...likedPosts, p.id];
    setLikedPosts(updated);
    try { localStorage.setItem("lagos_go_liked_posts", JSON.stringify(updated)); } catch { /* ignora */ }
  };

  // Uma única fonte: matérias do Guia + posts do Feed (mesma coleção blog_posts), sem duplicar ids.
  // Intercala matérias e publicações (cada lista na sua ordem) para o fluxo não virar blocos de um só formato.
  const all = useMemo(() => {
    const seen = new Set<string>();
    const ok = (p: BlogPost) => p && p.title && !seen.has(p.id) && !!seen.add(p.id);
    const g = guides.filter(ok);
    const o = [...posts].sort((a, b) => (b.date || "").localeCompare(a.date || "")).filter(ok);
    const out: BlogPost[] = [];
    for (let i = 0; i < Math.max(g.length, o.length); i++) { if (g[i]) out.push(g[i]); if (o[i]) out.push(o[i]); }
    return out;
  }, [guides, posts]);

  const q = searchQuery.trim().toLowerCase();
  const filtering = !!(q || typeFilter || selectedCategory !== "Todos" || showOnlyLiked);
  const filtered = useMemo(() => all.filter((p) => {
    if (typeFilter && contentType(p) !== typeFilter) return false;
    if (selectedCategory !== "Todos" && p.category !== selectedCategory) return false;
    if (showOnlyLiked && !likedPosts.includes(p.id)) return false;
    if (q) {
      const text = [p.title, p.subtitle, p.excerpt, p.category, (p.tags || []).join(" ")].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((t) => text.includes(t))) return false;
    }
    return true;
  }), [all, typeFilter, selectedCategory, showOnlyLiked, likedPosts, q]);

  // Destaques: matéria em destaque do Guia + as notícias e dicas mais recentes.
  const lead = useMemo(() => guides.find((g) => g.featured) || all[0], [guides, all]);
  const secondary = useMemo(() => {
    const news = posts.slice(0, 2);
    const moreGuides = guides.filter((g) => g.id !== lead?.id && (g.featured || g.popular)).slice(0, 4 - news.length);
    return [...news, ...moreGuides].filter((p) => p.id !== lead?.id).slice(0, 4);
  }, [posts, guides, lead]);
  const events = useMemo(() => posts.filter((p) => contentType(p) === "evento").slice(0, 6), [posts]);
  const themes = useMemo(() => COLLECTION_ORDER.filter((c) => guides.some((g) => (g.collections || []).includes(c))), [guides]);
  const activeTheme = theme || themes[0] || "";
  const themeItems = useMemo(() => guides.filter((g) => (g.collections || []).includes(activeTheme)), [guides, activeTheme]);

  const heroIds = useMemo(() => new Set([lead?.id, ...secondary.map((s) => s.id)]), [lead, secondary]);
  const stream = filtering ? filtered : all.filter((p) => !heroIds.has(p.id));

  useEffect(() => { setVisible(9); }, [typeFilter, selectedCategory, showOnlyLiked, q]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || visible >= stream.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) setVisible((v) => v + 9); }, { rootMargin: "500px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [visible, stream.length]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { materia: 0, noticia: 0, evento: 0, dica: 0 };
    all.forEach((p) => { c[contentType(p)] += 1; });
    return c;
  }, [all]);

  const chip = (on: boolean) => `px-4 h-9 flex items-center gap-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${on ? "bg-ocean-950 text-white border-ocean-950" : "bg-white text-slate-600 border-slate-200"}`;

  return (
    <div className="pb-28 min-h-screen bg-slate-50 font-sans">
      {/* Cabeçalho do portal */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Feed Lagos GO</p>
          <h1 className="text-3xl md:text-4xl font-black text-ocean-950 tracking-tight mt-1">Notícias, matérias e dicas da região</h1>
          <label className="mt-4 flex items-center gap-2 bg-slate-100 rounded-2xl px-4 h-12">
            <Search size={16} className="text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Buscar no Feed" placeholder="Buscar notícias, matérias e dicas" className="flex-1 bg-transparent border-0 shadow-none outline-none ring-0 focus:ring-0 p-0 text-sm text-slate-800" />
          </label>
        </div>
        <div className="max-w-6xl mx-auto pb-3">
          <HScroller label="Tipo de conteúdo" gap="gap-2">
            <button onClick={() => { setTypeFilter(""); setShowOnlyLiked(false); }} className={chip(!typeFilter && !showOnlyLiked)} data-testid="type-all"><Layers size={13} /> Tudo</button>
            {(Object.keys(TYPE_META) as ContentType[]).filter((t) => counts[t] > 0).map((t) => {
              const M = TYPE_META[t];
              return <button key={t} onClick={() => { setTypeFilter(typeFilter === t ? "" : t); setShowOnlyLiked(false); }} aria-pressed={typeFilter === t} className={chip(typeFilter === t)} data-testid={`type-${t}`}><M.Icon size={13} /> {M.label === "Matéria" ? "Matérias" : M.label === "Notícia" ? "Notícias" : M.label === "Evento" ? "Eventos" : "Dicas"} <span className="opacity-60">{counts[t]}</span></button>;
            })}
            <button onClick={() => setShowOnlyLiked(!showOnlyLiked)} aria-pressed={showOnlyLiked} className={chip(showOnlyLiked)} data-testid="type-liked"><Heart size={13} className={showOnlyLiked ? "fill-white" : ""} /> Favoritos</button>
          </HScroller>
          {categories.length > 0 && (
            <div className="mt-2">
              <HScroller label="Categorias" gap="gap-2">
                {["Todos", ...categories.map((c) => c.name)].map((name) => (
                  <button key={name} onClick={() => setSelectedCategory(name)} aria-pressed={selectedCategory === name}
                    className={`px-3 h-8 rounded-full text-[11px] font-bold whitespace-nowrap ${selectedCategory === name ? "bg-red-50 text-red-600" : "text-slate-500"}`}>{name}</button>
                ))}
              </HScroller>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto pt-6 space-y-10">
        {loading && <div className="flex justify-center py-16" role="status" aria-label="Carregando"><div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin" /></div>}

        {!loading && !filtering && (
          <>
            {/* Destaques: matéria principal + secundárias */}
            {lead && (
              <section className="px-4 grid gap-4 lg:grid-cols-5" aria-label="Em destaque" data-testid="feed-highlights">
                <div className="lg:col-span-3"><LeadCard post={lead} onOpen={open} /></div>
                <div className="lg:col-span-2 grid gap-3 content-start">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Também em destaque</h2>
                  {secondary.map((p) => <CompactCard key={p.id} post={p} onOpen={open} />)}
                </div>
              </section>
            )}

            {/* Publicidade / campanhas do Feed (mantido) */}
            {adsSlides.length > 0 && (
              <section className="px-4" aria-label="Destaques patrocinados">
                <div className="relative h-44 md:h-56 rounded-3xl overflow-hidden shadow-sm">
                  {adsSlides.map((slide, index) => (
                    <div key={slide.id} onClick={() => slide.targetCategory && nav("guide", { category: slide.targetCategory })}
                      className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
                      <img src={slide.imageUrl} referrerPolicy="no-referrer" alt={slide.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-14 text-white">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${slide.badgeColor} mb-2`}>{slide.tag}</span>
                        <h2 className="text-lg md:text-2xl font-black leading-snug">{slide.title}</h2>
                        <p className="text-white/85 text-xs line-clamp-1">{slide.subtitle}</p>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-5 right-5 flex gap-1.5 z-20">
                    {adsSlides.map((_, i) => <button key={i} aria-label={`Destaque ${i + 1}`} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full ${i === currentSlide ? "bg-white w-4" : "bg-white/40 w-1.5"}`} />)}
                  </div>
                </div>
              </section>
            )}

            {/* Matérias do Guia por tema */}
            {themes.length > 0 && (
              <section aria-label="Matérias por tema" data-testid="feed-themes">
                <div className="px-4 mb-3">
                  <h2 className="text-xl font-black text-ocean-950 tracking-tight">Explore por tema</h2>
                  <p className="text-xs text-slate-500">Matérias do Guia sobre Arraial do Cabo e arredores</p>
                </div>
                <HScroller label="Temas" gap="gap-2">
                  {themes.map((t) => <button key={t} onClick={() => setTheme(t)} aria-pressed={activeTheme === t} className={chip(activeTheme === t)}>{t}</button>)}
                </HScroller>
                <div className="mt-3"><HScroller label={activeTheme}>{themeItems.map((a) => <ArticleCard key={a.id} article={a} onOpen={open} />)}</HScroller></div>
              </section>
            )}

            {/* Agenda (mantida) */}
            {events.length > 0 && (
              <section aria-label="Agenda de eventos">
                <h2 className="px-4 text-xl font-black text-ocean-950 tracking-tight mb-3">Agenda de eventos</h2>
                <HScroller label="Eventos">{events.map((p) => <div key={p.id} className="w-72 shrink-0"><CompactCard post={p} onOpen={open} /></div>)}</HScroller>
              </section>
            )}
          </>
        )}

        {/* Fluxo contínuo */}
        {!loading && (
          <section className="px-4" aria-label="Últimas do Feed" data-testid="feed-stream">
            <h2 className="text-xl font-black text-ocean-950 tracking-tight mb-3">{filtering ? `${stream.length} ${stream.length === 1 ? "conteúdo" : "conteúdos"}` : "Últimas do Feed"}</h2>
            {stream.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 px-6" data-testid="feed-empty">
                <p className="font-black text-ocean-950">Nada encontrado</p>
                <p className="text-sm text-slate-500 mt-1">Tente outra busca ou remova um filtro.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {stream.slice(0, visible).map((p, i) => (
                  <StreamCard key={p.id} post={p} onOpen={open} liked={likedPosts.includes(p.id)} onLike={toggleLike} onAuthor={openAuthor} wide={!filtering && i % 7 === 0} />
                ))}
              </div>
            )}
            <div ref={sentinel} className="h-6" aria-hidden />
            {visible < stream.length && <button onClick={() => setVisible((v) => v + 9)} className="mx-auto mt-2 block text-sm font-black text-ocean-600" data-testid="feed-more">Carregar mais</button>}
            {stream.length > 0 && visible >= stream.length && <p className="text-center text-xs text-slate-400 py-6" data-testid="feed-end">Você está em dia com o Feed.</p>}
          </section>
        )}
      </div>
    </div>
  );
};
