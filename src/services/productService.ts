import api from '../utils/axios';
import { Product, Category } from '../types';

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

const normalizeProduct = (product: any): Product => ({
  ...product,
  id: String(product.id),
  category_id: String(product.category_id),
});

const normalizeCategory = (category: any): Category => ({
  ...category,
  id: String(category.id),
  icon_name: category.icon_name || 'tag',
});

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/products');
    const data = response.data;
    const items = Array.isArray(data) ? data : (data.data || []);

    return items.map(normalizeProduct);
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    const data = response.data;
    const items = Array.isArray(data) ? data : (data.data || []);

    return items.map(normalizeCategory);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const response = await api.get(`/products/${id}`);
    const product = response.data.data || response.data;

    return product ? normalizeProduct(product) : undefined;
  },

  async createProduct(
    productData: Omit<Product, 'id'>,
    imageFile?: File | null
  ): Promise<Product> {
    if (imageFile) {
      const formData = buildProductFormData(productData, imageFile);

      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return normalizeProduct(response.data.data || response.data);
    }

    const response = await api.post('/products', productData);

    return normalizeProduct(response.data.data || response.data);
  },

  async updateProduct(
    id: string,
    productData: Partial<Product>,
    imageFile?: File | null
  ): Promise<Product> {
    if (imageFile) {
      const formData = buildProductFormData(productData, imageFile);
      formData.append('_method', 'PUT');

      const response = await api.post(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return normalizeProduct(response.data.data || response.data);
    }

    const response = await api.put(`/products/${id}`, productData);

    return normalizeProduct(response.data.data || response.data);
  },

  async deleteProduct(id: string): Promise<boolean> {
    await api.delete(`/products/${id}`);
    return true;
  },

  async createCategory(
    categoryData: Omit<Category, 'id' | 'slug'>
  ): Promise<Category> {
    const response = await api.post('/categories', categoryData);

    return normalizeCategory(response.data.data || response.data);
  },

  async updateCategory(
    id: string,
    categoryData: Partial<Category>
  ): Promise<Category> {
    const response = await api.put(`/categories/${id}`, categoryData);

    return normalizeCategory(response.data.data || response.data);
  },

  async deleteCategory(id: string): Promise<boolean> {
    await api.delete(`/categories/${id}`);
    return true;
  },
};