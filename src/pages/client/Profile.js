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
  CardContent
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { clientService } from '../../services/api';

const ClientProfile = () => {
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
    fetchClientProfile();
  }, []);

  const fetchClientProfile = async () => {
    try {
      setLoading(true);
      // Get client profile using the ID from authenticated user
      const response = await clientService.getClient(user.id);
      setProfile(response);
      setFormData({
        name: response.name || '',
        contactPerson: response.contactPerson || '',
        email: response.email || '',
        phone: response.phone || '',
        address: response.address || ''
      });
    } catch (error) {
      console.error('Error fetching client profile:', error);
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
        address: profile.address || ''
      });
    }
    setEditing(!editing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await clientService.updateClient(user.id, formData);
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
            Профиль клиента
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
                src="/static/images/avatar/client.jpg"
              >
                {profile?.name?.charAt(0)}
              </Avatar>
              
              <Card sx={{ width: '100%', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Информация об аккаунте
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID клиента: {profile?._id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Статус: Активный
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Зарегистрирован: {new Date(profile?.createdAt || Date.now()).toLocaleDateString('ru-RU')}
                  </Typography>
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
                    rows={3}
                    required
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

export default ClientProfile; 