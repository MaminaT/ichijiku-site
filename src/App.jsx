import { useState, useEffect, useRef } from "react";

// ============================================================
// 定数・設定
// ============================================================
const HARVEST_MONTH = 7;  // 8月 (0-indexed)
const HARVEST_DAY   = 20;
const HARVEST_HOUR  = 6;
const SEASON_END_MONTH = 9; // 10月
const SEASON_END_DAY   = 31;

const MONTHS_JP = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

const PRODUCTS = [
  {
    id: 1,
    grade: "PREMIUM GRADE",
    name: "安城いちじく 特選品",
    desc: "最も糖度の高い選りすぐりの果実。贈り物や特別な日に。",
    price: "¥3,500",
    unit: "/6粒入（税込）",
    popular: false,
    bgColor: "linear-gradient(145deg,#f0e0d0,#e0c8b0)",
  },
  {
    id: 2,
    grade: "STANDARD GRADE",
    name: "安城いちじく 2個入りセット",
    desc: "日常に贅沢をプラス。手頃な食べきりサイズ。",
    price: "¥2,200",
    unit: "/12粒入（税込）",
    popular: true,
    bgColor: "linear-gradient(145deg,#edd8c0,#d8c0a0)",
  },
  {
    id: 3,
    grade: "GIFT BOX",
    name: "安城いちじく ギフトセット",
    desc: "専用木箱入りで高級感あふれる大切な方への贈り物に。",
    price: "¥5,800",
    unit: "/木箱入り（税込）",
    popular: false,
    bgColor: "linear-gradient(145deg,#e8f0e0,#d0e0c0)",
  },
];

const SEASON_MONTHS = [
  { name: "JUN", label: "準備中",   fill: 0,   type: "off"  },
  { name: "JUL", label: "準備中",   fill: 0,   type: "off"  },
  { name: "AUG", label: "収穫開始", fill: 60,  type: "on"   },
  { name: "SEP", label: "🌟 最盛期", fill: 100, type: "peak" },
  { name: "OCT", label: "収穫終盤", fill: 40,  type: "on"   },
  { name: "NOV", label: "終了",     fill: 0,   type: "off"  },
];

// ============================================================
// カウントダウン hooks
// ============================================================
function useCountdown() {
  const [countdown, setCountdown] = useState({ days:"—", hours:"—", mins:"—", secs:"—", inSeason: false, harvestDateStr:"——" });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const y   = now.getFullYear();
      let harvest  = new Date(y, HARVEST_MONTH, HARVEST_DAY, HARVEST_HOUR, 0, 0);
      const end    = new Date(y, SEASON_END_MONTH, SEASON_END_DAY, 23, 59, 59);

      let inSeason = now >= harvest && now <= end;
      if (now > end) harvest = new Date(y + 1, HARVEST_MONTH, HARVEST_DAY, HARVEST_HOUR, 0, 0);

      const dateStr = `${harvest.getFullYear()}年${MONTHS_JP[harvest.getMonth()]}${harvest.getDate()}日`;

      if (inSeason) {
        setCountdown({ days:"–", hours:"–", mins:"–", secs:"–", inSeason: true, harvestDateStr: dateStr });
        return;
      }

      const diff = harvest - now;
      const s    = Math.max(0, Math.floor(diff / 1000));
      const pad  = (n) => String(n).padStart(2, "0");
      setCountdown({
        days:  pad(Math.floor(s / 86400)),
        hours: pad(Math.floor((s % 86400) / 3600)),
        mins:  pad(Math.floor((s % 3600)  / 60)),
        secs:  pad(s % 60),
        inSeason: false,
        harvestDateStr: dateStr,
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return countdown;
}

// ============================================================
// カート hooks
// ============================================================
function useCart() {
  const [toast, setToast]   = useState(null);
  const timerRef = useRef(null);

  function addToCart(name) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(name);
    timerRef.current = setTimeout(() => setToast(null), 3000);
  }

  return { toast, addToCart };
}

// ============================================================
// ハンバーガーメニュー hooks
// ============================================================
function useMenu() {
  const [open, setOpen] = useState(false);
  function toggle() { setOpen(v => !v); }
  function close()  { setOpen(false);  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return { open, toggle, close };
}

// ============================================================
// スクロールナビ shadow hooks
// ============================================================
function useNavShadow() {
  const [shadow, setShadow] = useState(false);
  useEffect(() => {
    const handler = () => setShadow(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return shadow;
}

// ============================================================
// シーズンバー animation hooks
// ============================================================
function useSeasonBars() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 600);
    return () => clearTimeout(id);
  }, []);
  return animated;
}

// ============================================================
// ヒーロー画像コンポーネント
// 画像ファイル: public/images/hero.jpg
// ============================================================
function HeroImage() {
  return (
    <img
      src="/images/hero.jpg"
      alt="安城いちじく"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 260,
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
      }}
    />
  );
}

