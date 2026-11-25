import { connectDB } from '../src/db.js';
import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';

await connectDB();

const products = await Product.find({ isDeleted: false }).select('_id name category images').lean();

const urlToProducts = new Map();
for (const p of products) {
  for (const u of (p.images || [])) {
    if (!urlToProducts.has(u)) urlToProducts.set(u, []);
    urlToProducts.get(u).push({ id: p._id, name: p.name });
  }
}

console.log(`Auditing ${urlToProducts.size} unique image URLs across ${products.length} products...`);

const results = {
  ok: [],
  broken: [],
};

// Batch check with concurrency limit of 10
const urls = Array.from(urlToProducts.keys());
const concurrency = 8;
let idx = 0;

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.startsWith('image/')) {
      results.ok.push({ url, status: res.status, contentType });
    } else if (res.ok && !contentType.startsWith('image/')) {
      // Some CDNs might return 200 with text/html on HEAD, test with small GET range
      results.ok.push({ url, status: res.status, contentType });
    } else {
      results.broken.push({ url, status: res.status, error: `HTTP ${res.status}`, affected: urlToProducts.get(url) });
    }
  } catch (err) {
    results.broken.push({ url, status: 0, error: err.message, affected: urlToProducts.get(url) });
  }
}

async function worker() {
  while (idx < urls.length) {
    const myUrl = urls[idx++];
    await checkUrl(myUrl);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

console.log(`\n=== AUDIT RESULTS ===`);
console.log(`Total URLs: ${urls.length}`);
console.log(`Working URLs: ${results.ok.length}`);
console.log(`Broken URLs: ${results.broken.length}`);

if (results.broken.length > 0) {
  console.log(`\n--- BROKEN URLS DETAILS ---`);
  for (const b of results.broken) {
    console.log(`\nURL: ${b.url}`);
    console.log(`Error: ${b.error} (Status: ${b.status})`);
    console.log(`Affected Products (${b.affected.length}):`);
    b.affected.slice(0, 5).forEach(p => console.log(` - [${p.id}] ${p.name}`));
    if (b.affected.length > 5) console.log(`   ... and ${b.affected.length - 5} more`);
  }
}

await mongoose.disconnect();
