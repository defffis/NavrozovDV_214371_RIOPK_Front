import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Общая иконка для отчетов
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import GroupIcon from '@mui/icons-material/Group';

import SalesReport from '../components/Reports/SalesReport';
import SupplierPerformanceReport from '../components/Reports/SupplierPerformanceReport';
import { useAuth } from '../contexts/AuthContext';
import { hasPageAccess } from '../utils/roles'; // Предполагается, что эта утилита существует

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`reports-tabpanel-${index}`}
            aria-labelledby={`reports-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ReportsPage = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const { currentUser } = useAuth();

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

     
    const availableReports = [];
    
    
    if (currentUser && (hasPageAccess(currentUser.role, 'reports') || hasPageAccess(currentUser.role, 'admin-reports'))) { 
        availableReports.push({ 
            index: availableReports.length, 
            label: 'Отчет по продажам', 
            icon: <PointOfSaleIcon />, 
            component: <SalesReport /> 
        });
        
        availableReports.push({ 
            index: availableReports.length, 
            label: 'Отчет по поставщикам', 
            icon: <GroupIcon />, 
            component: <SupplierPerformanceReport /> 
        });
    }
    
  
    if (availableReports.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                    У вас нет доступа к просмотру отчетов.
                </Typography>
            </Container>
        );
    }

   
    const currentSelectedTabExists = availableReports.some(report => report.index === selectedTab);
    const actualTab = currentSelectedTabExists ? selectedTab : (availableReports[0]?.index ?? 0);
    
    if (!currentSelectedTabExists && selectedTab !== actualTab) {
        setSelectedTab(actualTab);
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Отчеты
            </Typography>

            <Paper>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={actualTab} 
                        onChange={handleChange} 
                        aria-label="Отчеты"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {availableReports.map(report => (
                            <Tab 
                                key={report.index} 
                                label={report.label} 
                                icon={report.icon} 
                                iconPosition="start"
                                id={`reports-tab-${report.index}`}
                                aria-controls={`reports-tabpanel-${report.index}`}
                            />
                        ))}
                    </Tabs>
                </Box>
                {availableReports.map(report => (
                    <TabPanel key={report.index} value={actualTab} index={report.index}>
                        {report.component}
                    </TabPanel>
                ))}
            </Paper>
        </Container>
    );
};

export default ReportsPage; 