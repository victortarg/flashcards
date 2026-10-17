import { toast } from "svelte-sonner";

/**
 * SubmitFunction padrão para os formulários do app: controla o estado de
 * carregamento, mostra erros num toast e só atualiza os dados em caso de sucesso.
 * @param {{
 *   carregando?: (ativo: boolean) => void,
 *   sucesso?: string,
 *   aoSucesso?: (dados: Record<string, any> | undefined) => void,
 *   limpar?: boolean,
 * }} [opcoes]
 * @returns {import('$app/forms').SubmitFunction}
 */
export function comFeedback(opcoes = {}) {
  return () => {
    opcoes.carregando?.(true);

    return async ({ result, update }) => {
      if (result.type === "failure") {
        opcoes.carregando?.(false);
        toast.error(result.data?.erro ?? "Não deu certo. Tente de novo.");
        return;
      }
      if (result.type === "error") {
        opcoes.carregando?.(false);
        toast.error(result.error?.message ?? "Erro inesperado. Tente de novo.");
        return;
      }
      if (result.type === "success") {
        opcoes.aoSucesso?.(result.data);
        if (opcoes.sucesso) toast.success(opcoes.sucesso);
      }

      await update({ reset: opcoes.limpar ?? true });
      opcoes.carregando?.(false);
    };
  };
}
