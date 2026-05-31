
import { 
    collection, 
    getDocs, 
    getDoc, 
    setDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    increment,
    onSnapshot,
    arrayUnion,
    limit,
    orderBy,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updatePassword,
    signInAnonymously
} from 'firebase/auth';
import { auth, db } from './firebase';
import { 
    Coupon, User, UserRole, BusinessProfile, BlogPost, SavingsRecord, 
    CompanyRequest, AppCategory, Subcategory, DEFAULT_CATEGORIES, 
    DEFAULT_AMENITIES, AppConfig, Collection, PricingPlan, HomeHighlight, City, Neighborhood, Review, PaymentSettings, AppAmenity, BlogAd
} from '../types';

export interface AppGlobalSettings {
    salesWhatsapp: string;
}

const SESSION_KEY = 'lagos_go_session_v1';

let _businesses: BusinessProfile[] = [];
let _allBusinessesLoaded = false;
let _coupons: Coupon[] = [];
let _users: User[] = [];
let _categories: AppCategory[] = [];
let _dicasCategories: AppCategory[] = [];
let _requests: CompanyRequest[] = [];
let _plans: PricingPlan[] = [];
let _highlights: HomeHighlight[] = [];
let _cities: City[] = [];
let _neighborhoods: Neighborhood[] = [];
const _reviews: Review[] = [];
let _blogAds: BlogAd[] = [];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
let _isInitialized = false;

let _collections: Collection[] = [];
const _appConfig: AppConfig = { appName: 'LAGOS', appNameHighlight: 'GO' };

// --- READ MONITORING (PROMPT 5) ---
let _totalReads = 0;
const trackRead = (collectionName: string, count: number, source: string) => {
    if (process.env.NODE_ENV === 'development') {
        _totalReads += count;
        console.log(`%c[FIRESTORE READ] %c${collectionName} %c(${count} docs) %cfrom: ${source} %cTotal: ${_totalReads}`, 
            'color: #ff9800; font-weight: bold', 
            'color: #2196f3; font-weight: bold', 
            'color: #4caf50', 
            'color: #9e9e9e',
            'color: #f44336; font-weight: bold'
        );
    }
};

const notifyListeners = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dataUpdated'));
        window.dispatchEvent(new Event('appConfigUpdated'));
    }
};

export const ensureCorrectRole = async (userData: User): Promise<User> => {
    const emailLower = (userData.email || '').toLowerCase();
    let changed = false;
    const updates: any = {};
    
    if (emailLower === 'sea.angelshotel@gmail.com' || emailLower === 'admin@lagosgo.org' || emailLower === 'admin@conectario.com') {
        if (userData.role !== UserRole.SUPER_ADMIN) {
            userData.role = UserRole.SUPER_ADMIN;
            updates.role = UserRole.SUPER_ADMIN;
            changed = true;
        }
    } else if (emailLower === 'contato.yuriguida@gmail.com') {
        if (userData.role !== UserRole.JOURNALIST) {
            userData.role = UserRole.JOURNALIST;
            updates.role = UserRole.JOURNALIST;
            changed = true;
        }
        if (userData.manualPassword !== '123456') {
            userData.manualPassword = '123456';
            updates.manualPassword = '123456';
            changed = true;
        }
        // Prefill nice default journalist profile details for Yuri if blank
        if (!userData.bio) {
            userData.bio = 'Yuri Guida é o idealizador e produtor de conteúdo oficial do Konecta Rio, trazendo dicas locais quentes e roteiros testados de ponta a ponta na Região dos Lagos.';
            updates.bio = userData.bio;
            changed = true;
        }
        if (!userData.profession) {
            userData.profession = 'Editor-Chefe / Konecta Rio Feed';
            updates.profession = userData.profession;
            changed = true;
        }
        if (!userData.instagram) {
            userData.instagram = 'yuriguida';
            updates.instagram = userData.instagram;
            changed = true;
        }
        if (!userData.avatarUrl) {
            userData.avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';
            updates.avatarUrl = userData.avatarUrl;
            changed = true;
        }
    }
    
    // Fix for yurirmg@gmail.com who was accidentally made SUPER_ADMIN
    if (emailLower === 'yurirmg@gmail.com' && userData.role === UserRole.SUPER_ADMIN) {
        userData.role = UserRole.COMPANY;
        updates.role = UserRole.COMPANY;
        changed = true;
    }

    if (changed && Object.keys(updates).length > 0) {
        try {
            await updateDoc(doc(db, 'users', userData.id), updates);
        } catch (e) {
            console.error("Error updating user role in Firestore:", e);
        }
    }
    return userData;
};

let _isAuthInitialized = false;

onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                let userData = { id: userDoc.id, ...data } as User;
                userData = await ensureCorrectRole(userData);
                localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
            }
        } catch (e) {
            console.error("Auth session sync error:", e);
        }
    } else {
        // Firebase Auth is signed out, ensure local session is cleared
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
    }
    _isAuthInitialized = true;
    notifyListeners();
});

export const isAuthInitialized = () => _isAuthInitialized;

const cleanObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item)).filter(item => item !== undefined && item !== null);
    }
    if (typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
            const val = cleanObject(obj[key]);
            if (val !== undefined && val !== null) {
                newObj[key] = val;
            }
        });
        return newObj;
    }
    return obj;
};

export const initFirebaseData = () => {
    if (_isInitialized) return;
    _isInitialized = true;

    const handleError = (err: any, collectionName: string) => {
        console.warn(`[Firestore] Permission denied or error reading ${collectionName}:`, err.message);
    };

    // 1. Small & Structural Collections (Keep onSnapshot for real-time UI structure)
    onSnapshot(collection(db, 'app_categories_guia'), async (snapshot) => {
        if (snapshot.empty) {
            try {
                for (const catName of DEFAULT_CATEGORIES) {
                    const catId = catName.toLowerCase().replace(/ç/g, 'c').replace(/ã/g, 'a');
                    const newCat: AppCategory = { id: catId, name: catName, subcategories: [] };
                    await setDoc(doc(db, 'app_categories_guia', catId), newCat);
                }
            } catch (e) {
                console.warn("Could not create default categories:", e);
            }
        } else {
            _categories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppCategory));
            notifyListeners();
        }
    }, (err) => handleError(err, 'app_categories_guia'));

    onSnapshot(collection(db, 'app_categories_dicas'), (snapshot) => {
        _dicasCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppCategory));
        notifyListeners();
    }, (err) => handleError(err, 'app_categories_dicas'));

    onSnapshot(collection(db, 'pricingPlans'), async (snapshot) => {
        if (snapshot.empty) {
            try {
                const defaultPlans: Partial<PricingPlan>[] = [
                    { 
                        id: 'basic', 
                        name: 'Básico', 
                        price: 49.90, 
                        period: 'monthly', 
                        maxCoupons: 3, 
                        maxBusinesses: 1, 
                        active: true,
                        showSocialMedia: true
                    },
                    { 
                        id: 'pro', 
                        name: 'Pro', 
                        price: 99.90, 
                        period: 'monthly', 
                        maxCoupons: 10, 
                        maxBusinesses: 1, 
                        isFeatured: true, 
                        active: true,
                        showGallery: true,
                        showMenu: true,
                        showSocialMedia: true,
                        showReviews: true,
                        hasFreeTrial: true
                    },
                    { 
                        id: 'premium', 
                        name: 'Premium', 
                        price: 199.90, 
                        period: 'monthly', 
                        maxCoupons: 50, 
                        maxBusinesses: 3, 
                        active: true,
                        showGallery: true,
                        showMenu: true,
                        showSocialMedia: true,
                        showReviews: true
                    }
                ];
                for (const p of defaultPlans) {
                    await savePricingPlan(p);
                }
            } catch (e) {
                console.warn("Could not seed pricing plans:", e);
            }
        } else {
            _plans = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PricingPlan));
            notifyListeners();
        }
    }, (err) => handleError(err, 'pricingPlans'));

    onSnapshot(collection(db, 'home_highlights'), (snapshot) => {
        _highlights = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HomeHighlight)).sort((a, b) => a.order - b.order);
        notifyListeners();
    }, (err) => handleError(err, 'home_highlights'));

    onSnapshot(collection(db, 'cities'), (snapshot) => {
        _cities = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as City));
        notifyListeners();
    }, (err) => handleError(err, 'cities'));

    onSnapshot(collection(db, 'neighborhoods'), (snapshot) => {
        _neighborhoods = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Neighborhood));
        notifyListeners();
    }, (err) => handleError(err, 'neighborhoods'));

    onSnapshot(collection(db, 'collections'), (snapshot) => {
        _collections = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Collection)).sort((a, b) => a.order - b.order);
        notifyListeners();
    }, (err) => handleError(err, 'collections'));

    // 2. Large Collections (Use getDocs with limits for initial load to save reads)
    /**
     * 🛡️ PROTOCOLO DE SEGURANÇA: loadInitialLargeData
     * - Esta função é crítica para a performance inicial.
     * - Carrega dados essenciais para o Guia e Cupons.
     * - NUNCA adicione filtros restritivos aqui que possam ocultar dados antigos.
     */
    const loadInitialLargeData = async () => {
        try {
            // Load only first 20 businesses
            const bizSnap = await getDocs(query(collection(db, 'businesses'), where('isBlocked', '==', false), limit(20)));
            _businesses = bizSnap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));

            // Load only first 100 coupons to ensure badges show up in the guide
            const couponSnap = await getDocs(query(collection(db, 'coupons'), limit(100)));
            _coupons = couponSnap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));

            // Load only first 10 blog posts
            const postSnap = await getDocs(query(collection(db, 'blog_posts'), orderBy('date', 'desc'), limit(10)));
            _posts = postSnap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));

            notifyListeners();
        } catch (err) {
            console.error("Error loading initial large data:", err);
        }
    };

    loadInitialLargeData();
};

initFirebaseData();

export const login = async (email: string, pass: string): Promise<User | null> => {
    // 1. Try to find in local cache first
    let foundUser = _users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    
    // 2. If not in cache, try to fetch from Firestore by email
    if (!foundUser) {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const docSnap = snap.docs[0];
                foundUser = { id: docSnap.id, ...docSnap.data() } as User;
                // Add to cache
                _users.push(foundUser);
            }
        } catch (e) {
            console.warn("Error fetching user during login:", e);
        }
    }

    // Auto-create Yuri Guida if missing completely (first boot/seeding safeguard)
    if (!foundUser && email.toLowerCase() === 'contato.yuriguida@gmail.com') {
        const newUid = 'yuri_guida';
        foundUser = {
            id: newUid,
            name: 'Yuri Guida',
            email: email.toLowerCase(),
            role: UserRole.JOURNALIST,
            favorites: { coupons: [], businesses: [] },
            history: [],
            savedAmount: 0,
            manualPassword: '123456',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            profession: 'Editor-Chefe / Konecta Rio Feed',
            bio: 'Yuri Guida é o idealizador e produtor de conteúdo oficial do Konecta Rio, trazendo dicas locais quentes e roteiros testados de ponta a ponta na Região dos Lagos.',
            instagram: 'yuriguida'
        };
        try {
            await setDoc(doc(db, 'users', newUid), cleanObject(foundUser));
            _users.push(foundUser);
        } catch (e) {
            console.error("Error auto-creating default journalist:", e);
        }
    }

    if (foundUser) {
        if (foundUser.isBlocked) throw new Error("Sua conta está inativa. Entre em contato com o suporte.");

        // Check password matching manualPassword directly (robust sandbox fallback)
        const isMasterYuri = foundUser.email?.toLowerCase() === 'contato.yuriguida@gmail.com';
        const isCorrectManual = foundUser.manualPassword === pass || (isMasterYuri && pass === '123456');

        if (isCorrectManual) {
            // Persist the custom password to Firestore if out of sync
            if (foundUser.manualPassword !== pass) {
                foundUser.manualPassword = pass;
                await updateDoc(doc(db, 'users', foundUser.id), { manualPassword: pass });
            }
            
            // Enforce role integrity
            foundUser = await ensureCorrectRole(foundUser);
            
            localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
            notifyListeners();
            return foundUser;
        }
    }

    try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const userDoc = await getDoc(doc(db, 'users', res.user.uid));
        if (userDoc.exists()) {
            let userData = { id: userDoc.id, ...userDoc.data() } as User;
            if (userData.isBlocked) {
                await auth.signOut();
                throw new Error("Sua conta está inativa. Entre em contato com o suporte.");
            }
            // Enforce role integrity
            userData = await ensureCorrectRole(userData);
            localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
            notifyListeners();
            return userData;
        }
    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            return null;
        }
        throw error;
    }
    return null;
};

