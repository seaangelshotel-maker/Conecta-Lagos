import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Check,
  Heart,
  Navigation,
  Loader2,
  Crown,
  Map as MapIcon,
  X,
  ChevronDown,
  ListFilter,
  SlidersHorizontal,
  ShoppingBag,
  Ticket,
  Store,
  Sparkles,
  Newspaper,
  Lightbulb,
  Layers,
  Utensils,
  ArrowRight,
} from "lucide-react";
import {
  BusinessProfile,
  AppCategory,
  AppAmenity,
  User,
  City,
  Neighborhood,
  BlogPost,
} from "../types";
import {
  getBusinesses,
  getCategories,
  getAmenities,
  toggleFavorite,
  calculateDistance,
  getCities,
  getNeighborhoods,
  identifyNeighborhood,
  checkIfOpen,
  getCoupons,
  getCollections,
  getBusinessesPaginated,
  getBlogPosts,
  getRealRating,
  formatDayHours,
  todayKey,
  hasOpeningHours,
} from "../services/dataService";
import { useNotification } from "../components/NotificationSystem";
import { nearbyAdaptive } from "../services/regionGeo";
import { useRegionLocation } from "../hooks/useRegionLocation";
import { RegionChip } from "../components/RegionChip";
import { CategoryIcon, guessCategoryIcon } from "../components/categoryIcons";
import { useLanguage, Translate } from "../hooks/useLanguage";

interface BusinessGuideProps {
  currentUser: User | null;
  initialCategory?: string;
  initialSubcategory?: string;
  onNavigate: (page: string, params?: any) => void;
}

const GuideSplash = () => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[100] bg-slate-50/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative mb-8 text-center">
        <div className="absolute inset-0 bg-ocean-200 rounded-full animate-ping opacity-15 duration-1000"></div>
        <div className="relative w-28 h-28 bg-white rounded-3xl shadow-xl border-4 border-ocean-50/50 flex items-center justify-center mx-auto">
          <img src="/brand/simbolo.svg" alt="Lagos GO" className="w-16 h-16 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-ocean-950 mt-8 tracking-tight animate-pulse">
          {t("Explorando os Lagos...")}
        </h2>
        <p className="text-slate-400 text-xs mt-2.5 font-bold uppercase tracking-widest">
          {t("Sincronizando guia oficial")}
        </p>
      </div>
    </div>
  );
};

