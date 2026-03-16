const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "items.json");

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

function readItems() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// Wrap a plain object so it has instance methods (.update, .destroy)
function wrapItem(items, rawItem) {
  return {
    ...rawItem,
    update(data) {
      const all = readItems();
      const idx = all.findIndex((i) => i.id === rawItem.id);
      if (idx === -1) throw new Error("Item not found");
      if (data.name !== undefined) all[idx].name = data.name;
      if (data.description !== undefined) all[idx].description = data.description;
      all[idx].updatedAt = new Date().toISOString();
      writeItems(all);
      Object.assign(this, all[idx]);
    },
    destroy() {
      const all = readItems();
      writeItems(all.filter((i) => i.id !== rawItem.id));
    },
  };
}

const Item = {
  findAll({ order } = {}) {
    let items = readItems();
    if (order && order[0] && order[0][0] === "createdAt" && order[0][1] === "DESC") {
      items = items.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return Promise.resolve(items.map((item) => wrapItem(items, item)));
  },

  findByPk(id) {
    const items = readItems();
    const item = items.find((i) => i.id === Number(id));
    return Promise.resolve(item ? wrapItem(items, item) : null);
  },

  create({ name, description = "" }) {
    if (!name) return Promise.reject(new Error("name is required"));
    const items = readItems();
    const newItem = {
      id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    writeItems(items);
    return Promise.resolve(wrapItem(items, newItem));
  },
};

module.exports = { Item };