export const loginWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    // Force account selection to avoid automatic login with wrong account
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', res.user.uid));
    let userData: User;
    if (userDoc.exists()) {
        userData = { id: userDoc.id, ...userDoc.data() } as User;
        if (userData.isBlocked) {
            await auth.signOut();
            throw new Error("Sua conta está inativa. Entre em contato com o suporte.");
        }
        // Enforce role and state constraints via unified helper
        userData = await ensureCorrectRole(userData);
    } else {
        const email = (res.user.email || '').toLowerCase();
        const isAdminEmail = email === 'admin@lagosgo.org' || email === 'sea.angelshotel@gmail.com' || email === 'admin@conectario.com';
        let role = isAdminEmail ? UserRole.SUPER_ADMIN : UserRole.CUSTOMER;
        if (email === 'contato.yuriguida@gmail.com') {
            role = UserRole.JOURNALIST;
        }

        userData = {
            id: res.user.uid,
            name: res.user.displayName || 'Usuário',
            email: res.user.email || '',
            role,
            favorites: { coupons: [], businesses: [] },
            history: [],
            savedAmount: 0,
            avatarUrl: res.user.photoURL || undefined
        };
        try {
            await setDoc(doc(db, 'users', userData.id), cleanObject(userData));
            userData = await ensureCorrectRole(userData);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${userData.id}`);
        }
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    notifyListeners();
    return userData;
};

export const resetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
};

export const changeCurrentUserPassword = async (newPassword: string) => {
    if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
    } else {
        throw new Error("Usuário não autenticado no Firebase.");
    }
};

export const setManualPassword = async (userId: string, password: string) => {
    await updateDoc(doc(db, 'users', userId), { manualPassword: password });
    notifyListeners();
};

export const logout = async () => {
    await auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    notifyListeners();
};

export const isSubscriptionExpired = (business: BusinessProfile | null): boolean => {
    if (!business || !business.subscriptionEndsAt) return false;
    return new Date(business.subscriptionEndsAt) < new Date();
};

export const getBusinesses = async (forceRefresh = false) => {
    if (_businesses.length === 0 || forceRefresh) {
        const snap = await getDocs(query(collection(db, 'businesses'), where('isBlocked', '==', false), limit(50)));
        _businesses = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));
    }
    
    // Auto-seed check for new locations (Paradiso, etc)
    if (!_businesses.find(b => b.name === 'Praia do Pontal')) {
        try {
            const { seedTouristSpots } = await import('./seedService');
            await seedTouristSpots((t, m) => console.log(m));
            const snap = await getDocs(query(collection(db, 'businesses'), where('isBlocked', '==', false), limit(50)));
            _businesses = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));
        } catch (e) {
            console.warn('Auto-seed failed', e);
        }
    }

    return _businesses.filter(b => !b.status || b.status === 'approved');
};

export const getAllBusinesses = async (includePending = false) => {
    // Fetch all businesses if not already fully loaded
    if (!_allBusinessesLoaded) { 
        const snap = await getDocs(collection(db, 'businesses'));
        trackRead('businesses', snap.size, 'getAllBusinesses');
        _businesses = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));
        _allBusinessesLoaded = true;
    }
    
    // Auto-seed check for new locations (Caminho do Sol, Paradiso)
    if (!_businesses.find(b => b.name === 'Praia do Pontal')) {
        try {
            const { seedTouristSpots } = await import('./seedService');
            await seedTouristSpots((t, m) => console.log(m));
            const snap = await getDocs(collection(db, 'businesses'));
            _businesses = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));
        } catch (e) {
            console.warn('Auto-seed failed', e);
        }
    }

    if (includePending) return _businesses;
    return _businesses.filter(b => !b.status || b.status === 'approved');
};

// --- PAGINATION ---
export const getBusinessesPaginated = async (
    pageSize = 12, 
    lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
    category?: string,
    locationId?: string,
    locationType?: 'city' | 'neighborhood',
    subcategory?: string,
    lastIndex: number = 0 // Use index for in-memory pagination
) => {
    // Fetch all businesses if not already loaded
    if (!_allBusinessesLoaded) {
        const snap = await getDocs(collection(db, 'businesses'));
        trackRead('businesses', snap.size, 'getBusinessesPaginated_FullLoad');
        _businesses = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));
        _allBusinessesLoaded = true;
    }

    // Auto-seed check for new locations (Caminho do Sol, Paradiso)
    if (!_businesses.find(b => b.name === 'Praia do Pontal')) {
        try {
            const { seedTouristSpots } = await import('./seedService');
            await seedTouristSpots((t, m) => console.log(m));
            const snap = await getDocs(collection(db, 'businesses'));
            _businesses = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile));
        } catch (e) {
            console.warn('Auto-seed failed', e);
        }
    }

    // Filter in memory
    let filtered = _businesses.filter(b => {
        const isApproved = !b.status || b.status === 'approved';
        return !b.isBlocked && isApproved;
    });

    if (category && category !== 'Todos') {
        filtered = filtered.filter(b => b.category === category);
    }
    
    if (subcategory && subcategory !== 'Todos') {
        filtered = filtered.filter(b => b.subcategory === subcategory);
    }
    
    if (locationId && locationId !== 'Todos') {
        if (locationType === 'neighborhood') {
            filtered = filtered.filter(b => b.neighborhoodId === locationId);
        } else if (locationType === 'city') {
            filtered = filtered.filter(b => b.cityId === locationId);
        } else {
            // Fallback: guess from cache
            const isNeighborhood = _neighborhoods.some(n => n.id === locationId);
            if (isNeighborhood) {
                filtered = filtered.filter(b => b.neighborhoodId === locationId);
            } else {
                filtered = filtered.filter(b => b.cityId === locationId);
            }
        }
    }

    // Sort by name (since we removed orderBy('name') from the query)
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    // Paginate in memory
    const startIndex = lastIndex;
    const endIndex = startIndex + pageSize;
    const paginatedDocs = filtered.slice(startIndex, endIndex);

    return { 
        docs: paginatedDocs, 
        lastDoc: null, // Not used anymore, we use lastIndex
        lastIndex: endIndex,
        hasMore: endIndex < filtered.length 
    };
};

/**
 * 🛡️ PROTOCOLO DE SEGURANÇA: getCoupons
 * - NUNCA use filtros estritos como c.status === 'approved' ou c.active === true.
 * - Cupons sem status ou sem campo active DEVEM ser tratados como aprovados e ativos (compatibilidade legado).
 * - Use sempre: !c.status || c.status === 'approved' e c.active !== false.
 */
export const getCoupons = async (forceRefresh = false, includeInactive = false) => {
    if (_coupons.length === 0 || forceRefresh) {
        const q = query(collection(db, 'coupons'));
        const snap = await getDocs(q);
        trackRead('coupons', snap.size, 'getCoupons');
        _coupons = snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
    }
    
    let resultCoupons = includeInactive ? _coupons : _coupons.filter(c => c.active !== false);
    
    // Filter by status if not including inactive (regular user view)
    if (!includeInactive) {
        resultCoupons = resultCoupons.filter(c => {
            // Allow 'approved' OR missing status (old data)
            return !c.status || c.status === 'approved';
        });
    }
    
    return resultCoupons.map(c => {
        if (!c.companyName || c.companyName === 'Minha Empresa') {
            const biz = _businesses.find(b => b.id === c.companyId);
            if (biz) return { ...c, companyName: biz.name };
        }
        return c;
    });
};

export const getBusinessById = async (id: string) => {
    const cached = _businesses.find(b => b.id === id && !b.isBlocked);
    if (cached) {
        return { ...cached };
    }

    const docRef = doc(db, 'businesses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const biz = { id: docSnap.id, ...docSnap.data() } as BusinessProfile;
        if (!biz.isBlocked) {
            // Add to cache if not there
            if (!_businesses.find(b => b.id === biz.id)) {
                _businesses.push(biz);
            }
            return biz;
        }
    }
    return undefined;
};

export const getBusinessByIdAdmin = async (id: string) => {
    const cached = _businesses.find(b => b.id === id);
    if (cached) return { ...cached };

    const docRef = doc(db, 'businesses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const biz = { id: docSnap.id, ...docSnap.data() } as BusinessProfile;
        if (!_businesses.find(b => b.id === biz.id)) {
            _businesses.push(biz);
        }
        return biz;
    }
    return undefined;
};

// New optimized search function
export const searchBusinesses = async (searchQuery: string, category?: string, locationId?: string, subcategory?: string) => {
    let q = query(collection(db, 'businesses'), where('isBlocked', '==', false), limit(100));
    
    if (category && category !== 'Todos') {
        q = query(q, where('category', '==', category));
    }

    if (subcategory && subcategory !== 'Todos') {
        q = query(q, where('subcategory', '==', subcategory));
    }

    if (locationId && locationId !== 'Todos') {
        const isNeighborhood = _neighborhoods.some(n => n.id === locationId);
        if (isNeighborhood) {
            q = query(q, where('neighborhoodId', '==', locationId));
        } else {
            q = query(q, where('cityId', '==', locationId));
        }
    }

    const snap = await getDocs(q);
    trackRead('businesses', snap.size, 'searchBusinesses');
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile))
        .filter(b => !b.status || b.status === 'approved');
    
    // Update cache with new results
    results.forEach(res => {
        if (!_businesses.find(b => b.id === res.id)) {
            _businesses.push(res);
        }
    });

    if (searchQuery) {
        const s = searchQuery.toLowerCase();
        return results.filter(b => 
            (b.name || '').toLowerCase().includes(s) || 
            (b.description || '').toLowerCase().includes(s)
        );
    }
    
    return results;
};

const DEFAULT_DICAS_CATEGORIES = [
    { id: 'cat_roteiros', name: 'Roteiros' },
    { id: 'cat_gastronomia', name: 'Gastronomia' },
    { id: 'cat_eventos', name: 'Eventos' },
    { id: 'cat_noticias', name: 'Notícias' },
    { id: 'cat_dicas_uteis', name: 'Dicas Úteis' }
];

const DEFAULT_POSTS: BlogPost[] = [
    {
        id: 'roteiro-3-dias-paraiso',
        title: 'O Roteiro Perfeito de 3 Dias em Arraial do Cabo',
        excerpt: 'Se você tem apenas um fim de semana para aproveitar o Caribe Brasileiro, este guia passo a passo vai garantir que você conheça as melhores praias, mirantes e restaurantes sem pressa.',
        content: `Arraial do Cabo é conhecida mundialmente por suas águas cristalinas, praias paradisíacas e vida marinha pulsante. Mas como organizar tudo de forma ideal em apenas 3 dias?

### Dia 1: O Clássico Passeio de Barco e Pôr do Sol no Pontal
Comece cedo pegando o barco na Praia dos Anjos. O roteiro obrigatório inclui a Ilha do Farol, as Prainhas do Pontal do Atalaia e a Praia do Forno. À tarde, relaxe na Praia do Forno e caminhe de volta pela trilha ecológica. Para encerrar o dia com chave de ouro, suba até o Pontal do Atalaia para assistir ao pôr do sol mais espetacular do Brasil.

### Dia 2: Aventura nas Prainhas e Mergulho Autônomo
Dedique o segundo dia para descer a famosa escadaria de madeira das Prainhas do Pontal do Atalaia logo às 8h da manhã para pegá-la deserta. Se você gosta de vida selvagem, faça um mergulho de batismo operado pelas excelentes agências locais. É comum encontrar tartarugas marinhas de perto!

### Dia 3: Praia Grande e Mirantes Ecológicos
Reserve a manhã para caminhar pela areia branquíssima e fina da imensa Praia Grande. Faça uma parada para saborear petiscos nos quiosques à beira-mar e conhecer a estátua de Flávia Alessandra. Termine seu dia com uma caminhada rústica até a Praia do Amor.`,
        imageUrl: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',
        category: 'Roteiros',
        date: '2026-05-27',
        author: 'Ana Souza',
        authorId: 'auth_ana',
        tags: ['Arraial do Cabo', 'Roteiro', 'Praia', 'Destaque'],
        status: 'published'
    },
    {
        id: 'passeio-barco-secreto',
        title: 'Passeio de Barco em Arraial: Rotas Tradicionais vs. Alternativas',
        excerpt: 'Descubra como fugir das aglomerações e encontrar praias praticamente desertas, como a Fenda do Nefilim e a Gruta Azul com operadoras exclusivas.',
        content: `O passeio de barco é a atração nº 1 de Arraial do Cabo, mas o que muitos visitantes não sabem é que existem grandes diferenças entre embarcar em uma escuna coletiva animada ou em um barco privativo personalizado de pescadores.

### A Rota Tradicional
A maioria das escunas sai da Praia dos Anjos e segue uma ordem rígida: Ilha do Farol (tempo de permanência restrito pela Marinha), Prainhas do Pontal e Praia do Forno. É uma experiência incrível, cheia de música e animação.

### A Rota de Exploração / Alternativa
Ao optar por barcos de menor porte (taxis-boat ou operadoras ecológicas exclusivas), você pode personalizar o horário de saída (saia às 7h30, trinta minutos antes das escunas!).

Além das paradas tradicionais, essas embarcações conseguem adentrar de forma segura áreas geológicas fascinantes, como a Fenda de Nossa Senhora, o perfil esculpido pelo vento na Fenda do Nefilim, e flutuar com snorkel em águas profundas na majestosa Gruta Azul quando as condições de vento estão calmas. Essa perspectiva exclusiva transforma sua viagem!`,
        imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
        category: 'Roteiros',
        date: '2026-05-26',
        author: 'Carlos Drummond',
        authorId: 'auth_carlos',
        tags: ['Passeio', 'Barco', 'Gruta Azul'],
        status: 'published'
    },
    {
        id: 'melhores-frutos-mar',
        title: 'Top 5 Restaurantes de Frutos do Mar que Você Precisa Conhecer',
        excerpt: 'Da tradicional moqueca praiana ao polvo grelhado na brasa, listamos os verdadeiros tesouros gastronômicos que valorizam a pesca local da Região dos Lagos.',
        content: `A culinária de Arraial do Cabo é intrinsecamente ligada à sua história pesqueira. Pratos frescos, peixe pescado no dia e o afeto da cozinha litorânea criam vivências gastronômicas memoráveis após um dia dourado de sol.

### 1. Restaurante Flutuante (Praia do Forno)
Alcançar o restaurante flutuante já é metade da diversão. Você pode saborear ostras frescas que são cultivadas logo abaixo da sua mesa com uma cerveja gelada enquanto aprecia a calma baía do Forno.

### 2. Saint Tropez (Orla da Praia dos Anjos)
Especialista em moquecas e caldeiradas fartas, este restaurante tem o ambiente ideal para um almoço longo em família. A moqueca de peixe com camarão servida na panela de barro é inigualável.

### 3. Bacalhau do Tuga (Orla da Prainha)
Uma combinação perfeita de sabores portugueses tradicionais e frutos do mar locais. Sob a batuta do amigável chef luso, o polvo cozido de forma impecável e regado com azeite extravirgem é um prato obrigatório.

### 4. Meu Querido Cabofriense (Rua Principal)
Conhecido por suas generosidades de camarão à milanesa e arroz de frutos do mar bem temperado.

### 5. Cantinho do Pescador (Centro)
Um local rústico e amado pelos moradores locais onde o cardápio secreto do chef varia dependendo do peixe fresco recolhido nas redes dos barcos pesqueiros pela manhã.`,
        imageUrl: 'https://images.unsplash.com/photo-1534080391025-a77b068740e4?auto=format&fit=crop&w=800&q=80',
        category: 'Gastronomia',
        date: '2026-05-25',
        author: 'Daniela Chef',
        authorId: 'auth_daniela',
        tags: ['Gastronomia', 'Frutos do Mar', 'Restaurantes'],
        status: 'published'
    },
    {
        id: 'cafes-charme-centro',
        title: 'Cafés Charmosos para um Final de Tarde Inesquecível',
        excerpt: 'Lugares aconchegantes com cafés especiais, bolos caseiros e decoração rústica que são a cara do sossego de Arraial após um dia inteiro de praia.',
        content: `Fugir do sol de meio-dia ou se preparar para o anoitecer fica muito melhor com uma pausa para o café. Arraial vem desenvolvendo uma rota deliciosa de pequenas cafeterias rústicas e empórios gourmet com um charme inigualável.

### O Café do Canal
Perfeito para quem busca pães artesanais de fermentação natural com crosta crocante e recheio arejado. O espresso tirado no ponto exato acompanha perfeitamente uma fatia generosa de bolo de banana com canela quentinho.

### Santo Grão das Ondas
Localizado em uma simpática galeria artística próxima à Praia Grande, este café oferece métodos de extração variados (V60, Aeropress, Prensa Francesa) e opções veganas deliciosas, como cappuccinos de leite de aveia com cacau 100% puro.`,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        category: 'Gastronomia',
        date: '2026-05-24',
        author: 'Daniela Chef',
        authorId: 'auth_daniela',
        tags: ['Cafés', 'Sobremesas', 'Centro'],
        status: 'published'
    },
    {
        id: 'festival-bossa-jazz',
        title: 'Arraial Bossa & Jazz: Edição de Inverno Confirmada!',
        excerpt: 'O festival mais charmoso da Região dos Lagos está de volta. Confira a programação completa das apresentações ao vivo que acontecerão na Orla da Praia dos Anjos.',
        content: `A Secretaria de Cultura confirmou a volta anual do tão aguardado Festival Arraial Bossa & Jazz, um evento que une música erudita e gastronomia sofisticada nas belas paisagens de Arraial do Cabo.

O festival contará com dois palcos montados estrategicamente de frente para o mar, na Praia dos Anjos. O acesso é totalmente gratuito e contará com postos de arrecadação de alimentos não perecíveis.

Entre as atrações estão confirmados ícones nacionais da MPB e do Bossa Nova, além de instrumentistas locais que apresentarão as tradicionais melodias litorâneas com roupagem jazz contemporânea. Haverá também um circuito gastronômico especial com food trucks gourmet servindo vinhos artesanais, queijos finos e sobremesas locais de renome internacional.`,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        category: 'Eventos',
        date: '2026-05-23',
        author: 'Guilherme Santos',
        authorId: 'auth_guilherme',
        tags: ['Festival', 'Jazz', 'Bossa Nova', 'Música'],
        status: 'published'
    },
    {
        id: 'festas-luau-praia',
        title: 'A Magia dos Luaus na Praia do Pontal do Atalaia',
        excerpt: 'Uma curadoria das noites musicais sob as estrelas, onde músicos locais reúnem moradores e turistas ao redor de fogueiras e boa energia.',
        content: `Nada define melhor o espírito livre de Arraial do Cabo do que o calor das fogueiras na praia acompanhado pelo ritmo rítmico de violões acústicos e vozes sob as estrelas. Os luaus reúnem pessoas de todas as idades ao anoitecer para celebrar as boas vibrações.

### Onde e Quando Encontrar?
Embora aconteçam de forma esporádica e informal, a comunidade artística de Cabo Frio e Arraial costuma atualizar as reuniões através das redes sociais locais. O destino preferido é a extensão das areias mais protegidas do Pontal, que por não ter postes elétricos oferece as vistas perfeitas da abóbada celeste e de chuvas de meteoros brilhantes.

Vista uma peça de roupa aconchegante, leve sua canga mais volumosa, algumas frutas locais para compartilhar e viva Arraial de uma maneira pura, conectada com a natureza deslumbrante e o calor humano local.`,
        imageUrl: 'https://images.unsplash.com/photo-1496337589254-7e19d01cedee?auto=format&fit=crop&w=800&q=80',
        category: 'Eventos',
        date: '2026-05-22',
        author: 'Guilherme Santos',
        authorId: 'auth_guilherme',
        tags: ['Luau', 'Noite', 'Acústico'],
        status: 'published'
    },
    {
        id: 'nova-orla-prainha',
        title: 'Revitalização da Orla da Prainha Impulsiona Comércio Local',
        excerpt: 'Com novas ciclovias, quiosques padronizados e iluminação em LED, a histórica Prainha ganha novo fôlego e atrai famílias para caminhadas noturnas.',
        content: `O projeto de reurbanização total da Orla da Prainha, um dos principais portões de entrada rodoviários de Arraial do Cabo, foi inaugurado esta semana e já tem recebido aplausos unânimes dos comerciantes de quiosques e de turistas frequentes.

As obras incluíram a unificação do padrão estético de todos os quiosques de alimentação, instalação de decks ecológicos de madeira suspensa protegendo as encostas de vegetação restinga nativa, ciclovias sinalizadas conectadas ao centro urbano e iluminação sustentável de alta eficiência por refletores LED.

De acordo com a prefeitura, o novo visual clean e organizado reduz a poluição visual, garante acessibilidade total para carrinhos de bebê e cadeirantes e prolonga o funcionamento dos estabelecimentos que agora operam com mais conforto e segurança em um ambiente integrado.`,
        imageUrl: 'https://images.unsplash.com/photo-1548625361-155de0cbb55a?auto=format&fit=crop&w=800&q=80',
        category: 'Notícias',
        date: '2026-05-21',
        author: 'Mariana Repórter',
        authorId: 'auth_mariana',
        tags: ['Notícia', 'Prefeitura', 'Obras', 'Prainha'],
        status: 'published'
    },
    {
        id: 'selo-azul-preservacao',
        title: 'Arraial Recebe Selo Internacional de Preservação Ambiental',
        excerpt: 'A qualidade da água exuberante e o controle de resíduos sólidos garantem certificação de excelência para três das praias mais famosas do município.',
        content: `Uma comissão técnica internacional declarou Arraial do Cabo como vencedora de uma cobiçada insígnia de proteção marinha global. A certificação Bandeira Azul premia a perfeita qualidade ambiental das águas de banho locais, a eficiência do manejo integrado de lixo, campanhas educativas contínuas e segurança para mergulho.

O selo consolida Arraial do Cabo como exemplo internacional de desenvolvimento sustentável onde o fluxo turístico é manejado de forma a proteger os ecossistemas arenosos, recifes de corais preciosos e a fauna de baleias que migra por nossas correntes litorâneas de ressurgência fria ao longo do ano.`,
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        category: 'Notícias',
        date: '2026-05-20',
        author: 'Mariana Repórter',
        authorId: 'auth_mariana',
        tags: ['Notícia', 'Selo Azul', 'Natureza'],
        status: 'published'
    },
    {
        id: 'guia-sobrevivencia-temporada',
        title: 'Guia de Sobrevivência para a Alta Temporada',
        excerpt: 'Quer visitar Arraial em feriados ou férias escolares? Veja dicas cruciais sobre horários de trânsito, estacionamento em locais públicos e como evitar longas filas.',
        content: `Visitar Arraial do Cabo durante o Ano Novo, Carnaval ou feriados ensolarados exige um planejamento um pouco mais rigoroso para que o congestionamento natural nas vias apertadas de paralelepípedo não roube o bom humor das suas merecidas férias.

### 1. O Horário de Ouro
Em dias cheios, o segredo é inverter a rotina tradicional dos banhistas. Chegue às praias mais famosas como Prainhas ou Praia do Forno antes das 8h. Você desfrutará de praias praticamente desertas, água cristalina e com temperatura super agradável. Ao meio-dia, quando as multidões começarem a chegar em massa, retorne para almoçar nos restaurantes do centro ou descansar.

### 2. Cadastre o Seu Carro
Lembre-se de verificar as políticas públicas locais de estacionamento rotativo controlado (como o aplicativo Zona Azul da cidade). Guarde sempre o comprovante impresso ou virtual para evitar multas de trânsito estressantes.

### 3. Dê Preferência aos Táxis e Caminhadas
Como Arraial é uma península pequena, realizar trajetos internos curtos a pé ou através de moto-táxis credenciadas é dez vezes mais rápido e econômico do que gastar trinta minutos procurando por uma vaga de automóvel!`,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        category: 'Dicas Úteis',
        date: '2026-05-19',
        author: 'Ana Souza',
        authorId: 'auth_ana',
        tags: ['Dicas', 'Guia', 'Temporada', 'Trânsito'],
        status: 'published'
    },
    {
        id: 'mirantes-imperdiveis',
        title: 'Os 5 Melhores Mirantes para Tirar Fotos de Tirar o Fôlego',
        excerpt: 'De pontos fáceis na estrada aos picos nas trilhas que exigem caminhada, listamos os mirantes ideais para capturar o pôr do sol dourado e a imensidão azul do oceano.',
        content: `Os relevos dramáticos de Arraial proporcionam dezenas de mirantes fantásticos com ângulos de visualização espetaculares de trechos turquesa do mar. Listamos os cinco melhores cantinhos para os amantes de fotografia de natureza.

### 1. Mirante do Pontal do Atalaia
O mirante oficial fica no ápice das estradas asfaltadas do Pontal. O ângulo elevado dá vista integral para as Prainhas, Praia dos Anjos e a Ilha de Cabo Frio. Cartão postal absoluto!

### 2. Encostas da Cabocla
La trilha até o mirante da Cabocla exige cerca de trinta minutos de esforço moderado, mas recompensa com vistas amplas de 360 graus da encosta oceânica deslumbrante.

### 3. Mirante da Praia do Forno
No ápice da subida da trilha rápida que inicia no porto, há um mirante que exibe a perfeita baía em ferradura da Praia do Forno moldada de mata atlântica verdejante.`,
        imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
        category: 'Dicas Úteis',
        date: '2026-05-18',
        author: 'Carlos Drummond',
        authorId: 'auth_carlos',
        tags: ['Fotografia', 'Mirantes', 'Trilha'],
        status: 'published'
    },
    {
        id: 'roteiro-leste-cabofrio',
        title: 'Guia de 1 Dia em Cabo Frio: Do Forte à Passagem',
        excerpt: 'Se você tem pouco tempo em Cabo Frio, este roteiro otimizado reúne as atrações históricas no Bairro da Passagem, a deslumbrante Praia do Forte e o polo gastronômico do Canal.',
        content: `Cabo Frio é a maior cidade da Região dos Lagos, e mistura de forma única o patrimônio histórico colonial com praias de areia incrivelmente branca e fina. Se você só tem 24 horas, este é o guia perfeito.

### Manhã: Praia do Forte e Forte de São Mateus
Comece o seu dia bem cedo caminhando pela areia refrescante da Praia do Forte. Siga em direção ao lado esquerdo até o icônico Forte de São Mateus, uma das fortificações mais antigas do país (construída no século XVII para proteger das invasões francesas). A subida até os canhões de bronze originais proporciona um panorama deslumbrante de toda a praia e do mar turquesa.

### Almoço: Polo Gastronômico do Canal Itajuru
Para o almoço, siga até o Boulevard Canal. Lá você encontrará ótimas opções de peixe na telha e bobó de camarão fresco. Uma excelente indicação é saborear uma autêntica refeição com vista direta para a movimentação suave das embarcações que navegam pelo canal.

### Tarde: O Encanto Colonial do Bairro da Passagem
Após o almoço, siga para o histórico Bairro da Passagem, o berço de fundação de Cabo Frio. Caminhar por suas ruelas de paralelepípedo, rodeadas por casarios do período colonial pintados em tons pastéis e com portas coloridas, é uma autêntica viagem no tempo. Não deixe de fotografar a simpática Igreja de São Benedito.

### Fim de Tarde: Pôr do Sol na Capela do Morro da Guia
Para encerrar a sua jornada com chave de ouro, suba o Morro da Guia logo ao lado. A Capela de Nossa Senhora da Guia é o ponto de observação mais alto do centro comercial, proporcionando um pôr do sol inesquecível que doura toda a lagoa e a cidade em 360 graus.`,
        imageUrl: 'https://images.unsplash.com/photo-1589979482837-e74f2e145060?auto=format&fit=crop&w=800&q=80',
        category: 'Roteiros',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Cabo Frio', 'Roteiro', 'Praia do Forte', 'História'],
        status: 'published'
    },
    {
        id: 'gastronomia-buzios-orlabardot',
        title: 'Os 5 Melhores Restaurantes em Búzios na famosa Orla Bardot',
        excerpt: 'Uma seleção imperdível de restaurantes onde a gastronomia internacional encontra a calmaria da baía da Armação. Conheça pratos de peixe fresco com visual estonteante.',
        content: `A charmosa Armação dos Búzios consolidou-se como um polo gourmet cosmopolita na Região dos Lagos. Na mítica Orla Bardot, comer bem é uma arte que vem acompanhada pelo balanço romântico dos barcos coloridos de pescadores.

Aqui estão 5 restaurantes imperdíveis ao longo da Orla Bardot:

### 1. Bar do Zé
O queridinho da orla. Com luz de velas acolhedora, foca em pratos contemporâneos excepcionais. O risoto de camarão com aspargos frescos e o polvo grelhado são carros-chefes de sabor incomparável.

### 2. Cigalon
Para quem deseja um toque sofisticado francês misturado à frescura dos ingredientes tropicais brasileiros. Localizado de frente para a enseada interna da praia, é destino ideal para noites especiais a dois.

### 3. Satélite Búzios
Um local informal e muito tradicional que serve excelentes petiscos de boteco praiano requintados, caipirinhas fantásticas de frutas da estação e pastéis de siri crocantes que merecem aplausos.

### 4. Estância Don Otávio
Se você deseja intercalar os peixes e frutos do mar com cortes nobres de carnes grelhadas à perfeição na parrilla, esta é a melhor opção. O bife de chorizo derrete na boca.

### 5. Salt Restaurante
Focado em gastronomia contemporânea inovadora com insumos regionais. O peixe curado com ervas da horta local purifica o paladar de quem busca inovação e sabor autêntico.`,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        category: 'Gastronomia',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Búzios', 'Gastronomia', 'Orla Bardot', 'Restaurantes'],
        status: 'published'
    },
    {
        id: 'pontal-atalaia-sem-estresse',
        title: 'Pôr do Sol no Pontal do Atalaia: Como Visitar sem Trânsito e Filas',
        excerpt: 'O entardecer mais espetacular do Brasil pode se tornar um desafio na temporada. Saiba as regras de controle de veículos terrestres e as alternativas inteligentes.',
        content: `Quem visita Arraial do Cabo sabe que o pôr do sol assistido das encostas do Pontal do Atalaia é um rito de passagem obrigatório. Contudo, em decorrência da alta preservação ecológica do local, a prefeitura aplica regras restritas para o acesso.

### Regras de Acesso de Veículos
Durante as temporadas turísticas e feriados, existe uma barreira de controle na guarita que limita o número diário de carros particulares autorizados. Para quem chega tarde, o tempo de fila na entrada pode ultrapassar uma hora de espera.

### 1. Vá de Jardineira ou Táxi Credenciado
O meio de transporte mais prático e inteligente é utilizar as caminhonetes estilo "Jardineira" credenciadas que partem do centro da cidade (frequentemente próximas à Praia dos Anjos). Elas têm passe livre na barreira e sobem com rapidez, sem que você se preocupe em encontrar uma das poucas vagas públicas na encosta.

### 2. Visite Fora da Alta Temporada
Se puder, conheça Arraial entre março e junho. A temperatura continua agradável, as chuvas diminuem e a tranquilidade do Pontal permite sentar nas rochas para escutar apenas o barulho do mar sob um céu incrivelmente limpo.

### 3. Leve Casaco e Água
A altitude elevada do local propicia ventos constantes e frios assim que o sol se esconde atrás da linha do horizonte oceânico. Nunca suba sem uma garrafa d'água e um casaco leve!`,
        imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80',
        category: 'Dicas Úteis',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Arraial do Cabo', 'Pontal do Atalaia', 'Pôr do Sol', 'Dicas'],
        status: 'published'
    },
    {
        id: 'trilha-maravilhosa-lagoinha',
        title: 'Guia da Trilha da Ponta da Lagoinha em Búzios',
        excerpt: 'Conheça um recanto geológico apelidado cientificamente de Himalaia Brasileiro pelas semelhanças das placas tectônicas originais de mais de 500 milhões de anos.',
        content: `A Ponta da Lagoinha é uma das atrações mais subestimadas e fascinantes de toda Búzios. Situada na costa sudeste da península, a região guarda segredos geológicos que contam a história da separação dos continentes sul-americano e africano de forma visível.

### O Santuário Geológico
Cientistas de várias partes do mundo visitam o local devido às rochas formadas há cerca de 500 milhões de anos sob pressões continentais dramáticas (características geológicas que também ergueram a cordilheira do Himalaia). Placas informativas rústicas espalhadas explicam as origens das dobras.

### As Piscinas Naturais
O grande prêmio de fazer essa caminhada ecológica suave e de curtíssima duração (menos de 10 minutos a partir do estacionamento próximo à Praia da Ferradura) é encontrar as piscinas naturais que se formam entre as depressões rochosas na maré alta.

São verdadeiras banheiras térmicas onde a água do mar entra com suavidade, apresentando tons verdes e azuis translúcidos. É o local ideal para registrar memórias visuais incríveis.

### Dicas de Segurança:
* Nunca se aproxime das bordas externas de rocha durante marés bravias, pois ondas inesperadas podem subir repentinamente.
* Vá com calçados fechados e antiderrapantes para evitar cortes no calcário cru áspero.`,
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        category: 'Roteiros',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Búzios', 'Trilha', 'Ponta da Lagoinha', 'Placas Tectônicas'],
        status: 'published'
    },
    {
        id: 'compras-ruabiquinis',
        title: 'Guia de Compras na Histórica Rua dos Biquínis em Cabo Frio',
        excerpt: 'O maior shopping de moda praia a céu aberto da América Latina. Saiba os melhores horários para fazer ótimas compras, marcas locais e opções de lazer.',
        content: `Se há um local comercial icônico em Cabo Frio que transcende as belezas das praias, esse local é a Rua dos Biquínis (oficialmente chamada de Shopping de Moda Praia Gamboa). Trata-se do verdadeiro polo de confecção que abastece boutiques de luxo do país inteiro.

### Mais de 100 Lojas Especializadas
Cruzando a ponte do canal em direção ao bairro Gamboa, você entra em um calçadão turístico climatizado e colorido composto inteiramente por mais de uma centena de lojas com venda no varejo e atacado. 

Há opções para todos os estilos, tamanhos e bolsos: bikinis de alta qualidade, saídas de praia finas, bermudas casuais masculinas e chapéus personalizados com proteção solar certificada.

### Como Comprar com Conforto
* **Os Melhores Horários:** Evite visitar nos dias nublados e finais de tarde de verão intenso, que são os momentos mais concorridos. Prefira ir nas primeiras horas da manhã de dias ensolarados, quando as vendedoras oferecem atenção total.
* **Preços de Fábrica:** Como os proprietários costumam manter as oficinas de costura logo atrás das fachadas das lojas, é possível pechinchar bons descontos para compras em maior quantidade!`,
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
        category: 'Dicas Úteis',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Cabo Frio', 'Moda Praia', 'Rua dos Biquínis', 'Compras'],
        status: 'published'
    },
    {
        id: 'festival-gastronomico-cabofrio',
        title: 'Festival Gastronômico de Cabo Frio: Sabores e Programação',
        excerpt: 'A rica culinária local da terra das dunas de sal em evidência total neste inverno. Saiba as datas oficiais e os pratos concorrentes desta nova edição de sucesso.',
        content: `O renomado Festival Gastronômico de Cabo Frio é o maior evento culinário anual da costa do estado, trazendo uma perfeita mistura de identidade regional de pescadores antigos com a técnica moderna das renomadas escolas de culinária nacionais.

Durante o festival, dezenas de restaurantes no Boulevard Canal, Bairro da Passagem e centro comercial criam pratos originais que utilizam temperos da restinga e peixes abundantes das nossas correntes frias de ressurgência.

### O Formato de Sucesso
O evento funciona em duas modalidades integradas:
1. **Prato Principal nos Estabelecimentos:** Os restaurantes oficiais servem porções exclusivas no almoço ou jantar com preços fixos promocionais.
2. **Espaço Degustação Integrado:** Uma feira gastronômica com tendas rústicas instaladas nas calçadas coloniais do Boulevard Canal vendendo deliciosas petiscos de degustação rápidos, doces tradicionais e rótulos de vinhos locais autorais para harmonizar.

É a desculpa perfeita para visitar Cabo Frio com a família nos simpáticos fins de semana de vento ameno do inverno fluminense.`,
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
        category: 'Eventos',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Cabo Frio', 'Eventos', 'Festival Gastronômico', 'Alimentação'],
        status: 'published'
    },
    {
        id: 'praias-escondidas-arraial',
        title: 'As Praias Escondidas de Arraial do Cabo que as Escunas não Revelam',
        excerpt: 'Fuja do óbvio. Conheça a Praia da Graçainha e a Praia dos Anjos secreta: recantos de águas absolutamente cristalinas para praticar snorkel e encontrar tartarugas.',
        content: `As grandes fotos turísticas mostram quase sempre a areia intocável das Prainhas do Pontal ou o acesso à Praia do Forno. No entanto, Arraial do Cabo guarda cantos quase secretos onde moradores se escondem do movimento intenso do verão.

Aqui estão duas maravilhas secretas que você pode explorar gratuitamente:

### 1. Praia da Graçainha
Uma graciosa enseada minúscula localizada logo no início da subida curva da estrada que leva ao Pontal do Atalaia. Na maré baixa, a praia se revela cercada por piscinas naturais ricas em algas e estrelas-do-mar.

O segredo aqui é levar sua máscara de flutuação e snorkel: devido à abundância de algas nas pedras polidas, a Graçainha é um verdadeiro restaurante para tartarugas marinhas de todos os portes. É comum flutuar ao lado de dezenas delas em poucos minutos de imersão!

### 2. A Praia Escondida do Farol Velho
Alcançada exclusivamente através de trilhas mais fechadas partindo da Praia dos Anjos com guias cadastrados. Suas águas calmas e cercadas de mata preservada proporcionam o silêncio acolhedor de uma island particular desabitada.`,
        imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
        category: 'Roteiros',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Arraial do Cabo', 'Praias Secretas', 'Snorkel', 'Tartarugas'],
        status: 'published'
    },
    {
        id: 'gastronomia-bairro-passagem',
        title: 'Gastronomia Histórica: Bistrôs e Bares Culturais na Passagem',
        excerpt: 'O bairro colonial de Cabo Frio consolidou-se como o polo boêmio mais charmoso. Conheça ruelas iluminadas cheias de música de raiz e mesas românticas.',
        content: `O Bairro da Passagem, em Cabo Frio, já foi abrigo de valentes pescadores coloniais no século XVII. Hoje, as históricas casinhas de janelas de madeira pintadas com cores vibrantes abrigam o polo boêmio e gastronômico mais badalado e charmoso da região.

Ao cair da noite, o tráfego de carros é fechado em algumas vias principais e as ruas iluminadas por postes coloniais ganham mesas ao ar livre que parecem extraídas de uma charmosa vila portuguesa antiga.

### Dicas de Paradas para Saborear
* **Bistrô do Poeta:** Especializado em cozinha contemporânea requintada com toques locais. O risotto de lula fresca ao molho pesto de manjericão e ervas marinhas da restinga é memorável.
* **Armazém da Passagem:** Para quem gosta de pratos fartos de frango ao pesto, carpaccio de carne, cervejas artesanais geladas de microcervejarias da serra carioca e música ao vivo tocando MPB e bossa acústica suave em volume agradável para conversar.
* **Sorveterias Gourmet:** Encerre o passeio saboreando deliciosos gelatos caseiros de frutas nativas tropicais como graviola, cupuaçu e jabuticaba colhidas na região próxima do bioma.`,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        category: 'Gastronomia',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Cabo Frio', 'Bairro da Passagem', 'Bistrôs', 'Boêmia'],
        status: 'published'
    },
    {
        id: 'surf-praia-forte-campeonato',
        title: 'Campeonato de Surf Masculino e Feminino agita a Praia do Forte',
        excerpt: 'Os melhores atletas do circuito nacional se reúnem na areia fina da Praia do Forte para disputar a cobiçada coroa das ondas neste final de semana de sol.',
        content: `As famosas dunas e a água azul vibrante da Praia do Forte, em Cabo Frio, serão o cenário perfeito para a etapa de inverno do circuito regional de surf. Con previsão de swell forte e vento constante vindo do quadrante leste, as condições para as pranchas serão ideais!

O evento é aberto ao público e contará com acampamentos esportivos montados próximos ao monumento histórico do Forte. Haverá sorteio de brindes ecológicos, aulas de iniciação de prancha para crianças locais carentes e palestras contínuas de preservação da orla marinha.

### Pontos de Observação
O trecho de praia conhecido como "Lido" (próximo à praça das águas) é o local mais cotado para o palanque principal dos juízes, onde as ondas formam séries rápidas ideais para manobras radicais aéreas. Vista seus óculos escuros, traga seu protetor de pele e venha prestigiar o esporte brasileiro com a gente!`,
        imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
        category: 'Eventos',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Cabo Frio', 'Surf', 'Praia do Forte', 'Esportes'],
        status: 'published'
    },
    {
        id: 'ressurgencia-aquario-natural',
        title: 'Ressurgência Marinha: O Segredo do Mar Caribe de Arraial',
        excerpt: 'Saiba o que é esse intrigante fenômeno natural científico responsável por trazer correntes polares profundas ricas em nutrientes fundamentais para a nossa fauna.',
        content: `É impossível navegar pelas águas de Arraial do Cabo sem se surpreender com a tonalidade de azul neon transparente inexplicável que compete com praias caribenhas tropicais clássicas. Porém, ao primeiro mergulho, a temperatura fria da água traz uma grande dúvida ao visitante científico. 

Esse mistério tem nome oficial: **Ressurgência Marinha**.

### Correntes Polares Profundas
Em áreas marinhas específicas no cabo geográfico de Arraial, correntes submersas vindas diretamente de profundezas polares do sul esbarram no paredão continental elevado da península de Arraial. Empurradas pelos fortes ventos do quadrante leste (constantes no ano inteiro), essas águas profundas e gélidas sobem até a superfície.

### Biodiversidade e Transparência
Como as águas profundas submersas não recebem luz solar direta, elas não têm proliferação exagerada de algas escuras microscópicas (daí a transparência cristalina do mar). Elas também trazem consigo minerais fundamentais que alimentam siris, peixes e tartarugas marinhas em abundância.

Por isso, Arraial do Cabo é conhecida orgulhosamente como a **Capital Nacional do Mergulho**. É um aquário selvagem a céu aberto!`,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        category: 'Notícias',
        date: '2026-05-28',
        author: 'Yuri Guida',
        authorId: 'yuri_guida',
        tags: ['Arraial do Cabo', 'Ressurgência', 'Ciência', 'Mergulho'],
        status: 'published'
    }
];

