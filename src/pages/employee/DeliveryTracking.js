import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent,
  Tabs, Tab, Divider, Button, Chip, CircularProgress,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  TextField, MenuItem, IconButton, LinearProgress
} from '@mui/material';
import {
  LocalShipping, LocationOn, Navigation, AccessTime,
  MoreVert, Refresh, FilterList, Search, Done, Error
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Демо-данные для доставок
const DEMO_DELIVERIES = [
  {
    id: 'D-2023-001',
    orderId: 'ORD-2023-001',
    client: 'ООО "Инновация"',
    address: 'г. Москва, ул. Ленина, 10',
    courier: 'Иванов Иван',
    status: 'В пути',
    estimatedDelivery: '2023-12-20T14:30:00',
    currentLocation: { lat: 55.751244, lng: 37.618423 },
    progress: 65,
    route: [
      { lat: 55.755244, lng: 37.617423, time: '2023-12-20T10:30:00', status: 'Отправлен' },
      { lat: 55.753244, lng: 37.618423, time: '2023-12-20T11:45:00', status: 'В пути' },
      { lat: 55.751244, lng: 37.618423, time: '2023-12-20T12:30:00', status: 'В пути' }
    ],
    items: [
      { name: 'Компьютер Dell XPS', quantity: 5 },
      { name: 'Монитор LG 27"', quantity: 10 }
    ],
    notes: 'Клиент запросил доставку до 15:00'
  },
  {
    id: 'D-2023-002',
    orderId: 'ORD-2023-002',
    client: 'ИП Петров',
    address: 'г. Санкт-Петербург, Невский пр-т, 78',
    courier: 'Петров Сергей',
    status: 'Доставлен',
    estimatedDelivery: '2023-12-18T16:00:00',
    actualDelivery: '2023-12-18T15:45:00',
    currentLocation: { lat: 59.932333, lng: 30.348671 },
    progress: 100,
    route: [
      { lat: 59.939233, lng: 30.315671, time: '2023-12-18T13:00:00', status: 'Отправлен' },
      { lat: 59.935233, lng: 30.325671, time: '2023-12-18T14:15:00', status: 'В пути' },
      { lat: 59.932333, lng: 30.348671, time: '2023-12-18T15:45:00', status: 'Доставлен' }
    ],
    items: [
      { name: 'Ноутбук Lenovo ThinkPad', quantity: 3 },
      { name: 'Клавиатура Logitech', quantity: 5 }
    ]
  },
  {
    id: 'D-2023-003',
    orderId: 'ORD-2023-003',
    client: 'АО "ТехноПром"',
    address: 'г. Екатеринбург, ул. Мира, 32',
    courier: 'Смирнова Ольга',
    status: 'Задержка',
    estimatedDelivery: '2023-12-19T11:00:00',
    currentLocation: { lat: 56.836341, lng: 60.603609 },
    progress: 45,
    route: [
      { lat: 56.839341, lng: 60.604609, time: '2023-12-19T08:30:00', status: 'Отправлен' },
      { lat: 56.836341, lng: 60.603609, time: '2023-12-19T09:45:00', status: 'Задержка' }
    ],
    items: [
      { name: 'Сервер HP ProLiant', quantity: 1 },
      { name: 'Сетевое оборудование', quantity: 8 }
    ],
    notes: 'Задержка из-за дорожных работ'
  },
  {
    id: 'D-2023-004',
    orderId: 'ORD-2023-004',
    client: 'ООО "Медицина+"',
    address: 'г. Казань, ул. Баумана, 15',
    courier: 'Козлов Дмитрий',
    status: 'Запланирован',
    estimatedDelivery: '2023-12-21T13:00:00',
    progress: 0,
    items: [
      { name: 'Медицинское оборудование', quantity: 2 },
      { name: 'Расходные материалы', quantity: 20 }
    ]
  },
  {
    id: 'D-2023-005',
    orderId: 'ORD-2023-005',
    client: 'ИП Сидоров А.П.',
    address: 'г. Новосибирск, ул. Фрунзе, 5',
    courier: 'Федоров Алексей',
    status: 'Проблема',
    estimatedDelivery: '2023-12-17T10:00:00',
    currentLocation: { lat: 55.026671, lng: 82.920839 },
    progress: 35,
    route: [
      { lat: 55.030671, lng: 82.920839, time: '2023-12-17T08:30:00', status: 'Отправлен' },
      { lat: 55.026671, lng: 82.920839, time: '2023-12-17T09:15:00', status: 'Проблема' }
    ],
    items: [
      { name: 'Строительные материалы', quantity: 15 }
    ],
    notes: 'Возникла проблема с доступом к зданию'
  }
];

const DeliveryTracking = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filter, setFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Имитация загрузки данных с сервера
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        // В реальном приложении здесь был бы API-запрос
        await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки сети
        setDeliveries(DEMO_DELIVERIES);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectDelivery = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const getFilteredDeliveries = () => {
    if (filter === 'all') return deliveries;
    return deliveries.filter(delivery => delivery.status === filter);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Запланирован': 'primary',
      'Отправлен': 'info',
      'В пути': 'warning',
      'Доставлен': 'success',
      'Задержка': 'warning',
      'Проблема': 'error'
    };
    return statusMap[status] || 'default';
  };

  const refreshDeliveries = () => {
    setLoading(true);
    // Имитация обновления данных
    setTimeout(() => {
      setDeliveries([...DEMO_DELIVERIES]);
      setLoading(false);
    }, 800);
  };

  // Компонент плейсхолдер для карты (в реальном приложении здесь был бы Google Maps)
  const MapPlaceholder = ({ delivery }) => (
    <Box 
      sx={{ 
        height: 300, 
        bgcolor: 'action.hover', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: 1,
        p: 2,
        position: 'relative'
      }}
    >
      <Typography variant="subtitle1" textAlign="center" gutterBottom>
        {delivery ? `Карта маршрута для доставки ${delivery.id}` : 'Выберите доставку для отображения на карте'}
      </Typography>
      
      {delivery && (
        <>
          <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
            <Chip 
              icon={<LocationOn />} 
              label={`${delivery.currentLocation?.lat.toFixed(4)}, ${delivery.currentLocation?.lng.toFixed(4)}`} 
              size="small" 
              color="primary"
            />
          </Box>
          <LocationOn sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Здесь будет интерактивная карта с маршрутом доставки
          </Typography>
        </>
      )}
    </Box>
  );

  // Список доставок
  const DeliveryList = () => {
    const filteredDeliveries = getFilteredDeliveries();
    
    if (filteredDeliveries.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1">Доставки не найдены</Typography>
        </Box>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {filteredDeliveries.map((delivery, index) => (
          <React.Fragment key={delivery.id}>
            <ListItem 
              alignItems="flex-start" 
              sx={{ 
                cursor: 'pointer', 
                bgcolor: selectedDelivery?.id === delivery.id ? 'action.selected' : 'inherit',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleSelectDelivery(delivery)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getStatusColor(delivery.status) }}>
                  <LocalShipping />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {delivery.orderId} - {delivery.client}
                    </Typography>
                    <Chip 
                      label={delivery.status} 
                      size="small" 
                      color={getStatusColor(delivery.status)} 
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {delivery.address}
                    </Typography>
                    <Typography component="div" variant="body2" color="text.secondary">
                      Курьер: {delivery.courier}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" sx={{ mr: 1 }}>
                        Прогресс:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={delivery.progress} 
                        sx={{ flexGrow: 1 }}
                        color={getStatusColor(delivery.status)}
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {delivery.progress}%
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
            {index < filteredDeliveries.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  // Детали выбранной доставки
  const DeliveryDetails = () => {
    if (!selectedDelivery) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Выберите доставку из списка для просмотра деталей
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Информация о доставке {selectedDelivery.id}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Данные заказа
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2"><strong>Заказ:</strong> {selectedDelivery.orderId}</Typography>
              <Typography variant="body2"><strong>Клиент:</strong> {selectedDelivery.client}</Typography>
              <Typography variant="body2"><strong>Адрес:</strong> {selectedDelivery.address}</Typography>
              <Typography variant="body2"><strong>Курьер:</strong> {selectedDelivery.courier}</Typography>
            </Box>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Товары
            </Typography>
            <List dense>
              {selectedDelivery.items.map((item, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemText 
                    primary={item.name} 
                    secondary={`Количество: ${item.quantity}`} 
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Статус доставки
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}><strong>Текущий статус:</strong></Typography>
                <Chip 
                  label={selectedDelivery.status} 
                  size="small" 
                  color={getStatusColor(selectedDelivery.status)} 
                />
              </Box>
              <Typography variant="body2">
                <strong>Ожидаемая доставка:</strong> {new Date(selectedDelivery.estimatedDelivery).toLocaleString('ru-RU')}
              </Typography>
              {selectedDelivery.actualDelivery && (
                <Typography variant="body2">
                  <strong>Фактическая доставка:</strong> {new Date(selectedDelivery.actualDelivery).toLocaleString('ru-RU')}
                </Typography>
              )}
              {selectedDelivery.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Примечания:</strong> {selectedDelivery.notes}
                </Typography>
              )}
            </Box>
            
            {selectedDelivery.route && (
              <>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  История перемещений
                </Typography>
                <List dense>
                  {selectedDelivery.route.map((point, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemAvatar sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: getStatusColor(point.status) }}>
                          <LocationOn sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={`${point.status} - ${new Date(point.time).toLocaleTimeString('ru-RU')}`}
                        secondary={`${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Grid>
        </Grid>
        
        {/* Кнопки действий */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            startIcon={<Navigation />}
            sx={{ mr: 1 }}
          >
            Маршрут
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AccessTime />}
            color={selectedDelivery.status === 'Задержка' ? 'warning' : 'primary'}
          >
            {selectedDelivery.status === 'Доставлен' ? 'Доставлено' : 'Расчётное время'}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Мониторинг доставок
          </Typography>
          <Box>
            <TextField
              select
              size="small"
              value={filter}
              onChange={handleFilterChange}
              label="Фильтр"
              sx={{ mr: 2, width: 150 }}
            >
              <MenuItem value="all">Все доставки</MenuItem>
              <MenuItem value="Запланирован">Запланированы</MenuItem>
              <MenuItem value="Отправлен">Отправленные</MenuItem>
              <MenuItem value="В пути">В пути</MenuItem>
              <MenuItem value="Задержка">С задержкой</MenuItem>
              <MenuItem value="Проблема">Проблемные</MenuItem>
              <MenuItem value="Доставлен">Доставленные</MenuItem>
            </TextField>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={refreshDeliveries}
              disabled={loading}
            >
              Обновить
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Карта и табы */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Карта доставок" />
                    <Tab label="Детали доставки" />
                  </Tabs>

                  {activeTab === 0 && (
                    <MapPlaceholder delivery={selectedDelivery} />
                  )}

                  {activeTab === 1 && (
                    <DeliveryDetails />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Список доставок */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1">
                      Список доставок
                    </Typography>
                  </Box>
                  <Divider />
                  <DeliveryList />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default DeliveryTracking; 