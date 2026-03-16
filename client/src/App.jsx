import { useState, useEffect } from "react";
import "./App.css";

const API = "/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

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
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
  };

  return (
    <div className="app">
      <h1>CRUD App</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="form-buttons">
          <button type="submit">{editingId ? "Update" : "Add"}</button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item">
            <div>
              <strong>{item.name}</strong>
              {item.description && <p>{item.description}</p>}
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)} className="btn-delete">
                Delete
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="empty">No items yet. Add one above!</p>}
      </ul>
    </div>
  );
}

export default App;
