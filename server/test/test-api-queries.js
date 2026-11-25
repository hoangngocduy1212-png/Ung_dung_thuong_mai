async function testApi() {
  const base = 'http://localhost:5001/api';

  // 1. Search keyword
  const searchRes = await (await fetch(base + '/products?q=iPhone')).json();
  console.log('Search "iPhone":', searchRes.total, 'results');

  // 2. Filter by brand (Apple)
  const brandsRes = await (await fetch(base + '/brands')).json();
  const apple = brandsRes.find(b => b.name === 'Apple');
  const appleRes = await (await fetch(base + '/products?brand=' + apple._id)).json();
  console.log('Brand "Apple":', appleRes.total, 'results');

  // 3. Filter by category (Linh kiện PC)
  const catsRes = await (await fetch(base + '/categories')).json();
  const pcCat = catsRes.find(c => c.name === 'Linh kiện PC');
  const pcRes = await (await fetch(base + '/products?category=' + pcCat._id)).json();
  console.log('Category "Linh kiện PC" (including children):', pcRes.total, 'results');

  // 4. Sort price asc
  const sortRes = await (await fetch(base + '/products?sort=price_asc&limit=1')).json();
  console.log('Lowest price item:', sortRes.items[0].name, 'Price:', sortRes.items[0].minPrice);

  // 5. Product details & Reviews
  const iphone16 = searchRes.items.find(p => p.name.includes('16 Pro Max'));
  const detail = await (await fetch(base + '/products/' + iphone16._id)).json();
  console.log('Detail of:', detail.name, '| Variants:', detail.variants.length, '| Rating:', detail.ratingAvg, '| Shop:', detail.shop.name);
  const reviews = await (await fetch(base + '/products/' + iphone16._id + '/reviews')).json();
  console.log('Reviews count:', reviews.total, '| First masked reviewer:', reviews.items[0]?.customer?.fullName, '| Rating:', reviews.items[0]?.rating);
}

testApi().catch(console.error);
