import { useState, useEffect, useRef } from "react";

const BEANS_KEY = "cj_beans_v2";
const BREWS_KEY = "cj_brews_v2";

const load = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const save = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

const beanKey = (name, roastDate) => `${(name || "").trim()}__${roastDate || ""}`;
const daysSince = (d) => d ? Math.round((Date.now() - new Date(d)) / 86400000) : null;

const CoffeeCupIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    <ellipse cx="28" cy="46" rx="18" ry="2.5" fill="#D3C4A8" opacity="0.5"/>
    <path d="M12 20 L12 37 Q12 44 20 44 L34 44 Q42 44 42 37 L42 20 Z" stroke="#7C6A52" strokeWidth="1.5" strokeLinejoin="round" fill="#FFFDF8"/>
    <path d="M42 25 Q51 25 51 31 Q51 37 42 37" stroke="#7C6A52" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="20" x2="42" y2="20" stroke="#7C6A52" strokeWidth="1.5"/>
    <ellipse cx="27" cy="23" rx="12" ry="2.5" fill="#C8956C" opacity="0.6"/>
    <path d="M19 15 Q21 11 19 7" stroke="#B8A898" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
    <path d="M27 13 Q29 9 27 5" stroke="#B8A898" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
    <path d="M35 15 Q37 11 35 7" stroke="#B8A898" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const StarDisplay = ({ value, size = 22 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map(i => {
      const fill = Math.min(1, Math.max(0, value - (i-1)));
      const pct = Math.round(fill * 100);
      const id = `sg${i}${size}${Math.random().toString(36).slice(2,6)}`;
      return (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={id} x1="0%" x2="100%">
              <stop offset={`${pct}%`} stopColor="#C8854A"/>
              <stop offset={`${pct}%`} stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path d="M12 2L14.5 8.5L21.5 9L16 13.5L17.8 20.5L12 16.8L6.2 20.5L8 13.5L2.5 9L9.5 8.5Z"
            fill={`url(#${id})`} stroke={fill > 0 ? "#9A5C28" : "#C8B89A"} strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      );
    })}
  </div>
);

const tasteFields = [
  { key: "acidity", label: "산미" },
  { key: "sweetness", label: "단맛" },
  { key: "bitterness", label: "쓴맛" },
  { key: "body", label: "바디감" },
];

