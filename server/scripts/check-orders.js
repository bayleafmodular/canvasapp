const { listOrders } = require('../services/orders');

async function check() {
  try {
    const orders = await listOrders();
    console.log('Orders inside memory:', JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Error listing orders:', err);
  }
}

check();
