import React from 'react';
import {
  Container, Typography, Box, Button, Paper, Grid, Card, CardContent, CardActions,
  Divider, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  LocalShipping, Inventory, ShoppingCart,
  Receipt, Assessment, Speed, Timeline
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const SupplierDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Define quick action cards
  const quickActions = [
    {
      title: 'Мои заказы',
      description: 'Управление текущими заказами',
      icon: <Receipt fontSize="large" color="primary" />,
      action: () => navigate('/supplier/orders')
    },
    {
      title: 'Доступные заказы',
      description: 'Заказы без назначенного поставщика',
      icon: <ShoppingCart fontSize="large" color="success" />,
      action: () => navigate('/supplier/unclaimed-orders')
    },
    {
      title: 'Товары',
      description: 'Управление каталогом товаров',
      icon: <Inventory fontSize="large" color="info" />,
      action: () => navigate('/products/manage')
    },
    {
      title: 'Контракты',
      description: 'Просмотр активных контрактов',
      icon: <Assessment fontSize="large" color="warning" />,
      action: () => navigate('/supplier/contracts')
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white'
        }}
      >
        <Box sx={{ maxWidth: '800px' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Добро пожаловать, {currentUser?.name || 'Поставщик'}!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Система управления грузоперевозками и поставками
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Наша система создана для оптимизации логистических процессов и упрощения взаимодействия между поставщиками и клиентами.
            Управляйте заказами, контролируйте доставки и следите за своей эффективностью в режиме реального времени.
        </Typography>
        <Button 
          variant="contained" 
            color="secondary"
            size="large"
            startIcon={<LocalShipping />}
            onClick={() => navigate('/supplier/orders')}
            sx={{
              fontWeight: 'bold',
              px: 3, 
              py: 1,
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}
          >
            Перейти к заказам
              </Button>
            </Box>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Быстрые действия
                </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h2" align="center" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions>
              <Button 
                size="small" 
                  fullWidth 
                  onClick={action.action}
                  sx={{ textTransform: 'none' }}
              >
                  Перейти
              </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* System Info */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          О системе
                          </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Speed color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Оптимизация процессов
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ускорение логистических операций и сокращение времени обработки заказов
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <LocalShipping color="secondary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Управление доставками
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                Отслеживание статусов доставок и управление логистикой в реальном времени
                      </Typography>
                  </Box>
                </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Timeline color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Анализ эффективности
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                Детальные отчеты и метрики для оптимизации бизнес-процессов
                      </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
    </Container>
  );
};

export default SupplierDashboard;