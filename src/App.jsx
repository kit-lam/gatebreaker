import { useState, useEffect, useRef } from "react";

const SAMPLE_DATA = [
  {
    id: "LHR",
    name: "London Heathrow",
    iata: "LHR",
    terminal: "T5",
    entries: [
      { id: 1, name: "Wagamama", zone: "airside", category: "Restaurant", notes: "Full menu, great ramen. Near Gate B38.", rating: 4 },
      { id: 2, name: "Pret A Manger", zone: "airside", category: "Café", notes: "Multiple locations past security.", rating: 3 },
      { id: 3, name: "Giraffe", zone: "landside", category: "Restaurant", notes: "Good for a proper sit-down before check-in.", rating: 4 },
      { id: 4, name: "Costa Coffee", zone: "landside", category: "Café", notes: "Busy but reliable.", rating: 3 },
    ],
  },
  {
    id: "AMS",
    name: "Amsterdam Schiphol",
    iata: "AMS",
    terminal: "Main",
    entries: [
      { id: 1, name: "Mövenpick", zone: "airside", category: "Restaurant", notes: "Surprisingly decent. Near gates E.", rating: 4 },
      { id: 2, name: "Starbucks", zone: "airside", category: "Café", notes: "Standard, but useful.", rating: 2 },
      { id: 3, name: "Burger King", zone: "landside", category: "Fast Food", notes: "Pre-security. Quick option.", rating: 2 },
    ],
  },
];

const CATEGORIES = ["Restaurant", "Café", "Fast Food", "Bar", "Bakery", "Other"];
const ZONES = ["airside", "landside"];

function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => !readonly && onChange && onChange(s)}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: readonly ? "14px" : "18px",
            color: s <= value ? "#F5A623" : "#444",
            transition: "color 0.15s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function FlipChar({ char }) {
  const [display, setDisplay] = useState(char);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(char);

  useEffect(() => {
    if (prev.current !== char) {
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(char);
        setFlipping(false);
        prev.current = char;
      }, 200);
      return () => clearTimeout(t);
    }
  }, [char]);

  return (
    <span
      style={{
        display: "inline-block",
        transform: flipping ? "rotateX(90deg)" : "rotateX(0deg)",
        transition: "transform 0.2s",
        transformOrigin: "center",
      }}
    >
      {display}
    </span>
  );
}

