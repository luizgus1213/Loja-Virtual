import axios from "axios";

let configurado = false;

export function configurarAxiosAuthRedirect() {
  if (configurado) return;

  configurado = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const mensagem = error?.response?.data?.erro;

      if (
        status === 401 &&
        mensagem === "Não autenticado" &&
        typeof window !== "undefined"
      ) {
        const rotaAtual = window.location.pathname;

        if (!rotaAtual.startsWith("/auth")) {
          window.location.href = "/auth?modo=cadastro";
        }
      }

      return Promise.reject(error);
    },
  );
}
