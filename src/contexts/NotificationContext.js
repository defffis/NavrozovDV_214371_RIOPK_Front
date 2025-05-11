import React, { createContext, useState, useEffect, useContext } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import { useSnackbar } from 'notistack';

 
const SOCKET_URL = 'http://127.0.0.1:5001';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    
    useEffect(() => {
        let socketInstance = null;
        
        if (isAuthenticated && currentUser?.id) {
            
            socketInstance = io(SOCKET_URL);
            
            socketInstance.on('connect', () => {
                console.log('Socket.IO connected');
                
            
                socketInstance.emit('join', currentUser.id);
            });
            
            socketInstance.on('disconnect', () => {
                console.log('Socket.IO disconnected');
            });
            
            socketInstance.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error);
            });
            
            setSocket(socketInstance);
        }
        
      
        return () => {
            if (socketInstance) {
                console.log('Cleaning up Socket.IO connection');
                socketInstance.disconnect();
            }
        };
    }, [isAuthenticated, currentUser?.id]);
    
    
    useEffect(() => {
        if (!socket) return;
        
      
        socket.on('new_notification', (notification) => {
            console.log('Received new notification:', notification);
            
            
            setNotifications(prev => [notification, ...prev]);
            
         
            setUnreadCount(prev => prev + 1);
            
        
            enqueueSnackbar(notification.title, { 
                variant: notification.type === 'warning' ? 'warning' : 'info',
                autoHideDuration: 5000,
                action: (key) => (
                    <button onClick={() => {
                        markAsRead(notification._id);
                        window.location.href = notification.link || '/notifications';
                    }}>
                        Открыть
                    </button>
                )
            });
        });
        
      
        socket.on('notification_read', (notificationId) => {
            console.log('Notification marked as read:', notificationId);
            
        
            setNotifications(prev => 
                prev.map(notification => 
                    notification._id === notificationId 
                        ? { ...notification, isRead: true } 
                        : notification
                )
            );
        });
        
      
        socket.on('all_notifications_read', () => {
            console.log('All notifications marked as read');
            
            
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            
           
            setUnreadCount(0);
        });
        
     
        socket.on('notification_deleted', (notificationId) => {
            console.log('Notification deleted:', notificationId);
            
            
            const deletedNotification = notifications.find(n => n._id === notificationId);
            
           
            setNotifications(prev => 
                prev.filter(notification => notification._id !== notificationId)
            );
            
         
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        });
        
        
        return () => {
            socket.off('new_notification');
            socket.off('notification_read');
            socket.off('all_notifications_read');
            socket.off('notification_deleted');
        };
    }, [socket, notifications, enqueueSnackbar]);

    
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        } else {
          
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, currentUser]);

   
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(notification => !notification.isRead).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

   
    const markAsRead = async (notificationId) => {
        try {
            setError(null);
            await notificationService.markAsRead(notificationId);
            
          
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification._id === notificationId 
                        ? { ...notification, isRead: true } 
                        : notification
                )
            );
            
           
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Failed to mark notification as read');
        }
    };

  
    const deleteNotification = async (notificationId) => {
        try {
            setError(null);
            await notificationService.deleteNotification(notificationId);
            
           
            const notificationToRemove = notifications.find(n => n._id === notificationId);
            setNotifications(prevNotifications => 
                prevNotifications.filter(notification => notification._id !== notificationId)
            );
            
      
            if (notificationToRemove && !notificationToRemove.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
            setError('Failed to delete notification');
        }
    };

   
    const markAllAsRead = async () => {
        try {
            setError(null);
            await notificationService.markAllAsRead();
            
            
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => ({ ...notification, isRead: true }))
            );
            
           
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            setError('Failed to mark all notifications as read');
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        deleteNotification,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export default NotificationContext; 