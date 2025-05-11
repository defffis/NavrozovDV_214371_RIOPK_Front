import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    InputAdornment,
    Divider,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const ProductFormModal = ({ open, onClose, onSubmit, productData, isLoading }) => {
    
    const [formData, setFormData] = useState({});

   
    useEffect(() => {
        if (productData) {
            
            setFormData({
                name: productData.name || '',
                sku: productData.sku || '',
                description: productData.description || '',
                category: productData.category || '',
                price: productData.price || '',
                cost: productData.cost || '',
                stockQuantity: productData.stockQuantity !== undefined ? productData.stockQuantity : '',
                reorderLevel: productData.reorderLevel !== undefined ? productData.reorderLevel : '',
                targetStockLevel: productData.targetStockLevel !== undefined ? productData.targetStockLevel : '',
                unitOfMeasure: productData.unitOfMeasure || 'шт',  
                isActive: productData.isActive !== undefined ? productData.isActive : true,  
                imageUrl: productData.imageUrl || '',
                barcode: productData.barcode || '',
                expirationDate: productData.expirationDate || null,
                storageLocation: productData.storageLocation || '',
                // dimensions: productData.dimensions || { length: '', width: '', height: '' }, // Можно добавить позже
            });
        } else {
            
            setFormData({
                name: '',
                sku: '',
                description: '',
                category: '',
                price: '',
                cost: '',
                stockQuantity: '',
                reorderLevel: '',
                targetStockLevel: '',
                unitOfMeasure: 'шт',
                isActive: true,
                imageUrl: '',
                barcode: '',
                expirationDate: null,
                storageLocation: '',
            });
        }
    }, [productData, open]);  

    
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value,
        }));
    };

     
    const handleNumericChange = (event) => {
        const { name, value } = event.target;
       
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

     
    const handleSubmit = (event) => {
        event.preventDefault();
       
        const dataToSend = {
            ...formData,
            price: parseFloat(formData.price) || 0,
            cost: parseFloat(formData.cost) || 0,
            stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
            reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
            targetStockLevel: parseInt(formData.targetStockLevel, 10) || 0,
            barcode: formData.barcode || '',
            storageLocation: formData.storageLocation || '',
            expirationDate: formData.expirationDate,
        };
        onSubmit(dataToSend);
    };

    const isEditMode = Boolean(productData?._id);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEditMode ? 'Редактировать товар' : 'Добавить новый товар'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {/* Основная информация */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Основная информация</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                margin="dense"
                                name="name"
                                label="Наименование товара"
                                value={formData.name || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                margin="dense"
                                name="sku"
                                label="Артикул (SKU)"
                                value={formData.sku || ''}
                                onChange={handleChange}
                                // disabled={isEditMode} // Можно запретить менять SKU при редактировании
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="barcode"
                                label="Штрих-код"
                                value={formData.barcode || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="category"
                                label="Категория"
                                value={formData.category || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="description"
                                label="Описание"
                                multiline
                                rows={3}
                                value={formData.description || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="imageUrl"
                                label="URL изображения"
                                value={formData.imageUrl || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel id="unit-measure-label">Ед. изм.</InputLabel>
                                <Select
                                    labelId="unit-measure-label"
                                    name="unitOfMeasure"
                                    value={formData.unitOfMeasure || 'шт'}
                                    label="Ед. изм."
                                    onChange={handleChange}
                                >
                                    <MenuItem value="шт">шт</MenuItem>
                                    <MenuItem value="кг">кг</MenuItem>
                                    <MenuItem value="л">л</MenuItem>
                                    <MenuItem value="м">м</MenuItem>
                                    <MenuItem value="м²">м²</MenuItem>
                                    <MenuItem value="м³">м³</MenuItem>
                                    <MenuItem value="упак">упак</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Цены и склад</Typography>
                        </Grid>
                        {/* Цены */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                margin="dense"
                                name="price"
                                label="Цена продажи"
                                type="text" // Используем text для кастомной валидации
                                value={formData.price || ''}
                                onChange={handleNumericChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                margin="dense"
                                name="cost"
                                label="Себестоимость"
                                type="text"
                                value={formData.cost || ''}
                                onChange={handleNumericChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                                }}
                            />
                        </Grid>
                        {/* Складские запасы */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                required
                                fullWidth
                                margin="dense"
                                name="stockQuantity"
                                label="Остаток на складе"
                                type="text"
                                value={formData.stockQuantity || ''}
                                onChange={handleNumericChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="reorderLevel"
                                label="Уровень повторного заказа"
                                type="text"
                                value={formData.reorderLevel || ''}
                                onChange={handleNumericChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="targetStockLevel"
                                label="Целевой уровень запаса"
                                type="text"
                                value={formData.targetStockLevel || ''}
                                onChange={handleNumericChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="dense"
                                name="storageLocation"
                                label="Место хранения на складе"
                                value={formData.storageLocation || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                                <DatePicker
                                    label="Срок годности" 
                                    value={formData.expirationDate}
                                    onChange={(newDate) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expirationDate: newDate
                                        }));
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: "dense"
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <FormControlLabel
                                control={<Switch checked={formData.isActive || false} onChange={handleChange} name="isActive" />}
                                label="Активен (виден в каталоге)"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} disabled={isLoading}>
                        Отмена
                    </Button>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Добавить товар')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProductFormModal; 