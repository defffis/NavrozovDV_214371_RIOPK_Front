import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    CircularProgress,
    Alert,
    TextField,
    Grid,
    Divider,
    Link as MuiLink, // Чтобы избежать конфликта с Link из react-router-dom
    Tooltip,
    Snackbar,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Для навигации

import { cartService, orderService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const Cart = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); // Для блокировки кнопок при обновлении
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        paymentMethod: 'Карта', // Значение по умолчанию
        shippingMethod: 'Курьерская доставка' // Значение по умолчанию
    });
    const [orderLoading, setOrderLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await cartService.getCart();
            setCart(response);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError('Не удалось загрузить содержимое корзины.');
            setCart({ items: [], subtotal: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setIsUpdating(true);
        try {
            const updatedCart = await cartService.updateCartItemQuantity(itemId, newQuantity);
            setCart(updatedCart);
            enqueueSnackbar('Количество товара обновлено', { variant: 'info' });
        } catch (err) {
            console.error("Error updating quantity:", err);
            enqueueSnackbar('Ошибка при обновлении количества', { variant: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        setIsUpdating(true);
        try {
            const updatedCart = await cartService.removeCartItem(itemId);
            setCart(updatedCart);
            enqueueSnackbar('Товар удален из корзины', { variant: 'success' });
        } catch (err) {
            console.error("Error removing item:", err);
            enqueueSnackbar('Ошибка при удалении товара', { variant: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleShippingInfoChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateSubtotal = (items) => {
        if (!items || !items.length) return 0;
        return items.reduce((acc, item) => {
            // Проверяем наличие всех необходимых свойств
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            return acc + (quantity * unitPrice);
        }, 0);
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        const subtotal = calculateSubtotal(cart.items);
        // Добавьте здесь расчет доставки, налогов и т.д., если необходимо
        return subtotal;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleCreateOrder = async () => {
        if (!cart || !cart.items || cart.items.length === 0) {
            enqueueSnackbar('Корзина пуста', { variant: 'warning' });
            return;
        }
        
        if (!shippingInfo.address.trim()) {
            enqueueSnackbar('Укажите адрес доставки', { variant: 'warning' });
            return;
        }
        
        setOrderLoading(true);
        
        try {
            const orderData = {
                products: cart.items.map(item => ({
                    product: item.productId._id || item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                })),
                shippingAddress: shippingInfo.address,
                paymentMethod: shippingInfo.paymentMethod,
                shippingMethod: shippingInfo.shippingMethod,
                totalOrderValue: calculateTotal()
            };
            
            // Создаем заказ
            const newOrder = await orderService.createOrder(orderData);
            
            // Очищаем корзину
            await cartService.clearCart();
            
            enqueueSnackbar('Заказ успешно оформлен!', { variant: 'success' });
            
            // Перенаправляем на страницу заказов
            navigate('/client/orders');
            
        } catch (err) {
            console.error('Error creating order:', err);
            enqueueSnackbar('Ошибка при оформлении заказа', { variant: 'error' });
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Показываем пустую корзину
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Ваша корзина пуста
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Добавьте товары из каталога, чтобы оформить заказ
                    </Typography>
                    <Button 
                        variant="contained" 
                        component={RouterLink} 
                        to="/client/products"
                        sx={{ mt: 2 }}
                    >
                        Перейти в каталог
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Корзина
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Товар</TableCell>
                                    <TableCell align="right">Цена</TableCell>
                                    <TableCell align="center">Количество</TableCell>
                                    <TableCell align="right">Сумма</TableCell>
                                    <TableCell align="center">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cart.items.map((item) => {
                                    // Получаем данные о продукте (объект или id)
                                    const product = typeof item.productId === 'object' ? item.productId : { name: 'Товар', imageUrl: null };
                                    
                                    return (
                                        <TableRow key={item._id}>
                                            <TableCell component="th" scope="row">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {product.imageUrl && (
                                                        <Box 
                                                            component="img" 
                                                            src={product.imageUrl} 
                                                            alt={product.name}
                                                            sx={{ width: 50, height: 50, objectFit: 'contain', mr: 2 }}
                                                        />
                                                    )}
                                                    <Typography variant="body1">
                                                        {product.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatPrice(item.unitPrice)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                        disabled={isUpdating}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatPrice(item.quantity * item.unitPrice)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton 
                                                    color="error" 
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    disabled={isUpdating}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Оформление заказа
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box component="form" sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                required
                                label="Адрес доставки"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleShippingInfoChange}
                                margin="normal"
                                sx={{ mb: 2 }}
                            />
                            
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Способ оплаты</InputLabel>
                                <Select
                                    name="paymentMethod"
                                    value={shippingInfo.paymentMethod}
                                    onChange={handleShippingInfoChange}
                                    label="Способ оплаты"
                                >
                                    <MenuItem value="Карта">Банковская карта</MenuItem>
                                    <MenuItem value="Наличные">Наличные при получении</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Способ доставки</InputLabel>
                                <Select
                                    name="shippingMethod"
                                    value={shippingInfo.shippingMethod}
                                    onChange={handleShippingInfoChange}
                                    label="Способ доставки"
                                >
                                    <MenuItem value="Курьерская доставка">Курьерская доставка</MenuItem>
                                    <MenuItem value="Самовывоз">Самовывоз</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <Typography variant="body1">Сумма заказа:</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatPrice(calculateTotal())}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<ShoppingCartCheckoutIcon />}
                            onClick={handleCreateOrder}
                            disabled={orderLoading || !shippingInfo.address.trim()}
                        >
                            {orderLoading ? <CircularProgress size={24} /> : 'Оформить заказ'}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart; 