import { DEFS, esc } from './blocks';

const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
const pad = (lines, n) => lines.map((l) => ' '.repeat(n) + l);
const kindOf = (n) => DEFS[n.type].k;

// セクションのid（hero, features, about, about-2 ...）
function nameSections(tree) {
  const count = {}, map = {};
  for (const n of tree) {
    if (kindOf(n) !== 'sec') continue;
    count[n.type] = (count[n.type] || 0) + 1;
    map[n.id] = count[n.type] === 1 ? n.type : `${n.type}-${count[n.type]}`;
  }
  return map;
}

// ナビはヒーロー・サービス・テキストから自動で作る
const navOf = (tree, ids) =>
  tree
    .filter((n) => ['hero', 'features', 'about'].includes(n.type))
    .map((n) => ({ href: '#' + ids[n.id], label: n.type === 'hero' ? 'ホーム' : n.vals[0] }));

function sectionHtml(n, id, ctx) {
  const v = n.vals.map(esc);
  const li = (ind) => pad(ctx.nav.map((m) => `<li><a href="${m.href}">${esc(m.label)}</a></li>`), ind);
  switch (n.type) {
    case 'header':
      return [
        '<!-- Header -->', '<header class="header" id="header">', '  <div class="container header-inner">',
        `    <h1 class="site-title">${v[0]}</h1>`, '    <nav class="nav" aria-label="メインメニュー">', '      <ul class="nav-list">',
        ...li(8), '      </ul>', '    </nav>',
        '    <button class="menu-btn" id="menuBtn" type="button" aria-label="メニューを開く" aria-expanded="false">☰</button>',
        '  </div>', '</header>', '',
        '<!-- Mobile Menu -->', '<nav class="mobile-nav" id="mobileNav" aria-label="モバイルメニュー">', '  <ul>', ...li(4), '  </ul>', '</nav>',
      ];
    case 'hero':
      return [
        '<!-- Hero Section -->', `<section id="${id}" class="hero">`, '  <div class="container hero-inner">',
        `    <h2 class="hero-title">${v[0]}</h2>`, '    <p class="hero-text">', `      ${v[1]}`, '    </p>',
        `    <a href="${ctx.cta}" class="cta-btn">${v[2]}</a>`, '  </div>', '</section>',
      ];
    case 'features':
      return [
        '<!-- Features Section -->', `<section id="${id}" class="features">`, '  <div class="container">',
        `    <h3 class="section-title">${v[0]}</h3>`, '    <div class="cards">',
        ...n.ch.flatMap((c) => pad(['<div class="card">', `  <h4>${esc(c.vals[0])}</h4>`, `  <p>${esc(c.vals[1])}</p>`, '</div>'], 6)),
        '    </div>', '  </div>', '</section>',
      ];
    case 'about':
      return [
        '<!-- About Section -->', `<section id="${id}" class="about">`, '  <div class="container">',
        `    <h3 class="section-title">${v[0]}</h3>`,
        ...n.ch.flatMap((c) => pad(['<p>', `  ${esc(c.vals[0])}`, '</p>'], 4)),
        '  </div>', '</section>',
      ];
    case 'footer':
      return [
        '<!-- Footer -->', '<footer class="footer">', '  <div class="container footer-inner">', `    <p>${v[0]}</p>`,
        '    <ul class="footer-links">', ...li(6), '    </ul>', '  </div>', '</footer>',
      ];
    default:
      return [];
  }
}

function genBody(tree, ids, nav) {
  const first = tree.find((n) => ['features', 'about'].includes(n.type));
  const ctx = { nav, cta: first ? '#' + ids[first.id] : '#' };
  return tree
    .filter((n) => kindOf(n) === 'sec')
    .map((n) => sectionHtml(n, ids[n.id], ctx).join('\n'))
    .join('\n\n');
}

