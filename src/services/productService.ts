import api from '../utils/axios';
import { Product, Category } from '../types';

/**
 * Membentuk FormData dari object produk + file gambar.
 * `image_url` sengaja tidak dikirim di sini karena foto dikirim
 * terpisah lewat field `image` (dibaca backend via $request->hasFile('image')).
 */
function buildProductFormData(productData: Record<string, any>, imageFile: File): FormData {
  const formData = new FormData();

  Object.entries(productData).forEach(([key, value]) => {
    if (key === 'image_url') return;
    if (value === undefined || value === null) return;
    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
    } else {
      formData.append(key, String(value));
    }
  });

  formData.append('image', imageFile, imageFile.name);
  return formData;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/products');
    const data = response.data;
    const items = Array.isArray(data) ? data : (data.data || []);
    return items;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const response = await api.get(`/products/${id}`);
    return response.data.data || response.data;
  },

  /**
   * @param imageFile - File hasil crop+compress dari ImageUpload. Kalau ada,
   * request dikirim sebagai multipart/form-data. Kalau tidak ada,
   * dikirim sebagai JSON biasa (foto tidak diubah).
   */
  async createProduct(productData: Omit<Product, 'id'>, imageFile?: File | null): Promise<Product> {
    if (imageFile) {
      const formData = buildProductFormData(productData, imageFile);
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    }

    const response = await api.post('/products', productData);
    return response.data.data || response.data;
  },

  /**
   * @param imageFile - sama seperti createProduct. Karena Laravel tidak bisa
   * parse multipart di method PUT langsung, request dikirim sebagai POST
   * dengan field `_method=PUT` (method spoofing) ke route yang sudah
   * disiapkan di api.php: `Route::post('/products/{product}', ...)`.
   */
  async updateProduct(id: string, productData: Partial<Product>, imageFile?: File | null): Promise<Product> {
    if (imageFile) {
      const formData = buildProductFormData(productData, imageFile);
      formData.append('_method', 'PUT');
      const response = await api.post(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    }

    const response = await api.put(`/products/${id}`, productData);
    return response.data.data || response.data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await api.delete(`/products/${id}`);
    return true;
  },

  // Category CRUD
  async createCategory(categoryData: Omit<Category, 'id' | 'slug'>): Promise<Category> {
    const response = await api.post('/categories', categoryData);
    return response.data.data || response.data;
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data.data || response.data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    await api.delete(`/categories/${id}`);
    return true;
  }
};