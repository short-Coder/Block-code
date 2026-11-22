'use client';
import { useMemo, useRef, useState } from 'react';
import { DEFS, CATS, canDrop } from '../lib/blocks';
import { generate } from '../lib/generate';

let uid = 0;
const make = (type, vals, ch = []) => ({ id: 'b' + ++uid, type, vals: vals ?? DEFS[type].f.map((f) => f[1]), ch });

function find(arr, id, par = null) {
  for (const n of arr) {
    if (n.id === id) return { n, arr, par };
    const r = find(n.ch, id, n);
    if (r) return r;
  }
  return null;
}

function sample() {
  return [
    make('theme', ['#3a7f3a', '#f5f7fb']),
    make('header'),
    make('hero'),
    make('features', ['サービス'], [
      make('card'),
      make('card', ['業務効率化', 'AIとITの力で日々の業務を効率化します。']),
      make('card', ['サポート体制', '導入後も安心の充実したサポートを提供します。']),
    ]),
    make('about', ['会社概要'], [
      make('para', ['私たちは最新の技術を活用し、お客様のビジネス課題を解決するIT企業です。']),
      make('para', ['小規模企業から大企業まで、幅広い業種のシステム開発を手がけています。']),
    ]),
    make('footer'),
  ];
}

function Block({ n, c }) {
  const d = DEFS[n.type];
  return (
    <div
      className={`block k-${d.k}${c.sel === n.id ? ' sel' : ''}`}
      draggable
      onDragStart={(e) => { e.stopPropagation(); c.drag.current = { t: 'move', id: n.id }; e.dataTransfer.setData('text/plain', n.id); }}
      onDragEnd={() => { c.drag.current = null; c.setOver(null); }}
    >
      <div className="head" onClick={(e) => { e.stopPropagation(); c.setSel(n.id); }}>
        {d.name}
        {d.f.map(([t, , label], i) => (
          <label key={i} className="fld">
            {label && <span>{label}</span>}
            <input
              type={t === 'color' ? 'color' : 'text'}
              value={n.vals[i]}
              draggable={false}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => c.setField(n.id, i, e.target.value)}
            />
          </label>
        ))}
        <button className="x" onClick={(e) => { e.stopPropagation(); c.remove(n.id); }}>×</button>
      </div>
      {d.box && <Zone parId={n.id} items={n.ch} c={c} />}
    </div>
  );
}

function Zone({ parId, items, c, root }) {
  const key = parId ?? 'root';
  return (
    <div
      className={`${root ? 'root' : 'zone'}${c.over === key ? ' over' : ''}`}
      onDragOver={(e) => { if (!c.drag.current) return; e.preventDefault(); e.stopPropagation(); c.setOver(key); }}
      onDrop={(e) => {
        if (!c.drag.current) return;
        e.preventDefault(); e.stopPropagation();
        const kids = [...e.currentTarget.children].filter((x) => x.classList.contains('block'));
        let i = kids.length;
        for (let k = 0; k < kids.length; k++) {
          const r = kids[k].getBoundingClientRect();
          if (e.clientY < r.top + r.height / 2) { i = k; break; }
        }
        const spec = c.drag.current;
        c.drag.current = null; c.setOver(null);
        c.insert(parId ?? null, i, spec);
      }}
    >
      {root && !items.length && <div className="hint">ここにヘッダー・ヒーローなどの部品を置いてページを組み立てよう。</div>}
      {items.map((n) => <Block key={n.id} n={n} c={c} />)}
    </div>
  );
}

export default function BlockEditor() {
  const [tree, setTree] = useState(sample);
  const [sel, setSel] = useState(null);
  const [over, setOver] = useState(null);
  const [tab, setTab] = useState('pv');
  const [title, setTitle] = useState('IT企業公式サイト');
  const [msg, setMsg] = useState('左のブロックをドラッグ（またはタップ）して組み立てよう');
  const drag = useRef(null);
  const out = useMemo(() => generate(tree, title), [tree, title]);

  const insert = (parId, idx, spec) => {
    const t = structuredClone(tree);
    const par = parId ? find(t, parId).n : null;
    let node;
    if (spec.t === 'new') node = make(spec.key);
    else {
      const f = find(t, spec.id);
      if (!f) return;
      node = f.n;
      if (par && (par.id === node.id || find(node.ch, par.id))) return setMsg('自分の中には入れられません');
    }
    if (!canDrop(par && par.type, node.type)) return setMsg(par ? 'そのブロックはここには入れられません' : 'ここには置けません（要素かCSSだけ）');
    const arr = par ? par.ch : t;
    let i = idx ?? arr.length;
    if (spec.t === 'move') {
      const f = find(t, spec.id);
      const oi = f.arr.indexOf(f.n);
      f.arr.splice(oi, 1);
      if (f.arr === arr && oi < i) i--;
    }
    arr.splice(i, 0, node);
    setSel(node.id);
    setTree(t);
    setMsg('');
  };
  const setField = (id, i, v) => { const t = structuredClone(tree); find(t, id).n.vals[i] = v; setTree(t); };
  const remove = (id) => { const t = structuredClone(tree); const f = find(t, id); f.arr.splice(f.arr.indexOf(f.n), 1); setTree(t); };
  const tapAdd = (key) => {
    const s = sel && find(tree, sel);
    if (s && canDrop(s.n.type, key)) return insert(s.n.id, null, { t: 'new', key });
    if (canDrop(null, key)) return insert(null, null, { t: 'new', key });
    setMsg('先に入れ先のブロックをクリックして選んでね');
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(out[tab === 'pv' ? 'full' : tab]); setMsg('コードをコピーしました'); }
    catch { setMsg('コピーできませんでした'); }
  };

  const c = { sel, setSel, over, setOver, drag, insert, setField, remove };
  const tabs = [['pv', 'プレビュー'], ['full', '完成HTML'], ['html', 'index.html'], ['css', 'style.css'], ['js', 'script.js']];

  return (
    <div className="app">
      <header>
        <h1>🧩 ブロックコーダー</h1>
        <label className="ttl">タイトル <input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <span className="msg">{msg}</span>
        <button className="t" onClick={() => { setTree(sample()); setSel(null); }}>サンプル</button>
        <button className="t" onClick={() => { setTree([]); setSel(null); }}>全消去</button>
        <button className="t" onClick={copy}>コードをコピー</button>
      </header>
      <main>
        <section className="pal">
          {CATS.map(([cat, k]) => (
            <div key={k}>
              <h3>{cat}</h3>
              {Object.keys(DEFS).filter((key) => DEFS[key].k === k).map((key) => (
                <div
                  key={key}
                  className={`block k-${k}`}
                  draggable
                  onDragStart={(e) => { drag.current = { t: 'new', key }; e.dataTransfer.setData('text/plain', key); }}
                  onDragEnd={() => { drag.current = null; setOver(null); }}
                  onClick={() => tapAdd(key)}
                >
                  {DEFS[key].name}
                </div>
              ))}
            </div>
          ))}
        </section>
        <section className="ws"><Zone root items={tree} c={c} /></section>
        <section className="right">
          <div className="tabs">
            {tabs.map(([k, label]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
          </div>
          <div className="view">
            {tab === 'pv'
              ? <iframe title="preview" sandbox="allow-scripts allow-modals" srcDoc={out.full} />
              : <pre>{out[tab]}</pre>}
          </div>
        </section>
      </main>
    </div>
  );
}
