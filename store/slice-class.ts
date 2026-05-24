// Абстрактный класс для всех Redux slices с поддержкой пагинации и стандартных полей
export abstract class AbstractSlice<T> {
  items: T[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentPage: number;
  rowsPerPage: number;

  constructor() {
    this.items = [];
    this.loading = true;
    this.saving = false;
    this.error = null;
    this.currentPage = 1;
    this.rowsPerPage = 10;
  }

  setItems(items: T[]): void {
    this.items = items;
    this.loading = false;
    this.error = null;
  }

  setCurrentPage(page: number): void {
    this.currentPage = page;
  }

  setRowsPerPage(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  setSaving(saving: boolean): void {
    this.saving = saving;
  }

  setError(error: string | null): void {
    this.error = error;
  }

  // Получить данные текущей страницы
  getPaginatedItems(): T[] {
    const startIdx = (this.currentPage - 1) * this.rowsPerPage;
    const endIdx = startIdx + this.rowsPerPage;
    return this.items.slice(startIdx, endIdx);
  }

  getTotalRows(): number {
    return this.items.length;
  }
}
