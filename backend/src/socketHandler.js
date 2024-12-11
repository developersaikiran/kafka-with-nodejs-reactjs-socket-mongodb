const { producer } = require("./kafka");

module.exports = (socket) => {
    console.log("New client connected", socket.id);

    socket.on('locationUpdate', (data) => {
        console.log('Received location:', data);

        let insertData = {
            driverId: data.driverId,
            lat: data.latitude,
            lng: data.longitude,
        }

        // Publish location data to Kafka
        const payloads = [
            { 
                topic: 'driver-locations', 
                messages: JSON.stringify(insertData) 
            },
        ];
        producer.send(payloads, (err, data) => {
            if (err) console.error('Kafka send error:', err);
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
};
