import CategoryRepository from "./categories.repositories.js";

class CategoryService {
  static createCategory = async (data) => {
    return await CategoryRepository.createCategory(data);
  };

  static getCategoryById = async (id) => {
    return await CategoryRepository.getCategoryById(id);
  };

  static getAllCategories = async (queryParams = {}) => {
    return await CategoryRepository.getAllCategories(queryParams);
  };

  static updateCategory = async (id, update) => {
    return await CategoryRepository.updateCategory(id, update);
  };

  static deleteCategory = async (id) => {
    return await CategoryRepository.deleteCategory(id);
  };

  static deleteCategoryById = async (id) => {
    return await CategoryRepository.deleteCategory(id);
  };
}

export default CategoryService;
