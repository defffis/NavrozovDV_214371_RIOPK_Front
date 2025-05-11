import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';

 
const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, error } = useAuth();
    
   
    const from = location.state?.from?.pathname || '/';
    const registered = location.state?.registered || false;
    
 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES.CLIENT);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(registered);
    
 
    useEffect(() => {
        if (registrationSuccess) {
            const timer = setTimeout(() => {
                setRegistrationSuccess(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [registrationSuccess]);
    
 
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setFormError('');
    };
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setFormError('');
    };
    
    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setFormError('');
    };
    
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        
        if (!email) {
            setFormError('Пожалуйста, введите email');
            return;
        }
        
        if (!password) {
            setFormError('Пожалуйста, введите пароль');
            return;
        }
        
        try {
             
            const result = await login(email, password, role);
            
           
            if (result.userInfo.role === ROLES.CLIENT) {
                navigate('/client/dashboard', { replace: true });
            } else if (result.userInfo.role === ROLES.SUPPLIER) {
                navigate('/supplier/dashboard', { replace: true });
            } else if (result.userInfo.role === ROLES.EMPLOYEE) {
                navigate('/employee/dashboard', { replace: true });
            } else if (result.userInfo.role === ROLES.ADMIN) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setFormError('Ошибка входа. Проверьте введенные данные.');
        }
    };
    
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <LocalShippingIcon sx={{ color: 'primary.main', fontSize: 40, mr: 1 }} />
                        <Typography component="h1" variant="h5" fontWeight="bold">
                            SupplyBI System
                        </Typography>
                    </Box>
                    
                    <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
                        Вход в систему
                    </Typography>
                    
                    {/* Сообщение об успешной регистрации */}
                    {registrationSuccess && (
                        <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                            Регистрация прошла успешно! Теперь вы можете войти в систему.
                        </Alert>
                    )}
                    
                    {/* Отображение ошибок */}
                    {(error || formError) && (
                        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                            {formError || error}
                        </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Тип аккаунта</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                value={role}
                                label="Тип аккаунта"
                                onChange={handleRoleChange}
                            >
                                <MenuItem value={ROLES.CLIENT}>Клиент</MenuItem>
                                <MenuItem value={ROLES.SUPPLIER}>Поставщик</MenuItem>
                                <MenuItem value={ROLES.EMPLOYEE}>Сотрудник</MenuItem>
                                <MenuItem value={ROLES.CLIENT}>Администратор</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={handleEmailChange}
                            error={!!formError && !email}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Пароль"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handlePasswordChange}
                            error={!!formError && !password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Войти'}
                        </Button>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Link to="/register" style={{ textDecoration: 'none', color: 'primary' }}>
                                <Typography variant="body2" color="primary">
                                    Нет аккаунта? Зарегистрироваться
                                </Typography>
                            </Link>
                            <Link to="/reset-password" style={{ textDecoration: 'none', color: 'primary' }}>
                                <Typography variant="body2" color="primary">
                                    Забыли пароль?
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
                
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    © {new Date().getFullYear()} SupplyBI System. Все права защищены.
                </Typography>
            </Box>
        </Container>
    );
};

export default Login; 