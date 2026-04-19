import React, { useState, useEffect, useRef } from "react";
import { Coffee, Plus, List, Package, Download, Upload, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const BEANS_KEY = "coffee_journal_beans_v1";
const BREWS_KEY = "coffee_journal_brews_v1";

// localStorage 헬퍼
const loadData = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState("write");
  const [beans, setBeans] = useState(() => loadData(BEANS_KEY));
  const [brews, setBrews] = useState(() => loadData(BREWS_KEY));
  const [beanMode, setBeanMode] = useState(() => loadData(BEANS_KEY).length > 0 ? "existing" : "new");
  const [selectedBeanKey, setSelectedBeanKey] = useState("");
  const [expandedBeans, setExpandedBeans] = useState({});
  const [saveMsg, setSaveMsg] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    origin: "",
    roastDate: today,
    method: "핸드드립",
    grind: 20,
    dose: "",
    water: "",
    temp: "",
    acidity: 3,
    sweetness: 3,
    bitterness: 3,
    body: 3,
    rating: 0,
    note: "",
  });

  // 데이터 변경 시 자동 저장
  useEffect(() => { saveData(BEANS_KEY, beans); }, [beans]);
  useEffect(() => { saveData(BREWS_KEY, brews); }, [brews]);

  const beanKey = (name, roastDate) => `${(name || "").trim()}__${roastDate || ""}`;
  const daysSince = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Math.round((new Date() - d) / (1000 * 60 * 60 * 24));
  };

  const updateForm = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const showMsg = (text, type = "success") => {
    setSaveMsg({ text, type });
    setTimeout(() => setSaveMsg({ text: "", type: "" }), 2500);
  };

  const handleSave = () => {
    let originName, roastDate;

    if (beanMode === "existing") {
      if (!selectedBeanKey) {
        showMsg("원두를 선택하거나 새로 등록해주세요", "error");
        return;
      }
      const bean = beans.find((b) => beanKey(b.name, b.roastDate) === selectedBeanKey);
      originName = bean.name;
      roastDate = bean.roastDate;
    } else {
      originName = form.origin.trim();
      roastDate = form.roastDate || null;
      if (!originName) {
        showMsg("원두 이름을 입력해주세요", "error");
        return;
      }
      const k = beanKey(originName, roastDate);
      if (!beans.find((b) => beanKey(b.name, b.roastDate) === k)) {
        setBeans((prev) => [{ name: originName, roastDate, createdAt: Date.now() }, ...prev]);
      }
    }

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      beanKey: beanKey(originName, roastDate),
      origin: originName,
      roastDate,
      method: form.method,
      grind: +form.grind,
      dose: form.dose || null,
      water: form.water || null,
      temp: form.temp || null,
      acidity: +form.acidity,
      sweetness: +form.sweetness,
      bitterness: +form.bitterness,
      body: +form.body,
      rating: parseFloat(parseFloat(form.rating).toFixed(1)),
      note: form.note,
    };

    setBrews((prev) => [entry, ...prev]);
    setForm((f) => ({
      ...f,
      dose: "", water: "", temp: "",
      acidity: 3, sweetness: 3, bitterness: 3, body: 3,
      rating: 0, note: "", grind: 20,
    }));
    if (beanMode === "new") {
      setForm((f) => ({ ...f, origin: "" }));
      setBeanMode("existing");
    }
    showMsg("✓ 저장되었습니다");
  };

  const handleDeleteBrew = (id) => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    setBrews((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDeleteBean = (key) => {
    const relatedCount = brews.filter((b) => b.beanKey === key).length;
    const msg = relatedCount > 0
      ? `이 원두로 낸 ${relatedCount}개의 기록도 함께 삭제됩니다. 계속할까요?`
      : "이 원두를 삭제할까요?";
    if (!confirm(msg)) return;
    setBeans((prev) => prev.filter((b) => beanKey(b.name, b.roastDate) !== key));
    setBrews((prev) => prev.filter((b) => b.beanKey !== key));
  };

  const handleExport = () => {
    const data = { beans, brews, exportedAt: new Date().toISOString(), version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const d = new Date();
    a.download = `coffee_journal_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg("✓ 백업 파일을 내보냈습니다");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data.beans) && Array.isArray(data.brews)) {
          if (brews.length > 0 || beans.length > 0) {
            if (!confirm("현재 데이터를 덮어씁니다. 계속할까요?")) return;
          }
          setBeans(data.beans);
          setBrews(data.brews);
          showMsg("✓ 데이터를 불러왔습니다");
        } else {
          showMsg("올바른 파일 형식이 아닙니다", "error");
        }
      } catch (err) {
        showMsg("파일을 읽을 수 없습니다", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const StarRow = ({ value, size = 26 }) => (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = Math.min(1, Math.max(0, value - (i - 1)));
        const pct = Math.round(filled * 100);
        const gradId = `star-grad-${i}-${size}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gradId} x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset={`${pct}%`} stopColor="#EF9F27" />
                <stop offset={`${pct}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2 L14.5 8.5 L21.5 9 L16 13.5 L17.8 20.5 L12 16.8 L6.2 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z"
              fill={`url(#${gradId})`}
              stroke={filled > 0 ? "#854F0B" : "#B4B2A9"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );

  const groupedBeans = beans.map((bean) => {
    const key = beanKey(bean.name, bean.roastDate);
    const related = brews.filter((br) => br.beanKey === key);
    const avgRating = related.length > 0
      ? related.reduce((s, br) => s + (br.rating || 0), 0) / related.length
      : null;
    const bestBrew = related.length > 0
      ? related.reduce((best, br) => (br.rating > (best?.rating ?? -1) ? br : best), null)
      : null;
    return { bean, key, brews: related, avgRating, bestBrew };
  });

  const TasteSlider = ({ field, label }) => (
    <div className="flex items-center gap-3 mb-2">
      <label className="text-xs text-stone-600 min-w-[3rem]">{label}</label>
      <input
        type="range" min="1" max="5" step="1"
        value={form[field]}
        onChange={(e) => updateForm(field, e.target.value)}
        className="flex-1 accent-amber-700"
      />
      <span className="text-sm font-medium text-stone-800 min-w-[1rem] text-right">{form[field]}</span>
    </div>
  );

  const BrewCard = ({ brew }) => {
    const d = new Date(brew.date);
    const dateStr = `${d.getMonth() + 1}월 ${d.getDate()}일`;
    const elapsed = brew.roastDate ? daysSince(brew.roastDate) : null;
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-2.5 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-stone-800 truncate">{brew.origin}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {dateStr} · {brew.method} · 분쇄도 {brew.grind}
              {elapsed !== null && ` · 로스팅 후 ${elapsed}일`}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-amber-800 font-medium whitespace-nowrap">★ {brew.rating.toFixed(1)}</span>
            <button onClick={() => handleDeleteBrew(brew.id)} className="text-stone-400 hover:text-red-500 transition-colors" aria-label="삭제">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="text-xs text-stone-500 mb-2">
          {brew.dose ? `${brew.dose}g` : "-"} / {brew.water ? `${brew.water}ml` : "-"} / {brew.temp ? `${brew.temp}°C` : "-"}
          <span className="text-stone-400 ml-2">
            산미 {brew.acidity} · 단맛 {brew.sweetness} · 쓴맛 {brew.bitterness} · 바디 {brew.body}
          </span>
        </div>
        {brew.note && (
          <p className="text-sm text-stone-700 pt-2 border-t border-dashed border-stone-200 italic leading-relaxed">{brew.note}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(180deg, #FAF5EC 0%, #F5EDD8 100%)",
      fontFamily: '"Noto Serif KR", Georgia, serif',
    }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="text-center mb-8">
          <svg width="64" height="64" viewBox="0 0 56 56" className="mx-auto mb-2">
            <ellipse cx="28" cy="46" rx="18" ry="2.5" fill="#D3D1C7" opacity="0.4" />
            <path d="M12 20 L12 36 Q12 44 20 44 L34 44 Q42 44 42 36 L42 20 Z" fill="none" stroke="#5F5E5A" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M42 24 Q50 24 50 30 Q50 36 42 36" fill="none" stroke="#5F5E5A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 20 L42 20" stroke="#5F5E5A" strokeWidth="1.5" />
            <ellipse cx="27" cy="26" rx="13" ry="3" fill="#FAEEDA" opacity="0.7" />
            <path d="M20 14 Q22 10 20 6" fill="none" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M27 12 Q29 8 27 4" fill="none" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M34 14 Q36 10 34 6" fill="none" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </svg>
          <h1 className="text-2xl font-medium tracking-tight text-stone-800">커피 추출 일지</h1>
          <p className="text-sm text-stone-500 mt-1" style={{ fontFamily: "system-ui, sans-serif" }}>오늘의 한 잔을 기록합니다</p>
        </div>

        <div className="flex gap-2 mb-4 justify-end" style={{ fontFamily: "system-ui, sans-serif" }}>
          <button onClick={handleExport} className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-800 transition-colors px-2 py-1">
            <Download size={13} /> 백업 내보내기
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-800 transition-colors px-2 py-1">
            <Upload size={13} /> 복원
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>

        <div className="flex gap-1 border-b border-stone-200 mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
          {[
            { key: "write", label: "새 기록", icon: Plus },
            { key: "list", label: "전체 기록", icon: List, count: brews.length },
            { key: "beans", label: "원두별", icon: Package, count: beans.length },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-all ${
                  active ? "text-stone-800 font-medium border-b-2 border-amber-700"
                         : "text-stone-500 border-b-2 border-transparent hover:text-stone-700"
                }`}>
                <Icon size={14} />
                {t.label}
                {t.count !== undefined && <span className="text-xs text-stone-400">({t.count})</span>}
              </button>
            );
          })}
        </div>

        {saveMsg.text && (
          <div className={`text-center text-sm mb-4 py-2 px-3 rounded-lg ${
            saveMsg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`} style={{ fontFamily: "system-ui, sans-serif" }}>
            {saveMsg.text}
          </div>
        )}

        {activeTab === "write" && (
          <div style={{ fontFamily: "system-ui, sans-serif" }}>
            <div className="mb-5">
              <p className="text-xs text-stone-400 tracking-wider uppercase mb-2">원두</p>
              <div className="flex gap-1.5 mb-2.5">
                <button onClick={() => setBeanMode("existing")} disabled={beans.length === 0}
                  className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                    beanMode === "existing" ? "bg-amber-100 border border-amber-700 text-amber-900 font-medium"
                                             : "bg-transparent border border-stone-300 text-stone-500"
                  } ${beans.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                  저장된 원두
                </button>
                <button onClick={() => setBeanMode("new")}
                  className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer ${
                    beanMode === "new" ? "bg-amber-100 border border-amber-700 text-amber-900 font-medium"
                                       : "bg-transparent border border-stone-300 text-stone-500"
                  }`}>
                  새 원두 등록
                </button>
              </div>

              {beanMode === "existing" ? (
                <select value={selectedBeanKey} onChange={(e) => setSelectedBeanKey(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-700">
                  <option value="">원두를 선택하세요</option>
                  {beans.map((b) => {
                    const elapsed = daysSince(b.roastDate);
                    return (
                      <option key={beanKey(b.name, b.roastDate)} value={beanKey(b.name, b.roastDate)}>
                        {b.name} · {b.roastDate || "날짜 미기재"}{elapsed !== null && ` (로스팅 후 ${elapsed}일)`}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-stone-600 block mb-1">원두 이름</label>
                    <input type="text" value={form.origin} onChange={(e) => updateForm("origin", e.target.value)}
                      placeholder="예: 에티오피아 예가체프"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-600 block mb-1">로스팅 날짜</label>
                    <input type="date" value={form.roastDate} onChange={(e) => updateForm("roastDate", e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700" />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-5">
              <p className="text-xs text-stone-400 tracking-wider uppercase mb-2">추출 조건</p>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="text-xs text-stone-600 block mb-1">추출 방법</label>
                  <select value={form.method} onChange={(e) => updateForm("method", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700">
                    {["핸드드립", "에스프레소", "프렌치프레스", "에어로프레스", "모카포트", "콜드브루"].map(m => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-600 block mb-1">
                    분쇄도 <span className="text-amber-800 font-medium">{form.grind}</span>
                    <span className="text-stone-400 text-[11px]"> / 40</span>
                  </label>
                  <input type="range" min="0" max="40" step="1" value={form.grind}
                    onChange={(e) => updateForm("grind", e.target.value)}
                    className="w-full accent-amber-700 mt-2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs text-stone-600 block mb-1">원두량 (g)</label>
                  <input type="number" step="0.1" value={form.dose}
                    onChange={(e) => updateForm("dose", e.target.value)} placeholder="18"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700" />
                </div>
                <div>
                  <label className="text-xs text-stone-600 block mb-1">물 (ml)</label>
                  <input type="number" value={form.water}
                    onChange={(e) => updateForm("water", e.target.value)} placeholder="300"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700" />
                </div>
                <div>
                  <label className="text-xs text-stone-600 block mb-1">온도 (°C)</label>
                  <input type="number" step="0.1" value={form.temp}
                    onChange={(e) => updateForm("temp", e.target.value)} placeholder="92"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700" />
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-stone-400 tracking-wider uppercase mb-2">맛 평가</p>
              <TasteSlider field="acidity" label="산미" />
              <TasteSlider field="sweetness" label="단맛" />
              <TasteSlider field="bitterness" label="쓴맛" />
              <TasteSlider field="body" label="바디감" />
            </div>

            <div className="mb-5">
              <p className="text-xs text-stone-400 tracking-wider uppercase mb-2">오늘의 한 잔</p>
              <div className="bg-stone-100 p-4 rounded-lg">
                <div className="mb-3"><StarRow value={parseFloat(form.rating)} /></div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-stone-400">0.0</span>
                  <input type="range" min="0" max="5" step="0.1" value={form.rating}
                    onChange={(e) => updateForm("rating", e.target.value)}
                    className="flex-1 accent-amber-700" />
                  <span className="text-xs text-stone-400">5.0</span>
                  <span className="text-base font-medium text-amber-800 min-w-[2rem] text-right">
                    {parseFloat(form.rating).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-stone-400 tracking-wider uppercase mb-2">감상 노트</p>
              <textarea rows="3" value={form.note} onChange={(e) => updateForm("note", e.target.value)}
                placeholder="향, 맛, 여운... 오늘의 커피는 어땠나요?"
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-700 resize-y" />
            </div>

            <button onClick={handleSave}
              className="w-full py-3 bg-amber-100 border border-amber-700 text-amber-900 rounded-lg font-medium hover:bg-amber-200 transition-colors">
              기록 저장하기
            </button>
          </div>
        )}

        {activeTab === "list" && (
          <div style={{ fontFamily: "system-ui, sans-serif" }}>
            {brews.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Coffee size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">아직 기록이 없습니다</p>
                <p className="text-xs mt-1">첫 잔을 기록해보세요</p>
              </div>
            ) : (
              brews.map((b) => <BrewCard key={b.id} brew={b} />)
            )}
          </div>
        )}

        {activeTab === "beans" && (
          <div style={{ fontFamily: "system-ui, sans-serif" }}>
            {beans.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Package size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">등록된 원두가 없습니다</p>
                <p className="text-xs mt-1">첫 원두를 등록해보세요</p>
              </div>
            ) : (
              groupedBeans.map((g) => {
                const elapsed = g.bean.roastDate ? daysSince(g.bean.roastDate) : null;
                const isExpanded = expandedBeans[g.key];
                return (
                  <div key={g.key} className="bg-stone-100 rounded-xl p-4 mb-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 cursor-pointer min-w-0"
                        onClick={() => setExpandedBeans((prev) => ({ ...prev, [g.key]: !prev[g.key] }))}>
                        <p className="text-[15px] font-medium text-stone-800 truncate">{g.bean.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {g.bean.roastDate || "날짜 미기재"}
                          {elapsed !== null && ` · 로스팅 후 ${elapsed}일`}
                          {` · ${g.brews.length}회 추출`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[11px] text-stone-400">평균</p>
                          <p className="text-base text-amber-800 font-medium mt-0.5">
                            ★ {g.avgRating !== null ? g.avgRating.toFixed(1) : "—"}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteBean(g.key)}
                          className="text-stone-400 hover:text-red-500 transition-colors" aria-label="원두 삭제">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => setExpandedBeans((prev) => ({ ...prev, [g.key]: !prev[g.key] }))}
                          className="text-stone-400 hover:text-stone-600">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    {g.bestBrew && (
                      <p className="text-[11px] text-stone-400 mt-2.5 pt-2.5 border-t border-dashed border-stone-300">
                        최고 평점 조합: <span className="text-stone-600">
                          분쇄도 {g.bestBrew.grind} · {g.bestBrew.method} · {g.bestBrew.temp || "-"}°C · ★ {g.bestBrew.rating.toFixed(1)}
                        </span>
                      </p>
                    )}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-stone-200">
                        {g.brews.length > 0 ? (
                          g.brews.map((b) => <BrewCard key={b.id} brew={b} />)
                        ) : (
                          <p className="text-xs text-stone-400 text-center py-4">이 원두로 아직 추출한 기록이 없습니다</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="text-center text-xs text-stone-400 mt-8 pt-4 border-t border-stone-200"
          style={{ fontFamily: "system-ui, sans-serif" }}>
          ☕ 데이터는 이 기기에 안전하게 저장됩니다
        </div>
      </div>
    </div>
  );
}
