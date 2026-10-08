/* Reset the database with sample data. Run: npm run seed */
import { connectDB, disconnectDB } from './config/db.js';
import Counter from './models/Counter.js';
import Customer from './models/Customer.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import { cancelOrder, confirmOrder, createOrder } from './services/order.service.js';

const products = [
  { name: 'Wireless Mouse', sku: 'ELEC-MOU-001', price: 799, stock: 45, category: 'Electronics' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KEY-002', price: 3499, stock: 20, category: 'Electronics' },
  { name: 'USB-C Hub 7-in-1', sku: 'ELEC-HUB-003', price: 2199, stock: 12, category: 'Electronics' },
  { name: '27" Monitor', sku: 'ELEC-MON-004', price: 15999, stock: 4, category: 'Electronics' },
  { name: 'Office Chair', sku: 'FURN-CHR-001', price: 8999, stock: 8, category: 'Furniture' },
  { name: 'Standing Desk', sku: 'FURN-DSK-002', price: 21999, stock: 3, category: 'Furniture' },
  { name: 'A4 Notebook (Pack of 5)', sku: 'STAT-NBK-001', price: 299, stock: 150, category: 'Stationery' },
  { name: 'Gel Pen Set', sku: 'STAT-PEN-002', price: 149, stock: 200, category: 'Stationery' },
  { name: 'Desk Organizer', sku: 'STAT-ORG-003', price: 499, stock: 0, category: 'Stationery' },
  { name: 'Laptop Backpack', sku: 'ACC-BAG-001', price: 1899, stock: 25, category: 'Accessories' },
  { name: 'Water Bottle 1L', sku: 'ACC-BTL-002', price: 399, stock: 60, category: 'Accessories' },
  { name: 'Webcam 1080p', sku: 'ELEC-CAM-005', price: 2799, stock: 10, category: 'Electronics', status: 'Inactive' },
];

const customers = [
  { name: 'Aarav Shah', phone: '+91 98765 43210', email: 'aarav@example.com', address: '12 MG Road, Ahmedabad, Gujarat' },
  { name: 'Priya Patel', phone: '+91 91234 56789', email: 'priya@example.com', address: '45 Ring Road, Surat, Gujarat' },
  { name: 'Rohan Mehta', phone: '+91 99887 76655', email: '', address: '7 Park Street, Vadodara, Gujarat' },
];

const run = async () => {
  await connectDB();
  await Promise.all([Product.deleteMany({}), Customer.deleteMany({}), Order.deleteMany({}), Counter.deleteMany({})]);
  await Product.syncIndexes();

  const created = await Product.insertMany(products);
  const bySku = Object.fromEntries(created.map((p) => [p.sku, p._id.toString()]));
  const line = (sku, quantity) => ({ product: bySku[sku], quantity });

  // Orders go through the real service so stock and totals stay consistent.
  const o1 = await createOrder({ customer: customers[0], items: [line('ELEC-MOU-001', 2), line('ELEC-KEY-002', 1)] });
  const o2 = await createOrder({ customer: customers[1], items: [line('FURN-CHR-001', 1), line('STAT-NBK-001', 5)] });
  const o3 = await createOrder({ customer: customers[2], items: [line('ELEC-MON-004', 1)] });
  // Repeat customers: reuse the existing customer record by id.
  const o4 = await createOrder({
    customer: { id: o1.customer.toString(), ...customers[0] },
    items: [line('ACC-BAG-001', 1), line('ACC-BTL-002', 2)],
  });
  await createOrder({
    customer: { id: o2.customer.toString(), ...customers[1] },
    items: [line('STAT-PEN-002', 10)],
    notes: 'Deliver after 5 PM',
  });

  await confirmOrder(o1._id);
  await confirmOrder(o2._id);
  await confirmOrder(o3._id);
  await confirmOrder(o4._id);
  await cancelOrder(o4._id);

  console.log(`Seeded ${created.length} products, ${customers.length} customers, 5 orders.`);
};

run()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
