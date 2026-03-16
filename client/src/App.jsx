import { useState, useEffect } from "react";
import "./App.css";

const API = "/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchItems = async () => {
    const res = await fetch(API);
    setItems(await res.json());
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      setEditingId(null);
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    }

    setName("");
    setDescription("");
    fetchItems();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleToggleDone = async (id) => {
    await fetch(`${API}/${id}/toggle`, { method: "PATCH" });
    fetchItems();
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const doneCount = items.filter((i) => i.done).length;
  const activeCount = items.length - doneCount;

  const filtered = items.filter((item) => {
    if (filter === "active") return !item.done;
    if (filter === "done") return item.done;
    return true;
  });

  return (
    <div className="app">
      <header className="header">
        <h1>Task Board</h1>
        <p className="subtitle">Track and manage your items</p>
        {items.length > 0 && (
          <div className="stats">
            <span className="stat">{activeCount} active</span>
            <span className="stat-divider">·</span>
            <span className="stat stat-done">{doneCount} done</span>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className={`form${editingId ? " form-editing" : ""}`}>
        <div className="form-label">{editingId ? "Edit item" : "Add new item"}</div>
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="form-buttons">
          <button type="submit" className="btn-primary">
            {editingId ? "Update" : "Add item"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>

      {items.length > 0 && (
        <div className="filter-tabs">
          {["all", "active", "done"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab${filter === tab ? " filter-tab-active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">
                {tab === "all" ? items.length : tab === "active" ? activeCount : doneCount}
              </span>
            </button>
          ))}
        </div>
      )}

      <ul className="item-list">
        {filtered.map((item) => (
          <li key={item.id} className={`item${item.done ? " item-done" : ""}`}>
            <button
              className={`btn-check${item.done ? " btn-check-done" : ""}`}
              onClick={() => handleToggleDone(item.id)}
              title={item.done ? "Mark as active" : "Mark as done"}
            >
              {item.done ? "✓" : ""}
            </button>
            <div className="item-content">
              <strong className="item-name">{item.name}</strong>
              {item.description && <p className="item-desc">{item.description}</p>}
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)} className="btn-edit" disabled={item.done}>
                Edit
              </button>
              <button onClick={() => handleDelete(item.id)} className="btn-delete">
                Delete
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon">{filter === "done" ? "✓" : "○"}</div>
            <p>
              {filter === "all"
                ? "No items yet. Add one above!"
                : filter === "active"
                ? "No active items."
                : "Nothing marked as done yet."}
            </p>
          </div>
        )}
      </ul>
    </div>
  );
}

export default App;
