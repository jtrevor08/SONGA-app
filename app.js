/*hii ndo the main code na most of the other modules ziko apa pia so please usi change hii mostly hii*/
"use strict";

/* ───────────── helpers ───────────── */
const $ = (s, r = document) => r.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 9);
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const todayStr = () => ymd(new Date());
const dayDiff = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const tmin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const minT = (m) => {
  m = ((m % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};
const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtDate = (s, o) =>
  pd(s).toLocaleDateString(
    undefined,
    o || { weekday: "short", day: "numeric", month: "short" },
  );
const toDT = (date, time) => {
  const d = pd(date);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else d.setHours(9, 0, 0, 0);
  return d;
};
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const cap1 = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor((s.length - 1) / 2)];
};
const mode = (a) => {
  const c = {};
  a.forEach((v) => (c[v] = (c[v] || 0) + 1));
  return +Object.entries(c).sort((x, y) => y[1] - x[1])[0][0];
};
const durLbl = (m) =>
  m < 60
    ? `${m} min`
    : `${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "m" : ""}`;
const relDay = (s) => {
  const d = dayDiff(todayStr(), s);
  return d === 0
    ? "Today"
    : d === 1
      ? "Tomorrow"
      : d === -1
        ? "Yesterday"
        : fmtDate(s);
};
const dowMon = (d) => (d.getDay() + 6) % 7;
function setPath(o, p, v) {
  const k = p.split(".");
  while (k.length > 1) o = o[k.shift()];
  o[k[0]] = v;
}

const CATS = {
  study: { n: "Study", e: "📚", c: "#5B7CFA" },
  work: { n: "Work", e: "💼", c: "#E8A317" },
  health: { n: "Health", e: "🌿", c: "#2BAE78" },
  home: { n: "Home", e: "🏠", c: "#9B5DE5" },
  social: { n: "Social", e: "💬", c: "#F0577D" },
  travel: { n: "Travel", e: "🚌", c: "#14B2C4" },
  general: { n: "General", e: "✨", c: "#7C8798" },
};
const DEF_DUR = {
  study: 60,
  work: 45,
  health: 45,
  home: 30,
  social: 90,
  travel: 30,
  general: 30,
};
const CAT_RX = [
  [
    "study",
    /\b(study|revise|revision|exam|test|quiz|lecture|class|assignment|essay|coursework|homework|thesis|lab|tutorial|seminar|reading|read|chapter|flashcards?|dissertation|library)\b/i,
  ],
  [
    "social",
    /\b(birthday|dinner|party|friends?|lunch|coffee|visit|mum|mom|dad|wedding|hangout|catch up|club|society)\b/i,
  ],
  [
    "health",
    /\b(doctor|dentist|gym|workout|exercise|run|walk|yoga|clinic|appointment|therapy|physio|swim|stretch)\b/i,
  ],
  [
    "travel",
    /\b(bus|train|flight|airport|commute|drive|pick up|drop off|ride|matatu|uber|travel|trip)\b/i,
  ],
  [
    "home",
    /\b(clean|laundry|dishes|cook|groceries|grocery|shop|shopping|rent|bills?|pay|tidy|trash|garbage|errand|repair)\b/i,
  ],
  [
    "work",
    /\b(meeting|email|e-mail|report|client|project|presentation|standup|invoice|boss|manager|proposal|call|interview|shift|office)\b/i,
  ],
];
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const WDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/* ───────────── state ───────────── */
const KEY = "songa.v1";
const defaultRoutines = () =>
  [
    {
      id: uid(),
      name: "Morning launch",
      e: "🌅",
      time: "07:30",
      days: [1, 2, 3, 4, 5],
      on: true,
      steps: [
        ["Drink a glass of water", 2],
        ["Wash up and get dressed", 15],
        ["Eat something", 15],
        ["Look at today’s plan", 3],
      ],
    },
    {
      id: uid(),
      name: "Leaving the house",
      e: "🚪",
      time: "",
      days: [],
      on: false,
      steps: [
        ["Phone, keys, wallet / ID", 2],
        ["Charger and water bottle", 1],
        ["Check the weather", 1],
        ["Lock up", 1],
      ],
    },
    {
      id: uid(),
      name: "Wind-down",
      e: "🌙",
      time: "21:30",
      days: [0, 1, 2, 3, 4, 5, 6],
      on: true,
      steps: [
        ["Pack bag for tomorrow", 10],
        ["Choose tomorrow’s top 3", 5],
        ["Screens down, lights low", 10],
      ],
    },
  ].map((r) => ({
    ...r,
    steps: r.steps.map(([t, min]) => ({ id: uid(), t, min })),
  }));
const defaults = () => ({
  v: 1,
  onboarded: false,
  name: "",
  role: "student",
  theme: "auto",
  tasks: [],
  classes: [],
  routines: defaultRoutines(),
  routineDone: {},
  checkins: {},
  fired: {},
  stats: {},
  focusMin: {},
  leave: ["Phone", "Keys", "Wallet / student ID", "Charger", "Water bottle"],
  prefs: {
    learn: false,
    prep: 30,
    startOffset: 0,
    followUp: true,
    notif: false,
    items: {},
  },
});
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const o = JSON.parse(raw),
      d = defaults();
    return { ...d, ...o, prefs: { ...d.prefs, ...(o.prefs || {}) } };
  } catch (e) {
    return defaults();
  }
}
let S = load();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
}
const ui = {
  tab: "today",
  day: todayStr(),
  month: (() => {
    const d = new Date();
    d.setDate(1);
    return d;
  })(),
  leaveChecked: {},
  focus: null,
  queue: [],
};
let ctx = null,
  ctxHook = null,
  sheetStack = [],
  rec = null;

/* ───────────── learning (user-controlled) ───────────── */
function learn(key, val) {
  if (!S.prefs.learn || val == null) return;
  const st = (S.stats[key] = S.stats[key] || []);
  st.push(val);
  if (st.length > 7) st.shift();
  if (st.length < 3) return;
  const it =
    S.prefs.items[key] || (S.prefs.items[key] = { on: true, manual: false });
  if (it.manual) return;
  it.value = key === "lead" ? mode(st) : median(st);
  it.n = st.length;
}
const getPref = (k) => {
  const it = S.prefs.items[k];
  return it && it.on && it.value != null ? it.value : null;
};
const defaultPrep = () => getPref("lead") ?? S.prefs.prep;
const durationDefault = (cat) => getPref("dur:" + cat) ?? DEF_DUR[cat];
const prefLabel = (k, v) =>
  k === "lead"
    ? `Reminder lead time: ${v} min before`
    : k.startsWith("dur:")
      ? `Typical ${k.slice(4)} task length: ${durLbl(v)}`
      : `Usual ${k.slice(5)} time: ${fmtTime(minT(v))}`;
const prefWhy = (k, it) =>
  it.manual
    ? "You set this yourself."
    : k === "lead"
      ? `You picked this prep reminder on your last ${it.n} timed tasks.`
      : k.startsWith("dur:")
        ? `Middle value of the lengths you set on your last ${it.n} ${k.slice(4)} tasks.`
        : `Middle value of the start times on your last ${it.n} ${k.slice(5)} tasks.`;

