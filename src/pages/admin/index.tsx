import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./paginaCentralAdmin.module.css";

interface PaginaCentral {
  totalUsuarios: number;
  totalProdutos: number;
  totalPedidos: number;
  pedidosAguardando: number;
  pedidosPagos: number;
  pedidosPreparando: number;
  pedidosEnviados: number;
  pedidosEntregues: number;
  cuponsAtivos: number;
  notificacoesTotal: number;
  notificacoesNaoLidas: number;
  faturamentoTotal: number;
}

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

export default function AdminDashboard() {
  const router = useRouter();

  const [dados, setDados] = useState<PaginaCentral | null>(null);
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  async function carregarPaginaCentral() {
    try {
      setLoading(true);
      setAutorizado(false);

      const res = await axios.get<PaginaCentral>(
        "/api/admin/PaginaCentralAdmin",
        {
          withCredentials: true,
        },
      );

      setDados(res.data);
      setAutorizado(true);
    } catch (err: any) {
      setAutorizado(false);
      alert(err?.response?.data?.erro || "Acesso negado");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPaginaCentral();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando painel admin...</h1>
        </div>
      </main>
    );
  }

  if (!autorizado || !dados) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => router.push("/")}
        >
          ← Voltar para loja
        </button>

        <header className={styles.header}>
          <span>Painel administrativo</span>
          <h1>Pagina Central</h1>
          <p>Resumo geral da loja, pedidos, cupons e notificações.</p>
        </header>

        <section className={styles.cardsPrincipais}>
          <article className={styles.cardDestaque}>
            <span>Faturamento</span>
            <strong>{moeda(dados.faturamentoTotal)}</strong>
            <p>Total de pedidos pagos, preparando, enviados ou entregues.</p>
          </article>

          <article className={styles.cardDestaque}>
            <span>Pedidos</span>
            <strong>{dados.totalPedidos}</strong>
            <p>Total de pedidos criados na loja.</p>
          </article>

          <article className={styles.cardDestaque}>
            <span>Produtos</span>
            <strong>{dados.totalProdutos}</strong>
            <p>Produtos cadastrados no catálogo.</p>
          </article>

          <article className={styles.cardDestaque}>
            <span>Usuários</span>
            <strong>{dados.totalUsuarios}</strong>
            <p>Contas cadastradas na plataforma.</p>
          </article>
        </section>

        <section className={styles.layout}>
          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <div>
                <span>Pedidos</span>
                <h2>Status dos pedidos</h2>
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin/pedidos")}
              >
                Gerenciar
              </button>
            </div>

            <div className={styles.statusGrid}>
              <div>
                <span>Aguardando</span>
                <strong>{dados.pedidosAguardando}</strong>
              </div>

              <div>
                <span>Pagos</span>
                <strong>{dados.pedidosPagos}</strong>
              </div>

              <div>
                <span>Preparando</span>
                <strong>{dados.pedidosPreparando}</strong>
              </div>

              <div>
                <span>Enviados</span>
                <strong>{dados.pedidosEnviados}</strong>
              </div>

              <div>
                <span>Entregues</span>
                <strong>{dados.pedidosEntregues}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <div>
                <span>Cupons</span>
                <h2>Cupons ativos</h2>
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin/cupons")}
              >
                Gerenciar
              </button>
            </div>

            <div className={styles.numeroGrande}>
              <strong>{dados.cuponsAtivos}</strong>
              <p>Cupons ativos disponíveis para clientes.</p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <div>
                <span>Notificações</span>
                <h2>Avisos da loja</h2>
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin/notificacoes")}
              >
                Enviar
              </button>
            </div>

            <div className={styles.statusGrid}>
              <div>
                <span>Total</span>
                <strong>{dados.notificacoesTotal}</strong>
              </div>

              <div>
                <span>Não lidas</span>
                <strong>{dados.notificacoesNaoLidas}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <div>
                <span>Ações rápidas</span>
                <h2>Atalhos</h2>
              </div>
            </div>

            <div className={styles.atalhos}>
              <button
                type="button"
                onClick={() => router.push("/admin/pedidos")}
              >
                Gerenciar pedidos
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/cupons")}
              >
                Gerenciar cupons
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/notificacoes")}
              >
                Enviar notificações
              </button>

              <button type="button" onClick={() => router.push("/admin")}>
                Atualizar painel
              </button>

              <button type="button" onClick={() => router.push("/")}>
                Ver loja
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
