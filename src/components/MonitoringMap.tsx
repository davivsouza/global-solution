import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, spacing } from '../theme/colors';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  /** Marker tint. Defaults to the accent color. */
  color?: string;
  /** Flags an alert (danger styling on the pin). */
  alert?: boolean;
  label?: string;
}

interface MonitoringMapProps {
  markers: MapMarker[];
  /** Currently selected marker id. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

// Center of Brazil — used when there are no markers to frame.
const BRAZIL_CENTER = { lat: -14.235, lng: -51.925, zoom: 4 };

/**
 * Builds the self-contained Leaflet HTML document. Markers are injected as a
 * JSON blob; tile imagery comes from OpenStreetMap (no API key required).
 * Tapping a marker posts its id back to React Native.
 */
function buildHtml(markers: MapMarker[]): string {
  const data = JSON.stringify(
    markers.map((m) => ({
      id: m.id,
      lat: m.latitude,
      lng: m.longitude,
      color: m.alert ? colors.colorWarning : m.color ?? colors.accentPrimary,
      alert: !!m.alert,
      label: m.label ?? '',
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; height: 100%; width: 100%; background: ${colors.bgSecondary}; }
    .pin {
      width: 18px; height: 18px; border-radius: 50%;
      border: 3px solid ${colors.bgPrimary};
      box-shadow: 0 0 0 2px rgba(0,0,0,0.3);
    }
    .pin.alert { animation: pulse 1.6s infinite; }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.6); }
      70% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
      100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
    }
    .pin.selected { transform: scale(1.4); }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var markers = ${data};
    var selectedId = ${JSON.stringify(null)};

    var map = L.map('map', { zoomControl: true, attributionControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var layers = {};

    function makeIcon(m, isSelected) {
      var cls = 'pin' + (m.alert ? ' alert' : '') + (isSelected ? ' selected' : '');
      return L.divIcon({
        className: '',
        html: '<div class="' + cls + '" style="background:' + m.color + '"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
    }

    function post(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    var bounds = [];
    markers.forEach(function (m) {
      var marker = L.marker([m.lat, m.lng], { icon: makeIcon(m, false) }).addTo(map);
      if (m.label) { marker.bindPopup(m.label); }
      marker.on('click', function () { post({ type: 'select', id: m.id }); });
      layers[m.id] = marker;
      bounds.push([m.lat, m.lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([${BRAZIL_CENTER.lat}, ${BRAZIL_CENTER.lng}], ${BRAZIL_CENTER.zoom});
    }

    // Allow React Native to drive selection / centering.
    function handleMessage(raw) {
      try {
        var msg = JSON.parse(raw);
        if (msg.type === 'select') {
          var prev = selectedId;
          selectedId = msg.id;
          markers.forEach(function (m) {
            if (m.id === prev || m.id === selectedId) {
              layers[m.id].setIcon(makeIcon(m, m.id === selectedId));
            }
          });
          var sel = markers.filter(function (m) { return m.id === selectedId; })[0];
          if (sel) { map.setView([sel.lat, sel.lng], Math.max(map.getZoom(), 9), { animate: true }); }
        }
      } catch (e) {}
    }
    document.addEventListener('message', function (e) { handleMessage(e.data); });
    window.addEventListener('message', function (e) { handleMessage(e.data); });
  </script>
</body>
</html>`;
}

/**
 * Real interactive map using Leaflet + OpenStreetMap inside a WebView.
 * No API key, no native module config — works in Expo Go on iOS and Android.
 * Plots each farm at its true geographic position; tap a pin to select.
 */
export function MonitoringMap({
  markers,
  selectedId,
  onSelect,
  height = 320,
}: MonitoringMapProps) {
  const webRef = useRef<WebView>(null);

  // Rebuild the document only when the set of markers changes (not on select).
  const html = useMemo(() => buildHtml(markers), [markers]);

  // Push selection changes into the map without reloading it.
  useEffect(() => {
    if (selectedId) {
      webRef.current?.postMessage(JSON.stringify({ type: 'select', id: selectedId }));
    }
  }, [selectedId]);

  return (
    <View style={[styles.wrapper, { height }]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'select') onSelect?.(msg.id);
          } catch {
            // ignore malformed messages
          }
        }}
      />

      {markers.length === 0 && (
        <View style={styles.empty} pointerEvents="none">
          <Text style={styles.emptyText}>Sem coordenadas para exibir no mapa</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    overflow: 'hidden',
  },
  web: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