/* ───────────── natural-language capture ───────────── */
function parseCapture(raw, now = new Date()) {
  const src = String(raw || "")
    .trim()
    .replace(/\s+/g, " ");
  let t = " " + src + " ",
    m;
  const r = {
    title: "",
    date: null,
    time: null,
    due: null,
    dur: null,
    urgency: "normal",
    location: "",
    cat: "general",
    flags: [],
    uncertain: {},
    deadline: false,
    noDate: false,
    orig: src,
  };
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const take = (re) => {
    const x = t.match(re);
    if (x) t = t.replace(x[0], " ");
    return x;
  };
  const mkDate = (day, mon) => {
    const mi = MONTHS.indexOf(mon.slice(0, 3).toLowerCase());
    let d = new Date(today.getFullYear(), mi, day);
    if (d < today) {
      d = new Date(today.getFullYear() + 1, mi, day);
      r.flags.push("That date has passed this year, so I used next year.");
      r.uncertain.date = true;
    }
    return d;
  };
  r.deadline =
    /\b(due|deadline|submit|submission|hand in|turn in)\b/i.test(t) ||
    /\bby\s+(\d|noon|midnight|tomorrow|tonight|today|next|this|end of|mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
      t,
    );
  if (take(/\b(urgent(?:ly)?|asap|important|critical|immediately)\b/i))
    r.urgency = "high";
  else if (take(/\b(whenever|sometime|eventually|no rush)\b/i))
    r.urgency = "low";

  let d = null;
  if ((m = take(/\bin\s+(\d+)\s*(minutes?|mins?|hours?|hrs?)\b/i))) {
    const dt = new Date(
      now.getTime() + +m[1] * (/h/i.test(m[2]) ? 60 : 1) * 6e4,
    );
    d = new Date(dt);
    d.setHours(0, 0, 0, 0);
    r.time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }
  if (
    (m = take(/\b(?:for\s+)?(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i))
  )
    r.dur = Math.max(5, Math.round(+m[1] * (/h/i.test(m[2]) ? 60 : 1)));
  if (!d) {
    if ((m = take(/\b(\d{4})-(\d{2})-(\d{2})\b/)))
      d = new Date(+m[1], +m[2] - 1, +m[3]);
    else if ((m = take(/\bin\s+(\d+)\s*(days?|weeks?)\b/i)))
      d = addDays(today, +m[1] * (/week/i.test(m[2]) ? 7 : 1));
    else if (
      (m = take(
        /\b(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i,
      ))
    )
      d = mkDate(+m[1], m[2]);
    else if (
      (m = take(
        /\b(?:on\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
      ))
    )
      d = mkDate(+m[2], m[1]);
    else if ((m = take(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/))) {
      d = new Date(
        m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : today.getFullYear(),
        +m[2] - 1,
        +m[1],
      );
      r.flags.push(`I read ${m[1]}/${m[2]} as day/month.`);
      r.uncertain.date = true;
    } else if (take(/\bday after tomorrow\b/i)) d = addDays(today, 2);
    else if (take(/\b(tomorrow|tmrw|tmr)\b/i)) d = addDays(today, 1);
    else if ((m = take(/\b(tonight|today)\b/i))) {
      d = new Date(today);
      if (/tonight/i.test(m[1]))
        ((r.time = r.time || "19:00"),
          r.flags.push("“Tonight” is vague — I set 7:00 PM."),
          (r.uncertain.time = true));
    } else if (take(/\bnext week\b/i)) {
      d = addDays(today, 7 - dowMon(today));
      r.flags.push("“Next week” — I picked Monday.");
      r.uncertain.date = true;
    } else if (take(/\b(?:this\s+)?weekend\b/i)) {
      d = addDays(today, (5 - dowMon(today) + 7) % 7 || 7);
      r.flags.push("“Weekend” — I picked Saturday.");
      r.uncertain.date = true;
    } else if (
      (m = take(
        /\b(?:(next|this|on)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues?|wed|thu(?:rs?)?|fri|sat)\b/i,
      ))
    ) {
      const tgt = WDAYS.findIndex((w) =>
        w.startsWith(m[2].toLowerCase().slice(0, 3)),
      );
      let diff = (tgt - today.getDay() + 7) % 7;
      if (diff === 0) {
        diff = 7;
        r.flags.push(
          `Today is ${cap1(WDAYS[tgt])} — I used next ${cap1(WDAYS[tgt])}.`,
        );
        r.uncertain.date = true;
      }
      if (
        (m[1] || "").toLowerCase() === "next" &&
        dowMon(today) < (tgt + 6) % 7 &&
        diff < 7
      )
        diff += 7;
      d = addDays(today, diff);
    }
  }
  if (!r.time) {
    let h,
      mi = 0,
      ap;
    if (
      (m = take(
        /\b(?:at|by|before|@|around)?\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?\b/i,
      ))
    ) {
      h = +m[1] % 12;
      if (/p/i.test(m[3])) h += 12;
      mi = +(m[2] || 0);
      r.time = `${pad(h)}:${pad(mi)}`;
    } else if (
      (m = take(/\b(?:at|by|before|@|around)?\s*([01]?\d|2[0-3]):([0-5]\d)\b/))
    )
      r.time = `${pad(+m[1])}:${m[2]}`;
    else if (take(/\b(?:at|by)?\s*noon\b/i)) r.time = "12:00";
    else if (take(/\bmidnight\b/i)) r.time = "23:59";
    else if (
      (m = take(
        /\b(?:at|by|@)\s*(\d{1,2})\b(?!\s*(?:min|hour|hr|st|nd|rd|th|\/|-))/i,
      ))
    ) {
      h = +m[1];
      if (h >= 1 && h <= 12) {
        if (h < 7) h += 12;
        r.flags.push(
          `Is ${m[1]} AM or PM? I assumed ${fmtTime(minT(h * 60))}.`,
        );
        r.uncertain.time = true;
        r.time = `${pad(h)}:00`;
      }
    } else if (
      (m = take(/\b(?:this\s+|in the\s+)?(morning|afternoon|evening|night)\b/i))
    ) {
      const map = {
        morning: "09:00",
        afternoon: "14:00",
        evening: "18:00",
        night: "20:00",
      };
      r.time = map[m[1].toLowerCase()];
      r.flags.push(
        `“${cap1(m[1].toLowerCase())}” is vague — I set ${fmtTime(r.time)}. Adjust if needed.`,
      );
      r.uncertain.time = true;
    }
  }
  if (r.time && !d) {
    d = new Date(today);
    if (toDTn(d, r.time) < now) {
      d = addDays(today, 1);
      r.flags.push("That time has passed today, so I used tomorrow.");
      r.uncertain.date = true;
    }
  }
  if (!d) {
    d = new Date(today);
    r.noDate = true;
    r.flags.push("No date mentioned — I set it to today.");
    r.uncertain.date = true;
  }
  r.date = ymd(d);
  if (
    r.date === ymd(today) &&
    r.time &&
    toDTn(d, r.time) < now &&
    !r.uncertain.date
  ) {
    r.flags.push("That time has already passed today.");
    r.uncertain.time = true;
  }
  if (
    r.deadline &&
    (/\b(due|deadline|submit|submission|hand in|turn in)\b/i.test(src) ||
      /\bby\b/i.test(src))
  )
    r.due = { date: r.date, time: r.time };
  if (
    (m = t.match(
      /\b(?:at|in|@)\s+(?:the\s+)?([A-Za-z][\w'’&.-]*(?:\s+(?!(?:on|at|by|for|before|after|and|to|with|about|regarding|so|then|because)\b)[A-Za-z0-9][\w'’&.-]*){0,2})/i,
    ))
  ) {
    r.location = cap1(m[1].replace(/[.,;]+$/, "").trim());
    t = t.replace(m[0], " ");
  }
  let title = t
    .replace(
      /\b(remind me to|remind me|i need to|i have to|i must|i should|don'?t forget to|remember to|please|can you|i want to|need to|have to)\b/gi,
      " ",
    )
    .replace(/\b(due|deadline)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (let i = 0; i < 4; i++)
    title = title
      .replace(/^(?:[\s,.;:-]|to|on|at|by|in|for|and)\b\s*/i, "")
      .replace(/\s+(?:to|on|at|by|in|for|and|is|are|the)[\s,.;:-]*$/i, "")
      .replace(/[\s,.;:-]+$/, "");
  r.title = cap1(title) || cap1(src) || "Untitled";
  const probe = src.toLowerCase();
  r.cat = (CAT_RX.find(([, rx]) => rx.test(probe)) || ["general"])[0];
  return r;
}
function toDTn(d, time) {
  const x = new Date(d);
  const [h, m] = time.split(":").map(Number);
  x.setHours(h, m, 0, 0);
  return x;
}

/* ───────────── task construction, planning, steps ───────────── */
const ASSIGN_RX =
  /\b(assignment|essay|report|paper|thesis|coursework|project|proposal|presentation|homework|dissertation)\b/i;
function draftFromParsed(p, defaultDate) {
  const dur = p.dur || durationDefault(p.cat);
  let effort = dur;
  if (p.due && ASSIGN_RX.test(p.orig) && !p.dur) effort = 240;
  const t = {
    id: uid(),
    title: p.title,
    date: p.date,
    time: p.due ? null : p.time,
    due: p.due ? { date: p.due.date, time: p.due.time } : null,
    dur,
    effort,
    urgency: p.urgency,
    location: p.location,
    cat: p.cat,
    rem: {
      prep: p.time || p.due ? defaultPrep() : null,
      start: S.prefs.startOffset,
    },
    steps: [],
    checkpoints: [],
    status: "todo",
    created: Date.now(),
    orig: p.orig,
    flags: p.flags.slice(),
    uncertain: { ...p.uncertain },
    manualDate: false,
  };
  if (p.noDate && defaultDate) {
    t.date = defaultDate;
    t.flags = t.flags.filter((f) => !f.startsWith("No date"));
    t.uncertain.date = false;
  }
  if (t.due) applyPlan(t);
  t.steps = stepsFor(t);
  return t;
}
function applyPlan(t) {
  if (!t.due) {
    t.checkpoints = [];
    t.planStart = null;
    return t;
  }
  const today = todayStr(),
    D = Math.max(0, dayDiff(today, t.due.date));
  const sessions = Math.max(1, Math.ceil((t.effort || t.dur) / 60));
  let start =
    sessions <= 1
      ? t.due.date
      : ymd(addDays(pd(t.due.date), -Math.min(sessions + 1, D)));
  if (dayDiff(today, start) < 0) start = today;
  t.planStart = start;
  const span = dayDiff(start, t.due.date),
    old = t.checkpoints || [];
  t.checkpoints = [];
  if ((t.effort || 0) >= 120 && span >= 2) {
    const labels = ASSIGN_RX.test(t.title + " " + (t.orig || ""))
      ? ["Outline and sources", "First draft", "Review and polish"]
      : ["Quarter of the way", "Halfway", "Final check"];
    const seen = new Set();
    [0.25, 0.5, 0.75].forEach((f, i) => {
      const date = ymd(addDays(pd(start), Math.max(1, Math.round(span * f))));
      if (dayDiff(date, t.due.date) >= 1 && !seen.has(date)) {
        seen.add(date);
        t.checkpoints.push({
          id: uid(),
          label: labels[i],
          date,
          done: (old[i] || {}).done || false,
        });
      }
    });
  }
  if (!t.manualDate) t.date = start;
  return t;
}
function stepsFor(t) {
  const s = (t.title + " " + (t.orig || "")).toLowerCase(),
    d = t.dur || 30;
  const T = (a) =>
    a.map(([x, m]) => ({ id: uid(), t: x, min: m, done: false }));
  if (
    /(essay|paper|report|assignment|coursework|thesis|proposal|presentation|homework|project)/.test(
      s,
    )
  )
    return T([
      ["Open the brief and list what is required", 5],
      ["Sketch a rough outline (bullets are fine)", 15],
      ["Write one rough section — no editing yet", 25],
      ["Fill in the remaining sections", 30],
      ["Proofread and check against the brief", 15],
      ["Submit and confirm it went through", 5],
    ]);
  if (
    /(study|revise|revision|exam|quiz|test|flashcard|read|chapter|lecture notes)/.test(
      s,
    )
  )
    return T([
      ["Gather notes and materials", 5],
      ["Pick just one topic", 2],
      ["25-minute focused review", 25],
      ["Test yourself from memory", 10],
      ["Note what to revisit next", 3],
    ]);
  if (/(email|e-mail|message|reply|text|call|phone|ring)/.test(s))
    return T([
      ["Open the draft or contact", 1],
      ["Write or say the first line only", 3],
      ["Finish and send / hang up", 5],
    ]);
  if (/(clean|laundry|tidy|dishes|trash|garbage|declutter)/.test(s))
    return T([
      ["Set a 10-minute timer", 1],
      ["Start with the most visible area", 10],
      ["Put things away", 5],
    ]);
  if (/(grocer|shop|buy|errand|pick up)/.test(s))
    return T([
      ["Write the list (check the fridge first)", 5],
      ["Bag, wallet and phone ready", 2],
      ["Go and get the items", Math.max(15, d - 7)],
    ]);
  if (
    /(meeting|lecture|class|appointment|dentist|doctor|interview|clinic|seminar|lab)/.test(
      s,
    )
  )
    return T([
      ["Check time, place and what to bring", 3],
      ["Pack your bag / open the link", 5],
      ["Leave or join 5 minutes early", 2],
    ]);
  if (/(pay|bill|rent|invoice|renew|register|apply|book)/.test(s))
    return T([
      ["Find the login or reference number", 4],
      ["Do the payment / form", 8],
      ["Save the confirmation", 2],
    ]);
  return T([
    ["Decide the very first tiny step", 2],
    ["Do 10 minutes of it", 10],
    ["Finish, or note what is left", Math.max(5, d - 12)],
  ]);
}
function remindersFor(t) {
  const out = [];
  if (t.status === "done" || t.status === "dropped") return out;
  const add = (kind, at, text) =>
    out.push({
      key: `${t.id}|${kind}|${at.getTime()}`,
      at,
      kind,
      text,
      taskId: t.id,
    });
  const rem = t.rem || {};
  if (t.time) {
    const dt = toDT(t.date, t.time);
    if (rem.prep)
      add(
        "prep",
        new Date(dt - rem.prep * 6e4),
        `Get ready — ${t.title} starts in ${rem.prep} min`,
      );
    if (rem.start != null)
      add(
        "start",
        new Date(dt - rem.start * 6e4),
        rem.start
          ? `${t.title} starts in ${rem.start} min`
          : `Time to start: ${t.title}`,
      );
    if (S.prefs.followUp)
      add(
        "check",
        new Date(dt.getTime() + 10 * 6e4),
        `Did you get started on “${t.title}”?`,
      );
  } else if (rem.start != null)
    add("start", toDT(t.date, "09:00"), `Today: ${t.title}`);
  if (t.due) {
    const dd = toDT(t.due.date, t.due.time || "09:00");
    if (
      !(t.date === t.due.date && !t.due.time && rem.start != null && !t.time)
    ) {
      if (t.due.time && rem.prep)
        add(
          "due",
          new Date(dd - rem.prep * 6e4),
          `Due in ${rem.prep} min: ${t.title}`,
        );
      else add("due", toDT(t.due.date, "09:00"), `Due today: ${t.title}`);
    }
    (t.checkpoints || [])
      .filter((c) => !c.done)
      .forEach((c) =>
        add(
          "checkpoint",
          toDT(c.date, "09:00"),
          `Checkpoint — ${c.label}: ${t.title}`,
        ),
      );
  }
  if (t.snoozeUntil)
    add("snooze", new Date(t.snoozeUntil), `Reminder: ${t.title}`);
  return out;
}

/* ───────────── queries ───────────── */
const taskEnd = (t) =>
  t.time
    ? new Date(toDT(t.date, t.time).getTime() + (t.dur || 30) * 6e4)
    : toDT(t.date, "23:59");
const isMissed = (t) =>
  t.status !== "done" && t.status !== "dropped" && taskEnd(t) < new Date();
const isProtected = (t) => {
  const td = todayStr();
  return (
    t.urgency === "high" ||
    (t.due && dayDiff(td, t.due.date) >= 0 && dayDiff(td, t.due.date) <= 2)
  );
};
const isPastDue = (t) =>
  t.due && toDT(t.due.date, t.due.time || "23:59") < new Date();
const classesOn = (date) =>
  S.classes.filter((c) => c.dow.includes(pd(date).getDay()));
const routinesOn = (date) =>
  S.routines.filter(
    (r) => r.on && r.time && r.days.includes(pd(date).getDay()),
  );
function itemsFor(date) {
  const out = [];
  S.tasks
    .filter((t) => t.status !== "dropped")
    .forEach((t) => {
      if (t.date === date) out.push({ k: "task", t, time: t.time });
      else if (t.due && t.due.date === date && t.status !== "done")
        out.push({ k: "due", t, time: t.due.time });
      (t.checkpoints || []).forEach((c) => {
        if (c.date === date && t.status !== "dropped")
          out.push({ k: "cp", t, c, time: null });
      });
    });
  classesOn(date).forEach((c) => out.push({ k: "class", c, time: c.start }));
  routinesOn(date).forEach((r) => out.push({ k: "routine", r, time: r.time }));
  const ord = { due: 0, cp: 1, task: 2, routine: 3, class: 4 };
  return out.sort((a, b) => {
    if (!a.time && b.time) return -1;
    if (a.time && !b.time) return 1;
    if (a.time !== b.time) return a.time < b.time ? -1 : 1;
    return ord[a.k] - ord[b.k];
  });
}
function busyOn(date, ignoreIds = []) {
  const b = [];
  S.tasks.forEach((t) => {
    if (
      t.date === date &&
      t.time &&
      t.status !== "done" &&
      t.status !== "dropped" &&
      !ignoreIds.includes(t.id)
    )
      b.push([tmin(t.time), tmin(t.time) + (t.dur || 30), t.title]);
  });
  classesOn(date).forEach((c) =>
    b.push([tmin(c.start), tmin(c.end), c.course]),
  );
  return b;
}
function findConflicts(t) {
  if (!t.time) return [];
  const a = tmin(t.time),
    e = a + (t.dur || 30);
  return busyOn(t.date, [t.id])
    .filter(([s, en]) => a < en && s < e)
    .map((x) => x[2]);
}
function findSlot(dur, from, extraBusy = {}) {
  let d = new Date(from);
  d.setSeconds(0, 0);
  const rem = d.getMinutes() % 30;
  if (rem) d.setMinutes(d.getMinutes() + (30 - rem));
  for (let i = 0; i < 400; i++) {
    const m = d.getHours() * 60 + d.getMinutes(),
      ds = ymd(d);
    if (m >= 8 * 60 && m + dur <= 21 * 60 + 30) {
      const busy = busyOn(ds).concat(extraBusy[ds] || []);
      if (!busy.some(([s, e]) => m < e && s < m + dur)) return d;
    }
    d = new Date(d.getTime() + 30 * 6e4);
    if (d.getHours() * 60 + d.getMinutes() > 21 * 60 + 30 || d.getHours() < 8) {
      d = addDays(d, d.getHours() >= 8 ? 1 : 0);
      d.setHours(8, 0, 0, 0);
    }
  }
  return d;
}

/* ───────────── actions on tasks ───────────── */
function celebrate() {
  const c = document.createElement("div");
  c.className = "confetti";
  const cols = ["#5046E5", "#2BAE78", "#E8A317", "#F0577D", "#14B2C4"];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = cols[i % 5];
    p.style.animationDelay = Math.random() * 0.4 + "s";
    c.appendChild(p);
  }
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 2400);
}
const PRAISE = [
  "Done — nicely handled.",
  "One less thing in your head.",
  "That counts. Well done.",
  "Finished. Take a breath.",
  "Progress made.",
];
function setDone(t, v) {
  t.status = v ? "done" : "todo";
  t.doneAt = v ? Date.now() : null;
  if (v) {
    t.steps.forEach((s) => (s.done = true));
    celebrate();
    toast(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  }
  save();
  render();
}
function moveTask(t, date, time) {
  t.date = date;
  t.time = time || null;
  t.status = "todo";
  t.manualDate = true;
  t.snoozeUntil = null;
  t.movedCount = (t.movedCount || 0) + 1;
  if (t.time && !t.rem.prep && t.rem.prep !== 0) t.rem.prep = null;
}
function deleteTask(t) {
  const i = S.tasks.indexOf(t);
  if (i < 0) return;
  S.tasks.splice(i, 1);
  save();
  render();
  toast(`“${t.title}” deleted`, "Undo", () => {
    S.tasks.push(t);
    save();
    render();
  });
}
function commitDraft(d) {
  const t = { ...d };
  delete t.flags;
  delete t.uncertain;
  delete t.__edit;
  delete t.manualDur;
  S.tasks.push(t);
  learn("lead", t.rem && t.rem.prep ? t.rem.prep : null);
  learn("dur:" + t.cat, t.dur);
  if (t.time) learn("time:" + t.cat, tmin(t.time));
  save();
  render();
}

/* ───────────── notifications & reminder engine ───────────── */
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)(),
      o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.15, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.6);
    o.start();
    o.stop(a.currentTime + 0.6);
    navigator.vibrate && navigator.vibrate([120, 60, 120]);
  } catch (e) {}
}
function sysNotify(title, body) {
  try {
    if (
      S.prefs.notif &&
      "Notification" in window &&
      Notification.permission === "granted"
    )
      new Notification(title, { body, tag: "songa", icon: undefined });
  } catch (e) {}
}
function tick() {
  const now = Date.now();
  let changed = false;
  S.tasks.forEach((t) =>
    remindersFor(t).forEach((r) => {
      if (S.fired[r.key]) return;
      if (r.at.getTime() <= now) {
        S.fired[r.key] = 1;
        changed = true;
        if (now - r.at.getTime() > 45 * 6e4) return;
        if (r.kind === "check" && t.status !== "todo") return;
        if (r.kind === "start" && t.status === "done") return;
        ui.queue.push(r);
      }
    }),
  );
  const nd = new Date(),
    td = ymd(nd);
  S.routines.forEach((rt) => {
    if (!rt.on || !rt.time || !rt.days.includes(nd.getDay())) return;
    const key = `routine|${rt.id}|${td}`,
      at = toDT(td, rt.time);
    if (!S.fired[key] && at <= nd) {
      S.fired[key] = 1;
      changed = true;
      if (nd - at < 45 * 6e4)
        ui.queue.push({
          kind: "routine",
          routineId: rt.id,
          text: `${rt.name} is starting.`,
          at,
        });
    }
  });
  const ks = Object.keys(S.fired);
  if (ks.length > 600)
    ks.slice(0, ks.length - 400).forEach((k) => delete S.fired[k]);
  if (changed) save();
  if (ui.queue.length && !sheetStack.length && !ui.focus && S.onboarded)
    showReminder(ui.queue.shift());
  if (nd.getSeconds() < 5) renderNowLine();
}
function renderNowLine() {
  if (ui.tab === "today" && !sheetStack.length) {
    const sc = window.scrollY;
    render();
    window.scrollTo(0, sc);
  }
}

