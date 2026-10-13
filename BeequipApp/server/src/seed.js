require('dotenv').config();

const mongoose = require('mongoose');

const { connectToDatabase } = require('./db');
const Item = require('./models/Item');

// Mirrors src/inventory.ts in the mobile app.
const items = [
  {
    externalId: '01',
    category: 'New Equipment',
    title: '120 VV Engine Driven Cooler',
    priceRange: '~$170,000',
    description: 'with 304 stainless tubes, metalized headers, galvanized frames',
  },
  {
    externalId: '02',
    category: 'New Equipment',
    title: '120 VV Electric Cooler',
    priceRange: '~$114,995',
    description: 'with 304 stainless tubes, metalized headers and galvanized frames',
  },
  {
    externalId: '03',
    category: 'Used Equipment',
    title: '108 VV Electric Cooler',
    priceRange: '~$80,000',
    description: 'with 304 Stainless Steel Tubes, metalized headers and galvanized frames',
  },
  {
    externalId: '04',
    category: 'Used Equipment',
    title: '108 VV Engine Driven Cooler',
    priceRange: '~$144,500',
    description: 'with 304 Stainless Steel Tubes, metalized headers and galvanized frames',
  },
  {
    externalId: '05',
    category: 'Process Equipment',
    title: 'Earth',
    priceRange: '$00.00',
    description: 'pen',
  },
  {
    externalId: '06',
    category: 'Rental Equipment',
    title: 'Double 90 ZF Electric Cooler',
    priceRange: '~$10,000.00/mo',
    description:
      'trailer mounted 316 ss tubes, galvanized frames, metalized headers. includes vfd panel',
  },
];

async function seed() {
  await connectToDatabase();
  await Item.deleteMany({});
  const inserted = await Item.insertMany(items);
  console.log(`[seed] Inserted ${inserted.length} items.`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('[seed] Failed:', error.message);
  process.exit(1);
});