export const BusinessGuide: React.FC<BusinessGuideProps> = ({
  currentUser,
  initialCategory,
  initialSubcategory,
  onNavigate,
}) => {
  const { notify } = useNotification();
  const { t, language } = useLanguage();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [filtered, setFiltered] = useState<BusinessProfile[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [amenities, setAmenities] = useState<AppAmenity[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || "Todos",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    initialSubcategory || "Todos",
  );
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "recommended" | "rating" | "featured_only"
  >("recommended");
  const [nearby, setNearby] = useState(false);
  const loc = useRegionLocation();
  const locating = loc.status === 'asking';
  const [awaitingGps, setAwaitingGps] = useState(false);
  const [currentLocationName, setCurrentLocationName] =
    useState("Todas as Regiões");
  const [allCoupons, setAllCoupons] = useState<any[]>([]);

  const [favorites, setFavorites] = useState<string[]>(
    currentUser?.favorites?.businesses || [],
  );

  const [lastIndex, setLastIndex] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);
  const isSyncingRef = React.useRef(false);
  const [activeModal, setActiveModal] = useState<"location" | "filters" | null>(
    null,
  );

  const businessesWithCoupons = React.useMemo(() => {
    const activeCoupons = allCoupons.filter((c) => c.active);
    return new Set(activeCoupons.map((c) => c.companyId));
  }, [allCoupons]);

  // Integrated Blog suggestions relevant for active category select
  const filteredBlogPosts = React.useMemo(() => {
    if (!blogPosts || blogPosts.length === 0) return [];
    if (selectedCategory === "Todos") {
      return blogPosts.slice(0, 3); // Latest editorial suggestions
    }
    const catLower = selectedCategory.toLowerCase();
    const matches = blogPosts.filter(
      (post) =>
        (post.category || "").toLowerCase().includes(catLower) ||
        (post.tags || []).some((t) => t.toLowerCase().includes(catLower)),
    );
    return matches.length > 0 ? matches.slice(0, 3) : blogPosts.slice(0, 3);
  }, [blogPosts, selectedCategory]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const syncData = async (isLoadMore = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    if (isLoadMore) setLoadingMore(true);
    else if (!isInitialLoad) setIsFiltering(true);

    try {
      if (debouncedQuery.length > 2) {
        const { searchBusinesses } = await import("../services/dataService");
        const results = await searchBusinesses(
          debouncedQuery,
          selectedCategory,
          selectedLocation,
          selectedSubCategory,
        );
        // Deduplicate
        const seen = new Set<string>();
        const uniqueResults = results.filter((b) => {
          if (seen.has(b.id)) return false;
          seen.add(b.id);
          return true;
        });
        setBusinesses(uniqueResults);
        setHasMore(false);
      } else {
        const isCity = cities.some((c) => c.id === selectedLocation);
        const isNeighborhood = neighborhoods.some(
          (n) => n.id === selectedLocation,
        );

        const {
          docs,
          lastIndex: newLastIndex,
          hasMore: more,
        } = await getBusinessesPaginated(
          12,
          null,
          selectedCategory,
          selectedLocation,
          isCity ? "city" : isNeighborhood ? "neighborhood" : undefined,
          selectedSubCategory,
          isLoadMore ? lastIndex : 0,
        );

        if (isLoadMore) {
          setBusinesses((prev) => {
            const combined = [...prev, ...docs];
            const seen = new Set<string>();
            return combined.filter((b) => {
              if (seen.has(b.id)) return false;
              seen.add(b.id);
              return true;
            });
          });
        } else {
          setBusinesses(docs);
        }

        setLastIndex(newLastIndex);
        setHasMore(more);
      }
    } catch (e) {
      console.error("Failed to sync data", e);
    } finally {
      setIsLoadingDB(false);
      setIsInitialLoad(false);
      setIsFiltering(false);
      setLoadingMore(false);
      isSyncingRef.current = false;
    }
  };

  // LOAD STRUCTURAL & CONTENT DATA
  useEffect(() => {
    const loadStructuralData = async () => {
      try {
        const [cats, cts, nbs, cols, ams, posts] = await Promise.all([
          getCategories(),
          getCities(),
          getNeighborhoods(),
          getCollections(),
          getAmenities(),
          getBlogPosts(),
        ]);

        setCategories(cats);
        setCities(cts);
        setNeighborhoods(nbs);
        setAmenities(ams);
        setCollections(
          cols.filter((c) => c.active).sort((a, b) => a.order - b.order),
        );
        setBlogPosts(posts || []);
      } catch (e) {
        console.error("Failed to load structural data", e);
      }
    };
    loadStructuralData();
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
      const coupons = await getCoupons();
      setAllCoupons(coupons);
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialSubcategory) {
      setSelectedSubCategory(initialSubcategory);
    }
  }, [initialCategory, initialSubcategory]);

  useEffect(() => {
    syncData();

    const handleUpdate = () => syncData();
    window.addEventListener("dataUpdated", handleUpdate);

    const storedGps = sessionStorage.getItem("user_gps");
    if (storedGps && !nearby && selectedLocation === "Todos") {
      const { lat, lng } = JSON.parse(storedGps);
      setCurrentLocationName(identifyNeighborhood(lat, lng));
    }

    return () => {
      window.removeEventListener("dataUpdated", handleUpdate);
    };
  }, [selectedCategory, selectedSubCategory, selectedLocation, debouncedQuery]);

  const handleLoadMore = () => {
    if (
      hasMore &&
      !loadingMore &&
      !isLoadingDB &&
      !isFiltering &&
      !isInitialLoad &&
      !isSyncingRef.current &&
      debouncedQuery.length <= 2
    ) {
      syncData(true);
    }
  };

  useEffect(() => {
    if (!hasMore || loadingMore || isLoadingDB || isFiltering || isInitialLoad)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [
    hasMore,
    loadingMore,
    isLoadingDB,
    isFiltering,
    isInitialLoad,
    loaderRef,
  ]);

  useEffect(() => {
    let result = [...businesses];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(q) ||
          (b.description || "").toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "Todos")
      result = result.filter((b) => b.category === selectedCategory);
    if (selectedSubCategory !== "Todos")
      result = result.filter((b) => b.subcategory === selectedSubCategory);
    if (selectedLocation !== "Todos") {
      const isCity = cities.some((c) => c.id === selectedLocation);
      if (isCity) {
        result = result.filter((b) => b.cityId === selectedLocation);
        setCurrentLocationName(
          cities.find((c) => c.id === selectedLocation)?.name ||
            "Todas as Regiões",
        );
      } else {
        result = result.filter((b) => b.neighborhoodId === selectedLocation);
        setCurrentLocationName(
          neighborhoods.find((n) => n.id === selectedLocation)?.name ||
            "Todas as Regiões",
        );
      }
    } else if (!nearby) {
      setCurrentLocationName("Todas as Regiões");
    }

    if (onlyOpen)
      result = result.filter((b) => checkIfOpen(b.openingHours, b.category));

    if (selectedAmenities && selectedAmenities.length > 0) {
      result = result.filter((b) =>
        selectedAmenities.every((sa) => (b.amenities || []).includes(sa)),
      );
    }

    if (nearby && selectedLocation === "Todos") {
      if (loc.where) {
        const { lat, lng } = loc.where;

        let currentNeighborhoodId: string | null = null;
        let minDistance = Infinity;
        for (const n of neighborhoods) {
          if (n.lat && n.lng && n.active) {
            const dist = calculateDistance(lat, lng, n.lat, n.lng);
            if (dist < minDistance) {
              minDistance = dist;
              currentNeighborhoodId = n.id;
            }
          }
        }

        if (currentNeighborhoodId && minDistance < 10) {
          result = result.filter(
            (b) => b.neighborhoodId === currentNeighborhoodId,
          );
        } else {
          // Raio adaptativo: começa perto e só amplia se houver poucos lugares.
          result = nearbyAdaptive(result, { lat, lng }, { minResults: 8 }).items.map(
            ({ distanceKm, ...b }) => ({ ...b, distance: distanceKm }),
          ) as typeof result;
        }
      }
    } else {
      if (sortBy === "featured_only") {
        result = result.filter((b) => b.isFeatured);
        result.sort(
          (a, b) =>
            (getRealRating(b)?.rating || 0) - (getRealRating(a)?.rating || 0) ||
            (getRealRating(b)?.count || 0) - (getRealRating(a)?.count || 0),
        );
      } else if (sortBy === "rating") {
        result.sort(
          (a, b) =>
            (getRealRating(b)?.rating || 0) - (getRealRating(a)?.rating || 0) ||
            (getRealRating(b)?.count || 0) - (getRealRating(a)?.count || 0),
        );
      } else {
        // default/recommended: prioritize featured first, then sort by rating, then by review count
        result.sort((a, b) => {
          const featA = a.isFeatured ? 1 : 0;
          const featB = b.isFeatured ? 1 : 0;
          if (featB !== featA) return featB - featA;

          const rA = getRealRating(a)?.rating || 0;
          const rB = getRealRating(b)?.rating || 0;
          if (rB !== rA) return rB - rA;

          return (getRealRating(b)?.count || 0) - (getRealRating(a)?.count || 0);
        });
      }
    }

    setFiltered(result);
  }, [
    query,
    selectedCategory,
    selectedSubCategory,
    selectedLocation,
    onlyOpen,
    selectedAmenities,
    nearby,
    loc.where,
    businesses,
    cities,
    neighborhoods,
    sortBy,
  ]);

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) return notify("warning", "Faça login para favoritar.");
    toggleFavorite("business", id);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  const handleNearbyClick = () => {
    if (nearby) {
      setNearby(false);
      return;
    }
    if (loc.where) {
      setNearby(true);
      setCurrentLocationName(loc.municipality?.name || identifyNeighborhood(loc.where.lat, loc.where.lng));
      return;
    }
    setAwaitingGps(true);
    loc.request();
  };

  // Quando o GPS responde (ou falha) depois do clique em "Perto".
  useEffect(() => {
    if (!awaitingGps) return;
    if (loc.where) {
      setAwaitingGps(false);
      setNearby(true);
      setCurrentLocationName(loc.municipality?.name || identifyNeighborhood(loc.where.lat, loc.where.lng));
    } else if (loc.outside) {
      setAwaitingGps(false);
      notify("info", "Você está fora da Região dos Lagos. Escolha uma cidade para ver o que há por lá.");
    } else if (loc.outside) {
      setAwaitingGps(false);
      notify("info", "Você está fora da Região dos Lagos. Escolha uma cidade para ver o que há por lá.");
    } else if (loc.status === "denied" || loc.status === "unavailable") {
      setAwaitingGps(false);
      notify("warning", loc.error || "Não conseguimos sua localização. Escolha sua cidade.");
    }
  }, [awaitingGps, loc.where, loc.status, loc.outside]);

  if (isLoadingDB) return <GuideSplash />;

  const currentCategory = categories.find(
    (c) => c.name.toLowerCase() === selectedCategory.toLowerCase(),
  );
  const currentSubcategories = currentCategory?.subcategories || [];

  return (
    <div className="pb-24 pt-4 min-h-screen bg-slate-50/50">
      {/* 1. TOPO: título + cidade (um só controle de localização) */}
      <div className="px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] sm:text-3xl font-black text-ocean-950 tracking-tight leading-tight">Guia Comercial</h1>
            <p className="text-sm text-slate-500 mt-0.5 leading-snug">
              {nearby && currentLocationName && currentLocationName !== "Todas as Regiões"
                ? `Perto de você · ${currentLocationName}`
                : "Lugares e serviços da Região dos Lagos"}
            </p>
          </div>
          <RegionChip loc={loc} compact tone="light" className="shrink-0" />
        </div>
      </div>

      {/* 2. BUSCA + FILTROS */}
      <div className="px-4 mt-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <label className="flex-1 min-w-0 flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl h-12 pl-4 pr-2 shadow-sm focus-within:border-ocean-300 focus-within:ring-4 focus-within:ring-ocean-500/10 transition-all">
            <Search className="text-slate-400 shrink-0" size={18} aria-hidden />
            <input
              type="text"
              placeholder="Buscar lugares e serviços"
              aria-label="Buscar lugares e serviços"
              enterKeyHint="search"
              className="flex-1 min-w-0 bg-transparent border-0 shadow-none outline-none ring-0 focus:ring-0 p-0 text-[15px] text-slate-800 placeholder:text-slate-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="w-8 h-8 flex items-center justify-center text-slate-400 shrink-0">
                <X size={16} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setActiveModal("filters")}
            aria-label={selectedAmenities.length ? `Filtros (${selectedAmenities.length} ativos)` : "Filtros"}
            data-testid="guide-open-filters"
            className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all ${selectedAmenities.length > 0 ? "bg-ocean-600 border-ocean-600 text-white" : "bg-white border-slate-200 text-ocean-700"}`}
          >
            <SlidersHorizontal size={20} strokeWidth={2.3} />
            {selectedAmenities.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{selectedAmenities.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. CATEGORIAS (carrossel de borda a borda) */}
      <div className="mt-4 max-w-7xl mx-auto w-full">
        <div role="group" aria-label="Categorias" className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1 snap-x snap-proximity scroll-px-4">
          {[{ id: "__all", name: "Todos", icon: "Compass" }, ...categories.map((c) => ({ id: c.id, name: c.name, icon: guessCategoryIcon(c.name) }))].map((cat) => {
            const isAll = cat.id === "__all";
            const isActive = isAll ? selectedCategory === "Todos" : selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => { setSelectedCategory(isAll ? "Todos" : cat.name); setSelectedSubCategory("Todos"); }}
                className="flex flex-col items-center gap-1.5 w-[74px] shrink-0 snap-start group"
              >
                <span className={`w-[58px] h-[58px] rounded-2xl flex items-center justify-center border transition-all ${isActive ? "bg-ocean-600 border-ocean-600 text-white shadow-md shadow-ocean-600/25" : "bg-white border-slate-200 text-ocean-700 shadow-sm group-active:scale-95"}`}>
                  <CategoryIcon name={cat.icon} size={24} />
                </span>
                <span className={`text-[11px] leading-tight text-center line-clamp-2 min-h-[28px] ${isActive ? "font-black text-ocean-700" : "font-bold text-slate-600"}`}>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Ramos (subcategorias) */}
        {currentSubcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pt-2 items-center">
            {["Todos", ...currentSubcategories.map((s) => s.name)].map((name) => {
              const on = selectedSubCategory === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelectedSubCategory(name === "Todos" || selectedSubCategory === name ? "Todos" : name)}
                  className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-bold border transition-all ${on ? "bg-ocean-950 text-white border-ocean-950" : "bg-white text-slate-600 border-slate-200"}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ATALHOS: perto, aberto agora, região */}
      <div className="px-4 mt-3 max-w-7xl mx-auto w-full">
        <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar py-0.5">
          <button
            type="button"
            onClick={handleNearbyClick}
            aria-pressed={nearby}
            className={`shrink-0 h-10 px-4 rounded-full text-[13px] font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${nearby ? "bg-sky-50 border-sky-300 text-sky-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {locating ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} className={nearby ? "fill-current" : ""} />}
            {locating ? "Buscando…" : "Perto de mim"}
          </button>
          <button
            type="button"
            onClick={() => setOnlyOpen(!onlyOpen)}
            aria-pressed={onlyOpen}
            className={`shrink-0 h-10 px-4 rounded-full text-[13px] font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${onlyOpen ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            <Clock size={14} /> Aberto agora
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("location")}
            className={`shrink-0 h-10 px-4 rounded-full text-[13px] font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${selectedLocation !== "Todos" ? "bg-ocean-50 border-ocean-300 text-ocean-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            <MapIcon size={14} />
            {selectedLocation === "Todos"
              ? "Qualquer região"
              : cities.find((c) => c.id === selectedLocation)?.name || neighborhoods.find((n) => n.id === selectedLocation)?.name || "Local"}
            <ChevronDown size={13} className="opacity-60" />
          </button>
        </div>

        {/* Filtros de comodidades ativos */}
        {selectedAmenities.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 items-center">
            {selectedAmenities.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedAmenities((p) => p.filter((x) => x !== id))}
                className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full bg-ocean-950 text-white text-xs font-bold"
              >
                <Check size={12} /> {amenities.find((a) => a.id === id)?.label || id} <X size={11} className="opacity-70" />
              </button>
            ))}
          </div>
        )}

        <p className="mt-3 mb-4 text-xs font-bold text-slate-400" data-testid="guide-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "lugar" : "lugares"}
        </p>
      </div>

      {/* 4. INTEGRATED EDITORIAL DICAS CONTENT (Synergy of Commercial + Blog Content) */}
      {filteredBlogPosts.length > 0 && (
        <div className="px-4 mb-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4 px-1">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-gold-500 fill-gold-500 animate-pulse"
                />
                {selectedCategory === "Todos"
                  ? "Roteiros e Dicas da Semana"
                  : `O melhor de ${selectedCategory}`}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Visualização rápida de matérias escritas de nossa redação.
              </p>
            </div>
            <button
              onClick={() => onNavigate("blog")}
              className="text-[10px] font-black text-ocean-600 hover:text-ocean-700 flex items-center gap-1 uppercase tracking-widest bg-ocean-50/50 hover:bg-ocean-50 px-3.5 py-2.5 rounded-xl border border-ocean-100/40 transition-all active:scale-95 shrink-0"
            >
              Ver Feed Geral <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex gap-4.5 overflow-x-auto hide-scrollbar pb-2 px-0.5 -mx-4 px-4 md:mx-0 md:px-0.5">
            {filteredBlogPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate("blog-detail", { postId: post.id })}
                className="w-[285px] sm:w-[330px] bg-white rounded-[1.8rem] p-3 shadow-xs border border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer flex gap-3.5 shrink-0 group relative overflow-hidden"
              >
                <div className="w-20 h-20 sm:w-[92px] sm:h-[92px] rounded-2xl overflow-hidden shrink-0 relative bg-slate-100">
                  <img
                    src={post.imageUrl}
                    referrerPolicy="no-referrer"
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-1">
                    <span className="inline-block text-[8px] font-black tracking-widest uppercase text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-md leading-none select-none">
                      {post.category}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug line-clamp-2 group-hover:text-ocean-600 transition-colors">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 leading-none select-none">
                      📖 Ver Roteiro
                    </p>
                    {/* Só conexões reais (antes mostrava avatares e números inventados). */}
                    {(post.connectedUsers || []).length > 0 && (
                      <span className="text-[#ff5a1f] font-black text-[9px] uppercase tracking-wider flex items-center gap-1 mt-px">
                        💙 {(post.connectedUsers || []).length} {(post.connectedUsers || []).length === 1 ? "conectado" : "conectados"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FEATURED COLLECTIONS (Vale Conhecer highlight slider) */}
      {collections.length > 0 && selectedCategory === "Todos" && (
        <div className="px-4 mb-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 px-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <MapIcon size={14} className="text-ocean-500" /> Histórias &
              Coleções em Destaque
            </h3>
          </div>

          <div className="flex gap-4.5 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0.5">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() =>
                  onNavigate("collection-detail", { collectionId: col.id })
                }
                className="shrink-0 w-64 h-36 rounded-[1.8rem] overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img
                  src={col.coverImage}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-extrabold text-sm leading-snug drop-shadow-sm">
                    {col.title}
                  </h3>
                  <p className="text-white/80 text-[10px] font-bold tracking-wider uppercase mt-1">
                    {(col.businessIds || []).length} locais recomendados
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BUSINESS RESULTS GRID (With robust card layout) */}
      <div className="px-4 max-w-7xl mx-auto w-full relative">
        <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-[1.8rem] border border-slate-200/80 shadow-2xs w-full">
          <div className="flex items-center gap-2">
            <Store size={15} className="text-ocean-600 shrink-0" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
              Recomendados Comercial ({filtered.length})
            </span>
          </div>

          {/* Fluid Sorting Segment Selector Control */}
          <div className="flex bg-slate-100 p-1 rounded-2xl self-stretch sm:self-auto overflow-x-auto hide-scrollbar shrink-0 gap-1">
            <button
              onClick={() => setSortBy("recommended")}
              className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                sortBy === "recommended"
                  ? "bg-white text-ocean-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Crown
                size={11}
                className={
                  sortBy === "recommended"
                    ? "text-amber-500 fill-amber-500/10"
                    : ""
                }
              />{" "}
              Destaques Premium
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                sortBy === "rating"
                  ? "bg-white text-ocean-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Star
                size={11}
                className={
                  sortBy === "rating" ? "text-amber-500 fill-amber-500/10" : ""
                }
              />{" "}
              Avaliação
            </button>
            <button
              onClick={() => setSortBy("featured_only")}
              className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                sortBy === "featured_only"
                  ? "bg-white text-ocean-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Crown size={11} className="text-amber-500" /> Ver Destaques
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative">
          {isFiltering && (
            <div className="absolute inset-0 z-10 bg-slate-50/50 backdrop-blur-[1px] flex items-center justify-center min-h-[350px] rounded-3xl">
              <Loader2 className="animate-spin text-ocean-600" size={36} />
            </div>
          )}

          {filtered.length === 0 && !isFiltering ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[2.2rem] border border-dashed border-slate-200 shadow-sm px-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-300 border border-slate-100">
                <Search size={36} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">
                Nenhum estabelecimento correspondente
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium">
                Tente alterar os termos da busca, limpar filtros ou ligar o GPS
                para encontrar locais próximos.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("Todos");
                  setSelectedLocation("Todos");
                  setSelectedAmenities([]);
                  setOnlyOpen(false);
                  setNearby(false);
                }}
                className="mt-6 inline-flex px-5 py-3 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            filtered.map((business) => (
              <div
                key={business.id}
                onClick={() =>
                  onNavigate("business-detail", { businessId: business.id })
                }
                className={`bg-white rounded-[2rem] overflow-hidden shadow-xs border hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative group hover:-translate-y-1 ${business.isFeatured ? "ring-[3px] ring-gold-400 ring-offset-2 border-gold-300" : "border-slate-100"}`}
              >
                {/* Premium feature designation label */}
                {business.isFeatured && (
                  <div className="absolute top-3.5 left-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 text-[9px] font-black tracking-widest px-3.5 py-1 rounded-xl z-20 shadow-lg uppercase flex items-center gap-1 leading-none select-none">
                    <Crown
                      size={10}
                      className="fill-slate-950 text-slate-950 shrink-0"
                    />{" "}
                    Parceiro Destaque
                  </div>
                )}

                {/* Card Cover Picture container frame */}
                <div className="h-48 w-full relative bg-slate-100 flex items-center justify-center overflow-hidden">
                  {business.coverImage ? (
                    <img
                      src={business.coverImage}
                      className="w-full h-full object-cover duration-500 group-hover:scale-104 transition-all"
                      alt={business.name}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Store size={36} className="mb-2 opacity-35" />
                      <span className="text-[10px] uppercase font-black tracking-wider">
                        Sem fotos oficiais
                      </span>
                    </div>
                  )}

                  {/* Top Dark shadow gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"></div>

                  {/* Floating Glass Favorite Heart Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, business.id)}
                    className="absolute top-3.5 right-4 p-2.5 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md z-20 text-white transition-all shadow-sm active:scale-90"
                  >
                    <Heart
                      size={15}
                      className={`transition-all duration-300 ${favorites.includes(business.id) ? "fill-rose-500 text-rose-500 scale-110" : "text-white"}`}
                    />
                  </button>

                  {/* Open Closed Active Hours Tag Badges */}
                  {(() => {
                    const isOpen = checkIfOpen(
                      business.openingHours,
                      business.category,
                    );
                    const todayHours = formatDayHours(business.openingHours, todayKey());
                    if (!hasOpeningHours(business.openingHours) && !isOpen) return null;
                    return (
                      <div className="absolute bottom-3 left-4 flex flex-col gap-1 items-start z-20 select-none">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider text-white shadow-md uppercase leading-none ${isOpen ? "bg-emerald-500/90 backdrop-blur-md" : "bg-rose-500/90 backdrop-blur-sm"}`}
                        >
                          {isOpen ? "🟢 Aberto Agora" : "🔴 Fechado"}
                        </span>
                        {isOpen && (
                          <span className="bg-slate-950/75 backdrop-blur-md text-slate-200 text-[8px] font-extrabold px-2 py-0.5 rounded shadow-sm tracking-wide">
                            Hoje: {todayHours}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Card Information Body area */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1 pb-1">
                      <h3 className="font-extrabold text-slate-800 text-[16px] md:text-lg line-clamp-1 flex items-center gap-1.5 leading-snug">
                        {t(business.name)}
                        {business.isFeatured && (
                          <span
                            className="text-amber-500 hover:scale-110 transition-transform shrink-0"
                            title="Parceiro Destaque Premium"
                          >
                            <Crown size={14} className="fill-current" />
                          </span>
                        )}
                      </h3>

                      {/* Nota real (só aparece com avaliações aprovadas) */}
                      {getRealRating(business) && (
                      <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-lg shrink-0">
                        <Star
                          size={11}
                          className="text-gold-500 fill-gold-500"
                        />
                        <span className="text-[11px] font-black text-gold-600">
                          {getRealRating(business)!.rating.toFixed(1)}
                        </span>
                      </div>
                      )}
                    </div>

                    {/* Category and neighborhood markers */}
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-2 select-none">
                      {t(business.category)} •{" "}
                      {neighborhoods.find(
                        (n) => n.id === business.neighborhoodId,
                      )?.name ||
                        cities.find((c) => c.id === business.cityId)?.name ||
                        "Região dos Lagos"}
                    </p>

                    {/* Core short description with ellipsis line Clamp */}
                    <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                      <Translate
                        text={
                          business.description ||
                          "Dica exclusiva Lagos GO de entretenimento e turismo, agende já a sua viagem."
                        }
                      />
                    </p>
                  </div>

                  {/* Directory Bottom Action Tags Grid (Amenities, Coupons) */}
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-1.5 overflow-hidden">
                    {/* Row of Amenity mini-tags */}
                    <div className="flex gap-1.5 overflow-hidden select-none">
                      {(business.amenities || []).slice(0, 2).map((am) => (
                        <span
                          key={am}
                          className="text-[9px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200/50 text-slate-500 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                        >
                          {amenities.find((a) => a.id === am)?.label || am}
                        </span>
                      ))}
                    </div>

                    {/* Promotion indicators line */}
                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                      {business.deliveryUrl && (
                        <span
                          title="Delivery"
                          className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100/60 transition-colors"
                        >
                          🛵 Entrega
                        </span>
                      )}

                      {businessesWithCoupons.has(business.id) && (
                        <div
                          className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg shadow-xs border border-red-100/70"
                          title="Cupom Disponível"
                        >
                          <Ticket
                            size={11}
                            className="animate-pulse text-red-500 fill-red-100"
                          />
                          <span className="text-[8px] font-black uppercase tracking-wider">
                            Cupom
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* INFINITE LAZY PAGINATION LOADING BOTTON OR END OF LIST TEXT */}
        {hasMore && (
          <div
            ref={loaderRef}
            className="flex justify-center mt-12 mb-20 select-none"
          >
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-white border-2 border-ocean-600 hover:bg-ocean-600 text-ocean-600 hover:text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2.5"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Carregando lista...
                </>
              ) : (
                <>
                  Ver Mais Estabelecimentos
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {!hasMore && filtered.length > 0 && (
          <div className="text-center mt-12 mb-20 text-slate-400 font-extrabold text-[11px] uppercase tracking-widest select-none">
            🌴 Fim do guia. Explore outros rumos!
          </div>
        )}
      </div>

      {activeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[400px] sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[slideUp_0.3s_ease-out]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                {activeModal === "location" ? (
                  <>
                    <MapIcon size={18} className="text-ocean-500" /> Localização
                  </>
                ) : (
                  <>
                    <ListFilter size={18} className="text-ocean-500" /> Filtros
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-2 overflow-y-auto flex-1 hide-scrollbar">
              {activeModal === "location" && (
                <div className="flex flex-col px-2 py-2">
                  <button
                    onClick={() => {
                      setSelectedLocation("Todos");
                      setActiveModal(null);
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl mb-2 transition-all ${selectedLocation === "Todos" ? "bg-ocean-50 text-ocean-700 font-bold border border-ocean-200" : "hover:bg-slate-50 text-slate-700 font-semibold border border-transparent"}`}
                  >
                    Qualquer lugar
                    {selectedLocation === "Todos" && <Check size={16} />}
                  </button>

                  {cities.map((city) => (
                    <div key={city.id} className="mb-4">
                      <h4 className="px-4 py-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                        {city.name}
                      </h4>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setSelectedLocation(city.id);
                            setActiveModal(null);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedLocation === city.id ? "bg-ocean-50 text-ocean-700 font-bold" : "hover:bg-slate-50 text-slate-600 font-medium"}`}
                        >
                          <span className="pl-2">Toda a cidade</span>
                          {selectedLocation === city.id && <Check size={16} />}
                        </button>
                        {neighborhoods
                          .filter((n) => n.cityId === city.id)
                          .map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setSelectedLocation(n.id);
                                setActiveModal(null);
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedLocation === n.id ? "bg-ocean-50 text-ocean-700 font-bold" : "hover:bg-slate-50 text-slate-600 font-medium"}`}
                            >
                              <span className="pl-2">{n.name}</span>
                              {selectedLocation === n.id && <Check size={16} />}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === "filters" && (
                <div className="flex flex-col gap-1 p-2">
                  {amenities.map((am) => {
                    const isSelected = selectedAmenities.includes(am.id);
                    return (
                      <button
                        key={am.id}
                        onClick={() => {
                          setSelectedAmenities((prev) =>
                            isSelected
                              ? prev.filter((x) => x !== am.id)
                              : [...prev, am.id],
                          );
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-1 ${isSelected ? "bg-ocean-50 border border-ocean-200" : "bg-slate-50 border border-transparent hover:bg-slate-100"}`}
                      >
                        <span
                          className={`font-semibold ${isSelected ? "text-ocean-700" : "text-slate-700"}`}
                        >
                          {am.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? "bg-ocean-500 border-ocean-500 text-white" : "border-slate-300"}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                  <div className="mt-4 p-2 bg-white sticky bottom-0 border-t border-slate-50">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-full bg-ocean-600 text-white font-extrabold uppercase tracking-widest text-sm py-4 rounded-2xl hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-500/30"
                    >
                      Aplicar Filtros{" "}
                      {selectedAmenities.length > 0 &&
                        `(${selectedAmenities.length})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