/* ───────────── toast ───────────── */
function toast(msg, actLabel, fn) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML =
    `<span>${esc(msg)}</span>` +
    (actLabel ? `<button>${esc(actLabel)}</button>` : "");
  if (actLabel)
    el.querySelector("button").onclick = () => {
      fn();
      el.remove();
    };
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), actLabel ? 6500 : 3200);
}

/* ───────────── sheet system ───────────── */
function openSheet(fn, opts = {}) {
  const bd = document.createElement("div");
  bd.className = "bd";
  bd.setAttribute("role", "presentation");
  const sh = document.createElement("div");
  sh.className = "sheet" + (opts.center ? " center" : "");
  sh.setAttribute("role", "dialog");
  sh.setAttribute("aria-modal", "true");
  bd.appendChild(sh);
  $("#layer").appendChild(bd);
  const rec_ = { bd, sh, fn, onClose: opts.onClose };
  sheetStack.push(rec_);
  fillSheet(rec_);
  bd.addEventListener("mousedown", (e) => {
    if (e.target === bd && !opts.sticky) closeSheet();
  });
  const f = sh.querySelector("textarea,input.in");
  if (f && !opts.noFocus) setTimeout(() => f.focus(), 120);
  return rec_;
}
function fillSheet(r) {
  const sc = r.sh.scrollTop;
  r.sh.innerHTML = '<div class="grab"></div>' + r.fn();
  r.sh.scrollTop = sc;
}
function refreshSheet() {
  const r = sheetStack[sheetStack.length - 1];
  if (r) fillSheet(r);
}
function closeSheet() {
  const r = sheetStack.pop();
  if (!r) return;
  r.bd.remove();
  if (rec && !sheetStack.length) {
    try {
      rec.stop();
    } catch (e) {}
  }
  if (r.onClose) r.onClose();
  if (!sheetStack.length) {
    ctx = null;
    ctxHook = null;
    setTimeout(tick, 300);
  }
}
function askConfirm(title, msg, yes, fn, danger) {
  openSheet(
    () =>
      `<h2>${esc(title)}</h2><p class="muted mt8">${esc(msg)}</p><div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn ${danger ? "danger" : "primary"}" data-a="confirmYes">${esc(yes)}</button></div>`,
    { center: true, noFocus: true },
  );
  A.confirmYes = () => {
    closeSheet();
    fn();
  };
}

/* ───────────── event delegation ───────────── */
const A = {};
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el || /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
  const f = A[el.dataset.a];
  if (f) f(el, e);
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (!el.dataset) return;
  if (el.dataset.a && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
    A[el.dataset.a] && A[el.dataset.a](el, e);
    return;
  }
  if (el.dataset.bind && ctx) {
    bindSet(el);
    if (ctxHook) ctxHook(el.dataset.bind);
    if (el.dataset.rr !== undefined) refreshSheet();
  }
});
document.addEventListener("input", (e) => {
  const el = e.target;
  if (!el.dataset || !el.dataset.bind || !ctx) return;
  if (
    el.type === "checkbox" ||
    el.tagName === "SELECT" ||
    el.type === "date" ||
    el.type === "time"
  )
    return;
  bindSet(el);
  const k = el.dataset.bind;
  if (k === "title")
    document
      .querySelectorAll(".pv-t")
      .forEach((n) => (n.textContent = ctx.title || "Untitled"));
  if (k === "location")
    document
      .querySelectorAll(".pv-l")
      .forEach(
        (n) => (n.textContent = ctx.location ? " · 📍 " + ctx.location : ""),
      );
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (ui.focus) return;
    closeSheet();
  }
});
function bindSet(el) {
  let v = el.type === "checkbox" ? el.checked : el.value;
  if (el.dataset.num !== undefined) v = v === "" ? null : +v;
  if (el.dataset.empty !== undefined && v === "") v = null;
  setPath(ctx, el.dataset.bind, v);
}

/* ───────────── views ───────────── */
const $view = () => $("#view");
function render() {
  document.documentElement.dataset.theme = S.theme;
  document.querySelectorAll(".tabbar [data-t]").forEach((b) => {
    b.classList.toggle("on", b.dataset.t === ui.tab);
    b.setAttribute("aria-current", b.dataset.t === ui.tab ? "page" : "false");
  });
  $view().innerHTML = {
    today: viewToday,
    calendar: viewCalendar,
    study: viewStudy,
    me: viewMe,
  }[ui.tab]();
}
A.tab = (el) => {
  ui.tab = el.dataset.t;
  if (ui.tab === "today") ui.day = todayStr();
  render();
  window.scrollTo(0, 0);
};

function itemHTML(it) {
  const nowD = new Date(),
    td = todayStr();
  if (it.k === "class") {
    const c = it.c,
      col = CATS.study.c;
    return `<div class="it cls" style="--c:${col}"><div class="t">${fmtTime(c.start).replace(" ", "<small>") + "</small>"}</div><button class="b" data-a="classInfo" data-id="${c.id}"><span class="em">🎓</span><div class="grow"><div class="ti">${esc(c.course)}</div><div class="tiny muted">${fmtTime(c.start)}–${fmtTime(c.end)}${c.room ? " · 📍 " + esc(c.room) : ""}</div></div></button></div>`;
  }
  if (it.k === "routine") {
    const r = it.r,
      done = S.routineDone[ui.day + r.id];
    return `<div class="it ${done ? "done" : ""}" style="--c:#14B2C4"><div class="t">${fmtTime(r.time).replace(" ", "<small>") + "</small>"}</div><button class="b" data-a="runRoutine" data-id="${r.id}"><span class="em">${r.e}</span><div class="grow"><div class="ti">${esc(r.name)}</div><div class="tiny muted">Routine · ${r.steps.length} steps</div></div><span class="chk ${done ? "on" : ""}">${done ? "✓" : ""}</span></button></div>`;
  }
  if (it.k === "cp") {
    const c = it.c,
      t = it.t;
    return `<div class="it ${c.done ? "done" : ""}" style="--c:${CATS[t.cat].c}"><div class="t">Check-<small>point</small></div><button class="b" data-a="toggleCp" data-id="${t.id}" data-cp="${c.id}"><span class="em">🚩</span><div class="grow"><div class="ti">${esc(c.label)}</div><div class="tiny muted">${esc(t.title)} · due ${relDay(t.due.date)}</div></div><span class="chk ${c.done ? "on" : ""}">${c.done ? "✓" : ""}</span></button></div>`;
  }
  if (it.k === "due") {
    const t = it.t;
    return `<div class="it due" style="--c:#C93A3A"><div class="t">${it.time ? fmtTime(it.time).replace(" ", "<small>") + "</small>" : "DUE"}</div><button class="b" data-a="openTask" data-id="${t.id}"><span class="em">⏰</span><div class="grow"><div class="ti">Due: ${esc(t.title)}</div><div class="tiny" style="color:var(--bad)">Real deadline</div></div></button></div>`;
  }
  const t = it.t,
    c = CATS[t.cat],
    miss = isMissed(t),
    done = t.status === "done";
  const sd = t.steps.filter((s) => s.done).length,
    nowOn =
      t.time &&
      t.date === td &&
      !done &&
      toDT(t.date, t.time) <= nowD &&
      taskEnd(t) > nowD;
  const tl = t.time
    ? fmtTime(t.time).replace(" ", "<small>") + "</small>"
    : "Any<small>time</small>";
  return `<div class="it ${done ? "done" : ""} ${miss ? "missed" : ""} ${nowOn ? "now" : ""}" style="--c:${c.c}"><div class="t">${tl}</div>
  <div class="b" role="button" tabindex="0" data-a="openTask" data-id="${t.id}"><span class="em">${c.e}</span>
  <div class="grow"><div class="ti">${esc(t.title)}</div><div class="tiny muted">${t.time ? durLbl(t.dur) : ""}${t.location ? " · 📍 " + esc(t.location) : ""}${t.steps.length ? ` · ${sd}/${t.steps.length} steps` : ""}</div>
  <div class="row gap8 wrap" style="margin-top:4px">${t.due ? `<span class="pill ${isPastDue(t) ? "bad" : "warn"}">Due ${relDay(t.due.date)}${t.due.time ? " " + fmtTime(t.due.time) : ""}</span>` : ""}${t.urgency === "high" ? '<span class="pill bad">Urgent</span>' : ""}${miss && !done ? '<span class="pill warn">Slipped</span>' : ""}${t.status === "started" ? '<span class="pill brand">Started</span>' : ""}</div></div>
  <button class="chk ${done ? "on" : ""}" data-a="toggleDone" data-id="${t.id}" aria-label="${done ? "Mark not done" : "Mark done"}">${done ? "✓" : ""}</button></div></div>`;
}
A.toggleDone = (el, e) => {
  e.stopPropagation();
  const t = S.tasks.find((x) => x.id === el.dataset.id);
  setDone(t, t.status !== "done");
};
A.toggleCp = (el) => {
  const t = S.tasks.find((x) => x.id === el.dataset.id),
    c = t.checkpoints.find((x) => x.id === el.dataset.cp);
  c.done = !c.done;
  save();
  render();
};
document.addEventListener("keydown", (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches &&
    e.target.matches(".b[role=button]")
  ) {
    e.preventDefault();
    e.target.click();
  }
});

function viewToday() {
  const td = todayStr(),
    day = ui.day,
    isToday = day === td,
    nowD = new Date();
  const items = itemsFor(day),
    tasks = items.filter((i) => i.k === "task"),
    done = tasks.filter((i) => i.t.status === "done").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const h = nowD.getHours(),
    greet =
      h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const mon = addDays(pd(td), -dowMon(pd(td)));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(mon, i),
      s = ymd(d);
    return `<button class="wd ${s === day ? "on" : ""} ${s === td ? "today" : ""}" data-a="pickDay" data-d="${s}"><span>${d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3)}</span><b>${d.getDate()}</b>${itemsFor(s).some((x) => x.k === "task" || x.k === "due") ? "<i></i>" : ""}</button>`;
  }).join("");
  let h_ = `<div class="hello"><div><h1 class="page-title">${isToday ? greet + (S.name ? ", " + esc(S.name.split(" ")[0]) : "") : relDay(day)}</h1><p class="sub">${fmtDate(day, { weekday: "long", day: "numeric", month: "long" })}</p></div><div class="ring" style="--p:${pct}" role="img" aria-label="${done} of ${tasks.length} tasks done"><span>${done}/${tasks.length}</span></div></div><div class="week" role="group" aria-label="Pick a day">${week}</div>`;
  if (isToday)
    h_ += checkinCard() + recoveryBanner() + nextCard(items) + leaveCard(items);
  h_ += `<section class="sec"><div class="sec-h"><h2>${isToday ? "Today’s plan" : "Plan"}</h2><button class="link" data-a="openCapture">＋ Add</button></div>`;
  if (!items.length)
    h_ += `<div class="card empty"><div class="big">🌤️</div><p class="strong">Nothing planned</p><p class="small">Say or type a thought — SONGA turns it into a plan you can trust.</p><button class="btn primary mt16" data-a="openCapture">Capture something</button></div>`;
  else {
    let any = items.filter((i) => !i.time),
      timed = items.filter((i) => i.time),
      nowShown = !isToday;
    h_ += `<div class="tl">${any.map(itemHTML).join("")}`;
    timed.forEach((i) => {
      if (
        !nowShown &&
        tmin(i.time) > nowD.getHours() * 60 + nowD.getMinutes()
      ) {
        h_ += `<div class="now-line">NOW ${fmtTime(minT(nowD.getHours() * 60 + nowD.getMinutes()))}</div>`;
        nowShown = true;
      }
      h_ += itemHTML(i);
    });
    if (!nowShown)
      h_ += `<div class="now-line">NOW ${fmtTime(minT(nowD.getHours() * 60 + nowD.getMinutes()))}</div>`;
    h_ += "</div>";
  }
  h_ += "</section>";
  h_ += `<section class="sec"><div class="sec-h"><h2>Routines</h2><button class="link" data-a="editRoutine" data-id="">＋ New</button></div><div class="row gap8" style="overflow:auto;padding-bottom:4px">${S.routines.map((r) => `<div class="card" style="min-width:178px;padding:14px"><div style="font-size:1.4rem">${r.e}</div><div class="strong">${esc(r.name)}</div><div class="tiny muted">${r.steps.length} steps · ${durLbl(r.steps.reduce((a, s) => a + s.min, 0))}</div><div class="row gap8 mt8"><button class="btn sm primary" data-a="runRoutine" data-id="${r.id}">Start</button><button class="btn sm ghost" data-a="editRoutine" data-id="${r.id}">Edit</button></div></div>`).join("")}</div></section>`;
  if (isToday) h_ += reviewCard(tasks);
  h_ += `<p class="tiny muted" style="text-align:center;margin-top:26px">SONGA is a planning aid, not a medical device. It doesn’t diagnose or treat anything.</p>`;
  return h_;
}
A.pickDay = (el) => {
  ui.day = el.dataset.d;
  render();
};

function checkinCard() {
  const td = todayStr(),
    c = S.checkins[td];
  if (c)
    return c.energy === "low"
      ? `<div class="note info" style="margin-top:12px"><b>Low energy today?</b> You can lighten the plan — nothing is lost. <button class="link" data-a="openLow">Lighten today</button></div>`
      : "";
  return `<div class="card" style="margin-top:12px"><div class="row between"><b>Quick check-in</b><span class="pill">optional</span></div><p class="small muted">How are you feeling? It only shapes today’s suggestions.</p><div class="moods mt8">${["😣", "😕", "😐", "🙂", "😄"].map((m, i) => `<button class="mood" data-a="mood" data-v="${i + 1}" aria-label="Mood ${i + 1} of 5">${m}</button>`).join("")}</div><div class="chips mt8">${[
    ["low", "🪫 Low energy"],
    ["ok", "🔋 Okay"],
    ["high", "⚡ Good energy"],
  ]
    .map(
      ([k, l]) =>
        `<button class="chip" data-a="energy" data-v="${k}">${l}</button>`,
    )
    .join("")}</div></div>`;
}
A.mood = (el) => {
  ui.pm = +el.dataset.v;
  document
    .querySelectorAll(".mood")
    .forEach((b) => b.classList.toggle("on", b === el));
};
A.energy = (el) => {
  const td = todayStr();
  S.checkins[td] = { mood: ui.pm || 3, energy: el.dataset.v };
  save();
  render();
  if (el.dataset.v === "low") openLow();
  else toast("Thanks — check-in saved.");
};

