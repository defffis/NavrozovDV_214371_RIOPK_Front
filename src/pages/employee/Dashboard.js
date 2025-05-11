import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Card, CardContent, 
  Divider, List, ListItem, ListItemText, Avatar, ListItemAvatar,
  Chip, LinearProgress, IconButton, Button, CardActions, CardHeader
} from '@mui/material';
import { 
  Assignment, AccountCircle, LocalShipping, NotificationsActive,
  PendingActions, CheckCircle, BuildCircle, Business, People,
  AssignmentTurnedIn, Timeline, TrendingUp, ArrowForward, Event,
  Map, Assessment, Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Примеры задач (для демонстрации)
  const recentTasks = [
    { id: 1, title: 'Обработать новые заказы', deadline: '2023-12-20', priority: 'Высокий', status: 'В процессе' },
    { id: 2, title: 'Связаться с поставщиком Alpha Ltd', deadline: '2023-12-18', priority: 'Средний', status: 'Не начато' },
    { id: 3, title: 'Подготовить отчет о доставках', deadline: '2023-12-25', priority: 'Низкий', status: 'Не начато' },
  ];

  // Примеры последних заказов (для демонстрации)
  const recentOrders = [
    { id: 'ORD-2023-001', client: 'ООО "Инновация"', date: '2023-12-15', status: 'Создан', total: '125000 ₽' },
    { id: 'ORD-2023-002', client: 'ИП Петров', date: '2023-12-14', status: 'В обработке', total: '67500 ₽' },
    { id: 'ORD-2023-003', client: 'АО "ТехноПром"', date: '2023-12-12', status: 'Доставлен', total: '234800 ₽' },
  ];

  // Статистика (для демонстрации)
  const stats = {
    pendingOrders: 12,
    completedOrders: 58,
    totalTasks: 24,
    completedTasks: 18,
    todaysMeetings: 2,
    newNotifications: 5
  };

  // Получение статуса в виде чипа
  const getStatusChip = (status) => {
    const statusStyles = {
      'Создан': { color: 'primary', label: 'Создан' },
      'Подтвержден': { color: 'info', label: 'Подтвержден' },
      'В обработке': { color: 'warning', label: 'В обработке' },
      'Доставлен': { color: 'success', label: 'Доставлен' },
      'Отменен': { color: 'error', label: 'Отменен' },
      'Не начато': { color: 'default', label: 'Не начато' },
      'В процессе': { color: 'warning', label: 'В процессе' },
      'Завершено': { color: 'success', label: 'Завершено' }
    };
    
    const style = statusStyles[status] || { color: 'default', label: status };
    
    return (
      <Chip 
        size="small" 
        color={style.color} 
        label={style.label}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления сотрудника
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Добро пожаловать, {currentUser?.name || 'Сотрудник'}! Вот ваш обзор на сегодня.
        </Typography>
      </Box>

      {/* Карточки со статистикой */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Заказы в работе
                </Typography>
                <PendingActions color="primary" />
              </Box>
              <Typography variant="h3" component="div">
                {stats.pendingOrders}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Всего: {stats.pendingOrders + stats.completedOrders}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.pendingOrders / (stats.pendingOrders + stats.completedOrders)) * 100} 
                  sx={{ flexGrow: 1, mx: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Завершенные задачи
                </Typography>
                <AssignmentTurnedIn color="success" />
              </Box>
              <Typography variant="h3" component="div">
                {stats.completedTasks}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Прогресс: {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.completedTasks / stats.totalTasks) * 100} 
                  sx={{ flexGrow: 1, mx: 1 }}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Встречи сегодня
                </Typography>
                <Event color="info" />
              </Box>
              <Typography variant="h3" component="div">
                {stats.todaysMeetings}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ближайшая: 14:30 – Совещание с отделом логистики
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" color="text.secondary">
                  Уведомления
                </Typography>
                <NotificationsActive color="warning" />
              </Box>
              <Typography variant="h3" component="div">
                {stats.newNotifications}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.newNotifications > 0 ? 'Непрочитанных сообщений' : 'Нет новых уведомлений'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Основные блоки */}
      <Grid container spacing={3}>
        {/* Последние заказы */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader 
              title="Последние заказы" 
              action={
                <Button 
                  color="primary" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/orders/manage')}
                >
                  Все заказы
                </Button>
              }
            />
            <Divider />
            <List sx={{ padding: 0 }}>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem 
                    alignItems="flex-start" 
                    secondaryAction={getStatusChip(order.status)}
                    sx={{ py: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <LocalShipping />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="span">
                          {order.id}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {order.client}
                          </Typography>
                          <Typography component="div" variant="body2" color="text.secondary">
                            {`Сумма: ${order.total} • ${order.date}`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentOrders.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            <CardActions sx={{ justifyContent: 'center', py: 1 }}>
              <Button size="small" onClick={() => navigate('/orders/manage')}>
                Управление заказами
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Текущие задачи */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader 
              title="Мои задачи" 
              action={
                <Button 
                  color="primary" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/tasks')}
                >
                  Все задачи
                </Button>
              }
            />
            <Divider />
            <List sx={{ padding: 0 }}>
              {recentTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light' }}>
                        <Assignment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {task.title}
                          </Typography>
                          {getStatusChip(task.status)}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {`Приоритет: ${task.priority}`}
                          </Typography>
                          <Typography component="div" variant="body2" color="text.secondary">
                            {`Срок: ${task.deadline}`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentTasks.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            <CardActions sx={{ justifyContent: 'center', py: 1 }}>
              <Button size="small" onClick={() => navigate('/tasks')}>
                Управление задачами
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Быстрые ссылки */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Быстрые действия" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<DashboardIcon />} 
                    fullWidth
                    onClick={() => navigate('/employee/dashboard')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Дашборд
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Assignment />} 
                    fullWidth
                    onClick={() => navigate('/tasks')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Задачи
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<LocalShipping />} 
                    fullWidth
                    onClick={() => navigate('/orders/manage')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Заказы
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Map />} 
                    fullWidth
                    onClick={() => navigate('/employee/delivery-tracking')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Отслеживание
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Business />} 
                    fullWidth
                    onClick={() => navigate('/suppliers/manage')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Поставщики
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Assessment />} 
                    fullWidth
                    onClick={() => navigate('/employee/analytics')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Аналитика
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Timeline />} 
                    fullWidth
                    onClick={() => navigate('/employee-reports')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Отчеты
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<AccountCircle />} 
                    fullWidth
                    onClick={() => navigate('/profile')}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    Профиль
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 