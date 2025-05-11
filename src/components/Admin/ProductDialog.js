import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Grid, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
    FormHelperText
} from '@mui/material';
import { supplierService } from '../../services/api';  

const ProductDialog = ({ open, onClose, onSave, product, availableSuppliers }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        
        if (open) {
            if (product) {
              
                setFormData({
                    name: product.name || '',
                    sku: product.sku || '',
                    description: product.description || '',
                    category: product.category || '',
                    price: product.price || 0,
                    cost: product.cost || 0,
                    supplier: product.supplier?._id || product.supplier || '',  
                    stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 0,
                    reorderLevel: product.reorderLevel !== undefined ? product.reorderLevel : 0,
                    targetStockLevel: product.targetStockLevel !== undefined ? product.targetStockLevel : 0,
                    unitOfMeasure: product.unitOfMeasure || 'pcs',
                    isActive: product.isActive !== undefined ? product.isActive : true,
                    imageUrl: product.imageUrl || '',
                    
                });
            } else {
                 
                setFormData({
                    name: '',
                    sku: '',
                    description: '',
                    category: '',
                    price: 0,
                    cost: 0,
                    supplier: '',
                    stockQuantity: 0,
                    reorderLevel: 0,
                    targetStockLevel: 0,
                    unitOfMeasure: 'pcs',
                    isActive: true,
                    imageUrl: '',
                });
            }
            setErrors({}); 
        }
    }, [product, open]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
 
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Название обязательно';
        if (!formData.sku) newErrors.sku = 'SKU обязателен';
        if (!formData.supplier) newErrors.supplier = 'Поставщик обязателен';
        if (formData.price === undefined || formData.price < 0) newErrors.price = 'Цена обязательна и не может быть отрицательной';
        if (formData.cost === undefined || formData.cost < 0) newErrors.cost = 'Себестоимость обязательна и не может быть отрицательной';
        if (formData.stockQuantity === undefined || formData.stockQuantity < 0) newErrors.stockQuantity = 'Остаток обязателен и не может быть отрицательным';
       
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;  
    };

    const handleSave = () => {
        if (validateForm()) {
             
            const dataToSave = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                cost: parseFloat(formData.cost) || 0,
                stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
                reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
                targetStockLevel: parseInt(formData.targetStockLevel, 10) || 0,
            };
            onSave(dataToSave, product ? product._id : null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{product ? 'Редактировать продукт' : 'Добавить новый продукт'}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Основная информация */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Название"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="SKU"
                            name="sku"
                            value={formData.sku || ''}
                            onChange={handleChange}
                            error={!!errors.sku}
                            helperText={errors.sku}
                            size="small"
                            InputProps={{ readOnly: !!product }} // Make SKU readonly when editing?
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Категория"
                            name="category"
                            value={formData.category || ''}
                            onChange={handleChange}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!errors.supplier} size="small">
                            <InputLabel>Поставщик</InputLabel>
                            <Select
                                name="supplier"
                                value={formData.supplier || ''}
                                label="Поставщик"
                                onChange={handleChange}
                            >
                                <MenuItem value=""><em>Не выбран</em></MenuItem>
                                {availableSuppliers?.map((sup) => (
                                    <MenuItem key={sup._id} value={sup._id}>{sup.name}</MenuItem>
                                ))}
                            </Select>
                            {errors.supplier && <FormHelperText>{errors.supplier}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Описание"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            multiline
                            rows={2}
                            size="small"
                        />
                    </Grid>

                    {/* Цена и Себестоимость */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            label="Цена продажи"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            error={!!errors.price}
                            helperText={errors.price}
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            size="small"
                        />
                    </Grid>
                     <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            label="Себестоимость"
                            name="cost"
                            type="number"
                            value={formData.cost}
                            onChange={handleChange}
                            error={!!errors.cost}
                            helperText={errors.cost}
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                         <TextField
                            fullWidth
                            label="Ед. изм."
                            name="unitOfMeasure"
                            value={formData.unitOfMeasure || ''}
                            onChange={handleChange}
                            size="small"
                        />
                    </Grid>

                    {/* Складские параметры */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            label="Остаток"
                            name="stockQuantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            error={!!errors.stockQuantity}
                            helperText={errors.stockQuantity}
                            InputProps={{ inputProps: { min: 0 } }}
                            size="small"
                            
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Точка заказа"
                            name="reorderLevel"
                            type="number"
                            value={formData.reorderLevel}
                            onChange={handleChange}
                            InputProps={{ inputProps: { min: 0 } }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                         <TextField
                            fullWidth
                            label="Целевой остаток"
                            name="targetStockLevel"
                            type="number"
                            value={formData.targetStockLevel}
                            onChange={handleChange}
                            InputProps={{ inputProps: { min: 0 } }}
                            size="small"
                        />
                    </Grid>

                    {/* Дополнительно */} 
                     <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="URL Изображения"
                            name="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleChange}
                            size="small"
                        />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={formData.isActive} onChange={handleChange} name="isActive" />}
                            label="Активен"
                        />
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={handleSave} variant="contained">
                    {product ? 'Сохранить изменения' : 'Создать продукт'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductDialog; 