import { User, Category, Product, Recipe, Stock, StockHistory, Purchase, Order, Settings } from '../types';

export const users: User[] = [
  {
    id: 'usr-1',
    name: 'Budi Santoso (Owner)',
    username: 'owner',
    email: 'owner@boothdaily.com',
    password: 'owner',
    role: 'owner',
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    phone: '081234567890'
  },
  {
    id: 'usr-2',
    name: 'Rian Pratama',
    username: 'rian',
    email: 'rian@boothdaily.com',
    password: 'rian',
    role: 'karyawan',
    pin: '5678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    phone: '081298765432'
  },
  {
    id: 'usr-3',
    name: 'Siti Nurhaliza',
    username: 'siti',
    email: 'siti@boothdaily.com',
    password: 'siti',
    role: 'karyawan',
    pin: '1122',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    phone: '081311223344'
  }
];

export const categories: Category[] = [
  { id: 'cat-all', name: 'Semua Menu', slug: 'all', icon_name: 'Coffee' },
  { id: 'cat-1', name: 'Coffee', slug: 'coffee', icon_name: 'CupSoda' },
  { id: 'cat-2', name: 'Non Coffee', slug: 'non-coffee', icon_name: 'GlassWater' },
  { id: 'cat-3', name: 'Snack', slug: 'snack', icon_name: 'Cookie' },
  { id: 'cat-4', name: 'Dessert', slug: 'dessert', icon_name: 'IceCream' }
];

export const stocks: Stock[] = [
  { id: 'stk-1', name: 'Espresso Beans (House Blend)', current_amount: 3500, min_amount: 500, unit: 'gram', cost_per_unit: 180 },
  { id: 'stk-2', name: 'Fresh Milk Pasteurized', current_amount: 18, min_amount: 5, unit: 'liter', cost_per_unit: 18000 },
  { id: 'stk-3', name: 'Sirup Gula Aren Organik', current_amount: 2500, min_amount: 500, unit: 'ml', cost_per_unit: 35 },
  { id: 'stk-4', name: 'Pure Matcha Powder (Japan)', current_amount: 400, min_amount: 200, unit: 'gram', cost_per_unit: 450 },
  { id: 'stk-5', name: 'Dark Chocolate Powder 70%', current_amount: 1200, min_amount: 300, unit: 'gram', cost_per_unit: 250 },
  { id: 'stk-6', name: 'Vanilla Syrup (Monin)', current_amount: 1500, min_amount: 400, unit: 'ml', cost_per_unit: 120 },
  { id: 'stk-7', name: 'Caramel Sauce (Torani)', current_amount: 800, min_amount: 300, unit: 'ml', cost_per_unit: 140 },
  { id: 'stk-8', name: 'Paper Cup 16oz + Lid', current_amount: 120, min_amount: 50, unit: 'pcs', cost_per_unit: 1200 },
  { id: 'stk-9', name: 'Plastic Cup 16oz + Seal', current_amount: 340, min_amount: 100, unit: 'pcs', cost_per_unit: 800 },
  { id: 'stk-10', name: 'Croissant Dough Frozen', current_amount: 15, min_amount: 10, unit: 'pcs', cost_per_unit: 7500 },
  { id: 'stk-11', name: 'French Fries Shoestring', current_amount: 4, min_amount: 2, unit: 'kg', cost_per_unit: 32000 },
  { id: 'stk-12', name: 'Vanilla Gelato Scoop', current_amount: 25, min_amount: 10, unit: 'scoop', cost_per_unit: 5000 }
];

