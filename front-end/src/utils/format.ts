// Só os dígitos — é isso que vai pra API (ex.: "4499999999")
export const phoneDigits = (value: string): string => value.replace(/\D/g, "");

// ISO da API -> "YYYY-MM-DD" (valor do <input type="date">)
export const toDateInput = (iso: string | null): string =>
  iso ? iso.slice(0, 10) : "";

// ISO -> data pt-BR pra exibir (ex.: "15/07/2026")
export const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "";

// Máscara de telefone BR: (11) 99999-9999 ou (11) 9999-9999
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
