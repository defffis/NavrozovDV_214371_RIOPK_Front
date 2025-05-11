import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Box,
    LinearProgress,
    Paper, // Для обертки таблиц или графиков
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline'; // Используем для нейтрального тренда или N/A
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Для графиков, если нужно

import { analyticsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

// Компонент для отображения отдельной метрики в карточке
const MetricCard = ({ title, value, suffix = '', trendValue, trendDirection, isLoading }) => {
    let TrendIcon = TimelineIcon;
    let trendColor = 'text.secondary';

    if (trendDirection === 'up') {
        TrendIcon = TrendingUpIcon;
        trendColor = 'success.main';
    } else if (trendDirection === 'down') {
        TrendIcon = TrendingDownIcon;
        trendColor = 'error.main';
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                {isLoading ? (
                    <CircularProgress size={24} />
                ) : (
                    <Typography variant="h4">
                        {value}{suffix}
                    </Typography>
                )}
                {trendValue !== undefined && !isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendIcon sx={{ color: trendColor, mr: 0.5 }} fontSize="small" />
                        <Typography variant="body2" sx={{ color: trendColor }}>
                            {trendValue > 0 ? `+${trendValue}` : trendValue}{suffix} (vs prev. period)
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const SupplierPerformancePage = () => {
    const { currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPerformanceData = useCallback(async () => {
        if (!currentUser || !currentUser._id) return;

        setLoading(true);
        setError(null);
        try {
            const response = await analyticsService.getSupplierPerformanceDetails(currentUser._id);
            if (response.success && response.data) {
                setPerformanceData(response.data);
            } else {
                throw new Error(response.message || 'Не удалось загрузить данные эффективности');
            }
        } catch (err) {
            console.error("Error fetching supplier performance:", err);
            setError(err.message || 'Ошибка при загрузке данных эффективности.');
            enqueueSnackbar(err.message || 'Ошибка при загрузке данных', { variant: 'error' });
            setPerformanceData(null);
        } finally {
            setLoading(false);
        }
    }, [currentUser, enqueueSnackbar]);

    useEffect(() => {
        fetchPerformanceData();
    }, [fetchPerformanceData]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!performanceData) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography>Данные по эффективности не найдены.</Typography>
            </Container>
        );
    }

    // Пример данных для графика (если будем использовать)
    // const deliveryTrendData = [
    //     { name: 'Янв', onTime: 80 }, { name: 'Фев', onTime: 85 }, { name: 'Мар', onTime: 90 },
    // ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Мои показатели эффективности
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="Всего заказов" value={performanceData.totalOrders} isLoading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard 
                        title="Выполнено в срок" 
                        value={performanceData.onTimeDeliveryPercentage} 
                        suffix="%" 
                        isLoading={loading} 
                        // trendValue={5} // Пример
                        // trendDirection="up" // Пример
                    />
                    {/* Можно добавить LinearProgress для наглядности */}
                    {!loading && performanceData.onTimeDeliveryPercentage !== undefined && (
                        <LinearProgress 
                            variant="determinate" 
                            value={performanceData.onTimeDeliveryPercentage} 
                            sx={{mt: 1}}
                            color={
                                performanceData.onTimeDeliveryPercentage >= 90 ? 'success' :
                                performanceData.onTimeDeliveryPercentage >= 70 ? 'warning' : 'error'
                            }
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="Общая выручка" value={performanceData.totalRevenue?.toLocaleString('ru-RU')} suffix=" ₽" isLoading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                     <MetricCard 
                        title="Рейтинг (Performance Score)" 
                        value={performanceData.performanceScore || 'N/A'} 
                        isLoading={loading} 
                    />
                </Grid>
                 {/* TODO: Добавить другие метрики: среднее время обработки, рост выручки (когда будут на бэке) */}
            </Grid>
            
            {/* TODO: Добавить секции с графиками или таблицами для более детального анализа */}
            {/* <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Тренд выполнения заказов в срок</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deliveryTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="onTime" fill="#82ca9d" name="Заказы в срок (%)"/>
                    </BarChart>
                </ResponsiveContainer>
            </Paper> */}

        </Container>
    );
};

export default SupplierPerformancePage; 