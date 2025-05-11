import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Paper, Typography, Box, Button, IconButton, Tooltip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    CircularProgress, Alert, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { productService, supplierService } from '../../services/api'; // Import supplierService
import ProductDialog from '../../components/Admin/ProductDialog'; // Import the new dialog
import { useSnackbar } from 'notistack';

// Helper to format numbers as currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value || 0);
};

const ProductManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [suppliers, setSuppliers] = useState([]); // State for suppliers

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // For editing

    const { enqueueSnackbar } = useSnackbar();

    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await supplierService.getSuppliers();
            setSuppliers(response || []);
        } catch (err) {
            console.error("Failed to fetch suppliers:", err);
            enqueueSnackbar('Ошибка при загрузке списка поставщиков', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = { page: page + 1, limit: rowsPerPage, sortBy: 'name', order: 'asc' }; // Example filters
            const response = await productService.getProducts(filters);
            setProducts(response.products || []);
            setTotalProducts(response.totalProducts || 0);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError(err.message || 'Не удалось загрузить список продуктов.');
            enqueueSnackbar('Ошибка при загрузке продуктов', { variant: 'error' });
        }
        setLoading(false);
    }, [page, rowsPerPage, enqueueSnackbar]);

    useEffect(() => {
        fetchProducts();
        fetchSuppliers(); // Fetch suppliers when component mounts
    }, [fetchProducts, fetchSuppliers]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Dialog handlers
    const handleOpenAddDialog = () => {
        setSelectedProduct(null); // Clear selection for adding new
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
    };

    const handleSaveProduct = async (formData, productId) => {
        try {
            let response;
            if (productId) {
                // Editing existing product
                response = await productService.updateProduct(productId, formData);
                enqueueSnackbar('Продукт успешно обновлен', { variant: 'success' });
            } else {
                // Creating new product
                response = await productService.createProduct(formData);
                enqueueSnackbar('Продукт успешно создан', { variant: 'success' });
            }
            handleCloseDialog();
            fetchProducts(); // Refresh the product list
        } catch (err) {
            console.error("Failed to save product:", err);
            enqueueSnackbar(`Ошибка при сохранении продукта: ${err.response?.data?.message || err.message}`, { variant: 'error' });
            // Keep dialog open on error?
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (window.confirm(`Вы уверены, что хотите удалить продукт "${productName}"?`)) {
            try {
                await productService.deleteProduct(productId);
                enqueueSnackbar(`Продукт "${productName}" успешно удален`, { variant: 'success' });
                fetchProducts(); // Refresh list
            } catch (err) {
                enqueueSnackbar(`Ошибка при удалении продукта: ${err.message}`, { variant: 'error' });
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Управление Продуктами
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{ mr: 1 }}
                    >
                        Добавить Продукт
                    </Button>
                    <Tooltip title="Обновить список">
                        <IconButton onClick={fetchProducts} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && !error && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Наименование</TableCell>
                                    <TableCell>Категория</TableCell>
                                    <TableCell>Цена</TableCell>
                                    <TableCell>Себест.</TableCell>
                                    <TableCell>Остаток</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell align="right">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={product._id}>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category || 'N/A'}</TableCell>
                                        <TableCell>{formatCurrency(product.price)}</TableCell>
                                        <TableCell>{formatCurrency(product.cost)}</TableCell>
                                        <TableCell>
                                            {product.stockQuantity}
                                            {product.stockQuantity < product.reorderLevel && 
                                                <Chip label="Мало" color="warning" size="small" sx={{ml:1}}/>}
                                        </TableCell>
                                        <TableCell>
                                            {product.isActive ? 
                                                <Chip label="Активен" color="success" size="small" /> : 
                                                <Chip label="Неактивен" color="default" size="small" />}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Редактировать">
                                                <IconButton size="small" onClick={() => handleOpenEditDialog(product)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <IconButton size="small" onClick={() => handleDeleteProduct(product._id, product.name)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">Продукты не найдены.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={totalProducts}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Строк на странице:"
                    />
                </Paper>
            )}

            <ProductDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSaveProduct}
                product={selectedProduct}
                availableSuppliers={suppliers}
            />
        </Container>
    );
};

export default ProductManagementPage; 