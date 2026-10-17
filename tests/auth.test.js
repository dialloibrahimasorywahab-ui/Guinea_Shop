import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import verifyAccessToken from '../common/middleware/verifytoken.js';
import checkEnv from '../config/env.js';

describe('Vérification Authentification & Sécurité (S1, S5)', () => {
  it('S5: checkEnv ne lève pas d\'erreur si les variables sont présentes', () => {
    assert.doesNotThrow(() => checkEnv());
  });

  it('S1: verifyAccessToken renvoie 401 TOKEN_MISSING si aucun token n\'est fourni', () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };
    const next = () => assert.fail('next() ne devrait pas être appelé');

    verifyAccessToken(req, res, next);
    assert.equal(statusSent, 401);
    assert.equal(jsonSent?.code, 'TOKEN_MISSING');
  });

  it('S1: verifyAccessToken renvoie 401 TOKEN_EXPIRED pour un token expiré', () => {
    const secret = process.env.JWT_SECRET || 'gh_maick_super_secret_jwt_key_2026';
    const expiredToken = jwt.sign({ id: '123' }, secret, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };
    const next = () => assert.fail('next() ne devrait pas être appelé');

    verifyAccessToken(req, res, next);
    assert.equal(statusSent, 401);
    assert.equal(jsonSent?.code, 'TOKEN_EXPIRED');
  });

  it('S1: verifyAccessToken renvoie 401 TOKEN_INVALID pour un token altéré', () => {
    const req = { headers: { authorization: 'Bearer token_invalide_n_importe_quoi' } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };
    const next = () => assert.fail('next() ne devrait pas être appelé');

    verifyAccessToken(req, res, next);
    assert.equal(statusSent, 401);
    assert.equal(jsonSent?.code, 'TOKEN_INVALID');
  });

  it('S1: verifyAccessToken appelle next() et peuple req.user pour un token valide', () => {
    const secret = process.env.JWT_SECRET || 'gh_maick_super_secret_jwt_key_2026';
    const validToken = jwt.sign({ id: 'user_456', role: 'caissier' }, secret, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    let nextCalled = false;
    const res = {};
    const next = () => {
      nextCalled = true;
    };

    verifyAccessToken(req, res, next);
    assert.ok(nextCalled);
    assert.equal(req.user?.id, 'user_456');
    assert.equal(req.user?.role, 'caissier');
  });
});
