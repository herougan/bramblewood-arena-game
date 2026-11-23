// CARDS1 (2026-11-24): load / dump canonical/cards.json in the file's own format.
const fs = require('fs'), P = require('path').join(__dirname, '..', 'canonical', 'cards.json');
exports.load = ()=> JSON.parse(fs.readFileSync(P, 'utf8'));
exports.save = cards=> fs.writeFileSync(P, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
exports.note = (c, s)=>{ c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + s; };
