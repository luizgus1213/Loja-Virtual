import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "./perfil.module.css";

interface User {
  id: number;
  nome: string;
  email: string;
  acesso?: string;
  foto_perfil?: {
    link: string;
  } | null;
}

export default function PerfilCentral() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregarUsuario() {
    try {
      setLoading(true);

      const res = await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      setUser(res.data);
    } catch {
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  }

  async function sair() {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      router.push("/auth");
    } catch {
      alert("Erro ao sair da conta");
    }
  }

  useEffect(() => {
    carregarUsuario();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando sua conta...</h1>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <h1>Usuário não encontrado</h1>

          <button type="button" onClick={() => router.push("/auth")}>
            Entrar novamente
          </button>
        </div>
      </main>
    );
  }

  const fotoPerfil = user.foto_perfil?.link ? `/${user.foto_perfil.link}` : "";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.avatarBox}>
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Foto de perfil" />
            ) : (
              <span>{user.nome?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>

          <div>
            <span>Minha conta</span>
            <h1>Olá, {user.nome}</h1>
            <p>{user.email}</p>

            {user.acesso === "admin" && (
              <strong className={styles.adminTag}>Administrador</strong>
            )}
          </div>
        </section>

        <section className={styles.grid}>
          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/perfil/informacoes")}
          >
            <strong>Informações pessoais</strong>
            <p>Nome, email, CPF, telefone e foto de perfil.</p>
          </button>

          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/enderecos")}
          >
            <strong>Endereços</strong>
            <p>Cadastre e edite seus endereços de entrega.</p>
          </button>
          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/perfil/cupons")}
          >
            <strong>Meus cupons</strong>
            <p>Veja descontos disponíveis para usar no checkout.</p>
          </button>
          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/historico")}
          >
            <strong>Meus pedidos</strong>
            <p>Acompanhe compras, pagamentos e entregas.</p>
          </button>

          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/favoritos")}
          >
            <strong>Favoritos</strong>
            <p>Veja os produtos que você salvou.</p>
          </button>

          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/carrinho")}
          >
            <strong>Carrinho</strong>
            <p>Continue sua compra e finalize seu pedido.</p>
          </button>

          <button
            type="button"
            className={styles.card}
            onClick={() => router.push("/perfil/configuracoes")}
          >
            <strong>Configurações</strong>
            <p>Tema, preferências e opções da conta.</p>
          </button>
          {user.acesso === "admin" && (
            <button
              type="button"
              className={styles.card}
              onClick={() => router.push("/admin/pedidos")}
            >
              <strong>Gerenciar pedidos</strong>
              <p>Altere status, acompanhe compras e pedidos dos clientes.</p>
            </button>
          )}
        </section>

        <button type="button" className={styles.botaoSair} onClick={sair}>
          Sair da conta
        </button>
      </div>
    </main>
  );
}