function genCss(tree) {
  const has = (t) => tree.some((n) => n.type === t);
  const theme = tree.find((n) => n.type === 'theme');
  const main = theme ? theme.vals[0] : '#3a7f3a';
  const bg = theme ? theme.vals[1] : '#f5f7fb';
  const parts = [];
  const mobile = [];

  parts.push(`:root {
  --main: ${main};
  --main-dark: color-mix(in srgb, var(--main) 75%, black);
  --main-light: color-mix(in srgb, var(--main) 12%, white);
  --bg: ${bg};
  --text: #333333;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: system-ui, "Hiragino Sans", "Noto Sans JP", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.container {
  width: 90%;
  max-width: 1100px;
  margin: 0 auto;
}

section[id] {
  scroll-margin-top: 70px;
}`);

  if (has('header')) {
    parts.push(`/* Header */
.header {
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
  padding: 15px 0;
  background: var(--main);
  color: #fff;
  transition: background 0.3s;
}

.header.scrolled {
  background: var(--main-dark);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  margin: 0;
  font-size: 1.6rem;
}

.nav-list {
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-list a {
  color: #fff;
  font-weight: bold;
  text-decoration: none;
}

.menu-btn {
  display: none;
  border: none;
  background: none;
  color: #fff;
  font-size: 1.8rem;
  cursor: pointer;
}

/* Mobile Nav */
.mobile-nav {
  display: none;
  position: fixed;
  top: 64px;
  z-index: 99;
  width: 100%;
  background: var(--main);
}

.mobile-nav.open {
  display: block;
}

.mobile-nav ul {
  margin: 0;
  padding: 10px;
  list-style: none;
}

.mobile-nav a {
  display: block;
  padding: 12px;
  color: #fff;
  text-decoration: none;
}`);
    mobile.push('  .nav-list {\n    display: none;\n  }', '  .menu-btn {\n    display: block;\n  }');
  }
  if (has('hero')) {
    parts.push(`/* Hero */
.hero {
  padding: ${has('header') ? '120px' : '80px'} 0 80px;
  background: var(--main-light);
  text-align: center;
}

.hero-title {
  margin-bottom: 15px;
  font-size: 2.2rem;
}

.hero-text {
  max-width: 700px;
  margin: 0 auto 25px;
}

.cta-btn {
  display: inline-block;
  padding: 12px 25px;
  border-radius: 5px;
  background: var(--main);
  color: #fff;
  text-decoration: none;
}`);
  }
  if (has('features') || has('about')) {
    parts.push(`.section-title {
  margin-bottom: 40px;
  text-align: center;
  font-size: 1.8rem;
}`);
  }
  if (has('features')) {
    parts.push(`/* Features */
.features {
  padding: 60px 0;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1;
  min-width: 260px;
  padding: 25px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}`);
    mobile.push('  .cards {\n    flex-direction: column;\n  }');
  }
  if (has('about')) {
    parts.push(`/* About */
.about {
  padding: 60px 0;
  background: color-mix(in srgb, var(--main) 6%, white);
}`);
  }
  if (has('footer')) {
    parts.push(`/* Footer */
.footer {
  padding: 20px 0;
  background: var(--main);
  color: #fff;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 15px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
}`);
  }
  if (mobile.length) parts.push(`/* Responsive */\n@media (max-width: 768px) {\n${mobile.join('\n\n')}\n}`);
  return parts.join('\n\n') + '\n';
}

function genJs(tree) {
  if (!tree.some((n) => n.type === 'header')) return '';
  return `'use strict';

const header = document.getElementById('header');
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

// モバイルメニューの開閉
menuBtn.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

// メニュー内のリンクを押したら閉じる
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// スクロールしたらヘッダーの色を変える
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});
`;
}

export function generate(tree, title) {
  const ids = nameSections(tree);
  const nav = navOf(tree, ids);
  const body = genBody(tree, ids, nav);
  const css = genCss(tree);
  const js = genJs(tree);
  const head = [
    '    <meta charset="UTF-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `    <title>${esc(title || 'マイページ')}</title>`,
  ];
  const tail = ['  </body>', '</html>', ''];

  const full = [
    '<!DOCTYPE html>', '<html lang="ja">', '  <head>', ...head,
    '    <style>', indent(css.trimEnd(), 6), '    </style>', '  </head>', '  <body>',
    indent(body, 4),
    ...(js ? ['', '    <script>', indent(js.trimEnd(), 6), '    </script>'] : []),
    ...tail,
  ].join('\n');

  const html = [
    '<!DOCTYPE html>', '<html lang="ja">', '  <head>', ...head,
    '    <link rel="stylesheet" href="style.css">', '  </head>', '  <body>',
    indent(body, 4),
    ...(js ? ['', '    <script src="script.js"></script>'] : []),
    ...tail,
  ].join('\n');

  return { full, html, css, js: js || '// このページにはJavaScriptはありません\n' };
}
