import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';

 
const steps = ['Выбор типа аккаунта', 'Личная информация', 'Учетные данные'];

 
const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  
  
  const [activeStep, setActiveStep] = useState(0);
  const [role, setRole] = useState(ROLES.CLIENT);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
 
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
 
  const validateCurrentStep = () => {
    const errors = {};
    
    switch (activeStep) {
      case 0:
        
        if (!role) {
          errors.role = 'Пожалуйста, выберите тип аккаунта';
        }
        break;
      case 1:
        
        if (!name.trim()) {
          errors.name = 'Пожалуйста, введите имя';
        }
        
        if (role === ROLES.CLIENT || role === ROLES.SUPPLIER) {
          if (!contactPerson.trim()) {
            errors.contactPerson = 'Пожалуйста, введите контактное лицо';
          }
          
          if (!address.trim()) {
            errors.address = 'Пожалуйста, введите адрес';
          }
        }
        
        if (role === ROLES.EMPLOYEE) {
          if (!position.trim()) {
            errors.position = 'Пожалуйста, введите должность';
          }
          
          if (!department.trim()) {
            errors.department = 'Пожалуйста, введите отдел';
          }
        }
        
        if (!phone.trim()) {
          errors.phone = 'Пожалуйста, введите телефон';
        }
        break;
      case 2:
       
        if (!email.trim()) {
          errors.email = 'Пожалуйста, введите email';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          errors.email = 'Пожалуйста, введите корректный email';
        }
        
        if (!password) {
          errors.password = 'Пожалуйста, введите пароль';
        } else if (password.length < 6) {
          errors.password = 'Пароль должен содержать минимум 6 символов';
        }
        
        if (password !== confirmPassword) {
          errors.confirmPassword = 'Пароли не совпадают';
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
   
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateCurrentStep()) {
      const userData = {
        role,
        name,
        contactPerson: role === ROLES.CLIENT || role === ROLES.SUPPLIER ? contactPerson : undefined,
        phone,
        email,
        address: role === ROLES.CLIENT || role === ROLES.SUPPLIER ? address : undefined,
        position: role === ROLES.EMPLOYEE ? position : undefined,
        department: role === ROLES.EMPLOYEE ? department : undefined,
        password,
      };
      
      try {
        await register(userData);
         
        navigate('/login', { state: { registered: true } });
      } catch (err) {
        console.error('Registration error:', err);
      }
    }
  };
  
 
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset" error={!!formErrors.role}>
              <FormLabel component="legend">Выберите тип аккаунта</FormLabel>
              <RadioGroup
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setFormErrors((prev) => ({ ...prev, role: undefined }));
                }}
              >
                <FormControlLabel value={ROLES.CLIENT} control={<Radio />} label="Клиент" />
                <FormControlLabel value={ROLES.SUPPLIER} control={<Radio />} label="Поставщик" />
                
              </RadioGroup>
              {formErrors.role && (
                <Typography color="error" variant="caption">
                  {formErrors.role}
                </Typography>
              )}
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название организации / ФИО"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>
              
              {(role === ROLES.CLIENT || role === ROLES.SUPPLIER) && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Контактное лицо"
                      value={contactPerson}
                      onChange={(e) => {
                        setContactPerson(e.target.value);
                        setFormErrors((prev) => ({ ...prev, contactPerson: undefined }));
                      }}
                      error={!!formErrors.contactPerson}
                      helperText={formErrors.contactPerson}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Адрес"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setFormErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      required
                    />
                  </Grid>
                </>
              )}
              
              {role === ROLES.EMPLOYEE && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Должность"
                      value={position}
                      onChange={(e) => {
                        setPosition(e.target.value);
                        setFormErrors((prev) => ({ ...prev, position: undefined }));
                      }}
                      error={!!formErrors.position}
                      helperText={formErrors.position}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Отдел"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setFormErrors((prev) => ({ ...prev, department: undefined }));
                      }}
                      error={!!formErrors.department}
                      helperText={formErrors.department}
                      required
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Телефон"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required
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
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Подтверждение пароля"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Неизвестный шаг';
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
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
            Регистрация
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                variant="outlined"
              >
                Назад
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Далее
                </Button>
              )}
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Уже есть аккаунт?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Войти
              </Link>
            </Typography>
          </Box>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} SupplyBI System. Все права защищены.
        </Typography>
      </Box>
    </Container>
  );
};

export default Register; 