export const recipes: Recipe[] = [
  {
    id: 'rcp-1',
    product_id: 'prd-1',
    prep_time_minutes: 2,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: 'Resep otentik Kopi Susu Gula Aren khas Booth Daily dengan rasa creamy dan manis aren yang pas.',
    ingredients: [
      { id: 'ring-1', stock_id: 'stk-1', stock_name: 'Espresso Beans (House Blend)', amount: 18, unit: 'gram' },
      { id: 'ring-2', stock_id: 'stk-2', stock_name: 'Fresh Milk Pasteurized', amount: 0.12, unit: 'liter' },
      { id: 'ring-3', stock_id: 'stk-3', stock_name: 'Sirup Gula Aren Organik', amount: 25, unit: 'ml' },
      { id: 'ring-4', stock_id: 'stk-9', stock_name: 'Plastic Cup 16oz + Seal', amount: 1, unit: 'pcs' }
    ],
    steps: [
      { step_number: 1, instruction: 'Grind 18g espresso beans medium-fine dan tamping dengan tekanan 15kg.' },
      { step_number: 2, instruction: 'Extract double shot espresso (30ml) selama 25-28 detik pada suhu 92°C.' },
      { step_number: 3, instruction: 'Tuangkan 25ml Sirup Gula Aren ke dalam plastic cup 16oz, lalu tambahkan es batu hingga 3/4 cup.' },
      { step_number: 4, instruction: 'Tuangkan 120ml Fresh Milk dingin pelan-pelan ke dalam cup.' },
      { step_number: 5, instruction: 'Lapiskan double shot espresso hangat di bagian paling atas (layering effect) lalu seal cup.' }
    ],
    barista_tips: 'Gunakan susu dalam keadaan sangat dingin (3-5°C) agar lapisan espresso tidak langsung bercampur dan membentuk gradasi warna yang cantik.'
  },
  {
    id: 'rcp-2',
    product_id: 'prd-2',
    prep_time_minutes: 3,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    description: 'Cafe Latte silky smooth dengan microfoam lembut dan aroma biji kopi pilihan.',
    ingredients: [
      { id: 'ring-5', stock_id: 'stk-1', stock_name: 'Espresso Beans (House Blend)', amount: 18, unit: 'gram' },
      { id: 'ring-6', stock_id: 'stk-2', stock_name: 'Fresh Milk Pasteurized', amount: 0.18, unit: 'liter' },
      { id: 'ring-7', stock_id: 'stk-8', stock_name: 'Paper Cup 16oz + Lid', amount: 1, unit: 'pcs' }
    ],
    steps: [
      { step_number: 1, instruction: 'Extract double shot espresso (30ml) langsung ke paper cup 16oz.' },
      { step_number: 2, instruction: 'Steam 180ml fresh milk hingga suhu 60-65°C sampai menghasilkan microfoam yang berkilau (glossy).' },
      { step_number: 3, instruction: 'Purge steam wand dan lap hingga bersih dengan kain microfiber khusus.' },
      { step_number: 4, instruction: 'Pour milk ke dalam espresso dari ketinggian sedang, lalu rendahkan poci untuk membentuk latte art hiasan.' }
    ],
    barista_tips: 'Jangan steam milk melebihi 70°C karena protein susu akan rusak dan manis alami susu hilang.'
  },
  {
    id: 'rcp-3',
    product_id: 'prd-3',
    prep_time_minutes: 3,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    description: 'Matcha Latte Jepang authentic dari daun teh Uji grade tinggi dengan kelembutan fresh milk.',
    ingredients: [
      { id: 'ring-8', stock_id: 'stk-4', stock_name: 'Pure Matcha Powder (Japan)', amount: 8, unit: 'gram' },
      { id: 'ring-9', stock_id: 'stk-2', stock_name: 'Fresh Milk Pasteurized', amount: 0.15, unit: 'liter' },
      { id: 'ring-10', stock_id: 'stk-9', stock_name: 'Plastic Cup 16oz + Seal', amount: 1, unit: 'pcs' }
    ],
    steps: [
      { step_number: 1, instruction: 'Ayak 8g Matcha powder ke dalam chawan/bowl seduh.' },
      { step_number: 2, instruction: 'Tambahkan 30ml air hangat 70°C, aduk dengan chasen (chasen bamboo whisk) bentuk zig-zag W hingga berbuih halus tanpa gumpalan.' },
      { step_number: 3, instruction: 'Isi plastic cup dengan es batu dan 150ml Fresh Milk.' },
      { step_number: 4, instruction: 'Tuangkan seduhan Matcha secara perlahan di atas susu dingin.' }
    ],
    barista_tips: 'Pastikan matcha larut sempurna sebelum dituang ke susu agar tidak ada gumpalan pahit saat diminum.'
  },
  {
    id: 'rcp-4',
    product_id: 'prd-4',
    prep_time_minutes: 2,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    description: 'Americano segar dan bold dengan ekstrak espresso ganda dan air mineral dingin atau panas.',
    ingredients: [
      { id: 'ring-11', stock_id: 'stk-1', stock_name: 'Espresso Beans (House Blend)', amount: 18, unit: 'gram' },
      { id: 'ring-12', stock_id: 'stk-9', stock_name: 'Plastic Cup 16oz + Seal', amount: 1, unit: 'pcs' }
    ],
    steps: [
      { step_number: 1, instruction: 'Persiapkan plastic cup berisi 150ml air mineral dan es batu secukupnya.' },
      { step_number: 2, instruction: 'Extract double shot espresso (30ml) langsung di atas air mineral dingin.' },
      { step_number: 3, instruction: 'Sajikan dengan lid atau seal cup bersih.' }
    ],
    barista_tips: 'Untuk Iced Americano, selalu tuang air dingin terlebih dahulu sebelum espresso untuk menjaga crema tetap mengapung cantik.'
  }
];

