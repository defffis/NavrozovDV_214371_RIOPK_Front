import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

 
const AccessDenied = () => {
  const navigate = useNavigate();
  
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
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
            textAlign: 'center',
          }}
        >
          <BlockIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 2,
            }}
          />
          
          <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Доступ запрещен
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            У вас нет необходимых прав для доступа к запрашиваемой странице
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
            Проверьте свою роль в системе или обратитесь к администратору для получения необходимых разрешений.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Вернуться назад
            </Button>
            
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
          </Box>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} SupplyBI System. Все права защищены.
        </Typography>
      </Box>
    </Container>
  );
};

export default AccessDenied; 