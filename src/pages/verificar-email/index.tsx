import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./email.module.css";

export default function VerificarEmail() {
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");

  async function carregarUsuario() {
    try {
      const res = await axios.get("/api/auth/me", {
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

      alert("Email verificado!");

      window.location.href = "/perfil";
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao verificar");
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

      alert("Código reenviado!");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro");
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

      alert("Alteração cancelada!");

      window.location.href = "/perfil";
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao cancelar");
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
