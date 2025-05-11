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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const UnclaimedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [searchText, setSearchText] = useState('');

    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Загрузка заказов
    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getUnclaimedOrders();
            setOrders(response || []);
        } catch (error) {
            console.error('Error loading unclaimed orders:', error);
            setError('Ошибка при загрузке доступных заказов');
            enqueueSnackbar('Не удалось загрузить доступные заказы', { variant: 'error' });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Н/Д';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    // Форматирование цены
    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'Н/Д';
        return price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
    };

    // Обработчик для назначения заказа на поставщика
    const handleClaimOrder = async (orderId) => {
        try {
            await orderService.claimOrder(orderId);
            enqueueSnackbar('Заказ успешно взят на выполнение', { variant: 'success' });
            loadOrders(); // Перезагружаем список после успешного назначения
        } catch (error) {
            console.error('Error claiming order:', error);
            enqueueSnackbar('Ошибка при назначении заказа', { variant: 'error' });
        }
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

    // Обработчики пагинации
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Фильтрация заказов по поиску
    const filteredOrders = orders.filter(order => {
        const searchLower = searchText.toLowerCase();
        return (
            (order._id && order._id.toLowerCase().includes(searchLower)) ||
            (order.client?.name && order.client.name.toLowerCase().includes(searchLower))
        );
    });

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Доступные заказы для выполнения
                </Typography>
                <Typography variant="body1" gutterBottom color="text.secondary">
                    Здесь представлены заказы, которые еще не взяты на исполнение ни одним поставщиком.
                    Вы можете взять любой заказ на исполнение.
                </Typography>
                
                <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Поиск по ID заказа или клиенту"
                            variant="outlined"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button 
                            variant="outlined"
                            onClick={loadOrders}
                            startIcon={<CheckCircleIcon />}
                        >
                            Обновить список
                        </Button>
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
                                <TableCell>Дата заказа</TableCell>
                                <TableCell>Сумма</TableCell>
                                <TableCell align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Alert severity="error">{error}</Alert>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Box sx={{ py: 3 }}>
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                Нет доступных заказов для выполнения
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders
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
                                                {order.client?.name || 'Н/Д'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.orderDate)}
                                            </TableCell>
                                            <TableCell>
                                                {formatPrice(order.totalOrderValue)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Просмотреть детали">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleOpenDialog(order)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Взять заказ на выполнение">
                                                    <IconButton 
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleClaimOrder(order._id)}
                                                    >
                                                        <ShoppingCartCheckoutIcon />
                                                    </IconButton>
                                                </Tooltip>
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
                    count={filteredOrders.length}
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
                    <DialogTitle>
                        Детали заказа #{selectedOrder._id?.slice(-6)}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Клиент</Typography>
                                <Typography>{selectedOrder.client?.name || 'Н/Д'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedOrder.client?.email || 'Email не указан'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedOrder.client?.phone || 'Телефон не указан'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Информация о заказе</Typography>
                                <Typography variant="body2">
                                    Дата заказа: {formatDate(selectedOrder.orderDate)}
                                </Typography>
                                <Typography variant="body2">
                                    Статус: Создан
                                </Typography>
                                <Typography variant="body2">
                                    Общая сумма: {formatPrice(selectedOrder.totalOrderValue)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                    Товары в заказе
                                </Typography>
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
                                            {selectedOrder.products?.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {item.product?.name || 'Товар не указан'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatPrice(item.unitPrice)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatPrice(item.quantity * item.unitPrice)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                handleClaimOrder(selectedOrder._id);
                                handleCloseDialog();
                            }}
                            startIcon={<ShoppingCartCheckoutIcon />}
                        >
                            Взять заказ на выполнение
                        </Button>
                        <Button onClick={handleCloseDialog}>
                            Закрыть
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default UnclaimedOrders; 