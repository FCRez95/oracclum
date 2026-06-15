export function handleError(error: unknown, context?: string) {
  // ERRO GENERICO JS/TS
  if (error instanceof Error) {
    console.error(`[${context ?? "Erro"}]`, error.message);
    return error.message;
  }

  // ERRO API
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"

  ) {
    const message = (error as { message: string }).message;
    console.error(`[${context ?? "Erro"}]`, message);

    return message;
  }

  // STRING
  if (typeof error === "string") {
    console.error(`[${context ?? "Erro"}]`, error);

    return error;
  }

  // DESCONHECIDO
  console.error(`[${context ?? "Erro desconhecido"}]`, error ?? "Sem detalhes do erro");
  return "Ocorreu um erro inesperado.";
}