function recoveryBanner() {
  const m = S.tasks.filter(isMissed);
  if (!m.length) return "";
  return `<div class="note" style="margin-top:12px"><b>${m.length} ${m.length === 1 ? "thing" : "things"} slipped — that’s okay.</b> Plans change. Reset gently: real deadlines stay protected and nothing is lost.<div class="mt8"><button class="btn sm primary" data-a="openReset">Reset my plan</button></div></div>`;
}
function nextCard(items) {
  const nowD = new Date(),
    cand = items.filter(
      (i) => i.k === "task" && i.t.status !== "done" && !isMissed(i.t),
    );
  const cur = cand.find(
    (i) => i.t.time && toDT(i.t.date, i.t.time) <= nowD && taskEnd(i.t) > nowD,
  );
  const nxt =
    cur ||
    cand.find((i) => i.t.time && toDT(i.t.date, i.t.time) > nowD) ||
    cand.find((i) => !i.t.time);
  if (!nxt) return "";
  const t = nxt.t,
    step = t.steps.find((s) => !s.done);
  let lbl = "Up next";
  if (cur) lbl = "Happening now";
  else if (t.time) {
    const mins = Math.round((toDT(t.date, t.time) - nowD) / 6e4);
    lbl = `Up next · in ${durLbl(Math.max(1, mins))}`;
  }
  const gap =
    !cur && t.time ? Math.round((toDT(t.date, t.time) - nowD) / 6e4) : null;
  return `<div class="next" style="margin-top:14px"><div class="lbl">${lbl}</div><h2>${CATS[t.cat].e} ${esc(t.title)}</h2><div class="small" style="opacity:.9">${t.time ? fmtTime(t.time) + " · " + durLbl(t.dur) : "Anytime today"}${t.location ? " · 📍 " + esc(t.location) : ""}</div>
  ${step ? `<div class="step"><b>Your first small step:</b> ${esc(step.t)} <span style="opacity:.75">(${step.min} min)</span></div>` : ""}
  ${gap !== null && gap > 0 && gap <= 20 ? `<div class="small mt8" style="opacity:.9">Transition: ${gap} min to wrap up what you’re doing and get ready.</div>` : ""}
  <div class="row gap8 wrap mt16"><button class="btn white sm" data-a="startFocus" data-id="${t.id}" data-m="5">▶ Start 5 min</button><button class="btn sm" data-a="toggleDone" data-id="${t.id}">✓ Done</button><button class="btn sm" data-a="openTask" data-id="${t.id}">Details</button></div></div>`;
}
function leaveCard(items) {
  const nowD = new Date(),
    nm = nowD.getHours() * 60 + nowD.getMinutes();
  const c = items
    .filter(
      (i) =>
        (i.k === "task" && i.t.location && i.t.time && i.t.status !== "done") ||
        i.k === "class",
    )
    .map((i) => ({
      title: i.t ? i.t.title : i.c.course,
      loc: i.t ? i.t.location : i.c.room,
      at: tmin(i.t ? i.t.time : i.c.start),
      cat: i.t ? i.t.cat : "study",
    }))
    .filter((x) => x.loc && x.at - nm <= 120 && x.at - nm >= -5)[0];
  if (!c) return "";
  const bring = [
    ...S.leave,
    ...(c.cat === "study"
      ? ["Notes / laptop"]
      : c.cat === "health"
        ? ["Appointment details"]
        : []),
  ];
  return `<div class="card" style="margin-top:14px"><div class="row between"><b>Before you leave</b><span class="pill brand">${Math.max(0, c.at - nm)} min</span></div><p class="small muted">Heading to ${esc(c.loc)} for ${esc(c.title)}. What do you need with you?</p><div class="chips mt8">${bring.map((b) => `<button class="chip ${ui.leaveChecked[b] ? "on" : ""}" data-a="leaveTick" data-k="${esc(b)}">${ui.leaveChecked[b] ? "✓ " : ""}${esc(b)}</button>`).join("")}</div></div>`;
}
A.leaveTick = (el) => {
  ui.leaveChecked[el.dataset.k] = !ui.leaveChecked[el.dataset.k];
  render();
};
function reviewCard(tasks) {
  const h = new Date().getHours();
  if (h < 17 || !tasks.length) return "";
  const done = tasks.filter((i) => i.t.status === "done").length,
    left = tasks.length - done;
  const tmr = itemsFor(ymd(addDays(new Date(), 1))).filter(
    (i) => i.k === "task" || i.k === "due",
  );
  return `<section class="sec"><div class="card"><b>Daily review</b><p class="small muted mt8">${done ? `You finished ${done} ${done === 1 ? "task" : "tasks"} today.` : "Today was a lot — that’s fine."} ${left ? `${left} ${left === 1 ? "is" : "are"} still open; we can move ${left === 1 ? "it" : "them"} without any fuss.` : "Everything planned is done."}</p>${
    tmr.length
      ? `<p class="small mt8"><b>Tomorrow:</b> ${tmr
          .slice(0, 3)
          .map((i) => esc(i.t.title))
          .join(" · ")}${tmr.length > 3 ? ` +${tmr.length - 3} more` : ""}</p>`
      : ""
  }${left ? `<div class="mt8"><button class="btn sm primary" data-a="openReset">Reset the open ones</button></div>` : ""}</div></section>`;
}

/* calendar view */
function viewCalendar() {
  const m = ui.month,
    first = new Date(m.getFullYear(), m.getMonth(), 1),
    start = addDays(first, -dowMon(first)),
    td = todayStr();
  let cells = "";
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i),
      s = ymd(d),
      its = itemsFor(s).filter(
        (x) => x.k !== "class" && x.k !== "routine" && x.k !== "cp",
      );
    const dots = its
      .slice(0, 3)
      .map(
        (x) =>
          `<i class="${x.k === "due" ? "due" : ""}" style="--c:${x.t ? CATS[x.t.cat].c : "#5046E5"}"></i>`,
      )
      .join("");
    cells += `<button class="cd ${d.getMonth() !== m.getMonth() ? "out" : ""} ${s === td ? "today" : ""} ${s === ui.day ? "on" : ""}" data-a="calPick" data-d="${s}" aria-label="${fmtDate(s, { weekday: "long", day: "numeric", month: "long" })}">${d.getDate()}<span class="dots">${dots}</span></button>`;
  }
  const items = itemsFor(ui.day);
  return `<div class="row between" style="padding:8px 0"><h1 class="page-title">${m.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h1><div class="row gap8"><button class="icon-btn" data-a="calNav" data-n="-1" aria-label="Previous month">‹</button><button class="icon-btn" data-a="calNav" data-n="1" aria-label="Next month">›</button></div></div>
  <div class="cal"><div class="h">Mon</div><div class="h">Tue</div><div class="h">Wed</div><div class="h">Thu</div><div class="h">Fri</div><div class="h">Sat</div><div class="h">Sun</div>${cells}</div>
  <div class="row gap8 tiny muted mt8"><span class="pill ok">● events</span><span class="pill bad">▪ deadlines</span><button class="link" style="margin-left:auto" data-a="calToday">Jump to today</button></div>
  <section class="sec"><div class="sec-h"><h2>${relDay(ui.day)} · ${fmtDate(ui.day, { day: "numeric", month: "short" })}</h2><button class="link" data-a="openCapture">＋ Add</button></div>${items.length ? `<div class="tl">${items.map(itemHTML).join("")}</div>` : '<div class="card empty small">Nothing here yet.</div>'}</section>`;
}
A.calNav = (el) => {
  ui.month = new Date(
    ui.month.getFullYear(),
    ui.month.getMonth() + +el.dataset.n,
    1,
  );
  render();
};
A.calPick = (el) => {
  ui.day = el.dataset.d;
  render();
};
A.calToday = () => {
  ui.day = todayStr();
  ui.month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  render();
};

/* study view */
function viewStudy() {
  const dn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const as = S.tasks
    .filter(
      (t) =>
        t.due &&
        t.cat === "study" &&
        t.status !== "done" &&
        t.status !== "dropped",
    )
    .sort((a, b) => (a.due.date < b.due.date ? -1 : 1));
  return `<div style="padding:8px 0"><h1 class="page-title">Study</h1><p class="sub">Timetable, assignments and revision — built around real deadlines.</p></div>
  <section class="sec"><div class="sec-h"><h2>Timetable</h2><button class="link" data-a="editClass" data-id="">＋ Add class</button></div>
  ${
    S.classes.length
      ? `<div class="card list">${S.classes
          .map(
            (c) =>
              `<button class="li" style="width:100%;text-align:left" data-a="editClass" data-id="${c.id}"><span class="em" style="font-size:1.3rem">🎓</span><div class="grow"><div class="strong">${esc(c.course)}</div><div class="tiny muted">${c.dow
                .slice()
                .sort()
                .map((d) => dn[d])
                .join(
                  ", ",
                )} · ${fmtTime(c.start)}–${fmtTime(c.end)}${c.room ? " · " + esc(c.room) : ""}</div></div><span class="muted">›</span></button>`,
          )
          .join("")}</div>`
      : '<div class="card empty small">Add your lectures once — they appear on Today and Calendar every week.</div>'
  }</section>
  <section class="sec"><div class="sec-h"><h2>Assignments</h2><button class="link" data-a="newAssignment">＋ New</button></div>
  ${
    as.length
      ? as
          .map((t) => {
            const left = dayDiff(todayStr(), t.due.date),
              cp = t.checkpoints || [],
              dn_ = cp.filter((c) => c.done).length,
              st = t.steps.filter((s) => s.done).length,
              tot = cp.length + t.steps.length,
              p = tot ? Math.round(((dn_ + st) / tot) * 100) : 0;
            return `<button class="card" style="width:100%;text-align:left;display:block" data-a="openTask" data-id="${t.id}"><div class="row between"><b>${esc(t.title)}</b><span class="pill ${left < 0 ? "bad" : left <= 2 ? "warn" : ""}">${left < 0 ? "overdue" : left === 0 ? "due today" : left + " d left"}</span></div><div class="tiny muted mt8">Due ${fmtDate(t.due.date)}${t.planStart && t.planStart > todayStr() ? " · start " + relDay(t.planStart) : ""} · ${cp.length ? cp.map((c) => (c.done ? "✓ " : "") + c.label).join(" → ") : "no milestones"}</div><div class="bar mt8"><i style="width:${p}%"></i></div></button>`;
          })
          .join("")
      : '<div class="card empty small">No open assignments. Add one and SONGA will plan backwards from the deadline.</div>'
  }</section>
  <section class="sec"><div class="sec-h"><h2>Exam revision</h2></div><div class="card"><p class="small muted">Give SONGA an exam date and number of topics. It spreads short revision blocks across the days available — and leaves the last day light.</p><button class="btn primary mt16" data-a="newExam">Plan revision</button></div></section>`;
}

