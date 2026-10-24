// Frontend API Configuration & Data Provider
// Industrial Training Project - MobileHub

// Check if running on localhost / 127.0.0.1 or on a static web host (e.g. GitHub Pages)
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';

// When on localhost, connect to local backend (port 5000)
// When on GitHub Pages, connect to the live Render backend service
const RENDER_API_URL = "https://online-mobile-store-x4s1.onrender.com/api";
const API_URL = isLocalhost ? "http://localhost:5000/api" : RENDER_API_URL;

// Built-in phones catalog (Used seamlessly on GitHub Pages or as offline fallback)
const DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Apple iPhone 15',
    brand: 'Apple',
    price: 71999.00,
    description: 'Dynamic Island, 48MP Main camera, and USB-C in a durable color-infused glass design.',
    image: 'https://placehold.co/300x300?text=iPhone+15',
    ram: '6GB',
    storage: '128GB',
    stock: 15
  },
  {
    id: 2,
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    price: 148900.00,
    description: 'Forged in titanium with A17 Pro chip, customizable Action button, and 5x Telephoto camera.',
    image: 'https://placehold.co/300x300?text=iPhone+15+Pro+Max',
    ram: '8GB',
    storage: '256GB',
    stock: 8
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 129999.00,
    description: 'Galaxy AI is here. Titanium exterior, 200MP camera with ProVisual Engine, and built-in S Pen.',
    image: 'https://placehold.co/300x300?text=Galaxy+S24+Ultra',
    ram: '12GB',
    storage: '256GB',
    stock: 12
  },
  {
    id: 4,
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung',
    price: 39999.00,
    description: 'Metal frame design, 50MP low-light camera, Super AMOLED display, and 5000mAh battery.',
    image: 'https://placehold.co/300x300?text=Galaxy+A55',
    ram: '8GB',
    storage: '128GB',
    stock: 25
  },
  {
    id: 5,
    name: 'OnePlus 12',
    brand: 'OnePlus',
    price: 64999.00,
    description: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera system, and 100W SUPERVOOC charging.',
    image: 'https://placehold.co/300x300?text=OnePlus+12',
    ram: '16GB',
    storage: '512GB',
    stock: 18
  },
  {
    id: 6,
    name: 'OnePlus Nord CE4',
    brand: 'OnePlus',
    price: 24999.00,
    description: 'Fast and smooth with Snapdragon 7 Gen 3, 100W fast charging, and Sony LYT-600 OIS camera.',
    image: 'https://placehold.co/300x300?text=OnePlus+Nord+CE4',
    ram: '8GB',
    storage: '128GB',
    stock: 30
  },
  {
    id: 7,
    name: 'Xiaomi 14',
    brand: 'Xiaomi',
    price: 69999.00,
    description: 'Leica Summilux optical lens, Snapdragon 8 Gen 3, and ultra-compact 6.36-inch display.',
    image: 'https://placehold.co/300x300?text=Xiaomi+14',
    ram: '12GB',
    storage: '512GB',
    stock: 10
  },
  {
    id: 8,
    name: 'Redmi Note 13 Pro+ 5G',
    brand: 'Xiaomi',
    price: 31999.00,
    description: '200MP OIS camera, 1.5K 120Hz curved AMOLED display, IP68 water resistance, and 120W charge.',
    image: 'https://placehold.co/300x300?text=Redmi+Note+13+Pro+',
    ram: '8GB',
    storage: '256GB',
    stock: 22
  },
  {
    id: 9,
    name: 'Realme GT 6',
    brand: 'Realme',
    price: 40999.00,
    description: 'Snapdragon 8s Gen 3, 6000nit ultra-bright display, and NextAI smart features.',
    image: 'https://placehold.co/300x300?text=Realme+GT+6',
    ram: '12GB',
    storage: '256GB',
    stock: 14
  },
  {
    id: 10,
    name: 'Realme 12 Pro+ 5G',
    brand: 'Realme',
    price: 29999.00,
    description: 'Periscope portrait camera, luxury watch design by Ollivier Saveo, and 120Hz curved display.',
    image: 'https://placehold.co/300x300?text=Realme+12+Pro+',
    ram: '8GB',
    storage: '128GB',
    stock: 20
  },
  {
    id: 11,
    name: 'Vivo X100 Pro',
    brand: 'Vivo',
    price: 89999.00,
    description: 'ZEISS APO Telephoto camera, MediaTek Dimensity 9300, and customized imaging chip V3.',
    image: 'https://placehold.co/300x300?text=Vivo+X100+Pro',
    ram: '16GB',
    storage: '512GB',
    stock: 7
  },
  {
    id: 12,
    name: 'Vivo V30 5G',
    brand: 'Vivo',
    price: 33999.00,
    description: 'Studio-quality Aura light portrait, ultra-slim 3D curved design, and 50MP eye AF camera.',
    image: 'https://placehold.co/300x300?text=Vivo+V30+5G',
    ram: '8GB',
    storage: '128GB',
    stock: 16
  }
];

// Unified helper to get products (from MySQL API on localhost, or demo catalog on GitHub Pages)
async function getProducts(search = '', brand = '') {
  if (API_URL) {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (brand.trim()) params.append('brand', brand.trim());
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${API_URL}/products${queryStr}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unreachable, falling back to demo catalog', e);
    }
  }

  // Filter in-memory for GitHub Pages demo
  return DEMO_PRODUCTS.filter(p => {
    const matchesSearch = !search.trim() || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !brand.trim() || p.brand.toLowerCase() === brand.toLowerCase();
    return matchesSearch && matchesBrand;
  });
}

// Unified helper to get single product by ID
async function getProductById(id) {
  const numId = parseInt(id, 10);
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/products/${numId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unreachable, falling back to demo catalog', e);
    }
  }

  const found = DEMO_PRODUCTS.find(p => p.id === numId);
  if (!found) throw new Error('Phone not found');
  return found;
}
