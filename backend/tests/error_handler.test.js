import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NotFoundError, ConflictError, AppError } from '../common/errors.js';
import errorHandler from '../common/middleware/errorHandler.js';

describe('Vérification du Middleware Global de Traitement des Erreurs (T6.5, V8)', () => {
  const createMockRes = () => {
    let statusCode = 200;
    let jsonBody = null;
    return {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
      get statusCode() { return statusCode; },
      get jsonBody() { return jsonBody; },
    };
  };

  it('Gère NotFoundError avec code 404', () => {
    const res = createMockRes();
    const err = new NotFoundError('Article introuvable');
    errorHandler(err, {}, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.equal(res.jsonBody?.success, false);
    assert.equal(res.jsonBody?.message, 'Article introuvable');
    assert.equal(res.jsonBody?.code, 'NOT_FOUND');
  });

  it('Gère ConflictError avec code 409', () => {
    const res = createMockRes();
    const err = new ConflictError('Stock insuffisant');
    errorHandler(err, {}, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.equal(res.jsonBody?.success, false);
    assert.equal(res.jsonBody?.message, 'Stock insuffisant');
    assert.equal(res.jsonBody?.code, 'CONFLICT');
  });

  it('Gère les erreurs MongoDB Duplicate Key (code 11000) en 409', () => {
    const res = createMockRes();
    const mongoErr = new Error('E11000 duplicate key error');
    mongoErr.code = 11000;
    mongoErr.keyValue = { email: 'admin@ghmaick.com' };

    errorHandler(mongoErr, {}, res, () => {});
    assert.equal(res.statusCode, 409);
    assert.equal(res.jsonBody?.code, 'DUPLICATE_KEY_CONFLICT');
    assert.ok(res.jsonBody?.message.includes('admin@ghmaick.com'));
  });

  it('Gère les erreurs CastError MongoDB en 400', () => {
    const res = createMockRes();
    const castErr = new Error('Cast to ObjectId failed');
    castErr.name = 'CastError';
    castErr.path = '_id';
    castErr.value = 'invalid-id';

    errorHandler(castErr, {}, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonBody?.code, 'INVALID_ID_FORMAT');
  });
});
