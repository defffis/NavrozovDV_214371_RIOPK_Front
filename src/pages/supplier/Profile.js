import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Rating
} from '@mui/material';
import { Edit, Save, Cancel, Business, LocalShipping, Category, Payment } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supplierService } from '../../services/api';

const SupplierProfile = () => {
  const { user, updateUserInfo } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSupplierProfile();
  }, []);

  const fetchSupplierProfile = async () => {
    try {
      setLoading(true);
      // Get supplier profile using the ID from authenticated user
      const response = await supplierService.getSupplier(user.id);
      setProfile(response);
      setFormData({
        name: response.name || '',
        contactPerson: response.contactPerson || '',
        email: response.email || '',
        phone: response.phone || '',
        address: response.address || '',
        categories: response.categories?.join(', ') || '',
        paymentTerms: response.paymentTerms || ''
      });
    } catch (error) {
      console.error('Error fetching supplier profile:', error);
      showSnackbar('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (editing) {
      // Reset form data if canceling
      setFormData({
        name: profile.name || '',
        contactPerson: profile.contactPerson || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        categories: profile.categories?.join(', ') || '',
        paymentTerms: profile.paymentTerms || ''
      });
    }
    setEditing(!editing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Process categories from comma-separated string to array
      const processedData = {
        ...formData,
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat)
      };
      
      const updatedProfile = await supplierService.updateSupplier(user.id, processedData);
      setProfile(updatedProfile);
      setEditing(false);
      
      // Update user context if necessary
      updateUserInfo({
        ...user,
        name: updatedProfile.name
      });
      
      showSnackbar('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading && !profile) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Профиль поставщика
          </Typography>
          <Button
            variant="outlined"
            color={editing ? "error" : "primary"}
            startIcon={editing ? <Cancel /> : <Edit />}
            onClick={handleEditToggle}
          >
            {editing ? 'Отменить' : 'Редактировать'}
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 150, height: 150, mb: 2, bgcolor: 'primary.main' }}
                alt={profile?.name}
                src="/static/images/avatar/supplier.jpg"
              >
                {profile?.name?.charAt(0)}
              </Avatar>
              
              <Card sx={{ width: '100%', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Информация о компании
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1 }} fontSize="small" />
                    ID поставщика: {profile?._id}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Рейтинг:
                    </Typography>
                    <Rating
                      name="supplier-rating"
                      value={profile?.rating || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({profile?.rating || 0})
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalShipping sx={{ mr: 1 }} fontSize="small" />
                    Среднее время доставки: {profile?.avgDeliveryTime || 0} дней
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Category sx={{ mr: 1 }} fontSize="small" />
                    Категории: {profile?.categories?.join(', ')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Payment sx={{ mr: 1 }} fontSize="small" />
                    Условия оплаты: {profile?.paymentTerms}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label="Активный" 
                      color="success" 
                      size="small" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={`Надежность: ${profile?.reliability || 0}%`} 
                      color="primary" 
                      size="small" 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Наименование организации"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Контактное лицо"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Телефон"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Адрес"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Категории товаров (через запятую)"
                    name="categories"
                    value={formData.categories}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    helperText="Например: Электротехника, Кабель"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Условия оплаты"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    helperText="Например: Отсрочка 30 дней"
                  />
                </Grid>
                
                {editing && (
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SupplierProfile; 