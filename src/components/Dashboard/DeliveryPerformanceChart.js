import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';

 
const DeliveryPerformanceChart = ({ data, title = 'Производительность доставок', height = 350 }) => {
    const theme = useTheme();

     
    if (!data || data.length === 0) {
        return (
            <Card sx={{ height, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 'calc(100% - 40px)',
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            Нет данных для отображения
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                    <ResponsiveLine
                        data={data}
                        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            stacked: false,
                            reverse: false,
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Период',
                            legendOffset: 36,
                            legendPosition: 'middle',
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Значение',
                            legendOffset: -50,
                            legendPosition: 'middle',
                        }}
                        colors={{ scheme: 'category10' }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]}
                        theme={{
                            axis: {
                                ticks: {
                                    text: {
                                        fill: theme.palette.text.secondary,
                                    },
                                },
                                legend: {
                                    text: {
                                        fill: theme.palette.text.primary,
                                        fontSize: 12,
                                    },
                                },
                            },
                            legends: {
                                text: {
                                    fill: theme.palette.text.primary,
                                    fontSize: 12,
                                },
                            },
                            tooltip: {
                                container: {
                                    background: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    boxShadow: theme.shadows[3],
                                    borderRadius: 4,
                                },
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default DeliveryPerformanceChart; 