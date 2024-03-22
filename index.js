const express = require('express');
const connection = require('./configs/db');
const bcrypt = require('bcrypt');
const UserModel = require('./models/User.module');
const jwt = require('jsonwebtoken');
const flightsRouter = require('./Router/flights.Routes');
const BookingModel = require('./models/Booking. module.js');
const FlightModel = require('./models/flight.module.js')
const { autentication } = require('./middleware/authentication');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
require('dotenv').config();


(async () => {
  try {
    await connection;
    console.log('connected successfully')
  } catch (error) {
    console.log(error);
  }
})();

app.get('/', (req, res) => {
  res.send({ 'app running you are on home page now': req.headers });
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      bcrypt.hash(password, 4, async function (err, hash) {
        await UserModel.create({ name: name, email: email, password: hash });
        res.status(201).send({ msg: ' sign up successful ', name: name, email: email, password: hash });
      });
    } else {
      res.send('already registered')
    }

  } catch (error) {
    console.error(error);
    res.send('sign up failed');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        const token = jwt.sign({ userId: user._id }, 'secret');
        return res.status(200).json({ msg: 'Login successful', token });
      } else {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/flights', async (req, res) => {
  try {
      const flights = await FlightModel.find();
      res.json(flights); 
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
});



app.get('/flights/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const flight = await FlightModel.findById(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.status(200).json(flight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




app.use(autentication);
app.use('/flights', flightsRouter);




app.post('/api/booking', async (req, res) => {
  const { flightId } = req.body;
  const userId = req.headers.userId;
  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const booking = await BookingModel.create({ user: userId, flight: flightId });
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/dashboard', async (req, res) => {
  const { userId } = req.headers;
  
  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const bookings = await BookingModel.find({ user: userId }).populate('user').populate('flight');
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/dashboard/:id', async (req, res) => {
  const { userId } = req.headers.userId;
  const { id } = req.params;
  const { flightId } = req.body;

  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const updatedBooking = await BookingModel.findByIdAndUpdate(id, { flight: flightId }, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/dashboard/:id', async (req, res) => {
  const { userId } = req.headers;
  const { id } = req.params;

  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const deletedBooking = await BookingModel.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(202).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});





const Port = process.env.PORT || 7000;
app.listen(Port, async () => {
  console.log(`app running at port ${Port}`);
});
