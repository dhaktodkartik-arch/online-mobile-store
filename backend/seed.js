// Seed database with sample mobile phones using mysql2
// Industrial Training Project

const { pool } = require('./db');

const initialProducts = [
  // Apple
  {
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
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    price: 148900.00,
    description: 'Forged in titanium with A17 Pro chip, customizable Action button, and 5x Telephoto camera.',
    image: 'https://placehold.co/300x300?text=iPhone+15+Pro+Max',
    ram: '8GB',
    storage: '256GB',
    stock: 8
  },
  // Samsung
  {
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
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung',
    price: 39999.00,
    description: 'Metal frame design, 50MP low-light camera, Super AMOLED display, and 5000mAh battery.',
    image: 'https://placehold.co/300x300?text=Galaxy+A55',
    ram: '8GB',
    storage: '128GB',
    stock: 25
  },
  // OnePlus
  {
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
    name: 'OnePlus Nord CE4',
    brand: 'OnePlus',
    price: 24999.00,
    description: 'Fast and smooth with Snapdragon 7 Gen 3, 100W fast charging, and Sony LYT-600 OIS camera.',
    image: 'https://placehold.co/300x300?text=OnePlus+Nord+CE4',
    ram: '8GB',
    storage: '128GB',
    stock: 30
  },
  // Xiaomi
  {
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
    name: 'Redmi Note 13 Pro+ 5G',
    brand: 'Xiaomi',
    price: 31999.00,
    description: '200MP OIS camera, 1.5K 120Hz curved AMOLED display, IP68 water resistance, and 120W charge.',
    image: 'https://placehold.co/300x300?text=Redmi+Note+13+Pro+',
    ram: '8GB',
    storage: '256GB',
    stock: 22
  },
  // Realme
  {
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
    name: 'Realme 12 Pro+ 5G',
    brand: 'Realme',
    price: 29999.00,
    description: 'Periscope portrait camera, luxury watch design by Ollivier Saveo, and 120Hz curved display.',
    image: 'https://placehold.co/300x300?text=Realme+12+Pro+',
    ram: '8GB',
    storage: '128GB',
    stock: 20
  },
  // Vivo
  {
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

// Async seed function to insert products if products table is empty
async function seedProducts() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  const count = rows[0].count;

  if (count === 0) {
    console.log('Products table is empty. Seeding 12 mobile phones into MySQL...');

    const insertSql = `
      INSERT INTO products (name, brand, price, description, image, ram, storage, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const phone of initialProducts) {
      await pool.execute(insertSql, [
        phone.name,
        phone.brand,
        phone.price,
        phone.description,
        phone.image,
        phone.ram,
        phone.storage,
        phone.stock
      ]);
    }

    console.log('Product seeding completed successfully!');
  }

  // Seed default admin account if it does not exist
  const [adminRows] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@mobilehub.com']);
  if (adminRows.length === 0) {
    const bcrypt = require('bcryptjs');
    const adminHash = await bcrypt.hash('admin123', 10);
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Store Admin', 'admin@mobilehub.com', adminHash, 'admin']
    );
    console.log('Seeded default admin user: admin@mobilehub.com (password: admin123)');
  }

  const [finalRows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  return finalRows[0].count;
}

module.exports = seedProducts;
