// ブロック定義。k: sec=ページの部品 / item=部品の中身 / theme=設定
// f: [入力タイプ, 初期値, ラベル]
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const DEFS = {
  theme: { k: 'theme', name: 'テーマ色', f: [['color', '#3a7f3a', 'メイン色'], ['color', '#f5f7fb', '背景色']] },

  header: { k: 'sec', name: 'ヘッダー', f: [['text', 'IT企業公式サイト', 'サイト名']] },
  hero: {
    k: 'sec', name: 'ヒーロー',
    f: [
      ['text', 'IT企業公式サイトへようこそ', 'タイトル'],
      ['text', '私たちは最新の技術を活用し、お客様のビジネス課題を解決するIT企業です。', '説明'],
      ['text', 'サービスを見る', 'ボタン'],
    ],
  },
  features: { k: 'sec', name: 'サービス一覧', box: 'card', f: [['text', 'サービス', '見出し']] },
  about: { k: 'sec', name: 'テキスト（会社概要）', box: 'para', f: [['text', '会社概要', '見出し']] },
  footer: { k: 'sec', name: 'フッター', f: [['text', '© 2026 IT企業公式サイト', 'コピーライト']] },

  card: { k: 'item', name: 'カード', f: [['text', 'クラウド開発', 'タイトル'], ['text', '安全で拡張性の高いクラウドシステムを構築します。', '説明']] },
  para: { k: 'item', name: '段落', f: [['text', 'ここに文章を書きます。', '文章']] },
};

export const CATS = [
  ['ページの部品', 'sec'],
  ['中身（カード・段落）', 'item'],
  ['設定', 'theme'],
];

// 親(null=ページ直下)に子を入れられるか
export function canDrop(parentType, type) {
  const k = DEFS[type].k;
  if (!parentType) return k === 'sec' || k === 'theme';
  return DEFS[parentType].box === type;
}
