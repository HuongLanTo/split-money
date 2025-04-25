import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Group as GroupIcon, Receipt as ReceiptIcon } from '@mui/icons-material';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Split Money
      </Typography>
      <Typography variant="body1" paragraph>
        Easily split expenses with your friends and groups. Track who owes whom and settle up quickly.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Groups</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Create and manage groups to split expenses with multiple people.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/groups')}
              >
                Manage Groups
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Expenses</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Add and track expenses, and see who owes what to whom.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/expenses')}
              >
                Manage Expenses
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 