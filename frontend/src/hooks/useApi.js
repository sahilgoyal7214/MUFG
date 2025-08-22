/**
 * Custom React hook for API data management
 * Provides loading states, error handling, and caching
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../lib/apiService';

export function useApiData(role) {
  const [data, setData] = useState({
    users: [],
    members: [],
    analytics: null,
    kpis: null,
    dashboard: null,
    clients: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!role) return;

    setLoading(true);
    setError(null);

    try {
      const dashboardData = await apiService.getDashboardData(role);
      setData(prevData => ({
        ...prevData,
        ...dashboardData,
      }));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
    setData,
  };
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    refresh: loadUsers,
  };
}

export function useMembers(params = {}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getMembers(params);
      setMembers(response.data || []);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return {
    members,
    loading,
    error,
    refresh: loadMembers,
  };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getAnalytics();
      setAnalytics(response.data || response);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics,
  };
}

export function useChatbot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I assist you with your pension planning today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message, context = {}) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage = { from: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.sendChatMessage(message, context);
      const botMessage = { 
        from: 'bot', 
        text: response.response || response.message || 'I received your message!' 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
      setError(err.message);
      // Add error message from bot
      const errorMessage = { 
        from: 'bot', 
        text: 'Sorry, I\'m having trouble responding right now. Please try again later.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    messages,
    sendMessage,
    loading,
    error,
    setMessages,
  };
}
