const mongoose = require('mongoose');
const { primaryDB } = require('./index');
const Schema = mongoose.Schema

const driverLocations = new Schema({
    driverId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    lng: {
        type: String,
        required: true
    },
},{
    timestamps: true
})

module.exports = driverLocations
// module.exports = primaryDB.model(driverLocations, "driverLocations");