import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { updateArticleSchema } from '../articles/articles.validator.js';
import validate from '../common/validator/validator.js';

describe('Protection du Stock Article contre les modifications directes (T4.2, C7)', () => {
  it('updateArticleSchema ne contient plus quantiteEnStock', async () => {
    const middleware = validate(updateArticleSchema, 'body');
    const req = {
      body: {
        libelle: 'Chemise Slim Fit',
        quantiteEnStock: 999, // Tentative de pirater le stock sans mouvement
      },
    };
    let nextCalled = false;
    const res = {};
    const next = () => { nextCalled = true; };

    await middleware(req, res, next);
    assert.ok(nextCalled);
    assert.equal(req.body.libelle, 'Chemise Slim Fit');
    assert.equal(req.body.quantiteEnStock, undefined); // Doit être retiré par stripUnknown
  });
});
