// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, Box, TextField, Button, Typography, 
  Paper, Alert 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Login = () => {
  // Состояния
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Отладка: проверяем инициализацию компонента
  console.log('Login component initialized');

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setError('');
    setIsLoading(true);
  
    try {
      console.log('Sending login request...');
      // Отправляем запрос на аутентификацию
      const response = await axiosInstance.post('/users/login/', {
        username: formData.username,
        password: formData.password
      });
  
      console.log('Login response received:', response);
  
      if (response.data.token) {
        // Сохраняем токен
        localStorage.setItem('token', response.data.token);
        console.log('Token saved to localStorage');
  
        try {
          // Получаем информацию о пользователе
          const userResponse = await axiosInstance.get('/users/me/', {
            headers: {
              'Authorization': `Token ${response.data.token}`
            }
          });
  
          console.log('User data received:', userResponse.data);
  
          // Сохраняем данные пользователя в контекст
          const userData = userResponse.data;
          await login(userData, response.data.token);
  
          console.log('User type:', userData.user_type);
          
          // Перенаправляем пользователя в зависимости от типа
          if (userData.user_type === 'client') {
            console.log('Navigating to client dashboard...');
            navigate('/client');
          } else if (userData.user_type === 'manager') {
            console.log('Navigating to manager dashboard...');
            navigate('/manager');
          } else {
            console.error('Unknown user type:', userData.user_type);
            setError('Неизвестный тип пользователя');
          }
  
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          setError('Ошибка при получении данных пользователя');
        }
      } else {
        console.error('No token in response');
        setError('Ошибка: токен не получен');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Неверное имя пользователя или пароль');
      } else {
        setError('Произошла ошибка при входе в систему');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Отладка: проверяем рендер компонента
  console.log('Rendering Login component', { formData, error, isLoading });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 3, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Вход в систему
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Выполняется вход...' : 'Войти'}
            </Button>
            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              disabled={isLoading}
            >
              Нет аккаунта? Зарегистрироваться
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;