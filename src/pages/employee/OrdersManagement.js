import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent, CardActions,
  Button, TextField, Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Divider, IconButton, MenuItem, FormControl, InputLabel, Select, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Tabs, Tab, Badge, Snackbar, Alert
} from '@mui/material';
import {
  ShoppingCart, LocalShipping, Person, EventNote, 
  FilterList, Search, Refresh, Visibility, Edit, 
  SendOutlined, CheckCircle, Cancel, ArrowForward, Business, 
  Assignment, AttachMoney, CalendarToday, Info, Warning
} from '@mui/icons-material';
import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { currentUser } = useAuth();

  // Статусы заказов
  const orderStatuses = [
    { value: 'Создан', color: 'default' },
    { value: 'Подтвержден', color: 'primary' },
    { value: 'В обработке', color: 'info' },
    { value: 'Отправлен', color: 'warning' },
    { value: 'В пути', color: 'warning' },
    { value: 'Доставлен', color: 'success' },
    { value: 'Получен', color: 'success' },
    { value: 'Отменен', color: 'error' },
    { value: 'Возвращен', color: 'error' }
  ];

  // Загрузка заказов
  useEffect(() => {
    fetchOrders();
  }, []);

  // Фильтрация заказов при изменении активной вкладки или поискового запроса
  useEffect(() => {
    filterOrders();
  }, [activeTab, searchQuery, orders]);

  // Функция загрузки заказов
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Явно запрашиваем все заказы, передаем employee=all чтобы обойти фильтрацию по текущему сотруднику
      const response = await orderService.getOrders({ employee: 'all' });
      console.log('Всего загружено заказов:', response.length);
      
      // Проверяем разнообразие статусов
      const statusCounts = {};
      response.forEach(order => {
        if (!statusCounts[order.status]) {
          statusCounts[order.status] = 0;
        }
        statusCounts[order.status]++;
      });
      console.log('Распределение заказов по статусам:', statusCounts);
      
      setOrders(response);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      showSnackbar('Ошибка при загрузке заказов', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Функция фильтрации заказов
  const filterOrders = () => {
    let result = [...orders];
    
    // Фильтр по статусу (активной вкладке)
    if (activeTab !== 'all') {
      result = result.filter(order => order.status === activeTab);
    }
    
    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        (order._id && order._id.toLowerCase().includes(query)) ||
        (order.client && order.client.name && order.client.name.toLowerCase().includes(query)) ||
        (order.supplier && order.supplier.name && order.supplier.name.toLowerCase().includes(query))
      );
    }
    
    setFilteredOrders(result);
    setPage(0); // Сброс на первую страницу при фильтрации
  };

  // Обработчик смены вкладки
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Обработчик поиска
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Обработчик открытия диалога с деталями заказа
  const handleOpenOrderDialog = (order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  // Обработчик закрытия диалога с деталями заказа
  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  // Обработчик открытия диалога обновления статуса
  const handleOpenUpdateStatusDialog = () => {
    setNewStatus(selectedOrder.status);
    setStatusComment('');
    setUpdateStatusDialogOpen(true);
  };

  // Обработчик закрытия диалога обновления статуса
  const handleCloseUpdateStatusDialog = () => {
    setUpdateStatusDialogOpen(false);
  };

  // Обработчик обновления статуса заказа
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newStatus, statusComment);
      
      // Обновление локального состояния
      const updatedOrders = orders.map(order => 
        order._id === selectedOrder._id 
          ? { ...order, status: newStatus } 
          : order
      );
      
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      
      handleCloseUpdateStatusDialog();
      showSnackbar(`Статус заказа обновлен на "${newStatus}"`);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      showSnackbar('Ошибка при обновлении статуса', 'error');
    }
  };

  // Функция отображения уведомлений
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Обработчик закрытия уведомления
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Обработчики пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Получение цвета для статуса
  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Н/Д';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  // Получение счетчиков для статусов заказов
  const getStatusCounts = () => {
    const counts = {};
    orderStatuses.forEach(status => {
      counts[status.value] = orders.filter(order => order.status === status.value).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Компонент для отображения карточек статистики
  const StatusCards = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['Создан', 'Подтвержден', 'В обработке'].includes(order.status)).length;
    const inTransitOrders = orders.filter(order => 
      ['Отправлен', 'В пути'].includes(order.status)).length;
    const completedOrders = orders.filter(order => 
      ['Доставлен', 'Получен'].includes(order.status)).length;
    const problemOrders = orders.filter(order => 
      ['Отменен', 'Возвращен'].includes(order.status)).length;
    
    const cards = [
      { 
        title: 'Всего заказов', 
        count: totalOrders, 
        icon: <ShoppingCart />, 
        color: 'primary.main' 
      },
      { 
        title: 'Ожидают обработки', 
        count: pendingOrders, 
        icon: <Assignment />, 
        color: 'info.main' 
      },
      { 
        title: 'В пути', 
        count: inTransitOrders, 
        icon: <LocalShipping />, 
        color: 'warning.main' 
      },
      { 
        title: 'Выполнено', 
        count: completedOrders, 
        icon: <CheckCircle />, 
        color: 'success.main' 
      },
      { 
        title: 'Проблемные', 
        count: problemOrders, 
        icon: <Warning />, 
        color: 'error.main' 
      }
    ];
    
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderTop: 3, 
              borderColor: card.color 
            }}>
              <CardContent sx={{ flexGrow: 1, pt: 2, textAlign: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: card.color, 
                  width: 56, 
                  height: 56, 
                  mx: 'auto',
                  mb: 1
                }}>
                  {card.icon}
                </Avatar>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {card.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Управление заказами
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Поиск заказов..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
            />
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={fetchOrders}
              disabled={loading}
            >
              Обновить
            </Button>
          </Box>
        </Box>

        {/* Карточки со статистикой */}
        <StatusCards />

        {/* Вкладки статусов */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge badgeContent={orders.length} color="primary" sx={{ mr: 1 }}>
                    <FilterList />
                  </Badge>
                  Все
                </Box>
              } 
              value="all" 
            />
            {orderStatuses.map(status => (
              <Tab 
                key={status.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge badgeContent={statusCounts[status.value]} color={status.color} sx={{ mr: 1 }}>
                      <FilterList />
                    </Badge>
                    {status.value}
                  </Box>
                } 
                value={status.value} 
              />
            ))}
          </Tabs>
        </Box>

        {/* Таблица заказов */}
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID заказа</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Поставщик</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Info sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Заказы не найдены
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Попробуйте изменить параметры фильтрации или обновить данные
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow 
                      key={order._id}
                      hover
                      sx={{ 
                        '&:hover': { cursor: 'pointer' },
                        backgroundColor: order.status === 'Создан' ? 'rgba(33, 150, 243, 0.08)' : 'inherit'
                      }}
                      onClick={() => handleOpenOrderDialog(order)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <ShoppingCart fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            #{order._id.slice(-6)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {order.client?.name || 'Не указан'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.orderDate || order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {order.totalOrderValue?.toLocaleString('ru-RU', {
                            style: 'currency',
                            currency: 'RUB'
                          }) || 'Н/Д'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          size="small"
                          color={getStatusColor(order.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {order.supplier?.name || 'Не назначен'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Просмотр деталей">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenOrderDialog(order);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} из ${count}`
            }
          />
        </TableContainer>
      </Paper>

      {/* Диалог деталей заказа */}
      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Заказ #{selectedOrder._id.slice(-6)}
                </Typography>
                <Chip 
                  label={selectedOrder.status} 
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Информация о клиенте
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" paragraph>
                        <strong>Клиент:</strong> {selectedOrder.client?.name || 'Не указан'}
                      </Typography>
                      {selectedOrder.client?.email && (
                        <Typography variant="body2" paragraph>
                          <strong>Email:</strong> {selectedOrder.client.email}
                        </Typography>
                      )}
                      {selectedOrder.client?.phone && (
                        <Typography variant="body2" paragraph>
                          <strong>Телефон:</strong> {selectedOrder.client.phone}
                        </Typography>
                      )}
                      {selectedOrder.shippingAddress && (
                        <Typography variant="body2">
                          <strong>Адрес доставки:</strong> {selectedOrder.shippingAddress}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Информация о поставщике
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" paragraph>
                        <strong>Поставщик:</strong> {selectedOrder.supplier?.name || 'Не назначен'}
                      </Typography>
                      {selectedOrder.supplier?.email && (
                        <Typography variant="body2" paragraph>
                          <strong>Email:</strong> {selectedOrder.supplier.email}
                        </Typography>
                      )}
                      {selectedOrder.supplier?.phone && (
                        <Typography variant="body2">
                          <strong>Телефон:</strong> {selectedOrder.supplier.phone}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <EventNote sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Детали заказа
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" paragraph>
                        <strong>Дата заказа:</strong> {formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Статус:</strong> {selectedOrder.status}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Метод оплаты:</strong> {selectedOrder.paymentMethod || 'Не указан'}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Метод доставки:</strong> {selectedOrder.shippingMethod || 'Не указан'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        <strong>Сумма заказа:</strong> {selectedOrder.totalOrderValue?.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB'
                        }) || 'Н/Д'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<Edit />}
                        size="small"
                        onClick={handleOpenUpdateStatusDialog}
                      >
                        Изменить статус
                      </Button>
                    </CardActions>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <ShoppingCart sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Товары
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        <List dense disablePadding>
                          {selectedOrder.products.map((item, index) => (
                            <ListItem key={index} disablePadding sx={{ py: 1 }}>
                              <ListItemText
                                primary={item.product?.name || 'Товар'}
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2">
                                      {`${item.quantity} шт. × ${(item.unitPrice || 0).toLocaleString('ru-RU', {
                                        style: 'currency',
                                        currency: 'RUB'
                                      })}`}
                                    </Typography>
                                  </>
                                }
                              />
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString('ru-RU', {
                                  style: 'currency',
                                  currency: 'RUB'
                                })}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Информация о товарах недоступна
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseOrderDialog} 
                color="inherit"
              >
                Закрыть
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleOpenUpdateStatusDialog}
              >
                Изменить статус
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Диалог обновления статуса */}
      <Dialog
        open={updateStatusDialogOpen}
        onClose={handleCloseUpdateStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Обновить статус заказа</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Статус</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Статус"
            >
              {orderStatuses.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  <Chip 
                    label={status.value} 
                    color={status.color}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {status.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            label="Комментарий (необязательно)"
            fullWidth
            multiline
            rows={3}
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateStatusDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
            disabled={!newStatus}
          >
            Обновить статус
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersManagement; 