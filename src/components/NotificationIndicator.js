import React from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const NotificationIndicator = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead
  } = useNotifications();
  const [anchorEl, setAnchorEl] = React.useState(null);
 
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (notification) => {
    
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
   
    handleCloseMenu();
    
    
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate('/notifications');
    }
  };
  
  const handleViewAll = () => {
    handleCloseMenu();
    navigate('/notifications');
  };
  
  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ru });
  };
  
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpenMenu}
        aria-haspopup="true"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Уведомления</Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={() => markAllAsRead()}
              disabled={loading}
            >
              Отметить все как прочитанные
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <MenuItem disabled>
            <Typography variant="body2">Загрузка...</Typography>
          </MenuItem>
        ) : recentNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">У вас нет уведомлений</Typography>
          </MenuItem>
        ) : (
          <>
            {recentNotifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.05)',
                    whiteSpace: 'normal',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={notification.isRead ? 'normal' : 'bold'}
                    >
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
              </React.Fragment>
            ))}
            
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" onClick={handleViewAll}>
                Показать все
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationIndicator; 