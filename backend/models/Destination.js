import mongoose from 'mongoose';

const destinationSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        weather: {
            temp: { type: Number },
            condition: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
