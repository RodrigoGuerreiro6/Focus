import { useState, useEffect, useRef } from "react";

// --- Constants ----------------------------------------------------------------

const SHAME_MESSAGES = [
  { title: "INÚTIL.", body: "Criaste tarefas. Falhaste todas. As tuas metas não eram objectivos — eram fantasias de alguém que não tens coragem de ser." },
  { title: "PATÉTICO.", body: "Cada tarefa que apagámos era uma promessa que fizeste a ti mesmo. E quebraste-as todas. Tens vergonha? Devias ter." },
  { title: "ZERO.", body: "Não há desculpas. Não há amanhã. Há apenas o que fizeste hoje — e hoje não fizeste nada. Absolutamente nada." },
  { title: "FRACO.", body: "A tua versão futura olha para trás e vê este momento. Vê-te a falhar. Vê-te a desistir. Ainda tens tempo de mudar isso — mas provavelmente não vais." },
  { title: "APAGADO.", body: "As tuas tarefas foram destruídas, tal como destruíste a tua própria disciplina. Recomecia. Desta vez, faz alguma coisa com a tua vida." },
];

const CATEGORIES = [
  { id: "work",    label: "Trabalho",   color: "#7eb8f7" },
  { id: "health",  label: "Saúde",      color: "#a8e6a3" },
  { id: "study",   label: "Estudo",     color: "#f7d07e" },
  { id: "personal",label: "Pessoal",    color: "#c4a8e6" },
  { id: "other",   label: "Outro",      color: "#aaaaaa" },
];

const SHOP_ITEMS = [
  { id:"shield",   name:"Escudo",          icon:"🛡️", desc:"Absorve a próxima falha. Pontos não descontados.",                                                        cost:80,  max:2 },
  { id:"streak",   name:"Streak Guard",    icon:"🔥", desc:"Protege o teu streak por 1 dia mesmo sem completar tarefas.",                                              cost:60,  max:2 },
  { id:"multa",    name:"Aposta do Dia",   icon:"⚠️", desc:"Custas 100pts. Se completares TODAS as tarefas do dia ganhas o dobro de tudo. Se falhares uma sequer perdes todos os pontos.", cost:100, max:1 },
  { id:"hardcore", name:"Modo Hardcore",   icon:"💀", desc:"A app fica bloqueada num ecrã de aviso até completares a tarefa com mais pontos do dia. Sem atalhos.", cost:0,   max:1 },
  { id:"freeze",   name:"Congelar Pontos", icon:"🧊", desc:"Pontos congelados durante 24h: nenhuma tarefa os altera. Útil em dias impossíveis.",                       cost:100, max:1 },
];

const INITIAL_POINTS = 50;

const RANKS = [
  { pts:0,    title:"Aprendiz",    icon:"🌱", color:"#888888" },
  { pts:100,  title:"Dedicado",    icon:"⚡", color:"#7eb8f7" },
  { pts:300,  title:"Focado",      icon:"🎯", color:"#a8e6a3" },
  { pts:600,  title:"Disciplinado",icon:"🔥", color:"#f7d07e" },
  { pts:1000, title:"Imparável",   icon:"💎", color:"#c4a8e6" },
  { pts:2000, title:"Mestre",      icon:"👑", color:"#f7a07e" },
  { pts:5000, title:"Lenda",       icon:"🌟", color:"#ffffff" },
];

function getRank(totalPts) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (totalPts >= r.pts) rank = r; else break; }
  return rank;
}
function getNextRank(totalPts) {
  return RANKS.find(r => r.pts > totalPts) ?? null;
}

const THEMES = [
  { id:"default",   name:"Default",      bg:"#1c1c1e", card:"#252527", accent:"#f0f0f0", cost:0 },
  { id:"midnight",  name:"Midnight",     bg:"#0a0a1a", card:"#12122a", accent:"#7eb8f7", cost:200 },
  { id:"forest",    name:"Forest",       bg:"#0a1a0e", card:"#122a16", accent:"#a8e6a3", cost:200 },
  { id:"blood",     name:"Blood",        bg:"#1a0a0a", card:"#2a1212", accent:"#e06060", cost:300 },
  { id:"gold",      name:"Gold",         bg:"#1a1500", card:"#2a2200", accent:"#f7d07e", cost:400 },
  { id:"arctic",    name:"Arctic",       bg:"#0f1520", card:"#1a2535", accent:"#a8d8f0", cost:500 },
  { id:"void",      name:"Void",         bg:"#000000", card:"#0d0d0d", accent:"#ffffff", cost:800 },
];

const AVATARS = [
  { id:"none",    icon:"👤", name:"Default",     cost:0 },
  { id:"flame",   icon:"🔥", name:"Chama",       cost:200 },
  { id:"skull",   icon:"💀", name:"Caveira",     cost:300 },
  { id:"diamond", icon:"💎", name:"Diamante",    cost:400 },
  { id:"crown",   icon:"👑", name:"Coroa",       cost:500 },
  { id:"ghost",   icon:"👻", name:"Fantasma",    cost:250 },
  { id:"robot",   icon:"🤖", name:"Robot",       cost:350 },
  { id:"ninja",   icon:"🥷", name:"Ninja",       cost:600 },
  { id:"alien",   icon:"👾", name:"Alien",       cost:700 },
  { id:"star",    icon:"⭐", name:"Estrela",     cost:200 },
];

const TITLES = [
  { id:"none",        label:"",                    cost:0 },
  { id:"implacable",  label:"O Implacável",        cost:200 },
  { id:"machine",     label:"Máquina de Foco",     cost:300 },
  { id:"brutal",      label:"Modo Brutal",         cost:250 },
  { id:"ascetic",     label:"O Asceta",            cost:350 },
  { id:"shadow",      label:"Sombra Silenciosa",   cost:400 },
  { id:"obsessed",    label:"Obcecado",            cost:300 },
  { id:"zero",        label:"Zero Distrações",     cost:450 },
  { id:"legend",      label:"A Lenda",             cost:800 },
];

const COMPLETION_ANIMS = [
  { id:"default",  name:"Padrão",      desc:"Fade simples",          cost:0 },
  { id:"flash",    name:"Flash",       desc:"Flash branco",          cost:200 },
  { id:"explode",  name:"Explosão",    desc:"Partículas de pontos",  cost:350 },
  { id:"shake",    name:"Shake",       desc:"Vibração intensa",      cost:250 },
  { id:"glow",     name:"Glow",        desc:"Brilho verde",          cost:300 },
];





// --- Audio --------------------------------------------------------------------

function playTone(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "success") {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
  } catch (_) {}
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// --- Helpers ------------------------------------------------------------------

