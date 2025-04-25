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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Group {
  id: string;
  name: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
  }>;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5001/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to fetch groups');
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!newGroup.name) {
        setError('Group name is required');
        return;
      }

      await axios.post(
        'http://localhost:5001/api/groups',
        newGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups();
      setError('');
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://localhost:5001/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroups();
      setError('');
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Failed to delete group');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Groups</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Group
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Paper>
        <List>
          {groups.map((group) => (
            <ListItem
              key={group.id}
              component="div"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <ListItemText
                primary={group.name}
                secondary={`${group.members.length} members${group.description ? ` • ${group.description}` : ''}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(group.id);
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
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            required
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 