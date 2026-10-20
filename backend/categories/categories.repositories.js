import categoryModel from "./models/categories.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

class CategoryRepository {
  // creation d'une categorie d'article
  static createCategory = async (data) => {
    return await categoryModel.create(data);
  };

  // recuperation d'une categorie par son id
  static getCategoryById = async (id) => {
    return await categoryModel.findById(id);
  };
  
  // recuperer toutes les categories des produits dispo
  static getAllCategories = async (queryParams = {}) => {
    const query = categoryModel.find();
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['nom', 'description'],
      filterFields: ['nom'],
      allowedSortFields: ['nom', 'createdAt'],
      defaultSort: { createdAt: -1 },
      aliases: { search: 'q' },
    });
  };

  static updateCategory = async (id, update) => {
    return await categoryModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
  };

  static deleteCategory = async (id) => {
    return await categoryModel.findByIdAndDelete(id);
  };
}

export default CategoryRepository;
