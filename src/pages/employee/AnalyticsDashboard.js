import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent,
  CardHeader, Divider, Button, CircularProgress, Tab, Tabs,
  Avatar, List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import {
  TrendingUp, ShowChart, Assessment, Description,
  LocalShipping, InsertDriveFile, People, ShoppingCart,
  Public, Schedule, Warning, CheckCircle
} from '@mui/icons-material';

// Имитация данных для аналитики
const demoAnalytics = {
  summary: {
    totalOrders: 1245,
    totalDeliveries: 1156,
    pendingDeliveries: 89,
    completedOrders: 1089,
    averageDeliveryTime: '2.3 дня',
    onTimeDeliveryRate: 94.5,
    customerSatisfaction: 4.7,
    problemReports: 23
  },
  
  monthlyData: [
    { month: 'Янв', orders: 98, deliveries: 95, issues: 3 },
    { month: 'Фев', orders: 105, deliveries: 102, issues: 2 },
    { month: 'Мар', orders: 120, deliveries: 118, issues: 1 },
    { month: 'Апр', orders: 115, deliveries: 110, issues: 5 },
    { month: 'Май', orders: 130, deliveries: 125, issues: 2 },
    { month: 'Июн', orders: 125, deliveries: 123, issues: 1 },
    { month: 'Июл', orders: 140, deliveries: 136, issues: 3 },
    { month: 'Авг', orders: 135, deliveries: 130, issues: 4 },
    { month: 'Сен', orders: 145, deliveries: 141, issues: 2 },
    { month: 'Окт', orders: 150, deliveries: 148, issues: 1 },
    { month: 'Ноя', orders: 140, deliveries: 135, issues: 4 },
    { month: 'Дек', orders: 155, deliveries: 150, issues: 2 }
  ],
  
  topClients: [
    { id: 1, name: 'ООО "Инновация"', orders: 45, value: '1,250,000 ₽' },
    { id: 2, name: 'АО "ТехноПром"', orders: 38, value: '980,000 ₽' },
    { id: 3, name: 'ООО "Медицина+"', orders: 32, value: '875,000 ₽' },
    { id: 4, name: 'ИП Петров', orders: 28, value: '720,000 ₽' },
    { id: 5, name: 'ООО "СтройСнаб"', orders: 25, value: '650,000 ₽' }
  ],
  
  regions: [
    { id: 1, name: 'Москва', orders: 320, value: '8,500,000 ₽' },
    { id: 2, name: 'Санкт-Петербург', orders: 280, value: '7,200,000 ₽' },
    { id: 3, name: 'Екатеринбург', orders: 150, value: '3,800,000 ₽' },
    { id: 4, name: 'Новосибирск', orders: 130, value: '3,400,000 ₽' },
    { id: 5, name: 'Казань', orders: 120, value: '3,100,000 ₽' }
  ],
  
  recentReports: [
    { id: 1, title: 'Ежемесячный отчет по продажам', date: '2023-12-01', type: 'monthly' },
    { id: 2, title: 'Анализ эффективности доставок', date: '2023-11-15', type: 'analysis' },
    { id: 3, title: 'Отчет по удовлетворенности клиентов', date: '2023-11-10', type: 'satisfaction' },
    { id: 4, title: 'Отчет по проблемным доставкам', date: '2023-11-05', type: 'issues' }
  ]
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Имитация загрузки данных с сервера
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // В реальном приложении здесь был бы API-запрос
        await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки сети
        setAnalytics(demoAnalytics);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Компонент-заглушка для диаграмм (в реальном приложении здесь была бы реальная диаграмма)
  const ChartPlaceholder = ({ title, description, icon }) => (
    <Box 
      sx={{ 
        height: 250, 
        bgcolor: 'action.hover', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: 1,
        p: 2
      }}
    >
      {icon}
      <Typography variant="subtitle1" textAlign="center" gutterBottom sx={{ mt: 2 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {description}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Аналитика и отчеты
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Обзор ключевых показателей эффективности, заказов и доставок.
        </Typography>
      </Box>

      {/* Ключевые показатели */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="text.secondary" variant="subtitle2">
                  Всего заказов
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  <ShoppingCart fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {analytics.summary.totalOrders}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                +5.3% с прошлого месяца
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="text.secondary" variant="subtitle2">
                  Выполнено доставок
                </Typography>
                <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                  <LocalShipping fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {analytics.summary.completedOrders}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />
                {analytics.summary.onTimeDeliveryRate}% вовремя
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="text.secondary" variant="subtitle2">
                  Ожидают доставки
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                  <Schedule fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {analytics.summary.pendingDeliveries}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                Среднее время: {analytics.summary.averageDeliveryTime}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="text.secondary" variant="subtitle2">
                  Проблемы
                </Typography>
                <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                  <Warning fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {analytics.summary.problemReports}
              </Typography>
              <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Warning fontSize="small" sx={{ mr: 0.5 }} />
                Требуют внимания
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Графики и табы */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Обзор" />
            <Tab label="Регионы" />
            <Tab label="Клиенты" />
            <Tab label="Отчеты" />
          </Tabs>
        </Box>

        {/* Обзор */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Динамика заказов и доставок
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <ChartPlaceholder 
                  title="Месячная динамика заказов и доставок" 
                  description="Здесь будет отображаться линейный график с динамикой заказов и доставок по месяцам"
                  icon={<ShowChart sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6 }} />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ChartPlaceholder 
                  title="Статус доставок" 
                  description="Здесь будет отображаться круговая диаграмма с распределением статусов доставок"
                  icon={<Assessment sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6 }} />}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Регионы */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Распределение по регионам
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ChartPlaceholder 
                  title="Карта распределения заказов по регионам" 
                  description="Здесь будет отображаться карта России с тепловой картой заказов"
                  icon={<Public sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6 }} />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Топ регионов" />
                  <Divider />
                  <List sx={{ pt: 0 }}>
                    {analytics.regions.map((region, index) => (
                      <ListItem key={region.id} divider={index < analytics.regions.length - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={region.name} 
                          secondary={`${region.orders} заказов • ${region.value}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Клиенты */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Анализ клиентов
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ChartPlaceholder 
                  title="Распределение заказов по клиентам" 
                  description="Здесь будет отображаться диаграмма Парето по клиентам"
                  icon={<People sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6 }} />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Топ клиентов" />
                  <Divider />
                  <List sx={{ pt: 0 }}>
                    {analytics.topClients.map((client, index) => (
                      <ListItem key={client.id} divider={index < analytics.topClients.length - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={client.name} 
                          secondary={`${client.orders} заказов • ${client.value}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Отчеты */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Доступные отчеты
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <List>
                      {analytics.recentReports.map((report, index) => (
                        <ListItem key={report.id} divider={index < analytics.recentReports.length - 1}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <InsertDriveFile />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={report.title} 
                            secondary={`Создан: ${new Date(report.date).toLocaleDateString('ru-RU')}`} 
                          />
                          <Button variant="outlined" size="small">
                            Скачать
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        startIcon={<Description />}
                      >
                        Создать новый отчет
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Последние показатели */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Производительность по месяцам" />
            <Divider />
            <CardContent>
              <ChartPlaceholder 
                title="График производительности" 
                description="Здесь будет отображаться график производительности по месяцам"
                icon={<TrendingUp sx={{ fontSize: 60, color: 'success.main', opacity: 0.6 }} />}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Удовлетворенность клиентов" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', my: 3 }}>
                <Typography variant="h1" color="primary.main">
                  {analytics.summary.customerSatisfaction}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Средняя оценка (из 5)
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Avatar 
                      key={star} 
                      sx={{ 
                        width: 30, 
                        height: 30, 
                        mx: 0.5,
                        bgcolor: star <= Math.round(analytics.summary.customerSatisfaction) ? 'warning.main' : 'action.disabled'
                      }}
                    >
                      {star}
                    </Avatar>
                  ))}
                </Box>
              </Box>
              <Typography variant="body2" align="center" color="text.secondary">
                На основе 256 отзывов клиентов за последние 3 месяца
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsDashboard; 