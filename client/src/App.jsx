import { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState("");
  const [previewModal, setPreviewModal] = useState(null);
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    const res = await fetch(API);
    setItems(await res.json());
  };

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    if (!formImage) { setFormImagePreview(""); return; }
    const url = URL.createObjectURL(formImage);
    setFormImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formImage]);

  const resetForm = () => {
    setName(""); setDescription(""); setFormImage(null); setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    let itemId;
    if (editingId) {
      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      itemId = (await res.json()).id;
    } else {
      const res = await fetch(API, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      itemId = (await res.json()).id;
    }
    if (formImage && itemId) {
      const fd = new FormData(); fd.append("image", formImage);
      await fetch(`${API}/${itemId}/image`, { method: "POST", body: fd });
    }
    resetForm(); fetchItems();
  };

  const handleEdit = (item) => {
    setEditingId(item.id); setName(item.name); setDescription(item.description);
    setFormImage(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => { await fetch(`${API}/${id}`, { method: "DELETE" }); fetchItems(); };
  const handleToggleDone = async (id) => { await fetch(`${API}/${id}/toggle`, { method: "PATCH" }); fetchItems(); };
  const handleCancel = () => resetForm();

  const handleImageUpload = async (itemId, file) => {
    const fd = new FormData(); fd.append("image", file);
    await fetch(`${API}/${itemId}/image`, { method: "POST", body: fd }); fetchItems();
  };
  const handleImageDelete = async (itemId) => {
    await fetch(`${API}/${itemId}/image`, { method: "DELETE" }); fetchItems();
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
      {/* ── Top bar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <h1>Task Board</h1>
          {items.length > 0 && (
            <div className="stats">
              <span>{activeCount} active</span>
              <span className="stats-sep">/</span>
              <span className="stats-done">{doneCount} done</span>
            </div>
          )}
        </div>
        <div className="filter-tabs">
          {["all", "active", "done"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab${filter === tab ? " active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">
                {tab === "all" ? items.length : tab === "active" ? activeCount : doneCount}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Add / Edit form ── */}
      <form onSubmit={handleSubmit} className={`form-bar${editingId ? " form-editing" : ""}`}>
        <input
          type="text"
          placeholder="Task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input-name"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input-desc"
        />

        {formImagePreview ? (
          <div className="form-thumb">
            <img src={formImagePreview} alt="Preview" />
            <button type="button" className="form-thumb-remove" onClick={() => { setFormImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>&times;</button>
          </div>
        ) : (
          <label className="form-attach" title="Attach image">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) setFormImage(e.target.files[0]); }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          </label>
        )}

        <button type="submit" className="btn-add">{editingId ? "Save" : "Add"}</button>
        {editingId && <button type="button" onClick={handleCancel} className="btn-cancel">Cancel</button>}
      </form>

      {/* ── Task grid ── */}
      {filtered.length > 0 ? (
        <div className="task-grid">
          {filtered.map((item) => (
            <div key={item.id} className={`card${item.done ? " card-done" : ""}`}>
              {/* Card image */}
              {item.imageUrl ? (
                <div className="card-image" onClick={() => setPreviewModal(item.imageUrl)}>
                  <img src={item.imageUrl} alt="" />
                  <button className="card-img-remove" onClick={(e) => { e.stopPropagation(); handleImageDelete(item.id); }}>&times;</button>
                </div>
              ) : (
                <label className="card-image-placeholder">
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { handleImageUpload(item.id, e.target.files[0]); e.target.value = ""; } }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  <span>Add image</span>
                </label>
              )}

              {/* Card body */}
              <div className="card-body">
                <div className="card-text">
                  <strong className="card-name">{item.name}</strong>
                  {item.description && <p className="card-desc">{item.description}</p>}
                </div>

                <div className="card-footer">
                  <button
                    className={`btn-check${item.done ? " checked" : ""}`}
                    onClick={() => handleToggleDone(item.id)}
                  >
                    {item.done ? "\u2713 Done" : "Mark done"}
                  </button>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(item)} className="btn-edit" disabled={item.done}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>{filter === "all" ? "No tasks yet. Create one above to get started." : filter === "active" ? "No active tasks." : "Nothing completed yet."}</p>
        </div>
      )}

      {/* ── Modal ── */}
      {previewModal && (
        <div className="modal-overlay" onClick={() => setPreviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewModal} alt="Preview" />
            <button className="modal-close" onClick={() => setPreviewModal(null)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
