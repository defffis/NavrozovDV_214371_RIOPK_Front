import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Paper, Typography, Box, CircularProgress, Alert, 
    Card, CardContent, List, ListItem, ListItemText, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink,
    useTheme // Import useTheme to access theme colors
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart'; // Using ShowChart icon instead of LineChart
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
// Import Recharts components
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

import { analyticsService, supplierService, orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // If needed for role-based elements
import { useSnackbar } from 'notistack';

// Helper to format numbers as currency (example)
const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);
};

const DashboardPage = () => {
    const theme = useTheme(); // Get theme object
    const [kpis, setKpis] = useState(null);
    // Новые состояния для первичных данных
    const [suppliers, setSuppliers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [regions, setRegions] = useState([]);
    
    // Сохраняем processed data для совместимости
    const [detailedAnalytics, setDetailedAnalytics] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    // const { user } = useAuth(); // Uncomment if user role specific display is needed

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get today's date and date 6 months ago for default analytics range
                const today = new Date();
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                const startDateStr = sixMonthsAgo.toISOString().split('T')[0];
                const endDateStr = today.toISOString().split('T')[0];

                // Запрос информации о поставщиках напрямую
                console.log("Получение информации о поставщиках...");
                const suppliersResponse = await supplierService.getSuppliers();
                console.log("Полученные данные о поставщиках:", suppliersResponse);
                
                if (!suppliersResponse || !Array.isArray(suppliersResponse)) {
                    throw new Error('Не удалось получить список поставщиков');
                }
                
                // Создаем карту поставщиков для быстрого доступа
                const suppliersMap = {};
                suppliersResponse.forEach(supplier => {
                    if (supplier._id) {
                        suppliersMap[supplier._id] = supplier;
                    }
                });
                
                console.log("Карта поставщиков:", suppliersMap);

                // Fetch data in parallel to improve loading performance
                const [
                    kpiResponse, 
                    detailedResponse, 
                    supplierMetricsResponse, 
                    deliveryKpisResponse,
                    deliveryDailyResponse,
                    regionResponse
                ] = await Promise.all([
                    analyticsService.getDashboardKPIs(),
                    analyticsService.getLatestDailyDetails(),
                    analyticsService.getSupplierMetrics(startDateStr, endDateStr), // Получаем метрики поставщиков
                    analyticsService.getDeliveryKPIs(startDateStr, endDateStr),
                    analyticsService.getDeliveryDailyMetrics(startDateStr, endDateStr),
                    analyticsService.getRegionMetrics(startDateStr, endDateStr)
                ]);

                if (kpiResponse.success) {
                    setKpis(kpiResponse.data);
                } else {
                    throw new Error(kpiResponse.message || 'Failed to fetch KPIs');
                }

                // Process detailed analytics data
                if (detailedResponse.success) {
                    console.log("Dashboard data received:", detailedResponse.data);
                    
                    // Add data processing here to ensure all required fields are present
                    const processedData = { ...detailedResponse.data };
                    
                    // Обработка данных поставщиков с реальными именами
                    if (supplierMetricsResponse && supplierMetricsResponse.success && supplierMetricsResponse.data) {
                        const suppliersWithRealNames = supplierMetricsResponse.data.map(metric => {
                            const supplier = suppliersMap[metric.supplier];
                            return {
                                ...metric,
                                supplierName: supplier ? supplier.name : (metric.supplierName || 'Поставщик без имени')
                            };
                        });
                        
                        // Удаляем дубликаты
                        const uniqueSupplierIds = new Set();
                        processedData.supplierMetrics = suppliersWithRealNames.filter(metric => {
                            if (!metric.supplier || uniqueSupplierIds.has(metric.supplier)) {
                                return false;
                            }
                            uniqueSupplierIds.add(metric.supplier);
                            return true;
                        });
                    } else if (processedData.supplierMetrics) {
                        // Если не получили данные от API но есть данные из аналитики
                        processedData.supplierMetrics = processedData.supplierMetrics.map(metric => {
                            const supplier = suppliersMap[metric.supplier];
                            return {
                                ...metric,
                                supplierName: supplier ? supplier.name : (metric.supplierName || 'Поставщик без имени')
                            };
                        });
                    } else {
                        processedData.supplierMetrics = [];
                    }

                    // Add delivery metrics
                    if (deliveryKpisResponse.success && deliveryKpisResponse.data) {
                        processedData.deliveryMetrics = deliveryKpisResponse.data;
                    }

                    // Add daily delivery metrics for trend charts
                    if (deliveryDailyResponse.success && deliveryDailyResponse.data) {
                        processedData.dailyDeliveryMetrics = deliveryDailyResponse.data;
                    }

                    // Add region metrics
                    if (regionResponse.success && regionResponse.data) {
                        processedData.regionMetrics = regionResponse.data;
                    }
                    
                    // Убедимся, что у всех поставщиков есть имена
                    if (processedData.supplierMetrics) {
                        processedData.supplierMetrics.forEach(metric => {
                            console.log("Supplier metric:", metric);
                            if (!metric.supplierName || metric.supplierName === 'Неизвестный поставщик') {
                                const supplier = suppliersMap[metric.supplier];
                                if (supplier) {
                                    metric.supplierName = supplier.name;
                                    console.log(`Исправлено имя поставщика ${metric.supplier} на ${supplier.name}`);
                                }
                            }
                        });
                    }
                    
                    setDetailedAnalytics(processedData);

                    // Добавим подробный вывод всех данных в консоль
                    console.log('========== DASHBOARD DATA DUMP ==========');
                    console.log('KPIs Data:', kpiResponse.data);
                    console.log('Detailed Analytics Data:', detailedResponse.data);
                    console.log('Supplier Metrics Data:', supplierMetricsResponse?.data);
                    console.log('Delivery KPIs Data:', deliveryKpisResponse.data);
                    console.log('Daily Delivery Metrics:', deliveryDailyResponse.data);
                    console.log('Region Metrics:', regionResponse.data);
                    console.log('Suppliers List:', suppliersResponse);
                    console.log('Processed Data (Final):', processedData);
                    console.log('======= END OF DASHBOARD DATA DUMP =======');
                    
                    // Подробный анализ ключевых структур данных для дашборда
                    console.log('=== SUPPLIER METRICS ANALYSIS ===');
                    if (processedData.supplierMetrics && processedData.supplierMetrics.length > 0) {
                        console.log(`Total suppliers: ${processedData.supplierMetrics.length}`);
                        console.log('First supplier data sample:', processedData.supplierMetrics[0]);
                        console.log('All supplier fields:', Object.keys(processedData.supplierMetrics[0]));
                        console.log('Supplier Names Check:');
                        processedData.supplierMetrics.forEach(s => console.log(`Supplier ${s.supplier}: ${s.supplierName}`));
                    } else {
                        console.log('No supplier metrics available');
                    }
                    
                    console.log('=== DELIVERY METRICS ANALYSIS ===');
                    if (processedData.deliveryMetrics) {
                        console.log('Delivery Metrics:', processedData.deliveryMetrics);
                        console.log('Delivery Metrics fields:', Object.keys(processedData.deliveryMetrics));
                    } else {
                        console.log('No delivery metrics available');
                    }
                    
                    console.log('=== PRODUCT METRICS ANALYSIS ===');
                    if (processedData.productMetrics) {
                        console.log('Product Metrics:', processedData.productMetrics);
                        if (processedData.productMetrics.byCategory) {
                            console.log(`Total categories: ${processedData.productMetrics.byCategory.length}`);
                            if (processedData.productMetrics.byCategory.length > 0) {
                                console.log('Category sample:', processedData.productMetrics.byCategory[0]);
                            }
                        }
                        if (processedData.productMetrics.inventorySummary) {
                            console.log('Inventory Summary:', processedData.productMetrics.inventorySummary);
                        }
                    } else {
                        console.log('No product metrics available');
                    }
                    
                    console.log('=== REGION METRICS ANALYSIS ===');
                    if (processedData.regionMetrics && processedData.regionMetrics.length > 0) {
                        console.log(`Total regions: ${processedData.regionMetrics.length}`);
                        console.log('Region sample:', processedData.regionMetrics[0]);
                    } else {
                        console.log('No region metrics available');
                    }
                } else {
                    // Handle case where detailed analytics data is null
                    if (detailedResponse.data === null && detailedResponse.message) {
                        enqueueSnackbar(detailedResponse.message, { variant: 'info' });
                    }
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError(err.message || 'Ошибка при загрузке данных для дашборда');
                enqueueSnackbar(err.message || 'Ошибка при загрузке данных', { variant: 'error' });
            }
            setLoading(false);
        };

        fetchData();
    }, [enqueueSnackbar]);
    
    // Функция для преобразования первичных данных в формат метрик
    const processRawData = async (suppliers, orders, kpisData) => {
        // Создаем карту поставщиков для быстрого доступа по ID
        const supplierMap = {};
        suppliers.forEach(supplier => {
            supplierMap[supplier._id] = supplier;
        });
        
        console.log("Обработка данных для метрик...");
        console.log("Количество поставщиков:", suppliers.length);
        console.log("Количество заказов:", orders.length);
        
        // Сгруппируем заказы по поставщикам
        const supplierOrdersMap = {};
        
        orders.forEach(order => {
            if (order.supplier) {
                if (!supplierOrdersMap[order.supplier]) {
                    supplierOrdersMap[order.supplier] = [];
                }
                supplierOrdersMap[order.supplier].push(order);
            }
        });
        
        // Создаем метрики поставщиков
        const supplierMetrics = [];
        
        Object.keys(supplierOrdersMap).forEach(supplierId => {
            const supplierOrders = supplierOrdersMap[supplierId];
            const supplier = supplierMap[supplierId];
            
            if (!supplier) {
                console.warn(`Поставщик с ID ${supplierId} не найден в списке поставщиков`);
                return;
            }
            
            // Считаем метрики
            const totalOrders = supplierOrders.length;
            const revenue = supplierOrders.reduce((sum, order) => sum + (order.totalOrderValue || 0), 0);
            
            // Считаем метрики доставки
            const onTimeDelivery = supplierOrders.filter(order => 
                order.status === 'Доставлен' && (!order.deliveryDelay || order.deliveryDelay === 0)
            ).length;
            
            const lateDelivery = supplierOrders.filter(order => 
                order.status === 'Доставлен' && order.deliveryDelay > 0
            ).length;
            
            const completedDeliveries = onTimeDelivery + lateDelivery;
            const onTimeDeliveryPercentage = completedDeliveries > 0 
                ? Math.round((onTimeDelivery / completedDeliveries) * 100) 
                : 0;
            
            // Другие метрики
            const quality = Math.round((supplier.rating || 3) * 20); // Рейтинг 0-5 в качество 0-100
            const costEfficiency = supplier.priceCompetitiveness || 80;
            
            // Индекс производительности
            const performanceScore = Math.round(
                (onTimeDeliveryPercentage * 0.4) + 
                (quality * 0.4) + 
                (costEfficiency * 0.2)
            );
            
            supplierMetrics.push({
                supplier: supplierId,
                supplierName: supplier.name || "Поставщик без имени",
                totalOrders,
                revenue,
                onTimeDelivery,
                lateDelivery,
                onTimeDeliveryPercentage,
                quality,
                costEfficiency,
                performanceScore
            });
        });
        
        // Сортируем по производительности
        supplierMetrics.sort((a, b) => b.performanceScore - a.performanceScore);
        
        // Метрики доставки
        const allCompletedDeliveries = orders.filter(order => order.status === 'Доставлен').length;
        const allOnTimeDeliveries = orders.filter(order => 
            order.status === 'Доставлен' && (!order.deliveryDelay || order.deliveryDelay === 0)
        ).length;
        
        const deliverySuccessRate = allCompletedDeliveries > 0 
            ? Math.round((allOnTimeDeliveries / allCompletedDeliveries) * 100)
            : 0;
        
        // Среднее время доставки
        let totalDeliveryTime = 0;
        let deliveriesWithTime = 0;
        
        orders.forEach(order => {
            if (order.status === 'Доставлен' && order.shippingTime) {
                totalDeliveryTime += order.shippingTime;
                deliveriesWithTime++;
            }
        });
        
        const averageDeliveryTime = deliveriesWithTime > 0 
            ? Number((totalDeliveryTime / deliveriesWithTime).toFixed(1))
            : 0;
        
        // Группируем по регионам
        const regionMap = {};
        
        orders.forEach(order => {
            if (order.deliveryAddress && order.deliveryAddress.region) {
                const region = order.deliveryAddress.region;
                
                if (!regionMap[region]) {
                    regionMap[region] = {
                        region,
                        orders: 0,
                        revenue: 0,
                        deliveryTime: 0,
                        deliveriesCount: 0
                    };
                }
                
                regionMap[region].orders++;
                regionMap[region].revenue += order.totalOrderValue || 0;
                
                if (order.status === 'Доставлен' && order.shippingTime) {
                    regionMap[region].deliveryTime += order.shippingTime;
                    regionMap[region].deliveriesCount++;
                }
            }
        });
        
        // Преобразуем в массив и считаем среднее время доставки
        const regionMetrics = Object.values(regionMap).map(region => ({
            region: region.region,
            orders: region.orders,
            revenue: region.revenue,
            averageDeliveryTime: region.deliveriesCount > 0 
                ? Number((region.deliveryTime / region.deliveriesCount).toFixed(1))
                : 0
        }));
        
        // Возвращаем объект с обработанными данными
        return {
            supplierMetrics,
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.totalOrderValue || 0), 0),
            totalSuppliers: suppliers.length,
            deliveryMetrics: {
                onTime: allOnTimeDeliveries,
                delayed: allCompletedDeliveries - allOnTimeDeliveries,
                deliverySuccessRate,
                averageDeliveryTime,
                deliveryEfficiencyIndex: kpisData?.deliveryEfficiencyIndex || 85,
                customerSatisfactionIndex: kpisData?.customerSatisfactionIndex || 87
            },
            regionMetrics,
            // Добавляем другие необходимые метрики
            kpis: kpisData || {
                supplierPerformanceIndex: 85,
                deliveryEfficiencyIndex: 85,
                inventoryHealthIndex: 75,
                costOptimizationIndex: 80,
                customerSatisfactionIndex: 87
            }
        };
    };

    if (loading) {
        return <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
    }

    if (error) {
        return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    // --- KPI Cards --- 
    const renderKpiCards = () => {
        // Получаем актуальные значения из доступных данных
        // Здесь мы берем данные из реальных метрик поставщиков, а не из общей статистики
        const suppliersCount = detailedAnalytics?.supplierMetrics?.length || 0;
        
        // Рассчитываем общее количество заказов из данных поставщиков
        const totalOrders = detailedAnalytics?.supplierMetrics?.reduce((sum, s) => sum + (s.totalOrders || 0), 0) || 0;
        
        // Рассчитываем общую выручку из данных поставщиков
        const totalRevenue = detailedAnalytics?.supplierMetrics?.reduce((sum, s) => sum + (s.revenue || 0), 0) || 0;
        
        // Для успешности доставок используем данные из метрик доставки или рассчитываем из данных поставщиков
        const deliveryMetrics = detailedAnalytics?.deliveryMetrics || {};
        let deliverySuccessRate = deliveryMetrics.deliverySuccessRate;
        
        if (!deliverySuccessRate && deliverySuccessRate !== 0) {
            // Если нет прямых данных, рассчитываем из данных поставщиков
            const totalOnTime = detailedAnalytics?.supplierMetrics?.reduce((sum, s) => sum + (s.onTimeDelivery || 0), 0) || 0;
            const totalDeliveries = detailedAnalytics?.supplierMetrics?.reduce((sum, s) => sum + ((s.onTimeDelivery || 0) + (s.lateDelivery || 0)), 0) || 0;
            deliverySuccessRate = totalDeliveries > 0 ? Math.round((totalOnTime / totalDeliveries) * 100) : 0;
        }
        
        const deliveryEfficiencyIndex = deliveryMetrics.deliveryEfficiencyIndex || 
            (kpis?.deliveryEfficiencyIndex || 0);
        
        const inventoryHealthIndex = kpis?.inventoryHealthIndex || 0;
        
        return (
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: `4px solid ${theme.palette.primary.main}`
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Поставщики</Typography>
                            <Typography variant="h4" component="div" sx={{ mt: 1 }}>{suppliersCount}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <CategoryIcon sx={{ color: theme.palette.primary.main, mr: 1 }} fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                    Активные поставщики
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: `4px solid ${theme.palette.success.main}`
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Своевременность доставок</Typography>
                            <Typography variant="h4" component="div" sx={{ mt: 1 }}>{deliverySuccessRate}%</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 1 }} fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                    Доставки вовремя
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: `4px solid ${theme.palette.info.main}`
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Эффективность доставки</Typography>
                            <Typography variant="h4" component="div" sx={{ mt: 1 }}>{deliveryEfficiencyIndex}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <QueryStatsIcon sx={{ color: theme.palette.info.main, mr: 1 }} fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                    Индекс эффективности
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: `4px solid ${theme.palette.secondary.main}`
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Состояние склада</Typography>
                            <Typography variant="h4" component="div" sx={{ mt: 1 }}>{inventoryHealthIndex}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <WarningAmberIcon 
                                    sx={{ 
                                        color: inventoryHealthIndex < 60 ? theme.palette.error.main : theme.palette.secondary.main, 
                                        mr: 1 
                                    }} 
                                    fontSize="small" 
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {inventoryHealthIndex < 60 ? 'Требует внимания' : 'Нормальное состояние'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: `4px solid ${theme.palette.warning.main}`
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Заказы</Typography>
                            <Typography variant="h4" component="div" sx={{ mt: 1 }}>{totalOrders}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <ShowChartIcon sx={{ color: theme.palette.warning.main, mr: 1 }} fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                    Общее количество
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: `4px solid ${theme.palette.error.main}`
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Выручка</Typography>
                            <Typography variant="h4" component="div" sx={{ mt: 1 }}>{formatCurrency(totalRevenue)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TrendingUpIcon sx={{ color: theme.palette.error.main, mr: 1 }} fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                    Общая выручка
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    // --- Product & Inventory Section --- 
    const renderProductInventorySection = () => {
        const inventorySummary = detailedAnalytics?.productMetrics?.inventorySummary;
        const productsBelowReorder = inventorySummary?.productsBelowReorderLevelDetails || [];
        const categories = detailedAnalytics?.productMetrics?.byCategory || [];
        
        // Prepare data for category chart (Top 5 by revenue)
        const categoryChartData = [...categories]
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(cat => ({ 
                name: cat.category.length > 15 ? cat.category.substring(0, 12) + '...' : cat.category, // Shorten long names
                Выручка: cat.totalRevenue,
                Прибыль: cat.profitMargin
            }));

        const topCategoriesList = [...categories]
             .sort((a, b) => b.totalRevenue - a.totalRevenue)
             .slice(0, 5);

        return detailedAnalytics?.productMetrics && (
            <></>
        )
    };

    // --- Supplier Performance Section --- 
    const renderSupplierSection = () => {
        const suppliers = detailedAnalytics?.supplierMetrics || [];
        
        // Сначала выводим в консоль детальную информацию о поставщиках для отладки
        console.log('=== SUPPLIER DATA FOR TABLE ===');
        suppliers.forEach((supplier, index) => {
            console.log(`Supplier ${index + 1}:`, {
                id: supplier.supplier,
                name: supplier.supplierName,
                onTime: supplier.onTimeDelivery,
                late: supplier.lateDelivery,
                total: (supplier.onTimeDelivery || 0) + (supplier.lateDelivery || 0),
                orders: supplier.totalOrders,
            });
        });
        
        const topSuppliers = suppliers.slice(0, 5);

        // Check if we have actual supplier data
        if (suppliers.length === 0) {
            return (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>Аналитика по Поставщикам</Typography>
                    <Alert severity="info">Нет данных о поставщиках для отображения.</Alert>
                </Paper>
            );
        }

        // Prepare data for supplier comparison chart with proper data checking
        const supplierChartData = topSuppliers.map(s => ({
            name: s.supplierName && s.supplierName !== "Неизвестный поставщик" && s.supplierName !== "Без имени" 
                ? (s.supplierName.length > 15 ? s.supplierName.substring(0, 12) + '...' : s.supplierName) 
                : `Поставщик ${suppliers.indexOf(s) + 1}`,
            'Индекс эффективности': s.performanceScore || 0,
            'Доставки вовремя (%)': s.onTimeDeliveryPercentage || 0,
            'Качество': s.quality || 0
        }));

        // Data for delivery performance by supplier
        const deliveryPerformanceData = topSuppliers.map(s => ({
            name: s.supplierName && s.supplierName !== "Неизвестный поставщик" && s.supplierName !== "Без имени"
                ? (s.supplierName.length > 15 ? s.supplierName.substring(0, 12) + '...' : s.supplierName) 
                : `Поставщик ${suppliers.indexOf(s) + 1}`,
            'Вовремя': s.onTimeDelivery || 0,
            'С задержкой': s.lateDelivery || 0
        }));

        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Аналитика по Поставщикам</Typography>
                <Grid container spacing={3}>
                    {/* Supplier Performance Chart */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Сравнение Эффективности Поставщиков</Typography>
                        <Box sx={{ height: 320 }}> {/* Increased height for chart */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={supplierChartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    barSize={20}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name" 
                                        scale="band"
                                        fontSize={11}
                                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis 
                                        fontSize={11}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => {
                                            return [`${value}${name.includes('%') ? '%' : ''}`, name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="Индекс эффективности" fill={theme.palette.primary.main} />
                                    <Bar dataKey="Доставки вовремя (%)" fill={theme.palette.success.main} />
                                    <Bar dataKey="Качество" fill={theme.palette.info.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    
                    {/* Delivery Success by Supplier */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Доставки по Поставщикам</Typography>
                        <Box sx={{ height: 320 }}> {/* Match height with other chart */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={deliveryPerformanceData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    barSize={20}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" fontSize={11} />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        scale="band"
                                        fontSize={11}
                                        tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
                                        width={150}
                                    />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="Вовремя" stackId="a" fill={theme.palette.success.main} />
                                    <Bar dataKey="С задержкой" stackId="a" fill={theme.palette.error.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    
                    {/* Top Suppliers Table */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Детальная Информация по Поставщикам</Typography>
                         <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Поставщик</TableCell>
                                        <TableCell align="right">Всего заказов</TableCell>
                                        <TableCell align="right">Доставки вовремя</TableCell>
                                        <TableCell align="right">Вовремя (%)</TableCell>
                                        <TableCell align="right">Качество</TableCell>
                                        <TableCell align="right">Выручка</TableCell>
                                        <TableCell align="right">Эффективность</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {suppliers.length > 0 ? suppliers.map((s, index) => {
                                        // Правильный расчет процента доставок вовремя
                                        
                                        // Просто считаем процент доставок вовремя от общего числа доставок
                                        // без ограничения общим количеством заказов
                                        const totalDeliveries = (s.onTimeDelivery || 0) + (s.lateDelivery || 0);
                                        
                                        // Для показа процента полагаемся НА ИМЕЮЩИЕСЯ ДАННЫЕ без дополнительных проверок
                                        // Если у поставщика 30 успешных доставок из 30 общих - это 100%
                                        const onTimePercentage = totalDeliveries > 0 
                                            ? Math.round((s.onTimeDelivery || 0) * 100 / totalDeliveries) 
                                            : 0;
                                        
                                        // Используем предварительно рассчитанный performanceScore если он есть, 
                                        // или рассчитываем самостоятельно
                                        const performanceScore = s.performanceScore || 
                                            Math.round(
                                                (onTimePercentage * 0.4) + 
                                                ((s.quality || 0) * 0.4) + 
                                                ((s.costEfficiency || 0) * 0.2)
                                            ) || 0;
                                        
                                        // Выводим в консоль для отладки
                                        console.log(`Поставщик ${s.supplierName}:`, {
                                            totalOrders: s.totalOrders,
                                            onTimeDelivery: s.onTimeDelivery,
                                            lateDelivery: s.lateDelivery, 
                                            totalDeliveries,
                                            onTimePercentage,
                                            performanceScore
                                        });
                                        
                                        return (
                                            <TableRow key={s.supplier || `supplier-${index}`} 
                                                sx={{ 
                                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                                    ...(index < 3 ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {})
                                                }}
                                            >
                                                <TableCell>{s.supplierName || `Поставщик ${index + 1}`}</TableCell>
                                                <TableCell align="right">{s.totalOrders || 0}</TableCell>
                                                <TableCell align="right">{s.onTimeDelivery || 0}</TableCell>
                                                <TableCell align="right">{onTimePercentage}%</TableCell>
                                                <TableCell align="right">{s.quality || 0}</TableCell>
                                                <TableCell align="right">{formatCurrency(s.revenue || 0)}</TableCell>
                                                <TableCell align="right" sx={{ 
                                                    color: performanceScore > 80 ? 'success.main' : 
                                                          performanceScore > 60 ? 'warning.main' : 'error.main'
                                                }}>
                                                    {performanceScore}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">Нет данных о поставщиках</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    // --- Delivery Analytics Section --- 
    const renderDeliveryAnalyticsSection = () => {
        const deliveryMetrics = detailedAnalytics?.deliveryMetrics || {};
        const dailyDeliveryMetrics = detailedAnalytics?.dailyDeliveryMetrics || [];
        const regionMetrics = detailedAnalytics?.regionMetrics || [];
        const supplierMetrics = detailedAnalytics?.supplierMetrics || [];
        
        // Собираем суммарные данные о доставках из метрик поставщиков
        let totalOnTimeFromSuppliers = 0;
        let totalLateFromSuppliers = 0;
        
        supplierMetrics.forEach(supplier => {
            totalOnTimeFromSuppliers += supplier.onTimeDelivery || 0;
            totalLateFromSuppliers += supplier.lateDelivery || 0;
        });
        
        // Используем либо данные из deliveryMetrics, либо рассчитанные из supplierMetrics
        const onTimeDeliveries = deliveryMetrics.onTime || deliveryMetrics.onTimeDeliveries || totalOnTimeFromSuppliers;
        const delayedDeliveries = deliveryMetrics.delayed || deliveryMetrics.delayedDeliveries || totalLateFromSuppliers;
        
        // Рассчитываем процент успешных доставок
        const totalDeliveries = onTimeDeliveries + delayedDeliveries;
        const calculatedSuccessRate = totalDeliveries > 0 
            ? Math.round((onTimeDeliveries / totalDeliveries) * 100)
            : 0;
        
        // Используем либо данные из метрик, либо рассчитанные значения
        const deliverySuccessRate = deliveryMetrics.deliverySuccessRate || calculatedSuccessRate;
        const averageDeliveryTime = deliveryMetrics.averageDeliveryTime || 0;
        const deliveryEfficiencyIndex = deliveryMetrics.deliveryEfficiencyIndex || kpis?.deliveryEfficiencyIndex || 0;
        
        console.log("Данные о доставках:", {
            onTimeDeliveries,
            delayedDeliveries,
            totalDeliveries,
            deliverySuccessRate,
            fromMetrics: deliveryMetrics,
            fromSuppliers: {
                totalOnTime: totalOnTimeFromSuppliers,
                totalLate: totalLateFromSuppliers
            }
        });
        
        // Check if we have actual delivery data
        if (!deliveryMetrics && dailyDeliveryMetrics.length === 0 && totalDeliveries === 0) {
            return (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>Аналитика Доставок</Typography>
                    <Alert severity="info">Нет данных о доставках для отображения.</Alert>
                </Paper>
            );
        }
        
        // Prepare data for delivery trend chart
        const deliveryTrendData = [];
        if (dailyDeliveryMetrics.length > 0) {
            // Process the daily metrics and sort by date
            const sortedMetrics = [...dailyDeliveryMetrics].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            // Create data for trend chart - we'll show the last 14 days for better readability
            const recentMetrics = sortedMetrics.slice(-14); // Last 14 days
            
            if (recentMetrics.length > 0) {
                deliveryTrendData.push({
                    id: 'Своевременность (%)',
                    color: theme.palette.success.main,
                    data: recentMetrics.map(metric => ({
                        x: new Date(metric.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                        y: metric.deliverySuccessRate || 0
                    }))
                });
                
                deliveryTrendData.push({
                    id: 'Задержанные доставки',
                    color: theme.palette.error.main,
                    data: recentMetrics.map(metric => ({
                        x: new Date(metric.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                        y: metric.delayed || 0
                    }))
                });
            }
        }
        
        // Prepare data for regional performance
        const regionalData = [];
        if (regionMetrics.length > 0) {
            // Remove duplicates by region name
            const regionMap = {};
            
            regionMetrics.forEach(metric => {
                const region = metric.region || 'Неизвестный регион';
                if (!regionMap[region]) {
                    regionMap[region] = { ...metric };
                }
            });
            
            // Convert to array for chart
            Object.values(regionMap).forEach(region => {
                regionalData.push({
                    region: region.region,
                    'Среднее время доставки (дни)': region.averageDeliveryTime || 0,
                    'Количество заказов': region.orders || 0
                });
            });
            
            // Sort by delivery time (descending)
            regionalData.sort((a, b) => b['Среднее время доставки (дни)'] - a['Среднее время доставки (дни)']);
        }
        
        // Prepare data for pie chart
        const pieData = [
            {
                id: 'Вовремя',
                label: 'Доставлено вовремя',
                value: onTimeDeliveries,
                color: theme.palette.success.main
            },
            {
                id: 'С задержкой',
                label: 'С задержкой',
                value: delayedDeliveries,
                color: theme.palette.error.main
            }
        ];
        
        // Для отладки
        console.log('Delivery pie chart data:', { 
            totalOnTime: onTimeDeliveries, 
            totalDelayed: delayedDeliveries, 
            fromMetrics: { 
                onTime: deliveryMetrics.onTime, 
                delayed: deliveryMetrics.delayed,
                onTimeDeliveries: deliveryMetrics.onTimeDeliveries,
                delayedDeliveries: deliveryMetrics.delayedDeliveries
            },
            fromSuppliers: supplierMetrics.map(s => ({ 
                supplier: s.supplierName, 
                onTime: s.onTimeDelivery, 
                late: s.lateDelivery 
            }))
        });
        
        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Аналитика Доставок</Typography>
                <Grid container spacing={3}>
                    {/* Delivery KPIs */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ mb: 2, borderLeft: `4px solid ${theme.palette.success.main}` }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary">Своевременность</Typography>
                                <Typography variant="h4">{deliverySuccessRate}%</Typography>
                                <Typography variant="body2" color="textSecondary">Процент доставок вовремя</Typography>
                            </CardContent>
                        </Card>
                        
                        <Card sx={{ mb: 2, borderLeft: `4px solid ${theme.palette.info.main}` }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary">Среднее время</Typography>
                                <Typography variant="h4">{averageDeliveryTime} дн.</Typography>
                                <Typography variant="body2" color="textSecondary">Среднее время доставки</Typography>
                            </CardContent>
                        </Card>
                        
                        <Card sx={{ borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary">Индекс эффективности</Typography>
                                <Typography variant="h4">{deliveryEfficiencyIndex}</Typography>
                                <Typography variant="body2" color="textSecondary">Комбинированный показатель эффективности</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Delivery Success Rate Chart */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>Статистика Доставок</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {pieData.some(d => d.value > 0) ? (
                                    <BarChart
                                        data={pieData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        barSize={60}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`${value} заказов`, '']} />
                                        <Legend />
                                        <Bar 
                                            dataKey="value" 
                                            name="Количество заказов"
                                            fill={(d) => d.color}
                                            label={{ position: 'top', formatter: (value) => value }}
                                        />
                                    </BarChart>
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', pt: 10 }}>
                                        Нет данных для отображения
                                    </Typography>
                                )}
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    
                    {/* Delivery Trend Chart */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Тренд Своевременности Доставок</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {deliveryTrendData.length > 0 && deliveryTrendData[0].data.length > 0 ? (
                                    <LineChart
                                        data={[...deliveryTrendData[0].data]}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="x" 
                                            angle={-45} 
                                            textAnchor="end" 
                                            height={60} 
                                            fontSize={11}
                                        />
                                        <YAxis yAxisId="left" orientation="left" unit="%" />
                                        <Tooltip 
                                            formatter={(value, name) => {
                                                return [`${value}%`, 'Своевременность доставок'];
                                            }} 
                                        />
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="y" 
                                            stroke={theme.palette.success.main} 
                                            activeDot={{ r: 8 }}
                                            name="Своевременность (%)"
                                        />
                                    </LineChart>
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', pt: 10 }}>
                                        Нет данных для отображения
                                    </Typography>
                                )}
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    
                    {/* Regional Performance */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Эффективность по Регионам</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {regionalData.length > 0 ? (
                                    <BarChart
                                        data={regionalData.slice(0, 5)} // Show top 5 regions with longest delivery time
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                        barSize={20}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" fontSize={11} />
                                        <YAxis 
                                            dataKey="region" 
                                            type="category" 
                                            scale="band"
                                            fontSize={11}
                                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 13)}...` : value}
                                            width={120}
                                        />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar 
                                            dataKey="Среднее время доставки (дни)" 
                                            fill={theme.palette.warning.main}
                                        />
                                    </BarChart>
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', pt: 10 }}>
                                        Нет данных для отображения
                                    </Typography>
                                )}
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DashboardIcon sx={{ mr: 2, fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h4" component="h1">
                Панель Управления Аналитикой
            </Typography>
            </Box>

            {renderKpiCards()}
            {renderDeliveryAnalyticsSection()}
            {renderSupplierSection()}
            {renderProductInventorySection()}

            {!detailedAnalytics && !loading && (
                 <Alert severity="info">Детальная аналитика еще не сгенерирована. Пожалуйста, проверьте позже или запустите генерацию.</Alert>
            )}

        </Container>
    );
};

export default DashboardPage; 