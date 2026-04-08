export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  category_name: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ExpenseSummary {
  by_category: { category: string; total: number }[];
  grand_total: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
