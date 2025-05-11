import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Button,
    Alert,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

import { analyticsService } from '../services/api';
import KPICard from '../components/Dashboard/KPICard';
import DeliveryPerformanceChart from '../components/Dashboard/DeliveryPerformanceChart';
import SupplierPerformanceTable from '../components/Dashboard/SupplierPerformanceTable';

 
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

 
const Dashboard = () => {
 
    const [kpis, setKpis] = useState(null);
    const [supplierMetrics, setSupplierMetrics] = useState([]);
    const [deliveryMetrics, setDeliveryMetrics] = useState([]);
    const [forecasts, setForecasts] = useState(null);
    
   
    const [period, setPeriod] = useState('weekly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
  
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

            
                const kpisResponse = await analyticsService.getDashboardKPIs();
                setKpis(kpisResponse.data);

               
                const supplierResponse = await analyticsService.getSupplierMetrics(startDate, endDate);
                setSupplierMetrics(supplierResponse.data);

              
                const deliveryDailyResponse = await analyticsService.getDeliveryDailyMetrics(startDate, endDate);
                setDeliveryMetrics(deliveryDailyResponse.data);

            
                const forecastsResponse = await analyticsService.getForecasts();
                setForecasts(forecastsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, [period, startDate, endDate]);

 
    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

     
    const handleRefresh = () => {
        setLoading(true);
      
        analyticsService
            .getDashboardKPIs()
            .then((response) => {
                setKpis(response.data);
                return analyticsService.getSupplierMetrics(startDate, endDate);
            })
            .then((response) => {
                setSupplierMetrics(response.data);
                return analyticsService.getDeliveryDailyMetrics(startDate, endDate);
            })
            .then((response) => {
                setDeliveryMetrics(response.data);
                return analyticsService.getForecasts();
            })
            .then((response) => {
                setForecasts(response.data);
                setLoading(false);
                setError(null);
            })
            .catch((err) => {
                console.error('Error refreshing dashboard data:', err);
                setError('Произошла ошибка при обновлении данных. Пожалуйста, попробуйте позже.');
                setLoading(false);
            });
    };

    
    const prepareDeliveryChartData = () => {
        if (!deliveryMetrics || !Array.isArray(deliveryMetrics)) return [];
        
       
        const onTimeData = [];
        const delayedData = [];
        const successRateData = [];
        
       
        if (Array.isArray(deliveryMetrics)) {
       
            const monthlyData = {};
            
            deliveryMetrics.forEach(metric => {
                const date = new Date(metric.date);
                const monthKey = `${date.getFullYear()}-${date.getMonth()+1}`;
                const monthName = date.toLocaleString('ru-RU', { month: 'short' });
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthName,
                        onTime: 0,
                        delayed: 0,
                        total: 0,
                        successRate: 0
                    };
                }
                
               
                if (metric.onTime !== undefined && metric.delayed !== undefined) {
                    monthlyData[monthKey].onTime += metric.onTime;
                    monthlyData[monthKey].delayed += metric.delayed;
                    monthlyData[monthKey].total += (metric.onTime + metric.delayed);
                } 
               
                else if (metric.deliverySuccessRate !== undefined) {
                    
                    const assumedTotal = 100;
                    const successfulCount = Math.round((metric.deliverySuccessRate / 100) * assumedTotal);
                    
                    monthlyData[monthKey].onTime += successfulCount;
                    monthlyData[monthKey].delayed += (assumedTotal - successfulCount);
                    monthlyData[monthKey].total += assumedTotal;
                }
            });
            
         
            Object.values(monthlyData).forEach(data => {
                if (data.total > 0) {
                    data.successRate = Math.round((data.onTime / data.total) * 100);
                }
                
                onTimeData.push({
                    x: data.month,
                    y: data.onTime
                });
                
                delayedData.push({
                    x: data.month,
                    y: data.delayed
                });
                
                successRateData.push({
                    x: data.month,
                    y: data.successRate
                });
            });
        }
        
       
        if (onTimeData.length === 0 && deliveryMetrics.onTime !== undefined && deliveryMetrics.delayed !== undefined) {
        
            const currentMonth = new Date().toLocaleString('ru-RU', { month: 'short' });
            const total = deliveryMetrics.onTime + deliveryMetrics.delayed || 1;
            const successRate = Math.round((deliveryMetrics.onTime / total) * 100);
            
            onTimeData.push({
                x: currentMonth,
                y: deliveryMetrics.onTime
            });
            
            delayedData.push({
                x: currentMonth,
                y: deliveryMetrics.delayed
            });
            
            successRateData.push({
                x: currentMonth,
                y: successRate
            });
        }
        
    
        if (onTimeData.length === 0) {
            return [];
        }
        
        return [
            {
                id: 'Процент успешных доставок',
                color: 'hsl(215, 70%, 50%)',
                data: successRateData,
            },
            {
                id: 'Доставки вовремя',
                color: 'hsl(104, 70%, 50%)',
                data: onTimeData,
            },
            {
                id: 'Задержанные доставки',
                color: 'hsl(0, 70%, 50%)',
                data: delayedData,
            }
        ];
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Заголовок и фильтры */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Операционная аналитика поставок
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Период</InputLabel>
                        <Select
                            value={period}
                            onChange={handlePeriodChange}
                            label="Период"
                        >
                            <MenuItem value="daily">Ежедневно</MenuItem>
                            <MenuItem value="weekly">Еженедельно</MenuItem>
                            <MenuItem value="monthly">Ежемесячно</MenuItem>
                            <MenuItem value="quarterly">Поквартально</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Обновить
                    </Button>
                </Box>
            </Box>

            {/* Ошибка */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Загрузка */}
            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50vh',
                    }}
                >
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Загрузка данных...
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* KPI показатели */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <KPICard
                                title="Эффект. поставщиков"
                                value={kpis?.supplierPerformanceIndex || 0}
                                previousValue={75}
                                maxValue={100}
                                unit="%"
                                description="Индекс эффективности"
                                color="#3f51b5"
                                icon={PersonIcon}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <KPICard
                                title="Эффект. доставки"
                                value={kpis?.deliveryEfficiencyIndex || 0}
                                previousValue={80}
                                maxValue={100}
                                unit="%"
                                description="Индекс своевременности"
                                color="#4caf50"
                                icon={LocalShippingIcon}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <KPICard
                                title="Состояние запасов"
                                value={kpis?.inventoryHealthIndex || 0}
                                previousValue={65}
                                maxValue={100}
                                unit="%"
                                description="Индекс здоровья"
                                color="#ff9800"
                                icon={InventoryIcon}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <KPICard
                                title="Оптимизация затрат"
                                value={kpis?.costOptimizationIndex || 0}
                                previousValue={70}
                                maxValue={100}
                                unit="%"
                                description="Индекс оптимизации"
                                color="#e91e63"
                                icon={AttachMoneyIcon}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <KPICard
                                title="Удовлетв. клиентов"
                                value={kpis?.customerSatisfactionIndex || 0}
                                previousValue={85}
                                maxValue={100}
                                unit="%"
                                description="Индекс удовлетворенности"
                                color="#2196f3"
                                icon={SpeedIcon}
                            />
                        </Grid>
                    </Grid>

                    {/* Графики и таблицы */}
                    <Grid container spacing={3}>
                        {/* График производительности доставок */}
                        

                        {/* Прогнозы и рекомендации */}
                        <Grid item xs={12} md={4}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    height: 400,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Прогнозы и рекомендации
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Прогноз заказов на следующий период
                                    </Typography>
                                    <Typography variant="h5" sx={{ my: 1 }}>
                                        {forecasts?.nextPeriodOrders || 0}{' '}
                                        <Typography
                                            variant="body2"
                                            color={
                                                forecasts?.demandTrend === 'rising'
                                                    ? 'success.main'
                                                    : forecasts?.demandTrend === 'falling'
                                                    ? 'error.main'
                                                    : 'warning.main'
                                            }
                                            component="span"
                                        >
                                            (
                                            {forecasts?.demandTrend === 'rising'
                                                ? '↑ Рост'
                                                : forecasts?.demandTrend === 'falling'
                                                ? '↓ Падение'
                                                : '→ Стабильно'}
                                            )
                                        </Typography>
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Рекомендации
                                    </Typography>
                                    <Box
                                        component="ul"
                                        sx={{
                                            pl: 2,
                                            mt: 1,
                                            mb: 0,
                                            '& > li': { mb: 1, color: 'text.primary' },
                                        }}
                                    >
                                        <li>Увеличьте запасы популярных товаров на 15%</li>
                                        <li>Оптимизируйте маршруты доставки в регионе "Центр"</li>
                                        <li>Обратите внимание на поставщиков с низким рейтингом</li>
                                    </Box>
                                </Box>

                             
                            </Paper>
                        </Grid>
                                        
                                        
                        {/* Таблица эффективности поставщиков */}
                        
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default Dashboard; 