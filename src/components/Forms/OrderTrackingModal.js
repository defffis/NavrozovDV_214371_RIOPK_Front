import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, Typography, Box,
    FormControl, InputLabel, Select, MenuItem,
    CircularProgress, Divider, Alert
} from '@mui/material';
import { format } from 'date-fns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const OrderTrackingModal = ({ open, onClose, onSubmit, order, isLoading }) => {
    const [trackingData, setTrackingData] = useState({
        trackingNumber: '',
        carrier: '',
        shippingDate: new Date(),
        estimatedDeliveryDate: null,
        status: '',
        notes: '',
    });
    
    const [error, setError] = useState(null);

    useEffect(() => {
        if (order && open) {
            
            setTrackingData({
                trackingNumber: order.tracking?.trackingNumber || '',
                carrier: order.tracking?.carrier || '',
                shippingDate: order.tracking?.shippingDate ? new Date(order.tracking.shippingDate) : new Date(),
                estimatedDeliveryDate: order.tracking?.estimatedDeliveryDate ? new Date(order.tracking.estimatedDeliveryDate) : null,
                status: order.tracking?.status || '',
                notes: order.tracking?.notes || '',
            });
        }
    }, [order, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTrackingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (field, value) => {
        setTrackingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        
        if (!trackingData.trackingNumber) {
            setError('Номер отслеживания обязателен');
            return;
        }
        
       
        onSubmit(trackingData);
    };

   
    const carriers = [
        { value: 'СДЭК', label: 'СДЭК' },
        { value: 'Почта России', label: 'Почта России' },
        { value: 'DHL', label: 'DHL' },
        { value: 'ПЭК', label: 'ПЭК' },
        { value: 'Деловые Линии', label: 'Деловые Линии' },
        { value: 'Яндекс.Доставка', label: 'Яндекс.Доставка' },
        { value: 'FedEx', label: 'FedEx' },
        { value: 'UPS', label: 'UPS' },
        { value: 'Другое', label: 'Другое' }
    ];

    
    const trackingStatuses = [
        { value: 'waiting', label: 'Ожидает отправки' },
        { value: 'in_transit', label: 'В пути' },
        { value: 'out_for_delivery', label: 'Доставляется' },
        { value: 'delivered', label: 'Доставлено' },
        { value: 'exception', label: 'Проблема' },
        { value: 'delayed', label: 'Задерживается' }
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
        >
            <DialogTitle>
                Информация по отслеживанию заказа
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Заказ №{order?._id}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                label="Номер отслеживания"
                                name="trackingNumber"
                                value={trackingData.trackingNumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Перевозчик</InputLabel>
                                <Select
                                    name="carrier"
                                    value={trackingData.carrier}
                                    onChange={handleChange}
                                    label="Перевозчик"
                                >
                                    {carriers.map(carrier => (
                                        <MenuItem key={carrier.value} value={carrier.value}>
                                            {carrier.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                                <DateTimePicker 
                                    label="Дата отправки"
                                    value={trackingData.shippingDate}
                                    onChange={(date) => handleDateChange('shippingDate', date)}
                                    slotProps={{ 
                                        textField: { 
                                            fullWidth: true,
                                            required: true
                                        } 
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                                <DateTimePicker 
                                    label="Ожидаемая дата доставки"
                                    value={trackingData.estimatedDeliveryDate}
                                    onChange={(date) => handleDateChange('estimatedDeliveryDate', date)}
                                    slotProps={{ 
                                        textField: { 
                                            fullWidth: true 
                                        } 
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Статус доставки</InputLabel>
                                <Select
                                    name="status"
                                    value={trackingData.status}
                                    onChange={handleChange}
                                    label="Статус доставки"
                                >
                                    {trackingStatuses.map(status => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {status.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Примечания"
                                name="notes"
                                value={trackingData.notes}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Сохранить'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default OrderTrackingModal; 