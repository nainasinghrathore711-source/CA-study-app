import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Star, Sparkles, Plus, Timer, LogOut, ChevronLeft, Users, BookOpen, Trash2, Check } from "lucide-react";
import { supabase } from "./storage.js";

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
      chapters: ["Introduction to Ind AS & Schedule III","Conceptual Framework for Financial Reporting under Ind AS","Ind AS 1 – Presentation of Financial Statements","Ind AS 2 – Inventories","Ind AS 7 – Statement of Cash Flow","Ind AS 8 – Accounting Policies, Changes in Accounting Estimates & Errors","Ind AS 10 – Events After the Reporting Period","Ind AS 12 – Income Taxes","Ind AS 16 – Property, Plant & Equipment","Ind AS 19 – Employee Benefits","Ind AS 20 – Government Grants & Disclosure of Government Assistance","Ind AS 21 – Effects of Changes in Foreign Exchange Rates","Ind AS 23 – Borrowing Costs","Ind AS 24 – Related Party Disclosures","Ind AS 33 – Earnings Per Share","Ind AS 34 – Interim Financial Reporting","Ind AS 36 – Impairment of Assets","Ind AS 37 – Provisions, Contingent Liabilities & Contingent Assets","Ind AS 38 – Intangible Assets","Ind AS 40 – Investment Property","Ind AS 41 – Agriculture","Ind AS 101 – First Time Adoption of Ind AS","Ind AS 105 – Non-Current Assets Held for Sale & Discontinued Operations","Ind AS 108 – Operating Segments","Ind AS 113 – Fair Value Measurement","Ind AS 115 – Revenue from Contracts with Customers","Ind AS 116 – Leases","Ind AS 102 – Share Based Payments","Ind AS 103 – Business Combinations","Ind AS 110/27/112 – Consolidated & Separate Financial Statements","Ind AS 111 – Joint Arrangements","Ind AS 28 – Investments in Associates & Joint Ventures","Ind AS 32, 107, 109 – Financial Instruments","Professional & Ethical Duty of a Chartered Accountant","Accounting & Technology"] },
    AFM: { label: "Advanced Financial Management", short: "AFM", color: "#8FAE7D", emoji: "🍵",
      chapters: ["Financial Policy and Corporate Strategy","Risk Management","Advanced Capital Budgeting Decisions","Security Analysis","Security Valuation","Portfolio Management","Securitization","Mutual Funds","Derivatives Analysis and Valuation","Foreign Exchange Exposure and Risk Management","International Financial Management","Interest Rate Risk Management","Business Valuation","Mergers, Acquisitions and Corporate Restructuring","Startup Finance"] },
    AUDIT: { label: "Advanced Auditing & Professional Ethics", short: "Audit", color: "#C9A6D9", emoji: "🎀",
      chapters: ["Basics of Audit (SA 200, Audit Procedures, SA 210/230)","SQC-1 + Standards on Auditing (200–700 Series)","Professional Ethics","CARO 2020","Company Audit","Audit Planning","Risk Assessment & Internal Control","Group Audit","Bank Audit","NBFC Audit","PSU Audit","Internal Audit","SA 610 – Using the Work of Internal Auditors","Due Diligence","Forensic Accounting","Investigation","SA 800 Series","SRE – Standards on Review Engagements","SAE – Standards on Assurance Engagements","SRS – Standards on Related Services","SDG & ESG Assurance","Digital Audit"] },
    DT: { label: "Direct Tax Laws & International Taxation", short: "DT", color: "#F0B15C", emoji: "⭐",
      chapters: ["Basics, Tax Rates AY 26-27 & Alternate Taxation Regime","Income from Capital Gains","Income from Other Sources","Taxation of Dividend & Deemed Dividend","Taxation in Case of Liquidation & Buy Back","Taxation in Case of Amalgamation and Demerger","Profits & Gains of Business or Profession","Income Computation & Disclosure Standards (ICDS)","Taxation of Political Parties & Electoral Trust","Taxation in Case of Firm/LLP","Taxation in Case of AOP/BOI","Taxation of Business Trust","Taxation of Investment Fund","Taxation of Securitisation Trust","Minimum Alternate Tax","Alternate Minimum Tax","Deduction u/s 10AA (SEZ)","Deduction under Chapter VI-A","Clubbing of Income","Set-Off & Carry Forward of Losses","Advance Tax, TDS & TCS","Assessment Procedure","Appeals & Revisions","Dispute Resolution Committee","Miscellaneous Provisions","Penalties & Prosecutions","The Black Money Act, 2015","GAAR","Taxation of VDA","Exempt Income","Tonnage Taxation","Taxation of Trust & Institutions","Tax Audit & Ethical Compliance","Transfer Pricing","Non-Resident & NRI Taxation","Double Taxation Relief (DTAA)","Advance Ruling (BOAR)","Model Tax Conventions (MTC)","Application & Interpretation of Tax Treaties","Base Erosion & Profit Shifting (BEPS)","Latest Developments in International Taxation","Foreign Tax Credit Rule","Conversion of Foreign Income into Indian Currency","Remaining Case Laws & Concepts"] },
    IDT: { label: "Indirect Tax Laws", short: "IDT", color: "#8FB8D9", emoji: "💫",
      chapters: ["Basics – GST Introduction","Supply under GST","Charge of GST","Exemptions from GST","Place of Supply","Time of Supply","Value of Supply","Input Tax Credit","Registration","Tax Invoice, Credit Notes & Debit Notes","Demand & Recovery","Assessment & Audit","Inspection, Search, Seizure & Arrest","Appeals & Revisions","Offences & Penalties","Advance Ruling","Payment of Tax; TDS & TCS","Liability to Pay in Certain Cases","Refunds (GST)","Returns under GST","Accounts & Records; E-Way Bill","Job Work","Miscellaneous Provisions (GST)","Ethical Aspects under GST","Customs – Basic Provisions","Customs – Levy & Exemptions","Customs – Types of Duty","Customs – Import Export Procedure","Customs – Valuation under the Customs Act, 1962","Customs – Baggage","Customs – Warehousing","Customs – Refunds","Foreign Trade Policy 2023"] },
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
  return { chapters: chList(key, t.chapters), mocks: [{ attempted: false, marks: null }, { attempted: false, marks: null }] };
};

