import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
    Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete, Refresh, MoreVert, Description } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const ContractsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    const { token, currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Загружаем контракты, поставщиков и продукты параллельно
            const [contractsRes, suppliersRes, productsRes] = await Promise.all([
                axios.get('/api/contracts', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/suppliers', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/products', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            
            // Фильтрация контрактов по роли пользователя
            let filteredContracts = contractsRes.data;
            if (currentUser.role === 'supplier') {
                filteredContracts = filteredContracts.filter(
                    contract => contract.supplier._id === currentUser._id
                );
            }
            
            setContracts(filteredContracts);
            setSuppliers(suppliersRes.data);
            setProducts(productsRes.data.products || []);
            
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Произошла ошибка при загрузке данных');
            enqueueSnackbar('Ошибка при загрузке данных', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddContract = () => {
        setCurrentContract({
            supplier: '',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)), // +1 год
            products: []
        });
        setDialogOpen(true);
    };
    
    const handleEditContract = (contract) => {
        setCurrentContract({
            ...contract,
            products: contract.products.map(p => p._id || p)
        });
        setDialogOpen(true);
    };
    
    const handleDeleteContract = (contract) => {
        setCurrentContract(contract);
        setDeleteDialogOpen(true);
    };
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setCurrentContract(null);
    };
    
    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setCurrentContract(null);
    };
    
    const handleInputChange = (name, value) => {
        setCurrentContract(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const submitContractForm = async () => {
        try {
            const method = currentContract._id ? 'put' : 'post';
            const url = currentContract._id 
                ? `/api/contracts/${currentContract._id}` 
                : '/api/contracts';
            
            const response = await axios({
                method,
                url,
                data: currentContract,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            enqueueSnackbar(
                `Контракт успешно ${currentContract._id ? 'обновлен' : 'создан'}`, 
                { variant: 'success' }
            );
            
            fetchData();
            handleDialogClose();
        } catch (err) {
            console.error('Error saving contract:', err);
            enqueueSnackbar(
                `Ошибка при ${currentContract._id ? 'обновлении' : 'создании'} контракта`, 
                { variant: 'error' }
            );
        }
    };
    
    const deleteContract = async () => {
        try {
            await axios.delete(`/api/contracts/${currentContract._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            enqueueSnackbar('Контракт успешно удален', { variant: 'success' });
            fetchData();
            handleDeleteDialogClose();
        } catch (err) {
            console.error('Error deleting contract:', err);
            enqueueSnackbar('Ошибка при удалении контракта', { variant: 'error' });
        }
    };
    
    // Форматирование даты для отображения
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };
    
    // Получение имени поставщика по ID
    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(s => s._id === supplierId);
        return supplier ? supplier.name : 'Неизвестный поставщик';
    };
    
    // Получение имен продуктов по массиву ID
    const getProductNames = (productIds) => {
        if (!productIds || !productIds.length) return 'Нет продуктов';
        
        const productNames = productIds.map(id => {
            const product = products.find(p => p._id === id);
            return product ? product.name : 'Неизвестный продукт';
        });
        
        return productNames.join(', ');
    };
    
    const renderContractDialog = () => {
        if (!currentContract) return null;
        
        return (
            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentContract._id ? 'Редактирование контракта' : 'Новый контракт'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="supplier-label">Поставщик</InputLabel>
                                <Select
                                    labelId="supplier-label"
                                    value={currentContract.supplier}
                                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                                    label="Поставщик"
                                    disabled={currentUser.role === 'supplier'}
                                >
                                    {suppliers.map(supplier => (
                                        <MenuItem key={supplier._id} value={supplier._id}>
                                            {supplier.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="products-label">Продукты</InputLabel>
                                <Select
                                    labelId="products-label"
                                    multiple
                                    value={currentContract.products}
                                    onChange={(e) => handleInputChange('products', e.target.value)}
                                    label="Продукты"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const product = products.find(p => p._id === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={product ? product.name : 'Неизвестный продукт'} 
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {products.map(product => (
                                        <MenuItem key={product._id} value={product._id}>
                                            {product.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                                <DatePicker
                                    label="Дата начала"
                                    value={new Date(currentContract.startDate)}
                                    onChange={(newValue) => handleInputChange('startDate', newValue)}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                                <DatePicker
                                    label="Дата окончания"
                                    value={new Date(currentContract.endDate)}
                                    onChange={(newValue) => handleInputChange('endDate', newValue)}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button 
                        onClick={submitContractForm} 
                        variant="contained" 
                        color="primary"
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };
    
    const renderDeleteDialog = () => {
        if (!currentContract) return null;
        
        return (
            <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы действительно хотите удалить контракт с поставщиком 
                        "{getSupplierName(currentContract.supplier)}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose}>Отмена</Button>
                    <Button 
                        onClick={deleteContract} 
                        variant="contained" 
                        color="error"
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };
    
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <Typography variant="h4" component="h1">
                    Контракты
                </Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        startIcon={<Refresh />} 
                        onClick={fetchData}
                        sx={{ mr: 2 }}
                    >
                        Обновить
                    </Button>
                    {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={handleAddContract}
                        >
                            Новый контракт
                        </Button>
                    )}
                </Box>
            </Box>
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Поставщик</TableCell>
                                    <TableCell>Продукты</TableCell>
                                    <TableCell>Дата начала</TableCell>
                                    <TableCell>Дата окончания</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contracts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Контракты не найдены
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contracts.map(contract => {
                                        const now = new Date();
                                        const endDate = new Date(contract.endDate);
                                        const startDate = new Date(contract.startDate);
                                        let status = 'Активен';
                                        let statusColor = 'success';
                                        
                                        if (endDate < now) {
                                            status = 'Истек';
                                            statusColor = 'error';
                                        } else if (startDate > now) {
                                            status = 'Будущий';
                                            statusColor = 'info';
                                        } else if (endDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
                                            status = 'Истекает';
                                            statusColor = 'warning';
                                        }
                                        
                                        return (
                                            <TableRow key={contract._id}>
                                                <TableCell>
                                                    {contract.supplier && contract.supplier.name 
                                                        ? contract.supplier.name 
                                                        : (typeof contract.supplier === 'string' 
                                                            ? getSupplierName(contract.supplier) 
                                                            : 'Неизвестный поставщик')}
                                                </TableCell>
                                                <TableCell>
                                                    {contract.products && contract.products.length 
                                                        ? (contract.products[0] && contract.products[0].name 
                                                            ? contract.products.map(p => p.name).join(', ')
                                                            : getProductNames(contract.products)
                                                          )
                                                        : 'Нет продуктов'
                                                    }
                                                </TableCell>
                                                <TableCell>{formatDate(contract.startDate)}</TableCell>
                                                <TableCell>{formatDate(contract.endDate)}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={status} 
                                                        color={statusColor} 
                                                        size="small" 
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleEditContract(contract)}
                                                        size="small"
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                                                        <IconButton
                                                            onClick={() => handleDeleteContract(contract)}
                                                            size="small"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
            
            {renderContractDialog()}
            {renderDeleteDialog()}
        </Container>
    );
};

export default ContractsPage; 