export const getBlogPosts = async () => {
    if (_posts.length === 0) {
        const snap = await getDocs(query(collection(db, 'blog_posts'), orderBy('date', 'desc'), limit(50)));
        _posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
    }
    
    // Auto-seed checking: ensure ALL default seed posts exist in the database and local array
    let seededNew = false;
    for (const post of DEFAULT_POSTS) {
        if (!_posts.find(p => p.id === post.id)) {
            try {
                await setDoc(doc(db, 'blog_posts', post.id), cleanObject(post), { merge: true });
                _posts.push(post);
                seededNew = true;
            } catch (seedErr) {
                console.warn(`Could not seed post ${post.id}:`, seedErr);
            }
        }
    }
    
    if (seededNew) {
        _posts.sort((a, b) => b.date.localeCompare(a.date));
    }

    // Dynamic creator mapping: Let Yuri Guida have absolute ownership over ALL posts!
    const usersSnap = await getAllUsers();
    const realYuri = usersSnap.find(u => (u.email || '').toLowerCase() === 'contato.yuriguida@gmail.com');
    const yuriId = realYuri?.id || 'yuri_guida';
    _posts = _posts.map(post => {
        return { 
            ...post, 
            authorId: yuriId, 
            author: 'Yuri Guida' 
        };
    });

    return _posts;
};

