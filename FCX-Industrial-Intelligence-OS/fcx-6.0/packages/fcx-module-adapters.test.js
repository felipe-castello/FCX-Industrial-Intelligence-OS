const assert = require('node:assert/strict');
const test = require('node:test');
const { runSkill } = require('./fcx-agent-skills-adapter/src');
const { createPipeline } = require('./fcx-langchain-adapter/src');
const { syncConnector } = require('./fcx-nango-adapter/src');
const { analyzeQuant } = require('./fcx-quantdinger-adapter/src');
const { ingestDocument } = require('./fcx-knowledge-adapter/src');
const { createChatSession } = require('./fcx-librechat-adapter/src');

test('agent skills adapter retorna fallback quando flag desligada', () => {
  process.env.ENABLE_AGENT_SKILLS = 'false';
  assert.equal(runSkill({ skill: 'industrial-intelligence' }).status, 'fallback');
});

test('langchain adapter fica ativo por padrao', () => {
  delete process.env.ENABLE_LANGCHAIN;
  assert.equal(createPipeline({ pipeline: 'rag' }).status, 'ready');
});

test('nango adapter retorna fallback quando flag desligada', () => {
  process.env.ENABLE_NANGO = 'false';
  assert.equal(syncConnector({ connector: 'gmail' }).status, 'fallback');
});

test('quantdinger bloqueia modo real', () => {
  assert.equal(analyzeQuant({ mode: 'live' }).decision, 'BLOCK');
});

test('knowledge adapter retorna fallback quando flag desligada', () => {
  process.env.ENABLE_UNDERSTAND_ANYTHING = 'false';
  assert.equal(ingestDocument({ source: 'manual.pdf' }).status, 'fallback');
});

test('librechat adapter retorna fallback quando flag desligada', () => {
  process.env.ENABLE_LIBRECHAT = 'false';
  assert.equal(createChatSession({ user: 'admin' }).status, 'fallback');
});
