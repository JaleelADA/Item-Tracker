'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Select, MenuItem, AppBar, Toolbar, IconButton, Grid, Card, CardContent, CardActions } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([]) 
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [user, setUser] = useState(null)

  const auth = getAuth();

  const signIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  };

  const signUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
      })
      .catch((error) => {
        console.error("Error signing up:", error);
      });
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, category) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, category })
    } else {
      await setDoc(docRef, { quantity: 1, category })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInventory = filteredInventory.slice((page - 1) * 10, page * 10);

  return (
    <Box width="100vw" height="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Management
          </Typography>
          <IconButton color="inherit" onClick={handleOpen}>
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" p={2}>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Select
                value={category}
                onChange={handleCategoryChange}
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>Select Category</MenuItem>
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="furniture">Furniture</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="food">Food</MenuItem>
              </Select>
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName, category)
                  setItemName('')
                  setCategory('')
                  handleClose()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box width="100%" display="flex" justifyContent="center" alignItems="center" mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
        <Grid container spacing={2} justifyContent="center">
          {paginatedInventory.map(({ name, quantity, category }) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {category}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => removeItem(name)}>Remove</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box display="flex" justifyContent="space-between" padding={2} width="100%">
          <Button onClick={handlePreviousPage} disabled={page === 1}>Previous</Button>
          <Button onClick={handleNextPage}>Next</Button>
        </Box>
      </Box>
    </Box>
  )
}