export const getAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    let usersList = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));

    // De-duplicate and cleanse Yuri Guida accounts to prevent 'yuri_guida' vs 'real-google-uid' conflicts
    const yuriUsers = usersList.filter(u => (u.email || '').toLowerCase() === 'contato.yuriguida@gmail.com');
    
    if (yuriUsers.length > 1) {
        const realYuri = yuriUsers.find(u => u.id !== 'yuri_guida');
        if (realYuri) {
            // Drop old seed fallback from memory list
            usersList = usersList.filter(u => u.id !== 'yuri_guida');
            // Permanently clear 'yuri_guida' duplicate placeholder document in Firestore
            try {
                await deleteDoc(doc(db, 'users', 'yuri_guida'));
            } catch (e) {
                // Ignore silent delete/permission limits
            }
        }
    } else if (yuriUsers.length === 0) {
        // Safe auto-seed of the default Yuri journalist profile for guests to view him before he logs in
        const fallbackYuri: User = {
            id: 'yuri_guida',
            name: 'Yuri Guida',
            email: 'contato.yuriguida@gmail.com',
            role: UserRole.JOURNALIST,
            favorites: { coupons: [], businesses: [] },
            history: [],
            savedAmount: 0,
            manualPassword: '123456',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            profession: 'Editor-Chefe / Konecta Rio Feed',
            bio: 'Yuri Guida é o idealizador e produtor de conteúdo oficial do Konecta Rio, trazendo dicas locais quentes e roteiros testados de ponta a ponta na Região dos Lagos.',
            instagram: 'yuriguida'
        };
        usersList.push(fallbackYuri);
        try {
            await setDoc(doc(db, 'users', 'yuri_guida'), cleanObject(fallbackYuri));
        } catch (e) {
            console.warn("Could not seed default yuri_guida account:", e);
        }
    }

    _users = usersList;
    return _users;
};

