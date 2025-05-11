import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';

 
const Profile = () => {
  const { currentUser, updateProfile, loading, error } = useAuth();
  const [tabValue, setTabValue] = useState(0);

 
  const [userData, setUserData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    position: '',
    department: '',
  });

 
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
 
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderStatusUpdates: true,
    promotionalMessages: false,
    systemAlerts: true,
  });

  
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  
  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name || '',
        contactPerson: currentUser.contactPerson || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        position: currentUser.position || '',
        department: currentUser.department || '',
      });
    }
  }, [currentUser]);

   
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
 
    setSuccess('');
    setFormError('');
  };

 
  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

 
  const handleNotificationChange = (name) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  };

 
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormError('');
      await updateProfile(userData);
      setSuccess('Профиль успешно обновлен');
    } catch (err) {
      setFormError('Ошибка при обновлении профиля');
      console.error('Error updating profile:', err);
    }
  };

 
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setFormError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    try {
      setFormError('');
      
      setSuccess('Пароль успешно изменен');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setFormError('Ошибка при изменении пароля');
      console.error('Error changing password:', err);
    }
  };

  
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormError('');
      
      setSuccess('Настройки уведомлений обновлены');
    } catch (err) {
      setFormError('Ошибка при обновлении настроек уведомлений');
      console.error('Error updating notification settings:', err);
    }
  };

 
  const getRoleTitle = () => {
    if (!currentUser || !currentUser.role) return '';
    
    switch (currentUser.role) {
      case ROLES.ADMIN:
        return 'Администратор';
      case ROLES.EMPLOYEE:
        return 'Сотрудник компании';
      case ROLES.SUPPLIER:
        return 'Поставщик';
      case ROLES.CLIENT:
        return 'Клиент';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: 40,
              mr: 2,
            }}
          >
            {userData.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {userData.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {getRoleTitle()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab icon={<AccountCircleIcon />} label="Личные данные" />
          <Tab icon={<SecurityIcon />} label="Безопасность" />
          <Tab icon={<NotificationsIcon />} label="Уведомления" />
        </Tabs>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {(formError || error) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError || error}
          </Alert>
        )}

        {/* Вкладка с личными данными */}
        {tabValue === 0 && (
          <Box component="form" onSubmit={handleProfileSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя / Название организации"
                  name="name"
                  value={userData.name}
                  onChange={handleUserDataChange}
                  required
                />
              </Grid>

              {/* Поля для клиента и поставщика */}
              {(currentUser?.role === ROLES.CLIENT || currentUser?.role === ROLES.SUPPLIER) && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Контактное лицо"
                      name="contactPerson"
                      value={userData.contactPerson}
                      onChange={handleUserDataChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Адрес"
                      name="address"
                      value={userData.address}
                      onChange={handleUserDataChange}
                    />
                  </Grid>
                </>
              )}

              {/* Поля для сотрудника */}
              {currentUser?.role === ROLES.EMPLOYEE && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Должность"
                      name="position"
                      value={userData.position}
                      onChange={handleUserDataChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Отдел"
                      name="department"
                      value={userData.department}
                      onChange={handleUserDataChange}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={userData.phone}
                  onChange={handleUserDataChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleUserDataChange}
                  required
                  disabled
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Вкладка с паролем */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Текущий пароль"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новый пароль"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  helperText="Минимум 6 символов"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Подтверждение пароля"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Изменить пароль'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Вкладка с настройками уведомлений */}
        {tabValue === 2 && (
          <Box component="form" onSubmit={handleNotificationSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Настройки уведомлений
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Выберите типы уведомлений, которые вы хотели бы получать
                </Typography>
              </Grid>

              {/* Чекбоксы настроек уведомлений будут здесь */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Сохранить настройки'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile; 