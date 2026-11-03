import { useState } from 'react';
import { Circle, CircleMarker, MapContainer, Polygon, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type MapLayer = 'Risk zones' | 'Health sites' | 'Water points';

const zoneA: [number, number][] = [
  [20.69, 78.76],
  [20.72, 78.94],
  [20.61, 79.02],
  [20.50, 78.88],
  [20.54, 78.72],
];
const zoneB: [number, number][] = [
  [20.29, 79.04],
  [20.38, 79.18],
  [20.31, 79.33],
  [20.18, 79.26],
  [20.16, 79.09],
];

function RecenterButton() {
  const map = useMap();
  return (
    <button
      className="live-map-recenter"
      type="button"
      aria-label="Recenter illustrative map"
      onClick={() => map.setView([20.5937, 78.9629], 6)}
      data-testid="button-map-recenter"
    >
      Recenter
    </button>
  );
}

export function LiveRiskMap() {
  const [layer, setLayer] = useState<MapLayer>('Risk zones');
  const [tileError, setTileError] = useState(false);

  return (
    <div className="live-map-shell">
      <div className="live-map-controls">
        <label htmlFor="map-layer-select">Map layer</label>
        <select
          id="map-layer-select"
          value={layer}
          onChange={(event) => setLayer(event.target.value as MapLayer)}
          data-testid="select-map-layer"
        >
          <option>Risk zones</option>
          <option>Health sites</option>
          <option>Water points</option>
        </select>
        <span className="live-map-label">FIXED SAMPLE LOCATIONS · NOT LIVE HEALTH DATA</span>
      </div>
      <div className={`live-map-canvas ${tileError ? 'live-map-fallback' : ''}`}>
        <MapContainer center={[20.5937, 78.9629]} zoom={6} scrollWheelZoom className="leaflet-demo-map">
          {!tileError && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{
                load: () => setTileError(false),
                tileerror: () => setTileError(true),
              }}
            />
          )}
          {layer === 'Risk zones' && (
            <>
              <Polygon
                positions={zoneA}
                pathOptions={{ color: '#bf7058', fillColor: '#e68f72', fillOpacity: 0.22, weight: 2 }}
              >
                <Popup>Zone A · illustrative high-risk area · sample score 86%</Popup>
              </Polygon>
              <Polygon
                positions={zoneB}
                pathOptions={{ color: '#ae8c4d', fillColor: '#ddb86b', fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>Zone B · illustrative elevated-risk area · sample score 68%</Popup>
              </Polygon>
              <Circle center={[20.5937, 78.9629]} radius={18000} pathOptions={{ color: '#c6765e', fillOpacity: 0.08, weight: 1 }} />
              <CircleMarker center={[20.62, 78.86]} radius={10} pathOptions={{ color: '#a95f4d', fillColor: '#d88970', fillOpacity: 0.95 }}>
                <Popup>Zone A · sample assessment · 86% high</Popup>
              </CircleMarker>
              <CircleMarker center={[20.27, 79.19]} radius={8} pathOptions={{ color: '#9b7b47', fillColor: '#d8b467', fillOpacity: 0.95 }}>
                <Popup>Zone B · sample assessment · 68% elevated</Popup>
              </CircleMarker>
            </>
          )}
          {layer === 'Health sites' && (
            <>
              {[
                { at: [20.67, 78.83] as [number, number], label: 'Sample health site 01' },
                { at: [20.46, 79.02] as [number, number], label: 'Sample health site 02' },
                { at: [20.24, 79.25] as [number, number], label: 'Sample health site 03' },
                { at: [20.85, 79.14] as [number, number], label: 'Sample health site 04' },
              ].map((site) => (
                <CircleMarker key={site.label} center={site.at} radius={7} pathOptions={{ color: '#326f89', fillColor: '#75b3c2', fillOpacity: 1 }}>
                  <Popup>{site.label} · illustrative marker only</Popup>
                </CircleMarker>
              ))}
            </>
          )}
          {layer === 'Water points' && (
            <>
              {[
                { at: [20.63, 78.9] as [number, number], label: 'Sample water point A', reading: 'Turbidity +38% · illustrative' },
                { at: [20.36, 79.13] as [number, number], label: 'Sample water point B', reading: 'Within sample range' },
                { at: [20.19, 78.87] as [number, number], label: 'Sample water point C', reading: 'Turbidity +11% · illustrative' },
              ].map((point) => (
                <CircleMarker key={point.label} center={point.at} radius={8} pathOptions={{ color: '#358989', fillColor: '#71c2b6', fillOpacity: 1 }}>
                  <Popup>{point.label} · {point.reading}</Popup>
                </CircleMarker>
              ))}
            </>
          )}
          <RecenterButton />
        </MapContainer>
        <div className="live-map-legend">
          <strong>{layer.toUpperCase()}</strong>
          <span>{tileError ? 'Basemap unavailable · illustrative grid fallback' : 'OpenStreetMap basemap · fixed sample overlay'}</span>
          {tileError && <button type="button" onClick={() => setTileError(false)} data-testid="button-map-retry">Retry basemap</button>}
        </div>
      </div>
    </div>
  );
}

