import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, IconButton, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress
} from '@mui/material';
import { Search, Visibility, Edit, LocalShipping, Schedule } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const ORDER_STATUSES = {
    'Создан': { color: 'default', icon: <Schedule fontSize="small" /> },
    'Подтвержден': { color: 'info', icon: <Edit fontSize="small" /> },
    'В обработке': { color: 'primary', icon: <Edit fontSize="small" /> },
    'Отправлен': { color: 'warning', icon: <LocalShipping fontSize="small" /> },
    'В пути': { color: 'warning', icon: <LocalShipping fontSize="small" /> },
    'Доставлен': { color: 'success', icon: <LocalShipping fontSize="small" /> },
    'Отменен': { color: 'error', icon: <Schedule fontSize="small" /> },
    'Получен': { color: 'success', icon: <Schedule fontSize="small" /> }
};

// Разрешенные статусы для обновления поставщиком
const SUPPLIER_ALLOWED_STATUSES = ['В обработке', 'Отправлен'];

const SupplierOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusDialog, setStatusDialog] = useState({
        open: false,
        order: null,
        newStatus: '',
        comment: '',
        location: ''
    });
    const [detailsDialog, setDetailsDialog] = useState({
        open: false,
        order: null
    });
    
    const { currentUser, token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    
    useEffect(() => {
        fetchOrders();
    }, []);
    
    useEffect(() => {
        filterOrders();
    }, [orders, filter, searchTerm]);
    
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Загружаем только заказы, относящиеся к поставщику
            const response = await axios.get('/api/orders/supplier', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setOrders(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Не удалось загрузить заказы. Пожалуйста, попробуйте позже.');
            enqueueSnackbar('Ошибка при загрузке заказов', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    const filterOrders = () => {
        let result = [...orders];
        
        // Фильтрация по статусу
        if (filter !== 'all') {
            result = result.filter(order => order.status === filter);
        }
        
        // Поиск по ID заказа или имени клиента
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(order => 
                order._id.toLowerCase().includes(term) || 
                (order.client && order.client.name && order.client.name.toLowerCase().includes(term))
            );
        }
        
        setFilteredOrders(result);
    };
    
    const handleStatusChange = (order) => {
        setStatusDialog({
            open: true,
            order,
            newStatus: '',
            comment: '',
            location: ''
        });
    };
    
    const handleDetailsView = (order) => {
        setDetailsDialog({
            open: true,
            order
        });
    };
    
    const handleStatusDialogChange = (e) => {
        const { name, value } = e.target;
        setStatusDialog(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const updateOrderStatus = async () => {
        const { order, newStatus, comment, location } = statusDialog;
        
        if (!newStatus) {
            enqueueSnackbar('Выберите новый статус', { variant: 'warning' });
            return;
        }
        
        try {
            await axios.patch(`/api/orders/${order._id}/status`, {
                status: newStatus,
                comment,
                location
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Обновляем заказ в локальном состоянии
            setOrders(prevOrders => 
                prevOrders.map(o => 
                    o._id === order._id 
                        ? { ...o, status: newStatus } 
                        : o
                )
            );
            
            enqueueSnackbar(`Статус заказа обновлен: ${newStatus}`, { variant: 'success' });
            setStatusDialog(prev => ({ ...prev, open: false }));
            
        } catch (err) {
            console.error('Error updating order status:', err);
            enqueueSnackbar('Ошибка при обновлении статуса', { variant: 'error' });
        }
    };
    
    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };
    
    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price || 0);
    };
    
    return (
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Заказы поставщика
            </Typography>
            
            {/* Панель фильтров и поиска */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="status-filter-label">Статус заказа</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            label="Статус заказа"
                            size="small"
                        >
                            <MenuItem value="all">Все заказы</MenuItem>
                            {Object.keys(ORDER_STATUSES).map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <TextField
                            placeholder="Поиск по ID или клиенту"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: <Search color="action" sx={{ mr: 1 }} />
                            }}
                        />
                    </Box>
                    
                    <Button 
                        variant="outlined" 
                        onClick={fetchOrders}
                    >
                        Обновить
                    </Button>
                </Box>
            </Paper>
            
            {/* Таблица заказов */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID заказа</TableCell>
                                    <TableCell>Клиент</TableCell>
                                    <TableCell>Дата заказа</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell align="right">Сумма</TableCell>
                                    <TableCell align="center">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {error || 'Заказы не найдены'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES['Создан'];
                                        const canUpdateStatus = SUPPLIER_ALLOWED_STATUSES.includes(order.status) || 
                                                               (order.status === 'Создан' && SUPPLIER_ALLOWED_STATUSES.includes('В обработке'));
                                        
                                        return (
                                            <TableRow key={order._id} hover>
                                                <TableCell component="th" scope="row">
                                                    {order._id.slice(-6).toUpperCase()}
                                                </TableCell>
                                                <TableCell>{order.client?.name || '—'}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        icon={statusInfo.icon}
                                                        label={order.status}
                                                        color={statusInfo.color}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatPrice(order.totalOrderValue)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDetailsView(order)}
                                                        title="Просмотр заказа"
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                    
                                                    {canUpdateStatus && (
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleStatusChange(order)}
                                                            title="Обновить статус"
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
            
            {/* Диалог изменения статуса */}
            <Dialog 
                open={statusDialog.open} 
                onClose={() => setStatusDialog(prev => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Обновление статуса заказа</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Новый статус</InputLabel>
                        <Select
                            name="newStatus"
                            value={statusDialog.newStatus}
                            onChange={handleStatusDialogChange}
                            label="Новый статус"
                        >
                            {SUPPLIER_ALLOWED_STATUSES.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField
                        label="Комментарий"
                        name="comment"
                        value={statusDialog.comment}
                        onChange={handleStatusDialogChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    
                    {statusDialog.newStatus === 'Отправлен' && (
                        <TextField
                            label="Местоположение (для отслеживания)"
                            name="location"
                            value={statusDialog.location}
                            onChange={handleStatusDialogChange}
                            fullWidth
                            margin="normal"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(prev => ({ ...prev, open: false }))}>
                        Отмена
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={updateOrderStatus} 
                        disabled={!statusDialog.newStatus}
                    >
                        Обновить
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Диалог просмотра деталей заказа */}
            <Dialog 
                open={detailsDialog.open} 
                onClose={() => setDetailsDialog(prev => ({ ...prev, open: false }))}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Детали заказа #{detailsDialog.order?._id.slice(-6).toUpperCase()}
                </DialogTitle>
                <DialogContent dividers>
                    {detailsDialog.order && (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Информация о заказе
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Дата создания:</strong> {formatDate(detailsDialog.order.createdAt)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Статус:</strong> {detailsDialog.order.status}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Клиент:</strong> {detailsDialog.order.client?.name || '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Адрес доставки:</strong> {detailsDialog.order.shippingAddress || '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Способ оплаты:</strong> {detailsDialog.order.paymentMethod || '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Способ доставки:</strong> {detailsDialog.order.shippingMethod || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Typography variant="subtitle1" gutterBottom>
                                Товары
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Наименование</TableCell>
                                            <TableCell align="right">Цена</TableCell>
                                            <TableCell align="center">Количество</TableCell>
                                            <TableCell align="right">Сумма</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {detailsDialog.order.products.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {item.product?.name || 'Товар недоступен'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatPrice(item.unitPrice)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatPrice(item.totalPrice)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right">
                                                <Typography variant="subtitle2">Итого:</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle2">
                                                    {formatPrice(detailsDialog.order.totalOrderValue)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {detailsDialog.order.notes && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2">Примечания к заказу:</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {detailsDialog.order.notes}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialog(prev => ({ ...prev, open: false }))}>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SupplierOrders; 