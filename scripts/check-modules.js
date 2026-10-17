import 'dotenv/config';

try {
  console.log('Loading app.js...');
  const appModule = await import('../app.js');
  console.log('✅ app.js loaded successfully!');
  console.log('Express app instance created:', typeof appModule.default === 'function');
} catch (err) {
  console.error('❌ Failed to load app.js:', err);
  process.exit(1);
}
