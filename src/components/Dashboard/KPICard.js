import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

 
const KPICard = ({ title, value, previousValue, maxValue = 100, unit = '%', description, color, icon: IconComponent }) => {
     
    const calculateChange = () => {
        if (!previousValue || previousValue === 0) return 0;
        return ((value - previousValue) / previousValue) * 100;
    };

    
    const trend = calculateChange();
    const trendIcon = trend > 2 ? 
        <TrendingUpIcon style={{ color: 'green' }} /> : 
        trend < -2 ? 
            <TrendingDownIcon style={{ color: 'red' }} /> : 
            <TrendingFlatIcon style={{ color: 'orange' }} />;

    
    const formatNumber = (num) => {
        
        if (typeof num !== 'number' || isNaN(num)) {
            return '0';
        }
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toFixed(1);
    };

    return (
        <Card 
            sx={{ 
                minWidth: 250, 
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 5,
                },
                borderLeft: `4px solid ${color}`
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div" color="text.secondary">
                        {title}
                    </Typography>
                    {IconComponent && <IconComponent sx={{ color }} />}
                </Box>
                
                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold', color }}>
                    {formatNumber(value)}{unit}
                </Typography>
                
                <LinearProgress 
                    variant="determinate" 
                    value={(value / maxValue) * 100} 
                    sx={{ 
                        mb: 1, 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: color,
                        }
                    }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {trendIcon}
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                ml: 0.5, 
                                color: trend > 2 ? 'green' : (trend < -2 ? 'red' : 'orange') 
                            }}
                        >
                            {Math.abs(trend).toFixed(1)}%
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default KPICard; 