const pad2 = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const fmtDate = (isoDate) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
const fmtTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ---------- Mocks: always exactly 2 slots, migrates legacy single-mock data ----------
function normalizeSubject(subj) {
  const base = subj || {};
  const chapters = base.chapters || [];
  let mocks = base.mocks;
  if (!mocks) {
    mocks = [
      { attempted: !!base.mock, marks: null },
      { attempted: false, marks: null },
    ];
  }
  while (mocks.length < 2) mocks.push({ attempted: false, marks: null });
  return { chapters, mocks: mocks.slice(0, 2) };
}

// ---------- Custom (student-added) subject helpers ----------
const CUSTOM_COLORS = ["#E2879A", "#8FAE7D", "#C9A6D9", "#F0B15C", "#8FB8D9", "#E8A87C"];
const CUSTOM_EMOJIS = ["📘", "🌱", "🎯", "📚", "🧠", "🔖"];

const getSubj = (profile, level, key) =>
  level === "custom" ? profile.custom?.[key] : profile[level]?.[key];

const setSubjIn = (profile, level, key, subj) =>
  level === "custom"
    ? { ...profile, custom: { ...(profile.custom || {}), [key]: subj } }
    : { ...profile, [level]: { ...profile[level], [key]: subj } };

// ---------- A short chime + best-effort system notification ----------
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