export default function CoffeeJournal() {
  const [beans, setBeans] = useState(() => load(BEANS_KEY));
  const [brews, setBrews] = useState(() => load(BREWS_KEY));
  const [tab, setTab] = useState("write");
  const [beanMode, setBeanMode] = useState("new");
  const [selBean, setSelBean] = useState("");
  const [expanded, setExpanded] = useState({});
  const [msg, setMsg] = useState({ text: "", type: "" });
  const fileRef = useRef();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    origin: "", roastDate: today, method: "핸드드립",
    grind: 20, dose: "", water: "", temp: "", brewTime: "",
    acidity: 3, sweetness: 3, bitterness: 3, body: 3,
    rating: 0, note: "",
  });

  useEffect(() => { save(BEANS_KEY, beans); }, [beans]);
  useEffect(() => { save(BREWS_KEY, brews); }, [brews]);
  useEffect(() => { if (beans.length > 0 && beanMode === "new" && !form.origin) setBeanMode("existing"); }, [beans.length]);

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 2500); };

  const handleSave = () => {
    let name, roastDate;
    if (beanMode === "existing") {
      if (!selBean) { flash("원두를 선택하거나 새로 등록해주세요", "error"); return; }
      const b = beans.find(b => beanKey(b.name, b.roastDate) === selBean);
      name = b.name; roastDate = b.roastDate;
    } else {
      name = form.origin.trim(); roastDate = form.roastDate || null;
      if (!name) { flash("원두 이름을 입력해주세요", "error"); return; }
      const k = beanKey(name, roastDate);
      if (!beans.find(b => beanKey(b.name, b.roastDate) === k))
        setBeans(p => [{ name, roastDate, createdAt: Date.now() }, ...p]);
    }
    const entry = {
      id: Date.now(), date: new Date().toISOString(),
      beanKey: beanKey(name, roastDate), origin: name, roastDate,
      method: form.method, grind: +form.grind,
      dose: form.dose || null, water: form.water || null, temp: form.temp || null, brewTime: form.brewTime || null,
      acidity: +form.acidity, sweetness: +form.sweetness,
      bitterness: +form.bitterness, body: +form.body,
      rating: parseFloat(parseFloat(form.rating).toFixed(1)),
      note: form.note,
    };
    setBrews(p => [entry, ...p]);
    setForm(f => ({ ...f, dose:"", water:"", temp:"", brewTime:"", acidity:3, sweetness:3, bitterness:3, body:3, rating:0, note:"", grind:20 }));
    if (beanMode === "new") { setForm(f => ({ ...f, origin:"" })); setBeanMode("existing"); }
    flash("✓ 저장되었습니다");
  };

  const delBrew = (id) => { if (!confirm("이 기록을 삭제할까요?")) return; setBrews(p => p.filter(b => b.id !== id)); };
  const delBean = (key) => {
    const cnt = brews.filter(b => b.beanKey === key).length;
    if (!confirm(cnt > 0 ? `이 원두로 낸 ${cnt}개의 기록도 함께 삭제됩니다. 계속할까요?` : "이 원두를 삭제할까요?")) return;
    setBeans(p => p.filter(b => beanKey(b.name, b.roastDate) !== key));
    setBrews(p => p.filter(b => b.beanKey !== key));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ beans, brews, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    const d = new Date(); a.download = `coffee_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}.json`;
    a.click(); URL.revokeObjectURL(url); flash("✓ 내보내기 완료");
  };

  const importData = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.beans) || !Array.isArray(data.brews)) { flash("올바른 파일 형식이 아닙니다", "error"); return; }
        if ((beans.length > 0 || brews.length > 0) && !confirm("현재 데이터를 덮어씁니다. 계속할까요?")) return;
        setBeans(data.beans); setBrews(data.brews); flash("✓ 불러오기 완료");
      } catch { flash("파일을 읽을 수 없습니다", "error"); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const grouped = beans.map(bean => {
    const key = beanKey(bean.name, bean.roastDate);
    const related = brews.filter(b => b.beanKey === key);
    const avg = related.length > 0 ? related.reduce((s, b) => s + (b.rating || 0), 0) / related.length : null;
    const best = related.length > 0 ? related.reduce((best, b) => b.rating > (best?.rating ?? -1) ? b : best, null) : null;
    return { bean, key, brews: related, avg, best };
  });

  const S = {
    wrap: { minHeight: "100vh", background: "linear-gradient(160deg,#FBF6EC 0%,#F5ECD8 60%,#EDE0C8 100%)", fontFamily: "'Georgia', 'Batang', serif", padding: "0 0 3rem" },
    inner: { maxWidth: 560, margin: "0 auto", padding: "0 1.25rem" },
    header: { textAlign: "center", padding: "2rem 0 1.25rem" },
    title: { fontSize: 24, fontWeight: 500, color: "#4A3728", margin: "0.25rem 0 0.25rem", letterSpacing: "-0.01em" },
    sub: { fontSize: 13, color: "#9A8070", fontFamily: "system-ui,sans-serif", margin: 0 },
    topbar: { display: "flex", justifyContent: "flex-end", gap: 2, marginBottom: 8, fontFamily: "system-ui,sans-serif" },
    tbtn: { background: "none", border: "none", fontSize: 12, color: "#8A7060", cursor: "pointer", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 },
    tabs: { display: "flex", borderBottom: "1px solid #D8C8B0", marginBottom: "1.5rem", fontFamily: "system-ui,sans-serif" },
    tab: (active) => ({ flex: 1, padding: "10px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: active ? "#4A3728" : "#9A8070", fontWeight: active ? 600 : 400, borderBottom: active ? "2px solid #9A5C28" : "2px solid transparent", transition: "all 0.15s" }),
    section: { fontFamily: "system-ui,sans-serif" },
    label: { fontSize: 11, color: "#9A8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 },
    input: { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #D8C8B0", borderRadius: 10, fontSize: 14, background: "#FFFDF8", color: "#3A2818", outline: "none", fontFamily: "system-ui,sans-serif" },
    select: { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #D8C8B0", borderRadius: 10, fontSize: 14, background: "#FFFDF8", color: "#3A2818", outline: "none", fontFamily: "system-ui,sans-serif" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
    grid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 },
    block: { marginBottom: "1.25rem" },
    modebtn: (active) => ({ flex: 1, padding: "8px 0", borderRadius: 10, border: active ? "1.5px solid #9A5C28" : "1px solid #D8C8B0", background: active ? "#F5E8D4" : "transparent", color: active ? "#6A3818" : "#9A8070", fontSize: 13, cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all 0.15s", fontFamily: "system-ui,sans-serif" }),
    savebtn: { width: "100%", padding: "13px 0", background: "#F5E8D4", border: "1.5px solid #9A5C28", borderRadius: 12, color: "#5A2808", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui,sans-serif", letterSpacing: "0.02em" },
    flashbox: (type) => ({ textAlign: "center", fontSize: 13, padding: "8px 12px", borderRadius: 8, marginBottom: 12, background: type === "error" ? "#FDE8E8" : "#E8F5E8", color: type === "error" ? "#922" : "#282", fontFamily: "system-ui,sans-serif" }),
    card: { background: "#FFFDF8", border: "1px solid #E0D0B8", borderRadius: 14, padding: "13px 15px", marginBottom: 10, boxShadow: "0 1px 4px rgba(160,120,60,0.06)" },
    beanCard: { background: "#F8F0E4", border: "1px solid #E0D0B8", borderRadius: 14, padding: "13px 15px", marginBottom: 10 },
    emptywrap: { textAlign: "center", padding: "3.5rem 1rem", color: "#B0A090" },
    footer: { textAlign: "center", fontSize: 11, color: "#C0B0A0", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #E8DAC8", fontFamily: "system-ui,sans-serif" },
  };

  const BrewCard = ({ brew }) => {
    const d = new Date(brew.date);
    const elapsed = daysSince(brew.roastDate);
    return (
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#3A2818", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brew.origin}</div>
            <div style={{ fontSize: 12, color: "#9A8070", marginTop: 2 }}>
              {d.getMonth()+1}월 {d.getDate()}일 · {brew.method} · 분쇄도 {brew.grind}{elapsed !== null ? ` · 로스팅 후 ${elapsed}일` : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
            <span style={{ fontSize: 14, color: "#9A5C28", fontWeight: 600, whiteSpace: "nowrap" }}>★ {brew.rating.toFixed(1)}</span>
            <button onClick={() => delBrew(brew.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C0A890", padding: 2, fontSize: 13 }} title="삭제">✕</button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#9A8070", marginBottom: brew.note ? 8 : 0 }}>
          {brew.dose ? `${brew.dose}g` : "−"} / {brew.water ? `${brew.water}ml` : "−"} / {brew.temp ? `${brew.temp}°C` : "−"} / {brew.brewTime ? `${brew.brewTime}초` : "−"}
          <span style={{ color: "#B0A090", marginLeft: 8 }}>산미 {brew.acidity} · 단맛 {brew.sweetness} · 쓴맛 {brew.bitterness} · 바디 {brew.body}</span>
        </div>
        {brew.note && (
          <div style={{ fontSize: 13, color: "#5A4838", paddingTop: 8, borderTop: "1px dashed #E0D0B8", fontStyle: "italic", lineHeight: 1.65, fontFamily: "Georgia,serif" }}>{brew.note}</div>
        )}
      </div>
    );
  };

  return (
    <div style={S.wrap}>
      <div style={S.inner}>
        <div style={S.header}>
          <CoffeeCupIcon size={56} />
          <div style={S.title}>커피 추출 일지</div>
          <div style={S.sub}>오늘의 한 잔을 기록합니다</div>
        </div>

        <div style={S.topbar}>
          <button style={S.tbtn} onClick={exportData}>↓ 내보내기</button>
          <button style={S.tbtn} onClick={() => fileRef.current?.click()}>↑ 불러오기</button>
          <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
        </div>

        {msg.text && <div style={S.flashbox(msg.type)}>{msg.text}</div>}

        <div style={S.tabs}>
          {[
            { key: "write", label: "새 기록" },
            { key: "list", label: `전체 기록 (${brews.length})` },
            { key: "beans", label: `원두별 (${beans.length})` },
          ].map(t => (
            <button key={t.key} style={S.tab(tab === t.key)} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {tab === "write" && (
          <div style={S.section}>
            <div style={S.block}>
              <span style={S.label}>원두</span>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button style={S.modebtn(beanMode === "existing")} disabled={beans.length === 0}
                  onClick={() => setBeanMode("existing")}>저장된 원두</button>
                <button style={S.modebtn(beanMode === "new")} onClick={() => setBeanMode("new")}>새 원두 등록</button>
              </div>
              {beanMode === "existing" ? (
                <select style={S.select} value={selBean} onChange={e => setSelBean(e.target.value)}>
                  <option value="">원두를 선택하세요</option>
                  {beans.map(b => {
                    const elapsed = daysSince(b.roastDate);
                    return <option key={beanKey(b.name, b.roastDate)} value={beanKey(b.name, b.roastDate)}>
                      {b.name} · {b.roastDate || "날짜 미기재"}{elapsed !== null ? ` (${elapsed}일 경과)` : ""}
                    </option>;
                  })}
                </select>
              ) : (
                <div style={S.grid2}>
                  <div>
                    <label style={{ ...S.label, marginBottom: 4 }}>원두 이름</label>
                    <input style={S.input} type="text" value={form.origin} onChange={e => upd("origin", e.target.value)} placeholder="예: 에티오피아 예가체프" />
                  </div>
                  <div>
                    <label style={{ ...S.label, marginBottom: 4 }}>로스팅 날짜</label>
                    <input style={S.input} type="date" value={form.roastDate} onChange={e => upd("roastDate", e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div style={S.block}>
              <span style={S.label}>추출 조건</span>
              <div style={{ ...S.grid2, marginBottom: 10 }}>
                <div>
                  <label style={{ ...S.label, marginBottom: 4 }}>추출 방법</label>
                  <select style={S.select} value={form.method} onChange={e => upd("method", e.target.value)}>
                    {["핸드드립","에스프레소","프렌치프레스","에어로프레스","모카포트","콜드브루"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...S.label, marginBottom: 4 }}>
                    분쇄도 <span style={{ color: "#9A5C28", fontWeight: 600 }}>{form.grind}</span>
                    <span style={{ color: "#B0A090", fontSize: 10 }}> / 40</span>
                  </label>
                  <input type="range" min="0" max="40" step="1" value={form.grind}
                    onChange={e => upd("grind", e.target.value)}
                    style={{ width: "100%", accentColor: "#9A5C28", marginTop: 6 }} />
                </div>
              </div>
              <div style={S.grid4}>
                {[["dose","원두량 (g)","18","0.1"],["water","물 (ml)","300","1"],["temp","온도 (°C)","92","0.1"],["brewTime","완료 시간 (초)","180","1"]].map(([f,l,ph,step]) => (
                  <div key={f}>
                    <label style={{ ...S.label, marginBottom: 4 }}>{l}</label>
                    <input style={S.input} type="number" step={step} value={form[f]} onChange={e => upd(f, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </div>

            <div style={S.block}>
              <span style={S.label}>맛 평가</span>
              {tasteFields.map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#7A6858", minWidth: 44 }}>{label}</span>
                  <input type="range" min="1" max="5" step="1" value={form[key]}
                    onChange={e => upd(key, e.target.value)}
                    style={{ flex: 1, accentColor: "#9A5C28" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#3A2818", minWidth: 14, textAlign: "right" }}>{form[key]}</span>
                </div>
              ))}
            </div>

            <div style={S.block}>
              <span style={S.label}>오늘의 한 잔</span>
              <div style={{ background: "#F2E8D8", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <StarDisplay value={parseFloat(form.rating)} size={28} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#B0A090" }}>0.0</span>
                  <input type="range" min="0" max="5" step="0.1" value={form.rating}
                    onChange={e => upd("rating", e.target.value)}
                    style={{ flex: 1, accentColor: "#9A5C28" }} />
                  <span style={{ fontSize: 11, color: "#B0A090" }}>5.0</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#9A5C28", minWidth: 30, textAlign: "right" }}>
                    {parseFloat(form.rating).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div style={S.block}>
              <span style={S.label}>감상 노트</span>
              <textarea
                value={form.note} onChange={e => upd("note", e.target.value)}
                placeholder="향, 맛, 여운... 오늘의 커피는 어땠나요?"
                rows={3}
                style={{ ...S.input, resize: "vertical", lineHeight: 1.6, fontFamily: "Georgia,serif" }}
              />
            </div>

            <button style={S.savebtn} onClick={handleSave}>기록 저장하기</button>
          </div>
        )}

        {tab === "list" && (
          <div style={S.section}>
            {brews.length === 0 ? (
              <div style={S.emptywrap}>
                <CoffeeCupIcon size={36} />
                <div style={{ fontSize: 14, marginTop: 12 }}>아직 기록이 없습니다</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>첫 잔을 기록해보세요</div>
              </div>
            ) : brews.map(b => <BrewCard key={b.id} brew={b} />)}
          </div>
        )}

        {tab === "beans" && (
          <div style={S.section}>
            {beans.length === 0 ? (
              <div style={S.emptywrap}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>☕</div>
                <div style={{ fontSize: 14 }}>등록된 원두가 없습니다</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>새 원두를 등록해보세요</div>
              </div>
            ) : grouped.map(g => {
              const elapsed = daysSince(g.bean.roastDate);
              const isOpen = expanded[g.key];
              return (
                <div key={g.key} style={S.beanCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, cursor: "pointer", minWidth: 0 }}
                      onClick={() => setExpanded(p => ({ ...p, [g.key]: !p[g.key] }))}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "#3A2818", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.bean.name}</div>
                      <div style={{ fontSize: 12, color: "#9A8070", marginTop: 2 }}>
                        {g.bean.roastDate || "날짜 미기재"}{elapsed !== null ? ` · 로스팅 후 ${elapsed}일` : ""} · {g.brews.length}회 추출
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#B0A090" }}>평균</div>
                        <div style={{ fontSize: 16, color: "#9A5C28", fontWeight: 600 }}>
                          ★ {g.avg !== null ? g.avg.toFixed(1) : "—"}
                        </div>
                      </div>
                      <button onClick={() => delBean(g.key)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#C0A890", fontSize: 13, padding: 2 }} title="원두 삭제">✕</button>
                      <button onClick={() => setExpanded(p => ({ ...p, [g.key]: !p[g.key] }))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9A8070", fontSize: 16, padding: 2 }}>
                        {isOpen ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>
                  {g.best && (
                    <div style={{ fontSize: 11, color: "#9A8070", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #D8C8A8" }}>
                      최고 평점 조합: <span style={{ color: "#6A4828" }}>분쇄도 {g.best.grind} · {g.best.method} · {g.best.temp || "−"}°C · ★ {g.best.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {isOpen && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E8D8C0" }}>
                      {g.brews.length > 0 ? g.brews.map(b => <BrewCard key={b.id} brew={b} />) : (
                        <div style={{ fontSize: 12, color: "#B0A090", textAlign: "center", padding: "1rem 0" }}>이 원두로 아직 추출한 기록이 없습니다</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={S.footer}>☕ 데이터는 이 기기에 자동 저장됩니다</div>
      </div>
    </div>
  );
}