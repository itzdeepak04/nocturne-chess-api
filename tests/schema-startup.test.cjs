const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');

test('application modules can be imported without schema reflection errors', () => {
  assert.doesNotThrow(() => require('../dist/app.module'));
});

test('match result is a nullable string with a null default', () => {
  const { MatchSchema } = require('../dist/modules/matches/schemas/match.schema');
  const mongoose = require('mongoose');
  const Model = mongoose.model('SchemaStartupMatch', MatchSchema);
  assert.equal(MatchSchema.path('result').instance, 'String');
  const match = new Model({ code: 'ABC123', white: new mongoose.Types.ObjectId(), fen: 'test' });
  assert.equal(match.result, null);
  assert.equal(match.validateSync(), undefined);
  match.result = '1-0';
  assert.equal(match.result, '1-0');
  assert.equal(match.validateSync(), undefined);
  mongoose.deleteModel('SchemaStartupMatch');
});
