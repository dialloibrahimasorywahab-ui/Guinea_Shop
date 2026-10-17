import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

describe('Vérification du serveur HTTP Express', () => {
  it('doit démarrer sur un port éphémère et répondre', async () => {
    const server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api-docs/`);
      assert.ok(res.status === 200 || res.status === 301 || res.status === 404);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
