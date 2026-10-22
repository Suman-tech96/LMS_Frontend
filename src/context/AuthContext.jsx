import React, { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('lms_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    try {
      return saved ? JSON.parse(saved).role : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  // Listen to expired auth events dispatched from Axios interceptor
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('lms_auth_expired', handleExpired);
    return () => window.removeEventListener('lms_auth_expired', handleExpired);
  }, [logout]);

  // Validate and load fresh user profile on startup
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('lms_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && isMounted) {
          const profile = response.data?.admin || response.data?.student || response.data?.user || response.data;
          if (profile) {
            const resolvedRole = profile.role || (response.data?.admin ? 'admin' : 'student');
            const normalizedProfile = {
              ...profile,
              role: resolvedRole
            };
            setUser(normalizedProfile);
            setRole(resolvedRole);
            localStorage.setItem('lms_user', JSON.stringify(normalizedProfile));
          }
        }
      } catch (err) {
        console.warn('Initial session check failed:', err.message);
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Student Login (accepts email or studentId/registrationId/identifier)
  const loginStudent = async (identifier, password) => {
    setIsLoading(true);
    try {
      const cleanIdentifier = String(identifier).trim();
      const isEmail = cleanIdentifier.includes('@');
      const payload = {
        email: isEmail ? cleanIdentifier : undefined,
        studentId: !isEmail ? cleanIdentifier : undefined,
        identifier: cleanIdentifier,
        registrationId: !isEmail ? cleanIdentifier : undefined,
        password,
      };

      const res = await authApi.studentLogin(payload);
      if (res.success && res.data) {
        const { token: newToken, student } = res.data;
        const normalizedStudent = {
          ...student,
          role: 'student'
        };
        localStorage.setItem('lms_token', newToken);
        localStorage.setItem('lms_user', JSON.stringify(normalizedStudent));
        setToken(newToken);
        setUser(normalizedStudent);
        setRole('student');
        return { success: true, data: normalizedStudent };
      }
      throw new Error(res.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Login
  const loginAdmin = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.adminLogin({ email: email.trim(), password });
      if (res.success && res.data) {
        const { token: newToken, admin } = res.data;
        const normalizedAdmin = {
          ...admin,
          role: 'admin'
        };
        localStorage.setItem('lms_token', newToken);
        localStorage.setItem('lms_user', JSON.stringify(normalizedAdmin));
        setToken(newToken);
        setUser(normalizedAdmin);
        setRole('admin');
        return { success: true, data: normalizedAdmin };
      }
      throw new Error(res.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Student Registration
  const registerStudent = async (studentData) => {
    setIsLoading(true);
    try {
      const res = await authApi.studentRegister(studentData);
      if (res.success && res.data) {
        const { token: newToken, student, studentId } = res.data;
        const normalizedStudent = {
          ...student,
          studentId: studentId || student?.studentId,
          role: 'student'
        };
        if (newToken) {
          localStorage.setItem('lms_token', newToken);
          localStorage.setItem('lms_user', JSON.stringify(normalizedStudent));
          setToken(newToken);
          setUser(normalizedStudent);
          setRole('student');
        }
        return { success: true, data: res.data };
      }
      throw new Error(res.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh current user profile
  const refreshProfile = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        const profile = response.data.admin || response.data.student || response.data.user || response.data;
        if (profile) {
          const resolvedRole = profile.role || (response.data.admin ? 'admin' : 'student');
          const normalized = { ...profile, role: resolvedRole };
          setUser(normalized);
          localStorage.setItem('lms_user', JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginStudent,
        loginAdmin,
        registerStudent,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

