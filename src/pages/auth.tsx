import { useState } from "react";
import axios from "axios";
import styles from "./auth.module.css";

export default function Auth() {
  const [modo, setModo] = useState<"login" | "cadastro">("login");

  const [codigo, setCodigo] = useState("");

  const [verificando, setVerificando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const enviar = async () => {
    console.log("ENVIANDO:", form);

    if (!form.email || !form.senha) {
      return alert("Preencha tudo");
    }

    try {
      if (modo === "login") {
        try {
          await axios.post("/api/auth/login", form);

          window.location.href = "/";
        } catch (err: any) {
          alert("Erro de autenticação");

          alert(err?.response?.data?.erro);
        }
      } else {
        await axios.post("/api/auth/registrar", form);

        alert("Código enviado para seu email!");

        window.location.href = "/verificar-email?email=" + form.email;
      }
    } catch (err: any) {
      console.log(err.response);

      alert(err.response?.data?.erro || "Erro no login");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>{modo === "login" ? "Entrar" : "Criar Conta"}</h1>

        {modo === "cadastro" && (
          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) =>
              setForm({
                ...form,
                nome: e.target.value,
              })
            }
          />
        )}

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={(e) =>
            setForm({
              ...form,
              senha: e.target.value,
            })
          }
        />

        {!verificando ? (
          <button onClick={enviar}>
            {modo === "login" ? "Entrar" : "Cadastrar"}
          </button>
        ) : (
          <>
            <input
              placeholder="Código enviado no email"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />

            <button
              onClick={async () => {
                try {
                  await axios.post("/api/auth/verificar-email", {
                    email: form.email,
                    codigo,
                  });

                  alert("Email verificado!");

                  setVerificando(false);

                  setModo("login");
                } catch (err: any) {
                  alert(err?.response?.data?.erro || "Código inválido");
                }
              }}
            >
              Verificar Email
            </button>
          </>
        )}

        <p onClick={() => setModo(modo === "login" ? "cadastro" : "login")}>
          {modo === "login"
            ? "Não tem conta? Criar agora"
            : "Já tem conta? Entrar"}
        </p>
      </div>
    </div>
  );
}