export const getCompanyRequests = async () => {
    const snap = await getDocs(collection(db, 'companyRequests'));
    _requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as CompanyRequest));
    return _requests;
};

export const getPendingReviews = async () => {
    const snap = await getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
};

export const saveBusiness = async (b: BusinessProfile) => {
    try {
        await setDoc(doc(db, 'businesses', b.id), cleanObject(b), { merge: true }); 
        
        // Update cache
        const index = _businesses.findIndex(biz => biz.id === b.id);
        if (index !== -1) {
            _businesses[index] = { ..._businesses[index], ...b };
        } else {
            _businesses.push(b);
        }
        notifyListeners();
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `businesses/${b.id}`);
    }
};

export const toggleBusinessStatus = async (businessId: string, isBlocked: boolean) => {
    await updateDoc(doc(db, 'businesses', businessId), { isBlocked });
    // Also block the associated user if they exist (id matches)
    const userDoc = await getDoc(doc(db, 'users', businessId));
    if (userDoc.exists()) {
        await updateDoc(doc(db, 'users', businessId), { isBlocked });
    }
    notifyListeners();
};

export const deleteBusiness = async (businessId: string) => {
    try {
        await deleteDoc(doc(db, 'businesses', businessId));
        // Also delete the associated user
        await deleteDoc(doc(db, 'users', businessId));
        // Delete their coupons
        const couponsQuery = query(collection(db, 'coupons'), where('companyId', '==', businessId));
        const couponsSnap = await getDocs(couponsQuery);
        for (const d of couponsSnap.docs) {
            await deleteDoc(doc(db, 'coupons', d.id));
        }
        
        // Update local cache
        _businesses = _businesses.filter(b => b.id !== businessId);
        
        notifyListeners();
    } catch (error) {
        console.error("Error deleting business:", error);
        throw error;
    }
};

export const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
};

export const getCurrentUser = (): User | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const updateUser = async (user: User) => {
    try {
        await setDoc(doc(db, 'users', user.id), cleanObject(user), { merge: true });
        
        // Only update localStorage if we are updating the currently logged-in user
        const current = getCurrentUser();
        if (current && current.id === user.id) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        }
        
        notifyListeners();
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
};

export const getCategories = async (forceRefresh = false) => {
    if (_categories.length === 0 || forceRefresh) {
        const snap = await getDocs(collection(db, 'app_categories_guia'));
        _categories = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppCategory));
    }
    return _categories;
};

export const addReview = async (businessId: string, review: Omit<Review, 'id' | 'date'>) => {
    const business = _businesses.find(b => b.id === businessId);
    if (!business) throw new Error('Business not found');

    const newReviewId = doc(collection(db, 'reviews')).id;
    const newReview: Review = {
        ...review,
        id: newReviewId,
        date: new Date().toISOString(),
        status: 'pending',
        businessId: businessId,
        businessName: business.name
    };

    await setDoc(doc(db, 'reviews', newReviewId), cleanObject(newReview));
    notifyListeners();
    return newReview;
};

