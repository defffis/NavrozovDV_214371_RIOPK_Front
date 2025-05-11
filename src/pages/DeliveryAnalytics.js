import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
    Card,
    CardContent,
    Alert,
    useTheme,
    TextField,
    Stack,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

import { analyticsService, supplierService } from '../services/api';
import DeliveryPerformanceChart from '../components/Dashboard/DeliveryPerformanceChart';
import KPICard from '../components/Dashboard/KPICard';

 
const DeliveryAnalytics = () => {
    const theme = useTheme();
    
 
    const [deliveryMetrics, setDeliveryMetrics] = useState(null);
    const [dailyDeliveryMetrics, setDailyDeliveryMetrics] = useState([]);
    const [regionMetrics, setRegionMetrics] = useState([]);
    const [supplierMetrics, setSupplierMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [tabValue, setTabValue] = useState(0);
    
 
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const [startDate, setStartDate] = useState(sixMonthsAgo);
    const [endDate, setEndDate] = useState(today);
    
 
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            
            const suppliersResponse = await supplierService.getSuppliers();
            console.log("Полученные данные о поставщиках:", suppliersResponse);
            
         
            const suppliersMap = {};
            if (Array.isArray(suppliersResponse)) {
                suppliersResponse.forEach(supplier => {
                    if (supplier._id) {
                        suppliersMap[supplier._id] = supplier;
                    }
                });
            }
            
          
            const [deliveryResponse, dailyAnalyticsResponse, regionResponse, supplierResponse] = await Promise.all([
                analyticsService.getDeliveryKPIs(startDateStr, endDateStr),
                analyticsService.getDeliveryDailyMetrics(startDateStr, endDateStr),
                analyticsService.getDeliveryRegionMetrics(startDateStr, endDateStr),
                analyticsService.getSupplierMetrics(startDateStr, endDateStr)
            ]);
            
            console.log("Загруженные данные:", {
                delivery: deliveryResponse,
                daily: dailyAnalyticsResponse,
                region: regionResponse,
                supplier: supplierResponse
            });
            
        
            let deliveryMetricsData = {};
            if (deliveryResponse && deliveryResponse.data) {
               
                deliveryMetricsData = { ...deliveryResponse.data };
                
            
                if (supplierResponse && supplierResponse.data && Array.isArray(supplierResponse.data)) {
                     
                    const totalOnTime = supplierResponse.data.reduce((sum, s) => sum + (s.onTimeDelivery || 0), 0);
                    const totalLate = supplierResponse.data.reduce((sum, s) => sum + (s.lateDelivery || 0), 0);
                    const totalDeliveries = totalOnTime + totalLate;
                    
                  
                    if (!deliveryMetricsData.onTimeDeliveries) deliveryMetricsData.onTimeDeliveries = totalOnTime;
                    if (!deliveryMetricsData.delayedDeliveries) deliveryMetricsData.delayedDeliveries = totalLate;
                    
                 
                    if (totalDeliveries > 0) {
                        const calculatedSuccessRate = Math.round((totalOnTime / totalDeliveries) * 100);
                        
                        if (!deliveryMetricsData.deliverySuccessRate || 
                            Math.abs(deliveryMetricsData.deliverySuccessRate - calculatedSuccessRate) > 5) {
                            deliveryMetricsData.deliverySuccessRate = calculatedSuccessRate;
                        }
                    }
                }
            }
            
            setDeliveryMetrics(deliveryMetricsData);
            
          
            if (dailyAnalyticsResponse && dailyAnalyticsResponse.data && Array.isArray(dailyAnalyticsResponse.data)) {
                setDailyDeliveryMetrics(dailyAnalyticsResponse.data);
            } else {
              
                setDailyDeliveryMetrics([]);
                console.warn('Daily analytics data is not in expected format:', dailyAnalyticsResponse?.data);
            }
            
         
            if (regionResponse && regionResponse.data && Array.isArray(regionResponse.data)) {
                setRegionMetrics(regionResponse.data);
            } else {
                setRegionMetrics([]);
            }
            
         
            if (supplierResponse && supplierResponse.data && Array.isArray(supplierResponse.data)) {
                const processedSupplierMetrics = supplierResponse.data.map(metric => {
                 
                    const supplier = suppliersMap[metric.supplier];
                    
               
                    const totalDeliveries = (metric.onTimeDelivery || 0) + (metric.lateDelivery || 0);
                    
                  
                    const onTimePercentage = totalDeliveries > 0 
                        ? Math.round((metric.onTimeDelivery || 0) * 100 / totalDeliveries) 
                        : 0;
 
                    const supplierName = (supplier && supplier.name) 
                        ? supplier.name 
                        : (metric.supplierName || 'Поставщик без имени');
                    
                    return {
                        ...metric,
                        supplierName,
                        onTimeDeliveryPercentage: onTimePercentage
                    };
                });
                
                setSupplierMetrics(processedSupplierMetrics);
            } else {
                setSupplierMetrics([]);
            }
            
        } catch (err) {
            console.error('Error fetching delivery analytics data:', err);
            setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };
    
 
    useEffect(() => {
        fetchData();
    }, [startDate, endDate, period]);
    
 
    const handleRefresh = () => {
        
        fetchData();
    };
    
    const handlePeriodChange = (event) => {
        const newPeriod = event.target.value;
        setPeriod(newPeriod);
        
       
        const newEndDate = new Date();
        let newStartDate = new Date();
        
        switch (newPeriod) {
            case 'weekly':
                newStartDate.setDate(newEndDate.getDate() - 7);
                break;
            case 'monthly':
                newStartDate.setMonth(newEndDate.getMonth() - 1);
                break;
            case 'quarterly':
                newStartDate.setMonth(newEndDate.getMonth() - 3);
                break;
            case 'yearly':
                newStartDate.setFullYear(newEndDate.getFullYear() - 1);
                break;
            default:
                newStartDate.setMonth(newEndDate.getMonth() - 6);
        }
        
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    
   
    const prepareDeliveryPerformanceData = () => {
        if (!dailyDeliveryMetrics || dailyDeliveryMetrics.length === 0) {
            return [];
        }

      
        const sortedMetrics = [...dailyDeliveryMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));

        const onTimeSeries = {
            id: 'Доставки вовремя (%)',
            color: theme.palette.success.main,
            data: sortedMetrics.map(metric => ({
                x: new Date(metric.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                y: metric.deliverySuccessRate !== undefined ? metric.deliverySuccessRate : 0
            }))
        };
        
        
        const delayedSeries = {
            id: 'Задержанные доставки (кол-во)',
            color: theme.palette.error.main,
            data: sortedMetrics.map(metric => ({
                 x: new Date(metric.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                 y: metric.delayed !== undefined ? metric.delayed : 0
            }))
        };

        return [onTimeSeries, delayedSeries];  
    };
    
 
    const prepareRegionalPerformanceData = () => {
        if (!regionMetrics || regionMetrics.length === 0) {
            return [];
        }

       
        const aggregatedByRegion = regionMetrics.reduce((acc, metric) => {
            const regionName = metric.region || 'Неизвестный регион';
            if (!acc[regionName]) {
                acc[regionName] = {
                    region: regionName,
                    totalOrders: 0,
                    totalRevenue: 0,
                    onTimeDeliveriesSum: 0, 
                    totalDeliveriesSum: 0,  
                    
                };
            }
            acc[regionName].totalOrders += metric.totalOrders || 0;
            acc[regionName].totalRevenue += metric.totalRevenue || 0;
            
            
          
            const dailyOnTime = Math.round((metric.onTimePercentage || 0) / 100 * 5);
            acc[regionName].onTimeDeliveriesSum += dailyOnTime;
            acc[regionName].totalDeliveriesSum += 5;
            
        
            
            return acc;
        }, {});
 
        const barChartData = Object.values(aggregatedByRegion).map(agg => ({
            region: agg.region,
            'Заказы вовремя (%)': agg.totalDeliveriesSum > 0 
                ? Math.round((agg.onTimeDeliveriesSum / agg.totalDeliveriesSum) * 100) 
                : 0,
             
        })); 

        
        barChartData.sort((a, b) => b['Заказы вовремя (%)'] - a['Заказы вовремя (%)']);

        return barChartData;
    };
    
    
    const prepareDeliveryPieData = () => {
        if (!deliveryMetrics) {
            return [];
        }
        
        let onTime = deliveryMetrics.onTimeDeliveries;
        let delayed = deliveryMetrics.delayedDeliveries;
        
      
        if ((onTime === undefined || delayed === undefined) && supplierMetrics && supplierMetrics.length > 0) {
            onTime = supplierMetrics.reduce((sum, s) => sum + (s.onTimeDelivery || 0), 0);
            delayed = supplierMetrics.reduce((sum, s) => sum + (s.lateDelivery || 0), 0);
        }
        
     
        onTime = Number(onTime) || 0;
        delayed = Number(delayed) || 0;
        
       
        console.log("Данные для круговой диаграммы:", { onTime, delayed });
        
        return [
            {
                id: 'Доставлено вовремя',
                label: 'Доставлено вовремя',
                value: onTime,
                color: theme.palette.success.main
            },
            {
                id: 'Задержано',
                label: 'Задержано',
                value: delayed,
                color: theme.palette.error.main
            }
        ];
    };
    
   
    const prepareSupplierPerformanceData = () => {
        if (!supplierMetrics || supplierMetrics.length === 0) {
            return [];
        }
        
       
        const sortedSuppliers = [...supplierMetrics]
            .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
            .slice(0, 10); 
        
        return sortedSuppliers.map(supplier => {
           
            console.log(`Поставщик для графика: ${supplier.supplierName}`, {
                onTimeDelivery: supplier.onTimeDelivery,
                totalDeliveries: (supplier.onTimeDelivery || 0) + (supplier.lateDelivery || 0),
                onTimePercentage: supplier.onTimeDeliveryPercentage,
                quality: supplier.quality,
                performance: supplier.performanceScore
            });
            
            return {
                supplier: supplier.supplierName,
                'Доставки вовремя (%)': supplier.onTimeDeliveryPercentage || 0,
                'Качество': supplier.quality || 0,
                'Эффективность': supplier.performanceScore || 0
            };
        });
    };
    
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Заголовок и фильтры */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Аналитика доставок
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Период</InputLabel>
                        <Select
                            value={period}
                            onChange={handlePeriodChange}
                            label="Период"
                            startAdornment={<FilterAltIcon sx={{ mr: 1 }} />}
                        >
                            <MenuItem value="weekly">Неделя</MenuItem>
                            <MenuItem value="monthly">Месяц</MenuItem>
                            <MenuItem value="quarterly">Квартал</MenuItem>
                            <MenuItem value="yearly">Год</MenuItem>
                            <MenuItem value="custom">Настраиваемый</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                        <Stack direction="row" spacing={2}>
                            <DatePicker
                                label="С даты"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: { width: 150 },
                                        variant: 'outlined'
                                    }
                                }}
                                disabled={period !== 'custom'}
                            />
                            <DatePicker
                                label="По дату"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: { width: 150 },
                                        variant: 'outlined'
                                    }
                                }}
                                disabled={period !== 'custom'}
                            />
                        </Stack>
                    </LocalizationProvider>
                    
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
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* KPI показатели */}
                    <Grid item xs={12} md={3}>
                        <KPICard
                            title="Коэффициент своевременности"
                                value={Number(deliveryMetrics?.deliverySuccessRate) || 0}
                            previousValue={78}
                            maxValue={100}
                            unit="%"
                            description="Доставки вовремя"
                            color="#4caf50"
                            icon={ThumbUpIcon}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <KPICard
                            title="Среднее время доставки"
                                value={Number(deliveryMetrics?.averageDeliveryTime) || 0}
                            previousValue={3.2}
                            maxValue={7}
                            unit=" дн."
                            description="Дней в среднем"
                            color="#2196f3"
                            icon={QueryStatsIcon}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <KPICard
                            title="Задержки доставок"
                                value={Number(deliveryMetrics?.delayedDeliveries) || 0}
                            previousValue={12}
                            maxValue={100}
                            unit=""
                            description="Количество задержек"
                            color="#f44336"
                            icon={PriorityHighIcon}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <KPICard
                                title="Индекс эффективности"
                                value={Number(deliveryMetrics?.deliveryEfficiencyIndex) || 0}
                                previousValue={82}
                                maxValue={100}
                            unit=""
                                description="Общая эффективность"
                            color="#ff9800"
                                icon={SpeedIcon}
                        />
                        </Grid>
                    </Grid>
                    
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="delivery analytics tabs">
                            <Tab label="Обзор" />
                            <Tab label="Анализ поставщиков" />
                            <Tab label="Региональная аналитика" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                    {/* Графики производительности доставок */}
                            <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Typography variant="h6" gutterBottom>Тренд эффективности доставки</Typography>
                            <DeliveryPerformanceChart data={prepareDeliveryPerformanceData()} />
                        </Paper>
                    </Grid>
                            
                            {/* Круговая диаграмма доставок */}
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2, height: 400 }}>
                                    <Typography variant="h6" gutterBottom>Статистика доставок</Typography>
                                    <Box sx={{ height: 320 }}>
                                        <ResponsivePie
                                            data={prepareDeliveryPieData()}
                                            margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                                            innerRadius={0.5}
                                            padAngle={0.7}
                                            cornerRadius={3}
                                            activeOuterRadiusOffset={8}
                                            colors={{ scheme: 'set2' }}
                                            borderWidth={1}
                                            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                            arcLinkLabelsSkipAngle={10}
                                            arcLinkLabelsTextColor="#333333"
                                            arcLinkLabelsThickness={2}
                                            arcLinkLabelsColor={{ from: 'color' }}
                                            arcLabelsSkipAngle={10}
                                            arcLabelsTextColor="#ffffff"
                                            defs={[
                                                {
                                                    id: 'dots',
                                                    type: 'patternDots',
                                                    background: 'inherit',
                                                    color: 'rgba(255, 255, 255, 0.3)',
                                                    size: 4,
                                                    padding: 1,
                                                    stagger: true
                                                },
                                                {
                                                    id: 'lines',
                                                    type: 'patternLines',
                                                    background: 'inherit',
                                                    color: 'rgba(255, 255, 255, 0.3)',
                                                    rotation: -45,
                                                    lineWidth: 6,
                                                    spacing: 10
                                                }
                                            ]}
                                            legends={[
                                                {
                                                    anchor: 'bottom',
                                                    direction: 'row',
                                                    justify: false,
                                                    translateX: 0,
                                                    translateY: 30,
                                                    itemsSpacing: 0,
                                                    itemWidth: 100,
                                                    itemHeight: 18,
                                                    itemTextColor: '#999',
                                                    itemDirection: 'left-to-right',
                                                    itemOpacity: 1,
                                                    symbolSize: 18,
                                                    symbolShape: 'circle',
                                                }
                                            ]}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                    
                    {/* Сводная информация */}
                            <Grid item xs={12}>
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Сводная информация о доставках
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                        <Grid container spacing={4}>
                                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Общая статистика:
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Всего доставок:</span>
                                                        <strong>{(Number(deliveryMetrics?.onTimeDeliveries) || 0) + (Number(deliveryMetrics?.delayedDeliveries) || 0)}</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Доставлено вовремя:</span>
                                                        <strong>{Number(deliveryMetrics?.onTimeDeliveries) || 0}</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Доставлено с задержкой:</span>
                                                        <strong>{Number(deliveryMetrics?.delayedDeliveries) || 0}</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Среднее время доставки:</span>
                                                        <strong>{Number(deliveryMetrics?.averageDeliveryTime) || 0} дней</strong>
                                    </Typography>
                                </Box>
                                            </Grid>
                                
                                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Проблемные регионы:
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                                    {regionMetrics && regionMetrics.length > 0 ? (
                                    <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                                            {[...regionMetrics]
                                                                .sort((a, b) => (b.averageDeliveryTime || 0) - (a.averageDeliveryTime || 0))
                                                                .slice(0, 3)
                                                                .map((region, index) => (
                                                                    <li key={index}>
                                                                        {region.region} ({region.averageDeliveryTime || 0} дня)
                                                                    </li>
                                                                ))}
                                    </ol>
                                                    ) : (
                                                        <Typography variant="body2">Нет данных по регионам</Typography>
                                                    )}
                                </Box>
                                            </Grid>
                                
                                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Рекомендации:
                                </Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                    {supplierMetrics && supplierMetrics.length > 0 && supplierMetrics.some(s => (s.onTimeDeliveryPercentage || 0) < 50) && (
                                                        <li>
                                                            <Typography variant="body2">
                                                                Проанализировать поставщиков с низким % своевременных доставок
                                                            </Typography>
                                                        </li>
                                                    )}
                                                    {regionMetrics && regionMetrics.length > 0 && regionMetrics.some(r => (r.averageDeliveryTime || 0) > 4) && (
                                    <li>
                                        <Typography variant="body2">
                                                                Оптимизировать маршруты в регионах с долгим временем доставки
                                        </Typography>
                                    </li>
                                                    )}
                                    <li>
                                        <Typography variant="body2">
                                                            Улучшить координацию с логистическими службами
                                        </Typography>
                                    </li>
                                </Box>
                                            </Grid>
                                        </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, overflow: 'hidden' }}>
                                    <Typography variant="h6" gutterBottom>Эффективность поставщиков</Typography>
                                    <TableContainer sx={{ maxHeight: 440 }}>
                                        <Table stickyHeader aria-label="supplier performance table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Поставщик</TableCell>
                                                    <TableCell align="right">Всего заказов</TableCell>
                                                    <TableCell align="right">Доставки вовремя</TableCell>
                                                    <TableCell align="right">Вовремя (%)</TableCell>
                                                    <TableCell align="right">Качество</TableCell>
                                                    <TableCell align="right">Индекс эффективности</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {supplierMetrics.map((supplier, index) => (
                                                    <TableRow 
                                                        key={index} 
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        hover
                                                    >
                                                        <TableCell component="th" scope="row">{supplier.supplierName}</TableCell>
                                                        <TableCell align="right">{supplier.totalOrders || 0}</TableCell>
                                                        <TableCell align="right">{supplier.onTimeDelivery || 0}</TableCell>
                                                        <TableCell align="right">{supplier.onTimeDeliveryPercentage || 0}%</TableCell>
                                                        <TableCell align="right">{supplier.quality || 0}</TableCell>
                                                        <TableCell align="right">{supplier.performanceScore || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, height: 400 }}>
                                    <Typography variant="h6" gutterBottom>Сравнение эффективности поставщиков</Typography>
                                    <ResponsiveBar
                                        data={prepareSupplierPerformanceData()}
                                        keys={['Доставки вовремя (%)', 'Качество', 'Эффективность']}
                                        indexBy="supplier"
                                        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                                        padding={0.3}
                                        valueScale={{ type: 'linear' }}
                                        indexScale={{ type: 'band', round: true }}
                                        colors={{ scheme: 'nivo' }}
                                        defs={[
                                            {
                                                id: 'dots',
                                                type: 'patternDots',
                                                background: 'inherit',
                                                color: '#38bcb2',
                                                size: 4,
                                                padding: 1,
                                                stagger: true
                                            },
                                            {
                                                id: 'lines',
                                                type: 'patternLines',
                                                background: 'inherit',
                                                color: '#eed312',
                                                rotation: -45,
                                                lineWidth: 6,
                                                spacing: 10
                                            }
                                        ]}
                                        fill={[
                                            {
                                                match: {
                                                    id: 'Эффективность'
                                                },
                                                id: 'dots'
                                            },
                                            {
                                                match: {
                                                    id: 'Качество'
                                                },
                                                id: 'lines'
                                            }
                                        ]}
                                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: -45,
                                            legend: 'Поставщик',
                                            legendPosition: 'middle',
                                            legendOffset: 40
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Значение',
                                            legendPosition: 'middle',
                                            legendOffset: -40
                                        }}
                                        labelSkipWidth={12}
                                        labelSkipHeight={12}
                                        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                        legends={[
                                            {
                                                dataFrom: 'keys',
                                                anchor: 'bottom-right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 120,
                                                translateY: 0,
                                                itemsSpacing: 2,
                                                itemWidth: 100,
                                                itemHeight: 20,
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 0.85,
                                                symbolSize: 20,
                                                effects: [
                                                    {
                                                        on: 'hover',
                                                        style: {
                                                            itemOpacity: 1
                                                        }
                                                    }
                                                ]
                                            }
                                        ]}
                                        animate={true}
                                        motionStiffness={90}
                                        motionDamping={15}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 2 && (
                        <Grid container spacing={3}>
                    {/* График региональной эффективности */}
                            <Grid item xs={12}>
                         <Paper sx={{ p: 2, height: 400 }}>
                             <Typography variant="h6" gutterBottom>Эффективность по регионам</Typography>
                              <ResponsiveBar
                                data={prepareRegionalPerformanceData()}
                                keys={['Заказы вовремя (%)']}
                                indexBy="region"
                                margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
                                padding={0.3}
                                valueScale={{ type: 'linear' }}
                                indexScale={{ type: 'band', round: true }}
                                colors={{ scheme: 'nivo' }}
                                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'Регион',
                                    legendPosition: 'middle',
                                    legendOffset: 32
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'Доставлено вовремя (%)',
                                    legendPosition: 'middle',
                                    legendOffset: -45,
                                    format: value => `${value}%`
                                }}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                legends={[]}
                                animate={true}
                                motionStiffness={90}
                                motionDamping={15}
                             />
                         </Paper>
                    </Grid>
                </Grid>
                    )}
                </>
            )}
        </Container>
    );
};

export default DeliveryAnalytics; 