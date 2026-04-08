import { useState, useEffect, useCallback } from "react";
import type { Expense, PaginatedResponse } from "../types";
import * as api from "../api/client";

interface Props {
  refreshKey: number;
  onEdit: (expense: Expense) => void;
}

export default function ExpenseList({ refreshKey, onEdit }: Props) {
  const [data, setData] = useState<PaginatedResponse<Expense> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .getExpenses({ page: String(page), per_page: "10" })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [page]);

  useEffect(load, [load, refreshKey]);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteExpense(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="section">
      <h2>Expenses</h2>
      {error && <p className="error">{error}</p>}
      {data.items.length === 0 ? (
        <p className="muted">No expenses yet. Add one above.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="num">Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.date}</td>
                <td>{exp.description}</td>
                <td>{exp.category_name}</td>
                <td className="num">${exp.amount.toFixed(2)}</td>
                <td>
                  <button className="btn-small" onClick={() => onEdit(exp)}>
                    Edit
                  </button>
                  <button
                    className="btn-small danger"
                    onClick={() => handleDelete(exp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {data.page} of {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
