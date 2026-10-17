import app from '../app.js';
import { swaggerSpec } from '../config/swagger.js';

// En Express 5, app.router ou app._router
const router = app._router || app.router;
console.log('App keys:', Object.keys(app));
console.log('Router found:', Boolean(router));
if (router) {
  console.log('Router stack length:', router.stack?.length);
}
console.log('Swagger paths count:', Object.keys(swaggerSpec.paths || {}).length);
