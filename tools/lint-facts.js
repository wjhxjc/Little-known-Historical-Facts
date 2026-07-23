#!/usr/bin/env node
// tools/lint-facts.js — 校验 js/facts.js 数据规范。用法: node tools/lint-facts.js
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'facts.js'), 'utf8');
const ctx = { window: {} };
new Function('window', src).call(ctx.window, ctx.window);
const FACTS = ctx.window.FACTS;
if (!Array.isArray(FACTS)) { console.error('FATAL: window.FACTS 不是数组'); process.exit(1); }

const DYNASTY_OK = ['先秦','秦','汉','魏晋南北朝','隋唐','五代十国','宋','元','明','清'];
const CAT_OK = ['帝王将相','风俗生活','文人轶事','战争军事','文化典籍','美食风物'];
const FIELDS = ['id','title','dynasty','category','summary','content','tags','source'];
let errs = [];
const seen = {};
FACTS.forEach((f, i) => {
  const where = '#' + (i+1) + ' (' + (f.id || '?') + ')';
  FIELDS.forEach(k => { if (f[k] == null) errs.push(where + ' 缺字段 ' + k); });
  if (f.id) { if (seen[f.id]) errs.push(where + ' id 重复: ' + f.id); seen[f.id] = 1; }
  if (f.dynasty && DYNASTY_OK.indexOf(f.dynasty) < 0) errs.push(where + ' dynasty 非法: ' + f.dynasty);
  if (f.category && CAT_OK.indexOf(f.category) < 0) errs.push(where + ' category 非法: ' + f.category);
  if (typeof f.content === 'string') {
    const n = f.content.length;
    if (n < 150) errs.push(where + ' 正文过短 ' + n + ' 字');
    if (n > 320) errs.push(where + ' 正文过长 ' + n + ' 字');
  }
  if (typeof f.summary === 'string') {
    const n = f.summary.length;
    if (n < 20 || n > 80) errs.push(where + ' summary 长度异常 ' + n + ' 字');
  }
  if (typeof f.source !== 'string' || f.source.trim() === '') errs.push(where + ' source 为空');
});
const byDyn = {};
FACTS.forEach(f => { byDyn[f.dynasty] = (byDyn[f.dynasty]||0) + 1; });
console.log('总条目:', FACTS.length);
console.log('朝代分布:', JSON.stringify(byDyn));
if (errs.length) { console.error('\n发现 ' + errs.length + ' 个问题:'); errs.forEach(e => console.error('  - ' + e)); process.exit(1); }
console.log('\n校验通过 ✓');
