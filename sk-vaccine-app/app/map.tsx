/**
 * code mostly from rn mapbox docs:
 * https://rnmapbox.github.io/docs/examples/UserLocation/CustomNativeUserLocation
 * also from:
 * expo location docs:
 * https://docs.expo.dev/versions/latest/sdk/location/
 */



import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import MapboxGL, {
  MapView,
  Camera,
  UserTrackingMode,
} from '@rnmapbox/maps';
import { Position } from '@rnmapbox/maps/lib/typescript/src/types/Position';
import { fetchUserLocation, manageOfflineData, getBoundingBox, DEFAULT_LOCATION } from '../src/map';



/**
 * page that displays a page that displays a map around the user's location
 * saves part of the map for offline use
 */
export default function OfflineMapWithUserLocation() {

  const [userLocation, setUserLocation] = useState<Position>(DEFAULT_LOCATION);
  let tempLocation: Position | null;
  useEffect(() => {
    const fetchData = async () => {
      if ((tempLocation = await fetchUserLocation()) === null) {
        setUserLocation(DEFAULT_LOCATION);
      }
      else {
        setUserLocation(tempLocation);
      }


      console.log("initial user location: ", userLocation);
      manageOfflineData(userLocation);
    };

    fetchData();
  }, []);

  if (userLocation === undefined) {
    new Error("userLocation is undefined");
  }


  return (
    <SafeAreaView style={styles.container}>
      <MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <Camera 
          defaultSettings={{
            centerCoordinate: userLocation,
            zoomLevel: 10,
          }}

        />
      </MapView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});