# React + Node + Kafka + Socket.io + BullMQ

## Commands
Start Zookeper Container and expose PORT 2181.
```
docker run -p 2181:2181 zookeeper
```

Start Kafka Container, expose PORT 9092 and setup ENV variables.

To Find your local IP address run this CMD `` ipconfig ``

**Ubuntu** command:
```
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka
```

**Windows** command:
```
docker run -p 9092:9092 ^
-e KAFKA_ZOOKEEPER_CONNECT=192.168.1.157:2181 ^
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.1.157:9092 ^
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 ^
confluentinc/cp-kafka
```

## Start project Locally

### Start Backend 
```
cd backend/
npm start
```

### Start Frontend
```
cd frontend/
npm run dev
```
