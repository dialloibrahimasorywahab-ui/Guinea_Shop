import CategoryService from "./categories.service.js";

class CategoryController {
  static createCategory = async (req, res) => {
    try {
      const newCat = await CategoryService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        data: newCat,
        message: "Catégorie créée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllCategories = async (req, res) => {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getCategoryById = async (req, res) => {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, error: "Catégorie introuvable" });
      }
      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updateCategory = async (req, res) => {
    try {
      const updatedCat = await CategoryService.updateCategory(req.params.id, req.body);
      if (!updatedCat) {
        return res.status(404).json({ success: false, error: "Catégorie introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedCat,
        message: "Catégorie mise à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteCategory = async (req, res) => {
    try {
      const deletedCat = await CategoryService.deleteCategoryById(req.params.id);
      if (!deletedCat) {
        return res.status(404).json({ success: false, error: "Catégorie introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedCat,
        message: "Catégorie supprimée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default CategoryController;
