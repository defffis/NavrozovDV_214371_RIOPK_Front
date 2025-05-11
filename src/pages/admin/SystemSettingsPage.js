import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Button,
  Tab, Tabs, Card, CardContent, Grid, TextField,
  Switch, FormGroup, FormControlLabel, Divider,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const SystemSettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      maintenanceMode: false,
      allowRegistration: true,
      maxUploadSize: 5,
      defaultCurrency: 'USD'
    },
    email: {
      smtpServer: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      senderEmail: '',
      senderName: ''
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordResetExpiry: 24,
      requireEmailVerification: true,
      twoFactorAuth: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderStatusChanges: true,
      newOrderNotification: true,
      paymentNotification: true,
      systemAlerts: true
    }
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load settings', 'error');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (section, name, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await axios.post('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSnackbar('Settings saved successfully');
    } catch (error) {
      showSnackbar('Failed to save settings', 'error');
      console.error('Error saving settings:', error);
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

  // General Settings Tab
  const renderGeneralSettings = () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Конфигурация сайта</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Сайт Наименование"
              value={settings.general.siteName}
              onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Валюта по умолчанию"
              value={settings.general.defaultCurrency}
              onChange={(e) => handleInputChange('general', 'defaultCurrency', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание сайта"
              multiline
              rows={2}
              value={settings.general.siteDescription}
              onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Системные настройки</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                  />
                }
                label="Режим обслуживания"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.allowRegistration}
                    onChange={(e) => handleInputChange('general', 'allowRegistration', e.target.checked)}
                  />
                }
                label="Разрешить регистрацию пользователей"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Максимальный размер загрузки (MB)"
              value={settings.general.maxUploadSize}
              onChange={(e) => handleInputChange('general', 'maxUploadSize', Number(e.target.value))}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Email Settings Tab
  const renderEmailSettings = () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Конфигурация SMTP</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Сервер"
              value={settings.email.smtpServer}
              onChange={(e) => handleInputChange('email', 'smtpServer', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="SMTP Порт"
              value={settings.email.smtpPort}
              onChange={(e) => handleInputChange('email', 'smtpPort', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Имя пользователя"
              value={settings.email.smtpUsername}
              onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="SMTP Пароль"
              value={settings.email.smtpPassword}
              onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Отправитель информации</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Отправитель Email"
              value={settings.email.senderEmail}
              onChange={(e) => handleInputChange('email', 'senderEmail', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Отправитель"
              value={settings.email.senderName}
              onChange={(e) => handleInputChange('email', 'senderName', e.target.value)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Security Settings Tab
  const renderSecuritySettings = () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Настройки сессии</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Время сессии (минуты)"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Максимальное количество попыток входа"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => handleInputChange('security', 'maxLoginAttempts', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Срок действия сброса пароля (часы)"
              value={settings.security.passwordResetExpiry}
              onChange={(e) => handleInputChange('security', 'passwordResetExpiry', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Настройки аутентификации</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onChange={(e) => handleInputChange('security', 'requireEmailVerification', e.target.checked)}
                  />
                }
                label="Требовать подтверждение Email"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                }
                label="Включить двухфакторную аутентификацию"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Notification Settings Tab
  const renderNotificationSettings = () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Каналы уведомлений</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                }
                label="Email уведомления"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                  />
                }
                label="SMS уведомления"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">События уведомлений</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.orderStatusChanges}
                    onChange={(e) => handleInputChange('notifications', 'orderStatusChanges', e.target.checked)}
                  />
                }
                label="Изменение статуса заказа"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.newOrderNotification}
                    onChange={(e) => handleInputChange('notifications', 'newOrderNotification', e.target.checked)}
                  />
                }
                label="Новые заказы"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.paymentNotification}
                    onChange={(e) => handleInputChange('notifications', 'paymentNotification', e.target.checked)}
                  />
                }
                label="Платежные уведомления"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                  />
                }
                label="Системные уведомления"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Системные настройки
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={fetchSettings}
            sx={{ mr: 1 }}
          >
            Обновить
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Save />} 
            onClick={handleSaveSettings}
          >
            Сохранить настройки
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Основные настройки" />
          <Tab label="Email" />
          <Tab label="Безопасность" />
          <Tab label="Уведомления" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && renderGeneralSettings()}
          {tabValue === 1 && renderEmailSettings()}
          {tabValue === 2 && renderSecuritySettings()}
          {tabValue === 3 && renderNotificationSettings()}
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SystemSettingsPage; 