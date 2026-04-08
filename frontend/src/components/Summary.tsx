import { useState, useEffect } from "react";
import type { ExpenseSummary } from "../types";
import * as api from "../api/client";

interface Props {
  refreshKey: number;
}

export default function Summary({ refreshKey }: Props) {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  useEffect(() => {
    api.getExpenseSummary().then(setSummary).catch(() => {});
  }, [refreshKey]);

  if (!summary) return null;

  return (
    <div className="section summary">
      <h2>Summary</h2>
      <p className="grand-total">
        Total: <strong>${summary.grand_total.toFixed(2)}</strong>
      </p>
      {summary.by_category.length > 0 && (
        <ul className="summary-list">
          {summary.by_category.map((item) => (
            <li key={item.category}>
              <span>{item.category}</span>
              <span className="num">${item.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
