import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import type { Coordinates } from "../store/slices/weatherSlice";

import styles from "../page.module.css";

type GoogleMapProps = {
  currentCoords: Coordinates | null;
  selectedCoords: Coordinates | null;
  onMapClick: (event: MapMouseEvent) => void;
};

const API_KEY = "AIzaSyDbcmkOz0m2H2Eo5eum8Cm61U4jWCrn6rg";
const MAP_ID = "a6a16c3d3827ae115b8017cd";

export default function GoogleMap({
  currentCoords,
  selectedCoords,
  onMapClick,
}: GoogleMapProps) {
  if (!currentCoords) {
    return null;
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className={styles.map}>
        <Map
          defaultCenter={{
            lat: currentCoords.latitude,
            lng: currentCoords.longitude,
          }}
          defaultZoom={10}
          mapId={MAP_ID}
          gestureHandling="greedy"
          onClick={onMapClick}
          style={{
            width: "100%",
            height: "400px",
            border: "4px solid blue",
          }}
        >
          {selectedCoords && (
            <AdvancedMarker
              position={{
                lat: selectedCoords.latitude,
                lng: selectedCoords.longitude,
              }}
              title="Selected location"
            >
              <Pin
                background="#4285F4"
                borderColor="#ffffff"
                glyphColor="#ffffff"
              />
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