export const products: Product[] = [
  {
    id: 'prd-1',
    category_id: 'cat-1',
    name: 'Kopi Susu Gula Aren',
    price: 22000,
    cost_price: 8500,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    description: 'Signature coffee Booth Daily dengan espresso mantap, fresh milk, dan gula aren organik murni.',
    is_active: true,
    is_favorite: true,
    recipe_id: 'rcp-1'
  },
  {
    id: 'prd-2',
    category_id: 'cat-1',
    name: 'Cafe Latte',
    price: 25000,
    cost_price: 9200,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80',
    description: 'Espresso klasik dikombinasikan dengan steamed fresh milk bertekstur microfoam lembut.',
    is_active: true,
    is_favorite: true,
    recipe_id: 'rcp-2'
  },
  {
    id: 'prd-3',
    category_id: 'cat-2',
    name: 'Kyoto Matcha Latte',
    price: 28000,
    cost_price: 11000,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    description: 'Authentic Uji Matcha dipadukan dengan fresh milk creamy yang menyegarkan.',
    is_active: true,
    is_favorite: true,
    recipe_id: 'rcp-3'
  },
  {
    id: 'prd-4',
    category_id: 'cat-1',
    name: 'Iced Americano',
    price: 18000,
    cost_price: 5000,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    description: 'Double shot espresso segar dituangkan ke dalam air mineral dingin dan es batu.',
    is_active: true,
    is_favorite: false,
    recipe_id: 'rcp-4'
  },
  {
    id: 'prd-5',
    category_id: 'cat-1',
    name: 'Caramel Macchiato',
    price: 28000,
    cost_price: 10500,
    image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&auto=format&fit=crop&q=80',
    description: 'Espresso dengan sirup vanilla, steamed milk, dan saus karamel kaya rasa di atasnya.',
    is_active: true,
    is_favorite: true
  },
  {
    id: 'prd-6',
    category_id: 'cat-2',
    name: 'Belgian Dark Chocolate',
    price: 26000,
    cost_price: 9800,
    image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&auto=format&fit=crop&q=80',
    description: 'Cokelat hitam premium 70% dengan susu murni panas atau dingin yang gurih legit.',
    is_active: true,
    is_favorite: false
  },
  {
    id: 'prd-7',
    category_id: 'cat-3',
    name: 'Butter Croissant',
    price: 22000,
    cost_price: 8000,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    description: 'Pastry berlipat renyah di luar, lembut dan kaya rasa mentega Perancis di dalam.',
    is_active: true,
    is_favorite: true
  },
  {
    id: 'prd-8',
    category_id: 'cat-3',
    name: 'Truffle French Fries',
    price: 25000,
    cost_price: 9500,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    description: 'Kentang goreng renyah disiram minyak truffle aromatik, taburan parmesan dan peterseli.',
    is_active: true,
    is_favorite: false
  },
  {
    id: 'prd-9',
    category_id: 'cat-4',
    name: 'Affogato Vanilla',
    price: 24000,
    cost_price: 7500,
    image_url: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400&auto=format&fit=crop&q=80',
    description: 'Satu scoop gelato vanilla lembut disiram panasnya double shot espresso murni.',
    is_active: true,
    is_favorite: false
  },
  {
    id: 'prd-10',
    category_id: 'cat-4',
    name: 'Tiramisu Slice Classic',
    price: 32000,
    cost_price: 13000,
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=80',
    description: 'Kue tiramisu klasik berbahan ladyfingers yang direndam espresso dan keju mascarpone.',
    is_active: true,
    is_favorite: true
  }
];