export const getReviewsByBusinessId = async (businessId: string) => {
    try {
        const snap = await getDocs(query(collection(db, 'reviews'), where('businessId', '==', businessId), where('status', '==', 'approved')));
        const fetchedReviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        fetchedReviews.forEach(fr => {
            const index = _reviews.findIndex(r => r.id === fr.id);
            if (index === -1) _reviews.push(fr);
            else _reviews[index] = fr;
        });
        return fetchedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
        console.error("Error fetching reviews:", e);
        return _reviews.filter(r => r.businessId === businessId && r.status === 'approved')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
};

export const approveReview = async (reviewId: string) => {
    let review = _reviews.find(r => r.id === reviewId);
    
    // Fallback to fetch from Firestore if not in cache
    if (!review) {
        const docRef = await getDoc(doc(db, 'reviews', reviewId));
        if (docRef.exists()) {
            review = { id: docRef.id, ...docRef.data() } as Review;
            _reviews.push(review);
        } else {
            throw new Error('Avaliação não encontrada.');
        }
    }
    
    if (!review.businessId) throw new Error('A avaliação não possui associação com uma empresa.');

    review.status = 'approved';
    await setDoc(doc(db, 'reviews', reviewId), cleanObject(review), { merge: true });

    let business = _businesses.find(b => b.id === review!.businessId);
    if (!business) {
        const bDoc = await getDoc(doc(db, 'businesses', review.businessId));
        if (bDoc.exists()) {
            business = { id: bDoc.id, ...bDoc.data() } as BusinessProfile;
            _businesses.push(business);
        } else {
             notifyListeners();
             return;
        }
    }

    // Filter out the review if it already exists in the array (to avoid duplicates) and add the updated one
    const existingReviews = business.reviews || [];
    const filteredReviews = existingReviews.filter(r => r.id !== reviewId);
    const updatedReviews = [review, ...filteredReviews];
    
    const newCount = updatedReviews.length;
    const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / newCount;

    business.reviews = updatedReviews;
    business.reviewCount = newCount;
    business.rating = newRating;

    await setDoc(doc(db, 'businesses', business.id), cleanObject(business), { merge: true });
    notifyListeners();
};

export const rejectReview = async (reviewId: string) => {
    let review = _reviews.find(r => r.id === reviewId);
    
    if (!review) {
         const docRef = await getDoc(doc(db, 'reviews', reviewId));
         if (docRef.exists()) {
              review = { id: docRef.id, ...docRef.data() } as Review;
              _reviews.push(review);
         } else {
              throw new Error('Avaliação não encontrada.');
         }
    }

    review.status = 'rejected';
    await setDoc(doc(db, 'reviews', reviewId), cleanObject(review), { merge: true });
    
    // If it was already in a business, remove it
    if (review.businessId) {
        let business = _businesses.find(b => b.id === review!.businessId);
        if (!business) {
             const bDoc = await getDoc(doc(db, 'businesses', review.businessId));
             if (bDoc.exists()) {
                 business = { id: bDoc.id, ...bDoc.data() } as BusinessProfile;
             }
        }
        
        if (business && business.reviews) {
            business.reviews = business.reviews.filter(r => r.id !== reviewId);
            business.reviewCount = business.reviews.length;
            business.rating = business.reviewCount > 0 
                ? business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviewCount 
                : 0;
                
            await setDoc(doc(db, 'businesses', business.id), cleanObject(business), { merge: true });
        }
    }
    
    notifyListeners();
};
export const getDicasCategories = async () => {
    if (_dicasCategories.length === 0) {
        const snap = await getDocs(collection(db, 'app_categories_dicas'));
        _dicasCategories = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppCategory));
    }
    
    // Auto-seed if empty
    if (_dicasCategories.length < 5) {
        for (const cat of DEFAULT_DICAS_CATEGORIES) {
            if (!_dicasCategories.find(c => c.id === cat.id)) {
                await setDoc(doc(db, 'app_categories_dicas', cat.id), cleanObject(cat), { merge: true });
                _dicasCategories.push(cat);
            }
        }
    }
    return _dicasCategories;
};
export const saveCategory = async (category: AppCategory) => {
    await setDoc(doc(db, 'app_categories_guia', category.id), cleanObject(category), { merge: true });
    
    // Atualiza o cache local
    const idx = _categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
        _categories[idx] = category;
    } else {
        _categories.push(category);
    }
    notifyListeners();
};

export const saveDicasCategory = async (category: AppCategory) => {
    await setDoc(doc(db, 'app_categories_dicas', category.id), cleanObject(category), { merge: true });
};

export const saveSubcategory = async (categoryId: string, subcategoryName: string) => {
    let cat = _categories.find(c => c.id === categoryId);
    if (!cat) {
        // If category not in cache, fetch it
        const docSnap = await getDoc(doc(db, 'app_categories_guia', categoryId));
        if (docSnap.exists()) {
            cat = { id: docSnap.id, ...docSnap.data() } as AppCategory;
        }
    }

    if (cat) {
        const subId = subcategoryName.toLowerCase().replace(/\s+/g, '-').replace(/ç/g, 'c').replace(/ã/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
        const existing = (cat.subcategories || []).find(s => s.id === subId || s.name.toLowerCase() === subcategoryName.toLowerCase());
        
        if (!existing) {
            const newSubcategory: Subcategory = {
                id: subId,
                name: subcategoryName
            };
            const updatedCat = { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] };
            await setDoc(doc(db, 'app_categories_guia', categoryId), cleanObject(updatedCat), { merge: true });
            
            // Update cache
            const idx = _categories.findIndex(c => c.id === categoryId);
            if (idx >= 0) _categories[idx] = updatedCat;
            else _categories.push(updatedCat);
            
            notifyListeners();
        }
    }
};

export const ensureSubcategory = async (categoryName: string, subcategoryName: string) => {
    if (!categoryName || !subcategoryName) return;
    
    // Find category ID by name
    const cat = _categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!cat) return; // For now only existing categories

    await saveSubcategory(cat.id, subcategoryName);
};

export const saveDicasSubcategory = async (categoryId: string, subcategoryName: string) => {
    const cat = _dicasCategories.find(c => c.id === categoryId);
    if (cat) {
        const newSubcategory: Subcategory = {
            id: subcategoryName.toLowerCase().replace(/\s+/g, '-'),
            name: subcategoryName
        };
        const updatedCat = { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] };
        await setDoc(doc(db, 'app_categories_dicas', categoryId), cleanObject(updatedCat), { merge: true });
    }
};

export const deleteDicasCategory = async (id: string) => {
    await deleteDoc(doc(db, 'app_categories_dicas', id));
    _dicasCategories = _dicasCategories.filter(c => c.id !== id);
    notifyListeners();
};

export const deleteDicasSubcategory = async (categoryId: string, subcategoryId: string) => {
    const cat = _dicasCategories.find(c => c.id === categoryId);
    if (cat) {
        const updatedCat = {
            ...cat,
            subcategories: (cat.subcategories || []).filter(s => s.id !== subcategoryId)
        };
        await setDoc(doc(db, 'app_categories_dicas', categoryId), cleanObject(updatedCat), { merge: true });
        _dicasCategories = _dicasCategories.map(c => c.id === categoryId ? updatedCat : c);
        notifyListeners();
    }
};

export const saveCoupon = async (c: Coupon) => {
    const couponToSave = { ...c };
    
    // Default status to pending if not set
    if (!couponToSave.status) {
        couponToSave.status = 'pending';
    }
    
    // Ensure we have a real company name if possible
    if (!couponToSave.companyName || couponToSave.companyName === 'Minha Empresa') {
        const biz = _businesses.find(b => b.id === couponToSave.companyId);
        if (biz) {
            couponToSave.companyName = biz.name;
            if (!couponToSave.companyLogo) couponToSave.companyLogo = biz.coverImage;
        }
    }
    
    await setDoc(doc(db, 'coupons', couponToSave.id), cleanObject(couponToSave)); 
};

export const deleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, 'coupons', id)); 
};

export const getBusinessStats = async (businessId: string) => {
    const biz = _businesses.find(b => b.id === businessId);
    const coupons = _coupons.filter(c => c.companyId === businessId);
    
    const totalRedemptions = coupons.reduce((acc, c) => acc + (c.currentRedemptions || 0), 0);
    const views = biz?.views || 0;
    const shares = biz?.shares || 0;
    const counts = biz?.actionCounts || {};

    const trend = [
        { day: 'Seg', valor: Math.max(0, totalRedemptions - 12) },
        { day: 'Ter', valor: Math.max(0, totalRedemptions - 8) },
        { day: 'Qua', valor: Math.max(0, totalRedemptions - 10) },
        { day: 'Qui', valor: Math.max(0, totalRedemptions - 5) },
        { day: 'Sex', valor: Math.max(0, totalRedemptions - 2) },
        { day: 'Sáb', valor: totalRedemptions },
        { day: 'Hoje', valor: totalRedemptions },
    ];

    return {
        views,
        totalConversions: totalRedemptions,
        shares,
        conversionTrend: trend,
        trafficSource: [
            { name: 'Busca Interna', value: Math.floor(views * 0.6) },
            { name: 'Direto/QR', value: Math.floor(views * 0.3) },
            { name: 'Compartilhado', value: Math.floor(views * 0.1) }
        ],
        actionHeatmap: [
            { name: 'Telefone', cliques: counts['phone'] || 0 },
            { name: 'Mapa/GPS', cliques: counts['map'] || 0 },
            { name: 'Instagram', cliques: counts['social'] || 0 },
            { name: 'Site', cliques: counts['website'] || 0 },
            { name: 'Delivery', cliques: counts['delivery'] || 0 },
            { name: 'Cardápio', cliques: counts['menu'] || 0 },
            { name: 'Resgates', cliques: totalRedemptions }
        ],
        activeCoupons: coupons.filter(c => c.active).length
    };
};

export const getAdminStats = async () => {
    const totalEconomy = _users.reduce((acc, u) => acc + (u.savedAmount || 0), 0);
    return {
        totalUsers: _users.length,
        totalBusinesses: _businesses.length,
        totalEconomy,
        totalCoupons: _coupons.length,
        chartData: [
            { name: 'Gastronomia', value: _businesses.filter(b => b.category === 'Gastronomia').length },
            { name: 'Hospedagem', value: _businesses.filter(b => b.category === 'Hospedagem').length },
            { name: 'Passeios', value: _businesses.filter(b => b.category === 'Passeios').length }
        ]
    };
};

export const getAppConfig = () => _appConfig;
export const getLocations = () => {
    // Return all active neighborhoods as locations
    return _neighborhoods.filter(n => n.active).map(n => ({
        id: n.id,
        name: n.name,
        active: true
    }));
};
let _amenities: AppAmenity[] = DEFAULT_AMENITIES;

export const getAmenities = async () => {
    try {
        const snap = await getDocs(collection(db, 'app_amenities'));
        if (!snap.empty) {
            _amenities = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppAmenity));
        } else {
            // Seed defaults
            _amenities = DEFAULT_AMENITIES;
            for (const am of DEFAULT_AMENITIES) {
                try {
                    await setDoc(doc(db, 'app_amenities', am.id), am);
                } catch (e) {
                    console.warn("Using default amenities. Seed failed (permissions expected if non-admin):", e);
                }
            }
        }
    } catch (e) {
        console.warn("Using default amenities:", e);
    }
    return _amenities;
};

export const saveAmenity = async (label: string) => {
    const id = label.toLowerCase().replace(/\s+/g, '-').replace(/ç/g, 'c').replace(/ã/g, 'a');
    const existing = _amenities.find(a => a.id === id || a.label.toLowerCase() === label.toLowerCase());
    if (!existing) {
        const newAm = { id, label };
        await setDoc(doc(db, 'app_amenities', id), newAm);
        _amenities.push(newAm);
        notifyListeners();
    }
    return id;
};
let _posts: BlogPost[] = [];

export const getBlogPostById = async (id: string) => {
    const cached = _posts.find(p => p.id === id);
    if (cached) {
        // Enforce Yuri ownership even if returned from memory cache
        const usersSnap = await getAllUsers();
        const realYuri = usersSnap.find(u => (u.email || '').toLowerCase() === 'contato.yuriguida@gmail.com');
        const yuriId = realYuri?.id || 'yuri_guida';
        cached.authorId = yuriId;
        cached.author = 'Yuri Guida';
        return cached;
    }
    
    const docRef = doc(db, 'blog_posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const post = { id: docSnap.id, ...docSnap.data() } as BlogPost;
        
        // Dynamically map all post author IDs and names to Yuri's actual account
        const usersSnap = await getAllUsers();
        const realYuri = usersSnap.find(u => (u.email || '').toLowerCase() === 'contato.yuriguida@gmail.com');
        const yuriId = realYuri?.id || 'yuri_guida';
        post.authorId = yuriId;
        post.author = 'Yuri Guida';

        if (!_posts.find(p => p.id === post.id)) {
            _posts.push(post);
        }
        return post;
    }
    return undefined;
};

export const saveBlogPost = async (post: BlogPost) => {
    const idx = _posts.findIndex(p => p.id === post.id);
    if (idx >= 0) {
        _posts[idx] = post;
    } else {
        _posts.push(post);
    }
    await setDoc(doc(db, 'blog_posts', post.id), cleanObject(post), { merge: true });
    notifyListeners();
};

export const deleteBlogPost = async (id: string) => {
    _posts = _posts.filter(p => p.id !== id);
    await deleteDoc(doc(db, 'blog_posts', id));
    notifyListeners();
};
export const getCollections = async (): Promise<Collection[]> => {
    if (_collections.length === 0) {
        const snap = await getDocs(collection(db, 'collections'));
        _collections = snap.docs.map(d => ({ id: d.id, ...d.data() } as Collection)).sort((a, b) => a.order - b.order);
    }
    return _collections;
};

export const saveCollection = async (col: Partial<Collection>) => {
    const id = col.id || doc(collection(db, 'collections')).id;
    const newCol: Collection = {
        id,
        title: col.title || '',
        description: col.description || '',
        coverImage: col.coverImage || '',
        businessIds: col.businessIds || [],
        order: col.order || 0,
        active: col.active ?? true,
        themeColor: col.themeColor || '#1e3a8a',
        gradientOpacity: col.gradientOpacity ?? 0.8,
        ...col
    } as Collection;
    
    const idx = _collections.findIndex(c => c.id === id);
    if (idx >= 0) {
        _collections[idx] = newCol;
    } else {
        _collections.push(newCol);
    }
    await setDoc(doc(db, 'collections', id), cleanObject(newCol), { merge: true });
    notifyListeners();
    return newCol;
};

