import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, Chip, Grid, Card, CardContent, Divider
} from '@mui/material';
import { Refresh, Description, CalendarToday } from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { contractService, productService } from '../../services/api';

const SupplierContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!currentUser || !currentUser._id) {
                throw new Error('Пользователь не авторизован');
            }
            
            console.log('Fetching contracts for supplier:', currentUser._id);
            
            // Загружаем контракты поставщика
            const contractsResponse = await contractService.getSupplierContracts(currentUser._id);
            console.log('Contract response:', contractsResponse);
            
            // Загружаем детали продуктов для отображения информации
            const productsResponse = await productService.getProducts({
                supplierId: currentUser._id
            });
            console.log('Products response:', productsResponse);
            
            // Создаем lookup объект для быстрого доступа к информации о продуктах
            const productsLookup = {};
            if (productsResponse && productsResponse.products) {
                productsResponse.products.forEach(product => {
                    productsLookup[product._id] = product;
                });
            }
            
            setContracts(contractsResponse || []);
            setProducts(productsLookup);
            
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Произошла ошибка при загрузке данных контрактов');
            enqueueSnackbar('Ошибка при загрузке контрактов', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    // Форматирование даты для отображения
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd MMMM yyyy', { locale: ru });
        } catch (e) {
            return 'Некорректная дата';
        }
    };
    
    // Определение статуса контракта
    const getContractStatus = (contract) => {
        const now = new Date();
        const endDate = new Date(contract.endDate);
        const startDate = new Date(contract.startDate);
        
        if (now > endDate) {
            return { label: 'Завершен', color: 'error' };
        } else if (now < startDate) {
            return { label: 'Ожидает активации', color: 'warning' };
        } else {
            // Проверяем, истекает ли контракт в ближайшие 30 дней
            const daysUntilExpiration = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiration <= 30) {
                return { label: `Истекает через ${daysUntilExpiration} дн.`, color: 'warning' };
            } else {
                return { label: 'Активен', color: 'success' };
            }
        }
    };
    
    // Получение имен продуктов по массиву ID
    const getProductNames = (productIds) => {
        if (!productIds || !productIds.length) return [];

        // Debug logging
        console.log('Product IDs in contract:', productIds);
        console.log('Available products:', Object.keys(products));
        
        return productIds.map(id => {
            // Handle both string IDs and object IDs
            const productId = typeof id === 'object' && id._id ? id._id : id;
            return products[productId]?.name || `Продукт ID: ${String(productId).substring(0, 8)}`;
        });
    };
    
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Контракты
                </Typography>
                <Button 
                    startIcon={<Refresh />} 
                    variant="outlined" 
                    onClick={fetchData}
                >
                    Обновить
                </Button>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
                Здесь отображены ваши текущие контракты с информацией о продуктах и сроках действия.
            </Typography>
            
            {/* Статистика контрактов */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <CalendarToday color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Активные контракты</Typography>
                            </Box>
                            <Typography variant="h3">
                                {contracts.filter(c => getContractStatus(c).label === 'Активен').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <CalendarToday color="warning" sx={{ mr: 1 }} />
                                <Typography variant="h6">Истекающие контракты</Typography>
                            </Box>
                            <Typography variant="h3">
                                {contracts.filter(c => getContractStatus(c).label.includes('Истекает')).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Description color="info" sx={{ mr: 1 }} />
                                <Typography variant="h6">Всего продуктов в контрактах</Typography>
                            </Box>
                            <Typography variant="h3">
                                {contracts.reduce((acc, contract) => acc + (contract.products?.length || 0), 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : contracts.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        У вас пока нет контрактов
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Контракты создаются менеджерами системы
                    </Typography>
                </Paper>
            ) : (
                <>
                    {/* Таблица контрактов */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Период действия</TableCell>
                                    <TableCell>Продукты</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contracts.map((contract) => {
                                    const status = getContractStatus(contract);
                                    return (
                                        <TableRow key={contract._id}>
                                            <TableCell>{contract._id.substring(0, 8)}...</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={status.label} 
                                                    color={status.color} 
                                                    size="small" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    <strong>С:</strong> {formatDate(contract.startDate)}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>По:</strong> {formatDate(contract.endDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {contract.products && contract.products.length > 0 ? (
                                                    <Box>
                                                        {getProductNames(contract.products).map((name, index) => (
                                                            <Chip 
                                                                key={index}
                                                                label={name}
                                                                size="small"
                                                                sx={{ m: 0.5 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Нет продуктов
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Container>
    );
};

export default SupplierContracts; 