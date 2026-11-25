import { connectDB } from '../src/db.js';
import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';

await connectDB();

const REPLACEMENTS = [
  {
    from: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    to: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    from: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    to: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    from: 'https://images.unsplash.com/photo-1527690789675-4ea7d8da4eb3?auto=format&fit=crop&w=800&q=80',
    to: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
  },
  {
    from: 'https://images.unsplash.com/photo-1587202372616-b43657664931?auto=format&fit=crop&w=800&q=80',
    to: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    from: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80',
    to: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    from: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
    to: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80',
  },
];

console.log('=== SURGICAL IN-PLACE IMAGE REPAIR ===');

let updatedCount = 0;
for (const rep of REPLACEMENTS) {
  const matching = await Product.find({ images: rep.from, isDeleted: false });
  for (const p of matching) {
    p.images = p.images.map((u) => (u === rep.from ? rep.to : u));
    await p.save();
    console.log(`[REPAIRED] ${p.name} (${p._id})`);
    updatedCount++;
  }
}

console.log(`\nTotal product records successfully repaired in MongoDB: ${updatedCount}`);

await mongoose.disconnect();