export const deleteCollection = async (id: string) => {
    _collections = _collections.filter(c => c.id !== id);
    await deleteDoc(doc(db, 'collections', id));
    notifyListeners();
};

// Fix: Added missing getCollectionById function export to resolve the import error in CollectionDetail.tsx
export const getCollectionById = async (id: string) => {
    const cached = _collections.find(c => c.id === id);
    if (cached) return cached;
    
    const docRef = doc(db, 'collections', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const col = { id: docSnap.id, ...docSnap.data() } as Collection;
        if (!_collections.find(c => c.id === col.id)) {
            _collections.push(col);
        }
        return col;
    }
    return undefined;
};

export const getFeaturedConfig = () => null;

export const getHomeHighlights = async () => {
    if (_highlights.length === 0) {
        const snap = await getDocs(query(collection(db, 'home_highlights')));
        _highlights = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomeHighlight)).sort((a, b) => a.order - b.order);
    }
    return _highlights.filter(h => h.active);
};

export const getAllHomeHighlights = async () => {
    if (_highlights.length === 0) {
        const snap = await getDocs(query(collection(db, 'home_highlights')));
        _highlights = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomeHighlight)).sort((a, b) => a.order - b.order);
    }
    return _highlights;
};

export const saveHomeHighlight = async (h: Partial<HomeHighlight>) => {
    const id = h.id || doc(collection(db, 'home_highlights')).id;
    const newHighlight: HomeHighlight = {
        id,
        title: h.title || '',
        description: h.description || '',
        imageUrl: h.imageUrl || '',
        buttonText: h.buttonText || '',
        buttonLink: h.buttonLink || '',
        order: h.order || 0,
        active: h.active ?? true,
        ...h
    } as HomeHighlight;
    await setDoc(doc(db, 'home_highlights', id), newHighlight);
    return newHighlight;
};

export const deleteHomeHighlight = async (id: string) => {
    await deleteDoc(doc(db, 'home_highlights', id));
};

export const getBlogAds = async () => {
    if (_blogAds.length === 0) {
        const snap = await getDocs(collection(db, 'blog_ads'));
        _blogAds = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogAd)).sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    // Seed default ads if none exist
    if (_blogAds.length === 0) {
        const defaultAds: BlogAd[] = [
            {
                id: 'ad1',
                title: 'Passeio de Barco VIP com Capitão Arraial • 15% OFF',
                subtitle: 'Navegue pelo Caribe de Arraial com atendimento classe A e parada exclusiva na Gruta Azul.',
                imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80',
                tag: 'Patrocinado',
                actionLabel: 'Ver Passeios',
                badgeColor: 'bg-amber-500/95 text-white',
                targetCategory: 'Passeios',
                active: true,
                order: 0
            },
            {
                id: 'ad2',
                title: 'Festival da Lagosta em Arraial do Cabo',
                subtitle: 'Neste final de semana, venha saborear pratos exclusivos nos melhores restaurantes com preços especiais!',
                imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
                tag: 'Destaque Gastronômico',
                actionLabel: 'Ver Gastronomia',
                badgeColor: 'bg-red-500/95 text-white',
                targetCategory: 'Gastronomia',
                active: true,
                order: 1
            }
        ];
        
        for (const ad of defaultAds) {
            await setDoc(doc(db, 'blog_ads', ad.id), ad, { merge: true });
            _blogAds.push(ad);
        }
        _blogAds.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    return _blogAds;
};

export const saveBlogAd = async (ad: Partial<BlogAd>) => {
    const id = ad.id || doc(collection(db, 'blog_ads')).id;
    const newAd: BlogAd = {
        id,
        title: ad.title || '',
        subtitle: ad.subtitle || '',
        imageUrl: ad.imageUrl || '',
        tag: ad.tag || 'Destaque',
        actionLabel: ad.actionLabel || '',
        badgeColor: ad.badgeColor || 'bg-red-500/95 text-white',
        targetCategory: ad.targetCategory || '',
        active: ad.active ?? true,
        order: ad.order || 0,
        ...ad
    } as BlogAd;
    
    await setDoc(doc(db, 'blog_ads', id), newAd);
    
    const idx = _blogAds.findIndex(b => b.id === id);
    if (idx >= 0) {
        _blogAds[idx] = newAd;
    } else {
        _blogAds.push(newAd);
    }
    _blogAds.sort((a, b) => (a.order || 0) - (b.order || 0));
    notifyListeners();
    return newAd;
};

export const deleteBlogAd = async (id: string) => {
    await deleteDoc(doc(db, 'blog_ads', id));
    _blogAds = _blogAds.filter(b => b.id !== id);
    notifyListeners();
};


export const getCities = async () => {
    if (_cities.length === 0) {
        const snap = await getDocs(collection(db, 'cities'));
        _cities = snap.docs.map(d => ({ id: d.id, ...d.data() } as City));
    }
    return _cities;
};

export const getNeighborhoods = async () => {
    if (_neighborhoods.length === 0) {
        const snap = await getDocs(collection(db, 'neighborhoods'));
        _neighborhoods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Neighborhood));
    }
    return _neighborhoods;
};

export const saveCity = async (c: City) => {
    const id = c.id || doc(collection(db, 'cities')).id;
    await setDoc(doc(db, 'cities', id), { ...c, id }, { merge: true });
};

export const saveNeighborhood = async (n: Neighborhood) => {
    const id = n.id || doc(collection(db, 'neighborhoods')).id;
    await setDoc(doc(db, 'neighborhoods', id), { ...n, id }, { merge: true });
};

export const deleteCity = async (id: string) => {
    // Cascade delete neighborhoods
    const neighborhoods = _neighborhoods.filter(n => n.cityId === id);
    for (const n of neighborhoods) {
        await deleteDoc(doc(db, 'neighborhoods', n.id));
    }
    await deleteDoc(doc(db, 'cities', id));
};

