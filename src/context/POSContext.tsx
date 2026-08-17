import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product, Category, Recipe, Order, Stock, Purchase, User, OrderType, PaymentMethod, Settings, StockHistory } from '../types';
import { productService } from '../services/productService';
import { recipeService } from '../services/recipeService';
import { userService } from '../services/userService';
import { orderService } from '../services/orderService';
import { stockService } from '../services/stockService';
import { transactionService } from '../services/transactionService';
import api from '../utils/axios';
import { getProductStockInfo } from '../utils/stockUtils';
import { products } from '../data/dummy';

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
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  authReady: boolean;
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
  updateCurrentUserAccount: (updatedData: Partial<User>, avatarFile?: File | null) => Promise<{ success: boolean; message: string; user?: User }>;

  // Product
  addProduct: (productData: Omit<Product, 'id'>, imageFile?: File | null) => Promise<Product>;
  editProduct: (id: string, productData: Partial<Product>, imageFile?: File | null) => Promise<Product>;
  removeProduct: (id: string) => Promise<boolean>;

  // Category
  addCategory: (categoryData: Omit<Category, 'id' | 'slug'>) => Promise<Category>;
  editCategory: (id: string, categoryData: Partial<Category>) => Promise<Category>;
  removeCategory: (id: string) => Promise<boolean>;

  // Recipe
  saveRecipeData: (recipeData: Omit<Recipe, 'id'>, recipeId?: string, imageFile?: File | null) => Promise<Recipe>;
  removeRecipe: (id: string) => Promise<boolean>;
  // Stock
  addStockItem: (stockData: Omit<Stock, 'id'>) => Promise<Stock>;
  editStockItem: (id: string, stockData: Partial<Stock>) => Promise<Stock>;
  removeStockItem: (id: string) => Promise<boolean>;
  adjustStockQuantity: (stockId: string, changeAmount: number, reason: string) => Promise<Stock>;

  // Purchase
  addPurchase: (purchaseData: Omit<Purchase, 'id'>) => Promise<Purchase>;
  editPurchase: (id: string, purchaseData: Partial<Purchase>) => Promise<Purchase>;
  removePurchase: (id: string) => Promise<boolean>;

  // Cart Actions
  addToCart: (product: Product, quantityToAdd?: number) => void;
  updateCartQty: (productId: string, newQty: number) => void;
  updateCartNotes: (productId: string, notes: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

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
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockHistories, setStockHistories] = useState<StockHistory[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<Product | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openEditAccountModal = () => setIsEditAccountModalOpen(true);
  const closeEditAccountModal = () => setIsEditAccountModalOpen(false);
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

const refreshData = async () => {
  // setAuthReady(false);

  try {
    const [prds, cats, rcps, stgRes] = await Promise.allSettled([
      productService.getProducts(),
      productService.getCategories(),
      recipeService.getRecipes(),
      api.get('/settings'),
    ]);

    if (prds.status === 'fulfilled') {
      setProducts(prds.value);
    } else {
      console.warn('GET /products failed:', prds.reason);
    }

    if (cats.status === 'fulfilled') {
      setCategories(cats.value);
    } else {
      console.warn('GET /categories failed:', cats.reason);
    }

    if (rcps.status === 'fulfilled') {
      setRecipes(rcps.value);
    } else {
      console.warn('GET /recipes failed:', rcps.reason);
    }

    if (stgRes.status === 'fulfilled') {
      const responseData = stgRes.value.data;
      const settingsData = responseData?.data ?? responseData;

      if (settingsData?.store_name) {
        setSettings(settingsData);
      }
    } else {
      console.warn('GET /settings failed:', stgRes.reason);
    }

    const token = localStorage.getItem('token');

    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      localStorage.removeItem('boothdaily_user_session');
      localStorage.removeItem('boothdaily_user_data');

      setCurrentUser(null);
      return;
    }

    const savedUserData = localStorage.getItem('boothdaily_user_data');

    if (savedUserData) {
      try {
        const cachedUser = JSON.parse(savedUserData) as User;

        if (cachedUser?.id) {
          setCurrentUser(cachedUser);
        }
      } catch {
        localStorage.removeItem('boothdaily_user_data');
      }
    }

    let authenticatedUser: User | null = null;

    try {
      const me = await userService.getMe();

      if (!me?.id) {
        throw new Error('Data user dari /auth/me tidak valid');
      }

      authenticatedUser = me;

      setCurrentUser(me);
      localStorage.setItem('boothdaily_user_session', me.id);
      localStorage.setItem('boothdaily_user_data', JSON.stringify(me));
    } catch (error: any) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('boothdaily_user_session');
        localStorage.removeItem('boothdaily_user_data');

        setCurrentUser(null);
        return;
      }

      console.warn('Auth session validation failed:', error);
    }

    if (!authenticatedUser) {
      return;
    }

    const userRole = String(
      authenticatedUser.role ?? ''
    ).toLowerCase();

    const isOwner = userRole === 'owner';
    const isKaryawan =
      userRole === 'karyawan' ||
      userRole === 'employee';

    const dataRequests: PromiseSettledResult<any>[] = await Promise.allSettled([
      orderService.getOrders(),
      stockService.getStocks(),
      ...(isOwner
        ? [
            stockService.getPurchases(),
            userService.getUsers(),
          ]
        : []),
    ]);

    const ordersResult = dataRequests[0];
    const stocksResult = dataRequests[1];

    if (ordersResult.status === 'fulfilled') {
      setOrders(ordersResult.value);
    } else {
      console.warn('GET /orders failed:', ordersResult.reason);
    }

    if (stocksResult.status === 'fulfilled') {
      setStocks(stocksResult.value);
    } else {
      console.warn('GET /stocks failed:', stocksResult.reason);
    }

    if (isOwner) {
      const purchasesResult = dataRequests[2];
      const usersResult = dataRequests[3];

      if (purchasesResult?.status === 'fulfilled') {
        setPurchases(purchasesResult.value);
      } else if (purchasesResult) {
        console.warn(
          'GET /purchases failed:',
          purchasesResult.reason
        );
      }

      if (usersResult?.status === 'fulfilled') {
        setUsersList(usersResult.value);
      } else if (usersResult) {
        console.warn(
          'GET /users failed:',
          usersResult.reason
        );
      }
    } else if (isKaryawan) {
      setPurchases([]);
      setUsersList([]);
    }
  } finally {
    setAuthReady(true);
  }
};


  // Authentication
  const loginUser = async (identifier: string, secret: string) => {
    const cleanId = identifier.trim();

    if (!cleanId) {
      return { success: false, message: 'Masukkan Username atau Email' };
    }

    if (!secret) {
      return { success: false, message: 'Masukkan Password' };
    }

    try {
      const authRes = await userService.login(cleanId, secret);

      if (!authRes?.user?.id) {
        return {
          success: false,
          message: 'Response login tidak valid',
        };
      }

      const authToken =
        (authRes as any).token ??
        (authRes as any).access_token ??
        (authRes as any).data?.token ??
        (authRes as any).data?.access_token;

      if (!authToken) {
        return {
          success: false,
          message: 'Token autentikasi tidak ditemukan',
        };
      }

      localStorage.setItem('token', authToken);
      localStorage.setItem(
        'boothdaily_user_data',
        JSON.stringify(authRes.user)
      );
      localStorage.setItem(
        'boothdaily_user_session',
        authRes.user.id
      );

      setCurrentUser(authRes.user);
      setIsLoginModalOpen(false);

      showToast(
        `Login berhasil sebagai ${authRes.user.name}`,
        'success'
      );

      return {
        success: true,
        message: 'Login Berhasil',
        user: authRes.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ??
          error?.message ??
          'Username/email atau password salah',
      };
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('boothdaily_user_session');
      localStorage.removeItem('boothdaily_user_data');

      setCurrentUser(null);
      setIsLogoutModalOpen(false);

      showToast('Logout berhasil. Anda kembali menjadi Guest.', 'info');
    }
  };

  const updateCurrentUserAccount = async (
    updatedData: Partial<User>,
    avatarFile?: File | null
  ) => {
    if (!currentUser) {
      return { success: false, message: 'Tidak ada user aktif' };
    }
    try {
      const updated = await userService.updateUser(currentUser.id, updatedData, avatarFile);
      setCurrentUser(updated);
      setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
      localStorage.setItem('boothdaily_user_data', JSON.stringify(updated));
      localStorage.setItem('boothdaily_user_session', updated.id);
      setIsEditAccountModalOpen(false);
      showToast('Data akun berhasil diperbarui', 'success');
      return { success: true, message: 'Profil berhasil diperbarui', user: updated };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal memperbarui profil' };
    }
  };

  // Product
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

  // Category
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

  // Recipe
  const saveRecipeData = async (
    recipeData: Omit<Recipe, 'id'>,
    recipeId?: string,
    imageFile?: File | null
  ) => {
    let saved = recipeId
      ? await recipeService.updateRecipe(recipeId, recipeData)
      : await recipeService.createRecipe(recipeData);

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

  // Stock
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

  // Purchase
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

  // Cart
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

  const openRecipeModal = (product: Product) => {
    const recipe = recipes.find(r => r.product_id === product.id);
    setSelectedRecipe(recipe || null);
    setSelectedRecipeProduct(product);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setSelectedRecipeProduct(null);
  };

  // Payment
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

    // Logged-in users can only authorize with their own PIN.
    if (currentUser) {
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

      setOrders(prev => [newOrder, ...prev]);

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
        authReady,
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