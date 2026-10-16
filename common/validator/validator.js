/**
 * Middleware générique de validation utilisant Yup
 * @param {import('yup').Schema} schema - Le schéma de validation Yup
 * @param {'body' | 'query' | 'params'} [source='body'] - La source de la requête à valider
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: false,
      });
      req[source] = validated;
      next();
    } catch (error) {
      const formattedErrors = error.inner && error.inner.length > 0
        ? error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          }))
        : [{ message: error.message }];

      return res.status(400).json({
        success: false,
        message: "Erreur de validation des données transmises",
        errors: formattedErrors,
      });
    }
  };
};

export default validate;