import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./auth.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
import { useRouter } from "next/router";

export default function Auth() {
  const router = useRouter();

  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const { exibirAlerta } = useAlerta();

  const [carregando, setCarregando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  useEffect(() => {
    if (router.query.modo === "cadastro") {
      setModo("cadastro");
    }
  }, [router.query.modo]);

  function emailValido(email: string) {
    const emailLimpo = email.trim();

    if (!emailLimpo.includes("@")) {
      return false;
    }

    if (!emailLimpo.includes(".")) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo);
  }

  async function enviar() {
    try {
      const emailLimpo = form.email.trim().toLowerCase();
      const senhaLimpa = form.senha.trim();
      const nomeLimpo = form.nome.trim();

      if (!emailLimpo || !senhaLimpa) {
        exibirAlerta("Preencha email e senha", "erro");
        return;
      }

      if (!emailValido(emailLimpo)) {
        exibirAlerta(
          "Digite um email válido com @. Exemplo: nome@gmail.com",
          "erro",
        );
        return;
      }

      if (modo === "cadastro" && !nomeLimpo) {
        exibirAlerta("Preencha seu nome", "erro");
        return;
      }

      if (modo === "cadastro" && nomeLimpo.length < 3) {
        exibirAlerta("O nome precisa ter pelo menos 3 letras", "erro");
        return;
      }

      if (senhaLimpa.length < 6) {
        exibirAlerta("A senha precisa ter pelo menos 6 caracteres", "erro");
        return;
      }

      setCarregando(true);

      if (modo === "login") {
        await axios.post(
          "/api/auth/login",
          {
            email: emailLimpo,
            senha: form.senha,
          },
          {
            withCredentials: true,
          },
        );

        exibirAlerta("Login realizado com sucesso!", "sucesso");

        setTimeout(() => {
          window.location.href = "/";
        }, 700);

        return;
      }

      await axios.post(
        "/api/auth/registrar",
        {
          nome: nomeLimpo,
          email: emailLimpo,
          senha: form.senha,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Código enviado para seu email!", "sucesso");

      setTimeout(() => {
        window.location.href =
          "/verificar-email?email=" + encodeURIComponent(emailLimpo);
      }, 900);
    } catch (err: any) {
      exibirAlerta(err?.response?.data?.erro || "Erro ao autenticar", "erro");
    } finally {
      setCarregando(false);
    }
  }

  function trocarModo() {
    setModo(modo === "login" ? "cadastro" : "login");

    setForm({
      nome: "",
      email: "",
      senha: "",
    });
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>LG</div>

        <h1 className={styles.titulo}>
          {modo === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <p className={styles.subtitulo}>
          {modo === "login"
            ? "Acesse sua conta para comprar, favoritar e acompanhar seus pedidos."
            : "Crie sua conta para comprar com mais segurança na LG Trambicagens."}
        </p>

        <div className={styles.abas}>
          <button
            type="button"
            className={`${styles.aba} ${
              modo === "login" ? styles.abaAtiva : ""
            }`}
            onClick={() => setModo("login")}
          >
            Entrar
          </button>

          <button
            type="button"
            className={`${styles.aba} ${
              modo === "cadastro" ? styles.abaAtiva : ""
            }`}
            onClick={() => setModo("cadastro")}
          >
            Cadastrar
          </button>
        </div>

        <div className={styles.form}>
          {modo === "cadastro" && (
            <div className={styles.campo}>
              <label>Nome</label>

              <input
                className={styles.input}
                type="text"
                placeholder="Digite seu nome"
                value={form.nome}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nome: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div className={styles.campo}>
            <label>Email</label>

            <input
              className={styles.input}
              type="email"
              placeholder="Digite seu email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.campo}>
            <label>Senha</label>

            <input
              className={styles.input}
              type="password"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={(e) =>
                setForm({
                  ...form,
                  senha: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  enviar();
                }
              }}
            />
          </div>

          <button
            type="button"
            className={styles.botao}
            onClick={enviar}
            disabled={carregando}
          >
            {carregando
              ? modo === "login"
                ? "Entrando..."
                : "Cadastrando..."
              : modo === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </div>

        <div className={styles.divisor}>ou</div>

        <p className={styles.textoRodape}>
          {modo === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button type="button" onClick={trocarModo}>
            {modo === "login" ? "Criar agora" : "Entrar"}
          </button>
        </p>
      </div>
    </main>
  );
}
