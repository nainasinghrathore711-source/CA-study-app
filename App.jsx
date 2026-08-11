import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Star, Sparkles, Plus, Timer, LogOut, ChevronLeft, Users, BookOpen, Trash2, Check } from "lucide-react";

// ---------- Font injection ----------
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    .font-display { font-family: 'Fredoka', sans-serif; }
    .font-body { font-family: 'Quicksand', sans-serif; }
    .font-mono { font-family: 'Space Mono', monospace; }
    @keyframes floaty { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-8px) rotate(var(--r,0deg)); } }
    .floaty { animation: floaty 5s ease-in-out infinite; }
  `}</style>
);

// ---------- Palette: matcha + blush ----------
const C = {
  ink: "#5B4A42",
  inkSoft: "#A48F82",
  paper: "#FFF8F2",
  paperDim: "#FBEDE4",
  matcha: "#8FAE7D",
  matchaDeep: "#6B8A5A",
  blush: "#F3B6C0",
  blushDeep: "#E2879A",
  cream: "#FFFDF9",
  line: "#F3DCE1",
};
// legacy aliases used across the file
C.brass = C.blushDeep;
C.brassDeep = C.matchaDeep;
C.moss = C.matcha;
C.rust = "#E38B96";
C.inkSoft2 = C.inkSoft;

// ---------- Subject templates ----------
const chList = (subjectKey, names) =>
  names.map((n, i) => ({ id: `${subjectKey}-${i}`, name: n, lecture: false, rev1: false, rev2: false, custom: false }));

const TEMPLATES = {
  final: {
    FR: { label: "Financial Reporting", short: "FR", color: "#E2879A", emoji: "🌸",
      chapters: ["Framework for Preparation of Financial Statements","Presentation & Disclosures (Ind AS)","Measurement Based on Accounting Policies","Ind AS 115 – Revenue from Contracts","Ind AS on Assets","Ind AS on Liabilities","Ind AS on Items Impacting Financial Statements","Disclosures in Financial Statements","Financial Instruments","Business Combinations & Corporate Restructuring","Consolidated Financial Statements","Analysis of Financial Statements","Integrated Reporting","Corporate Social Responsibility"] },
    AFM: { label: "Advanced Financial Management", short: "AFM", color: "#8FAE7D", emoji: "🍵",
      chapters: ["Financial Policy & Corporate Strategy","Advanced Capital Budgeting","Security Analysis","Security Valuation","Portfolio Management","Securitization","Mutual Funds","Derivatives Analysis & Valuation","Forex Exposure & Risk Management","International Financial Management","Interest Rate Risk Management","Business Valuation","Mergers, Acquisitions & Restructuring","Startup Finance"] },
    AUDIT: { label: "Advanced Auditing & Professional Ethics", short: "Audit", color: "#C9A6D9", emoji: "🎀",
      chapters: ["Quality Control & Engagement Standards","Audit Planning, Strategy & Execution","Materiality, Risk & Internal Control","Audit Evidence","Completion & Review","Reporting","Specialised Areas","Related Services","Review of Financial Information","Prospective Financial Information","Digital Auditing & Data Analytics","Group Audits","Audit of Banks & NBFCs","Audit of Public Sector Undertakings","Internal Audit","Due Diligence, Investigation & Forensic Accounting","Peer Review & Quality Review","Professional Ethics & Liabilities"] },
    DT: { label: "Direct Tax Laws & International Taxation", short: "DT", color: "#F0B15C", emoji: "⭐",
      chapters: ["Taxation of Individuals & HUF (Advanced)","Taxation of Firms, LLP & AOP/BOI","Taxation of Companies","Assessment of Various Entities","Business Restructuring","Charitable & Religious Trusts, NGOs","Tax Planning, Avoidance & Evasion","Deduction, Collection & Recovery of Tax","ICDS","Return of Income & Assessment Procedures","Appeals, Revisions & Settlement","Penalties & Offences","Double Taxation Relief","Transfer Pricing","Non-Resident Taxation","Model Tax Conventions","Application & Interpretation of Tax Treaties","Fundamentals of BEPS","GAAR","Taxation of E-Commerce Transactions"] },
    IDT: { label: "Indirect Tax Laws", short: "IDT", color: "#8FB8D9", emoji: "💫",
      chapters: ["Supply under GST","Charge of GST","Place of Supply","Exemptions from GST","Time of Supply","Value of Supply","Input Tax Credit","Registration","Tax Invoice, Credit & Debit Notes","Accounts, Records & E-way Bill","Payment of Tax","Returns","Import & Export under GST","Refunds","Job Work","Assessment & Audit","Inspection, Search, Seizure & Arrest","Demand & Recovery","Liability in Certain Cases","Offences & Penalties","Appeals & Revision","Advance Ruling","Miscellaneous Provisions","Customs – Levy & Exemptions","Customs – Types of Duty","Classification & Valuation under Customs","Import & Export Procedures","Duty Drawback","Foreign Trade Policy"] },
    IBS: { label: "Integrated Business Solutions", short: "IBS", color: "#E8A87C", emoji: "✨",
      chapters: ["Strategic Management Integration","Financial Management Integration","Risk Management & Case Analysis","Multidisciplinary Case Studies – Practice Sets"] },
  },
  inter: {
    ADVACC: { label: "Advanced Accounting", short: "Adv. Acc.", color: "#E2879A", emoji: "🌸",
      chapters: ["Introduction & Applicability of AS","Framework for Preparation of Financial Statements","AS 1–5","AS 10–17","AS 18–29","Financial Statements of Companies","Buyback & Redemption of Securities","Amalgamation of Companies","Accounting for Branches","Dissolution of Partnership Firms","Accounting for Corporate Restructuring"] },
    LAW: { label: "Corporate & Other Laws", short: "Law", color: "#C9A6D9", emoji: "🎀",
      chapters: ["Preliminary & Incorporation of Company","Prospectus & Allotment of Securities","Share Capital & Debentures","Acceptance of Deposits","Registration of Charges","Management & Administration","Declaration & Payment of Dividend","Accounts of Companies","Audit & Auditors","Companies Incorporated Outside India","The General Clauses Act","Interpretation of Statutes","FEMA – Basics"] },
    TAX: { label: "Taxation", short: "Tax", color: "#8FB8D9", emoji: "💫",
      chapters: ["Basic Concepts of Income Tax","Residence & Scope of Total Income","Heads of Income","Clubbing & Set-off of Losses","Deductions from Gross Total Income","Computation of Total Income & Tax Liability","Advance Tax, TDS & TCS","Filing of Return of Income","GST – Supply & Levy","GST – Input Tax Credit & Registration","GST – Returns & Payment"] },
    CMA: { label: "Cost & Management Accounting", short: "CMA", color: "#8FAE7D", emoji: "🍵",
      chapters: ["Introduction to Cost & Management Accounting","Material Cost","Employee Cost & Direct Expenses","Overheads – Absorption Costing","Activity Based Costing","Cost Sheet","Cost Accounting Systems","Unit & Batch Costing","Job & Contract Costing","Process & Operation Costing","Joint Products & By-Products","Service Costing","Standard Costing","Marginal Costing","Budget & Budgetary Control"] },
    AUDIT: { label: "Auditing & Ethics", short: "Audit", color: "#F0B15C", emoji: "⭐",
      chapters: ["Nature, Objective & Scope of Audit","Audit Strategy, Planning & Programme","Risk Assessment & Internal Control","Audit Evidence","Audit of Items of Financial Statements","Audit Documentation","Completion & Review","Audit Report","Special Features of Audit of Different Entities","Audit of Banks","Ethics & Terms of Audit Engagements"] },
    FSM: { label: "Financial & Strategic Management", short: "FSM", color: "#E8A87C", emoji: "✨",
      chapters: ["Scope & Objectives of Financial Management","Types of Financing","Ratio Analysis & Financial Planning","Cost of Capital","Capital Structure Decisions","Leverages","Investment Decisions","Dividend Decision","Working Capital Management","Introduction to Strategic Management","Business Environment & Strategy","Strategy Formulation","Strategy Implementation & Evaluation"] },
  },
};

const buildDefaultSubject = (level, key) => {
  const t = TEMPLATES[level][key];
  return { chapters: chList(key, t.chapters), mock: false };
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const fmtTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

function subjectProgress(subjData) {
  if (!subjData) return 0;
  const n = subjData.chapters.length;
  if (n === 0) return subjData.mock ? 100 : 0;
  const total = n * 3 + 1;
  let done = subjData.mock ? 1 : 0;
  subjData.chapters.forEach((c) => {
    done += (c.lecture ? 1 : 0) + (c.rev1 ? 1 : 0) + (c.rev2 ? 1 : 0);
  });
  return Math.round((done / total) * 100);
}

// ---------- Stamp checkbox (cute icon per stage) ----------
const STAMP_ICONS = { Lec: Heart, "Rev 1": Star, "Rev 2": Sparkles };
const Stamp = ({ checked, onClick, label, color }) => {
  const Icon = STAMP_ICONS[label] || Heart;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
      aria-pressed={checked}
      aria-label={label}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
        style={{
          border: `2px solid ${checked ? color : C.line}`,
          background: checked ? color : C.cream,
          transform: checked ? "scale(1.08) rotate(-6deg)" : "none",
        }}
      >
        <Icon size={14} color={checked ? "#fff" : C.line} fill={checked ? "#fff" : "none"} strokeWidth={2} />
      </div>
      <span className="text-[10px] font-body tracking-wide" style={{ color: C.inkSoft }}>
        {label}
      </span>
    </button>
  );
};

export default function App() {
  const [view, setView] = useState("loading"); // loading, auth, home, subjects, chapter, room
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [knownProfiles, setKnownProfiles] = useState([]);
  const [level, setLevel] = useState(null); // final | inter
  const [profile, setProfile] = useState(null); // {final:{}, inter:{}}
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newChapterInput, setNewChapterInput] = useState("");
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Study room state
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const timerRef = useRef(null);
  const pingRef = useRef(null);
  const pollRef = useRef(null);

  // -------- Boot: list known local profiles --------
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.list("profile:", false);
        const names = (res?.keys || []).map((k) => k.replace("profile:", ""));
        setKnownProfiles(names);
      } catch (e) {
        // no profiles yet
      }
      setView("auth");
    })();
  }, []);

  const loadProfileData = useCallback(async (n) => {
    try {
      const res = await window.storage.get(`profile:${n}`, false);
      if (res?.value) return JSON.parse(res.value);
    } catch (e) {}
    return { final: {}, inter: {} };
  }, []);

  const loadStreak = useCallback(async (n) => {
    try {
      const res = await window.storage.get(`streak:${n}`, false);
      if (res?.value) return JSON.parse(res.value);
    } catch (e) {}
    return { count: 0, lastDate: null };
  }, []);

  const saveProfile = async (n, p) => {
    setSaving(true);
    try {
      await window.storage.set(`profile:${n}`, JSON.stringify(p), false);
    } catch (e) {
      setError("Couldn't save just now — check your connection and try again.");
    }
    setSaving(false);
  };

  const saveStreak = async (n, s) => {
    try {
      await window.storage.set(`streak:${n}`, JSON.stringify(s), false);
    } catch (e) {}
  };

  const handleSignIn = async (n) => {
    const clean = n.trim();
    if (!clean) return;
    setName(clean);
    const [p, s] = await Promise.all([loadProfileData(clean), loadStreak(clean)]);
    setProfile(p);
    setStreak(s);
    setView("home");
  };

  const handleSignOut = () => {
    stopSession();
    setName("");
    setProfile(null);
    setLevel(null);
    setSelectedSubject(null);
    setView("auth");
  };

  const openLevel = (lvl) => {
    setLevel(lvl);
    setView("subjects");
  };

  const openSubject = (key) => {
    setSelectedSubject(key);
    setProfile((prev) => {
      const next = { ...prev, [level]: { ...prev[level] } };
      if (!next[level][key]) next[level][key] = buildDefaultSubject(level, key);
      return next;
    });
    setView("chapter");
  };

  const toggleField = (subjKey, chapterId, field) => {
    setProfile((prev) => {
      const subj = prev[level][subjKey];
      const chapters = subj.chapters.map((c) =>
        c.id === chapterId ? { ...c, [field]: !c[field] } : c
      );
      const next = { ...prev, [level]: { ...prev[level], [subjKey]: { ...subj, chapters } } };
      saveProfile(name, next);
      return next;
    });
  };

  const toggleMock = (subjKey) => {
    setProfile((prev) => {
      const subj = prev[level][subjKey];
      const next = { ...prev, [level]: { ...prev[level], [subjKey]: { ...subj, mock: !subj.mock } } };
      saveProfile(name, next);
      return next;
    });
  };

  const addChapter = (subjKey) => {
    const trimmed = newChapterInput.trim();
    if (!trimmed) return;
    setProfile((prev) => {
      const subj = prev[level][subjKey];
      const newCh = { id: `${subjKey}-custom-${Date.now()}`, name: trimmed, lecture: false, rev1: false, rev2: false, custom: true };
      const next = { ...prev, [level]: { ...prev[level], [subjKey]: { ...subj, chapters: [...subj.chapters, newCh] } } };
      saveProfile(name, next);
      return next;
    });
    setNewChapterInput("");
  };

  const removeChapter = (subjKey, chapterId) => {
    setProfile((prev) => {
      const subj = prev[level][subjKey];
      const chapters = subj.chapters.filter((c) => c.id !== chapterId);
      const next = { ...prev, [level]: { ...prev[level], [subjKey]: { ...subj, chapters } } };
      saveProfile(name, next);
      return next;
    });
  };

  // -------- Study room logic --------
  const registerStreakToday = async () => {
    const today = todayStr();
    if (streak.lastDate === today) return;
    const isConsecutive = streak.lastDate === yesterdayStr();
    const next = { count: isConsecutive ? streak.count + 1 : 1, lastDate: today };
    setStreak(next);
    await saveStreak(name, next);
  };

  const pollActive = useCallback(async () => {
    try {
      const res = await window.storage.list("room:", true);
      const keys = res?.keys || [];
      const now = Date.now();
      const users = [];
      for (const k of keys) {
        try {
          const r = await window.storage.get(k, true);
          if (r?.value) {
            const d = JSON.parse(r.value);
            if (now - d.ts < 45000) users.push(d);
          }
        } catch (e) {}
      }
      users.sort((a, b) => a.sessionStart - b.sessionStart);
      setActiveUsers(users);
    } catch (e) {}
  }, []);

  const startSession = async () => {
    setRunning(true);
    registerStreakToday();
    const sessionStart = Date.now() - sessionSeconds * 1000;
    const ping = async () => {
      try {
        await window.storage.set(
          `room:${name}`,
          JSON.stringify({ name, ts: Date.now(), sessionStart }),
          true
        );
      } catch (e) {}
    };
    ping();
    pingRef.current = setInterval(ping, 8000);
    timerRef.current = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    pollActive();
    pollRef.current = setInterval(pollActive, 6000);
  };

  const stopSession = async () => {
    setRunning(false);
    clearInterval(timerRef.current);
    clearInterval(pingRef.current);
    clearInterval(pollRef.current);
    try {
      if (name) await window.storage.delete(`room:${name}`, true);
    } catch (e) {}
  };

  useEffect(() => () => stopSession(), []); // cleanup on unmount

  // ---------- RENDER ----------
  const bgStyle = {
    background: `linear-gradient(160deg, ${C.paper} 0%, #FDF3F5 55%, #F3F8ED 100%)`,
    minHeight: "100vh",
    color: C.ink,
  };

  if (view === "loading") {
    return (
      <div style={bgStyle} className="flex items-center justify-center">
        <FontStyles />
        <p className="font-body text-sm" style={{ color: C.inkSoft }}>Opening the register…</p>
      </div>
    );
  }

  // ---- AUTH ----
  if (view === "auth") {
    return (
      <div style={bgStyle} className="min-h-screen flex flex-col items-center justify-center px-6 font-body relative overflow-hidden">
        <FontStyles />
        <Star size={18} color={C.blushDeep} fill={C.blush} className="floaty absolute top-10 left-8" style={{ "--r": "-10deg" }} />
        <Heart size={16} color={C.blushDeep} fill={C.blush} className="floaty absolute top-24 right-10" style={{ animationDelay: "1s", "--r": "8deg" }} />
        <Sparkles size={20} color={C.matchaDeep} className="floaty absolute bottom-24 left-10" style={{ animationDelay: "2s" }} />
        <Star size={14} color={C.matchaDeep} fill={C.matcha} className="floaty absolute bottom-16 right-12" style={{ animationDelay: "0.5s", "--r": "12deg" }} />

        <div className="w-full max-w-sm relative">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase mb-3 flex items-center justify-center gap-1.5" style={{ color: C.matchaDeep }}>
              <Sparkles size={12} /> study with me <Sparkles size={12} />
            </p>
            <h1 className="font-display text-4xl leading-tight" style={{ color: C.ink }}>
              your cozy<br />reading room 🍵
            </h1>
            <p className="text-sm mt-3" style={{ color: C.inkSoft }}>
              chapters, revisions, mocks — and a little room that keeps you consistent
            </p>
          </div>

          <div className="rounded-3xl p-6" style={{ background: "#FFFDFA", border: `1.5px solid ${C.line}`, boxShadow: `0 8px 24px -12px ${C.blush}` }}>
            <label className="text-xs uppercase tracking-wide font-medium block mb-2" style={{ color: C.inkSoft }}>
              your name 💌
            </label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn(nameInput)}
              placeholder="e.g. Naina"
              className="w-full px-4 py-2.5 rounded-full outline-none font-body text-base"
              style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
            />
            <button
              onClick={() => handleSignIn(nameInput)}
              className="w-full mt-3 py-2.5 rounded-full font-medium text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
              style={{ background: `linear-gradient(90deg, ${C.blushDeep}, ${C.matchaDeep})`, color: "#fff" }}
            >
              enter <Heart size={13} fill="#fff" />
            </button>
            <p className="text-[11px] mt-3 leading-snug text-center" style={{ color: C.inkSoft }}>
              no password — just a name, so this device remembers your progress. anyone on this page can join the study room ✨
            </p>
          </div>

          {knownProfiles.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: C.inkSoft }}>continue as</p>
              <div className="flex flex-wrap gap-2">
                {knownProfiles.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSignIn(n)}
                    className="px-3 py-1.5 rounded-full text-sm"
                    style={{ background: C.paperDim, border: `1px solid ${C.line}`, color: C.ink }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const streakDots = Array.from({ length: Math.min(streak.count, 7) });

  const TopBar = ({ title, onBack }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1 rounded hover:opacity-70">
            <ChevronLeft size={20} color={C.ink} />
          </button>
        )}
        <h2 className="font-display text-2xl" style={{ color: C.ink }}>{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm font-mono" style={{ color: C.brassDeep }}>
          <Heart size={15} fill={streak.count > 0 ? C.blushDeep : "none"} color={C.blushDeep} />
          {streak.count}
        </div>
        <button onClick={handleSignOut} className="p-1.5 rounded hover:opacity-70" aria-label="Sign out">
          <LogOut size={17} color={C.inkSoft} />
        </button>
      </div>
    </div>
  );

  // ---- HOME ----
  if (view === "home") {
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto">
        <FontStyles />
        <TopBar title={`Namaste, ${name}`} />
        <p className="text-sm mb-6" style={{ color: C.inkSoft }}>Pick where you're studying from today.</p>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <button
            onClick={() => openLevel("final")}
            className="text-left p-5 rounded-2xl transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(120deg, ${C.blushDeep}, ${C.blush})`, color: "#fff" }}
          >
            <p className="text-xs uppercase tracking-wide opacity-80 mb-1 flex items-center gap-1"><Star size={11} fill="#fff" /> Level</p>
            <p className="font-display text-2xl">CA Final</p>
            <p className="text-xs mt-1 opacity-80">FR · AFM · Audit · DT · IDT · IBS</p>
          </button>
          <button
            onClick={() => openLevel("inter")}
            className="text-left p-5 rounded-2xl transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(120deg, ${C.matchaDeep}, ${C.matcha})`, color: "#fff" }}
          >
            <p className="text-xs uppercase tracking-wide opacity-80 mb-1 flex items-center gap-1"><Star size={11} fill="#fff" /> Level</p>
            <p className="font-display text-2xl">CA Intermediate</p>
            <p className="text-xs mt-1 opacity-80">Adv. Acc · Law · Tax · CMA · Audit · FSM</p>
          </button>
        </div>

        <button
          onClick={() => setView("room")}
          className="w-full flex items-center justify-between p-5 rounded-2xl mt-2"
          style={{ background: "#FFFDFA", border: `1.5px dashed ${C.blushDeep}`, color: C.ink }}
        >
          <div className="text-left">
            <p className="font-display text-xl flex items-center gap-1.5">Study With Me — Live Room <Sparkles size={16} color={C.blushDeep} /></p>
            <p className="text-xs mt-0.5" style={{ color: C.inkSoft }}>Start a timer, hold your streak, study alongside others</p>
          </div>
          <Users size={22} color={C.blushDeep} />
        </button>
      </div>
    );
  }

  // ---- SUBJECT LIST ----
  if (view === "subjects") {
    const subjKeys = Object.keys(TEMPLATES[level]);
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto">
        <FontStyles />
        <TopBar title={level === "final" ? "CA Final" : "CA Intermediate"} onBack={() => setView("home")} />
        <div className="flex flex-col gap-3">
          {subjKeys.map((key) => {
            const t = TEMPLATES[level][key];
            const subjData = profile[level][key];
            const pct = subjectProgress(subjData);
            return (
              <button
                key={key}
                onClick={() => openSubject(key)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left"
                style={{ background: "#FFFDF8", border: `1px solid ${C.line}` }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: t.color + "33", border: `1.5px solid ${t.color}` }}
                >
                  {t.emoji || "📎"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: C.ink }}>{t.label}</p>
                  <div className="w-full h-1.5 rounded-full mt-2" style={{ background: C.paperDim }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: t.color }} />
                  </div>
                </div>
                <span className="text-xs font-mono shrink-0" style={{ color: C.inkSoft }}>{pct}%</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- CHAPTER DETAIL ----
  if (view === "chapter" && selectedSubject) {
    const t = TEMPLATES[level][selectedSubject];
    const subjData = profile[level][selectedSubject];
    const pct = subjectProgress(subjData);
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto pb-16">
        <FontStyles />
        <TopBar title={t.label} onBack={() => setView("subjects")} />

        <div className="flex items-center justify-between mb-5 p-3 rounded-2xl" style={{ background: t.color + "22" }}>
          <span className="text-xs font-medium" style={{ color: C.ink }}>Overall progress</span>
          <span className="font-mono text-sm font-bold" style={{ color: t.color }}>{pct}%</span>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {subjData.chapters.map((c, idx) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: "#FFFDF8", border: `1px solid ${C.line}` }}
            >
              <span className="font-mono text-xs w-5 shrink-0" style={{ color: C.inkSoft }}>{idx + 1}</span>
              <p className="flex-1 text-sm min-w-0" style={{ color: C.ink }}>{c.name}</p>
              <div className="flex gap-2 shrink-0">
                <Stamp checked={c.lecture} onClick={() => toggleField(selectedSubject, c.id, "lecture")} label="Lec" color={t.color} />
                <Stamp checked={c.rev1} onClick={() => toggleField(selectedSubject, c.id, "rev1")} label="Rev 1" color={t.color} />
                <Stamp checked={c.rev2} onClick={() => toggleField(selectedSubject, c.id, "rev2")} label="Rev 2" color={t.color} />
              </div>
              {c.custom && (
                <button onClick={() => removeChapter(selectedSubject, c.id)} className="shrink-0 opacity-40 hover:opacity-100">
                  <Trash2 size={14} color={C.rust} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            value={newChapterInput}
            onChange={(e) => setNewChapterInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChapter(selectedSubject)}
            placeholder="Add a chapter you missed…"
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: `1px solid ${C.line}`, background: C.paper, color: C.ink }}
          />
          <button
            onClick={() => addChapter(selectedSubject)}
            className="px-3 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.blushDeep}, ${C.matchaDeep})`, color: "#fff" }}
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => toggleMock(selectedSubject)}
          className="w-full flex items-center justify-between p-4 rounded-2xl transition-opacity"
          style={{
            background: subjData.mock ? t.color : "#FFFDF8",
            border: `1.5px solid ${t.color}`,
          }}
        >
          <div className="text-left flex items-center gap-3">
            <BookOpen size={18} color={subjData.mock ? "#FFFDF8" : t.color} />
            <div>
              <p className="font-medium text-sm" style={{ color: subjData.mock ? "#FFFDF8" : C.ink }}>
                Full-syllabus mock test
              </p>
              <p className="text-[11px]" style={{ color: subjData.mock ? "#FFFDF8CC" : C.inkSoft }}>
                {subjData.mock ? "Cleared — mark it done" : "Tick off once attempted"}
              </p>
            </div>
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ border: `2px solid ${subjData.mock ? "#FFFDF8" : t.color}`, background: subjData.mock ? "#FFFDF8" : "transparent" }}
          >
            {subjData.mock && <Check size={15} color={t.color} strokeWidth={3} />}
          </div>
        </button>

        {saving && <p className="text-[11px] text-center mt-3" style={{ color: C.inkSoft }}>Saving…</p>}
        {error && <p className="text-[11px] text-center mt-3" style={{ color: C.rust }}>{error}</p>}
      </div>
    );
  }

  // ---- STUDY ROOM ----
  if (view === "room") {
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto flex flex-col">
        <FontStyles />
        <TopBar title="Live Room" onBack={() => { stopSession(); setView("home"); }} />

        <div className="flex flex-col items-center py-8 rounded-2xl mb-6" style={{ background: `linear-gradient(135deg, ${C.matchaDeep}, ${C.blushDeep})` }}>
          <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "#fff" }}>
            {running ? "studying now" : "ready when you are"} <Sparkles size={12} />
          </p>
          <p className="font-mono text-5xl font-bold" style={{ color: "#fff" }}>{fmtTime(sessionSeconds)}</p>
          <button
            onClick={() => (running ? stopSession() : startSession())}
            className="mt-6 px-8 py-3 rounded-full font-medium text-sm flex items-center gap-2"
            style={{ background: "#fff", color: running ? C.blushDeep : C.matchaDeep }}
          >
            <Timer size={16} />
            {running ? "end session" : "start studying"}
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: C.ink }}>Your streak</p>
          <div className="flex items-center gap-1">
            {streakDots.map((_, i) => (
              <Heart key={i} size={14} fill={C.blushDeep} color={C.blushDeep} />
            ))}
            {streak.count > 7 && <span className="text-xs font-mono" style={{ color: C.brassDeep }}>+{streak.count - 7}</span>}
            {streak.count === 0 && <span className="text-xs" style={{ color: C.inkSoft }}>Start a session to light it</span>}
          </div>
        </div>
        <p className="text-xs mb-6" style={{ color: C.inkSoft }}>
          {streak.count > 0 ? `${streak.count} day${streak.count > 1 ? "s" : ""} in a row. One session a day keeps it alive.` : "Streaks count once per calendar day."}
        </p>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} color={C.inkSoft} />
            <p className="text-sm font-medium" style={{ color: C.ink }}>
              Studying with you {activeUsers.length > 0 ? `(${activeUsers.length})` : ""}
            </p>
          </div>
          {activeUsers.length === 0 ? (
            <div className="p-5 rounded-2xl text-center" style={{ background: "#FFFDF8", border: `1px dashed ${C.line}` }}>
              <p className="text-xs" style={{ color: C.inkSoft }}>
                No one else is here right now — start your timer and be the first. Anyone who opens this same page can see you're studying.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeUsers.map((u) => (
                <div key={u.name} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "#FFFDF8", border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: C.moss }} />
                    <span className="text-sm" style={{ color: C.ink }}>{u.name}{u.name === name ? " (you)" : ""}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: C.inkSoft }}>
                    {fmtTime(Math.floor((Date.now() - u.sessionStart) / 1000))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
