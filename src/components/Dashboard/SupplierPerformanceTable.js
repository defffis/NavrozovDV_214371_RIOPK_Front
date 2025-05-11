import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    LinearProgress,
    Box,
    Rating,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

 
const SupplierPerformanceTable = ({ data, title = 'Эффективность поставщиков' }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

   
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

  
    if (!data || data.length === 0) {
        return (
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        Нет данных для отображения
                    </Typography>
                </CardContent>
            </Card>
        );
    }

 
    const getStatusChip = (score) => {
        if (score >= 80) {
            return (
                <Chip
                    icon={<CheckCircleIcon />}
                    label="Отлично"
                    color="success"
                    variant="outlined"
                    size="small"
                />
            );
        } else if (score >= 60) {
            return (
                <Chip
                    icon={<InfoIcon />}
                    label="Хорошо"
                    color="info"
                    variant="outlined"
                    size="small"
                />
            );
        } else if (score >= 40) {
            return (
                <Chip
                    icon={<WarningIcon />}
                    label="Удовлетворительно"
                    color="warning"
                    variant="outlined"
                    size="small"
                />
            );
        } else {
            return (
                <Chip
                    icon={<ErrorIcon />}
                    label="Требует внимания"
                    color="error"
                    variant="outlined"
                    size="small"
                />
            );
        }
    };

    return (
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="supplier performance table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Поставщик</TableCell>
                                <TableCell align="center">Рейтинг</TableCell>
                                <TableCell align="center">Заказы</TableCell>
                                <TableCell align="center">Вовремя (%)</TableCell>
                                <TableCell align="center">Качество</TableCell>
                                <TableCell align="center">Эффективность затрат</TableCell>
                                <TableCell align="center">Статус</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((supplier, index) => {
                                    
                                    const onTimeDeliveryPercentage =
                                        supplier.onTimeDeliveryPercentage !== undefined
                                            ? supplier.onTimeDeliveryPercentage
                                            : (() => {
                                                const totalDeliveries = (supplier.onTimeDelivery || 0) + (supplier.lateDelivery || 0);
                                                return totalDeliveries > 0
                                                    ? Math.round((supplier.onTimeDelivery || 0) * 100 / totalDeliveries)
                                                    : 0;
                                              })();

                                  
                                    const supplierKey = supplier.supplier || supplier._id || supplier.supplierId || `supplier-${index}`;

                                    
                                    const performanceScore = supplier.performanceScore || 
                                                           supplier.supplierPerformanceIndex || 0;

                                   
                                    const qualityScore = supplier.quality || supplier.qualityScore || 0;

                                    
                                    const costEfficiencyScore = supplier.costEfficiency || 
                                                              supplier.costEfficiencyScore || 0;

                                    return (
                                        <TableRow
                                            key={supplierKey}
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                            }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {supplier.supplierName || supplier.name || 'Неизвестный'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {performanceScore}
                                            </TableCell>
                                            <TableCell align="center">{supplier.totalOrders || 0}</TableCell>
                                            <TableCell align="center">
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        {supplier.onTimeDeliveryPercentage !== undefined ? 
                                                        supplier.onTimeDeliveryPercentage : onTimeDeliveryPercentage}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={supplier.onTimeDeliveryPercentage !== undefined ? 
                                                        supplier.onTimeDeliveryPercentage : onTimeDeliveryPercentage}
                                                        sx={{
                                                            width: '80%',
                                                            mt: 0.5,
                                                            height: 6,
                                                            borderRadius: 5,
                                                        }}
                                                        color={
                                                            (supplier.onTimeDeliveryPercentage || onTimeDeliveryPercentage) >= 80
                                                                ? 'success'
                                                                : (supplier.onTimeDeliveryPercentage || onTimeDeliveryPercentage) >= 60
                                                                ? 'info'
                                                                : (supplier.onTimeDeliveryPercentage || onTimeDeliveryPercentage) >= 40
                                                                ? 'warning'
                                                                : 'error'
                                                        }
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        {supplier.quality || qualityScore}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={supplier.quality || qualityScore}
                                                        sx={{
                                                            width: '80%',
                                                            mt: 0.5,
                                                            height: 6,
                                                            borderRadius: 5,
                                                        }}
                                                        color={
                                                            (supplier.quality || qualityScore) >= 80
                                                                ? 'success'
                                                                : (supplier.quality || qualityScore) >= 60
                                                                ? 'info'
                                                                : (supplier.quality || qualityScore) >= 40
                                                                ? 'warning'
                                                                : 'error'
                                                        }
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        {supplier.costEfficiency || costEfficiencyScore}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={supplier.costEfficiency || costEfficiencyScore}
                                                        sx={{
                                                            width: '80%',
                                                            mt: 0.5,
                                                            height: 6,
                                                            borderRadius: 5,
                                                        }}
                                                        color={
                                                            (supplier.costEfficiency || costEfficiencyScore) >= 80
                                                                ? 'success'
                                                                : (supplier.costEfficiency || costEfficiencyScore) >= 60
                                                                ? 'info'
                                                                : (supplier.costEfficiency || costEfficiencyScore) >= 40
                                                                ? 'warning'
                                                                : 'error'
                                                        }
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                {getStatusChip(performanceScore)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Просмотреть детали">
                                                    <IconButton size="small">
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Строк на странице:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`
                    }
                />
            </CardContent>
        </Card>
    );
};

export default SupplierPerformanceTable; 