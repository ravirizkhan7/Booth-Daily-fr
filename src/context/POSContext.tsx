import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category, Recipe, Order, Stock, Purchase, User, OrderType, PaymentMethod, Settings, OrderItem, StockHistory } from '../types';
import { productService } from '../services/productService';
import { recipeService } from '../services/recipeService';
import { userService } from '../services/userService';
import { orderService } from '../services/orderService';
import { stockService } from '../services/stockService';
import { transactionService } from '../services/transactionService';
import api from '../utils/axios';
import { getProductStockInfo } from '../utils/stockUtils';

// Default settings fallback (used only until backend responds)
const defaultSettings: Settings = {
  store_name: 'BOOTH DAILY',
  tagline: 'Industrial Modern Coffee Booth',
  address: '',
  phone: '',
  receipt_header: 'Terima kasih telah berkunjung!',
  receipt_footer: '',
  tax_percentage: 0,
  service_charge_percentage: 0,
  currency_symbol: 'Rp'
};

export interface CartItem {
  product: Product;
  qty: number;
  notes: string;
}

interface POSContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  products: Product[];
  categories: Category[];
  recipes: Recipe[];
  orders: Order[];
  stocks: Stock[];
  stockHistories: StockHistory[];
  purchases: Purchase[];
  usersList: User[];
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;

  // POS Workspace state
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Auth Modals & Actions
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isEditAccountModalOpen: boolean;
  openEditAccountModal: () => void;
  closeEditAccountModal: () => void;
  isLogoutModalOpen: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  loginUser: (identifier: string, secret: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logoutUser: () => void;
  updateCurrentUserAccount: (updatedData: Partial<User>) => Promise<{ success: boolean; message: string; user?: User }>;

  // Product CRUD
  addProduct: (productData: Omit<Product, 'id'>, imageFile?: File | null) => Promise<Product>;
  editProduct: (id: string, productData: Partial<Product>, imageFile?: File | null) => Promise<Product>;
  removeProduct: (id: string) => Promise<boolean>;

  // Category CRUD
  addCategory: (categoryData: Omit<Category, 'id' | 'slug'>) => Promise<Category>;
  editCategory: (id: string, categoryData: Partial<Category>) => Promise<Category>;
  removeCategory: (id: string) => Promise<boolean>;

  // Recipe CRUD
  saveRecipeData: (recipeData: Omit<Recipe, 'id'>, recipeId?: string, imageFile?: File | null) => Promise<Recipe>;
  removeRecipe: (id: string) => Promise<boolean>;
  // Stock CRUD & Adjustment
  addStockItem: (stockData: Omit<Stock, 'id'>) => Promise<Stock>;
  editStockItem: (id: string, stockData: Partial<Stock>) => Promise<Stock>;
  removeStockItem: (id: string) => Promise<boolean>;
  adjustStockQuantity: (stockId: string, changeAmount: number, reason: string) => Promise<Stock>;

  // Purchase CRUD
  addPurchase: (purchaseData: Omit<Purchase, 'id'>) => Promise<Purchase>;
  editPurchase: (id: string, purchaseData: Partial<Purchase>) => Promise<Purchase>;
  removePurchase: (id: string) => Promise<boolean>;

  // Cart Actions
  addToCart: (product: Product, quantityToAdd?: number) => void;
  updateCartQty: (productId: string, newQty: number) => void;
  updateCartNotes: (productId: string, notes: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Recipe Modal
  selectedRecipe: Recipe | null;
  selectedRecipeProduct: Product | null;
  openRecipeModal: (product: Product) => void;
  closeRecipeModal: () => void;

  // Transaction & PIN
  isPinModalOpen: boolean;
  openPinModal: () => void;
  closePinModal: () => void;
  processPaymentWithPin: (pin: string, paymentMethod: PaymentMethod, amountPaid: number) => Promise<{ success: boolean; message: string; order?: Order }>;

  // Receipt Modal
  currentReceiptOrder: Order | null;
  isReceiptModalOpen: boolean;
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;

  // Favorites & Data Reload
  toggleFavorite: (productId: string) => Promise<void>;
  refreshData: () => Promise<void>;

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockHistories, setStockHistories] = useState<StockHistory[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Workspace
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('boothdaily_dark_mode') === 'true';
  });

  // Modals
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<Product | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auth Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openEditAccountModal = () => setIsEditAccountModalOpen(true);
  const closeEditAccountModal = () => setIsEditAccountModalOpen(false);
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('boothdaily_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const refreshData = async () => {
    // ─── PUBLIC DATA: accessible without token (Guest & Authenticated) ───
    // Products, categories, recipes, and settings are public read-only endpoints.
    // These must work even when no user is logged in (guest mode for Kasir & Resep).
    const [prds, cats, rcps, stgRes] = await Promise.allSettled([
      productService.getProducts(),
      productService.getCategories(),
      recipeService.getRecipes(),
      api.get('/settings'),
    ]);

    if (prds.status === 'fulfilled') setProducts(prds.value);
    else console.warn('GET /products failed:', (prds as PromiseRejectedResult).reason?.message);

    if (cats.status === 'fulfilled') setCategories(cats.value);
    else console.warn('GET /categories failed:', (cats as PromiseRejectedResult).reason?.message);

    if (rcps.status === 'fulfilled') setRecipes(rcps.value);
    else console.warn('GET /recipes failed:', (rcps as PromiseRejectedResult).reason?.message);

    if (stgRes.status === 'fulfilled') {
      const stgData = stgRes.value.data;
      const stg = stgData?.data || stgData;
      if (stg && stg.store_name) setSettings(stg);
    } else {
      console.warn('GET /settings failed:', (stgRes as PromiseRejectedResult).reason?.message);
    }

    // ─── PROTECTED DATA: requires Bearer token ────────────────────────────
    // Only fetched if a token exists in localStorage.
    const token = localStorage.getItem('token');
    if (!token) {
      // No token — guest mode. Restore user session from localStorage if still valid
      // but do not attempt protected API calls.
      const savedUserId = localStorage.getItem('boothdaily_user_session');
      if (!savedUserId) setCurrentUser(null);
      return;
    }

    const [ords, stks, purs, usrs] = await Promise.allSettled([
      orderService.getOrders(),
      stockService.getStocks(),
      stockService.getPurchases(),
      userService.getUsers(),
    ]);

    if (ords.status === 'fulfilled') setOrders(ords.value);
    else console.warn('GET /orders failed:', (ords as PromiseRejectedResult).reason?.message);

    if (stks.status === 'fulfilled') setStocks(stks.value);
    else console.warn('GET /stocks failed:', (stks as PromiseRejectedResult).reason?.message);

    if (purs.status === 'fulfilled') setPurchases(purs.value);
    else console.warn('GET /purchases failed:', (purs as PromiseRejectedResult).reason?.message);

    if (usrs.status === 'fulfilled') {
      const usrsData = usrs.value;
      setUsersList(usrsData);
      // Restore user session from the fresh user list
      const savedUserId = localStorage.getItem('boothdaily_user_session');
      if (savedUserId) {
        const found = usrsData.find((u: User) => u.id === savedUserId);
        setCurrentUser(found || null);
        if (!found) {
          // Session user no longer exists — clear stale session
          localStorage.removeItem('boothdaily_user_session');
        }
      }
    } else {
      console.warn('GET /users failed:', (usrs as PromiseRejectedResult).reason?.message);
    }
  };

  // Auth Operations
  const loginUser = async (identifier: string, secret: string) => {
    const cleanId = identifier.trim();
    const cleanSecret = secret.trim();

    if (!cleanId) {
      return { success: false, message: 'Masukkan Username atau Email' };
    }

    try {
      // Try backend POST /auth/login first via userService
      const authRes = await userService.login(cleanId, cleanSecret);
      if (authRes.user) {
        setCurrentUser(authRes.user);
        localStorage.setItem('boothdaily_user_session', authRes.user.id);
        setIsLoginModalOpen(false);
        showToast(`Login berhasil sebagai ${authRes.user.name}`, 'success');
        return { success: true, message: 'Login Berhasil', user: authRes.user };
      }
    } catch (apiErr) {
      console.warn('Backend login attempt failed, using local user fallback:', apiErr);
    }

    const cleanIdLower = cleanId.toLowerCase();
    const matchedUser = usersList.find(u => {
      if (!u.is_active) return false;
      const matchUsername = u.username?.toLowerCase() === cleanIdLower;
      const matchEmail = u.email.toLowerCase() === cleanIdLower;
      const matchName = u.name.toLowerCase().includes(cleanIdLower);
      const matchPin = u.pin === cleanIdLower;
      return matchUsername || matchEmail || matchName || matchPin;
    });

    if (!matchedUser) {
      return { success: false, message: 'Akun tidak ditemukan' };
    }

    const isPinMatch = matchedUser.pin === cleanSecret;
    const isPassMatch = matchedUser.password === cleanSecret;
    const isSecretEmpty = cleanSecret === '';

    if (isPinMatch || isPassMatch || isSecretEmpty || cleanIdLower === matchedUser.pin) {
      setCurrentUser(matchedUser);
      localStorage.setItem('boothdaily_user_session', matchedUser.id);
      setIsLoginModalOpen(false);
      showToast(`Login berhasil sebagai ${matchedUser.name}`, 'success');
      return { success: true, message: 'Login Berhasil', user: matchedUser };
    }

    return { success: false, message: 'Password atau PIN salah' };
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('boothdaily_user_session');
    setCurrentUser(null);
    setIsLogoutModalOpen(false);
    showToast('Logout berhasil. Anda kembali menjadi Guest.', 'info');
  };

  const updateCurrentUserAccount = async (updatedData: Partial<User>) => {
    if (!currentUser) {
      return { success: false, message: 'Tidak ada user aktif' };
    }
    try {
      const updated = await userService.updateUser(currentUser.id, updatedData);
      setCurrentUser(updated);
      setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
      setIsEditAccountModalOpen(false);
      showToast('Data akun berhasil diperbarui', 'success');
      return { success: true, message: 'Profil berhasil diperbarui', user: updated };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal memperbarui profil' };
    }
  };

  // Product CRUD
  const addProduct = async (productData: Omit<Product, 'id'>, imageFile?: File | null) => {
    const newPrd = await productService.createProduct(productData, imageFile);
    setProducts(prev => [newPrd, ...prev]);
    showToast(`Produk "${newPrd.name}" berhasil ditambahkan`, 'success');
    return newPrd;
  };

  const editProduct = async (id: string, productData: Partial<Product>, imageFile?: File | null) => {
    const updated = await productService.updateProduct(id, productData, imageFile);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    showToast(`Produk "${updated.name}" berhasil diperbarui`, 'success');
    return updated;
  };

  const removeProduct = async (id: string) => {
    const prd = products.find(p => p.id === id);
    const success = await productService.deleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`Produk "${prd?.name || ''}" berhasil dihapus`, 'success');
    }
    return success;
  };

  // Category CRUD
  const addCategory = async (categoryData: Omit<Category, 'id' | 'slug'>) => {
    const newCat = await productService.createCategory(categoryData);
    setCategories(prev => [...prev, newCat]);
    showToast(`Kategori "${newCat.name}" berhasil ditambahkan`, 'success');
    return newCat;
  };

  const editCategory = async (id: string, categoryData: Partial<Category>) => {
    const updated = await productService.updateCategory(id, categoryData);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    showToast(`Kategori "${updated.name}" berhasil diperbarui`, 'success');
    return updated;
  };

  const removeCategory = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    const success = await productService.deleteCategory(id);
    if (success) {
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast(`Kategori "${cat?.name || ''}" berhasil dihapus`, 'success');
    }
    return success;
  };

  // Recipe CRUD
  const saveRecipeData = async (
    recipeData: Omit<Recipe, 'id'>,
    recipeId?: string,
    imageFile?: File | null
  ) => {
    // Edit resep yang sudah ada -> PUT. Resep baru -> POST.
    // Ini penting supaya tidak nabrak validasi unique:recipes,product_id
    // di backend saat sebenarnya sedang mengedit resep yang sudah ada.
    let saved = recipeId
      ? await recipeService.updateRecipe(recipeId, recipeData)
      : await recipeService.createRecipe(recipeData);

    // Foto dikirim terpisah sebagai multipart setelah data resep tersimpan
    if (imageFile) {
      saved = await recipeService.uploadRecipeImage(saved.id, imageFile);
    }

    setRecipes(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    // Update product recipe_id link if needed
    const prd = products.find(p => p.id === saved.product_id);
    if (prd && !prd.recipe_id) {
      await productService.updateProduct(prd.id, { recipe_id: saved.id });
      setProducts(prev => prev.map(p => p.id === prd.id ? { ...p, recipe_id: saved.id } : p));
    }

    showToast('Resep berhasil disimpan', 'success');
    return saved;
  };

  const removeRecipe = async (id: string) => {
    const rcp = recipes.find(r => r.id === id);
    const success = await recipeService.deleteRecipe(id);
    if (success) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      if (rcp) {
        setProducts(prev => prev.map(p => p.id === rcp.product_id ? { ...p, recipe_id: undefined } : p));
      }
      showToast('Resep berhasil dihapus', 'success');
    }
    return success;
  };

  // Stock CRUD & Adjustment
  const addStockItem = async (stockData: Omit<Stock, 'id'>) => {
    const newStock = await stockService.createStock(stockData);
    setStocks(prev => [newStock, ...prev]);
    const histories = await stockService.getStockHistories();
    setStockHistories(histories);
    showToast(`Bahan "${newStock.name}" berhasil ditambahkan`, 'success');
    return newStock;
  };

  const editStockItem = async (id: string, stockData: Partial<Stock>) => {
    const updated = await stockService.updateStock(id, stockData);
    setStocks(prev => prev.map(s => s.id === id ? updated : s));
    showToast(`Bahan "${updated.name}" berhasil diperbarui`, 'success');
    return updated;
  };

  const removeStockItem = async (id: string) => {
    const stk = stocks.find(s => s.id === id);
    const success = await stockService.deleteStock(id);
    if (success) {
      setStocks(prev => prev.filter(s => s.id !== id));
      showToast(`Bahan "${stk?.name || ''}" berhasil dihapus`, 'success');
    }
    return success;
  };

  const adjustStockQuantity = async (stockId: string, changeAmount: number, reason: string) => {
    const userName = currentUser ? currentUser.name : 'Owner';
    const updated = await stockService.adjustStock(stockId, changeAmount, reason, userName);
    setStocks(prev => prev.map(s => s.id === stockId ? updated : s));
    const histories = await stockService.getStockHistories();
    setStockHistories(histories);
    showToast(`Penyesuaian stok ${updated.name} berhasil`, 'success');
    return updated;
  };

  // Purchase CRUD
  const addPurchase = async (purchaseData: Omit<Purchase, 'id'>) => {
    const newPur = await stockService.createPurchase(purchaseData);
    setPurchases(prev => [newPur, ...prev]);
    const updatedStocks = await stockService.getStocks();
    const updatedHistories = await stockService.getStockHistories();
    setStocks(updatedStocks);
    setStockHistories(updatedHistories);
    showToast(`Pembelian ${newPur.purchase_number} berhasil ditambahkan`, 'success');
    return newPur;
  };

  const editPurchase = async (id: string, purchaseData: Partial<Purchase>) => {
    const updated = await stockService.updatePurchase(id, purchaseData);
    setPurchases(prev => prev.map(p => p.id === id ? updated : p));
    const updatedStocks = await stockService.getStocks();
    const updatedHistories = await stockService.getStockHistories();
    setStocks(updatedStocks);
    setStockHistories(updatedHistories);
    showToast(`Pembelian ${updated.purchase_number} berhasil diperbarui`, 'success');
    return updated;
  };

  const removePurchase = async (id: string) => {
    const pur = purchases.find(p => p.id === id);
    const success = await stockService.deletePurchase(id);
    if (success) {
      setPurchases(prev => prev.filter(p => p.id !== id));
      const updatedStocks = await stockService.getStocks();
      const updatedHistories = await stockService.getStockHistories();
      setStocks(updatedStocks);
      setStockHistories(updatedHistories);
      showToast(`Pembelian ${pur?.purchase_number || ''} berhasil dihapus & stok dikembalikan`, 'success');
    }
    return success;
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Cart operations
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    if (!product.is_active) {
      showToast('Produk ini sedang tidak aktif', 'error');
      return;
    }

    const stockInfo = getProductStockInfo(product, recipes, stocks);
    if (stockInfo.isOut) {
      showToast('Stok habis, silakan lakukan pembelian atau update stok.', 'error');
      return;
    }

    const existingInCart = cart.find(item => item.product.id === product.id);
    const currentQty = existingInCart ? existingInCart.qty : 0;
    if (currentQty + quantityToAdd > stockInfo.maxPortions) {
      showToast(`Stok ${product.name} tidak mencukupi (tersisa ${stockInfo.maxPortions})`, 'error');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + quantityToAdd }
            : item
        );
      }
      return [...prevCart, { product, qty: quantityToAdd, notes: '' }];
    });
    showToast(`${product.name} ditambahkan`, 'info');
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem && newQty > cartItem.qty) {
      const stockInfo = getProductStockInfo(cartItem.product, recipes, stocks);
      if (newQty > stockInfo.maxPortions) {
        showToast(`Stok ${cartItem.product.name} hanya tersisa ${stockInfo.maxPortions} item`, 'error');
        return;
      }
    }

    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: newQty } : item));
  };

  const updateCartNotes = (productId: string, notes: string) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, notes } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
  };

  // Recipe Modal
  const openRecipeModal = (product: Product) => {
    const recipe = recipes.find(r => r.product_id === product.id);
    setSelectedRecipe(recipe || null);
    setSelectedRecipeProduct(product);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setSelectedRecipeProduct(null);
  };

  // PIN & Payment
  const openPinModal = () => {
    if (cart.length === 0) {
      showToast('Keranjang masih kosong!', 'error');
      return;
    }
    setIsPinModalOpen(true);
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
  };

  const processPaymentWithPin = async (pin: string, paymentMethod: PaymentMethod, amountPaid: number) => {
    const verifiedUser = await userService.verifyPin(pin);
    if (!verifiedUser) {
      return { success: false, message: 'PIN salah. Silakan coba lagi.' };
    }

    // Role/Session isolation logic
    if (currentUser) {
      // If a user is already logged in, they can ONLY use their own PIN.
      if (verifiedUser.id !== currentUser.id) {
        return { success: false, message: 'PIN salah. Silakan coba lagi.' };
      }
    }

    try {
      const itemsPayload = cart.map(c => ({
        product_id: c.product.id,
        product_name: c.product.name,
        price: c.product.price,
        qty: c.qty,
        notes: c.notes
      }));

      const newOrder = await transactionService.processTransaction({
        order_type: orderType,
        items: itemsPayload,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        customer_name: customerName,
        user: verifiedUser
      });

      // DO NOT call setCurrentUser(verifiedUser) here to maintain session isolation.

      setOrders(prev => [newOrder, ...prev]);

      // Refresh stocks & stock histories
      const updatedStocks = await stockService.getStocks();
      const updatedHistories = await stockService.getStockHistories();
      setStocks(updatedStocks);
      setStockHistories(updatedHistories);

      clearCart();
      setIsPinModalOpen(false);

      setCurrentReceiptOrder(newOrder);
      setIsReceiptModalOpen(true);

      showToast(`Transaksi ${newOrder.order_number} berhasil!`, 'success');
      return { success: true, message: 'Transaksi Berhasil', order: newOrder };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal memproses transaksi' };
    }
  };

  const openReceiptModal = (order: Order) => {
    setCurrentReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setCurrentReceiptOrder(null);
  };

  const toggleFavorite = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const updated = await productService.updateProduct(productId, { is_favorite: !product.is_favorite });
    setProducts(prev => prev.map(p => p.id === productId ? updated : p));
    showToast(updated.is_favorite ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', 'info');
  };

  return (
    <POSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        products,
        categories,
        recipes,
        orders,
        stocks,
        stockHistories,
        purchases,
        usersList,
        settings,
        setSettings,
        cart,
        orderType,
        setOrderType,
        customerName,
        setCustomerName,
        selectedCategory,
        setSelectedCategory,
        setSearchQuery,
        isDarkMode,
        toggleDarkMode,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isEditAccountModalOpen,
        openEditAccountModal,
        closeEditAccountModal,
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
        loginUser,
        logoutUser,
        updateCurrentUserAccount,
        addProduct,
        editProduct,
        removeProduct,
        addCategory,
        editCategory,
        removeCategory,
        saveRecipeData,
        removeRecipe,
        addStockItem,
        editStockItem,
        removeStockItem,
        adjustStockQuantity,
        addPurchase,
        editPurchase,
        removePurchase,
        addToCart,
        updateCartQty,
        updateCartNotes,
        removeFromCart,
        clearCart,
        selectedRecipe,
        selectedRecipeProduct,
        openRecipeModal,
        closeRecipeModal,
        isPinModalOpen,
        openPinModal,
        closePinModal,
        processPaymentWithPin,
        currentReceiptOrder,
        isReceiptModalOpen,
        openReceiptModal,
        closeReceiptModal,
        toggleFavorite,
        refreshData,
        toast,
        showToast
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};