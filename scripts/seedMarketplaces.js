/**
 * Seed script: Upload all marketplace data to Firestore collection "marketplaces"
 * Covers all 25 districts of Sri Lanka (32 marketplaces total)
 *
 * Usage:  node scripts/seedMarketplaces.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAm9EEoenCoYuw6VeYwhD80vaLbihFCBYE',
  authDomain: 'agriculturedss-3e59d.firebaseapp.com',
  projectId: 'agriculturedss-3e59d',
  storageBucket: 'agriculturedss-3e59d.firebasestorage.app',
  messagingSenderId: '1007665282469',
  appId: '1:1007665282469:web:17e1fbd689fc78ca3dbc4c',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const marketplaces = [
  // Ampara
  { name: 'Ampara Municipal Market (Wholesale)', province: 'Eastern', district: 'Ampara', lat: 7.2917, lon: 81.6811 },
  // Anuradhapura
  { name: 'Thambutthegama Dedicated Economic Center', province: 'North Central', district: 'Anuradhapura', lat: 8.1631, lon: 80.2974 },
  // Badulla
  { name: 'Keppetipola Dedicated Economic Center', province: 'Uva', district: 'Badulla', lat: 6.8916, lon: 80.8654 },
  { name: 'Boralanda Dedicated Economic Center', province: 'Uva', district: 'Badulla', lat: 6.8403, lon: 80.8447 },
  { name: 'Bandarawela Municipal Market', province: 'Uva', district: 'Badulla', lat: 6.8258, lon: 80.9983 },
  // Batticaloa
  { name: 'Batticaloa Dedicated Economic Center', province: 'Eastern', district: 'Batticaloa', lat: 7.7167, lon: 81.7000 },
  // Colombo
  { name: 'Manning Market (Peliyagoda)', province: 'Western', district: 'Colombo', lat: 6.9734, lon: 79.8972 },
  { name: 'Narahenpita Dedicated Economic Center', province: 'Western', district: 'Colombo', lat: 6.9079, lon: 79.8789 },
  { name: 'Meegoda Dedicated Economic Center', province: 'Western', district: 'Colombo', lat: 6.8486, lon: 80.0135 },
  { name: 'Ratmalana Dedicated Economic Center', province: 'Western', district: 'Colombo', lat: 6.8286, lon: 79.8893 },
  // Galle
  { name: 'Galle Municipal Market (Wholesale)', province: 'Southern', district: 'Galle', lat: 6.0394, lon: 80.2194 },
  // Gampaha
  { name: 'Welisara Dedicated Economic Center', province: 'Western', district: 'Gampaha', lat: 7.0253, lon: 79.8978 },
  { name: 'Weyangoda Dedicated Economic Center', province: 'Western', district: 'Gampaha', lat: 7.1583, lon: 80.0612 },
  // Hambantota
  { name: 'Hambantota Dedicated Economic Center', province: 'Southern', district: 'Hambantota', lat: 6.1242, lon: 81.1186 },
  // Jaffna
  { name: 'Jaffna Dedicated Economic Center', province: 'Northern', district: 'Jaffna', lat: 9.6615, lon: 80.0255 },
  // Kalutara
  { name: 'Mathugama Dedicated Economic Center', province: 'Western', district: 'Kalutara', lat: 6.5167, lon: 80.1167 },
  // Kandy
  { name: 'Kandy Dedicated Economic Center (Karandagolla)', province: 'Central', district: 'Kandy', lat: 7.2906, lon: 80.6337 },
  // Kegalle
  { name: 'Kegalle Dedicated Economic Center', province: 'Sabaragamuwa', district: 'Kegalle', lat: 7.2500, lon: 80.3500 },
  // Kilinochchi
  { name: 'Kilinochchi Dedicated Economic Center', province: 'Northern', district: 'Kilinochchi', lat: 9.3833, lon: 80.4000 },
  // Kurunegala
  { name: 'Kuliyapitiya Dedicated Economic Center', province: 'North Western', district: 'Kurunegala', lat: 7.4667, lon: 80.0500 },
  // Mannar
  { name: 'Mannar Market (Wholesale)', province: 'Northern', district: 'Mannar', lat: 8.9800, lon: 79.9100 },
  // Matale
  { name: 'Dambulla Dedicated Economic Center', province: 'Central', district: 'Matale', lat: 7.8631, lon: 80.6483 },
  // Matara
  { name: 'Matara Municipal Market (Wholesale)', province: 'Southern', district: 'Matara', lat: 5.9417, lon: 80.5444 },
  // Monaragala
  { name: 'Buttala Dedicated Economic Center', province: 'Uva', district: 'Monaragala', lat: 6.7589, lon: 81.2464 },
  // Mullaitivu
  { name: 'Mullaitivu Market (Wholesale)', province: 'Northern', district: 'Mullaitivu', lat: 9.2667, lon: 80.8167 },
  // Nuwara Eliya
  { name: 'Nuwara Eliya Dedicated Economic Center', province: 'Central', district: 'Nuwara Eliya', lat: 6.9691, lon: 80.7891 },
  { name: 'Kandepola Dedicated Economic Center', province: 'Central', district: 'Nuwara Eliya', lat: 6.9936, lon: 80.8281 },
  // Polonnaruwa
  { name: 'Kaduruwela Economic Center', province: 'North Central', district: 'Polonnaruwa', lat: 7.9333, lon: 81.0000 },
  // Puttalam
  { name: 'Kalpitiya Marketplace (Wholesale)', province: 'North Western', district: 'Puttalam', lat: 8.2300, lon: 79.7600 },
  // Ratnapura
  { name: 'Embilipitiya Dedicated Economic Center', province: 'Sabaragamuwa', district: 'Ratnapura', lat: 6.3339, lon: 80.8623 },
  // Trincomalee
  { name: 'Trincomalee Dedicated Economic Center', province: 'Eastern', district: 'Trincomalee', lat: 8.5667, lon: 81.2333 },
  // Vavuniya
  { name: 'Vavuniya Dedicated Economic Center', province: 'Northern', district: 'Vavuniya', lat: 8.7516, lon: 80.4933 },
];

async function seed() {
  console.log(`Seeding ${marketplaces.length} marketplaces to Firestore...`);
  const colRef = collection(db, 'marketplaces');

  for (const mp of marketplaces) {
    const id = mp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    await setDoc(doc(colRef, id), {
      name: mp.name,
      province: mp.province,
      district: mp.district,
      latitude: mp.lat,
      longitude: mp.lon,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });
    console.log(`  ✓ ${mp.name} (${mp.district})`);
  }

  console.log('\nDone! All marketplaces seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