/* me view */
function viewMe() {
  const P = S.prefs,
    items = Object.entries(P.items);
  return `<div style="padding:8px 0"><h1 class="page-title">Me</h1><p class="sub">You’re in control of everything SONGA does.</p></div>
  <div class="card stack"><div><label class="f" for="nm">Your name</label><input class="in" id="nm" value="${esc(S.name)}" data-a="setName" placeholder="Optional"></div>
  <div><label class="f">I mostly use SONGA as a</label><div class="chips">${[
    ["student", "🎓 University student"],
    ["adult", "💼 Working adult"],
  ]
    .map(
      ([k, l]) =>
        `<button class="chip ${S.role === k ? "on" : ""}" data-a="setRole" data-v="${k}">${l}</button>`,
    )
    .join("")}</div></div></div>
  <section class="sec"><div class="sec-h"><h2>Reminders</h2></div><div class="card stack">
    <div class="row between"><div><b>Notifications</b><div class="tiny muted">${"Notification" in window ? "Status: " + (P.notif && Notification.permission === "granted" ? "on" : Notification.permission === "denied" ? "blocked in browser" : "off") : "Not supported here — in-app prompts still work"}</div></div><button class="btn sm" data-a="enableNotif">Enable</button></div>
    <div class="grid2"><div><label class="f" for="pp">Prep reminder</label><select class="in" id="pp" data-a="setPrep">${[
      [0, "None"],
      [15, "15 min before"],
      [30, "30 min before"],
      [60, "1 hour before"],
      [120, "2 hours before"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${P.prep === v ? "selected" : ""}>${l}</option>`,
      )
      .join("")}</select></div>
    <div><label class="f" for="ps">Start reminder</label><select class="in" id="ps" data-a="setStart">${[
      [0, "At start time"],
      [5, "5 min before"],
      [-1, "None"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${(P.startOffset ?? -1) === v || (P.startOffset == null && v === -1) ? "selected" : ""}>${l}</option>`,
      )
      .join("")}</select></div></div>
    <div class="row between"><div><b>“Did you start?” check</b><div class="tiny muted">10 minutes after a task begins, SONGA asks — and offers a smaller step.</div></div><label class="sw"><input type="checkbox" data-a="setFollow" ${P.followUp ? "checked" : ""} aria-label="Follow-up check"><span></span></label></div></div></section>
  <section class="sec"><div class="sec-h"><h2>Learning from you</h2></div><div class="card stack">
    <div class="row between"><div><b>Learn my preferences</b><div class="tiny muted">Optional. Notes things like reminder timing and how long tasks usually take — stored only on this device. Never changes commitments silently.</div></div><label class="sw"><input type="checkbox" data-a="setLearn" ${P.learn ? "checked" : ""} aria-label="Learn preferences"><span></span></label></div>
    ${items.length ? `<div class="list">${items.map(([k, it]) => `<div class="li"><div class="grow"><div class="strong small">${esc(prefLabel(k, it.value))}</div><div class="tiny muted">Why: ${esc(prefWhy(k, it))}</div></div><label class="sw" style="transform:scale(.8)"><input type="checkbox" data-a="prefOn" data-k="${k}" ${it.on ? "checked" : ""} aria-label="Use this preference"><span></span></label><button class="btn sm ghost" data-a="prefEdit" data-k="${k}">Edit</button><button class="btn sm danger" data-a="prefDel" data-k="${k}" aria-label="Delete">✕</button></div>`).join("")}</div><button class="btn sm danger" data-a="prefClear">Delete everything learned</button>` : `<p class="small muted">Nothing learned yet. After a few tasks you’ll see patterns here — each one explained, editable and deletable.</p>`}</div></section>
  <section class="sec"><div class="sec-h"><h2>“Before I leave” list</h2></div><div class="card"><textarea class="in" style="min-height:90px;font-size:.95rem" data-a="setLeave" aria-label="Before I leave list">${esc(S.leave.join("\n"))}</textarea><p class="tiny muted mt8">One item per line.</p></div></section>
  <section class="sec"><div class="sec-h"><h2>Appearance</h2></div><div class="chips">${[
    ["auto", "Auto"],
    ["light", "Light"],
    ["dark", "Dark"],
  ]
    .map(
      ([k, l]) =>
        `<button class="chip ${S.theme === k ? "on" : ""}" data-a="setTheme" data-v="${k}">${l}</button>`,
    )
    .join("")}</div></section>
  <section class="sec"><div class="sec-h"><h2>Your data</h2></div><div class="card stack"><p class="small muted">Everything lives in this browser. Nothing is sent anywhere. Export or erase it any time.</p><div class="row gap8 wrap"><button class="btn sm" data-a="exportData">Export (JSON)</button><button class="btn sm" data-a="loadDemo">Load sample data</button><button class="btn sm danger" data-a="wipe">Delete all my data</button></div></div></section>
  <section class="sec"><div class="note info small"><b>Please note:</b> SONGA is a non-clinical organisation aid. It does not diagnose, treat, track medication or give medical advice. If you’re struggling, talk to a qualified professional.</div></section>
  <p class="tiny muted" style="text-align:center;margin-top:20px">SONGA 1.0 · Making everyday life easier, one step at a time.</p>`;
}
A.setName = (el) => {
  S.name = el.value.trim();
  save();
};
A.setRole = (el) => {
  S.role = el.dataset.v;
  save();
  render();
};
A.setTheme = (el) => {
  S.theme = el.dataset.v;
  save();
  render();
};
A.setPrep = (el) => {
  S.prefs.prep = +el.value;
  save();
};
A.setStart = (el) => {
  S.prefs.startOffset = +el.value < 0 ? null : +el.value;
  save();
};
A.setFollow = (el) => {
  S.prefs.followUp = el.checked;
  save();
};
A.setLearn = (el) => {
  S.prefs.learn = el.checked;
  save();
  toast(
    el.checked
      ? "Learning is on. You can pause it any time."
      : "Learning paused. Existing preferences are kept.",
  );
};
A.setLeave = (el) => {
  S.leave = el.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  save();
};
A.prefOn = (el) => {
  S.prefs.items[el.dataset.k].on = el.checked;
  save();
};
A.prefDel = (el) => {
  delete S.prefs.items[el.dataset.k];
  delete S.stats[el.dataset.k];
  save();
  render();
  toast("Preference deleted.");
};
A.prefClear = () =>
  askConfirm(
    "Delete everything learned?",
    "SONGA will forget all learned preferences and the samples behind them.",
    "Delete",
    () => {
      S.prefs.items = {};
      S.stats = {};
      save();
      render();
    },
    true,
  );
A.prefEdit = (el) => {
  const k = el.dataset.k,
    it = S.prefs.items[k],
    isT = k.startsWith("time:");
  openSheet(
    () =>
      `<h2>Edit preference</h2><p class="muted small mt8">${esc(prefLabel(k, it.value))}</p><div class="mt16"><label class="f" for="pv">${isT ? "Time" : k === "lead" ? "Minutes before" : "Minutes"}</label>${isT ? `<input class="in" id="pv" type="time" value="${minT(it.value)}">` : `<input class="in" id="pv" type="number" min="0" step="5" value="${it.value}">`}</div><div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn primary" data-a="prefSave" data-k="${k}">Save</button></div>`,
  );
};
A.prefSave = (el) => {
  const k = el.dataset.k,
    v = $("#pv").value;
  if (!v) return;
  S.prefs.items[k].value = k.startsWith("time:") ? tmin(v) : Math.max(0, +v);
  S.prefs.items[k].manual = true;
  save();
  closeSheet();
  render();
  toast("Saved. SONGA won’t overwrite this.");
};
A.enableNotif = async () => {
  if (!("Notification" in window))
    return toast("Notifications aren’t supported in this browser.");
  const p = await Notification.requestPermission();
  S.prefs.notif = p === "granted";
  save();
  render();
  toast(
    p === "granted"
      ? "Notifications on while SONGA is open."
      : "Notifications not allowed.",
  );
};
A.exportData = () => {
  const b = new Blob([JSON.stringify(S, null, 2)], {
      type: "application/json",
    }),
    a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "songa-data.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
A.wipe = () =>
  askConfirm(
    "Delete all your data?",
    "Tasks, classes, routines and learned preferences will be erased from this device. This can’t be undone.",
    "Delete everything",
    () => {
      localStorage.removeItem(KEY);
      S = defaults();
      ui.day = todayStr();
      render();
      startOnboarding();
    },
    true,
  );
A.loadDemo = () => {
  loadDemo();
  toast("Sample day loaded.");
  render();
};
A.closeSheet = () => closeSheet();

/* ───────────── capture & confirm ───────────── */
const EXAMPLES = [
  "Submit statistics assignment by Friday 5pm",
  "Buy groceries tomorrow evening",
  "Dentist appointment next Tuesday at 10:30 at the clinic",
  "Revise biology chapter 5 tonight for 1 hour",
];
function openCapture(prefill = "", defaultDate = null) {
  ctx = {
    text: prefill,
    defaultDate:
      defaultDate ||
      (ui.tab === "calendar" || ui.day !== todayStr() ? ui.day : null),
  };
  openSheet(
    () => `<h2>What’s on your mind?</h2><p class="sub mt8">Say it or type it — messy is fine. You’ll confirm before anything is saved.</p>
  <textarea class="in mt16" id="cap" data-bind="text" placeholder="e.g. “Submit stats assignment by Friday 5pm”" aria-label="Your thought">${esc(ctx.text)}</textarea>
  <div class="row mt16" style="justify-content:center;flex-direction:column;gap:6px"><button class="mic" id="mic" data-a="mic" aria-label="Start voice input">🎙️</button><span class="tiny muted" id="micst">Tap to speak</span></div>
  <div class="chips mt16">${EXAMPLES.map((x) => `<button class="chip" data-a="useExample" data-x="${esc(x)}">${esc(x)}</button>`).join("")}</div>
  <div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn primary" data-a="analyse">Review details →</button></div>`,
  );
}
A.openCapture = () => openCapture();
A.useExample = (el) => {
  const ta = $("#cap");
  ta.value = el.dataset.x;
  ctx.text = ta.value;
  ta.focus();
};
A.mic = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition,
    st = $("#micst"),
    mic = $("#mic");
  if (!SR) {
    st.textContent =
      "Voice input isn’t supported in this browser — try Chrome or Edge, or just type.";
    return;
  }
  if (rec) {
    rec.stop();
    return;
  }
  const ta = $("#cap"),
    base = ta.value;
  rec = new SR();
  rec.lang = navigator.language || "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  rec.onstart = () => {
    mic.classList.add("live");
    mic.textContent = "■";
    st.textContent = "Listening… tap to stop";
  };
  rec.onresult = (e) => {
    let x = "";
    for (const r of e.results) x += r[0].transcript;
    ta.value = (base ? base + " " : "") + x;
    ctx && (ctx.text = ta.value);
  };
  rec.onerror = (e) => {
    st.textContent =
      e.error === "not-allowed"
        ? "Microphone permission was blocked. You can still type."
        : e.error === "no-speech"
          ? "I didn’t hear anything — try again."
          : "Voice input had a problem. You can edit or type instead.";
  };
  rec.onend = () => {
    rec = null;
    const m = $("#mic");
    if (m) {
      m.classList.remove("live");
      m.textContent = "🎙️";
    }
    const s = $("#micst");
    if (s && s.textContent.startsWith("Listening"))
      s.textContent = "Check the text — speech can be wrong. Edit freely.";
  };
  try {
    rec.start();
  } catch (e) {
    rec = null;
  }
};
A.analyse = () => {
  const text = ($("#cap").value || "").trim();
  if (!text) {
    toast("Type or say something first.");
    return;
  }
  const dd = ctx.defaultDate;
  if (rec)
    try {
      rec.stop();
    } catch (e) {}
  closeSheet();
  const p = parseCapture(text);
  const d = draftFromParsed(p, dd);
  openConfirm(d);
};
function openConfirm(d) {
  ctx = d;
  ctxHook = (key) => {
    if (key === "date") ctx.manualDate = true;
    if (/^due|^effort$/.test(key)) {
      applyPlan(ctx);
      refreshSheet();
    }
  };
  openSheet(confirmHTML, { sticky: true, noFocus: true });
}
function confirmHTML() {
  const d = ctx,
    c = CATS[d.cat],
    conf = findConflicts(d),
    U = d.uncertain || {};
  const sug = !d.time && !d.due && getPref("time:" + d.cat);
  const plan = d.due
    ? `<div class="note info mt8"><b>Work-back plan.</b> Due ${fmtDate(d.due.date)}${d.due.time ? " " + fmtTime(d.due.time) : ""}. ${d.planStart && d.planStart !== d.due.date ? `Start by <b>${relDay(d.planStart)}</b>${(d.checkpoints || []).length ? ", with checkpoints: " + d.checkpoints.map((x) => `${esc(x.label)} (${fmtDate(x.date, { weekday: "short", day: "numeric" })})`).join(" → ") : ""}.` : "This is a single sitting — do it on the due date or earlier."}${dayDiff(todayStr(), d.due.date) <= 0 ? " It’s due today, so start now." : ""}</div>`
    : "";
  const sel = (key, opts, cur) =>
    `<select class="in" data-bind="${key}" data-num data-empty ${key.startsWith("rem") ? "" : "data-rr"}>${opts.map(([v, l]) => `<option value="${v ?? ""}" ${(cur ?? "") === (v ?? "") ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  return `<h2>Check the details</h2><p class="tiny muted mt8">I understood: “${esc(d.orig)}”</p>
  <div class="pv" style="--c:${c.c}"><span class="em">${c.e}</span><div class="grow"><div class="strong pv-t">${esc(d.title)}</div><div class="small muted">${d.time ? fmtTime(d.time) + " · " + durLbl(d.dur) : "Anytime"} · ${relDay(d.date)}<span class="pv-l">${d.location ? " · 📍 " + esc(d.location) : ""}</span></div></div></div>
  ${(d.flags || []).map((f) => `<div class="note">⚠️ ${esc(f)}</div>`).join("")}${conf.length ? `<div class="note">⚠️ This overlaps with “${esc(conf[0])}”. Pick another time, or keep it.</div>` : ""}
  <div class="stack mt16">
  <div><label class="f" for="f-title">What</label><input class="in" id="f-title" data-bind="title" value="${esc(d.title)}"></div>
  <div class="grid2"><div><label class="f" for="f-date">${d.due ? "Start working on" : "Date"}</label><input class="in ${U.date ? "unsure" : ""}" id="f-date" type="date" data-bind="date" data-rr value="${d.date}"></div>
  <div><label class="f" for="f-time">Time</label><input class="in ${U.time ? "unsure" : ""}" id="f-time" type="time" data-bind="time" data-empty data-rr value="${d.time || ""}"></div></div>
  ${sug ? `<button class="chip" data-a="useTime" data-v="${minT(sug)}">💡 You usually do ${d.cat} tasks around ${fmtTime(minT(sug))} — use it?</button>` : ""}
  <div class="row between"><div><b>It has a real deadline</b><div class="tiny muted">Separates “due” from “time to start”.</div></div><label class="sw"><input type="checkbox" data-a="toggleDue" ${d.due ? "checked" : ""} aria-label="Has deadline"><span></span></label></div>
  ${
    d.due
      ? `<div class="grid2"><div><label class="f" for="f-dd">Due date</label><input class="in" id="f-dd" type="date" data-bind="due.date" data-rr value="${d.due.date}"></div><div><label class="f" for="f-dt">Due time</label><input class="in" id="f-dt" type="time" data-bind="due.time" data-empty value="${d.due.time || ""}"></div></div>
  <div><label class="f">Effort needed</label>${sel(
    "effort",
    [
      [30, "30 min"],
      [60, "1 hour"],
      [120, "2 hours"],
      [240, "4 hours"],
      [360, "6 hours"],
      [600, "10 hours"],
    ],
    d.effort,
  )}</div>${plan}`
      : ""
  }
  <div><label class="f">How long</label><div class="chips">${[15, 30, 45, 60, 90, 120].map((m) => `<button class="chip ${d.dur === m ? "on" : ""}" data-a="setCtx" data-k="dur" data-v="${m}">${durLbl(m)}</button>`).join("")}</div></div>
  <div><label class="f">Priority</label><div class="chips">${[
    ["low", "Low"],
    ["normal", "Normal"],
    ["high", "Urgent"],
  ]
    .map(
      ([k, l]) =>
        `<button class="chip ${d.urgency === k ? "on" : ""}" data-a="setCtx" data-k="urgency" data-v="${k}">${l}</button>`,
    )
    .join("")}</div></div>
  <div><label class="f">Category</label><div class="chips">${Object.entries(
    CATS,
  )
    .map(
      ([k, v]) =>
        `<button class="chip ${d.cat === k ? "on" : ""}" data-a="setCtx" data-k="cat" data-v="${k}">${v.e} ${v.n}</button>`,
    )
    .join("")}</div></div>
  <div><label class="f" for="f-loc">Where (optional)</label><input class="in" id="f-loc" data-bind="location" value="${esc(d.location)}" placeholder="e.g. Library"></div>
  <div><label class="f">Reminders (up to two)</label><div class="grid2">${sel(
    "rem.prep",
    [
      [null, "No prep reminder"],
      [15, "Prep 15 min before"],
      [30, "Prep 30 min before"],
      [60, "Prep 1 hour before"],
      [120, "Prep 2 hours before"],
    ],
    d.rem.prep,
  )}${sel(
    "rem.start",
    [
      [0, "Start: at the time"],
      [5, "Start: 5 min before"],
      [null, "No start reminder"],
    ],
    d.rem.start,
  )}</div></div>
  <div><label class="f">Small steps (first one is your start)</label>${d.steps.map((s) => `<div class="tiny" style="padding:3px 0">• ${esc(s.t)} <span class="muted">· ${s.min} min</span></div>`).join("")}</div></div>
  <div class="foot"><button class="btn ghost" data-a="closeSheet">Discard</button><button class="btn primary" data-a="saveDraft">Save to calendar</button></div>`;
}
A.setCtx = (el) => {
  const k = el.dataset.k;
  let v = el.dataset.v;
  if (k === "dur") {
    v = +v;
    ctx.manualDur = true;
  }
  setPath(ctx, k, v);
  if (k === "cat") {
    ctx.steps = stepsFor(ctx);
    if (!ctx.manualDur) ctx.dur = durationDefault(v);
  }
  if (k === "dur" && !ctx.due) ctx.effort = ctx.dur;
  refreshSheet();
};
A.useTime = (el) => {
  ctx.time = el.dataset.v;
  if (!ctx.rem.prep) ctx.rem.prep = defaultPrep();
  refreshSheet();
};
A.toggleDue = (el) => {
  if (el.checked) {
    ctx.due = { date: ctx.date, time: ctx.time };
    ctx.time = null;
    ctx.effort = Math.max(
      ctx.dur,
      ASSIGN_RX.test(ctx.orig + " " + ctx.title) ? 240 : ctx.dur,
    );
    ctx.manualDate = false;
    applyPlan(ctx);
  } else {
    ctx.due = null;
    ctx.checkpoints = [];
    ctx.planStart = null;
    ctx.effort = ctx.dur;
  }
  refreshSheet();
};
A.saveDraft = () => {
  const d = ctx;
  if (!d.title.trim()) {
    toast("Give it a name first.");
    return;
  }
  if (d.due) applyPlan(d);
  if (d.__edit) {
    const i = S.tasks.findIndex((x) => x.id === d.__edit);
    if (i >= 0) S.tasks.splice(i, 1);
  }
  commitDraft(d);
  closeSheet();
  ui.day = d.date;
  if (ui.tab === "calendar")
    ui.month = new Date(pd(d.date).getFullYear(), pd(d.date).getMonth(), 1);
  render();
  toast(
    `Saved — ${relDay(d.date)}${d.time ? " at " + fmtTime(d.time) : ""}${d.due ? " · due " + relDay(d.due.date) : ""}`,
  );
};

/* ───────────── task detail ───────────── */
A.openTask = (el, e) => {
  const t = S.tasks.find((x) => x.id === el.dataset.id);
  if (t) openTask(t);
};
function openTask(t) {
  openSheet(() => {
    const c = CATS[t.cat],
      miss = isMissed(t),
      sd = t.steps.filter((s) => s.done).length;
    const rems = remindersFor(t).filter(
      (r) => r.kind !== "check" && r.kind !== "checkpoint",
    );
    return `<div class="row" style="align-items:flex-start"><span style="font-size:1.8rem">${c.e}</span><div class="grow"><h2>${esc(t.title)}</h2><p class="small muted">${relDay(t.date)}${t.time ? " · " + fmtTime(t.time) + " · " + durLbl(t.dur) : " · Anytime"}${t.location ? " · 📍 " + esc(t.location) : ""}</p></div></div>
    <div class="row gap8 wrap mt8">${t.due ? `<span class="pill ${isPastDue(t) ? "bad" : "warn"}">Due ${fmtDate(t.due.date)}${t.due.time ? " " + fmtTime(t.due.time) : ""}</span>` : ""}${t.urgency === "high" ? '<span class="pill bad">Urgent</span>' : ""}${miss ? '<span class="pill warn">Slipped</span>' : ""}<span class="pill">${t.status === "done" ? "Done" : t.status === "started" ? "Started" : "Not started"}</span></div>
    ${t.due && t.checkpoints.length ? `<div class="card mt16"><b class="small">Milestones</b>${t.checkpoints.map((k) => `<div class="stepl ${k.done ? "done" : ""}"><button class="chk ${k.done ? "on" : ""}" data-a="tCp" data-id="${t.id}" data-cp="${k.id}" aria-label="Toggle milestone">${k.done ? "✓" : ""}</button><span class="tx grow">${esc(k.label)}<span class="tiny muted"> · ${fmtDate(k.date)}</span></span></div>`).join("")}</div>` : ""}
    <div class="card mt16"><div class="row between"><b class="small">Small steps</b><span class="tiny muted">${sd}/${t.steps.length}</span></div><div class="bar mt8"><i style="width:${t.steps.length ? (sd / t.steps.length) * 100 : 0}%"></i></div>${t.steps.map((s) => `<div class="stepl ${s.done ? "done" : ""}"><button class="chk ${s.done ? "on" : ""}" data-a="tStep" data-id="${t.id}" data-s="${s.id}" aria-label="Toggle step">${s.done ? "✓" : ""}</button><span class="tx grow">${esc(s.t)}</span><span class="tiny muted">${s.min}m</span></div>`).join("")}<button class="link mt8" data-a="rebreak" data-id="${t.id}">↻ Break it down differently</button></div>
    ${rems.length ? `<p class="tiny muted mt8">🔔 ${rems.map((r) => `${r.kind === "prep" ? "Prep" : r.kind === "start" ? "Start" : r.kind === "due" ? "Due" : "Reminder"}: ${fmtDate(ymd(r.at), { weekday: "short", day: "numeric" })} ${fmtTime(minT(r.at.getHours() * 60 + r.at.getMinutes()))}`).join(" · ")}</p>` : ""}
    ${t.location ? `<div class="note info mt8"><b>Before you leave:</b> ${S.leave.map(esc).join(", ")}</div>` : ""}
    <div class="grid2 mt16"><button class="btn primary" data-a="startFocus" data-id="${t.id}" data-m="${Math.min(25, Math.max(5, (t.steps.find((s) => !s.done) || { min: 10 }).min))}">▶ Start focus</button><button class="btn ok" data-a="tDone" data-id="${t.id}">${t.status === "done" ? "Undo done" : "✓ Done"}</button>
    <button class="btn" data-a="tNotStarted" data-id="${t.id}">Not started yet</button><button class="btn" data-a="tResched" data-id="${t.id}">Reschedule</button></div>
    <div class="row gap8 mt16"><button class="btn sm ghost" data-a="tEdit" data-id="${t.id}">Edit</button><button class="btn sm danger" data-a="tDelete" data-id="${t.id}">Delete</button></div>`;
  });
}
const tk = (el) => S.tasks.find((x) => x.id === el.dataset.id);
A.tCp = (el) => {
  const t = tk(el),
    c = t.checkpoints.find((x) => x.id === el.dataset.cp);
  c.done = !c.done;
  save();
  render();
  refreshSheet();
};
A.tStep = (el) => {
  const t = tk(el),
    s = t.steps.find((x) => x.id === el.dataset.s);
  s.done = !s.done;
  if (s.done && t.status === "todo") t.status = "started";
  save();
  render();
  refreshSheet();
  if (t.steps.every((x) => x.done) && t.status !== "done")
    toast("All steps done — mark the task complete?", "Mark done", () => {
      setDone(t, true);
      closeSheet();
    });
};
A.rebreak = (el) => {
  const t = tk(el);
  const alt =
    t.steps.length > 3
      ? [
          ["Do only the first 5 minutes", 5],
          ["Take a 2-minute break", 2],
          ["Do the next 10 minutes", 10],
          ["Wrap up and note what’s left", 5],
        ]
      : [
          ["Open what you need — nothing else", 2],
          ["Do the smallest visible piece", 5],
          ["Keep going for 10 more minutes", 10],
        ];
  t.steps = alt.map(([x, m]) => ({ id: uid(), t: x, min: m, done: false }));
  save();
  refreshSheet();
  toast("Here’s a gentler breakdown.");
};
A.tDone = (el) => {
  const t = tk(el);
  setDone(t, t.status !== "done");
  closeSheet();
};
A.tDelete = (el) => {
  const t = tk(el);
  closeSheet();
  deleteTask(t);
};
A.tEdit = (el) => {
  const t = tk(el);
  closeSheet();
  const copy = JSON.parse(JSON.stringify(t));
  copy.flags = [];
  copy.uncertain = {};
  copy.manualDate = true;
  openConfirm(copy);
  ctx.__edit = t.id;
};
A.tNotStarted = (el) => {
  const t = tk(el);
  closeSheet();
  notStartedSheet(t);
};
function notStartedSheet(t) {
  openSheet(
    () =>
      `<h2>That’s okay.</h2><p class="muted mt8">Starting is the hard part. What would help for “${esc(t.title)}”?</p><div class="stack mt16"><button class="btn primary block" data-a="startFocus" data-id="${t.id}" data-m="2">Just 2 minutes</button><button class="btn block" data-a="snooze" data-id="${t.id}" data-m="15">Remind me in 15 min</button><button class="btn block" data-a="snooze" data-id="${t.id}" data-m="60">Remind me in an hour</button><button class="btn block" data-a="tResched" data-id="${t.id}">Move it to another time</button></div>`,
  );
}
A.snooze = (el) => {
  const t = tk(el);
  t.snoozeUntil = Date.now() + +el.dataset.m * 6e4;
  t.status = "todo";
  save();
  closeSheet();
  toast(`I’ll remind you in ${durLbl(+el.dataset.m)}.`);
};
A.tResched = (el) => {
  const t = tk(el);
  closeSheet();
  openResched(t);
};
function openResched(t) {
  const now = new Date(),
    later = findSlot(t.dur || 30, new Date(now.getTime() + 30 * 6e4)),
    tmr = findSlot(
      t.dur || 30,
      (() => {
        const d = addDays(now, 1);
        d.setHours(
          t.time ? +t.time.slice(0, 2) : 9,
          t.time ? +t.time.slice(3) : 0,
          0,
          0,
        );
        return d;
      })(),
    ),
    two = findSlot(t.dur || 30, addDays(tmr, 1));
  const opts = [
    ["Later (next free slot)", later],
    ["Tomorrow", tmr],
    ["In a few days", two],
  ];
  ctx = { t, date: ymd(tmr), time: t.time || "" };
  openSheet(
    () => `<h2>Move it — no pressure</h2><p class="muted small mt8">“${esc(t.title)}”${t.due ? ` has a real deadline on <b>${fmtDate(t.due.date)}</b>.` : ""}</p><div class="stack mt16">${opts.map(([l, d], i) => `<button class="btn block" style="justify-content:space-between" data-a="reschedPick" data-i="${i}"><span>${l}</span><span class="muted">${relDay(ymd(d))} ${fmtTime(minT(d.getHours() * 60 + d.getMinutes()))}</span></button>`).join("")}
  <div class="grid2"><div><label class="f" for="rd">Pick a date</label><input id="rd" class="in" type="date" data-bind="date" value="${ctx.date}"></div><div><label class="f" for="rt">Time</label><input id="rt" class="in" type="time" data-bind="time" data-empty value="${ctx.time || ""}"></div></div></div><div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn primary" data-a="reschedApply">Move it</button></div>`,
    { noFocus: true },
  );
  ctx.opts = opts;
}
function applyResched(t, date, time) {
  const go = () => {
    moveTask(t, date, time);
    if (t.due && !t.manualDate) {
    }
    save();
    closeSheet();
    render();
    toast(`Moved to ${relDay(date)}${time ? " at " + fmtTime(time) : ""}.`);
  };
  if (t.due && dayDiff(date, t.due.date) < 0) {
    closeSheet();
    askConfirm(
      "That’s after the deadline",
      `“${t.title}” is due ${fmtDate(t.due.date)}. Moving the work past it would miss a real deadline.`,
      "Move anyway",
      () => {
        moveTask(t, date, time);
        save();
        render();
      },
    );
    return;
  }
  go();
}
A.reschedPick = (el) => {
  const d = ctx.opts[+el.dataset.i][1];
  applyResched(ctx.t, ymd(d), `${pad(d.getHours())}:${pad(d.getMinutes())}`);
};
A.reschedApply = () => {
  if (!ctx.date) return;
  applyResched(ctx.t, ctx.date, ctx.time || null);
};

/* ───────────── plan recovery & low-energy ───────────── */
function buildPlan(mode) {
  const now = new Date(),
    td = todayStr();
  let cand =
    mode === "low"
      ? S.tasks.filter(
          (t) => t.status !== "done" && t.status !== "dropped" && t.date === td,
        )
      : S.tasks.filter(isMissed);
  const prot = cand.filter(isProtected),
    rest = cand.filter((t) => !isProtected(t));
  const extra = {},
    perDay = {},
    plan = [];
  const place = (t, from, protectFlag) => {
    const pastDue = isPastDue(t);
    if (mode === "low" && protectFlag)
      return plan.push({
        t,
        keep: true,
        inc: false,
        date: t.date,
        time: t.time,
        protectFlag,
      });
    if (pastDue)
      return plan.push({
        t,
        pastDue: true,
        inc: false,
        date: td,
        time: t.time,
        newDue: ymd(addDays(now, 1)),
        protectFlag,
      });
    let date,
      time = null;
    if (t.time) {
      const s = findSlot(t.dur || 30, from, extra);
      date = ymd(s);
      time = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
      (extra[date] = extra[date] || []).push([
        tmin(time),
        tmin(time) + (t.dur || 30),
      ]);
    } else {
      let d = new Date(Math.max(from, now));
      d.setHours(0, 0, 0, 0);
      while ((perDay[ymd(d)] || 0) >= (protectFlag ? 5 : 2)) d = addDays(d, 1);
      date = ymd(d);
    }
    perDay[date] = (perDay[date] || 0) + 1;
    if (t.due && dayDiff(date, t.due.date) < 0) date = t.due.date;
    plan.push({ t, inc: true, date, time, protectFlag });
  };
  const startAt =
    mode === "low"
      ? (() => {
          const d = addDays(now, 1);
          d.setHours(9, 0, 0, 0);
          return d;
        })()
      : new Date(now.getTime() + 20 * 6e4);
  prot.forEach((t) =>
    place(
      t,
      mode === "low" ? startAt : new Date(now.getTime() + 20 * 6e4),
      true,
    ),
  );
  const restFrom =
    mode === "low"
      ? startAt
      : now.getHours() >= 17
        ? (() => {
            const d = addDays(now, 1);
            d.setHours(9, 0, 0, 0);
            return d;
          })()
        : new Date(now.getTime() + 60 * 6e4);
  rest.forEach((t) => place(t, restFrom, false));
  return plan;
}
function openResetSheet(mode) {
  const plan = buildPlan(mode);
  if (!plan.length) {
    toast(
      mode === "low"
        ? "Nothing to lighten — today is clear."
        : "Nothing has slipped. Nice.",
    );
    return;
  }
  ctx = { plan, mode };
  openSheet(
    () => `<h2>${mode === "low" ? "Lighten today" : "A fresh start"}</h2><p class="sub mt8">${mode === "low" ? "Low-energy days happen. We’ll keep what truly can’t wait and gently move the rest." : "Plans change. Nothing here is lost — real deadlines are kept first, the rest moves to sensible free slots."}</p>
  <div class="stack mt16">${ctx.plan
    .map(
      (
        p,
        i,
      ) => `<div class="card" style="padding:14px"><div class="row"><label class="sw" style="transform:scale(.85)"><input type="checkbox" data-bind="plan.${i}.inc" ${p.inc ? "checked" : ""} ${p.keep ? "disabled" : ""} aria-label="Include"><span></span></label><div class="grow"><div class="strong">${esc(p.t.title)}</div><div class="tiny muted">${p.keep ? "Keeping today" : `was ${relDay(p.t.date)}${p.t.time ? " " + fmtTime(p.t.time) : ""}`}</div></div>${p.protectFlag ? '<span class="pill bad">Deadline protected</span>' : ""}</div>
  ${p.keep ? '<p class="tiny muted mt8">Kept as is — this one is urgent or due very soon.</p>' : p.pastDue ? `<div class="note mt8">The deadline (${fmtDate(p.t.due.date)}) has passed. Pick a new due date to bring it back, or leave it out.<div class="grid2 mt8"><input class="in" type="date" data-bind="plan.${i}.newDue" value="${p.newDue}" aria-label="New due date"><input class="in" type="date" data-bind="plan.${i}.date" value="${p.date}" aria-label="Work date"></div></div>` : `<div class="grid2 mt8"><input class="in" type="date" data-bind="plan.${i}.date" value="${p.date}" aria-label="New date"><input class="in" type="time" data-bind="plan.${i}.time" data-empty value="${p.time || ""}" aria-label="New time"></div>`}</div>`,
    )
    .join("")}</div>
  <div class="foot"><button class="btn ghost" data-a="closeSheet">Not now</button><button class="btn primary" data-a="applyReset">Apply plan</button></div>`,
    { noFocus: true },
  );
}
A.openReset = () => openResetSheet("reset");
function openLow() {
  openResetSheet("low");
}
A.openLow = openLow;
A.applyReset = () => {
  let n = 0;
  ctx.plan.forEach((p) => {
    if (!p.inc) return;
    if (p.pastDue && p.newDue) p.t.due.date = p.newDue;
    moveTask(p.t, p.date, p.time);
    p.t.manualDate = true;
    if (p.pastDue) applyPlanKeepDate(p.t);
    n++;
  });
  save();
  closeSheet();
  render();
  toast(
    n
      ? `Plan reset — ${n} ${n === 1 ? "task" : "tasks"} moved. Deadlines protected.`
      : "No changes made.",
  );
};
function applyPlanKeepDate(t) {
  const d = t.date;
  applyPlan(t);
  t.date = d;
}

/* ───────────── reminders UI (follow-through loop) ───────────── */
function showReminder(r) {
  beep();
  sysNotify("SONGA", r.text);
  if (r.kind === "routine") {
    openSheet(
      () =>
        `<h2>${esc(r.text)}</h2><div class="foot"><button class="btn ghost" data-a="closeSheet">Later</button><button class="btn primary" data-a="runRoutine" data-id="${r.routineId}">Start routine</button></div>`,
      { center: true, noFocus: true },
    );
    return;
  }
  const t = S.tasks.find((x) => x.id === r.taskId);
  if (!t) return;
  const step = t.steps.find((s) => !s.done);
  const head =
    {
      prep: "Get ready",
      start: "Time to start",
      check: "Quick check-in",
      due: "Deadline",
      checkpoint: "Checkpoint",
      snooze: "Reminder",
    }[r.kind] || "Reminder";
  openSheet(
    () => `<span class="pill brand">${head}</span><h2 class="mt8">${CATS[t.cat].e} ${esc(t.title)}</h2><p class="muted mt8">${esc(r.text)}</p>
  ${r.kind === "prep" && t.location ? `<div class="note info mt16"><b>Before you leave for ${esc(t.location)}:</b> ${S.leave.map(esc).join(", ")}</div>` : ""}
  ${step && r.kind !== "prep" ? `<div class="card mt16"><div class="tiny muted">Your next small step</div><div class="strong">${esc(step.t)}</div><div class="tiny muted">about ${step.min} min</div></div>` : ""}
  <div class="stack mt16">${r.kind === "prep" ? `<button class="btn primary block" data-a="closeSheet">On it</button>` : `<button class="btn primary block" data-a="startFocus" data-id="${t.id}" data-m="${Math.min(10, Math.max(2, step ? step.min : 5))}">▶ Start now</button>`}
  <div class="grid2"><button class="btn" data-a="tDone" data-id="${t.id}">✓ Done</button><button class="btn" data-a="tNotStarted" data-id="${t.id}">Not started</button></div><button class="btn ghost block" data-a="tResched" data-id="${t.id}">Reschedule</button></div>`,
    { noFocus: true },
  );
}

/* ───────────── focus timer ───────────── */
A.startFocus = (el) => {
  const t = tk(el),
    m = +el.dataset.m || 10;
  while (sheetStack.length) closeSheet();
  if (t.status === "todo") {
    t.status = "started";
    save();
  }
  const total = m * 60;
  ui.focus = {
    id: t.id,
    total,
    remaining: total,
    running: true,
    endAt: Date.now() + total * 1000,
    elapsed: 0,
    last: Date.now(),
    brk: false,
  };
  drawFocus();
  ui.focus.timer = setInterval(focusTick, 250);
};
function drawFocus() {
  let f = $("#focus");
  if (!f) {
    f = document.createElement("div");
    f.id = "focus";
    f.setAttribute("role", "dialog");
    f.setAttribute("aria-modal", "true");
    document.body.appendChild(f);
  }
  const F = ui.focus,
    t = S.tasks.find((x) => x.id === F.id),
    c = CATS[t.cat],
    R = 112,
    C = 2 * Math.PI * R;
  f.innerHTML = `<div><div class="row between"><span class="pill brand">${F.brk ? "Break" : "Focus"}</span><button class="btn sm ghost" data-a="endFocus">Close ✕</button></div>
  <h2 style="text-align:center;margin-top:10px">${c.e} ${esc(t.title)}</h2>
  <div class="disc"><svg viewBox="0 0 250 250"><circle cx="125" cy="125" r="${R}" fill="none" stroke="var(--surface2)" stroke-width="22"/><circle id="fr" cx="125" cy="125" r="${R}" fill="none" stroke="${F.brk ? "var(--ok)" : c.c}" stroke-width="22" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><div class="tm"><b id="ft">00:00</b><span class="tiny muted">${F.brk ? "rest your eyes" : "one thing at a time"}</span></div></div>
  <div class="row gap8" style="justify-content:center"><button class="btn" data-a="fPause" id="fp">⏸ Pause</button><button class="btn" data-a="fPlus">+5 min</button><button class="btn ok" data-a="fFinish">✓ Finish</button></div>
  ${F.brk ? "" : `<div class="card mt16"><b class="small">Steps</b>${t.steps.map((s) => `<div class="stepl ${s.done ? "done" : ""}"><button class="chk ${s.done ? "on" : ""}" data-a="fStep" data-s="${s.id}" aria-label="Toggle step">${s.done ? "✓" : ""}</button><span class="tx grow">${esc(s.t)}</span></div>`).join("")}</div>`}</div>`;
  const ring = $("#fr");
  ring.dataset.c = C;
  focusTick(true);
}
function focusTick() {
  const F = ui.focus;
  if (!F) return;
  const now = Date.now();
  if (F.running) {
    F.remaining = Math.max(0, Math.round((F.endAt - now) / 1000));
    F.elapsed += (now - F.last) / 1000;
  }
  F.last = now;
  const m = Math.floor(F.remaining / 60),
    s = F.remaining % 60,
    ft = $("#ft"),
    fr = $("#fr");
  if (ft) ft.textContent = `${pad(m)}:${pad(s)}`;
  if (fr)
    fr.style.strokeDashoffset = +fr.dataset.c * (1 - F.remaining / F.total);
  document.title = F.running ? `${pad(m)}:${pad(s)} · SONGA` : "SONGA";
  if (F.running && F.remaining <= 0) {
    F.running = false;
    beep();
    focusDone();
  }
}
function logFocus() {
  const F = ui.focus;
  if (F && !F.brk && F.elapsed > 20) {
    const td = todayStr();
    S.focusMin[td] = (S.focusMin[td] || 0) + Math.round(F.elapsed / 60);
    save();
  }
}
function closeFocus() {
  const F = ui.focus;
  if (!F) return;
  clearInterval(F.timer);
  logFocus();
  ui.focus = null;
  const f = $("#focus");
  if (f) f.remove();
  document.title = "SONGA — Making everyday life easier, one step at a time";
  render();
}
function focusDone() {
  const F = ui.focus,
    t = S.tasks.find((x) => x.id === F.id);
  logFocus();
  F.elapsed = 0;
  const f = $("#focus .disc");
  if (!f) return;
  if (F.brk) {
    openFocusEnd("Break over", "Ready for another round?", [
      ["▶ 10 more minutes", "fAgain", 10],
      ["I’m done for now", "endFocus"],
    ]);
    return;
  }
  openFocusEnd(
    "Time’s up — well done",
    `You gave “${t.title}” your attention. What now?`,
    [
      ["✓ Task is done", "fFinish"],
      ["▶ 10 more minutes", "fAgain", 10],
      ["☕ 5-minute break", "fBreak"],
      ["Stop for now", "endFocus"],
    ],
  );
}
function openFocusEnd(h, p, btns) {
  const f = $("#focus > div");
  const box = document.createElement("div");
  box.className = "card mt16";
  box.innerHTML = `<h2>${h}</h2><p class="muted small mt8">${p}</p><div class="stack mt16">${btns.map(([l, a, m], i) => `<button class="btn ${i === 0 ? "primary" : ""} block" data-a="${a}" data-m="${m || ""}">${l}</button>`).join("")}</div>`;
  f.appendChild(box);
  box.scrollIntoView({ behavior: "smooth" });
}
A.endFocus = () => closeFocus();
A.fPause = (el) => {
  const F = ui.focus;
  if (F.running) {
    F.running = false;
    el.textContent = "▶ Resume";
  } else {
    F.running = true;
    F.endAt = Date.now() + F.remaining * 1000;
    F.last = Date.now();
    el.textContent = "⏸ Pause";
  }
};
A.fPlus = () => {
  const F = ui.focus;
  F.total += 300;
  F.remaining += 300;
  F.endAt = (F.running ? F.endAt : Date.now()) + 300000;
  if (!F.running && F.remaining > 0) {
    F.running = true;
    F.last = Date.now();
  }
  drawFocus();
};
A.fAgain = (el) => {
  const F = ui.focus,
    m = +el.dataset.m || 10;
  F.brk = false;
  F.total = m * 60;
  F.remaining = F.total;
  F.endAt = Date.now() + F.total * 1000;
  F.running = true;
  F.last = Date.now();
  drawFocus();
};
A.fBreak = () => {
  const F = ui.focus;
  F.brk = true;
  F.total = 300;
  F.remaining = 300;
  F.endAt = Date.now() + 300000;
  F.running = true;
  F.last = Date.now();
  drawFocus();
};
A.fStep = (el) => {
  const t = S.tasks.find((x) => x.id === ui.focus.id),
    s = t.steps.find((x) => x.id === el.dataset.s);
  s.done = !s.done;
  save();
  drawFocus();
  if (t.steps.every((x) => x.done))
    toast("Every step is done. Tap Finish when ready.");
};
A.fFinish = () => {
  const t = S.tasks.find((x) => x.id === ui.focus.id);
  closeFocus();
  setDone(t, true);
};

/* ───────────── routines ───────────── */
A.runRoutine = (el) => {
  const r = S.routines.find((x) => x.id === el.dataset.id);
  while (sheetStack.length) closeSheet();
  ctx = { r, done: {} };
  openSheet(
    () => {
      const dn = r.steps.filter((s) => ctx.done[s.id]).length;
      return `<div class="row"><span style="font-size:2rem">${r.e}</span><div class="grow"><h2>${esc(r.name)}</h2><p class="small muted">${dn}/${r.steps.length} done · ${durLbl(r.steps.reduce((a, s) => a + s.min, 0))}</p></div></div><div class="bar mt8"><i style="width:${(dn / r.steps.length) * 100}%"></i></div><div class="card mt16">${r.steps.map((s) => `<div class="stepl ${ctx.done[s.id] ? "done" : ""}"><button class="chk ${ctx.done[s.id] ? "on" : ""}" data-a="rStep" data-s="${s.id}" aria-label="Toggle step">${ctx.done[s.id] ? "✓" : ""}</button><span class="tx grow">${esc(s.t)}</span><span class="tiny muted">${s.min}m</span></div>`).join("")}</div><div class="foot"><button class="btn ghost" data-a="closeSheet">Close</button><button class="btn primary" data-a="rAdd">Add to today</button></div>`;
    },
    { noFocus: true },
  );
};
A.rStep = (el) => {
  ctx.done[el.dataset.s] = !ctx.done[el.dataset.s];
  refreshSheet();
  if (ctx.r.steps.every((s) => ctx.done[s.id])) {
    S.routineDone[todayStr() + ctx.r.id] = true;
    save();
    celebrate();
    toast("Routine complete.");
    render();
  }
};
A.rAdd = () => {
  const r = ctx.r,
    d = {
      id: uid(),
      title: r.name,
      date: todayStr(),
      time: null,
      due: null,
      dur: r.steps.reduce((a, s) => a + s.min, 0),
      effort: 0,
      urgency: "normal",
      location: "",
      cat: "general",
      rem: { prep: null, start: S.prefs.startOffset },
      steps: r.steps.map((s) => ({
        id: uid(),
        t: s.t,
        min: s.min,
        done: false,
      })),
      checkpoints: [],
      status: "todo",
      created: Date.now(),
      orig: r.name,
    };
  S.tasks.push(d);
  save();
  closeSheet();
  render();
  toast("Added to today.");
};
A.editRoutine = (el) => {
  const r = el.dataset.id
    ? S.routines.find((x) => x.id === el.dataset.id)
    : null;
  ctx = {
    id: r && r.id,
    name: r ? r.name : "",
    e: r ? r.e : "✨",
    time: r ? r.time : "",
    days: r ? r.days.slice() : [1, 2, 3, 4, 5],
    on: r ? r.on : true,
    text: r
      ? r.steps.map((s) => `${s.t} · ${s.min}`).join("\n")
      : "First step · 5\nSecond step · 10",
  };
  openSheet(
    () => `<h2>${r ? "Edit routine" : "New routine"}</h2><div class="stack mt16"><div class="grid2"><div><label class="f" for="rn">Name</label><input class="in" id="rn" data-bind="name" value="${esc(ctx.name)}"></div><div><label class="f" for="re">Emoji</label><input class="in" id="re" data-bind="e" value="${esc(ctx.e)}" maxlength="2"></div></div>
  <div><label class="f" for="rs">Steps — one per line, “step · minutes”</label><textarea class="in" id="rs" style="min-height:130px;font-size:.95rem" data-bind="text">${esc(ctx.text)}</textarea></div>
  <div class="grid2"><div><label class="f" for="rtm">Auto-start time (optional)</label><input class="in" id="rtm" type="time" data-bind="time" data-empty value="${ctx.time || ""}"></div><div><label class="f">Show on days</label><div class="chips">${["S", "M", "T", "W", "T", "F", "S"].map((l, i) => `<button class="chip ${ctx.days.includes(i) ? "on" : ""}" data-a="rDay" data-i="${i}" aria-label="Day ${i}">${l}</button>`).join("")}</div></div></div></div>
  <div class="foot">${r ? '<button class="btn danger" data-a="rDelete">Delete</button>' : ""}<button class="btn primary" data-a="rSave">Save</button></div>`,
  );
};
A.rDay = (el) => {
  const i = +el.dataset.i;
  ctx.days = ctx.days.includes(i)
    ? ctx.days.filter((x) => x !== i)
    : [...ctx.days, i];
  refreshSheet();
};
A.rSave = () => {
  const steps = ctx.text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [a, b] = l.split(/\s*[·|]\s*/);
      return { id: uid(), t: a, min: Math.max(1, parseInt(b) || 5) };
    });
  if (!ctx.name.trim() || !steps.length) {
    toast("Add a name and at least one step.");
    return;
  }
  const o = {
    id: ctx.id || uid(),
    name: ctx.name.trim(),
    e: ctx.e || "✨",
    time: ctx.time || "",
    days: ctx.days,
    on: !!ctx.time,
    steps,
  };
  const i = S.routines.findIndex((x) => x.id === o.id);
  if (i >= 0) S.routines[i] = o;
  else S.routines.push(o);
  save();
  closeSheet();
  render();
};
A.rDelete = () =>
  askConfirm(
    "Delete this routine?",
    "It will be removed from Today.",
    "Delete",
    () => {
      S.routines = S.routines.filter((x) => x.id !== ctx.id);
      save();
      closeSheet();
      render();
    },
    true,
  );