// ============================================================
// App コンポーネント
// ============================================================
export default function App() {
  const countdown  = useCountdown();
  const { toast, addToCart } = useCart();
  const { open: menuOpen, toggle: toggleMenu, close: closeMenu } = useMenu();
  const navShadow  = useNavShadow();
  const barsAnim   = useSeasonBars();
  const [cartedIds, setCartedIds] = useState([]);

  function handleCart(product) {
    addToCart(product.name);
    setCartedIds(prev => [...prev, product.id]);
    setTimeout(() => setCartedIds(prev => prev.filter(id => id !== product.id)), 3000);
  }

  const navLinks = [
    { href: "#features", label: "特長"      },
    { href: "#story",    label: "ストーリー" },
    { href: "#products", label: "商品一覧"  },
    { href: "#season",   label: "収穫情報"  },
  ];

  return (
    <div style={{ fontFamily:"'Shippori Mincho', serif", background:"#faf5ee", color:"#4a2317", overflowX:"hidden" }}>

      {/* ===== NAV ===== */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0.9rem 1.5rem",
        background:"rgba(250,245,238,0.95)",
        backdropFilter:"blur(8px)",
        borderBottom:"1px solid rgba(74,35,23,0.15)",
        boxShadow: navShadow ? "0 2px 16px rgba(74,35,23,0.08)" : "none",
        transition:"box-shadow 0.3s",
      }}>
        <a href="#" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"1.05rem", fontWeight:300, letterSpacing:"0.22em", color:"#4a2317", textDecoration:"none" }}>
          <span style={{ fontWeight:600 }}>安城</span> ICHIJIKU
        </a>

        {/* Desktop links */}
        <ul style={{ display:"flex", gap:"2rem", listStyle:"none", alignItems:"center" }}
          className="desktop-nav">
          {navLinks.map(l => (
            <li key={l.href}>
              <a href={l.href} style={{ fontSize:"0.78rem", letterSpacing:"0.13em", color:"#7d3c1e", textDecoration:"none" }}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#buy" style={{ background:"#4a2317", color:"#faf5ee", padding:"0.45rem 1.1rem", borderRadius:2, fontSize:"0.78rem", letterSpacing:"0.1em", textDecoration:"none" }}>
              ご購入はこちら
            </a>
          </li>
        </ul>

        {/* Hamburger */}
        <button onClick={toggleMenu} aria-label="メニュー"
          style={{ display:"none", flexDirection:"column", gap:5, background:"none", border:"none", cursor:"pointer", padding:6, zIndex:210 }}
          className="hamburger-btn">
          {[0,1,2].map(i => (
            <span key={i} style={{
              display:"block", width:24, height:1.5, background:"#4a2317",
              transition:"all 0.3s", transformOrigin:"center",
              transform: menuOpen
                ? i===0 ? "translateY(6.5px) rotate(45deg)" : i===2 ? "translateY(-6.5px) rotate(-45deg)" : "scaleX(0)"
                : "none",
              opacity: menuOpen && i===1 ? 0 : 1,
            }}/>
          ))}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div onClick={closeMenu} style={{
        position:"fixed", inset:0, zIndex:190,
        background:"#faf5ee",
        display: menuOpen ? "flex" : "none",
        flexDirection:"column", justifyContent:"center", alignItems:"center", gap:"2rem",
      }}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} onClick={closeMenu}
            style={{ fontSize:"1.3rem", letterSpacing:"0.15em", color:"#4a2317", textDecoration:"none" }}>
            {l.label}
          </a>
        ))}
        <a href="#buy" onClick={closeMenu}
          style={{ background:"#4a2317", color:"#faf5ee", padding:"0.9rem 3rem", fontSize:"1rem", letterSpacing:"0.15em", textDecoration:"none", marginTop:"0.5rem" }}>
          ご購入はこちら
        </a>
      </div>

      {/* ===== HERO ===== */}
      <section style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:"100vh", paddingTop:60 }} className="hero-grid">
        <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", padding:"4rem 3rem 4rem 4rem" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", letterSpacing:"0.32em", color:"#6b7c5e", textTransform:"uppercase", marginBottom:"1.2rem" }}>
            ANJO, AICHI — SINCE 1950
          </p>
          <h1 style={{ fontSize:"clamp(2.4rem,4.5vw,4rem)", fontWeight:600, lineHeight:1.25, letterSpacing:"-0.02em", marginBottom:"0.5rem", color:"#4a2317" }}>
            愛知が誇る<br/>最高の恵み
          </h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1rem,2vw,1.4rem)", fontStyle:"italic", fontWeight:300, color:"#c06030", letterSpacing:"0.06em", marginBottom:"2rem" }}>
            Anjo Premium Figs
          </p>
          <p style={{ fontSize:"0.88rem", color:"#7d3c1e", lineHeight:2, maxWidth:360, marginBottom:"2.5rem" }}>
            安城の肥沃な大地と温暖な気候が育んだ、とろける甘さのいちじく。長年の農家の技と情熱が、一粒ひとつぶに込められています。
          </p>
          <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap" }}>
            <a href="#buy" style={{ background:"#4a2317", color:"#faf5ee", padding:"0.85rem 2rem", fontFamily:"inherit", fontSize:"0.82rem", letterSpacing:"0.18em", textDecoration:"none", display:"inline-block" }}>
              今すぐ注文する
            </a>
            <a href="#story" style={{ background:"transparent", color:"#4a2317", padding:"0.85rem 2rem", border:"1px solid rgba(74,35,23,0.15)", fontFamily:"inherit", fontSize:"0.82rem", letterSpacing:"0.1em", textDecoration:"none", display:"inline-block" }}>
              ブランドの物語
            </a>
          </div>
        </div>
        <div style={{ position:"relative", overflow:"hidden", minHeight:400 }}>
          <HeroImage />
        </div>
      </section>

      {/* ===== COUNTDOWN ===== */}
      <div style={{ background:"#4a2317", color:"#faf5ee", padding:"2.5rem 4rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"2rem", flexWrap:"wrap" }} className="countdown-wrap">
        <div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.68rem", letterSpacing:"0.28em", color:"#d4a056", textTransform:"uppercase", marginBottom:"0.4rem" }}>
            Harvest Countdown
          </p>
          <p style={{ fontSize:"1.15rem", fontWeight:500, letterSpacing:"0.04em" }}>
            {countdown.inSeason ? "🍂 現在 収穫・販売シーズン中！" : "🌿 今年の収穫まで、あと——"}
          </p>
        </div>

        <div style={{ display:"flex", gap:"1.2rem", alignItems:"flex-end" }}>
          {[
            { val: countdown.days,  label:"日" },
            { val: countdown.hours, label:"時間" },
            { val: countdown.mins,  label:"分" },
            { val: countdown.secs,  label:"秒" },
          ].map((u, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-end", gap: i < 3 ? "1.2rem" : 0 }}>
              <div style={{ textAlign:"center" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"3rem", fontWeight:300, lineHeight:1, color:"#d4a056", display:"block", minWidth:"3.5rem" }}>
                  {u.val}
                </span>
                <div style={{ fontSize:"0.62rem", letterSpacing:"0.18em", color:"rgba(250,245,238,0.55)", marginTop:"0.3rem" }}>{u.label}</div>
              </div>
              {i < 3 && <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem", fontWeight:300, color:"#d4a056", opacity:0.4, lineHeight:1, paddingBottom:"0.55rem" }}>:</span>}
            </div>
          ))}
        </div>

        <div style={{ textAlign:"right" }}>
          <div style={{ display:"inline-block", padding:"0.28rem 0.75rem", border:"1px solid #d4a056", color:"#d4a056", fontSize:"0.65rem", letterSpacing:"0.18em", marginBottom:"0.4rem" }}>
            {countdown.inSeason ? "販売中 ON SALE" : "PRE-ORDER OPEN"}
          </div>
          <p style={{ fontSize:"0.8rem", color:"rgba(250,245,238,0.65)" }}>
            収穫予定日：<strong>{countdown.harvestDateStr}</strong>
          </p>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding:"5rem 4rem" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", letterSpacing:"0.28em", color:"#6b7c5e", textTransform:"uppercase", marginBottom:"0.8rem" }}>Why Anjo Ichijiku</p>
        <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:600, lineHeight:1.35, color:"#4a2317", marginBottom:"1.2rem" }}>選ばれ続ける理由</h2>
        <div style={{ width:"3rem", height:1, background:"#c06030", marginBottom:"1.8rem" }}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", border:"1px solid rgba(74,35,23,0.15)", marginTop:"3rem" }} className="features-grid">
          {[
            { num:"01", icon:"🌾", title:"豊穣の大地",   text:"愛知県安城市は「日本のデンマーク」とも呼ばれる農業先進地。豊かな土壌と安定した気候が、いちじくの糖度と風味を最大限に引き出します。" },
            { num:"02", icon:"🤲", title:"熟練の職人技", text:"地元農家が一粒ひとつぶ手作業で丁寧に収穫。完熟のタイミングを見極める熟練の目が、最高品質を保証します。" },
            { num:"03", icon:"🍯", title:"極上の甘み",   text:"糖度18度以上を誇る安城いちじくは、濃厚でとろける甘さが特長。ポリフェノールや食物繊維も豊富で、美容と健康にも贈りものです。" },
            { num:"04", icon:"📦", title:"産地直送",     text:"収穫当日に丁寧にパッキングし、新鮮なまま全国へお届け。朝採れいちじくの感動をそのままテーブルへ。" },
          ].map((f, i) => (
            <div key={i} style={{
              padding:"2.5rem",
              borderRight:   i % 2 === 0 ? "1px solid rgba(74,35,23,0.15)" : "none",
              borderBottom:  i < 2       ? "1px solid rgba(74,35,23,0.15)" : "none",
            }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.62rem", letterSpacing:"0.2em", color:"#d4a056", marginBottom:"0.7rem" }}>— {f.num}</p>
              <h3 style={{ fontSize:"1.05rem", fontWeight:600, marginBottom:"0.7rem", color:"#4a2317" }}>{f.icon} {f.title}</h3>
              <p style={{ fontSize:"0.83rem", color:"#7d3c1e", lineHeight:2 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section id="story" style={{ background:"#f5ece0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center", padding:"5rem 4rem" }} className="story-grid">
        <div style={{ position:"relative", paddingBottom:"2rem", paddingRight:"2rem" }}>
          <div style={{ width:"100%", aspectRatio:"4/5", overflow:"hidden", position:"relative" }}>
            {/* 農園写真: public/images/farm.jpg に画像を置いてください */}
            <img
              src="/images/farm.jpg"
              alt="安城農園"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
          <div style={{ position:"absolute", top:"1.5rem", left:"-1.5rem", background:"#4a2317", color:"#faf5ee", padding:"1.2rem", zIndex:2 }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem", fontWeight:300, color:"#d4a056", display:"block", lineHeight:1 }}>70<span style={{ fontSize:"1rem" }}>年</span></span>
            <div style={{ fontSize:"0.68rem", letterSpacing:"0.13em", marginTop:"0.25rem" }}>栽培の歴史</div>
          </div>
          <div style={{ position:"absolute", bottom:"-1.5rem", right:"-1.5rem", width:"7rem", height:"7rem", border:"2px solid #c06030" }}/>
        </div>
        <div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", letterSpacing:"0.28em", color:"#6b7c5e", textTransform:"uppercase", marginBottom:"0.8rem" }}>Our Story</p>
          <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:600, lineHeight:1.35, color:"#4a2317", marginBottom:"1.2rem" }}>大地に根ざした<br/>70年のこだわり</h2>
          <div style={{ width:"3rem", height:1, background:"#c06030", marginBottom:"1.8rem" }}/>
          <blockquote style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", fontStyle:"italic", fontWeight:300, color:"#7d3c1e", lineHeight:1.85, margin:"1.8rem 0", paddingLeft:"1.2rem", borderLeft:"2px solid #c06030" }}>
            「土を耕すことは、未来を耕すこと。<br/>一粒のいちじくに、私たちの誇りを込めて。」
          </blockquote>
          <p style={{ fontSize:"0.87rem", color:"#7d3c1e", lineHeight:2.1, marginBottom:"1.2rem" }}>
            昭和30年代から続く安城のいちじく農家。愛知の温暖な気候と豊かな土壌に育まれ、農家が世代を超えて受け継いできた栽培技術は今も進化し続けています。
          </p>
          <div style={{ marginTop:"2rem", display:"flex", gap:"2rem", flexWrap:"wrap" }}>
            {[["18°","以上の糖度"],["100%","手摘み収穫"],["当日","発送・産地直送"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:"#c06030", lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:"0.68rem", letterSpacing:"0.13em", color:"#7d3c1e", marginTop:"0.25rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section id="products" style={{ padding:"5rem 4rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", letterSpacing:"0.28em", color:"#6b7c5e", textTransform:"uppercase", marginBottom:"0.8rem" }}>Products</p>
            <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:600, lineHeight:1.35, color:"#4a2317", marginBottom:"1.2rem" }}>商品ラインナップ</h2>
            <div style={{ width:"3rem", height:1, background:"#c06030" }}/>
          </div>
          <a href="#buy" style={{ background:"transparent", color:"#4a2317", padding:"0.85rem 2rem", border:"1px solid rgba(74,35,23,0.15)", fontFamily:"inherit", fontSize:"0.82rem", letterSpacing:"0.1em", textDecoration:"none" }}>
            全商品を見る →
          </a>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }} className="products-grid">
          {PRODUCTS.map(p => (
            <div key={p.id} style={{
              background:"white",
              border: p.popular ? "2px solid #7d3c1e" : "1px solid rgba(74,35,23,0.15)",
              overflow:"hidden",
              position:"relative",
              cursor:"pointer",
              transition:"transform 0.3s, box-shadow 0.3s",
            }}>
              {p.popular && (
                <div style={{ position:"absolute", top:"-1px", left:"50%", transform:"translateX(-50%)", background:"#4a2317", color:"#d4a056", fontSize:"0.6rem", letterSpacing:"0.18em", padding:"0.22rem 0.8rem", whiteSpace:"nowrap" }}>
                  人気 No.1
                </div>
              )}
              <div style={{ width:"100%", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", background:p.bgColor }}>
                <span style={{ fontSize:"4rem" }}>🍒</span>
              </div>
              <div style={{ padding:"1.2rem" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.62rem", letterSpacing:"0.22em", color:"#d4a056", textTransform:"uppercase", marginBottom:"0.4rem" }}>◆ {p.grade}</p>
                <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"0.35rem", color:"#4a2317" }}>{p.name}</h3>
                <p style={{ fontSize:"0.78rem", color:"#7d3c1e", lineHeight:1.8, marginBottom:"1rem" }}>{p.desc}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
                  <div>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"#4a2317" }}>{p.price}</span>
                    <span style={{ fontSize:"0.62rem", color:"#6b7c5e" }}>{p.unit}</span>
                  </div>
                  <button onClick={() => handleCart(p)}
                    style={{ background: cartedIds.includes(p.id) ? "#6b7c5e" : "#4a2317", color:"#faf5ee", border:"none", padding:"0.45rem 0.9rem", fontFamily:"inherit", fontSize:"0.75rem", letterSpacing:"0.1em", cursor:"pointer", transition:"background 0.2s" }}>
                    {cartedIds.includes(p.id) ? "✓ 追加済み" : "カートへ"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SEASON ===== */}
      <div id="season" style={{ background:"#3d5232", color:"#faf5ee", padding:"5rem 4rem", textAlign:"center" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", letterSpacing:"0.28em", color:"#d4a056", textTransform:"uppercase", marginBottom:"0.8rem" }}>Harvest Season</p>
        <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:600, color:"#faf5ee", marginBottom:"1.2rem" }}>収穫カレンダー</h2>
        <div style={{ width:"3rem", height:1, background:"#c06030", margin:"0 auto 1rem" }}/>
        <p style={{ fontSize:"0.83rem", color:"rgba(250,245,238,0.65)", marginBottom:"0.5rem" }}>安城いちじくの旬は8月〜10月。最盛期を逃さずに！</p>
        <div style={{ display:"flex", justifyContent:"center", maxWidth:680, margin:"3rem auto 0", border:"1px solid rgba(250,245,238,0.18)", overflowX:"auto" }}>
          {SEASON_MONTHS.map((m, i) => (
            <div key={i} style={{
              flex:1, minWidth:56, padding:"1.3rem 0.4rem", textAlign:"center",
              borderRight: i < SEASON_MONTHS.length - 1 ? "1px solid rgba(250,245,238,0.18)" : "none",
              background: m.type === "peak" ? "rgba(212,160,86,0.32)" : m.type === "on" ? "rgba(212,160,86,0.18)" : "transparent",
            }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.62rem", letterSpacing:"0.18em", color:"rgba(250,245,238,0.45)", marginBottom:"0.4rem" }}>{m.name}</div>
              <div style={{ fontSize:"0.72rem", color: m.type === "peak" ? "#f0c070" : m.type === "on" ? "#d4a056" : "rgba(250,245,238,0.3)", fontWeight: m.type === "peak" ? 600 : 400 }}>
                {m.label}
              </div>
              <div style={{ height:3, background:"rgba(250,245,238,0.1)", marginTop:"0.5rem" }}>
                <div style={{ height:"100%", background: m.type === "peak" ? "#f0c070" : "#d4a056", width: barsAnim ? m.fill + "%" : "0%", transition:"width 1.1s ease" }}/>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop:"1.5rem", fontSize:"0.72rem", color:"rgba(250,245,238,0.4)", letterSpacing:"0.08em" }}>※ 天候により前後する場合があります</p>
      </div>

      {/* ===== CTA ===== */}
      <section id="buy" style={{ background:"#f5ece0", textAlign:"center", padding:"7rem 4rem" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.7rem", letterSpacing:"0.28em", color:"#6b7c5e", textTransform:"uppercase", marginBottom:"0.8rem" }}>Order Now</p>
        <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:600, lineHeight:1.35, color:"#4a2317", marginBottom:"1.2rem", maxWidth:480, margin:"0 auto" }}>
          今しか味わえない<br/>安城の恵みをどうぞ
        </h2>
        <div style={{ width:"3rem", height:1, background:"#c06030", margin:"1.2rem auto 1.8rem" }}/>
        <p style={{ fontSize:"0.86rem", color:"#7d3c1e", marginBottom:"2.5rem", lineHeight:2 }}>
          数量限定・期間限定の産地直送いちじくをお見逃しなく。<br/>先行予約受付中！収穫後すぐにお届けします。
        </p>
        <div style={{ display:"flex", gap:"1.2rem", justifyContent:"center", flexWrap:"wrap" }}>
          <a href="#products" style={{ background:"#4a2317", color:"#faf5ee", padding:"1rem 2.5rem", fontFamily:"inherit", fontSize:"0.88rem", letterSpacing:"0.18em", textDecoration:"none", display:"inline-block" }}>
            商品を選んで注文する
          </a>
          <a href="#" style={{ background:"transparent", color:"#4a2317", padding:"1rem 2.5rem", border:"1px solid rgba(74,35,23,0.15)", fontFamily:"inherit", fontSize:"0.88rem", letterSpacing:"0.1em", textDecoration:"none", display:"inline-block" }}>
            先行予約メールを受け取る
          </a>
        </div>
        <div style={{ marginTop:"3rem", display:"flex", justifyContent:"center", gap:"2.5rem", flexWrap:"wrap" }}>
          {[["🚚","産地直送・送料無料"],["📅","収穫日に発送"],["🎁","熨斗・ギフト包装対応"],["🔒","安心・安全な決済"]].map(([icon,label]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", marginBottom:"0.3rem" }}>{icon}</div>
              <div style={{ fontSize:"0.72rem", letterSpacing:"0.1em", color:"#7d3c1e" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background:"#4a2317", color:"rgba(250,245,238,0.7)", padding:"3rem 4rem", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"2.5rem" }} className="footer-grid">
        <div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", fontWeight:300, letterSpacing:"0.18em", color:"#faf5ee", marginBottom:"0.4rem" }}>
            <span style={{ fontWeight:600 }}>安城</span> ICHIJIKU
          </p>
          <p style={{ fontSize:"0.72rem", letterSpacing:"0.1em", color:"#d4a056", marginBottom:"0.8rem" }}>愛知・安城の誇り、大地の恵み</p>
          <p style={{ fontSize:"0.76rem", lineHeight:2 }}>愛知県安城市で70年以上受け継がれる伝統のいちじく農家。心を込めて育てたいちじくを全国へお届けします。</p>
        </div>
        <div>
          <p style={{ fontSize:"0.7rem", letterSpacing:"0.22em", color:"#d4a056", marginBottom:"1rem", textTransform:"uppercase" }}>サイトマップ</p>
          <ul style={{ listStyle:"none" }}>
            {[["#features","安城いちじくの特長"],["#story","農家のストーリー"],["#products","商品一覧"],["#season","収穫カレンダー"],["#buy","ご注文・先行予約"]].map(([href,label]) => (
              <li key={href} style={{ marginBottom:"0.45rem" }}>
                <a href={href} style={{ fontSize:"0.78rem", color:"rgba(250,245,238,0.55)", textDecoration:"none" }}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ fontSize:"0.7rem", letterSpacing:"0.22em", color:"#d4a056", marginBottom:"1rem", textTransform:"uppercase" }}>お問い合わせ</p>
          <ul style={{ listStyle:"none" }}>
            {["📮 メールでのお問い合わせ","📞 電話でのお問い合わせ","🌐 公式SNS（Instagram）","📋 特定商取引法の表記"].map(l => (
              <li key={l} style={{ marginBottom:"0.45rem" }}>
                <a href="#" style={{ fontSize:"0.78rem", color:"rgba(250,245,238,0.55)", textDecoration:"none" }}>{l}</a>
              </li>
            ))}
          </ul>
          <p style={{ fontSize:"0.7rem", color:"rgba(250,245,238,0.35)", marginTop:"1.2rem", lineHeight:1.8 }}>
            〒446-xxxx 愛知県安城市○○町<br/>TEL：0566-xx-xxxx
          </p>
        </div>
        <div style={{ gridColumn:"1/-1", borderTop:"1px solid rgba(250,245,238,0.1)", paddingTop:"1.3rem", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem", fontSize:"0.7rem", letterSpacing:"0.08em" }}>
          <span>© 2025 安城いちじく農園. All Rights Reserved.</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", opacity:0.35 }}>Anjo Ichijiku — The Taste of Aichi</span>
        </div>
      </footer>

      {/* ===== CART TOAST ===== */}
      {toast && (
        <div style={{
          position:"fixed", bottom:"1.5rem", right:"1rem", left:"1rem",
          background:"#4a2317", color:"#faf5ee",
          padding:"0.9rem 1.3rem",
          fontSize:"0.85rem", letterSpacing:"0.04em",
          zIndex:999,
          borderLeft:"3px solid #d4a056",
          boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
          borderRadius:2,
          textAlign:"center",
        }}>
          🛒「{toast}」をカートに追加しました
        </div>
      )}

      {/* ===== RESPONSIVE STYLES ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        a { -webkit-tap-highlight-color: transparent; }
        button { -webkit-tap-highlight-color: transparent; }

        @media (max-width: 900px) {
          .hero-grid    { grid-template-columns: 1fr !important; }
          .story-grid   { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .products-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid  { grid-template-columns: 1fr 1fr !important; }
          .footer-grid > div:first-child { grid-column: 1/-1; }
          .desktop-nav  { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .countdown-wrap { flex-direction: column !important; align-items: flex-start !important; padding: 2rem 1.5rem !important; }
        }

        @media (max-width: 600px) {
          .products-grid { grid-template-columns: 1fr !important; }
          .footer-grid   { grid-template-columns: 1fr !important; }
          .footer-grid > div:first-child { grid-column: auto !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
