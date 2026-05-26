
import useSWR from 'swr';
import { getAllBusinesses, getCoupons, getCategories } from '../services/dataService';

// --- CACHE WITH SWR (PROMPT 2) ---

export const useBusinesses = () => {
    const { data, error, isLoading, mutate } = useSWR('businesses', getAllBusinesses, {
        revalidateOnFocus: false,
        dedupingInterval: 300000, // 5 minutes
    });

    return {
        businesses: data || [],
        isLoading,
        isError: error,
        mutate
    };
};

export const useCoupons = (forceRefresh = false) => {
    const { data, error, isLoading, mutate } = useSWR('coupons', () => getCoupons(forceRefresh), {
        revalidateOnFocus: false,
        dedupingInterval: 300000, // 5 minutes
    });

    return {
        coupons: data || [],
        isLoading,
        isError: error,
        mutate
    };
};

export const useAppCategories = () => {
    const { data, error, isLoading } = useSWR('categories', getCategories, {
        revalidateOnFocus: false,
        dedupingInterval: 3600000, // 1 hour (categories change rarely)
    });

    return {
        categories: data || [],
        isLoading,
        isError: error
    };
};
