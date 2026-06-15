// Máscara para CNPJ/CPF
export function maskCnpjCpf(value: string) {
  value = value.replace(/\D/g, "");
  if (value.length <= 11) {
    // CPF: 000.000.000-00
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  // CNPJ: 00.000.000/0000-00
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

// Máscara para telefone
export function maskPhone(value: string) {
  value = value.replace(/\D/g, "");
  // Celular com 9 dígitos: (99) 99999-9999
  if (value.length === 11) {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  // Telefone fixo: (99) 9999-9999
  return value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function maskCpf(value: string) {
  value = value.replace(/\D/g, "").slice(0, 11);
  if (value.length > 9) return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  if (value.length > 6) return value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (value.length > 3) return value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  return value;
}

export function maskCnpj(value: string) {
  value = value.replace(/\D/g, "").slice(0, 14);
  if (value.length > 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
  if (value.length > 8) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4");
  if (value.length > 5) return value.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (value.length > 2) return value.replace(/(\d{2})(\d{1,3})/, "$1.$2");
  return value;
}

// Máscara para números (milhares e decimais)
export function formatNumberMask(value: number | undefined, isInteger = false): string {
  if (typeof value !== "number") return isInteger ? "0" : "0,00";
  if (isInteger) {
    return value.toLocaleString("pt-BR");
  }
  return value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}