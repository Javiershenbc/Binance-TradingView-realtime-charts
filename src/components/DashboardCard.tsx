import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const DashboardCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <Card sx={{ margin: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
