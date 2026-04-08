import { useState, useCallback } from "react";
import type { Expense } from "./types";
import CategoryManager from "./components/CategoryManager";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <div className="layout">
        <div className="main-col">
          <ExpenseForm
            onSaved={refresh}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />
          <ExpenseList refreshKey={refreshKey} onEdit={setEditingExpense} />
        </div>
        <aside className="side-col">
          <Summary refreshKey={refreshKey} />
          <CategoryManager />
        </aside>
      </div>
    </div>
  );
}
