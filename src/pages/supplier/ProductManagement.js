import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    TextField, // Для будущего поиска
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductFormModal from '../../components/Forms/ProductFormModal';

import { productService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const SupplierProductManagement = () => {
    const { currentUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);

    // Состояния для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null для добавления, объект товара для редактирования
    const [isSubmitting, setIsSubmitting] = useState(false); // Для индикации загрузки в модальном окне

    // Состояния для диалога подтверждения удаления
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const fetchProducts = useCallback(async (resetPage = false) => {
        if (!currentUser || !currentUser._id) return;
        
        const targetPage = resetPage ? 0 : page;
        if (resetPage) setPage(0);

        setLoading(true);
        setError(null);
        try {
            const response = await productService.getProducts({ 
                supplierId: currentUser._id, 
                page: targetPage + 1, // API ожидает 1-based page
                limit: rowsPerPage,
            });
            setProducts(response.products || []);
            setTotalProducts(response.totalProducts || 0);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError('Не удалось загрузить список товаров.');
            enqueueSnackbar('Ошибка при загрузке товаров', { variant: 'error' });
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    }, [currentUser, page, rowsPerPage, enqueueSnackbar]);

    useEffect(() => {
        fetchProducts();
    // fetchProducts НЕ ДОЛЖЕН быть в зависимостях, чтобы избежать лишних вызовов при изменении page/rowsPerPage изнутри fetchProducts
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [currentUser, page, rowsPerPage]); 

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- Обработчики модального окна --- 
    const handleOpenAddModal = () => {
        setEditingProduct(null); // Режим добавления
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product); // Режим редактирования
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null); // Сбрасываем редактируемый товар при закрытии
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            let savedProduct;
            if (editingProduct?._id) {
                // Редактирование
                savedProduct = await productService.updateProduct(editingProduct._id, formData);
                // Обновляем товар в списке
                setProducts(prev => prev.map(p => p._id === savedProduct._id ? savedProduct : p));
                enqueueSnackbar('Товар успешно обновлен', { variant: 'success' });
            } else {
                // Добавление (убедимся, что supplier ID добавлен)
                savedProduct = await productService.createProduct({ ...formData, supplier: currentUser._id });
                // Добавляем новый товар в начало списка (или перезагружаем)
                // setProducts(prev => [savedProduct, ...prev]);
                // setTotalProducts(prev => prev + 1);
                // Проще перезагрузить первую страницу после добавления
                await fetchProducts(true); // true - сбросить на первую страницу
                enqueueSnackbar('Товар успешно добавлен', { variant: 'success' });
            }
            handleCloseModal();
        } catch (err) {
            console.error("Error saving product:", err);
            const errorMsg = err.response?.data?.message || (editingProduct ? 'Ошибка при обновлении товара' : 'Ошибка при добавлении товара');
            enqueueSnackbar(errorMsg, { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Обработчики удаления --- 
    const handleClickDelete = (product) => {
        setProductToDelete(product);
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setProductToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        
        const productId = productToDelete._id;
        // Оптимистичное удаление из UI
        setProducts(prev => prev.filter(p => p._id !== productId));
        setTotalProducts(prev => prev - 1);
        handleCloseConfirmDialog();

        try {
            await productService.deleteProduct(productId);
            enqueueSnackbar('Товар успешно удален', { variant: 'success' });
            // Если удаление произошло на последней странице и она стала пустой, 
            // нужно переключиться на предыдущую страницу (если она есть)
            if (page > 0 && products.length === 1) {
                 setPage(prevPage => prevPage - 1);
            } else if (products.length === 1 && page === 0) {
                 // Если удалили последний элемент на первой странице
                 // Можно не перезагружать, список уже пуст
            } else if (products.length > 1) {
                 // Если на странице остались еще элементы, можно не перезагружать
            } else {
                 // Перезагрузка может быть нужна в редких случаях
                 fetchProducts();
            }

        } catch (err) {
            console.error("Error deleting product:", err);
            enqueueSnackbar('Ошибка при удалении товара', { variant: 'error' });
            // Возвращаем список в исходное состояние при ошибке
            fetchProducts(); 
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Управление товарами
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddModal}
                >
                    Добавить товар
                </Button>
            </Box>

            {/* TODO: Добавить панель фильтров/поиска */}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Наименование</TableCell>
                                <TableCell>Артикул (SKU)</TableCell>
                                <TableCell>Категория</TableCell>
                                <TableCell align="right">Цена (₽)</TableCell>
                                <TableCell align="right">Себест. (₽)</TableCell>
                                <TableCell align="right">Остаток</TableCell>
                                <TableCell>Ед. изм.</TableCell>
                                <TableCell align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Alert severity="error">{error}</Alert>
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        Товары не найдены. Добавьте свой первый товар.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow hover key={product._id}>
                                        <TableCell component="th" scope="row">
                                            {product.name}
                                        </TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell align="right">{product.price?.toLocaleString('ru-RU')}</TableCell>
                                        <TableCell align="right">{product.cost?.toLocaleString('ru-RU')}</TableCell>
                                        <TableCell align="right">{product.stockQuantity}</TableCell>
                                        <TableCell>{product.unitOfMeasure}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Редактировать">
                                                <IconButton size="small" onClick={() => handleOpenEditModal(product)}>
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <IconButton size="small" color="error" onClick={() => handleClickDelete(product)}>
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalProducts}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Строк на странице:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`
                    }
                />
            </Paper>

            {/* Модальное окно для добавления/редактирования */}
            <ProductFormModal 
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                productData={editingProduct}
                isLoading={isSubmitting}
            />

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCloseConfirmDialog}
            >
                <DialogTitle>Подтвердить удаление</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить товар "{productToDelete?.name}"? 
                        Это действие необратимо.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Отмена</Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SupplierProductManagement; 