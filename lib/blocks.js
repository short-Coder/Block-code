// ブロック定義。k: el=HTML要素 / css=スタイル / ev=イベント / act=動作
export const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const DEFS = {
  h1: { k: 'el', name: '見出し1', tag: 'h1', text: 0, f: [['text', 'こんにちは！']] },
  h2: { k: 'el', name: '見出し2', tag: 'h2', text: 0, f: [['text', 'サブタイトル']] },
  p: { k: 'el', name: '段落', tag: 'p', text: 0, f: [['text', 'ここに文章を書く']] },
  a: { k: 'el', name: 'リンク', tag: 'a', text: 0, attrs: (v) => ` href="${esc(v[1])}"`, f: [['text', 'リンク'], ['text', 'https://example.com']] },
  button: { k: 'el', name: 'ボタン', tag: 'button', text: 0, attrs: () => ' type="button"', f: [['text', '押してね']] },
  img: { k: 'el', name: '画像', tag: 'img', void: true, attrs: (v) => ` src="${esc(v[0])}" alt="${esc(v[1])}"`, f: [['text', 'https://placehold.co/160x100'], ['text', '説明文']] },
  div: { k: 'el', name: '箱(div)', tag: 'div', f: [] },

  bg: { k: 'css', name: '背景色', f: [['color', '#fff4d6']], css: (v) => `background-color: ${v[0]}` },
  color: { k: 'css', name: '文字色', f: [['color', '#333333']], css: (v) => `color: ${v[0]}` },
  size: { k: 'css', name: '文字サイズ', f: [['num', '24']], css: (v) => `font-size: ${v[0]}px` },
  center: { k: 'css', name: '中央寄せ', f: [], css: () => 'text-align: center' },
  radius: { k: 'css', name: '角丸', f: [['num', '12']], css: (v) => `border-radius: ${v[0]}px` },
  pad: { k: 'css', name: '余白', f: [['num', '16']], css: (v) => `padding: ${v[0]}px` },
  flex: { k: 'css', name: '横並び', f: [], css: () => 'display: flex;\n  gap: 12px;\n  justify-content: center' },

  click: { k: 'ev', name: 'クリックしたら', f: [] },

  alert: { k: 'act', name: 'メッセージ表示', f: [['text', 'やったね！']], js: (v) => `alert(${q(v[0])});` },
  settext: { k: 'act', name: '文字を変える', f: [['text', '変わった！']], js: (v) => `this.textContent = ${q(v[0])};` },
  setbg: { k: 'act', name: '背景色を変える', f: [['color', '#ff8080']], js: (v) => `this.style.backgroundColor = ${q(v[0])};` },
  hide: { k: 'act', name: '消す', f: [], js: () => "this.style.display = 'none';" },
};

export const CATS = [
  ['HTML（要素）', 'el'],
  ['CSS（見た目）', 'css'],
  ['JS（イベント）', 'ev'],
  ['JS（動作）', 'act'],
];

// 親(null=ページ直下)に子を入れられるか
export function canDrop(parentType, type) {
  const k = DEFS[type].k;
  if (!parentType) return k === 'el' || k === 'css';
  const pk = DEFS[parentType].k;
  if (pk === 'el') return k === 'css' || k === 'ev' || (k === 'el' && parentType === 'div');
  if (pk === 'ev') return k === 'act';
  return false;
}