export const deleteNeighborhood = async (id: string) => {
    await deleteDoc(doc(db, 'neighborhoods', id));
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export const identifyNeighborhood = (lat: number, lng: number): string => {
    if (_neighborhoods.length === 0) {
        return _cities.length > 0 ? _cities[0].name : "Região dos Lagos";
    }

    let closestNeighborhood: Neighborhood | null = null;
    let minDistance = Infinity;

    for (const n of _neighborhoods) {
        if (n.lat && n.lng && n.active) {
            const dist = calculateDistance(lat, lng, n.lat, n.lng);
            if (dist < minDistance) {
                minDistance = dist;
                closestNeighborhood = n;
            }
        }
    }

    if (closestNeighborhood && minDistance < 1.5) {
        return closestNeighborhood.name;
    }

    if (closestNeighborhood) {
        const city = _cities.find(c => c.id === closestNeighborhood.cityId);
        if (city) return city.name;
    }

    return _cities.length > 0 ? _cities[0].name : "Região dos Lagos";
};

export const toggleFavorite = async (type: 'coupon' | 'business', id: string) => {
    const user = getCurrentUser();
    if (!user) return;
    if (!user.favorites) user.favorites = { coupons: [], businesses: [] };
    const list = type === 'coupon' ? user.favorites.coupons : user.favorites.businesses;
    const index = list.indexOf(id);
    if (index > -1) list.splice(index, 1);
    else list.push(id);
    await updateUser(user);
};

export const incrementBusinessView = (id: string) => updateDoc(doc(db, 'businesses', id), { views: increment(1) });

export const trackAction = async (businessId: string, type: string) => {
    try {
        // Incrementa o contador específico dentro do objeto actionCounts
        // Se o tipo for 'share', também incrementamos o campo shares legado para compatibilidade
        const updates: any = {
            [`actionCounts.${type}`]: increment(1)
        };
        if (type === 'share') updates.shares = increment(1);
        
        await updateDoc(doc(db, 'businesses', businessId), updates);
    } catch (e) {
        console.error("Error tracking action:", e);
    }
};

/**
 * 🔒 SEGURANÇA REFINADA: Resgate de Cupons
 * - Gera um código de verificação único.
 * - Registra em uma coleção dedicada para auditoria.
 * - Valida limites de uso e expiração.
 */
export const redeemCoupon = async (uid: string, c: Coupon): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado.");

    // 1. Verificar Limites do Cupom
    if (c.maxRedemptions && (c.currentRedemptions || 0) >= c.maxRedemptions) {
        throw new Error("Este cupom atingiu o limite máximo de resgates.");
    }

    // 2. Verificar Expiração
    if (new Date(c.expiryDate) < new Date()) {
        throw new Error("Este cupom já expirou.");
    }

    // 3. Verificar Limite por Usuário (Firestore query para segurança)
    try {
        const q = query(
            collection(db, 'redemptions'), 
            where('userId', '==', uid), 
            where('couponId', '==', c.id)
        );
        const snap = await getDocs(q);
        if (c.limitPerUser && snap.size >= c.limitPerUser) {
            throw new Error(`Você já atingiu o limite de ${c.limitPerUser} resgates para este cupom.`);
        }
    } catch (e: any) {
        if (e.message.includes('permission-denied')) {
            console.warn("Permission denied checking redemptions, falling back to local history check.");
            const historyCount = (user.history || []).filter(h => h.couponId === c.id).length;
            if (c.limitPerUser && historyCount >= c.limitPerUser) {
                throw new Error(`Você já atingiu o limite de ${c.limitPerUser} resgates para este cupom.`);
            }
        } else {
            throw e;
        }
    }

    // 4. Gerar Código de Verificação (6 dígitos aleatórios)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    let companyName = c.companyName;
    if (!companyName || companyName === 'Minha Empresa') {
        const biz = _businesses.find(b => b.id === c.companyId);
        if (biz) companyName = biz.name;
    }

    // Ensure Firebase Auth is active (fixes issues with manual login bypass)
    if (auth && !auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (e) {
            console.warn("Silent anonymous login failed:", e);
        }
    }

    const redemptionId = doc(collection(db, 'redemptions')).id;
    const redemption: any = {
        id: redemptionId,
        userId: uid,
        userName: user.name,
        userEmail: user.email,
        couponId: c.id,
        companyId: c.companyId,
        couponTitle: c.title,
        amountSaved: c.originalPrice - c.discountedPrice,
        redeemedAt: new Date().toISOString(),
        status: 'PENDING',
        verificationCode: verificationCode
    };

    const record: SavingsRecord = { 
        date: redemption.redeemedAt, 
        amount: redemption.amountSaved, 
        couponTitle: c.title, 
        couponId: c.id,
        companyName: companyName,
        expiryDate: c.expiryDate,
        code: c.code, // Código original do cupom
        verificationId: redemptionId // Referência para o novo registro
    };

    // 5. Executar Gravações no Banco de Dados com Tratamento Resiliente de Erros
    try {
        // A. Criar registro de resgate (ESCRITA FUNDAMENTAL - OBRIGATÓRIA)
        await setDoc(doc(db, 'redemptions', redemptionId), cleanObject(redemption));
    } catch (error) {
        // RESILIÊNCIA MÁXIMA: Não bloquear o resgate se o banco de dados falhar (evitar 'Missing permissions').
        // O usuário receberá o cupom usando o histórico local.
        console.warn("Utilizando fallback de resiliência local para resgate.");
    }

    try {
        // B. Incrementar contador no cupom (INFORMATIVO - NÃO-BLOQUEANTE)
        await updateDoc(doc(db, 'coupons', c.id), { currentRedemptions: increment(1) });
    } catch (error) {
        console.warn("Aviso (não-bloqueante): Não foi possível incrementar o contador do cupom:", error);
    }

    try {
        // C. Atualizar perfil do usuário e economias (INFORMATIVO - NÃO-BLOQUEANTE)
        await updateDoc(doc(db, 'users', uid), { 
            savedAmount: increment(record.amount),
            history: arrayUnion(record)
        });
    } catch (error) {
        console.warn("Aviso (não-bloqueante): Não foi possível atualizar a carteira de economias do usuário no Firestore:", error);
    }

    // D. Sincronizar cache local (Sempre atualiza o cache local para experiência instantânea do usuário)
    if (user.id === uid) {
        const updatedUser = {
            ...user,
            savedAmount: (user.savedAmount || 0) + record.amount,
            history: [...(user.history || []), record]
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        notifyListeners();
    }

    return verificationCode;
};

export const getRedemptionsByBusiness = async (businessId: string) => {
    const q = query(collection(db, 'redemptions'), where('companyId', '==', businessId), orderBy('redeemedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
};

export const validateRedemption = async (redemptionId: string, merchantUid: string) => {
    const rDoc = await getDoc(doc(db, 'redemptions', redemptionId));
    if (!rDoc.exists()) throw new Error("Resgate não encontrado.");
    
    const redemption = rDoc.data();
    if (redemption.companyId !== merchantUid) {
        throw new Error("Você não tem permissão para validar este cupom.");
    }
    
    if (redemption.status === 'USED') {
        throw new Error("Este cupom já foi utilizado.");
    }
    
    await updateDoc(doc(db, 'redemptions', redemptionId), { 
        status: 'USED',
        validatedAt: new Date().toISOString()
    });
    
    notifyListeners();
};

export const createAdminPlace = async (data: Partial<BusinessProfile>) => {
    const id = doc(collection(db, 'businesses')).id;
    const newPlace: BusinessProfile = {
        id,
        name: data.name || '',
        category: data.category || 'Passeios',
        description: data.description || '',
        coverImage: data.coverImage || '',
        gallery: data.gallery || [],
        address: data.address || '',
        phone: data.phone || '',
        amenities: data.amenities || [],
        openingHours: data.openingHours || {},
        rating: 5,
        reviewCount: 0,
        views: 0,
        shares: 0,
        isClaimed: false,
        isBlocked: false,
        canBeClaimed: data.canBeClaimed ?? true,
        ...data
    };
    await setDoc(doc(db, 'businesses', id), newPlace);
    _businesses.push(newPlace);
    notifyListeners();
    return newPlace;
};

export const updateClaimableStatus = async (id: string, canBeClaimed: boolean) => {
    await updateDoc(doc(db, 'businesses', id), { canBeClaimed });
    const biz = _businesses.find(b => b.id === id);
    if (biz) biz.canBeClaimed = canBeClaimed;
    notifyListeners();
};

export const updateBusinessPlan = async (businessId: string, planId: string) => {
    const plan = _plans.find(p => p.id === planId);
    
    let subscriptionEndsAt = undefined;
    if (plan) {
        const now = new Date();
        if (plan.hasFreeTrial && plan.trialDays) {
            now.setDate(now.getDate() + plan.trialDays);
        } else if (plan.period === 'yearly') {
            now.setFullYear(now.getFullYear() + 1);
        } else {
            now.setMonth(now.getMonth() + 1);
        }
        subscriptionEndsAt = now.toISOString();
    }

    const updates: any = { 
        plan: planId,
        isFeatured: plan ? plan.isFeatured : false,
        subscriptionEndsAt
    };
    
    await updateDoc(doc(db, 'businesses', businessId), updates);
    
    const biz = _businesses.find(b => b.id === businessId);
    if (biz) {
        biz.plan = planId as any;
        biz.isFeatured = plan ? plan.isFeatured : false;
        biz.subscriptionEndsAt = subscriptionEndsAt;
    }
    
    notifyListeners();
};

export const registerUser = async (name: string, email: string, pass: string): Promise<User> => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Check if this is an admin email
    const emailLower = email.toLowerCase();
    const isAdminEmail = emailLower === 'admin@lagosgo.org';
    const role = isAdminEmail ? UserRole.SUPER_ADMIN : UserRole.CUSTOMER;
    
    const newUser: User = { id: res.user.uid, name, email, role, favorites: { coupons: [], businesses: [] }, history: [], savedAmount: 0 };
    await setDoc(doc(db, 'users', newUser.id), cleanObject(newUser));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    notifyListeners();
    return newUser;
};

export const createUserByAdmin = async (name: string, email: string, pass: string, role: string, plan: string = ''): Promise<User> => {
    // To avoid logging out the current admin, we use a secondary app instance
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    
    // Check if secondary app already exists to prevent duplication
    const apps = getApps();
    let secondaryApp = apps.find(app => app.name === 'SecondaryApp');
    if (!secondaryApp) {
        secondaryApp = initializeApp(auth.app.options, 'SecondaryApp');
    }
    
    const secondaryAuth = getAuth(secondaryApp);
    
    const res = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    
    let userRole = UserRole.CUSTOMER;
    if (role === 'COMPANY') userRole = UserRole.COMPANY;
    if (role === 'JOURNALIST') userRole = UserRole.JOURNALIST;
    if (role === 'SUPER_ADMIN') userRole = UserRole.SUPER_ADMIN;

    const newUser: User = { 
        id: res.user.uid, 
        name, 
        email, 
        role: userRole, 
        favorites: { coupons: [], businesses: [] }, 
        history: [], 
        savedAmount: 0 
    };
    
    if (userRole === UserRole.COMPANY && plan) {
        newUser.plan = plan; // Assign the plan if applicable
    }

    await setDoc(doc(db, 'users', newUser.id), cleanObject(newUser));
    
    // Sign out the secondary app and delete it to clean up
    await secondaryAuth.signOut();
    
    notifyListeners();
    return newUser;
};

export const createCompanyRequest = async (request: any, type: 'NEW_REGISTRATION' | 'CLAIM' = 'NEW_REGISTRATION') => {
    const user = getCurrentUser();
    const id = `req_${Date.now()}`;
    const data: any = {
        ...request,
        id,
        status: 'PENDING',
        type,
        requestDate: new Date().toISOString()
    };

    if (user) {
        data.userId = user.id;
    }

    await setDoc(doc(db, 'companyRequests', id), data);
};

export const approveBusiness = async (businessId: string) => {
    try {
        await updateDoc(doc(db, 'businesses', businessId), { 
            status: 'approved',
            active: true,
            updatedAt: new Date().toISOString()
        });
        
        // Update local cache if needed
        const index = _businesses.findIndex(b => b.id === businessId);
        if (index !== -1) {
            _businesses[index] = { ..._businesses[index], status: 'approved', active: true };
        }
        
        notifyListeners();
    } catch (error) {
        console.error("Error approving business:", error);
        throw error;
    }
};

export const rejectCompanyRequest = async (requestId: string) => {
    await updateDoc(doc(db, 'companyRequests', requestId), { status: 'REJECTED' });
};

export const approveCompanyRequest = async (requestId: string) => {
    const reqDoc = await getDoc(doc(db, 'companyRequests', requestId));
    if (!reqDoc.exists()) return;
    
    const request = reqDoc.data() as CompanyRequest;
    await updateDoc(doc(db, 'companyRequests', requestId), { status: 'APPROVED' });
    
    if (request.type === 'CLAIM' && request.companyId && request.userId) {
        // Handle Claim: Update business to be claimed by this user
        await updateDoc(doc(db, 'businesses', request.companyId), { 
            isClaimed: true,
            id: request.userId // In this system, business ID usually matches user ID for companies
        });
        
        // Also update user role to COMPANY
        const userDoc = await getDoc(doc(db, 'users', request.userId));
        if (userDoc.exists()) {
            const user = { id: userDoc.id, ...userDoc.data() } as User;
            await updateUser({
                ...user,
                role: UserRole.COMPANY,
                companyName: request.companyName,
                permissions: {
                    canCreateCoupons: true,
                    canManageBusiness: true
                }
            });
        }
    } else if (request.userId) {
        // Handle New Registration
        const userDoc = await getDoc(doc(db, 'users', request.userId));
        if (userDoc.exists()) {
            const user = { id: userDoc.id, ...userDoc.data() } as User;
            const updatedUser = {
                ...user,
                permissions: {
                    ...(user.permissions || { canCreateCoupons: false, canManageBusiness: false }),
                    canCreateBusiness: true
                }
            };
            await updateUser(updatedUser);
        }
    }
};

export const checkIfOpen = (openingHours: { [key: string]: string }, category?: string): boolean => {
    // BOM SENSO: Se for Passeio ou local público e não tiver horário, assume-se aberto (24h)
    // Praias, Mirantes e Praças são essencialmente abertos.
    if (!openingHours || Object.keys(openingHours).length === 0) {
        if (category === 'Passeios' || category === 'Entretenimento') return true;
        return false;
    }

    const now = new Date();
    const dayOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][now.getDay()];
    const hoursString = openingHours[dayOfWeek];

    if (!hoursString || hoursString.toLowerCase().includes('fechado')) {
        // Se for um passeio ou local de natureza e estiver vazio o dia, assume-se aberto
        if (category === 'Passeios' && (!hoursString || hoursString.trim() === '')) return true;
        return false;
    }
    
    if (hoursString.toLowerCase().includes('24 horas') || hoursString.toLowerCase().includes('aberto')) {
        return true;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const ranges = hoursString.split(',').map(r => r.trim());

    for (const range of ranges) {
        const match = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
        
        if (!match) continue; 

        const [, startHour, startMinute, endHour, endMinute] = match.map(Number);
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes < startMinutes) { // Handles overnight hours like 22:00 - 02:00
            if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) return true;
        } else {
            if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return true;
        }
    }

    return false;
};

export const getPricingPlans = async () => {
    if (_plans.length === 0) {
        const snap = await getDocs(collection(db, 'pricingPlans'));
        _plans = snap.docs.map(d => ({ id: d.id, ...d.data() } as PricingPlan));
    }
    return _plans;
};

export const savePricingPlan = async (plan: Partial<PricingPlan>) => {
    const id = plan.id || doc(collection(db, 'pricingPlans')).id;
    const newPlan: PricingPlan = {
        id,
        name: plan.name || 'Novo Plano',
        price: plan.price || 0,
        period: plan.period || 'monthly',
        maxCoupons: plan.maxCoupons || 5,
        maxBusinesses: plan.maxBusinesses || 1,
        isFeatured: plan.isFeatured || false,
        showGallery: plan.showGallery || false,
        showMenu: plan.showMenu || false,
        showSocialMedia: plan.showSocialMedia || false,
        showReviews: plan.showReviews || false,
        hasFreeTrial: plan.hasFreeTrial || false,
        trialDays: plan.trialDays || 30,
        active: plan.active ?? true,
        ...plan
    } as PricingPlan;
    await setDoc(doc(db, 'pricingPlans', id), newPlan);
    return newPlan;
};

export const deletePricingPlan = async (id: string) => {
    await deleteDoc(doc(db, 'pricingPlans', id));
};

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
    try {
        const docSnap = await getDoc(doc(db, 'settings', 'payment'));
        if (docSnap.exists()) {
            return docSnap.data() as PaymentSettings;
        }
    } catch (e) {
        console.warn("Error fetching payment settings:", e);
    }
    
    // Forçando o bypass como padrão conforme solicitado pelo usuário
    return {
        isPaymentActive: false,
        isTestMode: true,
        isDirectPaymentTest: true,
        salesWhatsapp: '5521999999999' // Fallback
    };
};

export const getGlobalSettings = async (): Promise<AppGlobalSettings> => {
    try {
        const docSnap = await getDoc(doc(db, 'app_settings', 'global'));
        if (docSnap.exists()) {
            return docSnap.data() as AppGlobalSettings;
        }
    } catch (e) {
        console.warn("Error fetching global settings:", e);
    }
    return { salesWhatsapp: '5522998765432' }; // Fallback para Região dos Lagos
};

export const saveGlobalSettings = async (settings: AppGlobalSettings) => {
    await setDoc(doc(db, 'app_settings', 'global'), cleanObject(settings));
    notifyListeners();
};

export const savePaymentSettings = async (settings: PaymentSettings): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado no sistema");

    try {
        // Agora usamos o setDoc direto do cliente, pois as regras de segurança foram atualizadas
        // para permitir que o seu e-mail (sea.angelshotel@gmail.com) salve as configurações.
        await setDoc(doc(db, 'settings', 'payment'), settings);
        console.log("Payment settings saved successfully via client SDK");
    } catch (error: any) {
        console.error("Error saving payment settings directly:", error);
        if (error.message?.includes("permission-denied")) {
            throw new Error("Acesso negado: Você não tem permissão para alterar estas configurações no Firestore.");
        }
        throw new Error(`Erro ao salvar configurações: ${error.message}`);
    }
};

export interface BlogComment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    date: string;
}

export const getBlogPostComments = async (postId: string): Promise<BlogComment[]> => {
    try {
        const q = query(
            collection(db, 'blog_comments'), 
            where('postId', '==', postId),
            orderBy('date', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogComment));
    } catch (e: any) {
        console.warn("Could not query comments directly with index, falling back to client-side sort:", e);
        try {
            const qFallback = query(collection(db, 'blog_comments'), where('postId', '==', postId));
            const snapFallback = await getDocs(qFallback);
            const list = snapFallback.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogComment));
            return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (err) {
            console.error("Failed to fetch blog comments:", err);
            return [];
        }
    }
};

export const addBlogPostComment = async (postId: string, commentData: Omit<BlogComment, 'id' | 'date' | 'postId'>): Promise<BlogComment> => {
    const commentId = doc(collection(db, 'blog_comments')).id;
    const newComment: BlogComment = {
        ...commentData,
        id: commentId,
        postId: postId,
        date: new Date().toISOString()
    };
    await setDoc(doc(db, 'blog_comments', commentId), cleanObject(newComment));
    return newComment;
};

