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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import api from '../../services/api';
import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        startDate: null,
        endDate: null,
        search: '',
    });
    const [isAssigningClient, setIsAssigningClient] = useState(false);
    const [clientOptions, setClientOptions] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');

    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Загрузка заказов
    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getOrders(filters);
            console.log("Loaded orders:", response);
            
            // Проверяем структуру данных клиента
            if (response && response.length > 0) {
                response.forEach(order => {
                    console.log(`Order ${order._id} client:`, order.client);
                });
            }
            
            setOrders(response);
        } catch (error) {
            setError('Ошибка при загрузке заказов');
            enqueueSnackbar('Не удалось загрузить заказы', { variant: 'error' });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, [filters]);

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

    // Обновление статуса заказа (вызывается кнопками в строке)
    const handleUpdateStatusDirectly = async (orderId, newStatus) => {
        try {
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
            ); // Оптимистичное обновление
            
            await orderService.updateOrderStatus(orderId, newStatus);
            enqueueSnackbar(`Статус заказа ${orderId.slice(-6)} обновлен на "${newStatus}"`, { variant: 'success' });
            // Перезагрузка не всегда нужна после оптимистичного обновления,
            // но может потребоваться, если статус влияет на доступные действия
            // loadOrders(); 
        } catch (error) {
            enqueueSnackbar('Ошибка при обновлении статуса', { variant: 'error' });
            // Откатываем оптимистичное обновление при ошибке
            loadOrders(); 
        }
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
    console.log('orders', orders);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Заголовок и фильтры */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Управление заказами
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Поиск"
                            variant="outlined"
                            value={filters.search}
                            onChange={handleFilterChange('search')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={handleFilterChange('status')}
                                label="Статус"
                            >
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="Создан">Создан</MenuItem>
                                <MenuItem value="Подтвержден">Подтвержден</MenuItem>
                                <MenuItem value="В обработке">В обработке</MenuItem>
                                <MenuItem value="Отправлен">Отправлен</MenuItem>
                                <MenuItem value="В пути">В пути</MenuItem>
                                <MenuItem value="Доставлен">Доставлен</MenuItem>
                                <MenuItem value="Получен">Получен</MenuItem>
                                <MenuItem value="Отменен">Отменен</MenuItem>
                                <MenuItem value="Возвращен">Возвращен</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="От"
                                value={filters.startDate}
                                onChange={handleDateChange('startDate')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        variant: 'outlined'
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="До"
                                value={filters.endDate}
                                onChange={handleDateChange('endDate')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        variant: 'outlined'
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
            </Box>

            {/* Таблица заказов */}
            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID заказа</TableCell>
                                <TableCell>Клиент</TableCell>
                                <TableCell>Поставщик</TableCell>
                                <TableCell>Дата заказа</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Сумма</TableCell>
                                <TableCell align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Alert severity="error">{error}</Alert>
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Заказы не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((order) => (
                                        <TableRow
                                            hover
                                            key={order._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {order._id.slice(-6)}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    // Error display for missing client or test admin
                                                    if (!order.client) {
                                                        return <span style={{ color: 'red' }}>Ошибка: клиент отсутствует</span>;
                                                    }
                                                    
                                                    // Display for test admin or error cases
                                                    if (
                                                        order.client.isTestUser || 
                                                        order.client.missingClient ||
                                                        order.client.missingClientData ||
                                                        order.client.name?.includes('[ОШИБКА') ||
                                                        order.client.name?.includes('TEST ADMIN') || 
                                                        order.client.name === 'Администратор Системы'
                                                    ) {
                                                        return <span style={{ color: 'red' }}>{order.client.name || 'Ошибка данных клиента'}</span>;
                                                    }
                                                    
                                                    // Normal client display
                                                    return order.client.name || 'Не указан';
                                                })()}
                                            </TableCell>
                                            <TableCell>{order.supplier?.name || 'Н/Д'}</TableCell>
                                            <TableCell>
                                                {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status}
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {order.totalOrderValue.toLocaleString('ru-RU', {
                                                    style: 'currency',
                                                    currency: 'RUB'
                                                })}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Просмотр деталей">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(order)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {order.status === 'Создан' && (
                                                    <Tooltip title="Подтвердить заказ">
                                                        <IconButton 
                                                            size="small" 
                                                            color="success"
                                                            onClick={() => handleUpdateStatusDirectly(order._id, 'Подтвержден')}
                                                        >
                                                            <CheckCircleOutlineIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={orders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Строк на странице:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`
                    }
                />
            </Paper>

            {/* Диалог деталей заказа */}
            {selectedOrder && (
                <Dialog 
                    open={openDialog} 
                    onClose={handleCloseDialog} 
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Детали заказа #{selectedOrder._id.slice(-6)}</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Клиент</Typography>
                                {(() => {
                                    // Error display for missing client or test admin
                                    if (!selectedOrder.client) {
                                        return <Typography color="error">Ошибка: клиент отсутствует</Typography>;
                                    }
                                    
                                    // Display for test admin or error cases
                                    if (
                                        selectedOrder.client.isTestUser || 
                                        selectedOrder.client.missingClient ||
                                        selectedOrder.client.missingClientData ||
                                        selectedOrder.client.name?.includes('[ОШИБКА') ||
                                        selectedOrder.client.name?.includes('TEST ADMIN') || 
                                        selectedOrder.client.name === 'Администратор Системы'
                                    ) {
                                        return (
                                            <>
                                                <Typography color="error">
                                                    {selectedOrder.client.name || 'Ошибка данных клиента'}
                                                </Typography>
                                                <Typography variant="body2" color="error">
                                                    Ошибка: данные клиента недоступны
                                                </Typography>
                                            </>
                                        );
                                    }
                                    
                                    // Normal client display
                                    return (
                                        <>
                                            <Typography>
                                                {selectedOrder.client.name || 'Не указан'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedOrder.client.email || 'Email не указан'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedOrder.client.phone || 'Телефон не указан'}
                                            </Typography>
                                        </>
                                    );
                                })()}
                            </Grid>
                             <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Поставщик</Typography>
                                <Typography>{selectedOrder.supplier?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedOrder.supplier?.email}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedOrder.supplier?.phone}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Заказ</Typography>
                                <Typography variant="body2">Дата: {new Date(selectedOrder.orderDate).toLocaleDateString('ru-RU')}</Typography>
                                <Typography variant="body2">Статус: 
                                    <Chip 
                                        label={selectedOrder.status} 
                                        color={getStatusColor(selectedOrder.status)} 
                                        size="small" 
                                        sx={{ ml: 1 }}
                                    />
                                </Typography>
                                <Typography variant="body2">Сумма: {selectedOrder.totalOrderValue?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</Typography>
                                 <Typography variant="body2">Ожидаемая доставка: {selectedOrder.estimatedDeliveryDate ? new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString('ru-RU') : 'Не указана'}</Typography>
                            </Grid>
                             <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Ответственный сотрудник</Typography>
                                <Typography>{selectedOrder.employee?.name || 'Не назначен'}</Typography>
                            </Grid>
                             <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom sx={{mt: 1}}>Товары в заказе</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Наименование</TableCell>
                                                <TableCell align="right">Кол-во</TableCell>
                                                <TableCell align="right">Цена за ед.</TableCell>
                                                <TableCell align="right">Сумма</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.products?.map((item) => (
                                                <TableRow key={item.product?._id || item._id}> 
                                                    <TableCell>{item.product?.name || 'Товар не найден'}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">{item.unitPrice?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                                                    <TableCell align="right">{item.totalPrice?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                             </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        {selectedOrder.status === 'Создан' && (
                            <Button 
                                onClick={() => {
                                     handleUpdateStatusDirectly(selectedOrder._id, 'Подтвержден');
                                     handleCloseDialog();
                                }}
                                color="success"
                                variant="outlined"
                                startIcon={<CheckCircleOutlineIcon />}
                            >
                                Подтвердить заказ
                            </Button>
                        )}
                        <Button onClick={handleCloseDialog}>Закрыть</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default OrderManagement; 