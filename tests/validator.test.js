import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as yup from 'yup';
import validate from '../common/validator/validator.js';

describe('Vérification Middleware Validator Express 5 (V6, C6)', () => {
  const schema = yup.object().shape({
    page: yup.number().integer().positive().default(1),
    limit: yup.number().integer().positive().default(10),
  });

  it('V6: Valide req.query sans provoquer d\'erreur en lecture seule sous Express 5', async () => {
    const middleware = validate(schema, 'query');
    const req = {
      query: Object.freeze({ page: '2', limit: '20' }), // imite Express 5 readonly
    };
    let nextCalled = false;
    const res = {};
    const next = () => { nextCalled = true; };

    await middleware(req, res, next);
    assert.ok(nextCalled);
    assert.equal(req.validated?.query?.page, 2);
    assert.equal(req.validated?.query?.limit, 20);
  });

  it('C6: stripUnknown retire les champs inconnus (protection assignation de masse)', async () => {
    const userSchema = yup.object().shape({
      nom: yup.string().required(),
    });
    const middleware = validate(userSchema, 'body');
    const req = {
      body: {
        nom: 'Diallo',
        role: 'admin', // Champ pirate non autorisé
        montantTotal: 1000000,
      },
    };
    let nextCalled = false;
    const res = {};
    const next = () => { nextCalled = true; };

    await middleware(req, res, next);
    assert.ok(nextCalled);
    assert.equal(req.body.nom, 'Diallo');
    assert.equal(req.body.role, undefined);
    assert.equal(req.body.montantTotal, undefined);
  });

  it('Renvoie une réponse 400 claire en cas d\'erreur de validation', async () => {
    const userSchema = yup.object().shape({
      email: yup.string().email('Email non valide').required('Email requis'),
    });
    const middleware = validate(userSchema, 'body');
    const req = { body: { email: 'invalid-email' } };
    let statusCode = null;
    let jsonResult = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { jsonResult = data; return this; },
    };
    const next = () => assert.fail('next ne doit pas être appelé');

    await middleware(req, res, next);
    assert.equal(statusCode, 400);
    assert.equal(jsonResult?.success, false);
    assert.ok(Array.isArray(jsonResult?.errors));
    assert.equal(jsonResult?.errors[0]?.field, 'email');
  });
});
