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
    FR: { label: "Financial Reporting", short: "FR", color: "#E2879A", emoji: "馃尭",
      chapters: ["Introduction to Ind AS & Schedule III","Conceptual Framework for Financial Reporting under Ind AS","Ind AS 1 鈥� Presentation of Financial Statements","Ind AS 2 鈥� Inventories","Ind AS 7 鈥� Statement of Cash Flow","Ind AS 8 鈥� Accounting Policies, Changes in Accounting Estimates & Errors","Ind AS 10 鈥� Events After the Reporting Period","Ind AS 12 鈥� Income Taxes","Ind AS 16 鈥� Property, Plant & Equipment","Ind AS 19 鈥� Employee Benefits","Ind AS 20 鈥� Government Grants & Disclosure of Government Assistance","Ind AS 21 鈥� Effects of Changes in Foreign Exchange Rates","Ind AS 23 鈥� Borrowing Costs","Ind AS 24 鈥� Related Party Disclosures","Ind AS 33 鈥� Earnings Per Share","Ind AS 34 鈥� Interim Financial Reporting","Ind AS 36 鈥� Impairment of Assets","Ind AS 37 鈥� Provisions, Contingent Liabilities & Contingent Assets","Ind AS 38 鈥� Intangible Assets","Ind AS 40 鈥� Investment Property","Ind AS 41 鈥� Agriculture","Ind AS 101 鈥� First Time Adoption of Ind AS","Ind AS 105 鈥� Non-Current Assets Held for Sale & Discontinued Operations","Ind AS 108 鈥� Operating Segments","Ind AS 113 鈥� Fair Value Measurement","Ind AS 115 鈥� Revenue from Contracts with Customers","Ind AS 116 鈥� Leases","Ind AS 102 鈥� Share Based Payments","Ind AS 103 鈥� Business Combinations","Ind AS 110/27/112 鈥� Consolidated & Separate Financial Statements","Ind AS 111 鈥� Joint Arrangements","Ind AS 28 鈥� Investments in Associates & Joint Ventures","Ind AS 32, 107, 109 鈥� Financial Instruments","Professional & Ethical Duty of a Chartered Accountant","Accounting & Technology"] },
    AFM: { label: "Advanced Financial Management", short: "AFM", color: "#8FAE7D", emoji: "馃嵉",
      chapters: ["Financial Policy and Corporate Strategy","Risk Management","Advanced Capital Budgeting Decisions","Security Analysis","Security Valuation","Portfolio Management","Securitization","Mutual Funds","Derivatives Analysis and Valuation","Foreign Exchange Exposure and Risk Management","International Financial Management","Interest Rate Risk Management","Business Valuation","Mergers, Acquisitions and Corporate Restructuring","Startup Finance"] },
    AUDIT: { label: "Advanced Auditing & Professional Ethics", short: "Audit", color: "#C9A6D9", emoji: "馃巰",
      chapters: ["Basics of Audit (SA 200, Audit Procedures, SA 210/230)","SQC-1 + Standards on Auditing (200鈥�700 Series)","Professional Ethics","CARO 2020","Company Audit","Audit Planning","Risk Assessment & Internal Control","Group Audit","Bank Audit","NBFC Audit","PSU Audit","Internal Audit","SA 610 鈥� Using the Work of Internal Auditors","Due Diligence","Forensic Accounting","Investigation","SA 800 Series","SRE 鈥� Standards on Review Engagements","SAE 鈥� Standards on Assurance Engagements","SRS 鈥� Standards on Related Services","SDG & ESG Assurance","Digital Audit"] },
    DT: { label: "Direct Tax Laws & International Taxation", short: "DT", color: "#F0B15C", emoji: "猸�",
      chapters: ["Basics, Tax Rates AY 26-27 & Alternate Taxation Regime","Income from Capital Gains","Income from Other Sources","Taxation of Dividend & Deemed Dividend","Taxation in Case of Liquidation & Buy Back","Taxation in Case of Amalgamation and Demerger","Profits & Gains of Business or Profession","Income Computation & Disclosure Standards (ICDS)","Taxation of Political Parties & Electoral Trust","Taxation in Case of Firm/LLP","Taxation in Case of AOP/BOI","Taxation of Business Trust","Taxation of Investment Fund","Taxation of Securitisation Trust","Minimum Alternate Tax","Alternate Minimum Tax","Deduction u/s 10AA (SEZ)","Deduction under Chapter VI-A","Clubbing of Income","Set-Off & Carry Forward of Losses","Advance Tax, TDS & TCS","Assessment Procedure","Appeals & Revisions","Dispute Resolution Committee","Miscellaneous Provisions","Penalties & Prosecutions","The Black Money Act, 2015","GAAR","Taxation of VDA","Exempt Income","Tonnage Taxation","Taxation of Trust & Institutions","Tax Audit & Ethical Compliance","Transfer Pricing","Non-Resident & NRI Taxation","Double Taxation Relief (DTAA)","Advance Ruling (BOAR)","Model Tax Conventions (MTC)","Application & Interpretation of Tax Treaties","Base Erosion & Profit Shifting (BEPS)","Latest Developments in International Taxation","Foreign Tax Credit Rule","Conversion of Foreign Income into Indian Currency","Remaining Case Laws & Concepts"] },
    IDT: { label: "Indirect Tax Laws", short: "IDT", color: "#8FB8D9", emoji: "馃挮",
      chapters: ["Basics 鈥� GST Introduction","Supply under GST","Charge of GST","Exemptions from GST","Place of Supply","Time of Supply","Value of Supply","Input Tax Credit","Registration","Tax Invoice, Credit Notes & Debit Notes","Demand & Recovery","Assessment & Audit","Inspection, Search, Seizure & Arrest","Appeals & Revisions","Offences & Penalties","Advance Ruling","Payment of Tax; TDS & TCS","Liability to Pay in Certain Cases","Refunds (GST)","Returns under GST","Accounts & Records; E-Way Bill","Job Work","Miscellaneous Provisions (GST)","Ethical Aspects under GST","Customs 鈥� Basic Provisions","Customs 鈥� Levy & Exemptions","Customs 鈥� Types of Duty","Customs 鈥� Import Export Procedure","Customs 鈥� Valuation under the Customs Act, 1962","Customs 鈥� Baggage","Customs 鈥� Warehousing","Customs 鈥� Refunds","Foreign Trade Policy 2023"] },
    IBS: { label: "Integrated Business Solutions", short: "IBS", color: "#E8A87C", emoji: "鉁�",
      chapters: ["Strategic Management Integration","Financial Management Integration","Risk Management & Case Analysis","Multidisciplinary Case Studies 鈥� Practice Sets"] },
  },
  inter: {
    ADVACC: { label: "Advanced Accounting", short: "Adv. Acc.", color: "#E2879A", emoji: "馃尭",
      chapters: ["Introduction & Applicability of AS","Framework for Preparation of Financial Statements","AS 1鈥�5","AS 10鈥�17","AS 18鈥�29","Financial Statements of Companies","Buyback & Redemption of Securities","Amalgamation of Companies","Accounting for Branches","Dissolution of Partnership Firms","Accounting for Corporate Restructuring"] },
    LAW: { label: "Corporate & Other Laws", short: "Law", color: "#C9A6D9", emoji: "馃巰",
      chapters: ["Preliminary & Incorporation of Company","Prospectus & Allotment of Securities","Share Capital & Debentures","Acceptance of Deposits","Registration of Charges","Management & Administration","Declaration & Payment of Dividend","Accounts of Companies","Audit & Auditors","Companies Incorporated Outside India","The General Clauses Act","Interpretation of Statutes","FEMA 鈥� Basics"] },
    TAX: { label: "Taxation", short: "Tax", color: "#8FB8D9", emoji: "馃挮",
      chapters: ["Basic Concepts of Income Tax","Residence & Scope of Total Income","Heads of Income","Clubbing & Set-off of Losses","Deductions from Gross Total Income","Computation of Total Income & Tax Liability","Advance Tax, TDS & TCS","Filing of Return of Income","GST 鈥� Supply & Levy","GST 鈥� Input Tax Credit & Registration","GST 鈥� Returns & Payment"] },
    CMA: { label: "Cost & Management Accounting", short: "CMA", color: "#8FAE7D", emoji: "馃嵉",
      chapters: ["Introduction to Cost & Management Accounting","Material Cost","Employee Cost & Direct Expenses","Overheads 鈥� Absorption Costing","Activity Based Costing","Cost Sheet","Cost Accounting Systems","Unit & Batch Costing","Job & Contract Costing","Process & Operation Costing","Joint Products & By-Products","Service Costing","Standard Costing","Marginal Costing","Budget & Budgetary Control"] },
    AUDIT: { label: "Auditing & Ethics", short: "Audit", color: "#F0B15C", emoji: "猸�",
      chapters: ["Nature, Objective & Scope of Audit","Audit Strategy, Planning & Programme","Risk Assessment & Internal Control","Audit Evidence","Audit of Items of Financial Statements","Audit Documentation","Completion & Review","Audit Report","Special Features of Audit of Different Entities","Audit of Banks","Ethics & Terms of Audit Engagements"] },
    FSM: { label: "Financial & Strategic Management", short: "FSM", color: "#E8A87C", emoji: "鉁�",
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
  const [uid, setUid] = useState(null); // supabase user id 鈥� used for storage keys
  const [name, setName] = useState(""); // display name shown in the app
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [level, setLevel] = useState(null); // final | inter
  const [profile, setProfile] = useState(null); // {final:{}, inter:{}}
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newChapterInput, setNewChapterInput] = useState("");
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Study room state
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const timerRef = useRef(null);
  const pingRef = useRef(null);
  const pollRef = useRef(null);

  const loadProfileData = useCallback(async (id) => {
    try {
      const res = await window.storage.get(`profile:${id}`, false);
      if (res?.value) return JSON.parse(res.value);
    } catch (e) {}
    return { final: {}, inter: {} };
  }, []);

  const loadStreak = useCallback(async (id) => {
    try {
      const res = await window.storage.get(`streak:${id}`, false);
      if (res?.value) return JSON.parse(res.value);
    } catch (e) {}
    return { count: 0, lastDate: null };
  }, []);

  const enterAppForUser = useCallback(async (user) => {
    const displayName =
      user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Friend";
    setUid(user.id);
    setName(displayName);
    setAvatarUrl(user.user_metadata?.avatar_url || null);
    const [p, s] = await Promise.all([loadProfileData(user.id), loadStreak(user.id)]);
    setProfile(p);
    setStreak(s);
    setView("home");
  }, [loadProfileData, loadStreak]);

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
      setError("Couldn't save just now 鈥� check your connection and try again.");
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
      setError("Couldn't start Google sign-in 鈥� try again.");
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
      saveProfile(uid, next);
      return next;
    });
  };

  const toggleMock = (subjKey) => {
    setProfile((prev) => {
      const subj = prev[level][subjKey];
      const next = { ...prev, [level]: { ...prev[level], [subjKey]: { ...subj, mock: !subj.mock } } };
      saveProfile(uid, next);
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
      saveProfile(uid, next);
      return next;
    });
    setNewChapterInput("");
  };

  const removeChapter = (subjKey, chapterId) => {
    setProfile((prev) => {
      const subj = prev[level][subjKey];
      const chapters = subj.chapters.filter((c) => c.id !== chapterId);
      const next = { ...prev, [level]: { ...prev[level], [subjKey]: { ...subj, chapters } } };
      saveProfile(uid, next);
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
    await saveStreak(uid, next);
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
          `room:${uid}`,
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
      if (uid) await window.storage.delete(`room:${uid}`, true);
    } catch (e) {}
  };

  useEffect(() => () => stopSession(), []); // cleanup on unmount

  // ---------- RENDER ----------
  const bgStyle = {
    background: `linear-gradient(160deg, ${C.paper} 0%, #F
