// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Проверяем токен и загружаем данные пользователя при инициализации
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('Initializing auth with token:', storedToken);

      if (storedToken) {
        try {
          const response = await axiosInstance.get('/users/me/', {
            headers: {
              'Authorization': `Token ${storedToken}`
            }
          });
          console.log('Loaded user data:', response.data);
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Если токен недействителен, очищаем данные
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userData, authToken) => {
    console.log('Login called with:', { userData, authToken });
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const logout = async () => {
    console.log('Logout called');
    try {
      // Вызываем endpoint для логаута на бэкенде
      await axiosInstance.post('/users/logout/');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Очищаем данные даже если запрос не удался
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Предоставляем значение loading для отображения состояния загрузки
  const value = {
    user,
    token,
    login,
    logout,
    loading
  };

  if (loading) {
    return <div>Loading...</div>; // Или ваш компонент загрузки
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};