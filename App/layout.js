import './globals.css';

export const metadata = { title: 'ブロックコーダー', description: 'ブロックでHTML・CSS・JSを組み立てるアプリ' };

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