export const stock_histories: StockHistory[] = [
  {
    id: 'sth-1',
    stock_id: 'stk-2',
    stock_name: 'Fresh Milk Pasteurized',
    change_amount: 10,
    unit: 'liter',
    type: 'pembelian',
    reference: 'Supplier A (Dairy Fresh)',
    user_name: 'Owner',
    final_amount: 18,
    created_at: '2026-08-06T10:30:00'
  },
  {
    id: 'sth-2',
    stock_id: 'stk-2',
    stock_name: 'Fresh Milk Pasteurized',
    change_amount: -0.18,
    unit: 'liter',
    type: 'penjualan',
    reference: 'Order #BD-20260806-003 (Cafe Latte)',
    user_name: 'Kasir (Rian)',
    final_amount: 17.82,
    created_at: '2026-08-06T10:05:00'
  },
  {
    id: 'sth-3',
    stock_id: 'stk-2',
    stock_name: 'Fresh Milk Pasteurized',
    change_amount: -0.5,
    unit: 'liter',
    type: 'penyesuaian',
    reference: 'Kemasan Bocor',
    user_name: 'Owner',
    final_amount: 18,
    created_at: '2026-08-06T09:45:00'
  },
  {
    id: 'sth-4',
    stock_id: 'stk-1',
    stock_name: 'Espresso Beans (House Blend)',
    change_amount: -18,
    unit: 'gram',
    type: 'penjualan',
    reference: 'Order #BD-20260806-001 (Kopi Susu Gula Aren)',
    user_name: 'Kasir (Rian)',
    final_amount: 3500,
    created_at: '2026-08-06T08:45:00'
  },
  {
    id: 'sth-5',
    stock_id: 'stk-1',
    stock_name: 'Espresso Beans (House Blend)',
    change_amount: 5000,
    unit: 'gram',
    type: 'pembelian',
    reference: 'PT Roastery Nusantara (PUR-20260801-001)',
    user_name: 'Owner',
    final_amount: 5000,
    created_at: '2026-08-01T08:00:00'
  },
  {
    id: 'sth-6',
    stock_id: 'stk-4',
    stock_name: 'Pure Matcha Powder (Japan)',
    change_amount: 200,
    unit: 'gram',
    type: 'edit_manual',
    reference: 'Koreksi Stok Fisik Opname',
    user_name: 'Owner',
    final_amount: 400,
    created_at: '2026-07-30T14:20:00'
  }
];

export const purchases: Purchase[] = [
  {
    id: 'pur-1',
    purchase_number: 'PUR-20260801-001',
    supplier: 'PT Roastery Nusantara',
    date: '2026-08-01',
    total_amount: 900000,
    created_at: '2026-08-01T08:00:00',
    items: [
      {
        id: 'pui-1',
        stock_id: 'stk-1',
        stock_name: 'Espresso Beans (House Blend)',
        qty: 5000,
        unit: 'gram',
        unit_cost: 180,
        total_cost: 900000
      }
    ]
  },
  {
    id: 'pur-2',
    purchase_number: 'PUR-20260803-002',
    supplier: 'Dairy Fresh Supplier',
    date: '2026-08-03',
    total_amount: 360000,
    created_at: '2026-08-03T10:30:00',
    items: [
      {
        id: 'pui-2',
        stock_id: 'stk-2',
        stock_name: 'Fresh Milk Pasteurized',
        qty: 20,
        unit: 'liter',
        unit_cost: 18000,
        total_cost: 360000
      }
    ]
  }
];

