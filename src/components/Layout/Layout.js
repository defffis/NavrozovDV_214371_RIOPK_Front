import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    useTheme,
    useMediaQuery,
    Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ShopIcon from '@mui/icons-material/Shop';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { useAuth } from '../../contexts/AuthContext';
import { hasPageAccess } from '../../utils/roles';
import NotificationIndicator from '../NotificationIndicator';

 
const drawerWidth = 240;

 
const Layout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();
    
   
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openSubMenus, setOpenSubMenus] = useState({});
    
  
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
   
    const checkAccess = (pageName) => {
        if (!currentUser || !currentUser.role) return false;
        return hasPageAccess(currentUser.role, pageName);
    };
    
  
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleSubMenuToggle = (menu) => {
        setOpenSubMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };
    
    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };
    
    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };
    
  
    const getMenuItems = () => {
        
        const commonItems = [
            { 
                title: 'Обзор',
                path: '/', 
                icon: <DashboardIcon />, 
                access: checkAccess('dashboard') && currentUser?.role !== 'supplier' 
            },
        ];
        
      
        const adminManagerSharedItems = [
             {
                title: 'Панель Аналитики', 
                path: '/admin/dashboard', 
                icon: <QueryStatsIcon />, 
                access: checkAccess('admin-dashboard')
            },
            {
                title: 'Управление Продуктами', 
                path: '/admin/products', 
                icon: <CategoryIcon />, 
                access: checkAccess('admin-products')
            },
        ];

      
        const adminItems = [
            {
                title: 'Управление пользователями',
                path: '/user-management',
                icon: <SupervisorAccountIcon />,
                access: checkAccess('user-management')
            },
            {
                title: 'Настройки системы',
                path: '/settings',
                icon: <SettingsIcon />,
                access: checkAccess('settings')
            },
            
        ];
        
      
        const employeeItems = [
            {
                title: 'Поставщики',
                path: '/suppliers',
                icon: <PeopleIcon />,
                access: checkAccess('suppliers')
            },
            {
                title: 'Управление заказами',
                path: '/orders/manage',
                icon: <ReceiptIcon />,
                access: checkAccess('orders')
            },
            {
                title: 'Задачи',
                path: '/tasks',
                icon: <AssignmentIcon />,
                access: checkAccess('tasks')
            },
            {
                title: 'Контракты',
                path: '/contracts',
                icon: <FileCopyIcon />,
                access: checkAccess('contracts')
            },
            {
                title: 'Аналитика доставок',
                path: '/deliveries',
                icon: <LocalShippingIcon />,
                access: checkAccess('analytics')
            },
            {
                title: 'Отчеты',
                path: '/employee-reports',
                icon: <BarChartIcon />,
                access: checkAccess('reports')
            }
        ];
        
         
        const supplierItems = [
            {
                title: 'Панель управления',
                path: '/supplier/dashboard',
                icon: <DashboardIcon />,
                access: checkAccess('dashboard')
            },
            {
                title: 'Мои товары',
                path: '/products/manage',
                icon: <InventoryIcon />,
                access: checkAccess('products')
            },
            {
                title: 'Заказы',
                icon: <ReceiptIcon />,
                access: checkAccess('orders'),
                subItems: [
                    {
                        title: 'Мои заказы',
                        path: '/supplier/orders',
                        icon: <ReceiptIcon />,
                        access: checkAccess('orders')
                    },
                    {
                        title: 'Доступные заказы',
                        path: '/supplier/unclaimed-orders',
                        icon: <ShoppingCartIcon />,
                        access: checkAccess('orders')
                    }
                ]
            },
            {
                title: 'Контракты',
                path: '/supplier/contracts',
                icon: <FileCopyIcon />,
                access: checkAccess('contracts')
            },
            {
                title: 'Показатели эффективности',
                path: '/supplier/performance',
                icon: <AssessmentIcon />,
                access: checkAccess('performance')
            },
            {
                title: 'Уведомления',
                path: '/notifications',
                icon: <NotificationsIcon />,
                access: checkAccess('notifications')
            }
        ];
        
       
        const clientItems = [
            {
                title: 'Приветственная страница',
                path: '/client/dashboard',
                icon: <DashboardIcon />,
                access: checkAccess('dashboard')
            },
            {
                title: 'Каталог товаров',
                path: '/client/products',
                icon: <StorefrontIcon />,
                access: checkAccess('products')
            },
            {
                title: 'Мои заказы',
                path: '/client/orders',
                icon: <ReceiptIcon />,
                access: checkAccess('orders')
            },
            {
                title: 'Корзина',
                path: '/client/cart',
                icon: <ShoppingCartIcon />,
                access: checkAccess('cart')
            }
        ];
        
       
        const roleMenuItems = [];
        
        
        roleMenuItems.push(...commonItems.filter(item => item.access));
        
       
        if (currentUser) {
            switch(currentUser.role) {
                case 'admin':
                    roleMenuItems.push(...adminManagerSharedItems.filter(item => item.access));
                    roleMenuItems.push(...adminItems.filter(item => item.access));
                    roleMenuItems.push(...employeeItems.filter(item => item.access));
                    break;
                case 'manager':
                    roleMenuItems.push(...adminManagerSharedItems.filter(item => item.access));
                    roleMenuItems.push(...employeeItems.filter(item => item.access));
                    break;
                case 'employee':
                    roleMenuItems.push(...employeeItems.filter(item => item.access));
                    break;
                case 'supplier':
                    roleMenuItems.push(...supplierItems.filter(item => item.access));
                    break;
                case 'client':
                    roleMenuItems.push(...clientItems.filter(item => item.access));
                    break;
                default:
                    break;
            }
        }
        
        return roleMenuItems;
    };
    
   
    const menuItems = getMenuItems();
    
    
    const drawer = (
        <div>
            <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <Typography variant="h6" noWrap component="div" color="primary" fontWeight="bold">
                    SupplyBI System
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <React.Fragment key={item.path}>
                        {item.subItems ? (
                            <>
                                <ListItem
                                    button
                                    onClick={() => handleSubMenuToggle(item.path)}
                                    sx={{
                                        mb: 0.5,
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        },
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.title} />
                                    {openSubMenus[item.path] ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse in={openSubMenus[item.path]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.subItems.filter(subItem => subItem.access).map((subItem) => (
                                            <ListItem
                                                button
                                                key={subItem.path}
                                                onClick={() => handleNavigate(subItem.path)}
                                                selected={location.pathname === subItem.path}
                                                sx={{
                                                    pl: 4,
                                                    '&.Mui-selected': {
                                                        bgcolor: 'rgba(63, 81, 181, 0.1)',
                                                        borderRight: `3px solid ${theme.palette.primary.main}`,
                                                    },
                                                    '&.Mui-selected:hover': {
                                                        bgcolor: 'rgba(63, 81, 181, 0.15)',
                                                    },
                                                    '&:hover': {
                                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                                    },
                                                    mb: 0.5,
                                                }}
                                            >
                                                <ListItemIcon
                                                    sx={{
                                                        color: location.pathname === subItem.path ? theme.palette.primary.main : 'inherit',
                                                    }}
                                                >
                                                    {subItem.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={subItem.title}
                                                    primaryTypographyProps={{
                                                        fontWeight: location.pathname === subItem.path ? 'bold' : 'normal',
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        ) : (
                            <ListItem
                                button
                                onClick={() => handleNavigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(63, 81, 181, 0.1)',
                                        borderRight: `3px solid ${theme.palette.primary.main}`,
                                    },
                                    '&.Mui-selected:hover': {
                                        bgcolor: 'rgba(63, 81, 181, 0.15)',
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                    mb: 0.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                    }}
                                />
                            </ListItem>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    boxShadow: 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {menuItems.find((item) => item.path === location.pathname)?.title || 'Дашборд'}
                    </Typography>
                    
                    {/* Уведомления */}
                    {checkAccess('notifications') && (
                        <NotificationIndicator />
                    )}
                    
                    {/* Аватар пользователя и меню */}
                    <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                        edge="end"
                        color="inherit"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        sx={{ ml: 1 }}
                    >
                        <Avatar
                            alt={currentUser?.name || 'User'}
                            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                        >
                            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: { width: 200, mt: 1 },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={() => handleNavigate('/profile')}>
                            <ListItemIcon>
                                <AccountCircleIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Профиль" />
                        </MenuItem>
                        {checkAccess('settings') && (
                            <MenuItem onClick={() => handleNavigate('/settings')}>
                                <ListItemIcon>
                                    <SettingsIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Настройки" />
                            </MenuItem>
                        )}
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Выйти" />
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            
            {/* Боковое меню */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
            >
                {/* Мобильная версия бокового меню */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,  
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Десктопная версия бокового меню */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            
            {/* Основное содержимое */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Toolbar /> 
                <Outlet />  
            </Box>
        </Box>
    );
};

export default Layout;