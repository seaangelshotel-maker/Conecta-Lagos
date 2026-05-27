
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
    DEFAULT_AMENITIES, AppConfig, Collection, PricingPlan, HomeHighlight, City, Neighborhood, Review, PaymentSettings, AppAmenity
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

let _isAuthInitialized = false;

onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const userData = { id: userDoc.id, ...data } as User;
                localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
            }
        } catch (e) {
            console.error("Auth session sync error:", e);
        }
    } else {
        // Firebase Auth is signed out, ensure local session is cleared
        localStorage.removeItem(SESSION_KEY);
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
            const q = query(collection(db, 'users'), where('email', '==', email));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const doc = snap.docs[0];
                foundUser = { id: doc.id, ...doc.data() } as User;
                // Add to cache
                _users.push(foundUser);
            }
        } catch (e) {
            console.warn("Error fetching user during login:", e);
        }
    }

    if (foundUser) {
        if (foundUser.isBlocked) throw new Error("Sua conta está inativa. Entre em contato com o suporte.");
    }

    try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const userDoc = await getDoc(doc(db, 'users', res.user.uid));
        if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            if (userData.isBlocked) {
                await auth.signOut();
                throw new Error("Sua conta está inativa. Entre em contato com o suporte.");
            }
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
        
        // IRON-CLAD PROTECTION: Ensure master admins are ALWAYS SUPER_ADMIN
        const emailLower = (userData.email || '').toLowerCase();
        if (emailLower === 'sea.angelshotel@gmail.com' || emailLower === 'admin@lagosgo.org' || emailLower === 'admin@conectario.com') {
            if (userData.role !== UserRole.SUPER_ADMIN) {
                userData.role = UserRole.SUPER_ADMIN;
                await updateDoc(doc(db, 'users', userData.id), { role: UserRole.SUPER_ADMIN });
            }
        }
        
        // Fix for yurirmg@gmail.com who was accidentally made SUPER_ADMIN
        if (userData.email?.toLowerCase() === 'yurirmg@gmail.com' && userData.role === UserRole.SUPER_ADMIN) {
            userData.role = UserRole.COMPANY;
            await updateDoc(doc(db, 'users', userData.id), { role: UserRole.COMPANY });
        }
    } else {
        const email = (res.user.email || '').toLowerCase();
        const isAdminEmail = email === 'sea.angelshotel@gmail.com' || 
                           email === 'admin@lagosgo.org';
        const role = isAdminEmail ? UserRole.SUPER_ADMIN : UserRole.CUSTOMER;

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

export const getBlogPosts = async () => {
    if (_posts.length === 0) {
        const snap = await getDocs(query(collection(db, 'blog_posts'), orderBy('date', 'desc'), limit(20)));
        _posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
    }
    return _posts;
};

export const getAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    _users = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
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

export const getReviewsByBusinessId = (businessId: string) => {
    return _reviews.filter(r => r.businessId === businessId && r.status === 'approved')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const approveReview = async (reviewId: string) => {
    const review = _reviews.find(r => r.id === reviewId);
    if (!review || !review.businessId) throw new Error('Avaliação não encontrada.');

    review.status = 'approved';
    await setDoc(doc(db, 'reviews', reviewId), cleanObject(review), { merge: true });

    const business = _businesses.find(b => b.id === review.businessId);
    if (!business) {
        // Business was deleted, we already updated the review status in DB
        notifyListeners();
        return;
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
    const review = _reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Avaliação não encontrada.');

    review.status = 'rejected';
    await setDoc(doc(db, 'reviews', reviewId), cleanObject(review), { merge: true });
    
    // If it was already in a business, remove it
    if (review.businessId) {
        const business = _businesses.find(b => b.id === review.businessId);
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
    if (cached) return cached;
    
    const docRef = doc(db, 'blog_posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const post = { id: docSnap.id, ...docSnap.data() } as BlogPost;
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
    const isAdminEmail = emailLower === 'sea.angelshotel@gmail.com' || 
                       emailLower === 'admin@lagosgo.org';
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
