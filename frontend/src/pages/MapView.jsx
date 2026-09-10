import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ShieldAlert, Building2, Factory, Truck } from 'lucide-react';
import { api } from '../services/api';

// Custom Map Marker Icons
const createIcon = (color) =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

const mfgIcon = createIcon('#2563eb');   // Blue
const distIcon = createIcon('#0284c7');  // Cyan
const retIcon = createIcon('#16a34a');   // Emerald
const fraudIcon = createIcon('#dc2626'); // Red

export default function MapView() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchNumber, setSelectedBatchNumber] = useState('P7788');

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

  const nodes = [
    { name: 'MedLife Pharma Ltd (Manufacturer)', city: 'Bengaluru', lat: 12.9716, lng: 77.5946, type: 'MANUFACTURER', icon: mfgIcon },
    { name: 'Southern Med Distributors', city: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'DISTRIBUTOR', icon: distIcon },
    { name: 'Apollo Pharmacy Chennai', city: 'Chennai', lat: 13.0604, lng: 80.2496, type: 'RETAILER', icon: retIcon },
    { name: 'GreenWaste Eco-Facility', city: 'Bengaluru', lat: 12.9141, lng: 77.6412, type: 'WASTE_FACILITY', icon: mfgIcon },
    { name: 'City Healthcare Pharmacy 🚨 (Fraud Scan)', city: 'Madurai', lat: 9.9252, lng: 78.1198, type: 'FRAUD_LOCATION', icon: fraudIcon },
  ];

  // Route paths for Batch P7788 Fraud Case
  const normalRoute = [
    [12.9716, 77.5946], // Bengaluru
    [13.0827, 80.2707], // Chennai
    [13.0604, 80.2496], // Apollo Chennai
    [12.9141, 77.6412], // GreenWaste Bengaluru
  ];

  const suspiciousRoute = [
    [12.9141, 77.6412], // GreenWaste Bengaluru (Incinerated)
    [9.9252, 78.1198],  // Madurai (ILLEGAL RE-ENTRY JUMP!)
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          <span>Interactive Reverse Supply Chain Map</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Geographic visualization of pharmaceutical batch handoffs, waste disposal routes, and anomalous movement jumps.
        </p>
      </div>

      {/* Map Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 z-10 bg-slate-50">
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5" /> Manufacturer / Disposal
            </span>
            <span className="flex items-center text-sky-800">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 mr-1.5" /> Distributor Hub
            </span>
            <span className="flex items-center text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5" /> Retail Pharmacy
            </span>
            <span className="flex items-center text-red-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-1.5" /> 🚨 Illegal Re-Entry Jump
            </span>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Selected Batch Track: <span className="text-blue-700 font-mono font-bold">P7788 (Fraud Scenario)</span>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="h-[520px] w-full z-0">
          <MapContainer
            center={[11.5, 78.5]}
            zoom={7}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', background: '#f8fafc' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Render Facility Markers */}
            {nodes.map((node, index) => (
              <Marker key={index} position={[node.lat, node.lng]} icon={node.icon}>
                <Popup>
                  <div className="text-xs p-1 font-sans">
                    <div className="font-bold text-slate-900">{node.name}</div>
                    <div className="text-slate-600">City: {node.city}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Normal Supply Chain Route */}
            <Polyline
              positions={normalRoute}
              pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.8, dashArray: '6, 6' }}
            />

            {/* Suspicious Illegal Movement Route */}
            <Polyline
              positions={suspiciousRoute}
              pathOptions={{ color: '#dc2626', weight: 4, opacity: 0.9 }}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
