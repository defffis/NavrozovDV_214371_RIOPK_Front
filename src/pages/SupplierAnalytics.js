import React, { useState, useEffect, useCallback } from 'react';
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
    Tabs,
    Tab,
    Alert,
    useTheme,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Checkbox,
    ListItemText,
    OutlinedInput,
} from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';  
import { BarChart, LineChart, PieChart } from '@mui/x-charts';

import { analyticsService, supplierService, productService } from '../services/api';  
import SupplierPerformanceTable from '../components/Dashboard/SupplierPerformanceTable';

 
const mockMetrics = [
    { id: 'onTimeDeliveryRate', name: 'Уровень своевременности поставок (%)' },
    { id: 'qualityScore', name: 'Оценка качества товаров (1-5)' },
    { id: 'averageOrderValue', name: 'Средняя стоимость заказа (руб.)' },
    { id: 'defectRate', name: 'Уровень брака (%)' },
    { id: 'leadTime', name: 'Время выполнения заказа (дни)' },
];

 
const generateColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;  
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
};

 
const SupplierAnalytics = () => {
    const theme = useTheme();
    
 
    const [supplierMetrics, setSupplierMetrics] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('all');
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

   
    const [detailedSupplierInfo, setDetailedSupplierInfo] = useState(null);
    const [detailedProducts, setDetailedProducts] = useState([]);
    const [supplierSpecificPerformanceMetrics, setSupplierSpecificPerformanceMetrics] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    
    const [analyticsData, setAnalyticsData] = useState(null);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState([]);

    const [allSuppliers, setAllSuppliers] = useState([]);
    const [suppliersLoading, setSuppliersLoading] = useState(true);
    const [suppliersError, setSuppliersError] = useState(null);

    const [comparisonData, setComparisonData] = useState([]);
    const [comparisonLoading, setComparisonLoading] = useState(false);
    const [comparisonError, setComparisonError] = useState(null);

    
    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [supplierMetricsResponse, suppliersListResponse] = await Promise.all([
                analyticsService.getSupplierMetrics(startDate, endDate),
                supplierService.getSuppliers(),
            ]);
            
            const rawMetrics = supplierMetricsResponse.data || [];
            const suppliersList = suppliersListResponse || [];
            
            const enrichedMetrics = rawMetrics.map(metric => {
                const supplierDetails = suppliersList.find(s => s._id === metric.supplier);
               
                return {
                    ...metric,
                    name: supplierDetails ? supplierDetails.name : `Поставщик (ID: ${metric.supplier?.slice(-6) || 'N/A'})`,
                   
                    onTimeDelivery: metric.onTimeDelivery || 0,
                    lateDelivery: metric.lateDelivery || 0,
                    quality: metric.quality || 0,
                    costEfficiency: metric.costEfficiency || 0,
                    
                    onTimeDeliveryPercentage: 
                        metric.onTimeDelivery != null && metric.totalOrders > 0 
                            ? Math.round((metric.onTimeDelivery / metric.totalOrders) * 100) 
                            : 0,
                   
                    performanceScore: metric.performanceScore != null ? metric.performanceScore : 0
                };
            });
            
            setSupplierMetrics(enrichedMetrics);
            setSuppliers(suppliersList);
            
        } catch (err) {
            console.error('Error fetching initial supplier analytics data:', err);
            setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    
    const fetchSupplierDetails = useCallback(async (supplierId) => {
        const idToFetch = supplierId || selectedSupplier;
        
        if (idToFetch && idToFetch !== 'all') {
            setDetailsLoading(true);
            setDetailsError(null);
            setDetailedSupplierInfo(null);
            setDetailedProducts([]);
            setSupplierSpecificPerformanceMetrics(null);
            try {
                const [supplierInfoResponse, productsResponse, performanceMetricsResponse] = await Promise.all([
                    supplierService.getSupplier(idToFetch),
                    productService.getProducts({ supplierId: idToFetch, limit: 100, isActive: 'all' }),
                    analyticsService.getSupplierPerformanceDetails(idToFetch)
                ]);

                if (supplierInfoResponse) {
                    setDetailedSupplierInfo(supplierInfoResponse);
                } else {
                    console.warn('Не удалось получить основную информацию о поставщике.');
                }

                if (productsResponse && productsResponse.products) {
                    setDetailedProducts(productsResponse.products);
                } else {
                    setDetailedProducts([]);
                }

                if (performanceMetricsResponse && performanceMetricsResponse.data) {
                    setSupplierSpecificPerformanceMetrics(performanceMetricsResponse.data);
                } else {
                    console.warn('Не удалось получить детальные метрики производительности поставщика.');
                }

            } catch (err) {
                console.error('Error fetching supplier details and performance:', err);
                setDetailsError(err.message || 'Ошибка при загрузке детальной информации о поставщике.');
            } finally {
                setDetailsLoading(false);
            }
        } else {
            setDetailedSupplierInfo(null);
            setDetailedProducts([]);
            setSupplierSpecificPerformanceMetrics(null);
            setDetailsError(null);
        }
    }, [selectedSupplier]);

    useEffect(() => {
       
        if (tabValue === 2 && selectedSupplier !== 'all') {
            fetchSupplierDetails();
        } else if (selectedSupplier === 'all' && tabValue === 2) {
            
            setDetailedSupplierInfo(null);
            setDetailedProducts([]);
            setDetailsError(null);
        }
    }, [selectedSupplier, tabValue, fetchSupplierDetails]);
    
     
    const handleRefresh = () => {
        fetchInitialData(); 
        if (tabValue === 2 && selectedSupplier !== 'all') {
            fetchSupplierDetails();  
        }
    };
    
    const handleSupplierChange = (event) => {
        setSelectedSupplier(event.target.value);
        
      
        if (tabValue === 2 && event.target.value !== 'all') {
            fetchSupplierDetails(event.target.value);
        }
    };
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    
   
    const filteredMetrics =
        selectedSupplier === 'all'
            ? supplierMetrics
            : supplierMetrics.filter((metric) => metric.supplier === selectedSupplier);
    
    
    const preparePieChartData = () => {
        const dataForChart = filteredMetrics.length > 0 ? filteredMetrics : supplierMetrics;
        const topSuppliers = [...dataForChart]
            .sort((a, b) => b.totalOrders - a.totalOrders)
            .slice(0, 5);
        
        return topSuppliers.map((supplier) => ({
            id: supplier.name || `Поставщик ${supplier.supplier}`,
            label: supplier.name || `Поставщик ${supplier.supplier}`,
            value: supplier.totalOrders,
         
            color: generateColorFromString(supplier.supplier?.toString() || supplier.name || 'default'), 
        }));
    };
    
    
    const prepareBarChartData = () => {
        const dataForChart = filteredMetrics.length > 0 ? filteredMetrics : supplierMetrics;
        const topSuppliers = [...dataForChart]
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, 5);
        
        return topSuppliers.map((supplier) => ({
            supplierId: supplier.supplier,  
            supplierName: supplier.name || `Поставщик ${supplier.supplier}`,
            'Своевременность': supplier.totalOrders > 0 
                ? Math.round((supplier.onTimeDelivery / supplier.totalOrders) * 100) 
                : 0,
            'Качество': supplier.quality,
            'Эффективность затрат': supplier.costEfficiency,
        }));
    };
    
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                setAnalyticsData({ summary: "Общие аналитические данные загружены" }); 
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить аналитические данные');
                setLoading(false);
            }
        };
        fetchData();
    }, []);
 
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setSuppliersLoading(true);
                const data = await supplierService.getSuppliers();
                 setAllSuppliers(data.suppliers || data); 
                setSuppliersLoading(false);
            } catch (err) {
                setSuppliersError(err.message || 'Не удалось загрузить список поставщиков');
                setSuppliersLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

   
    useEffect(() => {
        const fetchComparisonData = async () => {
            if (selectedSuppliers.length > 0 && selectedMetrics.length > 0) {
                setComparisonLoading(true);
                setComparisonError(null);
                try {
                    const result = await analyticsService.getSupplierComparisonData(selectedSuppliers, selectedMetrics);
                
                    setComparisonData(result.data || result || []);
                } catch (err) {
                    setComparisonError(err.message || 'Не удалось загрузить данные для сравнения');
                    setComparisonData([]);  
                } finally {
                    setComparisonLoading(false);
                }
            }
        };

        fetchComparisonData();
    }, [selectedSuppliers, selectedMetrics]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Заголовок и фильтры */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Аналитика поставщиков
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Поставщик</InputLabel>
                        <Select
                            value={selectedSupplier}
                            onChange={handleSupplierChange}
                            label="Поставщик"
                            startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                        >
                            <MenuItem value="all">Все поставщики</MenuItem>
                            {suppliers.map((supplier) => (
                                <MenuItem key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading || detailsLoading}
                    >
                        Обновить
                    </Button>
                </Box>
            </Box>
            
            {/* Ошибка */}
            {(error || detailsError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || detailsError}
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
                    {/* Вкладки */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="supplier analytics tabs"
                            centered
                        >
                            <Tab label="Общий анализ" />
                            <Tab label="Сравнительный анализ" />
                            
                        </Tabs>
                    </Box>
                    
                    {/* Содержимое вкладки "Общий анализ" */}
                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                 
                            </Grid>
                            
                            
                            
                            <Grid item xs={12}>
                                <SupplierPerformanceTable
                                    data={filteredMetrics}
                                    title="Детальный анализ эффективности поставщиков"
                                />
                            </Grid>
                        </Grid>
                    )}
                    
                    {tabValue === 1 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Сравнительный анализ поставщиков
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    {suppliersLoading && <CircularProgress sx={{ mb: 2 }} />}
                                    {suppliersError && <Alert severity="error" sx={{ mb: 2 }}>{suppliersError}</Alert>}
                                    {!suppliersLoading && !suppliersError && allSuppliers.length === 0 && (
                                        <Alert severity="info" sx={{ mb: 2 }}>Список поставщиков пуст или не загружен.</Alert>
                                    )}
                                    {!suppliersLoading && !suppliersError && allSuppliers.length > 0 && (
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel id="multiple-supplier-select-label">Выберите поставщиков</InputLabel>
                                            <Select
                                                labelId="multiple-supplier-select-label"
                                                id="multiple-supplier-select"
                                                multiple
                                                value={selectedSuppliers}
                                                onChange={(e) => setSelectedSuppliers(e.target.value)}
                                                input={<OutlinedInput label="Выберите поставщиков" />}
                                                renderValue={(selected) => selected.map(id => (allSuppliers.find(s => s.id === id || s._id === id))?.name).join(', ')}
                                            >
                                                {allSuppliers.map((supplier) => (
                                                    // Use supplier._id if your backend returns _id, or supplier.id if it returns id
                                                    <MenuItem key={supplier._id || supplier.id} value={supplier._id || supplier.id}> 
                                                        <Checkbox checked={selectedSuppliers.indexOf(supplier._id || supplier.id) > -1} />
                                                        <ListItemText primary={supplier.name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}

                                    <FormControl fullWidth sx={{ mb: 2, mt: suppliersLoading || suppliersError || allSuppliers.length === 0 ? 0 : 0 }}>
                                        <InputLabel id="multiple-metric-select-label">Выберите метрики</InputLabel>
                                        <Select
                                            labelId="multiple-metric-select-label"
                                            id="multiple-metric-select"
                                            multiple
                                            value={selectedMetrics}
                                            onChange={(e) => setSelectedMetrics(e.target.value)}
                                            input={<OutlinedInput label="Выберите метрики" />}
                                            renderValue={(selected) => selected.map(id => mockMetrics.find(m => m.id === id)?.name).join(', ')}
                                        >
                                            {mockMetrics.map((metric) => (
                                                <MenuItem key={metric.id} value={metric.id}>
                                                    <Checkbox checked={selectedMetrics.indexOf(metric.id) > -1} />
                                                    <ListItemText primary={metric.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Display Comparison Table */}
                                    {(selectedSuppliers.length > 0 && selectedMetrics.length > 0) ? (
                                        comparisonLoading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, mt: 3 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : comparisonError ? (
                                            <Alert severity="error" sx={{ mt: 3 }}>{comparisonError}</Alert>
                                        ) : comparisonData && comparisonData.length > 0 ? (
                                            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 1 }}>
                                                <Table aria-label="comparative analysis table">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                                            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Поставщик</TableCell>
                                                            {selectedMetrics.map(metricId => {
                                                                const metric = mockMetrics.find(m => m.id === metricId);
                                                                return (
                                                                    <TableCell key={metricId} align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>
                                                                        {metric ? metric.name : metricId}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {comparisonData.map((row, index) => (
                                                            <TableRow key={row.supplierId || index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                                                                    {/* Assuming backend provides supplierName or we look it up */}
                                                                    {row.supplierName || allSuppliers.find(s => s.id === row.supplierId || s._id === row.supplierId)?.name || 'Unknown'}
                                                                </TableCell>
                                                                {selectedMetrics.map(metricId => (
                                                                    <TableCell key={metricId} align="right">
                                                                        {row[metricId] !== undefined ? row[metricId] : 'N/A'}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Box sx={{ minHeight: 200, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, p: 2, mt: 3 }}>
                                                <Typography color="text.secondary">
                                                    Нет данных для отображения. Убедитесь, что API возвращает данные для выбранных поставщиков и метрик.
                                                </Typography>
                                            </Box>
                                        )
                                    ) : (
                                        <Box sx={{ minHeight: 200, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, p: 2, mt: 3 }}>
                                            <Typography color="text.secondary">
                                                Выберите поставщиков и метрики для отображения сравнительного анализа.
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                    
                    {tabValue === 2 && (
                        <Paper sx={{ p: 2, mt: 2, borderRadius: 2, boxShadow: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                Детальная информация о поставщике: {detailedSupplierInfo ? detailedSupplierInfo.name : (selectedSupplier !== 'all' ? 'Загрузка...' : '')}
                            </Typography>
                            {detailsLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
                            )}
                            {!detailsLoading && detailsError && (
                                <Alert severity="error">{detailsError}</Alert>
                            )}
                            {!detailsLoading && !detailsError && selectedSupplier === 'all' && (
                                <Alert severity="info">Выберите поставщика из списка выше для просмотра детальной информации.</Alert>
                            )}
                            {!detailsLoading && !detailsError && selectedSupplier !== 'all' && !detailedSupplierInfo && (
                                <Alert severity="warning">Не удалось загрузить информацию о поставщике.</Alert>
                            )}
                            {!detailsLoading && !detailsError && detailedSupplierInfo && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h5" component="div" gutterBottom>
                                                    {detailedSupplierInfo.name}
                                                </Typography>
                                                <Typography color="text.secondary" gutterBottom>
                                                    ID: {detailedSupplierInfo._id}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Email:</strong> {detailedSupplierInfo.contact?.email || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Телефон:</strong> {detailedSupplierInfo.contact?.phone || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Адрес:</strong> {detailedSupplierInfo.address?.street}, {detailedSupplierInfo.address?.city}, {detailedSupplierInfo.address?.zipCode} {detailedSupplierInfo.address?.country}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt:1 }}>
                                                    <strong>Зарегистрирован:</strong> {new Date(detailedSupplierInfo.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        
                                        {/* Новая карточка для метрик производительности */} 
                                        {supplierSpecificPerformanceMetrics && (
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6" component="div" gutterBottom>
                                                        Ключевые показатели
                                                    </Typography>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Typography variant="body2"><strong>Всего заказов:</strong> {supplierSpecificPerformanceMetrics.totalOrders ?? 'N/A'}</Typography>
                                                    <Typography variant="body2"><strong>Завершено заказов:</strong> {supplierSpecificPerformanceMetrics.completedOrders ?? 'N/A'}</Typography>
                                                    <Typography variant="body2"><strong>Своевременных доставок (кол-во):</strong> {supplierSpecificPerformanceMetrics.onTimeDelivery ?? 'N/A'}</Typography>
                                                    <Typography variant="body2"><strong>Своевременность (%):</strong> {supplierSpecificPerformanceMetrics.onTimeDeliveryPercentage ?? 'N/A'}%</Typography>
                                                    <Typography variant="body2"><strong>Общий доход:</strong> {supplierSpecificPerformanceMetrics.totalRevenue?.toLocaleString('ru-RU') ?? 'N/A'} ₽</Typography>
                                                    <Typography variant="body2"><strong>Общий рейтинг производительности:</strong> {supplierSpecificPerformanceMetrics.performanceScore ?? 'N/A'} / 100</Typography>
                                                    {/* <Typography variant="body2">Среднее время обработки: {supplierSpecificPerformanceMetrics.averageProcessingTime ?? 'N/A'} дней</Typography> */}
                                                    {/* <Typography variant="body2">Рост дохода: {supplierSpecificPerformanceMetrics.revenueGrowth ?? 'N/A'}%</Typography> */}
                                                    {/* Можно добавить и другие метрики, если они есть и релевантны */}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h6" gutterBottom>Товары поставщика ({detailedProducts.length})</Typography>
                                        {detailedProducts.length > 0 ? (
                                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                                                <Table stickyHeader size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Наименование</TableCell>
                                                            <TableCell>Артикул</TableCell>
                                                            <TableCell>Категория</TableCell>
                                                            <TableCell align="right">Цена (₽)</TableCell>
                                                            <TableCell align="right">Остаток</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {detailedProducts.map(product => (
                                                            <TableRow hover key={product._id}>
                                                                <TableCell>{product.name}</TableCell>
                                                                <TableCell>{product.sku}</TableCell>
                                                                <TableCell>{product.category}</TableCell>
                                                                <TableCell align="right">{product.price?.toLocaleString('ru-RU')}</TableCell>
                                                                <TableCell align="right">{product.stockQuantity}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography>У этого поставщика пока нет товаров.</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            )}
                        </Paper>
                    )}
                </>
            )}
        </Container>
    );
};

export default SupplierAnalytics; 