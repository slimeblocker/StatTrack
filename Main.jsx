import { useState, useEffect, useCallback } from "react";

// ─── GITHUB CONFIG ──────────────────────────────────────────────────────────
// Fill these in to enable GitHub sync. Leave GITHUB_TOKEN blank to use local only.
const GITHUB_CONFIG = {
  owner: "",         // your GitHub username
  repo: "",          // your repo name
  path: "scores.json",
  token: "",         // personal access token with repo scope
};

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&display=swap');`;

const styles = `
  ${FONT}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #f0f0eb;
    --white: #0e0e0e;
    --mid: #666;
    --border: 2px solid #2a2a2a;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'Space Mono', monospace;
    --surface: #161616;
    --surface2: #1e1e1e;
    --hover: #222;
  }

  body { background: var(--white); color: var(--black); font-family: var(--font-body); }

  .app {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  /* HEADER */
  .header {
    border-bottom: var(--border);
    padding: 16px 32px;
    display: flex;
    align-items: baseline;
    gap: 24px;
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 100;
  }
  .header h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 4rem);
    letter-spacing: 0.05em;
    line-height: 1;
  }
  .header .subtitle {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--mid);
    border-left: 2px solid var(--mid);
    padding-left: 16px;
  }
  .header-actions { margin-left: auto; display: flex; gap: 8px; }

  /* BUTTONS */
  .btn {
    font-family: var(--font-body);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding: 8px 16px;
    border: var(--border);
    background: transparent;
    color: var(--black);
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
  }
  .btn:hover { background: var(--black); color: var(--white); }
  .btn.primary { background: var(--black); color: var(--white); border-color: var(--black); }
  .btn.primary:hover { background: #ccc; color: var(--white); border-color: #ccc; }
  .btn.danger:hover { background: #c00; border-color: #c00; color: #fff; }
  .btn.sm { padding: 4px 10px; font-size: 10px; }

  /* LAYOUT */
  .main {
    display: grid;
    grid-template-columns: 1fr 360px;
    height: calc(100vh - 73px);
  }

  /* GAME LIST */
  .game-list {
    border-right: var(--border);
    overflow-y: auto;
  }
  .list-header {
    display: grid;
    grid-template-columns: 60px 1fr 80px 80px 60px;
    padding: 10px 24px;
    border-bottom: var(--border);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mid);
    background: var(--surface);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .game-row {
    display: grid;
    grid-template-columns: 60px 1fr 80px 80px 60px;
    padding: 14px 24px;
    border-bottom: 1px solid #1e1e1e;
    cursor: pointer;
    transition: background 0.08s;
    align-items: center;
  }
  .game-row:hover { background: var(--hover); }
  .game-row.selected { background: var(--black); color: var(--white); }
  .game-row .date { font-size: 10px; color: inherit; opacity: 0.6; }
  .game-row .players { font-size: 13px; font-weight: 700; }
  .game-row .score-cell {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: 0.05em;
  }
  .game-row .winner-badge {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.5;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    gap: 12px;
    color: var(--mid);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }
  .empty-state .big { font-family: var(--font-display); font-size: 80px; color: #333; }

  /* SIDEBAR */
  .sidebar {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .panel {
    border-bottom: var(--border);
    padding: 24px;
    background: var(--white);
  }
  .panel-title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  /* GAME DETAIL */
  .detail-score {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 16px 0;
  }
  .detail-score .player-score {
    flex: 1;
    text-align: center;
  }
  .detail-score .player-score .name {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--mid);
    margin-bottom: 4px;
  }
  .detail-score .player-score .pts {
    font-family: var(--font-display);
    font-size: 64px;
    line-height: 1;
  }
  .detail-score .vs {
    font-family: var(--font-display);
    font-size: 2rem;
    color: #ccc;
  }
  .detail-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
  }
  .meta-item { font-size: 11px; }
  .meta-item .label { color: var(--mid); font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; }
  .meta-item .value { margin-top: 2px; }

  .sets-list { margin-top: 12px; }
  .set-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 6px 0;
    border-bottom: 1px solid #222;
  }
  .set-num { font-size: 9px; color: var(--mid); width: 40px; text-transform: uppercase; letter-spacing: 0.1em; }
  .set-score { font-family: var(--font-display); font-size: 20px; flex: 1; }

  /* NEW GAME FORM */
  .form-group { margin-bottom: 14px; }
  .form-group label {
    display: block;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--mid);
    margin-bottom: 6px;
  }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 8px 10px;
    border: var(--border);
    background: var(--surface2);
    color: var(--black);
    font-family: var(--font-body);
    font-size: 12px;
    outline: none;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    background: #252525;
    border-color: #444;
  }
  .form-group textarea { resize: vertical; min-height: 60px; }

  .sets-form { margin: 8px 0; }
  .set-input-row {
    display: grid;
    grid-template-columns: 40px 1fr 24px 1fr 32px;
    gap: 4px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 10px;
    color: var(--mid);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .set-input-row input { padding: 6px 8px; text-align: center; }
  .add-set-btn {
    font-family: var(--font-body);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding: 4px 0;
    background: none;
    border: none;
    border-bottom: var(--border);
    cursor: pointer;
    width: 100%;
    text-align: left;
    margin-top: 4px;
  }
  .add-set-btn:hover { background: var(--hover); }

  /* STATS */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: #2a2a2a;
    border: var(--border);
    margin-bottom: 16px;
  }
  .stat-cell {
    background: var(--surface2);
    padding: 12px;
    text-align: center;
  }
  .stat-cell .val {
    font-family: var(--font-display);
    font-size: 2rem;
    line-height: 1;
  }
  .stat-cell .lbl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--mid);
    margin-top: 4px;
  }

  .player-stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #1e1e1e;
    font-size: 12px;
  }
  .player-stat-row .pname { font-weight: 700; }
  .player-stat-row .pstats { font-size: 10px; color: var(--mid); }
  .win-bar {
    height: 3px;
    background: #2a2a2a;
    margin-top: 3px;
    width: 80px;
  }
  .win-bar-fill { height: 100%; background: var(--black); transition: width 0.3s; }

  /* SYNC STATUS */
  .sync-bar {
    padding: 6px 24px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--mid);
  }
  .sync-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #ccc;
  }
  .sync-dot.ok { background: #444; }
  .sync-dot.err { background: #c00; }
  .sync-dot.syncing { background: #888; animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* TABS */
  .tabs {
    display: flex;
    border-bottom: var(--border);
  }
  .tab {
    flex: 1;
    padding: 10px;
    font-family: var(--font-body);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: none;
    border: none;
    border-right: var(--border);
    cursor: pointer;
    transition: background 0.1s;
  }
  .tab:last-child { border-right: none; }
  .tab:hover { background: var(--hover); }
  .tab.active { background: var(--black); color: var(--white); }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
`;

