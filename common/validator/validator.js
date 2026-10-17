/**
 * Middleware générique de validation utilisant Yup compatible Express 5
 * @param {import('yup').Schema} schema - Le schéma de validation Yup
 * @param {'body' | 'query' | 'params'} [source='body'] - La source de la requête à valider
 */
const validate = (schema, source = 'body') => async (req, res, next) => {
  try {
    const validated = await schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true, // Retire les champs inconnus pour empêcher toute assignation de masse (C6)
    });

    // Express 5 : req.query est en lecture seule, on stocke le résultat dans req.validated
    req.validated = { ...(req.validated || {}), [source]: validated };
    if (source === 'body') req.body = validated;

    return next();
  } catch (error) {
    const errors = error.inner && error.inner.length > 0
      ? error.inner.map((e) => ({ field: e.path, message: e.message }))
      : [{ message: error.message }];

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données transmises',
      errors,
    });
  }
};

export default validate;