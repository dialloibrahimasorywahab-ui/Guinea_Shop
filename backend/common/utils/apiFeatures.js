/**
 * Utilitaire réutilisable de filtrage, recherche, tri et pagination pour les requêtes GET Mongoose.
 * 
 * @param {import('mongoose').Query} query - La requête Mongoose (ex: Article.find())
 * @param {Object} reqQuery - Les query params Express (req.query)
 * @param {Object} options - Configuration des fonctionnalités autorisées
 * @param {string[]} [options.searchFields] - Champs textuels inspectés lors d'une recherche (?search= ou ?q= ou champ direct)
 * @param {string[]} [options.filterFields] - Champs acceptant un filtre exact (?role=, ?statut=, ?categorie_id=)
 * @param {string[]} [options.allowedSortFields] - Liste blanche des champs de tri autorisés
 * @param {Object} [options.defaultSort] - Tri par défaut (ex: { createdAt: -1 })
 * @param {Object} [options.aliases] - Alias de paramètres (ex: { nom: 'libelle' })
 * @returns {import('mongoose').Query} Requête Mongoose chaînée avec filtres et tri
 */
export const applyApiFeatures = (query, reqQuery = {}, options = {}) => {
  const {
    searchFields = [],
    filterFields = [],
    allowedSortFields = [],
    defaultSort = { createdAt: -1 },
    aliases = {},
  } = options;

  const mongoFilter = {};

  // 1. Gestion des alias (ex: ?nom= -> libelle)
  const normalizedQuery = { ...reqQuery };
  for (const [alias, target] of Object.entries(aliases)) {
    if (normalizedQuery[alias] !== undefined && normalizedQuery[target] === undefined) {
      normalizedQuery[target] = normalizedQuery[alias];
    }
  }

  // 2. Recherche textuelle globale (?search= ou ?q=)
  const searchTerm = normalizedQuery.search || normalizedQuery.q;
  if (searchTerm && typeof searchTerm === 'string' && searchFields.length > 0) {
    const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    mongoFilter.$or = searchFields.map((field) => ({ [field]: regex }));
  }

  // 3. Filtres directs par champ (ex: ?role=client, ?statut=payee, ?libelle=costume)
  for (const field of filterFields) {
    if (normalizedQuery[field] !== undefined && normalizedQuery[field] !== '') {
      const val = String(normalizedQuery[field]).trim();
      // Si le champ fait aussi partie des searchFields (ex: libelle ou nom), autoriser le regex insensible à la casse
      if (searchFields.includes(field)) {
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        mongoFilter[field] = new RegExp(escaped, 'i');
      } else {
        mongoFilter[field] = val;
      }
    }
  }

  // Appliquer les filtres à la requête Mongoose existante
  if (Object.keys(mongoFilter).length > 0) {
    query.find(mongoFilter);
  }

  // 4. Tri dynamique (?sortBy=nom&order=asc ou ?sort=nom:asc)
  let sortObj = { ...defaultSort };
  const rawSort = normalizedQuery.sortBy || normalizedQuery.sort || normalizedQuery.tri;
  const rawOrder = normalizedQuery.order || normalizedQuery.dir || normalizedQuery.sens || 'asc';

  if (rawSort && typeof rawSort === 'string') {
    let sortField = rawSort.trim();
    let sortDirection = rawOrder.toLowerCase() === 'desc' || rawOrder === '-1' ? -1 : 1;

    // Support de la syntaxe "field:desc" ou "-field"
    if (sortField.startsWith('-')) {
      sortField = sortField.substring(1);
      sortDirection = -1;
    } else if (sortField.includes(':')) {
      const [f, d] = sortField.split(':');
      sortField = f;
      sortDirection = d.toLowerCase() === 'desc' || d === '-1' ? -1 : 1;
    }

    // Résolution d'alias sur le tri (ex: sortBy=nom pour articles -> libelle)
    if (aliases[sortField]) {
      sortField = aliases[sortField];
    }

    // Sécurité : autoriser uniquement les champs configurés dans allowedSortFields
    if (allowedSortFields.length === 0 || allowedSortFields.includes(sortField)) {
      sortObj = { [sortField]: sortDirection };
    }
  }

  query.sort(sortObj);

  // 5. Pagination optionnelle (?page=1&limit=20)
  const page = parseInt(normalizedQuery.page, 10);
  const limit = parseInt(normalizedQuery.limit, 10);
  if (!isNaN(page) && page > 0 && !isNaN(limit) && limit > 0) {
    query.skip((page - 1) * limit).limit(limit);
  }

  return query;
};

export default applyApiFeatures;
