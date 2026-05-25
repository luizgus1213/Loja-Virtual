import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./email.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
interface AuthMeResponse {
  email: string;
  email_pendente?: string | null;
}
export default function VerificarEmail() {
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");

  const { exibirAlerta } = useAlerta();

  const [visivel, setVisivel] = useState(false);

  async function carregarUsuario() {
    try {
      const res = await axios.get<AuthMeResponse>("/api/auth/me", {
        withCredentials: true,
      });

      setEmail(res.data.email_pendente || res.data.email);
    } catch {
      window.location.href = "/auth";
    }
  }

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function verificar() {
    try {
      await axios.post(
        "/api/user/confirmar-email",
        {
          codigo,
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
    }
  }

  async function reenviarCodigo() {
    try {
      await axios.post(
        "/api/user/reenviar-codigo",
        {},
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Código reenviado!", "sucesso");
    } catch (err: any) {
      exibirAlerta(err?.response?.data?.erro || "Erro", "erro");
    }
  }

  async function cancelarAlteracao() {
    try {
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
    }
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
        />

        <button className={styles.botao} onClick={verificar}>
          Verificar Código
        </button>

        <button className={styles.botao} onClick={reenviarCodigo}>
          Reenviar Código
        </button>

        <button className={styles.botao_cancelar} onClick={cancelarAlteracao}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