/* ───────────── study tools ───────────── */
A.classInfo = (el) => A.editClass(el);
A.editClass = (el) => {
  const c = el.dataset.id
    ? S.classes.find((x) => x.id === el.dataset.id)
    : null;
  ctx = {
    id: c && c.id,
    course: c ? c.course : "",
    dow: c ? c.dow.slice() : [1],
    start: c ? c.start : "10:00",
    end: c ? c.end : "11:00",
    room: c ? c.room : "",
  };
  openSheet(
    () => `<h2>${c ? "Edit class" : "Add a class"}</h2><div class="stack mt16"><div><label class="f" for="cn">Course / module</label><input class="in" id="cn" data-bind="course" value="${esc(ctx.course)}" placeholder="e.g. Biology 101"></div>
  <div><label class="f">Days</label><div class="chips">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((l, i) => `<button class="chip ${ctx.dow.includes(i) ? "on" : ""}" data-a="cDay" data-i="${i}">${l}</button>`).join("")}</div></div>
  <div class="grid2"><div><label class="f" for="cs">Starts</label><input class="in" id="cs" type="time" data-bind="start" value="${ctx.start}"></div><div><label class="f" for="ce">Ends</label><input class="in" id="ce" type="time" data-bind="end" value="${ctx.end}"></div></div>
  <div><label class="f" for="cr">Room / place</label><input class="in" id="cr" data-bind="room" value="${esc(ctx.room)}" placeholder="e.g. Hall B, Room 204"></div></div>
  <div class="foot">${c ? '<button class="btn danger" data-a="cDelete">Delete</button>' : ""}<button class="btn primary" data-a="cSave">Save</button></div>`,
  );
};
A.cDay = (el) => {
  const i = +el.dataset.i;
  ctx.dow = ctx.dow.includes(i)
    ? ctx.dow.filter((x) => x !== i)
    : [...ctx.dow, i];
  refreshSheet();
};
A.cSave = () => {
  if (
    !ctx.course.trim() ||
    !ctx.dow.length ||
    !ctx.start ||
    !ctx.end ||
    ctx.end <= ctx.start
  ) {
    toast("Add a name, at least one day, and an end time after the start.");
    return;
  }
  const o = {
    id: ctx.id || uid(),
    course: ctx.course.trim(),
    dow: ctx.dow,
    start: ctx.start,
    end: ctx.end,
    room: ctx.room.trim(),
  };
  const i = S.classes.findIndex((x) => x.id === o.id);
  if (i >= 0) S.classes[i] = o;
  else S.classes.push(o);
  save();
  closeSheet();
  render();
  toast("Class saved — it repeats every week.");
};
A.cDelete = () => {
  S.classes = S.classes.filter((x) => x.id !== ctx.id);
  save();
  closeSheet();
  render();
};
A.newAssignment = () => {
  ctx = { title: "", date: ymd(addDays(new Date(), 7)), hours: 4 };
  openSheet(
    () =>
      `<h2>New assignment</h2><p class="sub mt8">SONGA plans backwards from the deadline, with a start date and checkpoints.</p><div class="stack mt16"><div><label class="f" for="an">Title</label><input class="in" id="an" data-bind="title" placeholder="e.g. Statistics report"></div><div class="grid2"><div><label class="f" for="ad">Due date</label><input class="in" id="ad" type="date" data-bind="date" value="${ctx.date}"></div><div><label class="f" for="ah">Effort (hours)</label><input class="in" id="ah" type="number" min="1" max="40" data-bind="hours" data-num value="${ctx.hours}"></div></div></div><div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn primary" data-a="asgGo">Plan it →</button></div>`,
  );
};
A.asgGo = () => {
  if (!ctx.title.trim()) {
    toast("Give the assignment a name.");
    return;
  }
  const h = Math.max(1, ctx.hours || 4),
    p = parseCapture(`${ctx.title} due ${ctx.date}`);
  p.cat = "study";
  p.dur = null;
  const d = draftFromParsed(p);
  d.title = ctx.title.trim();
  d.effort = h * 60;
  d.dur = 60;
  d.due = { date: ctx.date, time: null };
  d.rem.prep = null;
  d.flags = [];
  d.uncertain = {};
  applyPlan(d);
  d.steps = stepsFor({ ...d, title: d.title + " assignment" });
  closeSheet();
  openConfirm(d);
};
A.newExam = () => {
  ctx = {
    name: "",
    date: ymd(addDays(new Date(), 14)),
    topics: 8,
    mins: 45,
    time: getPref("time:study") ? minT(getPref("time:study")) : "18:00",
  };
  openSheet(
    () =>
      `<h2>Plan revision</h2><div class="stack mt16"><div><label class="f" for="en">Exam / subject</label><input class="in" id="en" data-bind="name" placeholder="e.g. Biology final"></div><div class="grid2"><div><label class="f" for="ed">Exam date</label><input class="in" id="ed" type="date" data-bind="date" value="${ctx.date}"></div><div><label class="f" for="et">Topics to cover</label><input class="in" id="et" type="number" min="1" max="60" data-bind="topics" data-num value="${ctx.topics}"></div></div><div class="grid2"><div><label class="f" for="em">Minutes per day</label><input class="in" id="em" type="number" min="15" step="15" data-bind="mins" data-num value="${ctx.mins}"></div><div><label class="f" for="eti">Usual time</label><input class="in" id="eti" type="time" data-bind="time" value="${ctx.time}"></div></div></div><div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn primary" data-a="examGo">Preview plan →</button></div>`,
  );
};
function examBlocks(c) {
  const days = dayDiff(todayStr(), c.date) - 1;
  if (days < 1) return [];
  const out = [],
    work = Math.max(1, days - 1),
    per = Math.ceil(c.topics / work);
  let n = 1;
  for (let i = 1; i < days && n <= c.topics; i++) {
    const to = Math.min(c.topics, n + per - 1);
    out.push({
      date: ymd(addDays(new Date(), i)),
      title: `Revise ${c.name}: topic${to > n ? "s " + n + "–" + to : " " + n}`,
      dur: c.mins,
    });
    n = to + 1;
  }
  out.push({
    date: ymd(addDays(new Date(), days)),
    title: `Light review: ${c.name}`,
    dur: Math.min(30, c.mins),
  });
  return out;
}
A.examGo = () => {
  if (!ctx.name.trim()) {
    toast("Add the subject name.");
    return;
  }
  const c = { ...ctx },
    blocks = examBlocks(c);
  if (!blocks.length) {
    toast(
      "The exam is too close for a plan — try capturing a single revision task instead.",
    );
    return;
  }
  closeSheet();
  ctx = { ...c, blocks };
  openSheet(
    () =>
      `<h2>${esc(c.name)} revision plan</h2><p class="sub mt8">${blocks.length} short blocks at ${fmtTime(c.time)}. Exam day: ${fmtDate(c.date)}.</p><div class="card list mt16">${blocks.map((b) => `<div class="li"><div class="grow"><div class="strong small">${esc(b.title)}</div><div class="tiny muted">${fmtDate(b.date)} · ${durLbl(b.dur)}</div></div></div>`).join("")}</div><div class="foot"><button class="btn ghost" data-a="closeSheet">Cancel</button><button class="btn primary" data-a="examSave">Add to calendar</button></div>`,
  );
};
A.examSave = () => {
  const c = ctx;
  c.blocks.forEach((b) =>
    S.tasks.push({
      id: uid(),
      title: b.title,
      date: b.date,
      time: c.time,
      due: null,
      dur: b.dur,
      effort: b.dur,
      urgency: "normal",
      location: "",
      cat: "study",
      rem: { prep: S.prefs.prep || null, start: S.prefs.startOffset },
      steps: stepsFor({ title: "revise", dur: b.dur }),
      checkpoints: [],
      status: "todo",
      created: Date.now(),
      orig: b.title,
    }),
  );
  S.tasks.push({
    id: uid(),
    title: `${c.name} — EXAM`,
    date: c.date,
    time: null,
    due: null,
    dur: 120,
    effort: 120,
    urgency: "high",
    location: "",
    cat: "study",
    rem: { prep: null, start: 0 },
    steps: [
      { id: uid(), t: "Pack ID, pens, water", min: 5, done: false },
      { id: uid(), t: "Arrive 15 minutes early", min: 15, done: false },
    ],
    checkpoints: [],
    status: "todo",
    created: Date.now(),
    orig: "exam",
  });
  save();
  closeSheet();
  render();
  toast("Revision plan added.");
};

