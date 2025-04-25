import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Expense {
  id: string;
  description: string;
  amount: number;
  createdBy: {
    id: string;
    name: string;
  };
  group?: {
    id: string;
    name: string;
  };
  participants: Array<{
    user: {
      id: string;
      name: string;
    };
    amount: number;
  }>;
}

interface Group {
  id: string;
  name: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    groupId: '',
    participants: [] as Array<{ userId: string; amount: number }>,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    fetchGroups();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5001/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      const response = await axios.get('http://localhost:5001/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to fetch groups');
    }
  };

  const handleCreateExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      if (!newExpense.description || !newExpense.amount) {
        setError('Please fill in all required fields');
        return;
      }

      await axios.post(
        'http://localhost:5001/api/expenses',
        {
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      setNewExpense({
        description: '',
        amount: '',
        groupId: '',
        participants: [],
      });
      fetchExpenses();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://localhost:5001/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Expense
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Paper>
        <List>
          {expenses.map((expense) => (
            <ListItem
              key={expense.id}
              component="div"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/expenses/${expense.id}`)}
            >
              <ListItemText
                primary={expense.description}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {formatCurrency(expense.amount)} • {expense.createdBy.name}
                    </Typography>
                    {expense.group && (
                      <Chip
                        size="small"
                        label={expense.group.name}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteExpense(expense.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Group (Optional)</InputLabel>
            <Select
              value={newExpense.groupId}
              onChange={(e) => setNewExpense({ ...newExpense, groupId: e.target.value })}
              label="Group (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateExpense} variant="contained">
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 