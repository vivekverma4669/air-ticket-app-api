express= require('express');
const flightsRouter = express.Router();
const flightsModel = require('../models/flight.module');
const UserModel = require('../models/User.module');
flightsRouter.use(express.json());
const jwt =require('jsonwebtoken');





flightsRouter.get('/my', async (req, res) => {
  const { type } = req.query;
  const userId = req.headers.userId;

  try {
      let flightss;

      if (type) {
          flightss = await flightsModel.find({ type, user_id: userId });
      } else {
          flightss = await flightsModel.find({ user_id: userId });
      }

      res.send(flightss);
  } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
  }
});


flightsRouter.post('/create', async (req, res) => {
  const { title, content, type ,imageUrl } = req.body;
  const userId = req.headers.userId;
  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const flights = await flightsModel.create({ title, content, auth_email: user.email, user_id: user._id, type, imageUrl });
    res.status(201).json({ msg: 'flights created successfully', flights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});







flightsRouter.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
      const updatedflights = await flightsModel.findByIdAndUpdate(id, { title, content }, { new: true });

      if (!updatedflights) {
          return res.status(404).json({ message: 'flights not found' });
      }

      res.json({ message: 'flights updated successfully', flights: updatedflights });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});



flightsRouter.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const deletedflights = await flightsModel.findByIdAndDelete(id);

      if (!deletedflights) {
          return res.status(404).json({ message: 'flights not found' });
      }

      res.json({ message: 'flights deleted successfully', flights: deletedflights });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = flightsRouter;
