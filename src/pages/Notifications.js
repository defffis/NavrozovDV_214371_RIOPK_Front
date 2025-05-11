import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Badge,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNotifications } from '../contexts/NotificationContext';

 
const Notifications = () => {
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead 
  } = useNotifications();
  
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
 
  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };
  
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
 
  const handleMarkAsRead = async () => {
    if (!selectedNotification) return;
    
    try {
      await markAsRead(selectedNotification._id);
      handleMenuClose();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
 
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;
    
    try {
      await deleteNotification(selectedNotification._id);
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
 
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
 
  const filteredNotifications = tabValue === 0 
    ? notifications 
    : tabValue === 1 
      ? notifications.filter(notification => !notification.isRead)
      : notifications.filter(notification => notification.isRead);
  
   
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ReceiptIcon color="primary" />;
      case 'delivery':
        return <LocalShippingIcon color="primary" />;
      case 'inventory':
        return <InventoryIcon color="primary" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };
  
   
  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ru });
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Уведомления
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleMarkAllAsRead}
              disabled={loading || !notifications.some(n => !n.isRead)}
            >
              Пометить все как прочитанные
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Box>
                Все
                <Badge
                  color="primary"
                  badgeContent={notifications.length}
                  sx={{ ml: 1 }}
                  max={99}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box>
                Непрочитанные
                <Badge
                  color="error"
                  badgeContent={notifications.filter(n => !n.isRead).length}
                  sx={{ ml: 1 }}
                  max={99}
                />
              </Box>
            }
          />
          <Tab label="Прочитанные" />
        </Tabs>
        
        <Divider />
        
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Нет уведомлений
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    bgcolor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.05)',
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle1" component="span" fontWeight={notification.isRead ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip
                            icon={<NewReleasesIcon />}
                            label="Новое"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                        >
                          {formatTime(notification.createdAt || new Date())}
                        </Typography>
                      </>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={(e) => handleMenuOpen(e, notification)}>
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < filteredNotifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Меню действий для уведомления */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Отметить как прочитанное" />
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteNotification}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Удалить" />
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Notifications; 