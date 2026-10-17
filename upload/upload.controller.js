class UploadController {
  /**
   * Téléversement d'un seul fichier (image vêtement, avatar, justificatif)
   */
  static uploadSingle = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier n'a été fourni dans le champ 'file'",
        });
      }

      // Construction de l'URL accessible publiquement
      const relativeUrl = `/uploads/${req.file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

      return res.status(201).json({
        success: true,
        message: 'Fichier téléversé avec succès',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: relativeUrl,
          fullUrl,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du téléversement du fichier',
      });
    }
  };

  /**
   * Téléversement de plusieurs fichiers simultanément (ex: galerie photos d'un costume)
   */
  static uploadMultiple = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier n'a été fourni dans le champ 'files'",
        });
      }

      const uploadedFiles = req.files.map((file) => {
        const relativeUrl = `/uploads/${file.filename}`;
        return {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: relativeUrl,
          fullUrl: `${req.protocol}://${req.get('host')}${relativeUrl}`,
        };
      });

      return res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} fichiers téléversés avec succès`,
        data: uploadedFiles,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du téléversement multiple',
      });
    }
  };
}

export default UploadController;
