mocha.setup({
  ui: 'bdd',
  reporter: 'tap'
});

function assert(expr, msg) {
  if (!expr) throw new Error(msg || 'failed');
}