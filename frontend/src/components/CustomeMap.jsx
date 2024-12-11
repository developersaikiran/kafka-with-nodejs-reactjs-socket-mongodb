import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import captain from '../assets/captain.png'
import pickupAddress from '../assets/pickupAddress.png'
import dropOffAddress from '../assets/dropOffAddress.png'
import { io } from "socket.io-client";

const socket = await io("http://192.168.1.157:4000/", {
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: 10
}).connect(); // Connect to server

const createCustomIcon = (iconUrl) => {
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [50, 50], // Size of the icon (width, height)
        iconAnchor: [16, 32], // Point of the icon which will correspond to the marker's position
        popupAnchor: [0, -32], // Position of the popup relative to the icon
    });
};


const MyPopupMarker = ({ children, position, iconUrl }) => {
    const customIcon = createCustomIcon(iconUrl);
    return (
        <Marker position={position} icon={customIcon}>
            <Popup>
                <span>{children}</span>
            </Popup>
        </Marker>
    )
};

const MyMarkersList = ({ markers }) => {
    const items = markers.map(({ key, ...props }) => (
        <MyPopupMarker key={key} {...props} />
    ));
    return <>{items}</>;
};

MyMarkersList.propTypes = {
    markers: PropTypes.array.isRequired,
};

// Custom hook to adjust the map view based on markers' bounds
const FitBoundsToMarkers = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        const bounds = markers.map(marker => marker.position);
        // map.fitBounds(bounds); // Adjust map to fit the markers
        const padding = [10, 10]; // Padding of 50px on all sides
        map.fitBounds(bounds, { padding: padding });

    }, [markers, map]);

    return null;
};

// Custom hook to dynamically center the map
const DynamicMapCenter = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom(), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [center, map]);

    return null;
};


const CustomMap = () => {
    const [location, setLocation] = useState([21.205662584770383, 72.83627382839941]); // Default location
    const mapRef = useRef();
    const [zoomLevel, setZoomLevel] = useState(15);

    const [markers, setMarkers] = useState([
        {
            key: "Driver",
            name: "You",
            position: [21.205662584770383, 72.83627382839941], // Default driver location
            children: "You are here",
            iconUrl: captain,
        },
        {
            key: "Pickup",
            name: "Pickup Address",
            position: [21.20049085787373, 72.8413478165172],
            children: "Pickup Location",
            iconUrl: pickupAddress,
        },
        {
            key: "DropOff",
            name: "Drop-Off Address",
            position: [21.191496883884255, 72.8595017351696],
            children: "Drop-Off Location",
            iconUrl: dropOffAddress,
        },
    ]);

    // Update zoom level dynamically based on user interaction
    const handleZoomChange = () => {
        const map = mapRef.current;
        if (map) {
            setZoomLevel(map.getZoom()); // Save the current zoom level
        }
    };

    // Geolocation Update
    useEffect(() => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        let id = 1;
        let lastLocation = null; // Store the last emitted location

        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // const { latitude, longitude } = position.coords;
                    let min = 10680118198;
                    let max = 83553982298;
                    const latitude = parseFloat('21.2' + Math.floor(Math.random() * (max - min + 1)) + min);
                    const longitude = parseFloat('72.8' + Math.floor(Math.random() * (max - min + 1)) + min);
                    console.log({ latitude, longitude });

                    const newLocation = [latitude, longitude];

                    if (!lastLocation || lastLocation[0] !== latitude || lastLocation[1] !== longitude) {
                        lastLocation = newLocation; // Update the last location
                        console.log({ latitude, longitude });
    
                        setLocation(newLocation);
    
                        setMarkers((prevMarkers) =>
                            prevMarkers.map((marker) =>
                                marker.key === "Driver"
                                    ? { ...marker, position: newLocation }
                                    : marker
                            )
                        );
    
                        socket.emit("locationUpdate", {
                            id: id,
                            driverId: '5f92cbf10cf217478ba93561',
                            latitude,
                            longitude,
                        });
                        id += 1;
                    }
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
        };

        const interval = setInterval(updateLocation, 3000); // Update every second
        return () => {
            clearInterval(interval); // Cleanup interval on unmount
        } 
    }, [socket]);

    // Routing Control
    useEffect(() => {
        const map = mapRef.current;

        if (map) {
            const routeControl = L.Routing.control({
                waypoints: markers.map((marker) => L.latLng(marker.position)),
                lineOptions: {
                    styles: [{ color: "green", weight: 7, opacity: 0.7 }],
                },
                routeWhileDragging: false,
                show: true, // Show the initial route
                addWaypoints: false, // Disable adding waypoints
                draggableWaypoints: false, // Disable dragging waypoints
                fitBounds: false, // Fit the map to the route
                showAlternatives: false,
                autoRoute: true,
                createMarker: () => null, // Do not add default markers
                units: 'metric', // Set units to metric (kilometers)
            }).addTo(map);

            return () => {
                map.removeControl(routeControl); // Cleanup routing control on markers change
            };
        }
    }, [markers]);

    return (
        <MapContainer
            center={location}
            zoom={zoomLevel}
            style={{ height: "100vh", width: "100vw" }}
            ref={mapRef}
            whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
                mapInstance.on("zoomend", handleZoomChange); // Listen for zoom changes
            }}
        >
            <TileLayer
                // attribution="&amp;copy <a href='http://osm.org/copyright'>OpenStreetMap 123</a> contributors"
                url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />
            
            {/* <DynamicMapCenter center={location} /> */}
            {/* <Polyline positions={routeCoordinates} color="blue" weight={4} opacity={0.7} /> */}
            <MyMarkersList markers={markers} />
            {/* <FitBoundsToMarkers markers={markers} /> */}
        </MapContainer>
    );
};

export default CustomMap;
