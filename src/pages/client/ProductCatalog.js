import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Button,
    CircularProgress,
    TextField,
    InputAdornment,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';

import { productService, cartService } from '../../services/api';
import { useSnackbar } from 'notistack';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        sortBy: 'name',
        order: 'asc'
    });
    const [addingToCart, setAddingToCart] = useState({});
    
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts({
                ...filters,
                page,
                limit: 12 // Количество товаров на странице
            });
            
            setProducts(response.products || []);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError('Ошибка при загрузке товаров');
            enqueueSnackbar('Не удалось загрузить список товаров', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filters, page, enqueueSnackbar]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleFilterChange = (field) => (event) => {
        setFilters(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setPage(1); // Сбрасываем страницу при изменении фильтров
    };

    const handleAddToCart = async (productId) => {
        setAddingToCart(prev => ({ ...prev, [productId]: true }));
        try {
            await cartService.addToCart(productId, 1);
            enqueueSnackbar('Товар добавлен в корзину', { variant: 'success' });
        } catch (err) {
            console.error("Error adding to cart:", err);
            enqueueSnackbar('Ошибка при добавлении товара в корзину', { variant: 'error' });
        } finally {
            setAddingToCart(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleViewCart = () => {
        navigate('/client/cart');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading && products.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error && products.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={fetchProducts} sx={{ mt: 2 }}>
                    Попробовать снова
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Каталог товаров
                </Typography>
                <Button 
                    variant="outlined"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleViewCart}
                >
                    Перейти в корзину
                </Button>
            </Box>

            {/* Фильтры */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Поиск товаров"
                        variant="outlined"
                        value={filters.search}
                        onChange={handleFilterChange('search')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Категория</InputLabel>
                        <Select
                            value={filters.category}
                            label="Категория"
                            onChange={handleFilterChange('category')}
                        >
                            <MenuItem value="">Все категории</MenuItem>
                            <MenuItem value="electronics">Электроника</MenuItem>
                            <MenuItem value="furniture">Мебель</MenuItem>
                            <MenuItem value="clothing">Одежда</MenuItem>
                            <MenuItem value="food">Продукты</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Сортировка</InputLabel>
                        <Select
                            value={filters.sortBy}
                            label="Сортировка"
                            onChange={handleFilterChange('sortBy')}
                        >
                            <MenuItem value="name">По названию</MenuItem>
                            <MenuItem value="price">По цене (возр.)</MenuItem>
                            <MenuItem value="-price">По цене (убыв.)</MenuItem>
                            <MenuItem value="-createdAt">Сначала новые</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Список товаров */}
            {products.length > 0 ? (
                <Grid container spacing={3}>
                    {products.map((product) => (
                        <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                               
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                                        {product.name}
                                    </Typography>
                                    {product.category && (
                                        <Chip 
                                            label={product.category} 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                            sx={{ mb: 1 }}
                                        />
                                    )}
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {product.description?.length > 80 
                                            ? `${product.description.substring(0, 80)}...` 
                                            : product.description}
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {formatPrice(product.price)}
                                    </Typography>
                                    {product.stockQuantity > 0 ? (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            В наличии: {product.stockQuantity} шт.
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" color="error" display="block">
                                            Нет в наличии
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={() => handleAddToCart(product._id)}
                                        disabled={addingToCart[product._id] || product.stockQuantity <= 0}
                                    >
                                        {addingToCart[product._id] ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : 'В корзину'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    py: 5 
                }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Товары не найдены
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Попробуйте изменить параметры поиска
                    </Typography>
                </Box>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary" 
                    />
                </Box>
            )}
        </Container>
    );
};

export default ProductCatalog; 