const supabase = require('../lib/supabase');

const ORDERS_TABLE = 'orders';

// Initial 12 mock orders for in-memory fallback testing
const INITIAL_MOCK_ORDERS = [
  {
    id: "ORD-2026-001",
    customerName: "Robert Miller",
    email: "robert.miller@example.com",
    phone: "+1 (555) 382-9012",
    address: "124 Oak Ave, Austin, TX 78701",
    productName: "2BHK House Plan Layout",
    quantity: 1,
    totalPrice: 150.00,
    orderDate: "2026-06-15",
    status: "Completed",
    blueprintType: "house_2bhk"
  },
  {
    id: "ORD-2026-002",
    customerName: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    productName: "Modern Studio Apartment",
    quantity: 1,
    totalPrice: 99.00,
    orderDate: "2026-06-16",
    status: "Processing",
    blueprintType: "studio"
  },
  {
    id: "ORD-2026-003",
    customerName: "Alex Johnson",
    email: "alex.j@example.com",
    phone: "+1 (555) 728-1934",
    address: "893 Maple St, Seattle, WA 98101",
    productName: "Commercial Office Floorplan",
    quantity: 2,
    totalPrice: 450.00,
    orderDate: "2026-06-17",
    status: "Pending",
    blueprintType: "office"
  },
  {
    id: "ORD-2026-004",
    customerName: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 (555) 392-1209",
    address: "550 Broadway, New York, NY 10012",
    productName: "Industrial Warehouse Blueprint",
    quantity: 1,
    totalPrice: 350.00,
    orderDate: "2026-06-18",
    status: "Completed",
    blueprintType: "warehouse"
  },
  {
    id: "ORD-2026-005",
    customerName: "Pamela Davis",
    email: "pamela.davis@example.com",
    phone: "+1 (555) 482-1928",
    address: "56 Pine Rd, Atlanta, GA 30309",
    productName: "Duplex Villa Foundation Plan",
    quantity: 1,
    totalPrice: 249.00,
    orderDate: "2026-06-19",
    status: "Pending",
    blueprintType: "duplex"
  },
  {
    id: "ORD-2026-006",
    customerName: "David Miller",
    email: "david.miller@example.com",
    phone: "+44 20 7946 0192",
    address: "Flat 12, Baker Street, London, NW1 6XE",
    productName: "Retail Store Floor Layout",
    quantity: 1,
    totalPrice: 180.00,
    orderDate: "2026-06-20",
    status: "Processing",
    blueprintType: "retail"
  },
  {
    id: "ORD-2026-007",
    customerName: "Steven Baker",
    email: "steven.baker@example.com",
    phone: "+1 (555) 891-0293",
    address: "12 Walnut Dr, Denver, CO 80202",
    productName: "3BHK Luxury Floorplan",
    quantity: 1,
    totalPrice: 280.00,
    orderDate: "2026-06-20",
    status: "Pending",
    blueprintType: "house_3bhk"
  },
  {
    id: "ORD-2026-008",
    customerName: "Emily Watson",
    email: "emily.w@example.com",
    phone: "+1 (555) 902-1245",
    address: "902 Pine Street, Seattle, WA 98101",
    productName: "Kitchen Renovation Plan",
    quantity: 1,
    totalPrice: 79.00,
    orderDate: "2026-06-21",
    status: "Completed",
    blueprintType: "kitchen"
  },
  {
    id: "ORD-2026-009",
    customerName: "Alan Green",
    email: "alan.green@example.com",
    phone: "+1 (555) 234-5678",
    address: "405 Birch Ave, Boston, MA 02108",
    productName: "Terrace Garden Layout",
    quantity: 1,
    totalPrice: 59.00,
    orderDate: "2026-06-21",
    status: "Processing",
    blueprintType: "garden"
  },
  {
    id: "ORD-2026-010",
    customerName: "Sophia Rodriguez",
    email: "sophia.r@example.com",
    phone: "+34 612 345 678",
    address: "Calle Mayor 14, Madrid, 28013",
    productName: "Boutique Hotel Suite Design",
    quantity: 3,
    totalPrice: 520.00,
    orderDate: "2026-06-22",
    status: "Pending",
    blueprintType: "hotel"
  },
  {
    id: "ORD-2026-011",
    customerName: "Vincent Stark",
    email: "vincent.stark@example.com",
    phone: "+1 (555) 678-9012",
    address: "10880 Malibu Point, Malibu, CA 90265",
    productName: "Penthouse Deck Design",
    quantity: 1,
    totalPrice: 199.00,
    orderDate: "2026-06-22",
    status: "Processing",
    blueprintType: "penthouse"
  },
  {
    id: "ORD-2026-012",
    customerName: "Olivia Taylor",
    email: "olivia.t@example.com",
    phone: "+61 2 9382 1234",
    address: "24 Alfred St, Milsons Point, Sydney, NSW 2061",
    productName: "Co-working Space Concept",
    quantity: 1,
    totalPrice: 399.00,
    orderDate: "2026-06-22",
    status: "Completed",
    blueprintType: "coworking"
  }
];

