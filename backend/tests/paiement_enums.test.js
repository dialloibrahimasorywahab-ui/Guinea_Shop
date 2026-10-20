import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPaiementSchema } from '../paiement/paiement.validator.js';
import { MODES_PAIEMENT, STATUTS_PAIEMENT } from '../common/constants.js';

describe('Vérification Normalisation des Enums Paiement (C4, V4)', () => {
  it('C4: MODES_PAIEMENT contient les valeurs canoniques standardisées', () => {
    assert.ok(MODES_PAIEMENT.includes('espèces'));
    assert.ok(MODES_PAIEMENT.includes('mobile_money'));
    assert.ok(!MODES_PAIEMENT.includes('espèce')); // Ne doit plus exister
    assert.ok(!MODES_PAIEMENT.includes('Mobile Money')); // Ne doit plus exister
  });

  it('C4: STATUTS_PAIEMENT contient validé avec accent et échoué', () => {
    assert.ok(STATUTS_PAIEMENT.includes('validé'));
    assert.ok(STATUTS_PAIEMENT.includes('échoué'));
    assert.ok(STATUTS_PAIEMENT.includes('en_attente'));
    assert.ok(!STATUTS_PAIEMENT.includes('valide')); // Sans accent banni
  });

  it('C4: createPaiementSchema rejette "espèce" et accepte "espèces"', async () => {
    const paiementInvalide = {
      vente_id: '671234567890abcdef123456',
      montant: 50000,
      modePaiement: 'espèce', // Invalide
      statut: 'validé',
    };

    await assert.rejects(
      async () => await createPaiementSchema.validate(paiementInvalide),
      /Mode de paiement non valide/
    );

    const paiementValide = {
      vente_id: '671234567890abcdef123456',
      montant: 50000,
      modePaiement: 'espèces', // Valide
      statut: 'validé',
    };

    const result = await createPaiementSchema.validate(paiementValide);
    assert.equal(result.modePaiement, 'espèces');
    assert.equal(result.statut, 'validé');
  });
});
