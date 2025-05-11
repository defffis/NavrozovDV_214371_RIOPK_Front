import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Tabs, Tab, Box, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, MenuItem, Select, FormControl,
  InputLabel, IconButton, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete, Add, Refresh } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const UserManagementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserType, setCurrentUserType] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { token } = useAuth();

  const userTypes = ['supplier', 'client', 'employee'];
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [suppliersRes, clientsRes, employeesRes] = await Promise.all([
        axios.get('/api/admin/users/suppliers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/users/clients', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/users/employees', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setSuppliers(suppliersRes.data);
      setClients(clientsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      showSnackbar('Failed to load users', 'error');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddUser = () => {
    setCurrentUser({
      email: '',
      name: '',
      password: '',
      phone: '',
      status: 'active'
    });
    setCurrentUserType(userTypes[tabValue]);
    setDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser({
      ...user,
      password: '' // Don't show the password in the edit form
    });
    setCurrentUserType(userTypes[tabValue]);
    setDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setCurrentUser(user);
    setCurrentUserType(userTypes[tabValue]);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentUser(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitUserForm = async () => {
    try {
      let endpoint = `/api/admin/users/${currentUserType}s`;
      let method = currentUser._id ? 'put' : 'post';
      let url = currentUser._id ? `${endpoint}/${currentUser._id}` : endpoint;
      
      const response = await axios({
        method,
        url,
        data: currentUser,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSnackbar(`User ${currentUser._id ? 'updated' : 'created'} successfully`);
      fetchUsers();
      handleDialogClose();
    } catch (error) {
      showSnackbar(`Failed to ${currentUser._id ? 'update' : 'create'} user`, 'error');
      console.error('Error saving user:', error);
    }
  };

  const deleteUser = async () => {
    try {
      await axios.delete(`/api/admin/users/${currentUserType}s/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSnackbar('User deleted successfully');
      fetchUsers();
      handleDeleteDialogClose();
    } catch (error) {
      showSnackbar('Failed to delete user', 'error');
      console.error('Error deleting user:', error);
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

  const renderUserTable = (users) => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Наименование</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Пользователи не найдены</TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditUser(user)} size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user)} size="small">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление пользователями
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<Refresh />} 
            onClick={fetchUsers}
            sx={{ mr: 1 }}
          >
            Обновить
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />} 
            onClick={handleAddUser}
          >
            Добавить пользователя
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
          <Tab label="Поставщики" />
          <Tab label="Клиенты" />
          <Tab label="Сотрудники" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && renderUserTable(suppliers)}
          {tabValue === 1 && renderUserTable(clients)}
          {tabValue === 2 && renderUserTable(employees)}
        </Box>
      </Paper>

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentUser && currentUser._id ? 'Edit' : 'Add'} {currentUserType}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUser?.name || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={currentUser?.email || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUser?.phone || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={currentUser?.password || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            helperText={currentUser && currentUser._id ? "Leave blank to keep current password" : ""}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={currentUser?.status || 'active'}
              label="Status"
              onChange={handleInputChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={submitUserForm} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {currentUser?.name}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={deleteUser} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default UserManagementPage; 