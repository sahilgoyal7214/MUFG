/**
 * Custom React hooks for data integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import DataService from '../lib/dataService';
import AuthService from '../lib/authService';

/**
 * Hook for authentication state and user info
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        username: session.user.username,
        role: session.user.role,
        roleData: session.user.roleData
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [session, status]);

  return {
    user,
    isAuthenticated: !!session,
    isLoading: loading,
    session
  };
}

/**
 * Hook for fetching pension data with caching and error handling
 */
export function usePensionData(filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DataService.getPensionData(filters);
      setData(response.data || response || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch pension data');
      console.error('Error fetching pension data:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching member-specific data
 */
export function useMemberData(memberId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberId) return;

    const fetchMemberData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await DataService.getMemberData(memberId);
        setData(response.data || response);
      } catch (err) {
        setError(err.message || 'Failed to fetch member data');
        console.error('Error fetching member data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  return { data, loading, error };
}

/**
 * Hook for fetching user profile and stats
 */
export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profileResponse, statsResponse] = await Promise.all([
          AuthService.getUserProfile(),
          AuthService.getUserStats()
        ]);
        
        setProfile(profileResponse.data || profileResponse);
        setStats(statsResponse.data || statsResponse);
      } catch (err) {
        setError(err.message || 'Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { profile, stats, loading, error };
}

/**
 * Hook for KPI calculations
 */
export function useKPIData(params = {}) {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateKPIs = useCallback(async (kpiParams = params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DataService.getKPIs(kpiParams);
      setKpiData(response.data || response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to calculate KPIs');
      console.error('Error calculating KPIs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { kpiData, loading, error, calculateKPIs };
}

/**
 * Hook for analytics data
 */
export function useAnalytics(params = {}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateAnalytics = useCallback(async (analyticsParams = params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DataService.getAnalytics(analyticsParams);
      setAnalyticsData(response.data || response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to generate analytics');
      console.error('Error generating analytics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyticsData, loading, error, generateAnalytics };
}
