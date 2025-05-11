import React, { useState, useEffect } from 'react';
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
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
} from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const orderSteps = [
    'Создан',
    'Подтвержден',
    'В обработке',
    'Отправлен',
    'В пути',
    'Доставлен',
    'Получен'
];

const ClientOrders = () => {
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

    const { currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Загрузка заказов
    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getOrders();
            setOrders(response || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Ошибка при загрузке заказов');
            enqueueSnackbar('Не удалось загрузить заказы', { variant: 'error' });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

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
    const handleOpenDialog = async (order) => {
        try {
            setLoading(true);
            // Получаем подробную информацию о заказе по ID
            const orderDetails = await orderService.getOrderById(order._id);
            console.log('Order details fetched:', orderDetails);
            console.log('Products array:', orderDetails.products);
            setSelectedOrder(orderDetails);
            setOpenDialog(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            enqueueSnackbar('Ошибка при загрузке деталей заказа', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
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

    // Получение цвета для TimelineDot - только стандартные значения
    const getTimelineDotColor = (status) => {
        const standardColors = {
            'Создан': 'grey',
            'Подтвержден': 'primary',
            'В обработке': 'info',
            'Отправлен': 'warning',
            'В пути': 'warning',
            'Доставлен': 'success',
            'Получен': 'success',
            'Отменен': 'error',
            'Возвращен': 'error'
        };
        // Используем только стандартные цвета, которые поддерживаются TimelineDot
        return standardColors[status] || 'grey';
    };

    // Получение активного шага для заказа
    const getActiveStep = (status) => {
        return orderSteps.indexOf(status);
    };

    // Подтверждение получения заказа
    const handleConfirmReceipt = async (orderId) => {
        try {
            await orderService.confirmOrderReceipt(orderId);
            loadOrders();
            handleCloseDialog();
            enqueueSnackbar('Получение заказа подтверждено', { variant: 'success' });
        } catch (error) {
            console.error('Error confirming receipt:', error);
            enqueueSnackbar('Ошибка при подтверждении получения', { variant: 'error' });
        }
    };

    // Отмена заказа
    const handleCancelOrder = async (orderId) => {
        try {
            await orderService.cancelOrder(orderId);
            loadOrders();
            handleCloseDialog();
            enqueueSnackbar('Заказ отменен', { variant: 'success' });
        } catch (error) {
            console.error('Error canceling order:', error);
            enqueueSnackbar('Ошибка при отмене заказа', { variant: 'error' });
        }
    };

    // Форматирование даты для отображения
    const formatDate = (dateString) => {
        if (!dateString) return 'Не указана';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Неверный формат';
        }
    };

    // Форматирование цены для отображения
    const formatPrice = (price) => {
        if (price === undefined || price === null) return '0 ₽';
        try {
            return price.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } catch (e) {
            console.error('Error formatting price:', e);
            return `${price} ₽`;
        }
    };

    // Получение данных о продуктах из разных структур
    const extractProductData = (item, index) => {
        let productName = 'Товар #' + (index + 1);
        let quantity = 0;
        let unitPrice = 0;
        let productId = null;
        
        // Проверяем все возможные структуры данных о продуктах
        if (item) {
            // Получаем название продукта
            if (typeof item.product === 'object' && item.product) {
                // Структура: { product: { name, ... }, ... }
                productName = item.product.name || `Товар ID: ${item.product._id}`;
                productId = item.product._id;
            } else if (typeof item.productId === 'object' && item.productId) {
                // Структура: { productId: { name, ... }, ... }
                productName = item.productId.name || `Товар ID: ${item.productId._id}`;
                productId = item.productId._id;
            } else if (item.product) {
                // Структура: { product: "id", ... }
                productId = item.product;
                productName = `Товар ID: ${item.product}`;
            } else if (item.productId) {
                // Структура: { productId: "id", ... }
                productId = item.productId;
                productName = `Товар ID: ${item.productId}`;
            } else if (item.name) {
                // Структура: { name: "Product Name", ... }
                productName = item.name;
            } else if (item.nameSnapshot) {
                // Структура: { nameSnapshot: "Product Name", ... }
                productName = item.nameSnapshot;
            }
            
            // Получаем количество
            quantity = item.quantity || 0;
            
            // Получаем цену
            if (typeof item.unitPrice === 'number') {
                unitPrice = item.unitPrice;
            } else if (typeof item.price === 'number') {
                unitPrice = item.price;
            } else if (item.product && typeof item.product.price === 'number') {
                unitPrice = item.product.price;
            } else if (item.productId && typeof item.productId.price === 'number') {
                unitPrice = item.productId.price;
            }
        }
        
        // Рассчитываем общую стоимость
        const totalPrice = item.totalPrice || (quantity * unitPrice);
        
        return {
            productName,
            productId,
            quantity,
            unitPrice,
            totalPrice
        };
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Заголовок и фильтры */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Мои заказы
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Поиск по номеру заказа"
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
                                <TableCell>Дата заказа</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Сумма</TableCell>
                                <TableCell>Срок доставки</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Alert severity="error">{error}</Alert>
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Box sx={{ py: 3 }}>
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                У вас пока нет заказов
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<InventoryIcon />}
                                                href="/client/products"
                                            >
                                                Перейти в каталог
                                            </Button>
                                        </Box>
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
                                                {order._id?.slice(-6) || 'ID не указан'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.orderDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status || 'Статус не указан'}
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatPrice(order.totalOrderValue)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.estimatedDeliveryDate)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Просмотр деталей">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(order)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {order.status === 'Доставлен' && (
                                                    <Tooltip title="Подтвердить получение">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleConfirmReceipt(order._id)}
                                                            color="success"
                                                        >
                                                            <DoneIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {order.status === 'Создан' && (
                                                    <Tooltip title="Отменить заказ">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleCancelOrder(order._id)}
                                                            color="error"
                                                        >
                                                            <CancelIcon />
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
                        `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`                    }
                />
            </Paper>

            {/* Диалог деталей заказа */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            Детали заказа #{selectedOrder._id?.slice(-6) || 'ID не указан'}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                {/* Статус заказа */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Статус заказа
                                    </Typography>
                                    <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                                        {orderSteps.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Grid>

                                {/* Информация о заказе */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Информация о заказе
                                            </Typography>
                                            <Typography variant="body2">
                                                Дата заказа: {formatDate(selectedOrder.orderDate)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Статус: <Chip
                                                    label={selectedOrder.status || 'Статус не указан'}
                                                    color={getStatusColor(selectedOrder.status)}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Typography>
                                            <Typography variant="body2">
                                                Сумма: {formatPrice(selectedOrder.totalOrderValue)}
                                            </Typography>
                                            {selectedOrder.estimatedDeliveryDate && (
                                                <Typography variant="body2">
                                                    Ожидаемая дата доставки: {formatDate(selectedOrder.estimatedDeliveryDate)}
                                                </Typography>
                                            )}
                                            {selectedOrder.shippingAddress && (
                                                <Typography variant="body2">
                                                    Адрес доставки: {selectedOrder.shippingAddress}
                                                </Typography>
                                            )}
                                            {selectedOrder.paymentMethod && (
                                                <Typography variant="body2">
                                                    Способ оплаты: {selectedOrder.paymentMethod}
                                                </Typography>
                                            )}
                                            {selectedOrder.shippingMethod && (
                                                <Typography variant="body2">
                                                    Способ доставки: {selectedOrder.shippingMethod}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* История статусов */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                История статусов
                                            </Typography>
                                            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                                                <Timeline>
                                                    {selectedOrder.statusHistory.map((history, index) => (
                                                        <TimelineItem key={index}>
                                                            <TimelineSeparator>
                                                                <TimelineDot color={getTimelineDotColor(history.status)} />
                                                                {index < selectedOrder.statusHistory.length - 1 && (
                                                                    <TimelineConnector />
                                                                )}
                                                            </TimelineSeparator>
                                                            <TimelineContent>
                                                                <Typography variant="body2">
                                                                    {history.status}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatDate(history.timestamp)} {new Date(history.timestamp).toLocaleTimeString('ru-RU')}
                                                                </Typography>
                                                                {history.comment && (
                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                        {history.comment}
                                                                    </Typography>
                                                                )}
                                                            </TimelineContent>
                                                        </TimelineItem>
                                                    ))}
                                                </Timeline>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    История статусов недоступна
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Товары */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        Товары в заказе
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
                                                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                                                    // Основная структура заказа с products
                                                    selectedOrder.products.map((item, index) => {
                                                        const { productName, quantity, unitPrice, totalPrice } = extractProductData(item, index);
                                                        return (
                                                            <TableRow key={index}>
                                                                <TableCell>{productName}</TableCell>
                                                                <TableCell align="right">{quantity}</TableCell>
                                                                <TableCell align="right">{formatPrice(unitPrice)}</TableCell>
                                                                <TableCell align="right">{formatPrice(totalPrice)}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                    // Альтернативная структура с items
                                                    selectedOrder.items.map((item, index) => {
                                                        const { productName, quantity, unitPrice, totalPrice } = extractProductData(item, index);
                                                        return (
                                                            <TableRow key={index}>
                                                                <TableCell>{productName}</TableCell>
                                                                <TableCell align="right">{quantity}</TableCell>
                                                                <TableCell align="right">{formatPrice(unitPrice)}</TableCell>
                                                                <TableCell align="right">{formatPrice(totalPrice)}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center">
                                                            <Typography variant="body2" color="text.secondary">
                                                                Нет данных о товарах в заказе
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell colSpan={3} align="right">
                                                        <Typography variant="subtitle2">
                                                            Итого:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="subtitle2">
                                                            {formatPrice(selectedOrder.totalOrderValue)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            {selectedOrder.status === 'Доставлен' && (
                                <Button
                                    onClick={() => handleConfirmReceipt(selectedOrder._id)}
                                    startIcon={<DoneIcon />}
                                    color="success"
                                >
                                    Подтвердить получение
                                </Button>
                            )}
                            {selectedOrder.status === 'Создан' && (
                                <Button
                                    onClick={() => handleCancelOrder(selectedOrder._id)}
                                    startIcon={<CancelIcon />}
                                    color="error"
                                >
                                    Отменить заказ
                                </Button>
                            )}
                            <Button onClick={handleCloseDialog}>Закрыть</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default ClientOrders; 
