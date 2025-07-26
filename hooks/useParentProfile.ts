// hooks/useParentProfile.ts
import useUserInfo from '@/hooks/useUserInfo';
import { ParentDetailsData } from '@/models/ParentDetailsInterfaces';
import { useGetParentDetails } from '@/services/userServices';
import { useEffect, useRef, useState } from 'react';

export interface UseParentProfileReturn {
  // Data
  parentData: ParentDetailsData | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  retry: () => void;
}

export const useParentProfile = (): UseParentProfileReturn => {
  // Hooks
  const userInfo = useUserInfo();
  const getParentDetails = useGetParentDetails();
  
  // State
  const [parentData, setParentData] = useState<ParentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for tracking and avoiding infinite loops
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const lastParentIdRef = useRef<number | null>(null);
  
  // Get parent ID from user info
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId) : null;

  // Core fetch function - using direct state setters to avoid batching issues
  const fetchParentData = async (isRefresh = false) => {
    if (!parentId || !isMountedRef.current || fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;

    try {
      // Set loading states
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching parent details for ID:', parentId);
      
      const response = await getParentDetails({ parentId });

      if (!isMountedRef.current) return;

      if (response.success && response.data?.data) {
        console.log('✅ Parent details fetched successfully');
        setParentData(response.data.data);
        setError(null);
      } else {
        console.log('❌ Failed to fetch parent details:', response.error);
        setError(response.error || 'Failed to fetch parent details');
        // Don't clear parentData on error, keep existing data
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err.message || 'An error occurred while fetching parent details';
      console.error('❌ Error in fetchParentData:', errorMessage);
      setError(errorMessage);
      // Don't clear parentData on error, keep existing data
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      fetchingRef.current = false;
    }
  };

  // Public API functions
  const refresh = async () => {
    await fetchParentData(true);
  };

  const retry = async () => {
    await fetchParentData(false);
  };

  // Effect for initial fetch - only when parentId changes
  useEffect(() => {
    console.log('🔍 useParentProfile effect triggered:', {
      parentId,
      lastParentId: lastParentIdRef.current,
      isFetching: fetchingRef.current,
    });

    // Only fetch if parentId changed and we're not already fetching
    if (parentId && parentId !== lastParentIdRef.current && !fetchingRef.current) {
      lastParentIdRef.current = parentId;
      fetchParentData(false);
    }
    
    // Clear data when parentId becomes null
    if (!parentId && lastParentIdRef.current !== null) {
      lastParentIdRef.current = null;
      setParentData(null);
      setError(null);
    }
  }, [parentId]); // ONLY parentId dependency

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
    };
  }, []);

  return {
    parentData,
    isLoading,
    isRefreshing,
    error,
    refresh,
    retry,
  };
};