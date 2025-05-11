import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,  
    Tooltip,
    Chip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import DownloadIcon from '@mui/icons-material/Download';

import { analyticsService, supplierService } from '../../services/api';  
import { useSnackbar } from 'notistack';

 
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

 
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

 
const convertToCSV = (data, columns) => {
    if (!data || data.length === 0) return '';

    const header = columns.map(col => `"${col.label}"`).join(',');
    const rows = data.map(row => 
        columns.map(col => {
            let value = row[col.id];
            
            if (col.id === 'revenue') {
                value = value?.toLocaleString('ru-RU'); 
            } else if (col.id === 'onTimeDeliveryPercentage') {
                value = `${value}%`;
            } else if (typeof value === 'number') {
                value = value?.toLocaleString('ru-RU');
            }
    
            const stringValue = String(value ?? '');
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return `"${stringValue}"`;
        }).join(',')
    );

    return [header, ...rows].join('\n');
};

 
const downloadCSV = (csvData, filename) => {
    const blob = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement('a');
    if (link.download !== undefined) {  
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert('Ваш браузер не поддерживает автоматическое скачивание.');
    }
};

 
const headCells = [
    { id: 'name', numeric: false, disablePadding: false, label: 'Поставщик' },
    { id: 'totalOrders', numeric: true, disablePadding: false, label: 'Всего заказов' },
    { id: 'revenue', numeric: true, disablePadding: false, label: 'Выручка (₽)' },
    { id: 'onTimeDeliveryPercentage', numeric: true, disablePadding: false, label: 'Доставка в срок (%)' },
    { id: 'qualityScore', numeric: true, disablePadding: false, label: 'Качество' },
    { id: 'costEfficiency', numeric: true, disablePadding: false, label: 'Эффект. затрат' },
    { id: 'performanceScore', numeric: true, disablePadding: false, label: 'Рейтинг' },
];

const SupplierPerformanceReport = () => {
    const { enqueueSnackbar } = useSnackbar();
    
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);  
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());

 
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('performanceScore');

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
         
             const [supplierMetricsResponse, suppliersListResponse] = await Promise.all([
                analyticsService.getSupplierMetrics(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
                supplierService.getSuppliers(),
            ]);
            
            const rawMetrics = supplierMetricsResponse.data || [];
            const suppliers = suppliersListResponse || [];
            
            const enrichedMetrics = rawMetrics.map(metric => {
                const supplierDetails = suppliers.find(s => s._id === metric.supplier);
                return {
                    id: metric.supplier,  
                    name: supplierDetails ? supplierDetails.name : `Поставщик (${metric.supplier?.slice(-6)})`,
                    totalOrders: metric.totalOrders || 0,
                    revenue: metric.revenue || 0,
                    
                    onTimeDeliveryPercentage: metric.totalOrders > 0 
                        ? Math.round(((metric.onTimeDelivery || 0) / metric.totalOrders) * 100) 
                        : 0,
                    qualityScore: metric.quality || 0,  
                    costEfficiency: metric.costEfficiency || 0,
                    performanceScore: metric.performanceScore || 0,
                };
            });

            setReportData(enrichedMetrics);

        } catch (err) {
            console.error("Error fetching supplier performance report:", err);
            setError('Не удалось загрузить отчет по поставщикам.');
            enqueueSnackbar('Ошибка при загрузке отчета', { variant: 'error' });
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, enqueueSnackbar]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleExport = () => {
        try {
            const sortedData = stableSort(reportData, getComparator(order, orderBy));
            const csvData = convertToCSV(sortedData, headCells);
            downloadCSV(csvData, `supplier_performance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
            enqueueSnackbar('Отчет экспортирован', { variant: 'success' });
        } catch (err) {
             console.error("Error exporting CSV:", err);
             enqueueSnackbar('Ошибка при экспорте отчета', { variant: 'error' });
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Отчет по эффективности поставщиков</Typography>
            
            {/* Фильтры */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5} md={4}>
                         <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="Начало периода"
                                value={startDate}
                                onChange={setStartDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={5} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                             <DatePicker
                                label="Конец периода"
                                value={endDate}
                                onChange={setEndDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                     <Grid item xs={12} sm={2} md={4} sx={{ textAlign: 'right' }}>
                         <Button 
                            variant="contained"
                            onClick={fetchReportData}
                            disabled={loading}
                            sx={{ mr: 1 }}
                         >
                            Сформировать
                        </Button>
                        <Button 
                            variant="outlined"
                            onClick={handleExport}
                            disabled={loading || reportData.length === 0}
                            startIcon={<DownloadIcon />}
                         >
                            Экспорт в CSV
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Результаты отчета */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={headCell.numeric ? 'right' : 'left'}
                                        padding={headCell.disablePadding ? 'none' : 'normal'}
                                        sortDirection={orderBy === headCell.id ? order : false}
                                    >
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, headCell.id)}
                                        >
                                            {headCell.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headCells.length} align="center">Нет данных за выбранный период.</TableCell>
                                </TableRow>
                            ) : (
                                stableSort(reportData, getComparator(order, orderBy))
                                    .map((row) => (
                                        <TableRow hover key={row.id}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell align="right">{row.totalOrders}</TableCell>
                                            <TableCell align="right">{row.revenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                                            <TableCell align="right">{row.onTimeDeliveryPercentage}%</TableCell>
                                            <TableCell align="right">{row.qualityScore}</TableCell>
                                            <TableCell align="right">{row.costEfficiency}</TableCell>
                                            <TableCell align="right">
                                                <Chip 
                                                    label={row.performanceScore}
                                                    size="small"
                                                    color={row.performanceScore >= 80 ? 'success' : row.performanceScore >= 60 ? 'warning' : 'error'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default SupplierPerformanceReport; 