/* ───────────── onboarding & demo ───────────── */
function startOnboarding() {
  let step = 0;
  const ob = {
    name: S.name,
    role: S.role,
    learn: false,
    notif: false,
    demo: false,
  };
  const el = document.createElement("div");
  el.className = "ob";
  document.body.appendChild(el);
  const draw = () => {
    const dots = `<div class="dotsn">${[0, 1, 2].map((i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>`;
    const logo = `<svg class="logo" style="width:46px;height:46px;color:var(--brand)" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="currentColor"/><path d="M16 44h12V32h12V20h8" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    el.innerHTML =
      `<div>${dots}` +
      (step === 0
        ? `${logo}<h1 class="hero">Making everyday life easier,<br>one step at a time.</h1><p class="sub">SONGA helps you capture what’s on your mind, turn it into confirmed plans, and take the next small step — without the overwhelm.</p><div class="stack mt16"><div class="card row"><span style="font-size:1.4rem">🎙️</span><div class="small"><b>Say or type it.</b> Messy is fine.</div></div><div class="card row"><span style="font-size:1.4rem">✅</span><div class="small"><b>You confirm.</b> Nothing is saved until you say so.</div></div><div class="card row"><span style="font-size:1.4rem">🪜</span><div class="small"><b>One small step.</b> Gentle reminders and easy resets.</div></div></div><div style="flex:1"></div><button class="btn primary block mt16" data-a="obNext">Get started</button>`
        : step === 1
          ? `<h1 class="hero" style="font-size:1.7rem">A little about you</h1><div class="stack mt16"><div><label class="f" for="on">What should I call you? (optional)</label><input class="in" id="on" value="${esc(ob.name)}" data-a="obName"></div><div><label class="f">I mostly use SONGA as a</label><div class="chips">${[
              ["student", "🎓 University student"],
              ["adult", "💼 Working adult"],
            ]
              .map(
                ([k, l]) =>
                  `<button class="chip ${ob.role === k ? "on" : ""}" data-a="obRole" data-v="${k}">${l}</button>`,
              )
              .join(
                "",
              )}</div></div></div><div style="flex:1"></div><button class="btn primary block mt16" data-a="obNext">Continue</button>`
          : `<h1 class="hero" style="font-size:1.7rem">You’re in control</h1><div class="stack mt16"><div class="card row"><div class="grow"><b>Learn my preferences</b><div class="tiny muted">Optional. Remembers things like reminder timing and typical task length — on this device only. You can see, edit, pause or delete it any time.</div></div><label class="sw"><input type="checkbox" data-a="obLearn" aria-label="Learn preferences" ${ob.learn ? "checked" : ""}><span></span></label></div><div class="card row"><div class="grow"><b>Reminder notifications</b><div class="tiny muted">Works while SONGA is open in your browser.</div></div><label class="sw"><input type="checkbox" data-a="obNotif" aria-label="Notifications" ${ob.notif ? "checked" : ""}><span></span></label></div><div class="card row"><div class="grow"><b>Show me a sample day</b><div class="tiny muted">Pre-fills examples so you can explore. Delete any time.</div></div><label class="sw"><input type="checkbox" data-a="obDemo" aria-label="Sample data" ${ob.demo ? "checked" : ""}><span></span></label></div><p class="tiny muted">SONGA is a planning aid — not a medical device. It never diagnoses or gives medical advice.</p></div><div style="flex:1"></div><button class="btn primary block mt16" data-a="obNext">Start using SONGA</button>`) +
      "</div>";
  };
  A.obNext = () => {
    if (step < 2) {
      step++;
      draw();
      return;
    }
    S.name = ob.name.trim();
    S.role = ob.role;
    S.prefs.learn = ob.learn;
    S.onboarded = true;
    if (ob.demo) loadDemo();
    save();
    el.remove();
    render();
    toast(
      `Welcome${S.name ? ", " + S.name.split(" ")[0] : ""}! Tap ＋ to capture your first thought.`,
    );
  };
  A.obName = (e) => {
    ob.name = e.value;
  };
  A.obRole = (e) => {
    ob.role = e.dataset.v;
    draw();
  };
  A.obLearn = (e) => {
    ob.learn = e.checked;
  };
  A.obDemo = (e) => {
    ob.demo = e.checked;
  };
  A.obNotif = async (e) => {
    ob.notif = e.checked;
    if (e.checked && "Notification" in window) {
      const p = await Notification.requestPermission();
      S.prefs.notif = p === "granted";
      if (p !== "granted") {
        ob.notif = false;
        e.checked = false;
      }
      save();
    }
  };
  draw();
}
function loadDemo() {
  const T = (o) => ({
    id: uid(),
    time: null,
    due: null,
    dur: 30,
    effort: 30,
    urgency: "normal",
    location: "",
    cat: "general",
    rem: { prep: null, start: 0 },
    steps: [],
    checkpoints: [],
    status: "todo",
    created: Date.now(),
    orig: o.title,
    ...o,
  });
  const td = todayStr(),
    d = (n) => ymd(addDays(new Date(), n)),
    now = new Date();
  const hh = (o) =>
    minT(Math.min(21 * 60, Math.max(8 * 60, now.getHours() * 60 + o)));
  S.classes = S.classes.length
    ? S.classes
    : [
        {
          id: uid(),
          course: "Biology 101 — Lecture",
          dow: [1, 3],
          start: "10:00",
          end: "11:30",
          room: "Hall B, Room 204",
        },
        {
          id: uid(),
          course: "Statistics Lab",
          dow: [2, 4],
          start: "14:00",
          end: "16:00",
          room: "Computer Lab 3",
        },
      ];
  const add = (o) => {
    const t = T(o);
    t.steps = t.steps.length ? t.steps : stepsFor(t);
    S.tasks.push(t);
    return t;
  };
  const a = add({
    title: "Statistics report",
    cat: "study",
    date: d(1),
    due: { date: d(5), time: "17:00" },
    effort: 240,
    dur: 60,
    orig: "Statistics report due",
    rem: { prep: 60, start: 0 },
  });
  applyPlan(a);
  a.steps = stepsFor(a);
  add({
    title: "Study biology chapter 5",
    cat: "study",
    date: td,
    time: "19:00",
    dur: 60,
    rem: { prep: 30, start: 0 },
  });
  add({
    title: "Email Dr. Otieno about extension",
    cat: "work",
    date: td,
    dur: 15,
    urgency: "high",
  });
  add({
    title: "Buy groceries",
    cat: "home",
    date: d(1),
    time: "17:30",
    dur: 45,
    location: "Supermarket",
    rem: { prep: 30, start: 0 },
  });
  add({
    title: "Dentist appointment",
    cat: "health",
    date: d(2),
    time: "10:30",
    dur: 60,
    location: "Dental clinic",
    rem: { prep: 60, start: 0 },
  });
  add({ title: "Pay phone bill", cat: "home", date: d(-1), dur: 10 });
  add({
    title: "Return library book",
    cat: "study",
    date: td,
    time: "08:30",
    dur: 20,
    location: "Library",
    rem: { prep: 15, start: 0 },
  });
  save();
}

/* ───────────── boot ───────────── */
function init() {
  render();
  if (!S.onboarded) startOnboarding();
  setInterval(tick, 10000);
  setTimeout(tick, 1500);
  window.addEventListener("online", () => ($("#net").textContent = ""));
  window.addEventListener(
    "offline",
    () => ($("#net").textContent = "offline · still works"),
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      tick();
      render();
    }
  });
  window.addEventListener("beforeunload", save);
}
if (
  typeof document !== "undefined" &&
  document.getElementById &&
  document.getElementById("app")
)
  init();
if (typeof module !== "undefined")
  module.exports = { parseCapture, examBlocks, applyPlan, draftFromParsed };