export const orders: Order[] = [
  {
    id: 'ord-101',
    order_number: 'BD-20260806-001',
    order_type: 'dine_in',
    created_by_user_id: 'usr-2',
    created_by_name: 'Rian Pratama',
    created_by_role: 'karyawan',
    subtotal: 69000,
    tax: 0,
    discount: 0,
    total_amount: 69000,
    customer_name: 'Meja 02',
    created_at: '2026-08-06T08:45:00',
    payment: {
      id: 'pay-101',
      order_id: 'ord-101',
      method: 'qris',
      amount_paid: 69000,
      change: 0,
      status: 'completed'
    },
    items: [
      { id: 'ori-1', product_id: 'prd-1', product_name: 'Kopi Susu Gula Aren', price: 22000, qty: 2, notes: 'Less Ice, Extra Shot', subtotal: 44000 },
      { id: 'ori-2', product_id: 'prd-7', product_name: 'Butter Croissant', price: 22000, qty: 1, notes: 'Hangatkan', subtotal: 22000 }
    ]
  },
  {
    id: 'ord-102',
    order_number: 'BD-20260806-002',
    order_type: 'take_away',
    created_by_user_id: 'usr-2',
    created_by_name: 'Rian Pratama',
    created_by_role: 'karyawan',
    subtotal: 56000,
    tax: 0,
    discount: 0,
    total_amount: 56000,
    customer_name: 'Pak Andi',
    created_at: '2026-08-06T09:20:00',
    payment: {
      id: 'pay-102',
      order_id: 'ord-102',
      method: 'cash',
      amount_paid: 100000,
      change: 44000,
      status: 'completed'
    },
    items: [
      { id: 'ori-3', product_id: 'prd-3', product_name: 'Kyoto Matcha Latte', price: 28000, qty: 1, notes: 'Less Sugar', subtotal: 28000 },
      { id: 'ori-4', product_id: 'prd-5', product_name: 'Caramel Macchiato', price: 28000, qty: 1, notes: 'Extra Caramel', subtotal: 28000 }
    ]
  },
  {
    id: 'ord-103',
    order_number: 'BD-20260806-003',
    order_type: 'dine_in',
    created_by_user_id: 'usr-1',
    created_by_name: 'Budi Santoso (Owner)',
    created_by_role: 'owner',
    subtotal: 57000,
    tax: 0,
    discount: 0,
    total_amount: 57000,
    customer_name: 'Meja 05',
    created_at: '2026-08-06T10:05:00',
    payment: {
      id: 'pay-103',
      order_id: 'ord-103',
      method: 'debit',
      amount_paid: 57000,
      change: 0,
      status: 'completed'
    },
    items: [
      { id: 'ori-5', product_id: 'prd-2', product_name: 'Cafe Latte', price: 25000, qty: 1, notes: 'Oatmilk', subtotal: 25000 },
      { id: 'ori-6', product_id: 'prd-10', product_name: 'Tiramisu Slice Classic', price: 32000, qty: 1, notes: '', subtotal: 32000 }
    ]
  }
];

export const settings: Settings = {
  store_name: 'BOOTH DAILY',
  tagline: 'Industrial Modern Coffee Booth',
  address: 'Jl. Riau No. 88, Bandung, Jawa Barat',
  phone: '+62 812-3456-7890',
  receipt_header: 'Terima kasih telah berkunjung di Booth Daily! Nikmati harimu dengan segelas kopi terbaik.',
  receipt_footer: 'Follow IG @boothdaily.id • WiFi Pass: boothdaily2026',
  tax_percentage: 0,
  service_charge_percentage: 0,
  currency_symbol: 'Rp'
};
