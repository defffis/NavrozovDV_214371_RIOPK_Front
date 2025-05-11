import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, Card, CardContent,
  CircularProgress, Divider, List, ListItem, ListItemText, Chip,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Receipt, Inventory, LocalShipping,
  ArrowForward, NotificationsActive, ViewList
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { orderService, productService, notificationService } from '../../services/api';
import { format } from 'date-fns';

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalOrderValue: 0,
    pendingDeliveries: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersResponse = await orderService.getOrders();
      
      // Process orders for stats
      const orders = ordersResponse || [];
      setRecentOrders(orders.slice(0, 5)); // Get the first 5 orders

      // Calculate stats
      const activeOrders = orders.filter(order => 
        ['Создан', 'Подтвержден', 'В обработке', 'Отправлен', 'В пути'].includes(order.status)
      ).length;
      
      const completedOrders = orders.filter(order => 
        ['Доставлен', 'Получен'].includes(order.status)
      ).length;
      
      const pendingDeliveries = orders.filter(order => 
        ['Отправлен', 'В пути'].includes(order.status)
      ).length;
      
      const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalOrderValue || 0), 0);

      setStats({
        activeOrders,
        completedOrders,
        totalOrderValue,
        pendingDeliveries
      });

      // Fetch notifications
      try {
        const notificationsResponse = await notificationService.getNotifications();
        setNotifications(notificationsResponse.filter(n => !n.isRead).slice(0, 5));
      } catch (notifError) {
        console.error('Error fetching notifications:', notifError);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      'Создан': 'default',
      'Подтвержден': 'info',
      'В обработке': 'primary',
      'Отправлен': 'warning',
      'В пути': 'secondary',
      'Доставлен': 'success',
      'Получен': 'success',
      'Отменен': 'error'
    };

    return (
      <Chip 
        label={status} 
        color={statusColors[status] || 'default'} 
        size="small" 
      />
    );
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Добро пожаловать, {currentUser?.name || 'Клиент'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Добро пожаловать в систему управления поставками. Здесь вы можете отслеживать заказы, управлять корзиной и просматривать каталог товаров.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Быстрые действия
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, flex: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/client/cart')}
                  fullWidth
                >
                  Перейти в корзину
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<Inventory />}
                  onClick={() => navigate('/client/products')}
                  fullWidth
                >
                  Просмотреть каталог товаров
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<Receipt />}
                  onClick={() => navigate('/client/orders')}
                  fullWidth
                >
                  Мои заказы
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика заказов
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h4" color="primary">
                      {stats.activeOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Активные заказы
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h4" color="success.main">
                      {stats.completedOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Выполненные заказы
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h4" color="warning.main">
                      {stats.pendingDeliveries}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ожидают доставки
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h4" color="info.main">
                      {new Intl.NumberFormat('ru-RU', { 
                        style: 'currency', 
                        currency: 'RUB',
                        maximumFractionDigits: 0
                      }).format(stats.totalOrderValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Общая сумма
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                Последние заказы
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/client/orders')}
                endIcon={<ArrowForward />}
              >
                Все заказы
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentOrders.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>№ заказа</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow 
                        key={order._id}
                        onClick={() => navigate(`/client/orders/${order._id}`)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        <TableCell>{order._id.substring(order._id.length - 6)}</TableCell>
                        <TableCell>{format(new Date(order.orderDate), 'dd.MM.yyyy')}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('ru-RU', { 
                            style: 'currency', 
                            currency: 'RUB',
                            maximumFractionDigits: 0
                          }).format(order.totalOrderValue)}
                        </TableCell>
                        <TableCell>{getStatusChip(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1" color="text.secondary">
                  У вас пока нет заказов
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                Уведомления
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/notifications')}
                endIcon={<ArrowForward />}
              >
                Все
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {notifications.length > 0 ? (
              <List>
                {notifications.map((notification) => (
                  <ListItem 
                    key={notification._id}
                    sx={{ 
                      bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={notification.title}
                      secondary={format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1" color="text.secondary">
                  Нет новых уведомлений
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboard;