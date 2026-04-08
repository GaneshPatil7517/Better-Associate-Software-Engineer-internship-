import { useState, useEffect } from "react";
import type { Category } from "../types";
import * as api from "../api/client";

interface Props {
  onSaved: () => void;
  editingExpense?: {
    id: number;
    description: string;
    amount: number;
    date: string;
    category_id: number;
  } | null;
  onCancelEdit: () => void;
}

export default function ExpenseForm({ onSaved, editingExpense, onCancelEdit }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(String(editingExpense.amount));
      setDate(editingExpense.date);
      setCategoryId(editingExpense.category_id);
    }
  }, [editingExpense]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || categoryId === "") {
      setError("Please fill all fields with valid values.");
      return;
    }

    const payload = {
      description: description.trim(),
      amount: parsedAmount,
      date,
      category_id: categoryId as number,
    };

    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, payload);
      } else {
        await api.createExpense(payload);
      }
      resetForm();
      onCancelEdit();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    }
  };

  return (
    <div className="section">
      <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="expense-form">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          maxLength={200}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="form-actions">
          <button type="submit">{editingExpense ? "Update" : "Add"}</button>
          {editingExpense && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCancelEdit();
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