function formatTime(date) {
  return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(date) {
  return date.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function minutesUntil(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date(), target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.round((target - now) / 60000);
}
function secondsUntil(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date(), target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.round((target - now) / 1000);
}
function countdown(timeStr) {
  const secs = secondsUntil(timeStr);
  if (secs > 86400) return null; // next day, don't show
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function isOverdue(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date(), target = new Date();
  target.setHours(h, m, 0, 0);
  return now > target;
}
function getCatColor(catId) {
  return CATEGORIES.find(c => c.id === catId)?.color ?? "#aaaaaa";
}

// --- Notifications ------------------------------------------------------------

async function requestNotifPerm() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}
function scheduleNotif(task) {
  if (!("Notification" in window) || Notification.permission !== "granted") return null;
  const [h, m] = task.time.split(":").map(Number);
  const now = new Date(), target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delay = target - now;
  if (delay > 2147483647) return null;
  return setTimeout(() => {
    new Notification("⏰ " + task.title, {
      body: `${task.pts}pts em jogo. Faz ou falha.`,
      tag: `task-${task.id}`,
    });
  }, delay);
}

// --- Component ----------------------------------------------------------------

const SCREENS = { MAIN:"main", ADD:"add", STATS:"stats", SHOP:"shop", FOCUS:"focus", REWARDS:"rewards", PURGE:"purge", SHAME:"shame" };

export default function FocusApp() {
  // -- Load persisted state from localStorage ----------------------------------
  const load = (key, fallback) => {
    try {
      const v = localStorage.getItem('focus_' + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  };

  // Core state
  const [points, setPoints]         = useState(() => load("points", INITIAL_POINTS));
  const [tasks, setTasks]           = useState(() => load("tasks", []));
  const [screen, setScreen]         = useState(SCREENS.MAIN);
  const [shameMsg]                  = useState(() => SHAME_MESSAGES[Math.floor(Math.random()*SHAME_MESSAGES.length)]);

  // New task form
  const [newTask, setNewTask]       = useState({ title:"", time:"", pts:10, category:"other", recurring:false });

  // Active effects / inventory
  const [inventory, setInventory]   = useState(() => load("inventory", { shield:0, streak:0, multa:0, hardcore:0, freeze:0 }));
  const [apostaDia, setApostaDia]   = useState(() => load("apostaDia", false));
  const [hardcoreActive, setHardcoreActive] = useState(() => load("hardcoreActive", false));
  const [freezeUntil, setFreezeUntil]   = useState(() => load("freezeUntil", null));

  // Streak
  const [streak, setStreak]         = useState(() => load("streak", 0));
  const [lastActiveDay, setLastActiveDay] = useState(() => load("lastActiveDay", null));
  const [streakGuarded, setStreakGuarded] = useState(() => load("streakGuarded", false));

  // Stats history
  const [history, setHistory]       = useState(() => load("history", []));

  // UI state
  const [ticker, setTicker]         = useState(0);
  const [completingId, setCompletingId] = useState(null);
  const [failingId, setFailingId]   = useState(null);
  const [pointAnim, setPointAnim]   = useState(null);
  const [purgedTasks, setPurgedTasks] = useState([]);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" ? Notification.permission === "granted" : false
  );
  const [filterCat, setFilterCat]   = useState("all");
  const [shopMsg, setShopMsg]       = useState(null);

  // Rank & lifetime pts
  const [lifetimePts, setLifetimePts] = useState(() => load("lifetimePts", 0));

  // Personal rewards
  const [rewards, setRewards]       = useState(() => load("rewards", []));
  const [newReward, setNewReward]   = useState({ title:"", cost:50 });

  // Cosmetics
  const [unlockedThemes, setUnlockedThemes]   = useState(() => load("unlockedThemes", ["default"]));
  const [activeTheme, setActiveTheme]         = useState(() => load("activeTheme", "default"));
  const [unlockedAvatars, setUnlockedAvatars] = useState(() => load("unlockedAvatars", ["none"]));
  const [activeAvatar, setActiveAvatar]       = useState(() => load("activeAvatar", "none"));
  const [unlockedTitles, setUnlockedTitles]   = useState(() => load("unlockedTitles", ["none"]));
  const [activeTitle, setActiveTitle]         = useState(() => load("activeTitle", "none"));
  const [unlockedAnims, setUnlockedAnims]     = useState(() => load("unlockedAnims", ["default"]));
  const [activeAnim, setActiveAnim]           = useState(() => load("activeAnim", "default"));
  const [shopTab, setShopTab]                 = useState("items"); // "items" | "cosmetics"
  const [profileTab, setProfileTab]           = useState("stats"); // "stats" | "cosmetics"

  // AI challenges
  const [aiChallenges, setAiChallenges] = useState([]);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiError, setAiError]           = useState(null);

  // Pomodoro
  const [pomoMode, setPomoMode]         = useState("25/5");
  const [pomoPhase, setPomoPhase]       = useState("focus");
  const [pomoSecsLeft, setPomoSecsLeft] = useState(25 * 60);
  const [pomoRunning, setPomoRunning]   = useState(false);
  const [pomoCycles, setPomoCycles]     = useState(0);
  const pomoIntervalRef = useRef(null);

  const notifTimers = useRef({});
  const prevPoints  = useRef(points);
  const todayRef    = useRef(todayKey());

  // -- Persist state to localStorage whenever it changes ----------------------
  const save = (key, val) => { try { localStorage.setItem('focus_' + key, JSON.stringify(val)); } catch {} };
  useEffect(() => { save("points",        points);        }, [points]);
  useEffect(() => { save("tasks",         tasks);         }, [tasks]);
  useEffect(() => { save("inventory",     inventory);     }, [inventory]);
  useEffect(() => { save("apostaDia",     apostaDia);     }, [apostaDia]);
  useEffect(() => { save("hardcoreActive",hardcoreActive);}, [hardcoreActive]);
  useEffect(() => { save("freezeUntil",   freezeUntil);   }, [freezeUntil]);
  useEffect(() => { save("streak",        streak);        }, [streak]);
  useEffect(() => { save("lastActiveDay", lastActiveDay); }, [lastActiveDay]);
  useEffect(() => { save("streakGuarded", streakGuarded); }, [streakGuarded]);
  useEffect(() => { save("history",       history);       }, [history]);
  useEffect(() => { save("lifetimePts",   lifetimePts);   }, [lifetimePts]);
  useEffect(() => { save("rewards",       rewards);       }, [rewards]);
  useEffect(() => { save("unlockedThemes", unlockedThemes); }, [unlockedThemes]);
  useEffect(() => { save("activeTheme",   activeTheme);    }, [activeTheme]);
  useEffect(() => { save("unlockedAvatars",unlockedAvatars);}, [unlockedAvatars]);
  useEffect(() => { save("activeAvatar",  activeAvatar);   }, [activeAvatar]);
  useEffect(() => { save("unlockedTitles",unlockedTitles); }, [unlockedTitles]);
  useEffect(() => { save("activeTitle",   activeTitle);    }, [activeTitle]);
  useEffect(() => { save("unlockedAnims", unlockedAnims);  }, [unlockedAnims]);
  useEffect(() => { save("activeAnim",    activeAnim);     }, [activeAnim]);

  // Tick every second for countdowns
  useEffect(() => {
    const id = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Daily reset at midnight
  useEffect(() => {
    const now = new Date(), midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const id = setTimeout(() => {
      const today = todayKey();
      const dayStats = { date: new Date().toLocaleDateString("pt-PT"), earned:0, lost:0, completed:0, failed:0 };
      setTasks(prev => {
        prev.forEach(t => {
          if (t.status === "done")    { dayStats.earned += t.pts; dayStats.completed++; }
          if (t.status === "failed")  { dayStats.lost   += t.pts; dayStats.failed++; }
          if (t.status === "pending") { dayStats.lost   += t.pts; dayStats.failed++; }
        });
        return prev.map(t => {
          if (t.recurring && (t.status === "done" || t.status === "failed")) {
            return { ...t, status: "pending" }; // reset recurring tasks
          }
          return t.status === "pending" ? { ...t, status:"failed" } : t;
        });
      });
      setHistory(h => [...h.slice(-29), dayStats]);
      // streak logic
      setStreak(s => {
        const hadSuccess = tasks.some(t => t.status === "done");
        if (hadSuccess) return s + 1;
        if (streakGuarded) { setStreakGuarded(false); setInventory(inv => ({...inv, streak: Math.max(0, inv.streak-1)})); return s; }
        return 0;
      });
      todayRef.current = today;
    }, midnight - now);
    return () => clearTimeout(id);
  }, [tasks, streakGuarded]);

  // Points → zero: purge + shame
  useEffect(() => {
    if (points <= 0 && prevPoints.current > 0) {
      setPurgedTasks([...tasks.filter(t => t.status === "pending")]);
      setScreen(SCREENS.PURGE);
      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.status !== "pending"));
        setTimeout(() => setScreen(SCREENS.SHAME), 800);
      }, 2600);
    }
    prevPoints.current = points;
  }, [points]);

  // Notifications
  useEffect(() => {
    if (!notifGranted) return;
    Object.values(notifTimers.current).forEach(clearTimeout);
    notifTimers.current = {};
    tasks.filter(t => t.status === "pending").forEach(task => {
      const tid = scheduleNotif(task);
      if (tid) notifTimers.current[task.id] = tid;
    });
    return () => Object.values(notifTimers.current).forEach(clearTimeout);
  }, [tasks, notifGranted]);

  async function handleRequestNotif() {
    setNotifGranted(await requestNotifPerm());
  }

  // -- Actions ----------------------------------------------------------------

  function addTask() {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, { id:Date.now(), ...newTask, pts:Number(newTask.pts), status:"pending" }]);
    setNewTask({ title:"", time:"", pts:10, category:"other", recurring:false });
    setScreen(SCREENS.MAIN);
  }

  function completeTask(task) {
    if (completingId || failingId) return;
    setCompletingId(task.id);
    clearTimer(task.id);
    setTimeout(() => {
      if (!isFrozen) {
        playTone("success");
        vibrate([50, 30, 80]);
        setPoints(p => p + task.pts);
        setLifetimePts(lp => lp + task.pts);
        setPointAnim({ value: task.pts, sign:"+" });
      }
      setTasks(prev => {
        const updated = prev.map(t => t.id === task.id ? { ...t, status:"done" } : t);
        // Unlock hardcore if this was the hardest task
        if (hardcoreActive && hardestTask && task.id === hardestTask.id) {
          setHardcoreActive(false);
          setInventory(inv => ({ ...inv, hardcore: 0 }));
        }
        // Aposta: check if ALL tasks now done
        if (apostaDia) {
          const allDone = updated.filter(t => !t.recurring || t.status !== "pending")
            .every(t => t.status === "done" || t.recurring);
          const stillPending = updated.some(t => t.status === "pending");
          if (!stillPending) {
            // All resolved — check if any failed
            const anyFailed = updated.some(t => t.status === "failed");
            if (!anyFailed) {
              // SUCCESS: double all points earned today
              const bonus = updated.filter(t => t.status === "done").reduce((s,t) => s + t.pts, 0);
              setPoints(p => p + bonus);
              setPointAnim({ value: bonus, sign:"+" });
            } else {
              // FAIL: lose everything
              setPoints(0);
            }
            setApostaDia(false);
            setInventory(inv => ({ ...inv, multa: 0 }));
          }
        }
        return updated;
      });
      setCompletingId(null);
      setTimeout(() => setPointAnim(null), 1400);
    }, 300);
  }

  function failTask(task) {
    if (completingId || failingId) return;
    setFailingId(task.id);
    clearTimer(task.id);
    setTimeout(() => {
      if (isFrozen) {
        // no point change
      } else if (inventory.shield > 0) {
        setInventory(inv => ({ ...inv, shield: inv.shield - 1 }));
        setShopMsg("🛡️ Escudo activado! Pontos protegidos.");
        setTimeout(() => setShopMsg(null), 2500);
      } else {
        playTone("fail");
        vibrate([100, 50, 100, 50, 200]);
        setPoints(p => Math.max(0, p - task.pts));
        setPointAnim({ value: task.pts, sign:"-" });
        // Aposta: failing any task loses everything
        if (apostaDia) {
          setTimeout(() => setPoints(0), 800);
          setApostaDia(false);
          setInventory(inv => ({ ...inv, multa: 0 }));
          setShopMsg("⚠️ Aposta perdida. Pontos a zero.");
          setTimeout(() => setShopMsg(null), 3000);
        }
      }
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status:"failed" } : t));
      setFailingId(null);
      setTimeout(() => setPointAnim(null), 1400);
    }, 300);
  }

  function clearTimer(id) {
    if (notifTimers.current[id]) { clearTimeout(notifTimers.current[id]); delete notifTimers.current[id]; }
  }

  function buyItem(item) {
    const count = inventory[item.id] ?? 0;
    if (item.max !== null && count >= item.max) {
      if (item.id === "multa")         setShopMsg("⚠️ Aposta já activa para hoje.");
      else if (item.id === "hardcore") setShopMsg("💀 Modo Hardcore já activo.");
      else if (item.id === "freeze")   setShopMsg("🧊 Pontos já congelados.");
      else                             setShopMsg("Já tens o máximo deste item.");
      setTimeout(() => setShopMsg(null), 2500); return;
    }
    if (item.cost > 0 && points < item.cost) {
      setShopMsg("Pontos insuficientes."); setTimeout(() => setShopMsg(null), 2000); return;
    }
    // Activate item effects
    if (item.id === "multa") {
      if (allPending.length === 0) { setShopMsg("Não tens tarefas pendentes para hoje."); setTimeout(() => setShopMsg(null), 2500); return; }
      setApostaDia(true);
      setShopMsg("⚠️ Aposta activa! Completa TUDO hoje para ganhar o dobro. Falha uma e perdes tudo.");
    } else if (item.id === "hardcore") {
      if (allPending.length === 0) { setShopMsg("Não tens tarefas pendentes para activar o Hardcore."); setTimeout(() => setShopMsg(null), 2500); return; }
      setHardcoreActive(true);
      const hardest = [...allPending].sort((a,b) => b.pts - a.pts)[0];
      setShopMsg(`💀 Hardcore ON. A app fica bloqueada até completares: "${hardest.title}"`);
    } else if (item.id === "freeze") {
      setFreezeUntil(Date.now() + 24 * 60 * 60 * 1000);
      setShopMsg("🧊 Pontos congelados por 24h. Nenhuma tarefa os altera.");
    }
    setInventory(inv => ({ ...inv, [item.id]: (inv[item.id] || 0) + 1 }));
    if (item.cost > 0) setPoints(p => p - item.cost);
    if (item.cost > 0) playTone("success");
    if (!["multa","hardcore","freeze"].includes(item.id)) setShopMsg(`✓ ${item.name} adquirido!`);
    setTimeout(() => setShopMsg(null), 3000);
  }

  function useItem(itemId) {
    if (!inventory[itemId]) return;
    if (itemId === "streak") {
      setStreakGuarded(true);
      setInventory(inv => ({ ...inv, streak: inv.streak - 1 }));
      setShopMsg("🔥 Streak protegido hoje!");
      setTimeout(() => setShopMsg(null), 2500);
    }
  }

  function addReward() {
    if (!newReward.title.trim()) return;
    setRewards(prev => [...prev, { id:Date.now(), ...newReward, cost:Number(newReward.cost), unlocked:false }]);
    setNewReward({ title:"", cost:50 });
  }

  function unlockReward(reward) {
    if (points < reward.cost) return;
    setPoints(p => p - reward.cost);
    setRewards(prev => prev.map(r => r.id === reward.id ? {...r, unlocked:true} : r));
    playTone("success");
    vibrate([80, 40, 80, 40, 120]);
  }

  function deleteReward(id) {
    setRewards(prev => prev.filter(r => r.id !== id));
  }

  async function fetchAiChallenges() {
    setAiLoading(true);
    setAiError(null);
    try {
      const cats = CATEGORIES.map(c => c.label).join(", ");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:600,
          messages:[{
            role:"user",
            content:"Gera 3 desafios diários motivadores para uma app de produtividade. Responde APENAS com JSON válido, sem markdown, sem texto extra. Formato exacto: [{title,category,pts,desc},{title,category,pts,desc},{title,category,pts,desc}]. Categorias possíveis: work, health, study, personal, other. Pontos entre 10 e 40. Desafios difíceis mas possíveis num dia."
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text||"").join("") ?? "";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setAiChallenges(parsed.map((c,i) => ({ ...c, id: Date.now()+i, accepted:false })));
    } catch(e) {
      setAiError("Não foi possível gerar desafios. Tenta novamente.");
    }
    setAiLoading(false);
  }

  function acceptChallenge(challenge) {
    const time = new Date();
    time.setHours(23, 0, 0, 0);
    const hh = String(time.getHours()).padStart(2,"0");
    const mm = String(time.getMinutes()).padStart(2,"0");
    setTasks(prev => [...prev, {
      id: Date.now(), title: challenge.title, time:`${hh}:${mm}`,
      pts: challenge.pts, category: challenge.category,
      status:"pending", recurring:false
    }]);
    setAiChallenges(prev => prev.map(c => c.id === challenge.id ? {...c, accepted:true} : c));
    playTone("success");
  }

  // Derived theme
  const theme = THEMES.find(t => t.id === activeTheme) ?? THEMES[0];
  const avatarObj = AVATARS.find(a => a.id === activeAvatar) ?? AVATARS[0];
  const titleObj  = TITLES.find(t => t.id === activeTitle) ?? TITLES[0];

  function buyCosmetic(type, item) {
    if (points < item.cost) return;
    if (type === "theme") {
      if (unlockedThemes.includes(item.id)) { setActiveTheme(item.id); return; }
      setUnlockedThemes(p => [...p, item.id]);
      setActiveTheme(item.id);
    } else if (type === "avatar") {
      if (unlockedAvatars.includes(item.id)) { setActiveAvatar(item.id); return; }
      setUnlockedAvatars(p => [...p, item.id]);
      setActiveAvatar(item.id);
    } else if (type === "title") {
      if (unlockedTitles.includes(item.id)) { setActiveTitle(item.id); return; }
      setUnlockedTitles(p => [...p, item.id]);
      setActiveTitle(item.id);
    } else if (type === "anim") {
      if (unlockedAnims.includes(item.id)) { setActiveAnim(item.id); return; }
      setUnlockedAnims(p => [...p, item.id]);
      setActiveAnim(item.id);
    }
    if (item.cost > 0) {
      setPoints(p => p - item.cost);
      playTone("success");
      vibrate([60, 30, 90]);
    }
  }

  function resetFromShame() {
    setPoints(INITIAL_POINTS);
    setPurgedTasks([]);
    setStreak(0);
    setApostaDia(false);
    setHardcoreActive(false);
    setFreezeUntil(null);
    setInventory({ shield:0, streak:0, multa:0, hardcore:0, freeze:0 });
    setScreen(SCREENS.MAIN);
  }

  // -- Derived ----------------------------------------------------------------

  const allPending = tasks.filter(t => t.status === "pending").sort((a,b) => { if (!a.time && !b.time) return 0; if (!a.time) return 1; if (!b.time) return -1; return a.time.localeCompare(b.time); });
  const pendingTasks = filterCat === "all" ? allPending : allPending.filter(t => t.category === filterCat);
  const doneTasks    = tasks.filter(t => t.status !== "pending");
  const pct          = Math.max(0, Math.min(100, (points / INITIAL_POINTS) * 100));
  const barColor     = points > 60 ? "#a8e6a3" : points > 30 ? "#f7d07e" : "#e06060";
  const isFrozen        = freezeUntil && Date.now() < freezeUntil;
  // Hardcore: hardest pending task by pts
  const hardestTask     = hardcoreActive
    ? [...allPending].sort((a,b) => b.pts - a.pts)[0] ?? null
    : null;
  const hardcoreBlocked = hardcoreActive && hardestTask !== null;
  // Aposta: track if any pending task was failed today
  const apostaFailed    = apostaDia && tasks.some(t => t.status === "failed");

  const usedCats    = [...new Set(allPending.map(t => t.category))];
  const currentRank = getRank(lifetimePts);
  const nextRank    = getNextRank(lifetimePts);
  const rankPct     = nextRank
    ? ((lifetimePts - currentRank.pts) / (nextRank.pts - currentRank.pts)) * 100
    : 100;

  // Stats computed
  const totalEarned  = history.reduce((s,d) => s + d.earned, 0);
  const totalFailed  = history.reduce((s,d) => s + d.failed, 0);
  const totalDone    = history.reduce((s,d) => s + d.completed, 0);
  const last7        = history.slice(-7);

  // Pomodoro tick
  useEffect(() => {
    if (pomoRunning) {
      pomoIntervalRef.current = setInterval(() => {
        setPomoSecsLeft(s => {
          if (s <= 1) {
            // phase end
            playTone("success");
            vibrate([100, 50, 100]);
            setPomoPhase(ph => {
              const next = ph === "focus" ? "break" : "focus";
              if (next === "focus") setPomoCycles(c => c + 1);
              const mins = pomoMode === "25/5"
                ? (next === "focus" ? 25 : 5)
                : (next === "focus" ? 50 : 10);
              setPomoSecsLeft(mins * 60);
              return next;
            });
            return 0;
          }
          // 1pt per minute of focus (every 60 seconds)
          if (s % 60 === 0) {
            setPomoPhase(ph => {
              if (ph === "focus") {
                setPoints(p => p + 1);
                setLifetimePts(lp => lp + 1);
                setPointAnim({ value: 1, sign: "+" });
                setTimeout(() => setPointAnim(null), 1200);
              }
              return ph;
            });
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(pomoIntervalRef.current);
    }
    return () => clearInterval(pomoIntervalRef.current);
  }, [pomoRunning, pomoMode]);

  function pomoReset() {
    setPomoRunning(false);
    setPomoPhase("focus");
    const mins = pomoMode === "25/5" ? 25 : 50;
    setPomoSecsLeft(mins * 60);
  }

  function switchPomoMode(mode) {
    setPomoMode(mode);
    setPomoRunning(false);
    setPomoPhase("focus");
    const mins = mode === "25/5" ? 25 : 50;
    setPomoSecsLeft(mins * 60);
    setPomoCycles(0);
  }

  // -- CSS --------------------------------------------------------------------

  const css = `
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    @keyframes pointPop { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-48px) scale(1.5)} }
    @keyframes taskIn   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes strike   { from{width:0} to{width:100%} }
    @keyframes completionFlash { 0%{background:rgba(255,255,255,0)} 20%{background:rgba(255,255,255,0.12)} 100%{background:rgba(255,255,255,0)} }
    @keyframes completionGlow  { 0%{box-shadow:none} 30%{box-shadow:0 0 30px #a8e6a344} 100%{box-shadow:none} }
    @keyframes completionShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} }
    @keyframes vanish   { 0%{opacity:1;transform:translateX(0)} 70%{opacity:0.2;transform:translateX(12px)} 100%{opacity:0;transform:translateX(48px)} }
    @keyframes flicker  { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.6} }
    * { box-sizing:border-box; margin:0; padding:0; }
    input::placeholder { color:#555; }
    input[type="time"]::-webkit-calendar-picker-indicator { filter:invert(0.6); cursor:pointer; }
    ::-webkit-scrollbar { width:0; }
  `;

  // -- Render -----------------------------------------------------------------

  return (
    <div style={{ minHeight:"100vh", background:theme.bg, color:theme.accent,
      fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
      display:"flex", justifyContent:"center", transition:"background 0.5s, color 0.5s" }}>
      <style>{css}</style>

      <div style={{ width:"100%", maxWidth:390, minHeight:"100vh", position:"relative", overflowY:"auto", overflowX:"hidden" }}>

        {/* -- PURGE --------------------------------------------------------- */}
        {screen === SCREENS.PURGE && (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:"#1c1c1e",
            display:"flex", flexDirection:"column", justifyContent:"center", padding:"40px 28px" }}>
            <div style={{ fontSize:10, letterSpacing:"0.35em", color:"#cc2222",
              textTransform:"uppercase", marginBottom:32, animation:"flicker 0.35s ease infinite" }}>
              A APAGAR TUDO
            </div>
            {purgedTasks.map((task, i) => (
              <div key={task.id} style={{ marginBottom:3, padding:"12px 16px", background:"#252527",
                borderLeft:"2px solid #cc2222", position:"relative", overflow:"hidden",
                animation:`vanish 0.5s ease ${0.15 + i * 0.2}s forwards` }}>
                <div style={{ fontSize:13, fontWeight:300, color:"#666", position:"relative" }}>
                  {task.title}
                  <div style={{ position:"absolute", top:"50%", left:0, height:1,
                    background:"#cc2222", width:0, animation:`strike 0.25s ease ${i*0.2}s forwards` }} />
                </div>
                <div style={{ fontSize:10, color:"#444", marginTop:4 }}>{task.time ? task.time + " · " : ""}{task.pts}pts · DESTRUÍDO</div>
              </div>
            ))}
          </div>
        )}

        {/* -- SHAME --------------------------------------------------------- */}
        {screen === SCREENS.SHAME && (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:"#1c1c1e",
            display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
            padding:"40px 32px", animation:"fadeIn 0.5s ease" }}>
            <div style={{ fontSize:10, letterSpacing:"0.35em", color:"#cc2222",
              textTransform:"uppercase", marginBottom:20, animation:"fadeIn 0.4s ease 0.2s both" }}>
              COLAPSO TOTAL
            </div>
            <div style={{ fontSize:52, fontWeight:700, color:"#cc2222", textAlign:"center",
              marginBottom:20, lineHeight:1,
              animation:"shake 0.5s ease 0.4s, fadeIn 0.3s ease 0.3s both" }}>
              {shameMsg.title}
            </div>
            <div style={{ width:20, height:1, background:"#444", marginBottom:24, animation:"fadeIn 0.4s ease 0.6s both" }} />
            <div style={{ fontSize:14, fontWeight:300, textAlign:"center", lineHeight:1.9,
              color:"#888", maxWidth:290, animation:"slideUp 0.5s ease 0.7s both" }}>
              {shameMsg.body}
            </div>
            <button onClick={resetFromShame} style={{ marginTop:52, background:"transparent",
              border:"1px solid #444", color:"#777", padding:"14px 40px", borderRadius:2,
              fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer",
              transition:"all 0.3s", animation:"fadeIn 0.4s ease 1.5s both" }}
              onMouseEnter={e=>{ e.target.style.borderColor="#888"; e.target.style.color="#bbb"; }}
              onMouseLeave={e=>{ e.target.style.borderColor="#444"; e.target.style.color="#777"; }}>
              Tentar outra vez
            </button>
          </div>
        )}

        {/* -- HARDCORE LOCK -------------------------------------------------- */}
        {hardcoreBlocked && screen !== SCREENS.SHAME && screen !== SCREENS.PURGE && (
          <div style={{ position:"fixed", inset:0, zIndex:150, background:"#1c1c1e",
            display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
            padding:"40px 32px", animation:"fadeIn 0.4s ease" }}>
            <div style={{ fontSize:10, letterSpacing:"0.35em", color:"#cc2222",
              textTransform:"uppercase", marginBottom:24, animation:"flicker 0.8s ease infinite" }}>
              APP BLOQUEADA
            </div>
            <div style={{ fontSize:48, fontWeight:700, color:"#cc2222", marginBottom:24,
              animation:"shake 0.6s ease infinite" }}>💀</div>
            <div style={{ fontSize:11, letterSpacing:"0.15em", color:"#555",
              textTransform:"uppercase", marginBottom:12 }}>
              Completa primeiro:
            </div>
            <div style={{ fontSize:20, fontWeight:300, textAlign:"center", color:"#f0f0f0",
              marginBottom:8, lineHeight:1.4 }}>
              {hardestTask?.title}
            </div>
            <div style={{ fontSize:12, color:"#666", marginBottom:48 }}>
              {hardestTask?.pts}pts{hardestTask?.time ? " · " + hardestTask.time : ""}
            </div>
            <div style={{ fontSize:12, color:"#444", textAlign:"center", lineHeight:1.8, maxWidth:260 }}>
              Escolheste o Modo Hardcore.<br/>
              Não há atalhos. Não há exceções.<br/>
              Faz a tarefa e a app desbloqueia.
            </div>
            {/* Allow completing the hardest task from this screen */}
            <button onClick={() => hardestTask && completeTask(hardestTask)}
              style={{ marginTop:48, background:"transparent",
                border:"1px solid #3a6a3a", color:"#5aaa5a",
                padding:"14px 40px", borderRadius:2, fontSize:11,
                letterSpacing:"0.18em", textTransform:"uppercase", cursor:"pointer",
                transition:"all 0.2s" }}
              onMouseEnter={e => { e.target.style.background="#1a3a1a"; }}
              onMouseLeave={e => { e.target.style.background="transparent"; }}>
              ✓ Concluí a tarefa
            </button>
          </div>
        )}

        {/* -- ADD TASK ------------------------------------------------------ */}
        {screen === SCREENS.ADD && (
          <div style={{ padding:"60px 28px 60px", animation:"slideUp 0.25s ease", minHeight:"100vh" }}>
            <button onClick={() => setScreen(SCREENS.MAIN)} style={backBtn}>← Voltar</button>

            <div style={labelStyle}>Tarefa</div>
            <input placeholder="o que tens de fazer hoje?"
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title:e.target.value }))}
              style={{ ...inputStyle, fontSize:16, marginBottom:32 }} autoFocus />

            {/* Category */}
            <div style={labelStyle}>Categoria</div>
            <div style={{ display:"flex", gap:8, marginBottom:28, flexWrap:"wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setNewTask(p => ({ ...p, category:cat.id }))}
                  style={{ background:"transparent", border:`1px solid ${newTask.category === cat.id ? cat.color : "#3a3a3c"}`,
                    color: newTask.category === cat.id ? cat.color : "#666",
                    padding:"6px 12px", borderRadius:20, fontSize:11, cursor:"pointer",
                    transition:"all 0.15s", letterSpacing:"0.05em" }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Time */}
            <div style={labelStyle}>Hora do lembrete <span style={{ color:"#555", fontWeight:300 }}>(opcional)</span></div>
            <input type="time" value={newTask.time}
              onChange={e => setNewTask(p => ({ ...p, time:e.target.value }))}
              style={{ ...inputStyle, marginBottom:8, color: newTask.time ? "#f0f0f0" : "#555" }} />
            <div style={{ minHeight:32, marginBottom:24 }}>
              {notifGranted && newTask.time && (
                <div style={{ marginTop:8, fontSize:11, color:"#5aaa5a", letterSpacing:"0.08em" }}>✓ notificação às {newTask.time}</div>
              )}
              {!notifGranted && newTask.time && (
                <div style={{ marginTop:8, fontSize:11, color:"#666" }}>
                  <span onClick={handleRequestNotif} style={{ textDecoration:"underline", cursor:"pointer", color:"#888" }}>Ativar notificações</span>
                </div>
              )}
            </div>

            {/* Points */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
              <div style={labelStyle}>Pontos em jogo</div>
              <div style={{ fontSize:36, fontWeight:100, lineHeight:1 }}>{newTask.pts}</div>
            </div>
            <input type="range" min={1} max={50} value={newTask.pts}
              onChange={e => setNewTask(p => ({ ...p, pts:Number(e.target.value) }))}
              style={{ width:"100%", accentColor:"#f0f0f0", cursor:"pointer", marginBottom:6 }} />
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
              <span style={{ fontSize:10, color:"#555" }}>1 · tranquilo</span>
              <span style={{ fontSize:10, color:"#555" }}>50 · brutal</span>
            </div>

            {/* Recurring */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 16px", background:"#252527", borderRadius:4, marginBottom:36 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:300 }}>Tarefa recorrente</div>
                <div style={{ fontSize:11, color:"#666", marginTop:3 }}>Repete automaticamente todos os dias</div>
              </div>
              <div onClick={() => setNewTask(p => ({ ...p, recurring:!p.recurring }))}
                style={{ width:44, height:26, borderRadius:13, cursor:"pointer",
                  background: newTask.recurring ? "#4aaa4a" : "#3a3a3c",
                  position:"relative", transition:"background 0.25s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left: newTask.recurring ? 21 : 3,
                  width:20, height:20, borderRadius:"50%", background:"#f0f0f0",
                  transition:"left 0.25s", boxShadow:"0 1px 3px rgba(0,0,0,0.4)" }} />
              </div>
            </div>

            <button onClick={addTask} style={{ width:"100%", background:"#f0f0f0",
              border:"none", color:"#1c1c1e", padding:"15px", borderRadius:4,
              fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase",
              cursor:"pointer", opacity:(!newTask.title.trim() || !newTask.time) ? 0.2 : 1,
              transition:"opacity 0.2s" }}>
              Criar Tarefa
            </button>
          </div>
        )}

        {/* -- PROFILE (was STATS) ----------------------------------------- */}
        {screen === SCREENS.STATS && (
          <div style={{ padding:"60px 28px 100px", animation:"slideUp 0.25s ease" }}>
            <button onClick={() => setScreen(SCREENS.MAIN)} style={backBtn}>← Voltar</button>

            {/* Profile header */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
              <div style={{ width:60, height:60, borderRadius:"50%", background:theme.card,
                border:`2px solid ${currentRank.color}44`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                {avatarObj.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:18, fontWeight:200 }}>{currentRank.icon} {currentRank.title}</div>
                {titleObj.id !== "none" && (
                  <div style={{ fontSize:11, color:currentRank.color, letterSpacing:"0.12em", marginTop:2 }}>{titleObj.label}</div>
                )}
                <div style={{ fontSize:10, color:"#555", marginTop:4 }}>{lifetimePts} pts totais</div>
              </div>
            </div>

            {/* Rank bar */}
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:10, color:"#555" }}>
                <span>{currentRank.icon} {currentRank.pts}pts</span>
                {nextRank && <span>{nextRank.pts - lifetimePts}pts para {nextRank.icon}</span>}
              </div>
              <div style={{ height:2, background:"#2a2a2c", borderRadius:2 }}>
                <div style={{ height:"100%", width:`${rankPct}%`, background:currentRank.color,
                  borderRadius:2, transition:"width 1s ease" }} />
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display:"flex", gap:0, marginBottom:24, borderBottom:"1px solid #2a2a2c" }}>
              {["stats","cosmetics"].map(tab => (
                <button key={tab} onClick={() => setProfileTab(tab)}
                  style={{ background:"transparent", border:"none", cursor:"pointer",
                    fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase",
                    color: profileTab === tab ? "#f0f0f0" : "#444",
                    padding:"8px 20px 10px",
                    borderBottom: profileTab === tab ? "1px solid #f0f0f0" : "1px solid transparent",
                    marginBottom:-1, transition:"all 0.15s" }}>
                  {tab === "stats" ? "Estatísticas" : "Cosméticos"}
                </button>
              ))}
            </div>

            {/* STATS TAB */}
            {profileTab === "stats" && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:28 }}>
                  {[
                    { label:"Streak", value: streak + "🔥" },
                    { label:"Concluídas", value: totalDone },
                    { label:"Falhadas",   value: totalFailed },
                  ].map(s => (
                    <div key={s.label} style={{ background:theme.card, borderRadius:4, padding:"16px 12px", textAlign:"center" }}>
                      <div style={{ fontSize:22, fontWeight:200 }}>{s.value}</div>
                      <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {last7.length > 0 && (
                  <div style={{ marginBottom:28 }}>
                    <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:16 }}>
                      Últimos {last7.length} dias
                    </div>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80 }}>
                      {last7.map((d, i) => {
                        const maxVal = Math.max(...last7.map(x => x.earned + x.lost), 1);
                        const earnH  = Math.round((d.earned / maxVal) * 72);
                        const lostH  = Math.round((d.lost   / maxVal) * 72);
                        return (
                          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                            <div style={{ width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", height:72 }}>
                              {lostH > 0  && <div style={{ height:lostH,  background:"#7a3a3a", borderRadius:"2px 2px 0 0" }} />}
                              {earnH > 0  && <div style={{ height:earnH,  background:"#3a7a3a", borderRadius: lostH>0 ? 0 : "2px 2px 0 0" }} />}
                              {earnH === 0 && lostH === 0 && <div style={{ height:2, background:"#333", borderRadius:2 }} />}
                            </div>
                            <div style={{ fontSize:8, color:"#444" }}>{d.date?.split(" ")[0] ?? i+1}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tasks.length > 0 && (() => {
                  const cats = {};
                  tasks.forEach(t => {
                    if (!cats[t.category]) cats[t.category] = { done:0, failed:0, pts:0 };
                    if (t.status === "done")   { cats[t.category].done++;   cats[t.category].pts += t.pts; }
                    if (t.status === "failed") { cats[t.category].failed++; }
                  });
                  return (
                    <div>
                      <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:14 }}>
                        Por categoria
                      </div>
                      {Object.entries(cats).map(([catId, data]) => {
                        const cat = CATEGORIES.find(c => c.id === catId);
                        const total = data.done + data.failed;
                        const pct2 = total > 0 ? Math.round((data.done / total) * 100) : 0;
                        return (
                          <div key={catId} style={{ marginBottom:10 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12 }}>
                              <span style={{ color: cat?.color ?? "#aaa" }}>{cat?.label ?? catId}</span>
                              <span style={{ color:"#555", fontSize:11 }}>{pct2}% · {data.pts}pts</span>
                            </div>
                            <div style={{ height:3, background:"#2a2a2c", borderRadius:2 }}>
                              <div style={{ height:"100%", width:`${pct2}%`, background: cat?.color ?? "#aaa",
                                borderRadius:2, transition:"width 0.8s ease", opacity:0.7 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {history.length === 0 && tasks.length === 0 && (
                  <div style={{ color:"#444", fontSize:13 }}>Sem dados ainda. Completa algumas tarefas!</div>
                )}
              </div>
            )}

            {/* COSMETICS TAB */}
            {profileTab === "cosmetics" && (
              <div>
                {/* Themes */}
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:14 }}>Temas</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
                  {THEMES.map(t => {
                    const owned   = unlockedThemes.includes(t.id);
                    const active  = activeTheme === t.id;
                    const afford  = points >= t.cost;
                    return (
                      <div key={t.id} onClick={() => buyCosmetic("theme", t)}
                        style={{ background:t.bg, border:`1px solid ${active ? t.accent : "#2a2a2c"}`,
                          borderRadius:6, padding:"14px 16px", cursor:"pointer",
                          opacity: !owned && !afford ? 0.4 : 1, transition:"all 0.2s",
                          position:"relative" }}>
                        <div style={{ fontSize:13, color:t.accent, fontWeight:300 }}>{t.name}</div>
                        <div style={{ fontSize:10, color:t.accent + "77", marginTop:3 }}>
                          {active ? "✓ Activo" : owned ? "Usar" : t.cost + "pts"}
                        </div>
                        {active && <div style={{ position:"absolute", top:8, right:10, fontSize:10, color:t.accent }}>●</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Avatars */}
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:14 }}>Avatares</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:24 }}>
                  {AVATARS.map(a => {
                    const owned  = unlockedAvatars.includes(a.id);
                    const active = activeAvatar === a.id;
                    const afford = points >= a.cost;
                    return (
                      <div key={a.id} onClick={() => buyCosmetic("avatar", a)}
                        style={{ background:theme.card, borderRadius:8,
                          border:`1px solid ${active ? currentRank.color : "#2a2a2c"}`,
                          padding:"10px 4px", textAlign:"center", cursor:"pointer",
                          opacity: !owned && !afford ? 0.35 : 1, transition:"all 0.2s" }}>
                        <div style={{ fontSize:22 }}>{a.icon}</div>
                        <div style={{ fontSize:8, color:"#555", marginTop:3 }}>
                          {active ? "✓" : owned ? "usar" : a.cost + "p"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Titles */}
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:14 }}>Títulos</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                  {TITLES.map(t => {
                    const owned  = unlockedTitles.includes(t.id);
                    const active = activeTitle === t.id;
                    const afford = points >= t.cost;
                    return (
                      <div key={t.id} onClick={() => buyCosmetic("title", t)}
                        style={{ background:theme.card, border:`1px solid ${active ? currentRank.color : "#2a2a2c"}`,
                          borderRadius:4, padding:"12px 16px", cursor:"pointer",
                          display:"flex", justifyContent:"space-between", alignItems:"center",
                          opacity: !owned && !afford ? 0.35 : 1, transition:"all 0.2s" }}>
                        <span style={{ fontSize:13, fontWeight:300, color: active ? currentRank.color : "#aaa" }}>
                          {t.id === "none" ? "Sem título" : t.label}
                        </span>
                        <span style={{ fontSize:10, color:"#555" }}>
                          {active ? "✓ Activo" : owned ? "Usar" : t.cost === 0 ? "Grátis" : t.cost + "pts"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Animations */}
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:14 }}>Animação de conclusão</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {COMPLETION_ANIMS.map(a => {
                    const owned  = unlockedAnims.includes(a.id);
                    const active = activeAnim === a.id;
                    const afford = points >= a.cost;
                    return (
                      <div key={a.id} onClick={() => buyCosmetic("anim", a)}
                        style={{ background:theme.card, border:`1px solid ${active ? "#a8e6a3" : "#2a2a2c"}`,
                          borderRadius:4, padding:"12px 16px", cursor:"pointer",
                          display:"flex", justifyContent:"space-between", alignItems:"center",
                          opacity: !owned && !afford ? 0.35 : 1, transition:"all 0.2s" }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:300 }}>{a.name}</div>
                          <div style={{ fontSize:10, color:"#555", marginTop:2 }}>{a.desc}</div>
                        </div>
                        <span style={{ fontSize:10, color:"#555", flexShrink:0, marginLeft:12 }}>
                          {active ? "✓ Activo" : owned ? "Usar" : a.cost === 0 ? "Grátis" : a.cost + "pts"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* -- SHOP ---------------------------------------------------------- */}
        {screen === SCREENS.SHOP && (
          <div style={{ padding:"60px 28px 100px", animation:"slideUp 0.25s ease" }}>
            <button onClick={() => setScreen(SCREENS.MAIN)} style={backBtn}>← Voltar</button>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:32 }}>
              <div style={{ fontSize:11, letterSpacing:"0.2em", color:"#666", textTransform:"uppercase" }}>Loja</div>
              <div style={{ fontSize:22, fontWeight:200 }}>{points} <span style={{ fontSize:11, color:"#666" }}>pts</span></div>
            </div>

            {shopMsg && (
              <div style={{ marginBottom:16, padding:"12px 16px", background:"#252527",
                borderLeft:"2px solid #5aaa5a", fontSize:12, color:"#aaa",
                animation:"fadeIn 0.3s ease" }}>
                {shopMsg}
              </div>
            )}

            {/* Inventory */}
            {(inventory.shield > 0 || inventory.streak > 0 || apostaDia || hardcoreBlocked || isFrozen) && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555",
                  textTransform:"uppercase", marginBottom:12 }}>Activo</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {inventory.shield > 0 && (
                    <div style={{ padding:"8px 14px", background:"#252527", borderRadius:4, fontSize:12, color:"#aaa" }}>
                      🛡️ ×{inventory.shield}
                    </div>
                  )}
                  {inventory.streak > 0 && (
                    <div onClick={() => useItem("streak")} style={{ padding:"8px 14px",
                      background: streakGuarded ? "#4a3a1a" : "#252527", borderRadius:4,
                      fontSize:12, color: streakGuarded ? "#f7d07e" : "#aaa", cursor:"pointer" }}>
                      🔥 ×{inventory.streak} {streakGuarded ? "· activo" : "· usar"}
                    </div>
                  )}
                  {apostaDia && !apostaFailed && (
                    <div style={{ padding:"8px 14px", background:"#3a2a1a", borderRadius:4, fontSize:12, color:"#f7d07e", animation:"pulse 1.5s ease infinite" }}>
                      ⚠️ Aposta activa
                    </div>
                  )}
                  {hardcoreBlocked && hardestTask && (
                    <div style={{ padding:"8px 14px", background:"#2a1a1a", borderRadius:4, fontSize:12, color:"#cc4444", animation:"pulse 1s ease infinite" }}>
                      💀 Hardcore — faz: {hardestTask.title}
                    </div>
                  )}
                  {isFrozen && (
                    <div style={{ padding:"8px 14px", background:"#1a2a3a", borderRadius:4, fontSize:12, color:"#7eb8f7" }}>
                      🧊 Congelado · {Math.ceil((freezeUntil - Date.now()) / 3600000)}h
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shop items */}
            <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555",
              textTransform:"uppercase", marginBottom:12 }}>Itens</div>
            {SHOP_ITEMS.map(item => {
              const owned    = inventory[item.id] ?? 0;
              const maxed    = item.max !== null && owned >= item.max;
              const canAfford = points >= item.cost;
              return (
                <div key={item.id} style={{ marginBottom:8, padding:"16px", background:theme.card,
                  borderRadius:4, display:"flex", justifyContent:"space-between", alignItems:"center",
                  opacity: maxed ? 0.4 : 1 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:18 }}>{item.icon}</span>
                      <span style={{ fontSize:14, fontWeight:300 }}>{item.name}</span>
                      {item.max && <span style={{ fontSize:10, color:"#555" }}>({owned}/{item.max})</span>}
                    </div>
                    <div style={{ fontSize:11, color:"#666", lineHeight:1.5 }}>{item.desc}</div>
                  </div>
                  <button onClick={() => buyItem(item)} disabled={maxed}
                    style={{ marginLeft:16, background:"transparent",
                      border:`1px solid ${canAfford && !maxed ? "#666" : "#333"}`,
                      color: canAfford && !maxed ? "#ccc" : "#444",
                      padding:"8px 14px", borderRadius:4, fontSize:12, cursor: maxed ? "default" : "pointer",
                      flexShrink:0, transition:"all 0.15s", whiteSpace:"nowrap" }}>
                    {maxed ? "Activo" : item.cost === 0 ? "Activar" : `${item.cost}pts`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* -- MAIN ---------------------------------------------------------- */}
        {screen === SCREENS.MAIN && (
          <div style={{ padding:"56px 28px 120px" }}>

            {/* Header */}
            <div style={{ marginBottom:36, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:"0.2em", color:"#555",
                  textTransform:"uppercase", marginBottom:5 }}>
                  {formatDate(new Date())}
                </div>
                <div style={{ fontSize:11, color:"#555" }}>{formatTime(new Date())}</div>
              </div>
              <button onClick={() => setScreen(SCREENS.ADD)}
                style={{ background:"transparent", border:"1px solid #3a3a3c",
                  color:"#888", width:32, height:32, borderRadius:"50%",
                  fontSize:18, fontWeight:200, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.2s", flexShrink:0, marginTop:2 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#888"; e.currentTarget.style.color="#f0f0f0"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#3a3a3c"; e.currentTarget.style.color="#888"; }}>
                +
              </button>
            </div>

            {/* Points + streak */}
            <div style={{ marginBottom:36, position:"relative" }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:4 }}>
                <span style={{ fontSize:60, fontWeight:100, lineHeight:1 }}>{points}</span>
                <span style={{ fontSize:11, color:"#666", letterSpacing:"0.12em" }}>pts</span>
                {streak > 0 && (
                  <span style={{ fontSize:13, marginLeft:4, color:"#f7d07e" }}>{streak}🔥</span>
                )}
                {apostaDia && (
                  <span style={{ fontSize:11, color:"#f7d07e", animation:"pulse 1.2s ease infinite" }}>⚠️ aposta</span>
                )}
                {hardcoreBlocked && (
                  <span style={{ fontSize:11, color:"#cc4444", animation:"pulse 0.8s ease infinite" }}>💀 hardcore</span>
                )}
                {isFrozen && (
                  <span style={{ fontSize:11, color:"#7eb8f7" }}>🧊 frozen</span>
                )}
              </div>

              {pointAnim && (
                <div style={{ position:"absolute", top:4, left:100, fontSize:20, fontWeight:300,
                  color: pointAnim.sign === "+" ? "#a8e6a3" : "#e06060",
                  animation:"pointPop 1.3s ease forwards", pointerEvents:"none" }}>
                  {pointAnim.sign}{pointAnim.value}
                </div>
              )}

              <div style={{ height:1, background:"#2a2a2c", overflow:"hidden", marginBottom: points <= 30 ? 8 : 0 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:barColor,
                  transition:"width 0.9s ease, background 0.6s ease" }} />
              </div>
              {points <= 30 && (
                <div style={{ fontSize:10, color:"#cc3333", letterSpacing:"0.18em",
                  animation:"flicker 1.2s ease infinite" }}>⚠ ZONA DE PERIGO</div>
              )}

              {/* Rank */}
              <div style={{ marginTop:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:12 }}>{currentRank.icon}</span>
                    <span style={{ fontSize:11, color: currentRank.color, letterSpacing:"0.1em" }}>{currentRank.title}</span>
                    <span style={{ fontSize:10, color:"#444" }}>{lifetimePts}pts totais</span>
                  </div>
                  {nextRank && (
                    <span style={{ fontSize:10, color:"#444" }}>
                      {nextRank.pts - lifetimePts}pts → {nextRank.icon} {nextRank.title}
                    </span>
                  )}
                </div>
                <div style={{ height:1, background:"#2a2a2c", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${rankPct}%`, background: currentRank.color,
                    opacity:0.5, transition:"width 1s ease" }} />
                </div>
              </div>
            </div>

            {/* Shield indicator */}
            {inventory.shield > 0 && (
              <div style={{ marginBottom:16, fontSize:11, color:"#888", letterSpacing:"0.05em" }}>
                🛡️ {inventory.shield} escudo{inventory.shield > 1 ? "s" : ""} activo{inventory.shield > 1 ? "s" : ""}
              </div>
            )}

            {/* Notif prompt */}
            {!notifGranted && allPending.length > 0 && (
              <div onClick={handleRequestNotif} style={{ marginBottom:20, padding:"10px 14px",
                background:"#252527", borderLeft:"1px solid #3a3a3c", cursor:"pointer",
                fontSize:11, color:"#666", letterSpacing:"0.06em" }}>
                🔔 Ativar notificações
              </div>
            )}

            {/* Category filter */}
            {usedCats.length > 1 && (
              <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
                <button onClick={() => setFilterCat("all")}
                  style={{ ...filterChip, borderColor: filterCat === "all" ? "#aaa" : "#3a3a3c", color: filterCat === "all" ? "#ccc" : "#555" }}>
                  Todas
                </button>
                {usedCats.map(cid => {
                  const c = CATEGORIES.find(x => x.id === cid);
                  return (
                    <button key={cid} onClick={() => setFilterCat(cid)}
                      style={{ ...filterChip,
                        borderColor: filterCat === cid ? c.color : "#3a3a3c",
                        color: filterCat === cid ? c.color : "#555" }}>
                      {c?.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty */}
            {allPending.length === 0 && doneTasks.length === 0 && (
              <div style={{ color:"#444", fontSize:13, letterSpacing:"0.03em" }}>
                Sem tarefas. Adiciona uma.
              </div>
            )}

            {/* Pending tasks */}
            {pendingTasks.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={sectionLabel}>Hoje</div>
                {pendingTasks.map((task, i) => {
                  const overdue  = task.time ? isOverdue(task.time) : false;
                  const cd       = task.time ? countdown(task.time) : "";
                  const urgent   = task.time && !overdue && secondsUntil(task.time) < 600; // < 10 min
                  const fading   = completingId === task.id || failingId === task.id;
                  const catColor = getCatColor(task.category);
                  return (
                    <div key={task.id} style={{ marginBottom:2,
                      animation: fading && activeAnim === "flash"  ? `completionFlash 0.5s ease` :
                                 fading && activeAnim === "glow"   ? `completionGlow 0.6s ease` :
                                 fading && activeAnim === "shake"  ? `completionShake 0.4s ease` :
                                 `taskIn 0.3s ease ${i*0.06}s both`,
                      opacity: fading && !["flash","glow","shake"].includes(activeAnim) ? 0.15 : fading ? 0.3 : 1,
                      transition:"opacity 0.3s" }}>
                      <div style={{ background:"#252527",
                        borderLeft:`2px solid ${overdue ? "#cc4444" : catColor + "88"}`,
                        padding:"13px 16px", display:"flex",
                        justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                            {task.recurring && <span style={{ fontSize:9, color:"#666" }}>↺</span>}
                            <div style={{ fontSize:14, fontWeight:300,
                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                              {task.title}
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ fontSize:10, letterSpacing:"0.08em",
                              color: overdue ? "#cc6666" : urgent ? "#f7d07e" : "#666",
                              animation: urgent ? "pulse 1s ease infinite" : "none",
                              fontVariantNumeric:"tabular-nums" }}>
                              {!task.time ? "sem hora" : overdue ? "EXPIRADO" : cd}
                            </div>
                            <span style={{ color:"#3a3a3c", fontSize:10 }}>·</span>
                            <span style={{ fontSize:10, color:"#555" }}>{task.pts}pts</span>
                            <span style={{ fontSize:9, color: catColor, opacity:0.8 }}>
                              {CATEGORIES.find(c => c.id === task.category)?.label}
                            </span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:5, marginLeft:12, flexShrink:0 }}>
                          <button onClick={() => completeTask(task)} style={actionBtn("#a8e6a3")}>✓</button>
                          <button onClick={() => failTask(task)} style={actionBtn("#e06060")}>✗</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Done/Failed history */}
            {doneTasks.length > 0 && (
              <div>
                <div style={sectionLabel}>Concluídas</div>
                {doneTasks.slice().reverse().map(task => (
                  <div key={task.id} style={{ marginBottom:2, padding:"10px 16px",
                    background:"#1c1c1e",
                    borderLeft:`2px solid ${task.status === "done" ? "#3a6a3a" : "#6a3a3a"}`,
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, fontWeight:300,
                      color: task.status === "done" ? "#777" : "#666",
                      textDecoration: task.status === "done" ? "line-through" : "none",
                      textDecorationColor:"#3a5a3a" }}>
                      {task.title}
                    </span>
                    <span style={{ fontSize:11, marginLeft:12, flexShrink:0,
                      color: task.status === "done" ? "#5aaa5a" : "#aa5a5a" }}>
                      {task.status === "done" ? `+${task.pts}` : `-${task.pts}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -- FOCUS / POMODORO ---------------------------------------------- */}
        {screen === SCREENS.FOCUS && (() => {
          const totalSecs = pomoPhase === "focus"
            ? (pomoMode === "25/5" ? 25 : 50) * 60
            : (pomoMode === "25/5" ? 5 : 10) * 60;
          const elapsed = totalSecs - pomoSecsLeft;
          const prog = elapsed / totalSecs; // 0→1

          // Analog clock hands from pomoSecsLeft
          const mins = Math.floor(pomoSecsLeft / 60);
          const secs = pomoSecsLeft % 60;
          // Map remaining time onto clock face (0 = 12 o'clock)
          const minAngle  = (mins / 60) * 360;
          const secAngle  = (secs / 60) * 360;
          const progAngle = prog * 360; // sweep arc

          const cx = 160, cy = 160, R = 140;
          const toXY = (angleDeg, radius) => {
            const rad = (angleDeg - 90) * Math.PI / 180;
            return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
          };
          const arcPath = (startDeg, endDeg, r) => {
            const [x1,y1] = toXY(startDeg, r);
            const [x2,y2] = toXY(endDeg, r);
            const large = (endDeg - startDeg) > 180 ? 1 : 0;
            return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
          };
          const phaseColor = pomoPhase === "focus" ? "#cc4444" : "#5aaa5a";

          return (
            <div style={{ position:"fixed", inset:0, zIndex:90, background:"#111",
              display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
              animation:"fadeIn 0.3s ease",
              /* Rotate entire screen to landscape */
              transform:"rotate(90deg)",
              transformOrigin:"center center",
              width:"100vh", height:"100vw",
              left:"50%", top:"50%",
              marginLeft:"-50vh", marginTop:"-50vw" }}>

              {/* Phase + mode top-left */}
              <div style={{ position:"absolute", top:24, left:32, display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase",
                  color: phaseColor, animation: pomoRunning ? "pulse 2s ease infinite" : "none" }}>
                  {pomoPhase === "focus" ? "FOCO" : "DESCANSO"}
                </div>
                {pomoCycles > 0 && (
                  <div style={{ fontSize:9, color:"#444", letterSpacing:"0.1em" }}>
                    {pomoCycles} ciclo{pomoCycles > 1 ? "s" : ""}
                  </div>
                )}
                {pomoPhase === "focus" && pomoRunning && (
                  <div style={{ fontSize:9, color:"#a8e6a3", letterSpacing:"0.1em", animation:"pulse 2s ease infinite" }}>
                    +1pt/min
                  </div>
                )}
              </div>

              {/* Mode selector top-right */}
              <div style={{ position:"absolute", top:20, right:28, display:"flex", gap:6 }}>
                {["25/5","50/10"].map(m => (
                  <button key={m} onClick={() => switchPomoMode(m)}
                    style={{ background:"transparent", fontSize:9, letterSpacing:"0.1em",
                      border:`1px solid ${pomoMode === m ? "#666" : "#2a2a2a"}`,
                      color: pomoMode === m ? "#aaa" : "#3a3a3a",
                      padding:"4px 8px", borderRadius:2, cursor:"pointer", transition:"all 0.2s" }}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Analog clock SVG */}
              <svg width="320" height="320" viewBox="0 0 320 320"
                style={{ filter: pomoRunning ? `drop-shadow(0 0 20px ${phaseColor}33)` : "none",
                  transition:"filter 0.5s" }}>

                {/* Outer ring */}
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e1e1e" strokeWidth="1" />

                {/* Progress arc — shows elapsed time */}
                {prog > 0 && prog < 1 && (
                  <path d={arcPath(0, progAngle, R - 6)}
                    fill="none" stroke={phaseColor} strokeWidth="3"
                    strokeLinecap="round" opacity="0.5" />
                )}
                {prog >= 1 && (
                  <circle cx={cx} cy={cy} r={R - 6} fill="none"
                    stroke={phaseColor} strokeWidth="3" opacity="0.5" />
                )}

                {/* Hour markers */}
                {Array.from({length:12},(_,i) => {
                  const a = i * 30;
                  const [x1,y1] = toXY(a, R - 2);
                  const [x2,y2] = toXY(a, R - 10);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#2e2e2e" strokeWidth={i % 3 === 0 ? 2 : 1} />;
                })}

                {/* Minute hand — shows remaining minutes mapped to 0-60 */}
                {(() => {
                  const [hx,hy] = toXY(minAngle, R * 0.72);
                  return <line x1={cx} y1={cy} x2={hx} y2={hy}
                    stroke="#e0e0e0" strokeWidth="2.5" strokeLinecap="round" />;
                })()}

                {/* Second hand */}
                {(() => {
                  const [sx,sy] = toXY(secAngle, R * 0.88);
                  const [bx,by] = toXY(secAngle + 180, R * 0.18);
                  return <>
                    <line x1={bx} y1={by} x2={sx} y2={sy}
                      stroke={phaseColor} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx={cx} cy={cy} r="3" fill={phaseColor} />
                  </>;
                })()}

                {/* Center dot */}
                <circle cx={cx} cy={cy} r="4" fill="#e0e0e0" />

                {/* Digital readout inside */}
                <text x={cx} y={cy + 48} textAnchor="middle"
                  fill="#444" fontSize="13" fontFamily="monospace" letterSpacing="2">
                  {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
                </text>
              </svg>

              {/* Controls bottom */}
              <div style={{ position:"absolute", bottom:24, display:"flex", gap:20, alignItems:"center" }}>
                <button onClick={pomoReset}
                  style={{ background:"transparent", border:"1px solid #2a2a2a", color:"#444",
                    width:40, height:40, borderRadius:"50%", fontSize:14, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#555";e.currentTarget.style.color="#777";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2a2a";e.currentTarget.style.color="#444";}}>
                  ↺
                </button>

                <button onClick={() => setPomoRunning(r => !r)}
                  style={{ background: pomoRunning ? "transparent" : "#f0f0f0",
                    border: pomoRunning ? "1px solid #444" : "none",
                    color: pomoRunning ? "#777" : "#111",
                    width:56, height:56, borderRadius:"50%", fontSize:18, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow: pomoRunning ? "none" : "0 0 24px rgba(240,240,240,0.12)",
                    transition:"all 0.2s" }}>
                  {pomoRunning ? "⏸" : "▶"}
                </button>

                <button onClick={() => {
                    const next = pomoPhase === "focus" ? "break" : "focus";
                    if (next === "focus") setPomoCycles(c => c + 1);
                    setPomoPhase(next);
                    const m2 = pomoMode === "25/5" ? (next==="focus"?25:5) : (next==="focus"?50:10);
                    setPomoSecsLeft(m2 * 60);
                    setPomoRunning(false);
                  }}
                  style={{ background:"transparent", border:"1px solid #2a2a2a", color:"#444",
                    width:40, height:40, borderRadius:"50%", fontSize:12, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#555";e.currentTarget.style.color="#777";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2a2a";e.currentTarget.style.color="#444";}}>
                  ⏭
                </button>

                <button onClick={() => { setScreen(SCREENS.MAIN); setPomoRunning(false); }}
                  style={{ background:"transparent", border:"1px solid #333", color:"#555",
                    fontSize:9, letterSpacing:"0.15em", cursor:"pointer", textTransform:"uppercase",
                    padding:"6px 14px", borderRadius:2, marginLeft:8, transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#888";e.currentTarget.style.color="#aaa";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.color="#555";}}>
                  SAIR
                </button>
              </div>
            </div>
          );
        })()}

        {/* -- REWARDS SCREEN ------------------------------------------------- */}
        {screen === SCREENS.REWARDS && (
          <div style={{ padding:"60px 28px 120px", animation:"slideUp 0.25s ease", minHeight:"100vh" }}>
            <button onClick={() => setScreen(SCREENS.MAIN)} style={backBtn}>← Voltar</button>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:32 }}>
              <div style={{ fontSize:11, letterSpacing:"0.2em", color:"#666", textTransform:"uppercase" }}>
                Recompensas
              </div>
              <div style={{ fontSize:20, fontWeight:200 }}>{points} <span style={{ fontSize:11, color:"#555" }}>pts</span></div>
            </div>

            {/* Add reward */}
            <div style={{ marginBottom:32, padding:"16px", background:"#252527", borderRadius:4 }}>
              <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#555", textTransform:"uppercase", marginBottom:12 }}>
                Nova meta pessoal
              </div>
              <input placeholder="ex: jantar fora, dia de descanso, filme..."
                value={newReward.title}
                onChange={e => setNewReward(p => ({...p, title:e.target.value}))}
                style={{ ...inputStyle, marginBottom:16, fontSize:13 }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ fontSize:10, color:"#555", letterSpacing:"0.1em" }}>CUSTO</span>
                <span style={{ fontSize:24, fontWeight:100 }}>{newReward.cost} pts</span>
              </div>
              <input type="range" min={10} max={500} step={10} value={newReward.cost}
                onChange={e => setNewReward(p => ({...p, cost:Number(e.target.value)}))}
                style={{ width:"100%", accentColor:"#f0f0f0", marginBottom:16 }} />
              <button onClick={addReward}
                style={{ width:"100%", background:"#f0f0f0", border:"none", color:"#1c1c1e",
                  padding:"12px", borderRadius:2, fontSize:11, fontWeight:600,
                  letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer",
                  opacity: newReward.title.trim() ? 1 : 0.2, transition:"opacity 0.2s" }}>
                Criar Meta
              </button>
            </div>

            {/* Rewards list */}
            {rewards.length === 0 ? (
              <div style={{ color:"#444", fontSize:13 }}>Sem metas. Cria uma acima.</div>
            ) : (
              <div>
                <div style={sectionLabel}>As tuas metas</div>
                {rewards.map(r => {
                  const canAfford = points >= r.cost;
                  return (
                    <div key={r.id} style={{ marginBottom:8, padding:"16px", background:"#252527",
                      borderRadius:4, borderLeft:`2px solid ${r.unlocked ? "#5aaa5a" : canAfford ? "#f0f0f0" : "#3a3a3c"}`,
                      opacity: r.unlocked ? 0.5 : 1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:300, marginBottom:4,
                            textDecoration: r.unlocked ? "line-through" : "none", color: r.unlocked ? "#666" : "#f0f0f0" }}>
                            {r.title}
                          </div>
                          <div style={{ fontSize:11, color: canAfford && !r.unlocked ? "#aaa" : "#555" }}>
                            {r.unlocked ? "✓ Desbloqueado!" : `${r.cost} pts`}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:8, marginLeft:12 }}>
                          {!r.unlocked && (
                            <button onClick={() => unlockReward(r)}
                              style={{ background: canAfford ? "#f0f0f0" : "transparent",
                                border: canAfford ? "none" : "1px solid #333",
                                color: canAfford ? "#1c1c1e" : "#444",
                                padding:"8px 14px", borderRadius:2, fontSize:11,
                                cursor: canAfford ? "pointer" : "not-allowed",
                                transition:"all 0.2s", whiteSpace:"nowrap" }}>
                              {canAfford ? "Resgatar" : "Sem pts"}
                            </button>
                          )}
                          <button onClick={() => deleteReward(r.id)}
                            style={{ background:"transparent", border:"1px solid #2a2a2c",
                              color:"#444", width:32, height:32, borderRadius:2,
                              fontSize:13, cursor:"pointer", display:"flex",
                              alignItems:"center", justifyContent:"center" }}>
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Challenges section */}
            <div style={{ marginTop:40 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={sectionLabel}>Desafios IA</div>
                <button onClick={fetchAiChallenges} disabled={aiLoading}
                  style={{ background:"transparent", border:"1px solid #3a3a3c",
                    color: aiLoading ? "#444" : "#888", padding:"6px 12px", borderRadius:2,
                    fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase",
                    cursor: aiLoading ? "default" : "pointer", transition:"all 0.2s" }}>
                  {aiLoading ? "A gerar..." : aiChallenges.length > 0 ? "↺ Novos" : "Gerar"}
                </button>
              </div>

              {aiError && (
                <div style={{ fontSize:12, color:"#cc6666", marginBottom:12 }}>{aiError}</div>
              )}

              {aiLoading && (
                <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ flex:1, height:80, background:"#252527", borderRadius:4,
                      animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />
                  ))}
                </div>
              )}

              {aiChallenges.length > 0 && !aiLoading && (
                <div>
                  {aiChallenges.map(c => {
                    const cat = CATEGORIES.find(x => x.id === c.category);
                    return (
                      <div key={c.id} style={{ marginBottom:8, padding:"14px 16px",
                        background:"#252527", borderRadius:4,
                        borderLeft:`2px solid ${c.accepted ? "#5aaa5a" : (cat?.color ?? "#aaa") + "88"}`,
                        opacity: c.accepted ? 0.5 : 1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:300, marginBottom:4 }}>{c.title}</div>
                            <div style={{ fontSize:11, color:"#666", marginBottom:6, lineHeight:1.5 }}>{c.desc}</div>
                            <div style={{ display:"flex", gap:8, fontSize:10 }}>
                              <span style={{ color: cat?.color ?? "#aaa" }}>{cat?.label}</span>
                              <span style={{ color:"#555" }}>·</span>
                              <span style={{ color:"#555" }}>{c.pts}pts</span>
                            </div>
                          </div>
                          <button onClick={() => !c.accepted && acceptChallenge(c)}
                            style={{ marginLeft:12, background: c.accepted ? "transparent" : "#f0f0f0",
                              border: c.accepted ? "1px solid #3a3a3c" : "none",
                              color: c.accepted ? "#555" : "#1c1c1e",
                              padding:"8px 12px", borderRadius:2, fontSize:11,
                              cursor: c.accepted ? "default" : "pointer",
                              flexShrink:0, transition:"all 0.2s" }}>
                            {c.accepted ? "✓" : "Aceitar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {aiChallenges.length === 0 && !aiLoading && !aiError && (
                <div style={{ color:"#444", fontSize:12, lineHeight:1.7 }}>
                  Carrega em "Gerar" para a IA sugerir<br/>3 desafios personalizados para hoje.
                </div>
              )}
            </div>
          </div>
        )}

        {/* -- BOTTOM NAV ---------------------------------------------------- */}
        {[SCREENS.MAIN, SCREENS.STATS, SCREENS.SHOP, SCREENS.REWARDS].includes(screen) && (
          <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
            width:"100%", maxWidth:390,
            background:"#1c1c1ecc", backdropFilter:"blur(16px)",
            borderTop:"1px solid #2a2a2c",
            display:"flex", justifyContent:"space-around", alignItems:"center",
            padding:"10px 0 18px" }}>

            <button onClick={() => setScreen(SCREENS.STATS)}
              style={{ ...navBtn, color: screen === SCREENS.STATS ? "#f0f0f0" : "#444" }}>
              <div style={{ fontSize:16, marginBottom:2 }}>{avatarObj.icon}</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em" }}>PERFIL</div>
            </button>

            <button onClick={() => setScreen(SCREENS.FOCUS)}
              style={{ ...navBtn, color: screen === SCREENS.FOCUS ? "#f0f0f0" : "#444" }}>
              <div style={{ fontSize:16, marginBottom:2 }}>⏱️</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em" }}>FOCO</div>
            </button>

            <button onClick={() => setScreen(SCREENS.REWARDS)}
              style={{ ...navBtn, color: screen === SCREENS.REWARDS ? "#f0f0f0" : "#444" }}>
              <div style={{ fontSize:16, marginBottom:2 }}>🎯</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em" }}>METAS</div>
            </button>

            <button onClick={() => setScreen(SCREENS.SHOP)}
              style={{ ...navBtn, color: screen === SCREENS.SHOP ? "#f0f0f0" : "#444" }}>
              <div style={{ fontSize:16, marginBottom:2 }}>🛒</div>
              <div style={{ fontSize:9, letterSpacing:"0.1em" }}>LOJA</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Shared styles ------------------------------------------------------------

const inputStyle = {
  width:"100%", background:"transparent", border:"none",
  borderBottom:"1px solid #2a2a2c", color:"#f0f0f0",
  padding:"10px 0", fontSize:14, fontWeight:300,
  outline:"none", fontFamily:"inherit", display:"block",
};
const labelStyle = {
  fontSize:10, letterSpacing:"0.2em", color:"#666",
  textTransform:"uppercase", marginBottom:10, display:"block",
};
const sectionLabel = {
  fontSize:10, letterSpacing:"0.2em", color:"#555",
  textTransform:"uppercase", marginBottom:10,
};
const backBtn = {
  background:"none", border:"none", color:"#666", fontSize:11,
  letterSpacing:"0.12em", cursor:"pointer", marginBottom:48,
  padding:0, textTransform:"uppercase",
};
const navBtn = {
  background:"transparent", border:"none", cursor:"pointer",
  display:"flex", flexDirection:"column", alignItems:"center",
  padding:"4px 20px", transition:"color 0.15s",
};
const filterChip = {
  background:"transparent", fontSize:11, padding:"5px 12px",
  borderRadius:20, cursor:"pointer", border:"1px solid",
  transition:"all 0.15s", letterSpacing:"0.04em",
};

function actionBtn(color) {
  return {
    background:"transparent", border:`1px solid ${color}20`,
    color, width:32, height:32, borderRadius:3, fontSize:13,
    cursor:"pointer", display:"flex", alignItems:"center",
    justifyContent:"center", transition:"border-color 0.2s",
  };
}
