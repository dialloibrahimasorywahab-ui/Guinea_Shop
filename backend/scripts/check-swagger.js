import { swaggerSpec } from '../config/swagger.js';

const paths = Object.keys(swaggerSpec.paths || {});
console.log('==================================================');
console.log(`📚 GH_Maick — Contrôle OpenAPI / Swagger (T6.1)`);
console.log(`Endpoints documentés au total : ${paths.length}`);
console.log('==================================================');

const requiredModules = [
  'auth',
  'users',
  'categories',
  'clients',
  'fournisseurs',
  'articles',
  'ventes',
  'ligne-ventes',
  'factures',
  'paiements',
  'achats',
  'lignes-achats',
  'stock',
  'mouvements-stock',
  'finances',
  'uploads',
];

let missingModules = 0;
for (const mod of requiredModules) {
  const count = paths.filter((p) => p.startsWith(`/${mod}`) || p.includes(`/${mod}`)).length;
  if (count === 0) {
    console.error(`❌ Module '${mod}' non documenté dans Swagger`);
    missingModules++;
  } else {
    console.log(`✅ Module '${mod.padEnd(16)}' : ${count} route(s) documentée(s)`);
  }
}

console.log('--------------------------------------------------');
if (missingModules === 0) {
  console.log(`🎉 100% des ${requiredModules.length} modules sont documentés dans Swagger !`);
  process.exit(0);
} else {
  console.error(`❌ ${missingModules} modules manquent à l'appel dans Swagger.`);
  process.exit(1);
}
