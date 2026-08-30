import categoryModel from "./models/categories.models.js";

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
  static getAllCategories = async () => {
    return await categoryModel.find();
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
