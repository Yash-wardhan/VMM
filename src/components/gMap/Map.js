import React, { useEffect, useState, useCallback } from 'react';
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  Polyline,
  InfoWindow
} from 'react-google-maps';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import '../../App.css';

const Map = ({ paths, stops }) => {
  const [progress, setProgress] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [velocity, setVelocity] = useState(27);
  const [showInfo, setShowInfo] = useState(null);
  let initialDate;

  const icon1 = {
    url: "https://images.vexels.com/media/users/3/154573/isolated/preview/bd08e000a449288c914d851cb9dae110-hatchback-car-top-view-silhouette-by-vexels.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
    scale: 0.7,
  };

  const center = Math.floor(paths.length / 2);
  const centerPathLat = paths[center].lat;
  const centerPathLng = paths[center].lng;

  useEffect(() => {
    calculatePath();
    return () => {
      clearInterval(intervalId);
    };
  }, [paths]);

  const getDistance = () => {
    const timeElapsed = (new Date() - initialDate) / 1000;
    return timeElapsed * velocity;
  };

  const moveObject = () => {
    const distance = getDistance();
    if (!distance) return;

    let newProgress = paths.filter(coordinates => coordinates.distance < distance);
    const nextLine = paths.find(coordinates => coordinates.distance > distance);

    if (!nextLine) {
      setProgress(newProgress);
      clearInterval(intervalId);
      setIsRunning(false);
      console.log("Trip Completed!! Thank You !!");
      return;
    }

    const lastLine = newProgress[newProgress.length - 1];
    const lastLineLatLng = new window.google.maps.LatLng(lastLine.lat, lastLine.lng);
    const nextLineLatLng = new window.google.maps.LatLng(nextLine.lat, nextLine.lng);

    const totalDistance = nextLine.distance - lastLine.distance;
    const percentage = (distance - lastLine.distance) / totalDistance;

    const position = window.google.maps.geometry.spherical.interpolate(
      lastLineLatLng,
      nextLineLatLng,
      percentage
    );

    setProgress([...newProgress, position]);
    mapUpdate();
  };

  const calculatePath = () => {
    paths.forEach((coordinates, i, array) => {
      if (i === 0) {
        coordinates.distance = 0;
      } else {
        const latLong1 = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
        const latLong2 = new window.google.maps.LatLng(array[i - 1].lat, array[i - 1].lng);
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(latLong1, latLong2);
        coordinates.distance = distance + array[i - 1].distance;
      }
    });
  };

  const startSimulation = useCallback(() => {
    if (isRunning) return;
    setProgress([]);
    initialDate = new Date();
    const id = setInterval(moveObject, 1000);
    setIntervalId(id);
    setIsRunning(true);
  }, [isRunning]);

  const pauseSimulation = () => {
    clearInterval(intervalId);
    setIsRunning(false);
  };

  const stopSimulation = () => {
    clearInterval(intervalId);
    setProgress([]);
    setIsRunning(false);
  };

  const resetSimulation = () => {
    clearInterval(intervalId);
    setProgress([]);
    setIsRunning(false);
    calculatePath();
  };

  const mapUpdate = () => {
    const distance = getDistance();
    if (!distance) return;

    let newProgress = paths.filter(coordinates => coordinates.distance < distance);
    const nextLine = paths.find(coordinates => coordinates.distance > distance);

    let point1, point2;

    if (nextLine) {
      point1 = newProgress[newProgress.length - 1];
      point2 = nextLine;
    } else {
      point1 = newProgress[newProgress.length - 2];
      point2 = newProgress[newProgress.length - 1];
    }

    const point1LatLng = new window.google.maps.LatLng(point1.lat, point1.lng);
    const point2LatLng = new window.google.maps.LatLng(point2.lat, point2.lng);

    const angle = window.google.maps.geometry.spherical.computeHeading(point1LatLng, point2LatLng);
    const actualAngle = angle - 90;

    const marker = document.querySelector(`[src="${icon1.url}"]`);
    if (marker) {
      marker.style.transform = `rotate(${actualAngle}deg)`;
    }
  };

  return (
    <Card variant="outlined">
      <div className='btnCont'>
        <Button
          variant="contained"
          onClick={startSimulation}
          disabled={isRunning}
          style={{ backgroundColor: '#4CAF50', color: 'white', margin: '5px', transition: 'background-color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Start Simulation
        </Button>
        <Button
          variant="contained"
          onClick={pauseSimulation}
          disabled={!isRunning}
          style={{ backgroundColor: '#f39c12', color: 'white', margin: '5px', transition: 'background-color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e67e22'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f39c12'}
        >
          Pause Simulation
        </Button>
        <Button
          variant="contained"
          onClick={stopSimulation}
          style={{ backgroundColor: '#e74c3c', color: 'white', margin: '5px', transition: 'background-color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#c0392b'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e74c3c'}
        >
          Stop Simulation
        </Button>
        <Button
          variant="contained"
          onClick={resetSimulation}
          style={{ backgroundColor: '#3498db', color: 'white', margin: '5px', transition: 'background-color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2980b9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#3498db'}
        >
          Reset Simulation
        </Button>
        <Slider
          value={velocity}
          onChange={(e, newValue) => setVelocity(newValue)}
          min={1}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          style={{ width: '200px', marginTop: '10px' }}
        />
      </div>

      <div className='gMapCont'>
        <GoogleMap
          defaultZoom={17}
          defaultCenter={{ lat: centerPathLat, lng: centerPathLng }}
        >
          <Polyline
            path={paths}
            options={{
              strokeColor: "#0088FF",
              strokeWeight: 6,
              strokeOpacity: 0.6,
            }}
          />

          {stops.map((stop, index) => (
            <Marker
              key={index}
              position={{ lat: stop.lat, lng: stop.lng }}
              title={stop.id}
              label={`${index + 1}`}
              onClick={() => setShowInfo(stop.id)}
              icon={{
                url: "https://img.icons8.com/color/48/000000/marker.png", // Custom marker color
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
          {showInfo && (
            <InfoWindow
              position={{ lat: stops.data[showInfo - 1].lat, lng: stops.data[showInfo - 1].lng }}
              onCloseClick={() => setShowInfo(null)}
            >
              <div>
                <h3>Stop ID: {stops.data[showInfo - 1].id}</h3>
                <p>Details about the stop can go here.</p>
              </div>
            </InfoWindow>
          )}

          {progress.length > 0 && (
            <>
              <Polyline
                path={progress}
                options={{ strokeColor: "orange" }}
              />
              <Marker
                icon={icon1}
                position={progress[progress.length - 1]}
              />
            </>
          )}
        </GoogleMap>
      </div>
    </Card>
  );
};

export default withScriptjs(withGoogleMap(Map));
