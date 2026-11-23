// CARDS1 helper: budget use at Level 1 and 10 (and at the card's base level) for card ids. node tools/cards1_bud_2026_11_24.js id...
const fs = require('fs'), path = require('path'), SC = require('./skill_costs.js'), ROOT = path.join(__dirname, '..');
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), by = Object.fromEntries(cards.map(c=>[c.id, c]));
exports.T = T; exports.line = (c, Ls)=> (Ls || [1, 5, 10]).map(L=>{ const b = T.budgetAt(c, L, 1); return 'L' + L + ' ' + Math.round(b.x1 / b.N * 100) + '/' + Math.round(b.x2 / b.N2 * 100) + '%' + (b.ok ? '' : '!') + (b.missing && b.missing.length ? ' MISSING ' + b.missing : ''); }).join(' ');
if(require.main === module) process.argv.slice(2).forEach(id=>{ const c = by[id]; console.log(id, c.attack + '/' + c.health, JSON.stringify(c.effects), exports.line(c)); });
