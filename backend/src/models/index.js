const mongoose = require('mongoose');
require('dotenv').config()

const MONGODB_URL = process.env.MONGODB_SERVER_URL;
console.log("Database URL: ", MONGODB_URL);

// mongoose.connection(MONGODB_URL).then(()=>{
//     console.warn("Database connected successfully.");
// }).catch((err)=>{
//     console.error("Error: Database connection failed.");
// })
const primaryDB = mongoose.createConnection(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

primaryDB.on('connected', () => {
    console.log('MongoDB connected successfully to primaryDB');
});

primaryDB.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const driverLocations = primaryDB.model("driverLocations", require('./driverLocations.model'), "driverLocations")
const db = {
    driverLocations: driverLocations,
}

module.exports = {
    db,
    primaryDB
}