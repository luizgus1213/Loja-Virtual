import { useRouter } from "next/router";
import styles from "./erroAcessoAdmin.module.css";

export default function ErroAcessoAdmin() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icone}>
          <svg viewBox="0 0 24 24">
            <path d="M12 2 3 6v6c0 5 3.8 9.7 9 10 5.2-.3 9-5 9-10V6l-9-4z" />
            <path d="M12 8v5" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        <span className={styles.tag}>Acesso negado</span>

        <h1>Você não tem permissão para acessar esta página</h1>

        <p>
          Essa área é exclusiva para administradores. Entre com uma conta admin
          ou volte para a página inicial.
        </p>

        <div className={styles.acoes}>
          <button type="button" onClick={() => router.push("/")}>
            Voltar para início
          </button>

          <button
            type="button"
            className={styles.secundario}
            onClick={() => router.push("/auth")}
          >
            Entrar com outra conta
          </button>
        </div>
      </section>
    </main>
  );
}
