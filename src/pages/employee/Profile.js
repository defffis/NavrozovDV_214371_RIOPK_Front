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
  Chip
} from '@mui/material';
import { Edit, Save, Cancel, Badge, Work, AssignmentInd } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { employeeService } from '../../services/api';

const EmployeeProfile = () => {
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
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      // Get employee profile using the ID from authenticated user
      const response = await employeeService.getEmployee(user.id);
      setProfile(response);
      setFormData({
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        position: response.position || '',
        department: response.department || ''
      });
    } catch (error) {
      console.error('Error fetching employee profile:', error);
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
        email: profile.email || '',
        phone: profile.phone || '',
        position: profile.position || '',
        department: profile.department || ''
      });
    }
    setEditing(!editing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await employeeService.updateEmployee(user.id, formData);
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
            Профиль сотрудника
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
                src="/static/images/avatar/employee.jpg"
              >
                {profile?.name?.charAt(0)}
              </Avatar>
              
              <Card sx={{ width: '100%', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Информация об аккаунте
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Badge sx={{ mr: 1 }} fontSize="small" />
                    ID сотрудника: {profile?._id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work sx={{ mr: 1 }} fontSize="small" />
                    Должность: {profile?.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentInd sx={{ mr: 1 }} fontSize="small" />
                    Отдел: {profile?.department}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label="Активный" 
                      color="success" 
                      size="small" 
                      sx={{ mr: 1 }} 
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
                    label="ФИО"
                    name="name"
                    value={formData.name}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Должность"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Отдел"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!editing}
                    variant="outlined"
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

export default EmployeeProfile; 