const kafka = require('kafka-node');
const { db } = require('./models');

const KAFKA_HOST = process.env.KAFKA_SERVER_HOST
const kafkaClient = new kafka.KafkaClient({ kafkaHost: KAFKA_HOST });
const producer = new kafka.Producer(kafkaClient);

producer.on('ready', () => console.log('Kafka Producer is ready'));
producer.on('error', (err) => console.error('Kafka Producer error:', err));


// Kafka Consumer Setup
const consumer = new kafka.ConsumerGroup(
    { groupId: 'location-consumers', kafkaHost: KAFKA_HOST },
    ['driver-locations']
);

let locationsBuffer = [];
const BATCH_SIZE = 5;

// Process incoming messages
consumer.on('message', async (message) => {
    try {

        const data = JSON.parse(message.value);
        locationsBuffer.push(data);
        
        if (locationsBuffer.length >= BATCH_SIZE) {
            // console.log(`Inserted ${locationsBuffer.length} records`);
            // locationsBuffer = [];

            // Uncomment below for batch insert logic
            await db.driverLocations.insertMany(locationsBuffer).then(() => {
                console.log(`Inserted ${locationsBuffer.length} records`);
                locationsBuffer = [];
            }).catch((err) => {
                console.error('Database batch insert error:', err);
            });
        }
    } catch (err) {
        console.error('Error parsing message:', message.value, 'Error:', err);
    }
});

// Periodic flush for remaining messages
setInterval(() => {
    if (locationsBuffer.length > 0) {
        console.log(`Inserted ${locationsBuffer.length} records (periodic flush)`);
        db.driverLocations.insertMany(locationsBuffer).then(() => {
            console.log(`Inserted ${locationsBuffer.length} records`);
            locationsBuffer = [];
        }).catch((err) => {
            console.error('Database batch insert error:', err);
        });
    }
}, 5000); // Flush every 5 seconds

// // Periodic flush for remove from DB
// setInterval(() => {
//         db.driverLocations.deleteMany().then(() => {
//             console.log(`Inserted ${locationsBuffer.length} records`);
//             locationsBuffer = [];
//         }).catch((err) => {
//             console.error('Database batch insert error:', err);
//         });
// }, 10000); // Flush every 10 seconds

consumer.on('error', (err) => console.error('Kafka Consumer error:', err));

module.exports = { consumer, producer };