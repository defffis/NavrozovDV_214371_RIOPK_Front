import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { authService } from '../services/api';

 
const ResetPassword = () => {
  const navigate = useNavigate();
  
 
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      
      await authService.resetPassword(email);
      
      setSuccess(true);
    } catch (err) {
      setError('Произошла ошибка при отправке запроса на сброс пароля');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon sx={{ color: 'primary.main', fontSize: 40, mr: 1 }} />
            <Typography component="h1" variant="h5" fontWeight="bold">
              SupplyBI System
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
            Сброс пароля
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Инструкции по сбросу пароля отправлены на указанный email
              </Alert>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Проверьте свою электронную почту и следуйте инструкциям для сброса пароля.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
              >
                Вернуться на страницу входа
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Введите свой email, и мы отправим вам инструкции по сбросу пароля
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Отправить'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                    Вернуться на страницу входа
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} SupplyBI System. Все права защищены.
        </Typography>
      </Box>
    </Container>
  );
};

export default ResetPassword; 