export default function App() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [view, setView] = useState("list"); // list | airport | addAirport | addEntry
  const [filter, setFilter] = useState("all"); // all | airside | landside
  const [newAirport, setNewAirport] = useState({ name: "", iata: "", terminal: "" });
  const [newEntry, setNewEntry] = useState({ name: "", zone: "airside", category: "Restaurant", notes: "", rating: 3 });
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("airport_food_data");
    if (stored) {
      try { setAirports(JSON.parse(stored)); } catch { setAirports(SAMPLE_DATA); }
    } else {
      setAirports(SAMPLE_DATA);
    }
  }, []);

  const save = (data) => {
    setAirports(data);
    localStorage.setItem("airport_food_data", JSON.stringify(data));
  };

  const addAirport = () => {
    if (!newAirport.name || !newAirport.iata) return;
    const a = { ...newAirport, id: newAirport.iata.toUpperCase(), iata: newAirport.iata.toUpperCase(), entries: [] };
    save([...airports, a]);
    setSelectedAirport(a);
    setNewAirport({ name: "", iata: "", terminal: "" });
    setView("airport");
  };

  const addEntry = () => {
    if (!newEntry.name) return;
    const updated = airports.map((a) =>
      a.id === selectedAirport.id
        ? { ...a, entries: [...a.entries, { ...newEntry, id: Date.now() }] }
        : a
    );
    save(updated);
    setSelectedAirport(updated.find((a) => a.id === selectedAirport.id));
    setNewEntry({ name: "", zone: "airside", category: "Restaurant", notes: "", rating: 3 });
    setView("airport");
  };

  const deleteEntry = (entryId) => {
    const updated = airports.map((a) =>
      a.id === selectedAirport.id
        ? { ...a, entries: a.entries.filter((e) => e.id !== entryId) }
        : a
    );
    save(updated);
    setSelectedAirport(updated.find((a) => a.id === selectedAirport.id));
  };

  const filtered = selectedAirport?.entries?.filter((e) => filter === "all" || e.zone === filter) ?? [];
  const searchedAirports = airports.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.iata.toLowerCase().includes(search.toLowerCase())
  );

  const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const styles = {
    root: {
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e0d0",
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      padding: "0",
    },
    header: {
      background: "#0d0d14",
      borderBottom: "2px solid #1a1a28",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    logo: {
      display: "flex",
      alignItems: "baseline",
      gap: "10px",
    },
    logoText: {
      fontSize: "22px",
      fontWeight: "bold",
      letterSpacing: "4px",
      color: "#F5A623",
      textTransform: "uppercase",
    },
    logoSub: {
      fontSize: "10px",
      letterSpacing: "3px",
      color: "#555",
      textTransform: "uppercase",
    },
    clock: {
      fontSize: "28px",
      fontWeight: "bold",
      letterSpacing: "6px",
      color: "#F5A623",
      fontVariantNumeric: "tabular-nums",
    },
    body: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    board: {
      background: "#0d0d14",
      border: "1px solid #1a1a28",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "24px",
    },
    boardHeader: {
      background: "#111120",
      padding: "12px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #1a1a28",
    },
    boardTitle: {
      fontSize: "11px",
      letterSpacing: "3px",
      color: "#555",
      textTransform: "uppercase",
    },
    airportRow: {
      display: "flex",
      alignItems: "center",
      padding: "16px 20px",
      borderBottom: "1px solid #111120",
      cursor: "pointer",
      transition: "background 0.15s",
      gap: "20px",
    },
    iata: {
      fontSize: "28px",
      fontWeight: "bold",
      letterSpacing: "3px",
      color: "#F5A623",
      width: "80px",
      flexShrink: 0,
    },
    airportName: {
      flex: 1,
      fontSize: "14px",
      letterSpacing: "1px",
      color: "#e8e0d0",
    },
    pill: (zone) => ({
      fontSize: "10px",
      letterSpacing: "2px",
      padding: "3px 10px",
      borderRadius: "2px",
      background: zone === "airside" ? "#1a2a1a" : "#2a1a1a",
      color: zone === "airside" ? "#5cdb5c" : "#db5c5c",
      border: `1px solid ${zone === "airside" ? "#2d4a2d" : "#4a2d2d"}`,
      textTransform: "uppercase",
    }),
    countBadge: {
      fontSize: "11px",
      color: "#444",
      letterSpacing: "1px",
    },
    btn: (variant = "primary") => ({
      padding: "10px 20px",
      fontSize: "11px",
      letterSpacing: "3px",
      textTransform: "uppercase",
      cursor: "pointer",
      border: variant === "primary" ? "1px solid #F5A623" : "1px solid #2a2a3a",
      background: variant === "primary" ? "#F5A623" : "transparent",
      color: variant === "primary" ? "#0a0a0f" : "#888",
      borderRadius: "2px",
      fontFamily: "inherit",
      fontWeight: "bold",
      transition: "all 0.15s",
    }),
    backBtn: {
      background: "none",
      border: "none",
      color: "#555",
      cursor: "pointer",
      fontSize: "12px",
      letterSpacing: "2px",
      textTransform: "uppercase",
      fontFamily: "inherit",
      padding: "0",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    input: {
      background: "#111120",
      border: "1px solid #2a2a3a",
      color: "#e8e0d0",
      padding: "10px 14px",
      fontSize: "13px",
      fontFamily: "inherit",
      borderRadius: "2px",
      width: "100%",
      boxSizing: "border-box",
      outline: "none",
    },
    label: {
      fontSize: "10px",
      letterSpacing: "3px",
      color: "#555",
      textTransform: "uppercase",
      marginBottom: "6px",
      display: "block",
    },
    entryCard: (zone) => ({
      background: "#0d0d14",
      border: `1px solid ${zone === "airside" ? "#1a2a1a" : "#2a1a1a"}`,
      borderLeft: `3px solid ${zone === "airside" ? "#5cdb5c" : "#db5c5c"}`,
      borderRadius: "2px",
      padding: "16px 20px",
      marginBottom: "12px",
    }),
    divider: {
      height: "1px",
      background: "#1a1a28",
      margin: "24px 0",
    },
    filterBar: {
      display: "flex",
      gap: "8px",
      marginBottom: "20px",
    },
    filterBtn: (active) => ({
      padding: "7px 16px",
      fontSize: "10px",
      letterSpacing: "2px",
      textTransform: "uppercase",
      cursor: "pointer",
      border: active ? "1px solid #F5A623" : "1px solid #2a2a3a",
      background: active ? "#1a1400" : "transparent",
      color: active ? "#F5A623" : "#555",
      borderRadius: "2px",
      fontFamily: "inherit",
      transition: "all 0.15s",
    }),
    emptyState: {
      padding: "40px",
      textAlign: "center",
      color: "#333",
      fontSize: "12px",
      letterSpacing: "2px",
      textTransform: "uppercase",
    },
    section: {
      marginBottom: "32px",
    },
    sectionTitle: {
      fontSize: "10px",
      letterSpacing: "4px",
      color: "#555",
      textTransform: "uppercase",
      marginBottom: "14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    sectionDot: (zone) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: zone === "airside" ? "#5cdb5c" : "#db5c5c",
      display: "inline-block",
    }),
    formGrid: {
      display: "grid",
      gap: "16px",
    },
    row: {
      display: "flex",
      gap: "12px",
    },
    select: {
      background: "#111120",
      border: "1px solid #2a2a3a",
      color: "#e8e0d0",
      padding: "10px 14px",
      fontSize: "13px",
      fontFamily: "inherit",
      borderRadius: "2px",
      width: "100%",
      outline: "none",
    },
    textarea: {
      background: "#111120",
      border: "1px solid #2a2a3a",
      color: "#e8e0d0",
      padding: "10px 14px",
      fontSize: "13px",
      fontFamily: "inherit",
      borderRadius: "2px",
      width: "100%",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "70px",
      outline: "none",
    },
    deleteBtn: {
      background: "none",
      border: "none",
      color: "#333",
      cursor: "pointer",
      fontSize: "16px",
      padding: "0",
      lineHeight: 1,
      transition: "color 0.15s",
      fontFamily: "inherit",
    },
  };

  // ─── AIRPORT DETAIL VIEW ─────────────────────────────────
  if (view === "airport" && selectedAirport) {
    const airside = filtered.filter((e) => e.zone === "airside");
    const landside = filtered.filter((e) => e.zone === "landside");
    const displayEntries = filter === "all" ? null : filtered;

    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <button style={styles.backBtn} onClick={() => setView("list")}>
              ← Back
            </button>
          </div>
          <div style={styles.clock}>{timeStr}</div>
        </div>
        <div style={styles.body}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "42px", fontWeight: "bold", letterSpacing: "6px", color: "#F5A623" }}>
              {selectedAirport.iata}
            </div>
            <div style={{ fontSize: "16px", color: "#e8e0d0", letterSpacing: "1px", marginTop: "4px" }}>
              {selectedAirport.name}
            </div>
            {selectedAirport.terminal && (
              <div style={{ fontSize: "11px", color: "#555", letterSpacing: "2px", marginTop: "4px", textTransform: "uppercase" }}>
                Terminal {selectedAirport.terminal}
              </div>
            )}
          </div>

          <div style={styles.filterBar}>
            {["all", "airside", "landside"].map((f) => (
              <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "airside" ? "✈ Airside (past security)" : "⬤ Landside (before security)"}
              </button>
            ))}
            <button style={{ ...styles.btn("primary"), marginLeft: "auto" }} onClick={() => setView("addEntry")}>
              + Add
            </button>
          </div>

          {filter === "all" ? (
            <>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  <span style={styles.sectionDot("airside")} />
                  Airside — past security & passport control
                </div>
                {airside.length === 0 ? (
                  <div style={styles.emptyState}>No airside entries yet</div>
                ) : (
                  airside.map((e) => <EntryCard key={e.id} entry={e} onDelete={deleteEntry} styles={styles} />)
                )}
              </div>
              <div style={styles.divider} />
              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  <span style={styles.sectionDot("landside")} />
                  Landside — before security
                </div>
                {landside.length === 0 ? (
                  <div style={styles.emptyState}>No landside entries yet</div>
                ) : (
                  landside.map((e) => <EntryCard key={e.id} entry={e} onDelete={deleteEntry} styles={styles} />)
                )}
              </div>
            </>
          ) : (
            <div style={styles.section}>
              {displayEntries.length === 0 ? (
                <div style={styles.emptyState}>No {filter} entries yet</div>
              ) : (
                displayEntries.map((e) => <EntryCard key={e.id} entry={e} onDelete={deleteEntry} styles={styles} />)
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── ADD ENTRY VIEW ───────────────────────────────────────
  if (view === "addEntry") {
    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setView("airport")}>
            ← Back to {selectedAirport?.iata}
          </button>
          <div style={styles.clock}>{timeStr}</div>
        </div>
        <div style={styles.body}>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#555", textTransform: "uppercase", marginBottom: "24px" }}>
            Add food option — {selectedAirport?.iata}
          </div>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })} placeholder="e.g. Wagamama" />
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Zone</label>
                <select style={styles.select} value={newEntry.zone} onChange={(e) => setNewEntry({ ...newEntry, zone: e.target.value })}>
                  <option value="airside">✈ Airside (past security)</option>
                  <option value="landside">⬤ Landside (before security)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Category</label>
                <select style={styles.select} value={newEntry.category} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={styles.label}>Notes</label>
              <textarea style={styles.textarea} value={newEntry.notes} onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="Location, what's good, wait times..." />
            </div>
            <div>
              <label style={styles.label}>Rating</label>
              <StarRating value={newEntry.rating} onChange={(r) => setNewEntry({ ...newEntry, rating: r })} />
            </div>
            <button style={styles.btn("primary")} onClick={addEntry}>
              Add Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADD AIRPORT VIEW ────────────────────────────────────
  if (view === "addAirport") {
    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setView("list")}>
            ← Back
          </button>
          <div style={styles.clock}>{timeStr}</div>
        </div>
        <div style={styles.body}>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#555", textTransform: "uppercase", marginBottom: "24px" }}>
            Add Airport
          </div>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>IATA Code</label>
              <input style={{ ...styles.input, fontSize: "24px", letterSpacing: "6px", textTransform: "uppercase" }} value={newAirport.iata} maxLength={3} onChange={(e) => setNewAirport({ ...newAirport, iata: e.target.value.toUpperCase() })} placeholder="LHR" />
            </div>
            <div>
              <label style={styles.label}>Airport Name</label>
              <input style={styles.input} value={newAirport.name} onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })} placeholder="London Heathrow" />
            </div>
            <div>
              <label style={styles.label}>Terminal (optional)</label>
              <input style={styles.input} value={newAirport.terminal} onChange={(e) => setNewAirport({ ...newAirport, terminal: e.target.value })} placeholder="T5" />
            </div>
            <button style={styles.btn("primary")} onClick={addAirport}>
              Add Airport
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LIST VIEW ──────────────────────────────────────
  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <div>
            <div style={styles.logoText}>GateFood</div>
            <div style={styles.logoSub}>Airport Food Guide</div>
          </div>
        </div>
        <div style={styles.clock}>{timeStr}</div>
      </div>
      <div style={styles.body}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search airports…"
          />
          <button style={styles.btn("primary")} onClick={() => setView("addAirport")}>
            + Airport
          </button>
        </div>

        <div style={styles.board}>
          <div style={styles.boardHeader}>
            <span style={styles.boardTitle}>Airports</span>
            <span style={styles.boardTitle}>{airports.length} saved</span>
          </div>
          {searchedAirports.length === 0 ? (
            <div style={styles.emptyState}>No airports yet — add one above</div>
          ) : (
            searchedAirports.map((a) => {
              const airside = a.entries.filter((e) => e.zone === "airside").length;
              const landside = a.entries.filter((e) => e.zone === "landside").length;
              return (
                <div
                  key={a.id}
                  style={styles.airportRow}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#111120")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => { setSelectedAirport(a); setFilter("all"); setView("airport"); }}
                >
                  <div style={styles.iata}>{a.iata}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.airportName}>{a.name}</div>
                    {a.terminal && <div style={{ fontSize: "11px", color: "#444", letterSpacing: "1px", marginTop: "2px" }}>Terminal {a.terminal}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {airside > 0 && <span style={styles.pill("airside")}>✈ {airside} airside</span>}
                    {landside > 0 && <span style={styles.pill("landside")}>⬤ {landside} landside</span>}
                    {a.entries.length === 0 && <span style={styles.countBadge}>No entries</span>}
                  </div>
                  <div style={{ color: "#333", fontSize: "16px" }}>›</div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ fontSize: "11px", color: "#333", letterSpacing: "2px", textAlign: "center", textTransform: "uppercase" }}>
          Green = airside (past security) · Red = landside (before security)
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry, onDelete, styles }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={styles.entryCard(entry.zone)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: "bold", letterSpacing: "1px", color: "#e8e0d0" }}>{entry.name}</span>
            <span style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", textTransform: "uppercase" }}>{entry.category}</span>
          </div>
          <StarRating value={entry.rating} readonly />
          {entry.notes && (
            <div style={{ fontSize: "12px", color: "#888", marginTop: "8px", lineHeight: "1.5", letterSpacing: "0.5px" }}>
              {entry.notes}
            </div>
          )}
        </div>
        <button
          style={{ ...styles.deleteBtn, color: hovered ? "#db5c5c" : "#333" }}
          onClick={() => onDelete(entry.id)}
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
}
