import { useState, useEffect } from "react";
import type { Category } from "../types";
import * as api from "../api/client";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api.getCategories().then(setCategories).catch((e: Error) => setError(e.message));
  };

  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await api.createCategory(trimmed);
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCategory(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  return (
    <div className="section">
      <h2>Categories</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleAdd} className="inline-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          maxLength={50}
        />
        <button type="submit">Add</button>
      </form>
      <ul className="tag-list">
        {categories.map((c) => (
          <li key={c.id} className="tag">
            {c.name}
            <button
              className="btn-small danger"
              onClick={() => handleDelete(c.id)}
              title="Delete category"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
