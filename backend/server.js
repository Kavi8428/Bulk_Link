const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Connect to MongoDB
mongoose.connect('mongodb+srv://Admin:Admin123$@cluster0.khyvijc.mongodb.net/UserData?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Set up file storage with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Specify the destination folder for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp as the filename
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Registration route


app.post('/api/registration', async (req, res) => {
  try {
    const { name, email, phone, address, password, confirmPassword } = req.body;

    // Validate form fields
    if (!name || !email || !phone || !address || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password must match' });
    }

    // Create a new user
    const user = new User({ name, email, phone, address, password, confirmPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Handle login form submission
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate form fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists in the database (you need to implement this)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Authentication successful
    // You can generate a JWT token or use session-based authentication here
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});




/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<ProductCard>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/





const productCardSchema = new mongoose.Schema({
  title: String,
  company: String,
  price: String,
  image: String,
});

const ProductCard = mongoose.model('ProductCard', productCardSchema);

// Handle product card creation
app.post('/api/productcards', upload.single('image'), async (req, res) => {
  try {
    // Check if all required fields are present
    if (!req.body.title || !req.body.company || !req.body.price || !req.file) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new product card
    const productCard = new ProductCard({
      title: req.body.title,
      company: req.body.company,
      price: req.body.price,
      image: req.file.filename, // Assuming the image file is stored in req.file
    });

    await productCard.save();

    res.status(201).json({ message: 'Product card created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all product cards
app.get('/api/productcards', async (req, res) => {
  try {
    const productCards = await ProductCard.find();
    res.json(productCards);
  } catch (error) {
    res.status(500).json({ message: 'Somthing Wrong!!!!!!!!!!!' });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