function subjectProgress(subjData) {
  if (!subjData) return 0;
  const s = normalizeSubject(subjData);
  const n = s.chapters.length;
  const mockDone = s.mocks.filter((m) => m.attempted).length;
  if (n === 0) return Math.round((mockDone / s.mocks.length) * 100);
  const total = n * 3 + s.mocks.length;
  let done = mockDone;
  s.chapters.forEach((c) => {
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
  const [view, setView] = useState("loading"); // loading, auth, home, subjects, chapter, room, history, todo
  const [uid, setUid] = useState(null); // supabase user id — used for storage keys
  const [name, setName] = useState(""); // display name shown in the app
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [level, setLevel] = useState(null); // final | inter | custom
  const [profile, setProfile] = useState(null); // {final:{}, inter:{}, custom:{}}
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newChapterInput, setNewChapterInput] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Study room state
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [dailySeconds, setDailySeconds] = useState(0); // today's accumulated study time
  const [targetMinutes, setTargetMinutes] = useState(null); // 50 | 60 | 90 | null (open-ended)
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Daily to-do list — resets fresh each calendar day
  const [todos, setTodos] = useState([]);
  const [todosDate, setTodosDate] = useState(null);
  const [newTodoInput, setNewTodoInput] = useState("");

  const timerRef = useRef(null);
  const sessionStartRef = useRef(null);
  const pingRef = useRef(null);
  const pollRef = useRef(null);
  const targetNotifiedRef = useRef(false);

  const STREAK_THRESHOLD_SECONDS = 6 * 60 * 60; // 6 hours/day to count toward a streak

  const loadProfileData = useCallback(async (id) => {
    try {
      const res = await window.storage.get(`profile:${id}`, false);
      if (res?.value) {
        const p = JSON.parse(res.value);
        return { final: p.final || {}, inter: p.inter || {}, custom: p.custom || {} };
      }
    } catch (e) {}
    return { final: {}, inter: {}, custom: {} };
  }, []);

  const loadStreak = useCallback(async (id) => {
    try {
      const res = await window.storage.get(`streak:${id}`, false);
      if (res?.value) return JSON.parse(res.value);
    } catch (e) {}
    return { count: 0, lastDate: null };
  }, []);

  // One key per calendar day (dailylog:{uid}:{date}) so history persists forever.
  const loadDailySeconds = useCallback(async (id) => {
    try {
      const res = await window.storage.get(`dailylog:${id}:${todayStr()}`, false);
      if (res?.value) return JSON.parse(res.value).seconds || 0;
    } catch (e) {}
    return 0;
  }, []);

  const loadTodos = useCallback(async (id) => {
    try {
      const res = await window.storage.get(`todos:${id}:${todayStr()}`, false);
      if (res?.value) return JSON.parse(res.value);
    } catch (e) {}
    return [];
  }, []);

  const saveTodos = async (id, date, list) => {
    try {
      await window.storage.set(`todos:${id}:${date}`, JSON.stringify(list), false);
    } catch (e) {}
  };

  const loadHistory = useCallback(async (id) => {
    try {
      const res = await window.storage.list(`dailylog:${id}:`, false);
      const keys = res?.keys || [];
      const entries = [];
      for (const k of keys) {
        try {
          const r = await window.storage.get(k, false);
          if (r?.value) {
            const date = k.split(":").pop();
            entries.push({ date, seconds: JSON.parse(r.value).seconds || 0 });
          }
        } catch (e) {}
      }
      entries.sort((a, b) => b.date.localeCompare(a.date));
      return entries;
    } catch (e) {
      return [];
    }
  }, []);

  const registerStreakToday = async () => {
    const today = todayStr();
    if (streak.lastDate === today) return;
    const isConsecutive = streak.lastDate === yesterdayStr();
    const next = { count: isConsecutive ? streak.count + 1 : 1, lastDate: today };
    setStreak(next);
    await saveStreak(uid, next);
  };

  // total seconds studied today, including the live session in progress
  const todaysTotalSeconds = (liveSeconds = 0) => dailySeconds + liveSeconds;

  const checkStreakThreshold = async (liveSeconds = 0) => {
    if (todaysTotalSeconds(liveSeconds) >= STREAK_THRESHOLD_SECONDS) {
      await registerStreakToday();
    }
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

  // id/displayName/targetMin are passed explicitly (not read from state) so this
  // works correctly whether called right after sign-in/resume or from a button click.
  const beginTimers = (id, displayName, sessionStart, baseSecondsToday, targetMin) => {
    sessionStartRef.current = sessionStart;
    setRunning(true);
    const initialElapsed = Math.floor((Date.now() - sessionStart) / 1000);
    setSessionSeconds(initialElapsed);
    targetNotifiedRef.current = targetMin ? initialElapsed >= targetMin * 60 : false;

    const ping = async () => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      try {
        await window.storage.set(
          `room:${id}`,
          JSON.stringify({
            name: displayName,
            ts: Date.now(),
            sessionStart,
            targetMinutes: targetMin,
            baseToday: baseSecondsToday,
          }),
          true
        );
      } catch (e) {}
      checkStreakThreshold(elapsed);
    };
    ping();
    pingRef.current = setInterval(ping, 8000);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      setSessionSeconds(elapsed);
      if (targetMin && !targetNotifiedRef.current && elapsed >= targetMin * 60) {
        targetNotifiedRef.current = true;
        playChime();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("Goal reached! 🎉", { body: `You hit your ${targetMin}-minute study goal.` });
          } catch (e) {}
        }
      }
    }, 1000);

    pollActive();
    pollRef.current = setInterval(pollActive, 6000);
  };

  const startSession = async () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    const sessionStart = Date.now();
    beginTimers(uid, name, sessionStart, dailySeconds, targetMinutes);
  };

  // If this account already has a session running (e.g. the tab was
  // reloaded/discarded mid-session), reconnect to it instead of resetting.
  const resumeIfActive = useCallback(async (id, displayName, baseSecondsToday) => {
    try {
      const r = await window.storage.get(`room:${id}`, true);
      if (r?.value) {
        const d = JSON.parse(r.value);
        if (d?.sessionStart) {
          if (d.targetMinutes) setTargetMinutes(d.targetMinutes);
          beginTimers(id, displayName, d.sessionStart, baseSecondsToday, d.targetMinutes || null);
          setView("room");
          return true;
        }
      }
    } catch (e) {}
    return false;
  }, []);

  const enterAppForUser = useCallback(async (user) => {
    const displayName =
      user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Friend";
    setUid(user.id);
    setName(displayName);
    setAvatarUrl(user.user_metadata?.avatar_url || null);
    const [p, s, secs, td] = await Promise.all([
      loadProfileData(user.id),
      loadStreak(user.id),
      loadDailySeconds(user.id),
      loadTodos(user.id),
    ]);
    setProfile(p);
    setStreak(s);
    setDailySeconds(secs);
    setTodos(td);
    setTodosDate(todayStr());
    const resumed = await resumeIfActive(user.id, displayName, secs);
    if (!resumed) setView("home");
  }, [loadProfileData, loadStreak, loadDailySeconds, loadTodos, resumeIfActive]);

  // -------- Boot: check for an existing Google session --------
  useEffect(() => {
    let unsub;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        await enterAppForUser(data.session.user);
      } else {
        setView("auth");
      }
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await enterAppForUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUid(null);
          setName("");
          setProfile(null);
          setView("auth");
        }
      });
      unsub = () => listener?.subscription?.unsubscribe();
    })();
    return () => unsub && unsub();
  }, [enterAppForUser]);

  const saveProfile = async (id, p) => {
    setSaving(true);
    try {
      await window.storage.set(`profile:${id}`, JSON.stringify(p), false);
    } catch (e) {
      setError("Couldn't save just now — check your connection and try again.");
    }
    setSaving(false);
  };

  const saveStreak = async (id, s) => {
    try {
      await window.storage.set(`streak:${id}`, JSON.stringify(s), false);
    } catch (e) {}
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) {
      setError("Couldn't start Google sign-in — try again.");
      setAuthLoading(false);
    }
    // On success, the browser redirects to Google and back; boot effect picks up the session.
  };

  const handleSignOut = async () => {
    stopSession();
    await supabase.auth.signOut();
    setUid(null);
    setName("");
    setProfile(null);
    setLevel(null);
    setSelectedSubject(null);
    setView("auth");
  };

  const openHistory = async () => {
    setView("history");
    setHistoryLoading(true);
    const entries = await loadHistory(uid);
    setHistory(entries);
    setHistoryLoading(false);
  };

  const openLevel = (lvl) => {
    setLevel(lvl);
    setView("subjects");
  };

  const openSubject = (key) => {
    setSelectedSubject(key);
    if (level !== "custom") {
      setProfile((prev) => {
        if (getSubj(prev, level, key)) return prev;
        const next = setSubjIn(prev, level, key, buildDefaultSubject(level, key));
        saveProfile(uid, next);
        return next;
      });
    }
    setView("chapter");
  };

  // Applies a partial update to a subject's {chapters, mocks} while preserving
  // any extra fields (label/color/emoji live on the object itself for custom subjects).
  const updateSubject = (subjKey, updater) => {
    setProfile((prev) => {
      const raw = getSubj(prev, level, subjKey) || (level === "custom" ? null : buildDefaultSubject(level, subjKey));
      if (!raw) return prev;
      const norm = normalizeSubject(raw);
      const patch = updater(norm, raw);
      const merged = { ...raw, ...patch };
      const next = setSubjIn(prev, level, subjKey, merged);
      saveProfile(uid, next);
      return next;
    });
  };

  const toggleField = (subjKey, chapterId, field) => {
    updateSubject(subjKey, (norm) => ({
      chapters: norm.chapters.map((c) => (c.id === chapterId ? { ...c, [field]: !c[field] } : c)),
    }));
  };

  const toggleMockAttempted = (subjKey, idx) => {
    updateSubject(subjKey, (norm) => ({
      mocks: norm.mocks.map((m, i) => (i === idx ? { ...m, attempted: !m.attempted } : m)),
    }));
  };

  const setMockMarks = (subjKey, idx, rawValue) => {
    const num = rawValue === "" ? null : Math.max(0, Math.min(100, Number(rawValue)));
    updateSubject(subjKey, (norm) => ({
      mocks: norm.mocks.map((m, i) => (i === idx ? { ...m, marks: Number.isFinite(num) ? num : null } : m)),
    }));
  };

  const addChapter = (subjKey) => {
    const trimmed = newChapterInput.trim();
    if (!trimmed) return;
    updateSubject(subjKey, (norm) => ({
      chapters: [
        ...norm.chapters,
        { id: `${subjKey}-custom-${Date.now()}`, name: trimmed, lecture: false, rev1: false, rev2: false, custom: true },
      ],
    }));
    setNewChapterInput("");
  };

  const removeChapter = (subjKey, chapterId) => {
    updateSubject(subjKey, (norm) => ({
      chapters: norm.chapters.filter((c) => c.id !== chapterId),
    }));
  };

  const addTodo = () => {
    const trimmed = newTodoInput.trim();
    if (!trimmed) return;
    const date = todayStr();
    const next = [...todos, { id: `t${Date.now()}`, text: trimmed, done: false }];
    setTodos(next);
    setTodosDate(date);
    saveTodos(uid, date, next);
    setNewTodoInput("");
  };

  const toggleTodo = (id) => {
    const date = todosDate || todayStr();
    const next = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(next);
    saveTodos(uid, date, next);
  };

  const removeTodo = (id) => {
    const date = todosDate || todayStr();
    const next = todos.filter((t) => t.id !== id);
    setTodos(next);
    saveTodos(uid, date, next);
  };

  const addCustomSubject = () => {
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;
    const key = `c${Date.now()}`;
    setProfile((prev) => {
      const count = Object.keys(prev.custom || {}).length;
      const newSubj = {
        label: trimmed,
        color: CUSTOM_COLORS[count % CUSTOM_COLORS.length],
        emoji: CUSTOM_EMOJIS[count % CUSTOM_EMOJIS.length],
        chapters: [],
        mocks: [{ attempted: false, marks: null }, { attempted: false, marks: null }],
      };
      const next = setSubjIn(prev, "custom", key, newSubj);
      saveProfile(uid, next);
      return next;
    });
    setNewSubjectName("");
    setSelectedSubject(key);
    setView("chapter");
  };

  const deleteCustomSubject = (key) => {
    setProfile((prev) => {
      const customCopy = { ...(prev.custom || {}) };
      delete customCopy[key];
      const next = { ...prev, custom: customCopy };
      saveProfile(uid, next);
      return next;
    });
  };

  const saveDailySeconds = async (id, date, seconds) => {
    try {
      await window.storage.set(`dailylog:${id}:${date}`, JSON.stringify({ seconds }), false);
    } catch (e) {}
  };

  // -------- Study room logic --------
  const stopSession = async () => {
    const wasRunning = running;
    const finalElapsed = sessionStartRef.current ? Math.floor((Date.now() - sessionStartRef.current) / 1000) : 0;

    // Reset everything the person can see right away — don't make them
    // watch a frozen timer while the save happens in the background.
    setRunning(false);
    clearInterval(timerRef.current);
    clearInterval(pingRef.current);
    clearInterval(pollRef.current);
    setSessionSeconds(0);
    setActiveUsers((prev) => prev.filter((u) => u.name !== name));
    sessionStartRef.current = null;

    if (wasRunning) {
      const today = todayStr();
      const nextTotal = dailySeconds + finalElapsed;
      setDailySeconds(nextTotal);
      await saveDailySeconds(uid, today, nextTotal);
      if (nextTotal >= STREAK_THRESHOLD_SECONDS) await registerStreakToday();
    }
    try {
      if (uid) await window.storage.delete(`room:${uid}`, true);
    } catch (e) {}
  };

  useEffect(() => () => stopSession(), []); // cleanup on unmount

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && running && sessionStartRef.current) {
        setSessionSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [running]);

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
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full py-3 rounded-full font-medium text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#fff", border: `1.5px solid ${C.line}`, color: C.ink }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.5 0-14 4.2-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14.1-5l-6.5-5.5c-2 1.4-4.6 2.5-7.6 2.5-5.3 0-9.7-3.3-11.3-8l-6.6 5C9.9 40.7 16.4 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.5 5.5C41.6 35.5 45 30.5 45 24c0-1.4-.1-2.7-.4-3.5z"/>
              </svg>
              {authLoading ? "opening google…" : "Continue with Google"}
            </button>
            <p className="text-[11px] mt-3 leading-snug text-center" style={{ color: C.inkSoft }}>
              your progress is tied to your Google account, so it's private and follows you across devices ✨
            </p>
            {error && <p className="text-[11px] mt-2 text-center" style={{ color: C.rust }}>{error}</p>}
          </div>
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
        {avatarUrl && (
          <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full" style={{ border: `1.5px solid ${C.blush}` }} />
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
          <button
            onClick={() => openLevel("custom")}
            className="text-left p-5 rounded-2xl transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(120deg, ${C.ink}, ${C.inkSoft})`, color: "#fff" }}
          >
            <p className="text-xs uppercase tracking-wide opacity-80 mb-1 flex items-center gap-1"><Sparkles size={11} /> Your own</p>
            <p className="font-display text-2xl">My Courses</p>
            <p className="text-xs mt-1 opacity-80">Any subject — school, other exams, hobbies</p>
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

        <button
          onClick={() => setView("todo")}
          className="w-full flex items-center justify-between p-5 rounded-2xl mt-3"
          style={{ background: "#FFFDFA", border: `1.5px dashed #E0A93A`, color: C.ink }}
        >
          <div className="text-left">
            <p className="font-display text-xl flex items-center gap-1.5">Today's To-Do ✅</p>
            <p className="text-xs mt-0.5" style={{ color: C.inkSoft }}>
              {todos.length === 0
                ? "Nothing on the list yet — add today's tasks"
                : `${todos.filter((t) => t.done).length} of ${todos.length} done`}
            </p>
          </div>
          <ChevronLeft size={22} color="#E0A93A" style={{ transform: "rotate(180deg)" }} />
        </button>

        <button
          onClick={openHistory}
          className="w-full flex items-center justify-between p-5 rounded-2xl mt-3"
          style={{ background: "#FFFDFA", border: `1.5px dashed ${C.matchaDeep}`, color: C.ink }}
        >
          <div className="text-left">
            <p className="font-display text-xl flex items-center gap-1.5">Study History 📊</p>
            <p className="text-xs mt-0.5" style={{ color: C.inkSoft }}>See every day you've studied — good proof, good perspective</p>
          </div>
          <ChevronLeft size={22} color={C.matchaDeep} style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>
    );
  }

  // ---- SUBJECT LIST ----
  if (view === "subjects") {
    const isCustom = level === "custom";
    const subjKeys = isCustom ? Object.keys(profile.custom || {}) : Object.keys(TEMPLATES[level]);
    const title = level === "final" ? "CA Final" : level === "inter" ? "CA Intermediate" : "My Courses";
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto">
        <FontStyles />
        <TopBar title={title} onBack={() => setView("home")} />
        <div className="flex flex-col gap-3">
          {subjKeys.map((key) => {
            const t = isCustom ? profile.custom[key] : TEMPLATES[level][key];
            const subjData = isCustom ? profile.custom[key] : profile[level][key];
            const pct = subjectProgress(subjData);
            const mocks = subjData ? normalizeSubject(subjData).mocks : [];
            const mockSummary = mocks.some((m) => m.attempted)
              ? mocks.map((m, i) => `M${i + 1}: ${m.attempted ? (m.marks ?? "✓") : "—"}`).join(" · ")
              : null;
            return (
              <div key={key} className="flex items-center gap-2">
                <button
                  onClick={() => openSubject(key)}
                  className="flex-1 flex items-center gap-4 p-4 rounded-2xl text-left"
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
                    {mockSummary && (
                      <p className="text-[10px] mt-1" style={{ color: C.inkSoft }}>{mockSummary}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono shrink-0" style={{ color: C.inkSoft }}>{pct}%</span>
                </button>
                {isCustom && (
                  <button onClick={() => deleteCustomSubject(key)} className="p-2 opacity-40 hover:opacity-100 shrink-0">
                    <Trash2 size={16} color={C.rust} />
                  </button>
                )}
              </div>
            );
          })}

          {isCustom && subjKeys.length === 0 && (
            <div className="p-5 rounded-2xl text-center" style={{ background: "#FFFDF8", border: `1px dashed ${C.line}` }}>
              <p className="text-xs" style={{ color: C.inkSoft }}>No courses yet — add your first one below. Could be a school subject, another exam, or anything you're studying.</p>
            </div>
          )}

          {isCustom && (
            <div className="flex gap-2 mt-1">
              <input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSubject()}
                placeholder="e.g. Economics, GK, Coding…"
                className="flex-1 px-3 py-2.5 rounded-full text-sm outline-none"
                style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
              />
              <button
                onClick={addCustomSubject}
                className="px-4 rounded-full flex items-center justify-center gap-1 text-sm font-medium"
                style={{ background: `linear-gradient(135deg, ${C.blushDeep}, ${C.matchaDeep})`, color: "#fff" }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- CHAPTER DETAIL ----
  if (view === "chapter" && selectedSubject) {
    const isCustom = level === "custom";
    const t = isCustom ? profile.custom[selectedSubject] : TEMPLATES[level][selectedSubject];
    const subjDataRaw = isCustom ? profile.custom[selectedSubject] : profile[level][selectedSubject];
    if (!t || !subjDataRaw) {
      setView("subjects");
      return null;
    }
    const subjData = normalizeSubject(subjDataRaw);
    const pct = subjectProgress(subjDataRaw);
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto pb-16">
        <FontStyles />
        <TopBar title={t.label} onBack={() => setView("subjects")} />

        <div className="flex items-center justify-between mb-5 p-3 rounded-2xl" style={{ background: t.color + "22" }}>
          <span className="text-xs font-medium" style={{ color: C.ink }}>Overall progress</span>
          <span className="font-mono text-sm font-bold" style={{ color: t.color }}>{pct}%</span>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {subjData.chapters.length === 0 && isCustom && (
            <p className="text-xs text-center py-4" style={{ color: C.inkSoft }}>No chapters yet — add your first one below.</p>
          )}
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

        <p className="text-xs font-medium mb-2" style={{ color: C.ink }}>Mock tests</p>
        <div className="flex flex-col gap-3 mb-3">
          {subjData.mocks.map((m, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-4 transition-opacity"
              style={{ background: m.attempted ? t.color : "#FFFDF8", border: `1.5px solid ${t.color}` }}
            >
              <button
                onClick={() => toggleMockAttempted(selectedSubject, idx)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} color={m.attempted ? "#FFFDF8" : t.color} />
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: m.attempted ? "#FFFDF8" : C.ink }}>
                      Mock Test {idx + 1}
                    </p>
                    <p className="text-[11px]" style={{ color: m.attempted ? "#FFFDF8CC" : C.inkSoft }}>
                      {m.attempted ? "Attempted" : "Tick off once attempted"}
                    </p>
                  </div>
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: `2px solid ${m.attempted ? "#FFFDF8" : t.color}`, background: m.attempted ? "#FFFDF8" : "transparent" }}
                >
                  {m.attempted && <Check size={15} color={t.color} strokeWidth={3} />}
                </div>
              </button>
              {m.attempted && (
                <div className="flex items-center gap-2 mt-3 pl-8">
                  <span className="text-xs" style={{ color: "#FFFDF8DD" }}>Marks (out of 100)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={m.marks ?? ""}
                    onChange={(e) => setMockMarks(selectedSubject, idx, e.target.value)}
                    placeholder="—"
                    className="w-16 px-2 py-1 rounded-lg text-sm text-center outline-none"
                    style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.ink }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {saving && <p className="text-[11px] text-center mt-3" style={{ color: C.inkSoft }}>Saving…</p>}
        {error && <p className="text-[11px] text-center mt-3" style={{ color: C.rust }}>{error}</p>}
      </div>
    );
  }

  // ---- STUDY ROOM ----
  if (view === "room") {
    const todaySecs = todaysTotalSeconds(running ? sessionSeconds : 0);
    const todayPct = Math.min(100, Math.round((todaySecs / STREAK_THRESHOLD_SECONDS) * 100));
    const targetSecs = targetMinutes ? targetMinutes * 60 : null;
    const remaining = targetSecs ? Math.max(0, targetSecs - sessionSeconds) : null;
    const hitTarget = targetSecs && sessionSeconds >= targetSecs;

    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto flex flex-col">
        <FontStyles />
        <TopBar title="Live Room" onBack={() => { stopSession(); setView("home"); }} />

        <div className="flex flex-col items-center py-8 rounded-2xl mb-6" style={{ background: `linear-gradient(135deg, ${C.matchaDeep}, ${C.blushDeep})` }}>
          <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "#fff" }}>
            {running ? (hitTarget ? "goal reached — keep going?" : "studying now") : "ready when you are"} <Sparkles size={12} />
          </p>
          <p className="font-mono text-5xl font-bold" style={{ color: "#fff" }}>{fmtTime(sessionSeconds)}</p>
          {running && targetSecs && (
            <p className="text-xs mt-2" style={{ color: "#fff", opacity: 0.85 }}>
              {hitTarget ? `+${fmtTime(sessionSeconds - targetSecs)} past your ${targetMinutes}-min goal` : `${fmtTime(remaining)} left of ${targetMinutes} min`}
            </p>
          )}

          {!running && (
            <div className="flex gap-2 mt-5">
              {[50, 60, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => setTargetMinutes(targetMinutes === m ? null : m)}
                  className="px-4 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: targetMinutes === m ? "#fff" : "rgba(255,255,255,0.18)",
                    color: targetMinutes === m ? C.matchaDeep : "#fff",
                    border: "1.5px solid rgba(255,255,255,0.5)",
                  }}
                >
                  {m} min
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => (running ? stopSession() : startSession())}
            className="mt-5 px-8 py-3 rounded-full font-medium text-sm flex items-center gap-2"
            style={{ background: "#fff", color: running ? C.blushDeep : C.matchaDeep }}
          >
            <Timer size={16} />
            {running ? "end session" : targetMinutes ? `start ${targetMinutes}-min session` : "start studying"}
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium" style={{ color: C.ink }}>Today's study time</p>
            <span className="text-xs font-mono" style={{ color: C.inkSoft }}>{fmtTime(todaySecs)} / 6:00:00</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: C.paperDim }}>
            <div className="h-2 rounded-full" style={{ width: `${todayPct}%`, background: `linear-gradient(90deg, ${C.blushDeep}, ${C.matchaDeep})` }} />
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: C.inkSoft }}>
            {todaySecs >= STREAK_THRESHOLD_SECONDS
              ? "6 hours reached — today's streak is locked in ✨"
              : "Study 6 hours in a day (across as many sessions as you like) to count toward your streak."}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: C.ink }}>Your streak</p>
          <div className="flex items-center gap-1">
            {streakDots.map((_, i) => (
              <Heart key={i} size={14} fill={C.blushDeep} color={C.blushDeep} />
            ))}
            {streak.count > 7 && <span className="text-xs font-mono" style={{ color: C.brassDeep }}>+{streak.count - 7}</span>}
            {streak.count === 0 && <span className="text-xs" style={{ color: C.inkSoft }}>Reach 6 hours today to light it</span>}
          </div>
        </div>
        <p className="text-xs mb-6" style={{ color: C.inkSoft }}>
          {streak.count > 0 ? `${streak.count} day${streak.count > 1 ? "s" : ""} in a row.` : "Streaks count once you cross 6 hours in a day."}
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
                    {fmtTime((u.baseToday || 0) + Math.floor((Date.now() - u.sessionStart) / 1000))} today
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- STUDY HISTORY ----
  if (view === "history") {
    const entries = history || [];
    const totalSecs = entries.reduce((a, e) => a + e.seconds, 0);
    const streakDays = entries.filter((e) => e.seconds >= STREAK_THRESHOLD_SECONDS).length;
    const maxSecs = Math.max(STREAK_THRESHOLD_SECONDS, ...entries.map((e) => e.seconds), 1);
    let lastMonth = null;

    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto pb-16">
        <FontStyles />
        <TopBar title="Study History" onBack={() => setView("home")} />

        {historyLoading ? (
          <p className="text-sm" style={{ color: C.inkSoft }}>Loading your history…</p>
        ) : entries.length === 0 ? (
          <div className="p-5 rounded-2xl text-center" style={{ background: "#FFFDF8", border: `1px dashed ${C.line}` }}>
            <p className="text-xs" style={{ color: C.inkSoft }}>
              No study sessions logged yet — once you start a timer, every day you study will show up here. Good proof for later ✨
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-4 mb-5 flex items-center justify-between" style={{ background: `linear-gradient(120deg, ${C.matchaDeep}, ${C.blushDeep})` }}>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80" style={{ color: "#fff" }}>Total logged</p>
                <p className="font-display text-2xl" style={{ color: "#fff" }}>{fmtTime(totalSecs)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide opacity-80" style={{ color: "#fff" }}>Streak days</p>
                <p className="font-display text-2xl" style={{ color: "#fff" }}>{streakDays} / {entries.length}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {entries.map((e) => {
                const monthKey = e.date.slice(0, 7);
                const showMonth = monthKey !== lastMonth;
                lastMonth = monthKey;
                const pct = Math.min(100, Math.round((e.seconds / maxSecs) * 100));
                const hitStreak = e.seconds >= STREAK_THRESHOLD_SECONDS;
                return (
                  <React.Fragment key={e.date}>
                    {showMonth && (
                      <p className="text-[11px] uppercase tracking-wide mt-3 mb-1" style={{ color: C.inkSoft }}>
                        {new Date(`${monthKey}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                      </p>
                    )}
                    <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#FFFDF8", border: `1px solid ${C.line}` }}>
                      <p className="text-xs font-medium w-20 shrink-0" style={{ color: C.ink }}>{fmtDate(e.date)}</p>
                      <div className="flex-1">
                        <div className="w-full h-2 rounded-full" style={{ background: C.paperDim }}>
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${pct}%`, background: hitStreak ? `linear-gradient(90deg, ${C.blushDeep}, ${C.matchaDeep})` : C.line }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {hitStreak && <Heart size={12} fill={C.blushDeep} color={C.blushDeep} />}
                        <span className="font-mono text-xs" style={{ color: C.inkSoft }}>{fmtTime(e.seconds)}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- TODAY'S TO-DO ----
  if (view === "todo") {
    const doneCount = todos.filter((t) => t.done).length;
    return (
      <div style={bgStyle} className="min-h-screen px-5 py-6 font-body max-w-lg mx-auto pb-16">
        <FontStyles />
        <TopBar title="Today's To-Do" onBack={() => setView("home")} />

        <div className="flex items-center justify-between mb-5 p-3 rounded-2xl" style={{ background: "#E0A93A22" }}>
          <span className="text-xs font-medium" style={{ color: C.ink }}>
            {todos.length === 0 ? "Nothing added yet" : `${doneCount} of ${todos.length} done`}
          </span>
          <span className="text-xs" style={{ color: C.inkSoft }}>{fmtDate(todosDate || todayStr())}</span>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {todos.length === 0 ? (
            <div className="p-5 rounded-2xl text-center" style={{ background: "#FFFDF8", border: `1px dashed ${C.line}` }}>
              <p className="text-xs" style={{ color: C.inkSoft }}>
                A fresh list every day — jot down what you want to get through today.
              </p>
            </div>
          ) : (
            todos.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: "#FFFDF8", border: `1px solid ${C.line}` }}
              >
                <button onClick={() => toggleTodo(t.id)} className="shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{
                      border: `2px solid ${t.done ? "#E0A93A" : C.line}`,
                      background: t.done ? "#E0A93A" : C.cream,
                    }}
                  >
                    {t.done && <Check size={14} color="#fff" strokeWidth={3} />}
                  </div>
                </button>
                <p
                  className="flex-1 text-sm min-w-0"
                  style={{ color: t.done ? C.inkSoft : C.ink, textDecoration: t.done ? "line-through" : "none" }}
                >
                  {t.text}
                </p>
                <button onClick={() => removeTodo(t.id)} className="shrink-0 opacity-40 hover:opacity-100">
                  <Trash2 size={14} color={C.rust} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={newTodoInput}
            onChange={(e) => setNewTodoInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add something for today…"
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: `1px solid ${C.line}`, background: C.paper, color: C.ink }}
          />
          <button
            onClick={addTodo}
            className="px-3 rounded-xl flex items-center justify-center"
            style={{ background: "#E0A93A", color: "#fff" }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
