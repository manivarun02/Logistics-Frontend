// // src/services/distance.js
// // FREE PINCODE + HAVERSINE (STRICT & SAFE)
// // ❌ NO DEFAULTS
// // ❌ NO FAKE DISTANCE
// // ✅ Distance only if BOTH pincodes are valid

// // Known pincodes with lat/lng (can expand later)
// const PINCODES = {
//   // Telangana
//   '500001': { lat: 17.3850, lng: 78.4867 },  // Hyderabad GPO
//   '500003': { lat: 17.4348, lng: 78.4967 },  // Secunderabad
//   '500039': { lat: 17.3956, lng: 78.5525 },  // Uppal
//   '500060': { lat: 17.3616, lng: 78.5467 },  // Dilsukhnagar
//   '500081': { lat: 17.4468, lng: 78.3923 },  // Madhapur
//   '500085': { lat: 17.4216, lng: 78.3674 },  // Kukatpally
//   '500007': { lat: 17.3723, lng: 78.5391 },  // Mehdipatnam

//   // Bihar
//   '800001': { lat: 25.5941, lng: 85.1376 },  // Patna GPO
//   '800020': { lat: 25.6167, lng: 85.1000 },  // Patna City

//   // Other major cities
//   '110001': { lat: 28.6333, lng: 77.2167 },  // Delhi
//   '400001': { lat: 18.9667, lng: 72.8333 },  // Mumbai
//   '560001': { lat: 12.9833, lng: 77.5833 }   // Bangalore
// };

// // Haversine distance (real earth distance)
// function haversineDistance(lat1, lng1, lat2, lng2) {
//   const R = 6371; // km
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLng = (lng2 - lng1) * Math.PI / 180;

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1 * Math.PI / 180) *
//       Math.cos(lat2 * Math.PI / 180) *
//       Math.sin(dLng / 2) ** 2;

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   // Road factor (not straight line)
//   return Math.round(R * c * 1.3);
// }

// export async function calculateDistance(pickup, drop) {
//   // small UX delay
//   await new Promise(r => setTimeout(r, 400));

//   const extractPin = (text) => text?.match(/\b\d{6}\b/)?.[0];

//   const pin1 = extractPin(pickup);
//   const pin2 = extractPin(drop);

//   console.log("📍 Distance request:", { pickup, drop, pin1, pin2 });

//   // 🚫 STRICT VALIDATION
//   if (!pin1 || !pin2) {
//     throw new Error("Pickup and drop pincodes are required");
//   }

//   if (!PINCODES[pin1] || !PINCODES[pin2]) {
//     throw new Error("Distance not available for given pincodes");
//   }

//   // ✅ REAL DISTANCE
//   const km = haversineDistance(
//     PINCODES[pin1].lat,
//     PINCODES[pin1].lng,
//     PINCODES[pin2].lat,
//     PINCODES[pin2].lng
//   );

//   console.log(`✅ Distance (${pin1} → ${pin2}) = ${km} km`);
//   return km;
// }
