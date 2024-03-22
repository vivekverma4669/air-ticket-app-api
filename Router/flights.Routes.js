express= require('express');
const flightsRouter = express.Router();
const FlightModel = require('../models/flight.module');
const UserModel = require('../models/User.module');
flightsRouter.use(express.json());


flightsRouter.post('/', async (req, res) => {
  const { airline,flightNo ,departure,arrival ,departureTime ,arrivalTime ,seats,  price}  = req.body;
  try {
    const flights = await FlightModel.create({  airline,flightNo ,departure,arrival ,departureTime ,arrivalTime ,seats,  price});
    res.status(201).json({ msg: 'flights created successfully', flights});
  }
  catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});



flightsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { airline,flightNo ,departure,arrival ,departureTime ,arrivalTime ,seats,  price}  = req.body;

  try {
      const updatedflights = await FlightModel.findByIdAndUpdate(id, { airline,flightNo ,departure,arrival ,departureTime ,arrivalTime ,seats,  price}, { new: true });
      if (!updatedflights) {
          return res.status(404).json({ message: 'flights not found' });
      }
      res.json({ message: 'flights updated successfully', flights: updatedflights });
  }
  catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});



flightsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const deletedflights = await FlightModel.findByIdAndDelete(id);
      if (!deletedflights) {
          return res.status(404).json({ message: 'flights not found' });
      }
      res.json({ message: 'flights deleted successfully', flights: deletedflights });
  }
  catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});


module.exports = flightsRouter;
