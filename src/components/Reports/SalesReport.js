import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
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
import BarChartIcon from '@mui/icons-material/BarChart';
import { ResponsiveBar } from '@nivo/bar';  
import DownloadIcon from '@mui/icons-material/Download';  

import { reportService } from '../../services/api';  
import { useSnackbar } from 'notistack';

 
const convertToCSV = (data, columns) => {
    if (!data || data.length === 0) return '';
    const header = columns.map(col => `"${col.label}"`).join(',');
    const rows = data.map(row => 
        columns.map(col => {
            let value = row[col.id];
            if (col.id === 'totalRevenue') {
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

 
const salesReportHeadCells = (
    groupBy  
) => [
    { id: 'group', numeric: false, label: groupBy === 'category' ? 'Категория' : 'Поставщик' },
    { id: 'totalOrders', numeric: true, label: 'Кол-во заказов' },
    { id: 'totalRevenue', numeric: true, label: 'Выручка (RUB)' },
];

const SalesReport = () => {
    const { enqueueSnackbar } = useSnackbar();
    
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);  
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [groupBy, setGroupBy] = useState('category');  

 

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            
            const response = await reportService.getSalesReport({ 
                startDate,
                endDate,
                groupBy
            });
            
            if (response.success) {
                setReportData(response.data || []);
            } else {
                throw new Error(response.message || 'Не удалось получить данные отчета');
            }

        } catch (err) {
            console.error("Error fetching sales report:", err);
            setError(err.message || 'Не удалось загрузить отчет по продажам.');
            enqueueSnackbar(err.message || 'Ошибка при загрузке отчета', { variant: 'error' });
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, groupBy, enqueueSnackbar]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

   
    const chartData = reportData.map(item => ({ 
        id: item.group,
        label: item.group,
        value: item.totalRevenue,
    }));

   
    const maxRevenue = Math.max(...reportData.map(item => item.totalRevenue), 0);

    const handleExport = () => {
        try {
            const columns = salesReportHeadCells(groupBy);
            const csvData = convertToCSV(reportData, columns);
            downloadCSV(csvData, `sales_report_${groupBy}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
            enqueueSnackbar('Отчет экспортирован в CSV', { variant: 'success' });
        } catch (err) {
            console.error("Error exporting sales report to CSV:", err);
            enqueueSnackbar('Ошибка при экспорте отчета', { variant: 'error' });
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Отчет по продажам</Typography>
            
            {/* Фильтры */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                         <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="Начало периода"
                                value={startDate}
                                onChange={setStartDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                             <DatePicker
                                label="Конец периода"
                                value={endDate}
                                onChange={setEndDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                     <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Группировать по</InputLabel>
                            <Select
                                value={groupBy}
                                label="Группировать по"
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                <MenuItem value="category">Категории</MenuItem>
                                <MenuItem value="supplier">Поставщику</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                     <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
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
                <Grid container spacing={3}>
                    {/* Таблица */}
                    <Grid item xs={12} md={reportData.length > 0 ? 6 : 12}>  
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{groupBy === 'category' ? 'Категория' : 'Поставщик'}</TableCell>
                                        <TableCell align="right">Кол-во заказов</TableCell>
                                        <TableCell align="right">Выручка</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">Нет данных за выбранный период.</TableCell>
                                        </TableRow>
                                    ) : (
                                        reportData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.group}</TableCell>
                                                <TableCell align="right">{row.totalOrders}</TableCell>
                                                <TableCell align="right">{row.totalRevenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                    {/* TODO: Добавить строку "Итого" */}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    {/* График (если есть данные) */}
                    {reportData.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: 400 }}>
                                <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>Выручка по {groupBy === 'category' ? 'категориям' : 'поставщикам'}</Typography>
                                <ResponsiveBar
                                    data={chartData}
                                    keys={['value']}  
                                    indexBy="id"  
                                    margin={{ top: 10, right: 10, bottom: 80, left: 80 }}  
                                    padding={0.3}
                                    valueScale={{ type: 'linear', max: 'auto' }}  
                                    indexScale={{ type: 'band', round: true }}
                                    colors={{ scheme: 'category10' }}  
                                    borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                                    axisTop={null}
                                    axisRight={null}
                                    axisBottom={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: -30,  
                                        legend: groupBy === 'category' ? 'Категория' : 'Поставщик',
                                        legendPosition: 'middle',
                                        legendOffset: 65
                                    }}
                                    axisLeft={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: 'Выручка (₽)',
                                        legendPosition: 'middle',
                                        legendOffset: -70,
                                         format: value => `${value.toLocaleString('ru-RU')} ₽`  
                                    }}
                                    labelSkipWidth={12}
                                    labelSkipHeight={12}
                                    labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                                    labelFormat={d => `${d.toLocaleString('ru-RU')} ₽`}
                                    legends={[]}
                                    animate={true}
                                    motionStiffness={90}
                                    motionDamping={15}
                                    tooltip={({ id, value, color }) => (
                                        <strong style={{ color }}>
                                            {id}: {value.toLocaleString('ru-RU')} ₽
                                        </strong>
                                    )}
                                    theme={{ tooltip: { container: { background: '#fff' } } }}
                                />
                            </Paper>
                        </Grid>
                    )}
                 </Grid>
            )}
        </Box>
    );
};

export default SalesReport; 