let localOrders = [...INITIAL_MOCK_ORDERS];

const toPublicOrder = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    productName: row.product_name,
    quantity: row.quantity,
    totalPrice: Number(row.total_price),
    orderDate: row.order_date,
    status: row.status,
    blueprintType: row.blueprint_type,
    drawingData: row.drawing_data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    remarks: row.remarks || '',
  };
};

const isMissingOrdersTableError = (error) =>
  (error?.code === '42P01' ||
   error?.code === 'PGRST116' ||
   error?.code === 'PGRST205' ||
   /relation ".*orders" does not exist/i.test(error?.message || '') ||
   /could not find the relation/i.test(error?.message || '')) &&
  error?.code !== 'PGRST204';

const listOrders = async () => {
  try {
    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data.map((row) => toPublicOrder(row));
  } catch (err) {
    if (isMissingOrdersTableError(err)) {
      console.warn('Orders table is missing in Supabase. Falling back to local in-memory mock data.');
      return localOrders;
    }
    throw err;
  }
};

const listUserOrders = async (userId, email) => {
  try {
    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data.map((row) => toPublicOrder(row));
  } catch (err) {
    if (isMissingOrdersTableError(err)) {
      console.warn('Orders table is missing in Supabase. Filtering local mock data.');
      return localOrders.filter(
        (o) =>
          o.userId === userId ||
          (o.email && email && o.email.toLowerCase() === email.toLowerCase())
      );
    }
    throw err;
  }
};

const createOrder = async (userId, details) => {
  try {
    const { customerName, email, phone, address, productName, quantity, totalPrice, blueprintType } = details;

    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .insert({
        user_id: userId,
        customer_name: customerName,
        email,
        phone,
        address,
        product_name: productName,
        quantity: quantity || 1,
        total_price: totalPrice,
        blueprint_type: blueprintType,
        drawing_data: details.drawingData || null,
        status: 'Pending',
      })
      .select('*')
      .single();

    if (error) throw error;
    return toPublicOrder(data);
  } catch (err) {
    if (isMissingOrdersTableError(err)) {
      console.warn('Orders table is missing in Supabase. Placing order in local in-memory storage.');
      const year = new Date().getFullYear();
      const count = localOrders.length + 1;
      const localId = `ORD-${year}-${String(count).padStart(3, '0')}`;
      const newOrder = {
        id: localId,
        userId: userId,
        customerName: details.customerName,
        email: details.email,
        phone: details.phone,
        address: details.address,
        productName: details.productName,
        quantity: details.quantity || 1,
        totalPrice: Number(details.totalPrice),
        orderDate: new Date().toISOString(),
        status: 'Pending',
        blueprintType: details.blueprintType,
        drawingData: details.drawingData || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        remarks: '',
      };
      localOrders.unshift(newOrder); // Add to beginning of array
      return newOrder;
    }
    throw err;
  }
};

const updateOrderStatus = async (id, status, remarks) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      // Catch undefined/missing column error (PostgreSQL undefined_column is '42703' or PostgREST is 'PGRST204')
      if ((error.code === '42703' || error.code === 'PGRST204') && remarks !== undefined) {
        console.warn('Supabase orders table does not contain remarks column. Falling back to status-only update.');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from(ORDERS_TABLE)
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*')
          .single();

        if (fallbackError) throw fallbackError;
        const publicOrder = toPublicOrder(fallbackData);
        if (publicOrder) publicOrder.remarks = remarks; // Attach remarks locally for response
        return publicOrder;
      }
      throw error;
    }
    return toPublicOrder(data);
  } catch (err) {
    if (isMissingOrdersTableError(err)) {
      console.warn('Orders table is missing in Supabase. Updating order in local in-memory storage.');
      const orderIndex = localOrders.findIndex((o) => o.id === id);
      if (orderIndex === -1) return null;
      localOrders[orderIndex] = {
        ...localOrders[orderIndex],
        status,
        updatedAt: new Date().toISOString(),
      };
      if (remarks !== undefined) {
        localOrders[orderIndex].remarks = remarks;
      }
      return localOrders[orderIndex];
    }
    throw err;
  }
};

module.exports = {
  listOrders,
  listUserOrders,
  createOrder,
  updateOrderStatus,
};