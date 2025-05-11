import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  CircularProgress, Chip, Divider, Rating, Tab, Tabs, IconButton,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Alert, Snackbar
} from '@mui/material';
import {
  Phone, Email, LocationOn, Star, StarBorder, Refresh,
  BusinessCenter, AssessmentOutlined, History, Search,
  ContactMail, CheckCircle, Message, Info, Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supplierService, orderService } from '../../services/api';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('inquiry');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const { currentUser } = useAuth();

  // Загрузка поставщиков
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await supplierService.getSuppliers();
        
        // Extract all unique categories from suppliers
        const allCategories = response.reduce((acc, supplier) => {
          if (supplier.categories && Array.isArray(supplier.categories)) {
            supplier.categories.forEach(category => {
              if (!acc.includes(category)) {
                acc.push(category);
              }
            });
          }
          return acc;
        }, []);
        
        setCategories(allCategories);
        setSuppliers(response);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuppliers();
  }, []);

  // Обработчик смены вкладок
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Обработчик выбора поставщика
  const handleSelectSupplier = async (supplier) => {
    setSelectedSupplier(supplier);
    
    try {
      // Fetch supplier performance data
      const performance = await supplierService.getSupplierRating(supplier._id);
      setSupplierPerformance(performance);
      
      // Fetch supplier products
      const products = await supplierService.getSupplierProducts(supplier._id);
      setSupplierProducts(products);
    } catch (error) {
      console.error('Error fetching supplier details:', error);
    }
  };

  // Обработчик открытия диалога контакта
  const handleOpenContactDialog = () => {
    setContactDialogOpen(true);
  };

  // Обработчик закрытия диалога контакта
  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setMessageText('');
    setMessageType('inquiry');
  };

  // Отправка сообщения поставщику
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      return;
    }
    
    try {
      // In a real app, you would call an API to send the message
      // Here we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close dialog and show success message
      handleCloseContactDialog();
      setContactSuccess(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setContactError(true);
    }
  };

  // Обработчик поиска
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Обработчик выбора категории
  const handleCategoryFilter = (event) => {
    setFilterCategory(event.target.value);
  };

  // Открытие диалога оценки
  const handleOpenRatingDialog = () => {
    setNewRating(selectedSupplier.rating || 0);
    setRatingComment('');
    setRatingDialogOpen(true);
  };

  // Закрытие диалога оценки
  const handleCloseRatingDialog = () => {
    setRatingDialogOpen(false);
  };

  // Сохранение новой оценки
  const handleSaveRating = async () => {
    try {
      // In a real app, this would update the rating via API
      // For now, we'll update it locally
      const updatedSuppliers = suppliers.map(supplier => 
        supplier._id === selectedSupplier._id 
          ? { ...supplier, rating: newRating } 
          : supplier
      );
      
      setSuppliers(updatedSuppliers);
      setSelectedSupplier({...selectedSupplier, rating: newRating});
      setRatingDialogOpen(false);
      setContactSuccess(true);
    } catch (error) {
      console.error('Error updating rating:', error);
      setContactError(true);
    }
  };

  // Функция фильтрации поставщиков
  const getFilteredSuppliers = () => {
    return suppliers.filter(supplier => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = filterCategory === '' || 
        (supplier.categories && supplier.categories.includes(filterCategory));
      
      return matchesSearch && matchesCategory;
    });
  };

  // Получение цвета для индикации надежности
  const getReliabilityColor = (reliability) => {
    if (reliability >= 80) return 'success';
    if (reliability >= 60) return 'info';
    if (reliability >= 40) return 'warning';
    return 'error';
  };

  // Форматирование срока доставки с цветом индикации
  const formatDeliveryTime = (days) => {
    let color = 'success.main';
    if (days > 7) color = 'warning.main';
    if (days > 14) color = 'error.main';
    
    return <Typography component="span" color={color}>{days} дней</Typography>;
  };

  // Компонент информации о поставщике
  const SupplierInfo = () => {
    if (!selectedSupplier) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Выберите поставщика из списка для просмотра информации
          </Typography>
        </Box>
      );
    }

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{selectedSupplier.name}</Typography>
            <Box>
              <Rating
                value={selectedSupplier.rating || 0}
                readOnly
                precision={0.5}
              />
              <Button 
                size="small" 
                startIcon={<Star />} 
                onClick={handleOpenRatingDialog}
                sx={{ ml: 1 }}
              >
                Оценить
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Контактная информация
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BusinessCenter fontSize="small" />
                </Avatar>
                <Typography>{selectedSupplier.contactPerson}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Phone fontSize="small" />
                </Avatar>
                <Typography>{selectedSupplier.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Email fontSize="small" />
                </Avatar>
                <Typography>{selectedSupplier.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <LocationOn fontSize="small" />
                </Avatar>
                <Typography>{selectedSupplier.address}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Показатели эффективности
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Надежность:
                  <Chip 
                    size="small" 
                    label={`${selectedSupplier.reliability || 0}%`} 
                    color={getReliabilityColor(selectedSupplier.reliability || 0)} 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Среднее время доставки: {formatDeliveryTime(selectedSupplier.avgDeliveryTime || 0)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Конкурентоспособность цен: {selectedSupplier.priceCompetitiveness || 0}%
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Условия оплаты: {selectedSupplier.paymentTerms || 'Не указаны'}
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Категории товаров
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedSupplier.categories && selectedSupplier.categories.map((category, idx) => (
                  <Chip 
                    key={idx}
                    label={category}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {(!selectedSupplier.categories || selectedSupplier.categories.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Категории не указаны
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained"
              startIcon={<ContactMail />}
              onClick={handleOpenContactDialog}
            >
              Связаться с поставщиком
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Компонент производительности поставщика
  const SupplierPerformance = () => {
    if (!selectedSupplier) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Выберите поставщика из списка для просмотра производительности
          </Typography>
        </Box>
      );
    }

    // Если нет данных о производительности
    if (!selectedSupplier.performanceHistory || selectedSupplier.performanceHistory.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Info color="info" sx={{ fontSize: 60, opacity: 0.6, mb: 2 }} />
          <Typography variant="h6">
            Данные о производительности отсутствуют
          </Typography>
          <Typography variant="body2" color="text.secondary">
            У этого поставщика пока нет истории производительности
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          История производительности
        </Typography>
        
        <Box sx={{ height: 250, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, borderRadius: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <AssessmentOutlined sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6 }} />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Здесь будет график производительности
            </Typography>
          </Box>
        </Box>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Период</TableCell>
                <TableCell align="right">Всего заказов</TableCell>
                <TableCell align="right">Своевременные доставки</TableCell>
                <TableCell align="right">Просроченные доставки</TableCell>
                <TableCell align="right">Проблемы с качеством</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedSupplier.performanceHistory.map((record, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">{record.month}</TableCell>
                  <TableCell align="right">{record.totalOrders}</TableCell>
                  <TableCell align="right">
                    {record.onTimeDelivery}
                    <Chip 
                      size="small" 
                      label={`${Math.round((record.onTimeDelivery / record.totalOrders) * 100)}%`}
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {record.lateDelivery}
                    <Chip 
                      size="small" 
                      label={`${Math.round((record.lateDelivery / record.totalOrders) * 100)}%`}
                      color={record.lateDelivery > 0 ? "warning" : "success"}
                      sx={{ ml:.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {record.qualityIssues}
                    <Chip 
                      size="small" 
                      label={`${Math.round((record.qualityIssues / record.totalOrders) * 100)}%`}
                      color={record.qualityIssues > 0 ? "error" : "success"}
                      sx={{ ml: .5 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Компонент продуктов поставщика
  const SupplierProducts = () => {
    if (!selectedSupplier) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Выберите поставщика из списка для просмотра продуктов
          </Typography>
        </Box>
      );
    }

    if (!supplierProducts || supplierProducts.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Info color="info" sx={{ fontSize: 60, opacity: 0.6, mb: 2 }} />
          <Typography variant="h6">
            Товары отсутствуют
          </Typography>
          <Typography variant="body2" color="text.secondary">
            У этого поставщика пока нет товаров в каталоге
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {supplierProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" noWrap>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.category}
                </Typography>
                <Typography variant="body1" color="primary.main" sx={{ mt: 1, mb: 2, fontWeight: 'bold' }}>
                  {product.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : 'Описание отсутствует'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip 
                    label={product.inStock ? 'В наличии' : 'Нет в наличии'} 
                    color={product.inStock ? 'success' : 'error'} 
                    size="small" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    SKU: {product.sku || 'Н/Д'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Управление поставщиками
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Поиск поставщиков..."
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Категория</InputLabel>
              <Select
                value={filterCategory}
                onChange={handleCategoryFilter}
                label="Категория"
              >
                <MenuItem value="">Все категории</MenuItem>
                {categories.map((category, idx) => (
                  <MenuItem key={idx} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Обновить
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Список поставщиков */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Поставщики
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : getFilteredSuppliers().length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="Поставщики не найдены" 
                      secondary="Попробуйте изменить параметры поиска"
                    />
                  </ListItem>
                ) : (
                  getFilteredSuppliers().map((supplier, index) => (
                    <React.Fragment key={supplier._id}>
                      <ListItem 
                        button
                        selected={selectedSupplier && selectedSupplier._id === supplier._id}
                        onClick={() => handleSelectSupplier(supplier)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {supplier.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={supplier.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {supplier.contactPerson}
                              </Typography>
                              {` — ${supplier.categories ? supplier.categories.join(', ') : 'Нет категорий'}`}
                            </>
                          }
                        />
                        <Box>
                          <Rating value={supplier.rating || 0} readOnly size="small" />
                          <Typography variant="caption" display="block" align="right">
                            {supplier.reliability || 0}% надежность
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < getFilteredSuppliers().length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Grid>

          {/* Информация о поставщике */}
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Информация" />
                <Tab label="Производительность" />
                <Tab label="Товары" />
              </Tabs>
            </Box>
            
            {tabValue === 0 && <SupplierInfo />}
            {tabValue === 1 && <SupplierPerformance />}
            {tabValue === 2 && <SupplierProducts />}
          </Grid>
        </Grid>
      </Paper>

      {/* Диалог отправки сообщения */}
      <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Связаться с поставщиком</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              Поставщик: {selectedSupplier?.name}
            </Typography>
            <Typography variant="body2">
              Контактное лицо: {selectedSupplier?.contactPerson}
            </Typography>
          </Box>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип сообщения</InputLabel>
            <Select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              label="Тип сообщения"
            >
              <MenuItem value="inquiry">Запрос информации</MenuItem>
              <MenuItem value="order">Вопрос по заказу</MenuItem>
              <MenuItem value="complaint">Жалоба</MenuItem>
              <MenuItem value="cooperation">Предложение о сотрудничестве</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            autoFocus
            margin="normal"
            label="Сообщение"
            fullWidth
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>Отмена</Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained" 
            color="primary"
            disabled={!messageText.trim()}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог оценки поставщика */}
      <Dialog open={ratingDialogOpen} onClose={handleCloseRatingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Оценка поставщика</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              Поставщик: {selectedSupplier?.name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3, flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>
              Ваша оценка:
            </Typography>
            <Rating
              value={newRating}
              onChange={(event, newValue) => {
                setNewRating(newValue);
              }}
              precision={0.5}
              size="large"
            />
          </Box>
          
          <TextField
            margin="normal"
            label="Комментарий к оценке"
            fullWidth
            multiline
            rows={3}
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingDialog}>Отмена</Button>
          <Button 
            onClick={handleSaveRating} 
            variant="contained" 
            color="primary"
            disabled={newRating === 0}
          >
            Сохранить оценку
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомления */}
      <Snackbar 
        open={contactSuccess} 
        autoHideDuration={6000} 
        onClose={() => setContactSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setContactSuccess(false)} severity="success">
          Операция выполнена успешно!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={contactError} 
        autoHideDuration={6000} 
        onClose={() => setContactError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setContactError(false)} severity="error">
          Ошибка! Пожалуйста, попробуйте снова.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SupplierManagement; 