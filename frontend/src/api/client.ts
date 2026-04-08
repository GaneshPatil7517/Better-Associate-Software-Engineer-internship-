import type {
  Category,
  Expense,
  PaginatedResponse,
  ExpenseSummary,
} from "../types";

const BASE = "/api";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// Categories
export const getCategories = () => request<Category[]>("/categories");

export const createCategory = (name: string) =>
  request<Category>("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const deleteCategory = (id: number) =>
  request<void>(`/categories/${id}`, { method: "DELETE" });

// Expenses
export const getExpenses = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<PaginatedResponse<Expense>>(`/expenses${qs}`);
};

export const createExpense = (data: {
  description: string;
  amount: number;
  date: string;
  category_id: number;
}) =>
  request<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateExpense = (
  id: number,
  data: {
    description: string;
    amount: number;
    date: string;
    category_id: number;
  }
) =>
  request<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteExpense = (id: number) =>
  request<void>(`/expenses/${id}`, { method: "DELETE" });

export const getExpenseSummary = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<ExpenseSummary>(`/expenses/summary${qs}`);
};