// ─── GITHUB SYNC ─────────────────────────────────────────────────────────────
async function githubFetch(method, body, sha) {
  const { owner, repo, path, token } = GITHUB_CONFIG;
  if (!owner || !repo || !token) return null;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

async function loadFromGitHub() {
  const data = await githubFetch("GET");
  if (!data) return null;
  const content = JSON.parse(atob(data.content.replace(/\n/g, "")));
  return { content, sha: data.sha };
}

async function saveToGitHub(content, sha) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
  await githubFetch("PUT", {
    message: `Update scores ${new Date().toISOString()}`,
    content: encoded,
    sha,
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

function computeStats(games) {
  const players = {};
  games.forEach((g) => {
    const p1 = g.player1, p2 = g.player2;
    [p1, p2].forEach((p) => {
      if (!players[p]) players[p] = { games: 0, wins: 0, pointsFor: 0, pointsAgainst: 0 };
    });
    players[p1].games++;
    players[p2].games++;
    players[p1].pointsFor += g.score1;
    players[p1].pointsAgainst += g.score2;
    players[p2].pointsFor += g.score2;
    players[p2].pointsAgainst += g.score1;
    if (g.winner === p1) players[p1].wins++;
    else if (g.winner === p2) players[p2].wins++;
  });
  return Object.entries(players)
    .map(([name, s]) => ({ name, ...s, winPct: s.games ? Math.round((s.wins / s.games) * 100) : 0 }))
    .sort((a, b) => b.wins - a.wins || b.winPct - a.winPct);
}

// ─── NEW GAME FORM ────────────────────────────────────────────────────────────
function NewGameForm({ onSave, existingPlayers }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [sets, setSets] = useState([{ s1: "", s2: "" }]);
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");

  const addSet = () => setSets([...sets, { s1: "", s2: "" }]);
  const rmSet = (i) => setSets(sets.filter((_, idx) => idx !== i));
  const updSet = (i, k, v) => {
    const s = [...sets];
    s[i] = { ...s[i], [k]: v };
    setSets(s);
  };

  const handleSave = () => {
    if (!p1.trim() || !p2.trim()) return alert("Both player names required");
    const validSets = sets.filter((s) => s.s1 !== "" && s.s2 !== "");
    if (!validSets.length) return alert("At least one set required");
    const score1 = validSets.filter((s) => +s.s1 > +s.s2).length;
    const score2 = validSets.filter((s) => +s.s2 > +s.s1).length;
    const winner = score1 > score2 ? p1.trim() : score2 > score1 ? p2.trim() : null;
    onSave({
      id: genId(),
      date: new Date().toISOString(),
      player1: p1.trim(),
      player2: p2.trim(),
      score1,
      score2,
      sets: validSets.map((s) => ({ s1: +s.s1, s2: +s.s2 })),
      winner,
      note,
      location,
    });
    setP1(""); setP2(""); setSets([{ s1: "", s2: "" }]); setNote(""); setLocation("");
  };

  return (
    <div className="panel">
      <div className="panel-title">New Game</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div className="form-group">
          <label>Player 1</label>
          <input value={p1} onChange={e => setP1(e.target.value)} list="players-list" placeholder="Name" />
        </div>
        <div className="form-group">
          <label>Player 2</label>
          <input value={p2} onChange={e => setP2(e.target.value)} list="players-list" placeholder="Name" />
        </div>
      </div>
      <datalist id="players-list">
        {existingPlayers.map(p => <option key={p} value={p} />)}
      </datalist>
      <div className="form-group">
        <label>Sets</label>
        <div className="sets-form">
          {sets.map((s, i) => (
            <div className="set-input-row" key={i}>
              <span>Set {i + 1}</span>
              <input type="number" min="0" value={s.s1} onChange={e => updSet(i, "s1", e.target.value)} placeholder="0" />
              <span style={{ textAlign: "center" }}>–</span>
              <input type="number" min="0" value={s.s2} onChange={e => updSet(i, "s2", e.target.value)} placeholder="0" />
              {sets.length > 1 && (
                <button className="btn sm danger" onClick={() => rmSet(i)} style={{ padding: "2px 6px" }}>✕</button>
              )}
            </div>
          ))}
          <button className="add-set-btn" onClick={addSet}>+ Add Set</button>
        </div>
      </div>
      <div className="form-group">
        <label>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Office, Basement" />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any remarks..." />
      </div>
      <button className="btn primary" style={{ width: "100%" }} onClick={handleSave}>Record Game</button>
    </div>
  );
}

// ─── GAME DETAIL ──────────────────────────────────────────────────────────────
function GameDetail({ game, onDelete }) {
  if (!game) return (
    <div className="panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--mid)", fontFamily: "var(--font-display)", fontSize: "1.2rem", letterSpacing: "0.1em" }}>
        SELECT A GAME
      </div>
    </div>
  );
  return (
    <div className="panel" style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="panel-title">Game Detail</div>
        <button className="btn sm danger" onClick={() => onDelete(game.id)}>Delete</button>
      </div>
      <div className="detail-score">
        <div className="player-score">
          <div className="name">{game.player1}</div>
          <div className="pts">{game.score1}</div>
        </div>
        <div className="vs">VS</div>
        <div className="player-score">
          <div className="name">{game.player2}</div>
          <div className="pts">{game.score2}</div>
        </div>
      </div>
      {game.winner && (
        <div style={{ textAlign: "center", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--mid)", marginBottom: 12 }}>
          Winner: <strong style={{ color: "var(--black)" }}>{game.winner}</strong>
        </div>
      )}
      <div className="detail-meta">
        <div className="meta-item"><div className="label">Date</div><div className="value">{fmt(game.date)}</div></div>
        <div className="meta-item"><div className="label">Location</div><div className="value">{game.location || "—"}</div></div>
        <div className="meta-item"><div className="label">Sets played</div><div className="value">{game.sets?.length || 0}</div></div>
        <div className="meta-item"><div className="label">Time</div><div className="value">{new Date(game.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div></div>
      </div>
      {game.sets?.length > 0 && (
        <div className="sets-list">
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--mid)", margin: "12px 0 4px" }}>Set Scores</div>
          {game.sets.map((s, i) => (
            <div className="set-row" key={i}>
              <span className="set-num">Set {i + 1}</span>
              <span className="set-score">{s.s1} – {s.s2}</span>
              <span style={{ fontSize: 10, color: "var(--mid)" }}>
                {s.s1 > s.s2 ? game.player1 : s.s2 > s.s1 ? game.player2 : "Draw"}
              </span>
            </div>
          ))}
        </div>
      )}
      {game.note && (
        <div style={{ marginTop: 12, padding: 12, background: "#1e1e1e", fontSize: 12, fontStyle: "italic" }}>
          {game.note}
        </div>
      )}
    </div>
  );
}

// ─── STATS PANEL ─────────────────────────────────────────────────────────────
function StatsPanel({ games }) {
  const stats = computeStats(games);
  const totalGames = games.length;
  const totalSets = games.reduce((a, g) => a + (g.sets?.length || 0), 0);
  const locations = [...new Set(games.map(g => g.location).filter(Boolean))];

  return (
    <div className="panel" style={{ flex: 1, overflowY: "auto" }}>
      <div className="panel-title">Statistics</div>
      <div className="stats-grid">
        <div className="stat-cell"><div className="val">{totalGames}</div><div className="lbl">Games</div></div>
        <div className="stat-cell"><div className="val">{totalSets}</div><div className="lbl">Sets</div></div>
        <div className="stat-cell"><div className="val">{stats.length}</div><div className="lbl">Players</div></div>
        <div className="stat-cell"><div className="val">{locations.length}</div><div className="lbl">Venues</div></div>
      </div>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--mid)", marginBottom: 8 }}>
        Player Rankings
      </div>
      {stats.length === 0 && (
        <div style={{ color: "var(--mid)", fontSize: 11, textAlign: "center", padding: 24 }}>No data yet</div>
      )}
      {stats.map((p, i) => (
        <div className="player-stat-row" key={p.name}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: i === 0 ? "var(--black)" : "var(--mid)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pname">{p.name}</span>
            </div>
            <div className="pstats">{p.wins}W – {p.games - p.wins}L · {p.winPct}% · Pts {p.pointsFor}/{p.pointsAgainst}</div>
            <div className="win-bar"><div className="win-bar-fill" style={{ width: `${p.winPct}%` }} /></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>{p.wins}</div>
            <div style={{ fontSize: 9, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.1em" }}>wins</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sideTab, setSideTab] = useState("detail"); // detail | new | stats
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | ok | err
  const [ghSha, setGhSha] = useState(null);

  const hasGH = GITHUB_CONFIG.owner && GITHUB_CONFIG.token;

  // Load from localStorage on mount, then try GitHub
  useEffect(() => {
    const local = localStorage.getItem("tt_games");
    if (local) setGames(JSON.parse(local));
    if (hasGH) syncFromGitHub();
  }, []);

  const persist = useCallback((g) => {
    localStorage.setItem("tt_games", JSON.stringify(g));
  }, []);

  const syncFromGitHub = async () => {
    setSyncStatus("syncing");
    try {
      const result = await loadFromGitHub();
      if (result) {
        setGames(result.content.games || []);
        setGhSha(result.sha);
        persist(result.content.games || []);
      }
      setSyncStatus("ok");
    } catch (e) {
      setSyncStatus("err");
    }
  };

  const pushToGitHub = async (newGames) => {
    if (!hasGH) return;
    setSyncStatus("syncing");
    try {
      // Re-fetch SHA before pushing
      const result = await loadFromGitHub();
      const sha = result?.sha || ghSha;
      const stats = computeStats(newGames);
      await saveToGitHub({ games: newGames, stats, lastUpdated: new Date().toISOString() }, sha);
      if (result) setGhSha(result.sha);
      setSyncStatus("ok");
    } catch (e) {
      setSyncStatus("err");
    }
  };

  const saveGame = (g) => {
    const updated = [g, ...games];
    setGames(updated);
    persist(updated);
    pushToGitHub(updated);
    setSideTab("detail");
  };

  const deleteGame = (id) => {
    if (!confirm("Delete this game?")) return;
    const updated = games.filter(g => g.id !== id);
    setGames(updated);
    persist(updated);
    pushToGitHub(updated);
    setSelected(null);
  };

  const existingPlayers = [...new Set(games.flatMap(g => [g.player1, g.player2]))];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <h1>Table Tennis</h1>
          <div className="subtitle">Score Tracker</div>
          <div className="header-actions">
            {hasGH && (
              <button className="btn sm" onClick={syncFromGitHub}>↻ Sync</button>
            )}
            <button className="btn primary" onClick={() => setSideTab("new")}>+ New Game</button>
          </div>
        </header>

        {hasGH && (
          <div className="sync-bar">
            <div className={`sync-dot ${syncStatus}`} />
            {syncStatus === "idle" && "Ready"}
            {syncStatus === "syncing" && "Syncing with GitHub…"}
            {syncStatus === "ok" && "Synced with GitHub"}
            {syncStatus === "err" && "Sync failed — check config"}
          </div>
        )}
        {!hasGH && (
          <div className="sync-bar">
            <div className="sync-dot" />
            Local mode — fill GITHUB_CONFIG to enable cloud sync
          </div>
        )}

        <div className="main">
          {/* LIST */}
          <div className="game-list">
            <div className="list-header">
              <span>Date</span>
              <span>Match</span>
              <span>Score</span>
              <span>Winner</span>
              <span>Sets</span>
            </div>
            {games.length === 0 && (
              <div className="empty-state">
                <div className="big">🏓</div>
                <div>No games recorded yet</div>
                <button className="btn primary" onClick={() => setSideTab("new")}>Record First Game</button>
              </div>
            )}
            {games.map((g) => (
              <div
                key={g.id}
                className={`game-row${selected?.id === g.id ? " selected" : ""}`}
                onClick={() => { setSelected(g); setSideTab("detail"); }}
              >
                <span className="date">{fmt(g.date)}</span>
                <span className="players">{g.player1} vs {g.player2}</span>
                <span className="score-cell">{g.score1}–{g.score2}</span>
                <span className="winner-badge">{g.winner || "Draw"}</span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>{g.sets?.length || 0}</span>
              </div>
            ))}
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="tabs">
              <button className={`tab${sideTab === "detail" ? " active" : ""}`} onClick={() => setSideTab("detail")}>Detail</button>
              <button className={`tab${sideTab === "new" ? " active" : ""}`} onClick={() => setSideTab("new")}>New Game</button>
              <button className={`tab${sideTab === "stats" ? " active" : ""}`} onClick={() => setSideTab("stats")}>Stats</button>
            </div>
            {sideTab === "detail" && <GameDetail game={selected} onDelete={deleteGame} />}
            {sideTab === "new" && <NewGameForm onSave={saveGame} existingPlayers={existingPlayers} />}
            {sideTab === "stats" && <StatsPanel games={games} />}
          </div>
        </div>
      </div>
    </>
  );
}
