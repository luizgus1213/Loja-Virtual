import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./email.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
import { useRouter } from "next/router";

interface AuthMeResponse {
  email: string;
  email_pendente?: string | null;
}

export default function VerificarEmail() {
  const router = useRouter();

  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const { exibirAlerta } = useAlerta();

  const emailDaUrl =
    typeof router.query.email === "string" ? router.query.email : "";

  const cadastroNovo = Boolean(emailDaUrl);

  async function carregarUsuario() {
    try {
      setCarregando(true);

      if (emailDaUrl) {
        setEmail(emailDaUrl);
        return;
      }

      const res = await axios.get<AuthMeResponse>("/api/auth/me", {
        withCredentials: true,
      });

      setEmail(res.data.email_pendente || res.data.email);
    } catch {
      exibirAlerta("Faça login para verificar seu email", "erro");

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;

    carregarUsuario();
  }, [router.isReady, emailDaUrl]);

  async function verificar() {
    try {
      const codigoLimpo = codigo.replace(/\D/g, "");

      if (codigoLimpo.length !== 6) {
        exibirAlerta("Digite o código de 6 números", "erro");
        return;
      }

      if (!email) {
        exibirAlerta("Email não encontrado para verificação", "erro");
        return;
      }

      setVerificando(true);

      if (cadastroNovo) {
        await axios.post("/api/auth/verificar-email", {
          email,
          codigo: codigoLimpo,
        });

        exibirAlerta("Email verificado! Agora faça login.", "sucesso");

        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);

        return;
      }

      await axios.post(
        "/api/user/confirmar-email",
        {
          codigo: codigoLimpo,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Email verificado!", "sucesso");

      setTimeout(() => {
        window.location.href = "/perfil";
      }, 1500);
    } catch (err: any) {
      exibirAlerta(err?.response?.data?.erro || "Erro ao verificar", "erro");
    } finally {
      setVerificando(false);
    }
  }

  async function reenviarCodigo() {
    try {
      setReenviando(true);

      if (cadastroNovo) {
        exibirAlerta(
          "Para cadastro novo, se precisar reenviar, volte e cadastre novamente.",
          "info",
        );

        return;
      }

      await axios.post(
        "/api/user/reenviar-codigo",
        {},
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Código reenviado!", "sucesso");
    } catch (err: any) {
      exibirAlerta(err?.response?.data?.erro || "Erro ao reenviar", "erro");
    } finally {
      setReenviando(false);
    }
  }

  async function cancelarAlteracao() {
    try {
      setCancelando(true);

      if (cadastroNovo) {
        window.location.href = "/auth?modo=cadastro";
        return;
      }

      await axios.post(
        "/api/user/cancelar-alteracao-email",
        {},
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Alteração cancelada!", "sucesso");

      setTimeout(() => {
        window.location.href = "/perfil";
      }, 1500);
    } catch (err: any) {
      exibirAlerta(err?.response?.data?.erro || "Erro ao cancelar", "erro");
    } finally {
      setCancelando(false);
    }
  }

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>LG</div>

          <h1 className={styles.titulo}>Carregando...</h1>

          <p className={styles.subtitulo}>
            Preparando a verificação do seu email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>LG</div>

        <h1 className={styles.titulo}>Verificar Email</h1>

        <p className={styles.subtitulo}>
          Código enviado para:
          <br />
          <span className={styles.email}>{email}</span>
        </p>

        <input
          className={styles.input}
          placeholder="000000"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              verificar();
            }
          }}
        />

        <button
          className={styles.botao}
          onClick={verificar}
          disabled={verificando}
        >
          {verificando ? "Verificando..." : "Verificar Código"}
        </button>

        <button
          className={styles.botao}
          onClick={reenviarCodigo}
          disabled={reenviando}
        >
          {reenviando ? "Reenviando..." : "Reenviar Código"}
        </button>

        <button
          className={styles.botao_cancelar}
          onClick={cancelarAlteracao}
          disabled={cancelando}
        >
          {cancelando ? "Cancelando..." : "Cancelar"}
        </button>
      </div>
    </div>
  );
}
