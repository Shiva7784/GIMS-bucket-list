import express from 'express';
import Destination from '../models/Destination.js';

const router = express.Router();

// @route   GET /api/destinations
// @desc    Get all destinations
// @access  Public
router.get('/', async (req, res) => {
    try {
        const destinations = await Destination.find({});
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/destinations
// @desc    Add a new destination
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, coordinates, weather } = req.body;

        const destination = new Destination({
            name,
            coordinates,
            weather,
        });

        const createdDestination = await destination.save();
        res.status(201).json(createdDestination);
    } catch (error) {
        res.status(400).json({ message: 'Invalid destination data', error: error.message });
    }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);

        if (destination) {
            await destination.deleteOne();
            res.json({ message: 'Destination removed' });
        } else {
            res.status(404).json({ message: 'Destination not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
