import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    IconButton,
    Chip,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tooltip,
    CircularProgress,
    Card,
    CardContent,
    LinearProgress,
    Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Refresh from '@mui/icons-material/Refresh';

import { orderService, analyticsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import OrderTrackingModal from '../../components/Forms/OrderTrackingModal';

// Функция для экспорта данных в CSV
const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;

    // Определяем заголовки CSV файла из ключей первого объекта
    const headers = Object.keys(data[0]);
    
    // Формируем строки данных
    const csvRows = [];
    // Заголовок
    csvRows.push(headers.join(','));
    
    // Данные
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Экранируем кавычками строковые значения с запятыми
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value !== null && value !== undefined ? value : '';
        });
        csvRows.push(values.join(','));
    }

    // Собираем файл
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    if (link.download !== undefined) {
        // Создаем URL объект
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const SupplierOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openTrackingModal, setOpenTrackingModal] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        startDate: null,
        endDate: null,
        search: '',
        sortBy: 'createdAt',
        sortDirection: 'desc', 
    });
    const [metrics, setMetrics] = useState({
        totalOrders: 0,
        onTimeDeliveryPercentage: 0,
        averageProcessingTime: 0,
        revenueGrowth: 0,
    });

    const { currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Загрузка заказов и метрик
    const loadData = useCallback(async () => {
        if (!currentUser || !currentUser._id) return;

        setLoading(true);
        setError(null);
        try {
            // Загружаем одновременно заказы и метрики
            const [ordersResponse, metricsResponse] = await Promise.all([
                orderService.getSupplierOrders(),
                orderService.getSupplierMetrics(currentUser._id) // Вызываем с ID пользователя
            ]);

            console.log('Supplier orders response:', ordersResponse);
            
            // Handle different response formats
            let ordersList = [];
            if (Array.isArray(ordersResponse)) {
                ordersList = ordersResponse;
            } else if (ordersResponse && Array.isArray(ordersResponse.orders)) {
                ordersList = ordersResponse.orders;
            } else if (ordersResponse && typeof ordersResponse === 'object') {
                ordersList = [ordersResponse]; // Single order object
            }
            
            console.log('Processed orders list:', ordersList.map(order => ({
                id: order._id,
                client: order.client?.name,
                date: order.orderDate || order.createdAt,
                total: order.totalOrderValue || order.totalAmount,
                status: order.status
            })));
            
            setOrders(ordersList);

            if (metricsResponse && metricsResponse.success && metricsResponse.data) {
                // Устанавливаем метрики из ответа API
                // Бэкенд теперь возвращает объект data с нужными полями 
                // (totalOrders, onTimeDeliveryPercentage, averageProcessingTime, revenueGrowth, totalRevenue)
                setMetrics({
                    totalOrders: metricsResponse.data.totalOrders || 0,
                    onTimeDeliveryPercentage: metricsResponse.data.onTimeDeliveryPercentage || 0,
                    averageProcessingTime: metricsResponse.data.averageProcessingTime || 0, // Пока что 0 с бэкенда
                    revenueGrowth: metricsResponse.data.revenueGrowth || 0, // Пока что 0 с бэкенда
                    totalRevenue: metricsResponse.data.totalRevenue || 0 // Можно отображать где-то, если нужно
                });
            } else {
                // Если метрики не пришли или ошибка
                console.error('Error fetching or processing supplier metrics:', metricsResponse);
                setMetrics({
                    totalOrders: ordersResponse?.length || 0, // Посчитаем хотя бы кол-во загруженных заказов
                    onTimeDeliveryPercentage: 0,
                    averageProcessingTime: 0,
                    revenueGrowth: 0,
                });
            }

        } catch (error) {
            setError('Ошибка при загрузке данных');
            console.error('Error in loadData:', error);
            enqueueSnackbar('Не удалось загрузить данные', { variant: 'error' });
            setMetrics({ totalOrders: 0, onTimeDeliveryPercentage: 0, averageProcessingTime: 0, revenueGrowth: 0 });
        }
        setLoading(false);
    }, [currentUser, enqueueSnackbar]);

    useEffect(() => {
        loadData();
        
        // Set up polling to refresh data every 15 seconds
        const intervalId = setInterval(() => {
            loadData();
        }, 15000);
        
        return () => clearInterval(intervalId);
    }, [loadData]);

    // Function to force refresh data
    const handleRefresh = () => {
        enqueueSnackbar('Обновление данных...', { variant: 'info' });
        loadData();
    };

    // Обработчики пагинации
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Обработчики фильтров
    const handleFilterChange = (field) => (event) => {
        setFilters(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setPage(0);
    };

    const handleDateChange = (field) => (date) => {
        setFilters(prev => ({
            ...prev,
            [field]: date
        }));
        setPage(0);
    };

    // Обработчики диалога
    const handleOpenDialog = (order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
    };

    // Обновление статуса заказа
    const handleStatusUpdate = async (orderId, newStatus, comment = '') => {
        try {
            console.log('Updating order status:', { orderId, newStatus, comment });
            await orderService.updateOrderStatus(orderId, newStatus, comment);
            loadData();
            if (openDialog) handleCloseDialog();
            enqueueSnackbar(`Статус заказа успешно обновлен на "${newStatus}"`, { variant: 'success' });
        } catch (error) {
            console.error('Error updating order status:', error);
            enqueueSnackbar(`Ошибка при обновлении статуса: ${error.message || 'Неизвестная ошибка'}`, { variant: 'error' });
        }
    };
    
    // Обработчик для кнопки "В обработке"
    const handleSetInProcess = (orderId) => {
        handleStatusUpdate(orderId, 'В обработке', 'Заказ взят в обработку поставщиком');
    };
    
    // Обработчик для кнопки "Отправлен"
    const handleSetShipped = (orderId) => {
        handleStatusUpdate(orderId, 'Отправлен', 'Заказ отправлен поставщиком');
    };

    // Получение цвета для статуса
    const getStatusColor = (status) => {
        const statusColors = {
            'Создан': 'default',
            'Подтвержден': 'primary',
            'В обработке': 'info',
            'Отправлен': 'warning',
            'В пути': 'warning',
            'Доставлен': 'success',
            'Получен': 'success',
            'Отменен': 'error',
            'Возвращен': 'error'
        };
        return statusColors[status] || 'default';
    };

    // Новая функция для экспорта заказов
    const handleExportOrders = () => {
        // Подготовим данные для экспорта
        const ordersToExport = orders.map(order => ({
            'ID Заказа': order._id,
            'Клиент': order.client?.name || '',
            'Дата создания': new Date(order.createdAt).toLocaleString('ru-RU'),
            'Статус': order.status,
            'Сумма': order.totalAmount,
            'Количество товаров': order.items?.length || 0,
            'Адрес доставки': order.shippingAddress || '',
            'Дата доставки': order.deliveryDate ? new Date(order.deliveryDate).toLocaleString('ru-RU') : ''
        }));
        
        exportToCSV(ordersToExport, `Заказы_${new Date().toISOString().split('T')[0]}.csv`);
        enqueueSnackbar('Заказы успешно экспортированы', { variant: 'success' });
    };

    // Обработчики для модального окна отслеживания
    const handleOpenTrackingModal = (order) => {
        setSelectedOrder(order);
        setOpenTrackingModal(true);
    };

    const handleCloseTrackingModal = () => {
        setOpenTrackingModal(false);
        setSelectedOrder(null);
    };

    const handleTrackingSubmit = async (trackingData) => {
        setTrackingLoading(true);
        try {
            await orderService.updateOrderTracking(selectedOrder._id, trackingData);
            
            // Обновляем заказ локально до перезагрузки всех заказов
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === selectedOrder._id 
                        ? { ...order, tracking: trackingData } 
                        : order
                )
            );
            
            handleCloseTrackingModal();
            enqueueSnackbar('Информация отслеживания обновлена', { variant: 'success' });
            
            // Перезагружаем данные, чтобы синхронизировать с сервером
            loadData();
        } catch (error) {
            console.error('Error updating tracking info:', error);
            enqueueSnackbar('Ошибка при обновлении информации отслеживания', { variant: 'error' });
        } finally {
            setTrackingLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Метрики */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Всего заказов
                            </Typography>
                            <Typography variant="h4">
                                {metrics.totalOrders}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Выполнено в срок (%)
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h4" sx={{ mr: 1 }}>
                                    {metrics.onTimeDeliveryPercentage}%
                                </Typography>
                                {metrics.onTimeDeliveryPercentage >= 90 ? (
                                    <TrendingUpIcon color="success" />
                                ) : metrics.onTimeDeliveryPercentage >= 70 ? (
                                    <TimelineIcon color="warning" />
                                ) : (
                                    <TrendingDownIcon color="error" />
                                )}
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.onTimeDeliveryPercentage}
                                sx={{ mt: 1 }}
                                color={
                                    metrics.onTimeDeliveryPercentage >= 90
                                        ? 'success'
                                        : metrics.onTimeDeliveryPercentage >= 70
                                        ? 'warning'
                                        : 'error'
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>
                
                 
            </Grid>

            {/* Фильтры и заголовок */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                        Управление заказами
                    </Typography>
                    <Box>
                        <Button 
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            sx={{ mr: 1 }}
                        >
                            Обновить
                        </Button>
                        <Button 
                            startIcon={<FilterListIcon />}
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            sx={{ mr: 1 }}
                        >
                            Фильтры
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<FileDownloadIcon />}
                            onClick={handleExportOrders}
                            disabled={orders.length === 0 || loading}
                        >
                            Экспорт
                        </Button>
                    </Box>
                </Box>

                <Collapse in={filtersExpanded} timeout="auto">
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                                margin="dense"
                                label="Поиск по заказу"
                                name="search"
                            value={filters.search}
                            onChange={handleFilterChange('search')}
                                placeholder="ID или имя клиента"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth margin="dense">
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={handleFilterChange('status')}
                                label="Статус"
                            >
                                    <MenuItem value="">Все статусы</MenuItem>
                                    <MenuItem value="Создан">Создан</MenuItem>
                                <MenuItem value="Подтвержден">Подтвержден</MenuItem>
                                <MenuItem value="В обработке">В обработке</MenuItem>
                                <MenuItem value="Отправлен">Отправлен</MenuItem>
                                <MenuItem value="В пути">В пути</MenuItem>
                                <MenuItem value="Доставлен">Доставлен</MenuItem>
                                    <MenuItem value="Получен">Получен</MenuItem>
                                    <MenuItem value="Отменен">Отменен</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Сортировать по</InputLabel>
                                <Select
                                    value={filters.sortBy}
                                    onChange={handleFilterChange('sortBy')}
                                    label="Сортировать по"
                                >
                                    <MenuItem value="createdAt">Дате создания</MenuItem>
                                    <MenuItem value="totalAmount">Сумме</MenuItem>
                                    <MenuItem value="status">Статусу</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Направление</InputLabel>
                                <Select
                                    value={filters.sortDirection}
                                    onChange={handleFilterChange('sortDirection')}
                                    label="Направление"
                                >
                                    <MenuItem value="asc">По возрастанию</MenuItem>
                                    <MenuItem value="desc">По убыванию</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                        
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                    label="С даты"
                                value={filters.startDate}
                                onChange={handleDateChange('startDate')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                            margin: "dense"
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                    label="По дату"
                                value={filters.endDate}
                                onChange={handleDateChange('endDate')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                            margin: "dense"
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                        
                        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button 
                                variant="contained" 
                                onClick={() => {
                                    loadData();
                                    setPage(0);
                                }} 
                                sx={{ mt: 1 }}
                            >
                                Применить фильтры
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => {
                                    setFilters({
                                        status: '',
                                        startDate: null,
                                        endDate: null,
                                        search: '',
                                        sortBy: 'createdAt',
                                        sortDirection: 'desc'
                                    });
                                    loadData();
                                    setPage(0);
                                }} 
                                sx={{ mt: 1, ml: 2 }}
                            >
                                Сбросить
                            </Button>
                        </Grid>
                </Grid>
                </Collapse>
            </Paper>

            {/* Таблица заказов */}
            <TableContainer component={Paper}>
                <Table>
                        <TableHead>
                            <TableRow>
                            <TableCell>№ Заказа</TableCell>
                                <TableCell>Клиент</TableCell>
                            <TableCell>Дата</TableCell>
                            <TableCell>Сумма</TableCell>
                                <TableCell>Статус</TableCell>
                            <TableCell>Отслеживание</TableCell>
                            <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                        ) : orders.length > 0 ? (
                                orders
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order._id ? order._id.substring(0, 8) : 'Н/Д'}...</TableCell>
                                            <TableCell>{order.client?.name || 'Н/Д'}</TableCell>
                                            <TableCell>
                                            {order.orderDate 
                                                ? new Date(order.orderDate).toLocaleDateString('ru-RU') 
                                                : order.createdAt 
                                                    ? new Date(order.createdAt).toLocaleDateString('ru-RU')
                                                    : 'Н/Д'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {(order.totalOrderValue || order.totalAmount) 
                                                ? `${(order.totalOrderValue || order.totalAmount).toLocaleString('ru-RU')} ₽` 
                                                : 'Н/Д'
                                            }
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                label={order.status || 'Н/Д'} 
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                            {order.tracking?.trackingNumber || order.trackingNumber ? (
                                                <Tooltip title={`${order.tracking?.carrier || 'Перевозчик'}: ${order.tracking?.trackingNumber || order.trackingNumber}`}>
                                                    <Chip 
                                                        icon={<TrackChangesIcon />}
                                                        label={order.tracking?.status === 'delivered' ? 'Доставлено' : 'Отслеживается'} 
                                                        color={order.tracking?.status === 'delivered' ? 'success' : 'primary'}
                                                        size="small"
                                                        onClick={() => handleOpenTrackingModal(order)}
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Button 
                                                    size="small" 
                                                    startIcon={<TrackChangesIcon />}
                                                    onClick={() => handleOpenTrackingModal(order)}
                                                >
                                                    Добавить
                                                </Button>
                                                )}
                                            </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(order)}
                                                    title="Просмотр заказа"
                                                    >
                                                    <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                
                                                {/* Показываем кнопки в зависимости от статуса заказа */}
                                                {order.status === 'Подтвержден' && (
                                                        <IconButton
                                                            size="small"
                                                        onClick={() => handleSetInProcess(order._id)}
                                                            color="primary"
                                                        title="Взять в обработку"
                                                        >
                                                        <AssignmentTurnedInIcon fontSize="small" />
                                                        </IconButton>
                                                )}
                                                
                                                {order.status === 'В обработке' && (
                                                        <IconButton
                                                            size="small"
                                                        onClick={() => handleSetShipped(order._id)}
                                                            color="primary"
                                                        title="Отправить заказ"
                                                        >
                                                        <LocalShippingIcon fontSize="small" />
                                                        </IconButton>
                                                )}
                                            </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Заказы не найдены
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={orders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Строк на странице:"
                />
            </TableContainer>

            {/* Модальное окно заказа */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Детали заказа {selectedOrder?._id}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedOrder && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Информация о клиенте
                                </Typography>
                                <Typography variant="body1">
                                    {selectedOrder.client?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedOrder.client?.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedOrder.client?.phone}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Информация о заказе
                                </Typography>
                                <Typography variant="body2">
                                    Дата заказа: {new Date(selectedOrder.orderDate).toLocaleDateString('ru-RU')}
                                </Typography>
                                <Typography variant="body2">
                                    Статус: <Chip
                                        label={selectedOrder.status}
                                        color={getStatusColor(selectedOrder.status)}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                </Typography>
                                <Typography variant="body2">
                                    Сумма: {selectedOrder.totalOrderValue.toLocaleString('ru-RU', {
                                        style: 'currency',
                                        currency: 'RUB'
                                    })}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Товары
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Наименование</TableCell>
                                                <TableCell align="right">Количество</TableCell>
                                                <TableCell align="right">Цена</TableCell>
                                                <TableCell align="right">Сумма</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.products.map((item) => (
                                                <TableRow key={item.product._id}>
                                                    <TableCell>{item.product.name}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">
                                                        {item.unitPrice.toLocaleString('ru-RU', {
                                                            style: 'currency',
                                                            currency: 'RUB'
                                                        })}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.totalPrice.toLocaleString('ru-RU', {
                                                            style: 'currency',
                                                            currency: 'RUB'
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    История статусов
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Дата</TableCell>
                                                <TableCell>Статус</TableCell>
                                                <TableCell>Комментарий</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.statusHistory.map((history, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {new Date(history.timestamp).toLocaleString('ru-RU')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={history.status}
                                                            color={getStatusColor(history.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{history.comment}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedOrder?.status === 'Подтвержден' && (
                        <Button
                            onClick={() => handleSetInProcess(selectedOrder._id)}
                            startIcon={<AssignmentTurnedInIcon />}
                            color="primary"
                        >
                            Начать обработку
                        </Button>
                    )}
                    {selectedOrder?.status === 'В обработке' && (
                        <Button
                            onClick={() => handleSetShipped(selectedOrder._id)}
                            startIcon={<LocalShippingIcon />}
                            color="primary"
                        >
                            Отправить
                        </Button>
                    )}
                    <Button onClick={handleCloseDialog}>Закрыть</Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно для отслеживания */}
            <OrderTrackingModal 
                open={openTrackingModal}
                onClose={handleCloseTrackingModal}
                onSubmit={handleTrackingSubmit}
                order={selectedOrder}
                isLoading={trackingLoading}
            />
        </Container>
    );
};

export default SupplierOrders; 