import api from '../utils/axios';
import { Recipe } from '../types';

function buildImageFormData(imageFile: File): FormData {
  const formData = new FormData();
  formData.append('image', imageFile, imageFile.name);
  return formData;
}

export const recipeService = {
  async getRecipes(): Promise<Recipe[]> {
    const response = await api.get('/recipes');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getRecipeByProductId(productId: string): Promise<Recipe | undefined> {
    const response = await api.get(`/recipes/by-product/${productId}`);
    return response.data.data || response.data;
  },

  /**
   * Membuat resep BARU. Backend menolak (422) kalau product_id yang dipilih
   * sudah punya resep — makanya ini HANYA dipakai saat benar-benar menambah
   * resep baru, bukan saat edit.
   */
  async createRecipe(recipeData: Omit<Recipe, 'id'>): Promise<Recipe> {
    const response = await api.post('/recipes', recipeData);
    return response.data.data || response.data;
  },

  /**
   * Update resep yang SUDAH ADA (dipanggil saat edit). Pakai PUT ke
   * /recipes/{id}, bukan POST /recipes — supaya tidak nabrak validasi
   * unique:recipes,product_id di endpoint create.
   */
  async updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<Recipe> {
    const response = await api.put(`/recipes/${id}`, recipeData);
    return response.data.data || response.data;
  },

  /**
   * Upload/ganti foto resep secara terpisah, SETELAH resep (ingredients,
   * steps, dll) tersimpan sebagai JSON. Dikirim sebagai multipart lewat
   * method-spoofing (POST + _method=PUT) karena Laravel tidak bisa parse
   * multipart langsung di request PUT.
   */
  async uploadRecipeImage(id: string, imageFile: File): Promise<Recipe> {
    const formData = buildImageFormData(imageFile);
    formData.append('_method', 'PUT');
    const response = await api.post(`/recipes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data || response.data;
  },

  async deleteRecipe(id: string): Promise<boolean> {
    await api.delete(`/recipes/${id}`);
    return true;
  }
};