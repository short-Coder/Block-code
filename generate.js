import { DEFS, esc } from './blocks';

const kind = (n) => DEFS[n.type].k;
const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

// 要素に id（例: button-1）を順番に割り当てる
function nameAll(nodes, counts = {}, map = {}) {
  for (const n of nodes) {
    if (kind(n) !== 'el') continue;
    counts[n.type] = (counts[n.type] || 0) + 1;
    map[n.id] = `${n.type}-${counts[n.type]}`;
    nameAll(n.ch, counts, map);
  }
  return map;
}

function genHtml(nodes, depth, names) {
  const pad = '  '.repeat(depth);
  return nodes
    .filter((n) => kind(n) === 'el')
    .map((n) => {
      const d = DEFS[n.type];
      const attrs = ` id="${names[n.id]}"` + (d.attrs ? d.attrs(n.vals) : '');
      if (d.void) return `${pad}<${d.tag}${attrs}>`;
      const text = d.text != null ? esc(n.vals[d.text]) : '';
      const kids = genHtml(n.ch, depth + 1, names);
      return kids
        ? `${pad}<${d.tag}${attrs}>${text}\n${kids}\n${pad}</${d.tag}>`
        : `${pad}<${d.tag}${attrs}>${text}</${d.tag}>`;
    })
    .join('\n');
}

const rule = (selector, decls) => (decls.length ? `${selector} {\n  ${decls.join(';\n  ')};\n}\n` : '');

function genCss(tree, names) {
  const own = (nodes) => nodes.filter((n) => kind(n) === 'css').map((n) => DEFS[n.type].css(n.vals));
  const walk = (nodes) =>
    nodes
      .filter((n) => kind(n) === 'el')
      .map((n) => '\n' + rule('#' + names[n.id], own(n.ch)) + walk(n.ch))
      .join('');
  const base = '*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n';
  const body = rule('body', ['font-family: system-ui, sans-serif', ...own(tree)]);
  return (base + '\n' + body + walk(tree)).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function genJs(nodes, names) {
  let s = '';
  for (const n of nodes.filter((x) => kind(x) === 'el')) {
    const v = names[n.id].replace('-', '_');
    const evs = n.ch.filter((c) => kind(c) === 'ev');
    if (evs.length) {
      s += `const ${v} = document.getElementById('${names[n.id]}');\n`;
      for (const ev of evs) {
        const body = ev.ch.length ? ev.ch.map((a) => '  ' + DEFS[a.type].js(a.vals)).join('\n') : '  // ここに処理を追加';
        s += `${v}.addEventListener('click', function () {\n${body}\n});\n\n`;
      }
    }
    s += genJs(n.ch, names);
  }
  return s;
}

export function generate(tree, title) {
  const names = nameAll(tree);
  const body = genHtml(tree, 2, names);
  const css = genCss(tree, names);
  const jsBody = genJs(tree, names).trim();
  const js = jsBody ? `'use strict';\n\n${jsBody}\n` : '';
  const t = esc(title || 'マイページ');
  const meta = `    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${t}</title>`;

  // 1ファイル完成版
  const full = [
    '<!DOCTYPE html>',
    '<html lang="ja">',
    '  <head>',
    meta,
    '    <style>',
    indent(css.trimEnd(), 6),
    '    </style>',
    '  </head>',
    '  <body>',
    body,
    js ? `    <script>\n${indent(js.trimEnd(), 6)}\n    </script>` : '',
    '  </body>',
    '</html>',
  ].filter((l) => l !== '').join('\n') + '\n';

  // 3ファイル分割版の index.html
  const html = [
    '<!DOCTYPE html>',
    '<html lang="ja">',
    '  <head>',
    meta,
    '    <link rel="stylesheet" href="style.css">',
    js ? '    <script src="script.js" defer></script>' : '',
    '  </head>',
    '  <body>',
    body,
    '  </body>',
    '</html>',
  ].filter((l) => l !== '').join('\n') + '\n';

  return { full, html, css, js: js || '// まだ処理がありません\n' };
}
