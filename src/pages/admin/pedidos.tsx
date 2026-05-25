import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./styles.module.css";

interface PedidoItemAdmin {
  id: number;
  quantidade: number;

  produto?: {
    id: number;
    nome: string;

    imagem?: {
      link: string;
    } | null;

    capa?: {
      link: string;
    } | null;
  };
}
interface AlterarStatusResponse {
  pedido?: Partial<Pedido>;
}
interface Pedido {
  id: number;
  total: number;
  total_produtos?: number;
  frete_valor?: number;
  frete_tipo?: "normal" | "expresso" | null;
  endereco_id?: number | null;
  status: string;
  createdAt: string;

  user?: {
    id: number;
    nome: string;
    email: string;
  };

  itens?: PedidoItemAdmin[];

  logsStatus?: {
    id: number;
    status_anterior: string;
    status_novo: string;
    observacao?: string | null;
    createdAt: string;
  }[];
}

const statusEntrega = ["pago", "preparando", "enviado", "entregue"];

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function formatarStatus(status: string) {
  const nomes: any = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pago",
    preparando: "Preparando",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
    expirado: "Expirado",
    processando_pix: "Processando PIX",
  };

  return nomes[status] || status;
}

function proximoStatus(status: string) {
  if (status === "pago") return "preparando";
  if (status === "preparando") return "enviado";
  if (status === "enviado") return "entregue";

  return null;
}

function imagemProduto(item: PedidoItemAdmin) {
  return (
    item.produto?.imagem?.link || item.produto?.capa?.link || "sem-imagem.png"
  );
}

export default function AdminPedidos() {
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [alterandoId, setAlterandoId] = useState<number | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  async function carregarPedidos() {
    try {
      setLoading(true);

      const res = await axios.get<Pedido[]>("/api/admin/pedidos/listar", {
        withCredentials: true,
      });

      setPedidos(res.data || []);
    } catch (err: any) {
      console.log("ERRO AO CARREGAR PEDIDOS:", err?.response?.data || err);

      alert(err?.response?.data?.erro || "Erro ao carregar pedidos");

      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function alterarStatusPedido(pedidoId: number, status: string) {
    try {
      const confirmar = confirm(
        `Deseja alterar o status para "${formatarStatus(status)}"?`,
      );

      if (!confirmar) return;

      setAlterandoId(pedidoId);

      const res = await axios.put<AlterarStatusResponse>(
        "/api/admin/pedidos/alterar-status",
        {
          pedidoId,
          status,
          observacao:
            "Status alterado por um senhor lutando ao som de uma gaita sonfonistica",
        },
        {
          withCredentials: true,
        },
      );

      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === pedidoId
            ? {
                ...pedido,
                status,
                ...(res.data?.pedido || {}),
              }
            : pedido,
        ),
      );

      await carregarPedidos();
    } catch (err: any) {
      console.log("ERRO AO ALTERAR STATUS:", err?.response?.data || err);

      alert(err?.response?.data?.erro || "Erro ao alterar status");
    } finally {
      setAlterandoId(null);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const texto = busca.toLowerCase().trim();

      const bateBusca =
        !texto ||
        String(pedido.id).includes(texto) ||
        pedido.user?.nome?.toLowerCase().includes(texto) ||
        pedido.user?.email?.toLowerCase().includes(texto) ||
        pedido.itens?.some((item) =>
          item.produto?.nome?.toLowerCase().includes(texto),
        );

      const bateStatus =
        filtroStatus === "todos" || pedido.status === filtroStatus;

      return bateBusca && bateStatus;
    });
  }, [pedidos, busca, filtroStatus]);

  const resumo = useMemo(() => {
    return {
      todos: pedidos.length,
      pendentes: pedidos.filter((p) => p.status === "aguardando_pagamento")
        .length,
      pagos: pedidos.filter((p) => p.status === "pago").length,
      preparando: pedidos.filter((p) => p.status === "preparando").length,
      enviados: pedidos.filter((p) => p.status === "enviado").length,
      entregues: pedidos.filter((p) => p.status === "entregue").length,
    };
  }, [pedidos]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando pedidos...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.voltar}
            onClick={() => router.push("/admin")}
          >
            ← Voltar
          </button>

          <div className={styles.headerTexto}>
            <span className={styles.tagAdmin}>Admin</span>
            <h1>Painel de pedidos</h1>
            <p>Gerencie pagamentos, preparo, envio e entrega dos pedidos.</p>
          </div>

          <button
            type="button"
            className={styles.atualizar}
            onClick={carregarPedidos}
          >
            Atualizar
          </button>
        </header>

        <section className={styles.resumoGrid}>
          <button
            type="button"
            className={`${styles.resumoCard} ${
              filtroStatus === "todos" ? styles.resumoAtivo : ""
            }`}
            onClick={() => setFiltroStatus("todos")}
          >
            <span>Todos</span>
            <strong>{resumo.todos}</strong>
          </button>

          <button
            type="button"
            className={`${styles.resumoCard} ${
              filtroStatus === "aguardando_pagamento" ? styles.resumoAtivo : ""
            }`}
            onClick={() => setFiltroStatus("aguardando_pagamento")}
          >
            <span>Pendentes</span>
            <strong>{resumo.pendentes}</strong>
          </button>

          <button
            type="button"
            className={`${styles.resumoCard} ${
              filtroStatus === "pago" ? styles.resumoAtivo : ""
            }`}
            onClick={() => setFiltroStatus("pago")}
          >
            <span>Pagos</span>
            <strong>{resumo.pagos}</strong>
          </button>

          <button
            type="button"
            className={`${styles.resumoCard} ${
              filtroStatus === "preparando" ? styles.resumoAtivo : ""
            }`}
            onClick={() => setFiltroStatus("preparando")}
          >
            <span>Preparando</span>
            <strong>{resumo.preparando}</strong>
          </button>

          <button
            type="button"
            className={`${styles.resumoCard} ${
              filtroStatus === "enviado" ? styles.resumoAtivo : ""
            }`}
            onClick={() => setFiltroStatus("enviado")}
          >
            <span>Enviados</span>
            <strong>{resumo.enviados}</strong>
          </button>

          <button
            type="button"
            className={`${styles.resumoCard} ${
              filtroStatus === "entregue" ? styles.resumoAtivo : ""
            }`}
            onClick={() => setFiltroStatus("entregue")}
          >
            <span>Entregues</span>
            <strong>{resumo.entregues}</strong>
          </button>
        </section>

        <section className={styles.filtros}>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por pedido, cliente, email ou produto..."
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="aguardando_pagamento">Aguardando pagamento</option>
            <option value="pago">Pago</option>
            <option value="preparando">Preparando</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
            <option value="expirado">Expirado</option>
          </select>
        </section>

        {pedidosFiltrados.length === 0 ? (
          <div className={styles.vazio}>
            <h2>Nenhum pedido encontrado</h2>
            <p>Tente mudar o filtro ou pesquisar outro termo.</p>
          </div>
        ) : (
          <section className={styles.lista}>
            {pedidosFiltrados.map((pedido) => {
              const primeiroItem = pedido.itens?.[0];

              const totalItens =
                pedido.itens?.reduce(
                  (acc, item) => acc + Number(item.quantidade || 0),
                  0,
                ) || 0;

              const prox = proximoStatus(pedido.status);

              const podeAlterarStatus =
                pedido.status !== "aguardando_pagamento" &&
                pedido.status !== "expirado" &&
                pedido.status !== "cancelado" &&
                pedido.status !== "entregue";

              return (
                <article key={pedido.id} className={styles.card}>
                  <div className={styles.areaStatus}>
                    <label>Status do pedido</label>

                    <select
                      value={pedido.status}
                      onChange={(e) =>
                        alterarStatusPedido(pedido.id, e.target.value)
                      }
                      disabled={alterandoId === pedido.id}
                    >
                      <option value="aguardando_pagamento">
                        Aguardando pagamento
                      </option>
                      <option value="pago">Pago</option>
                      <option value="preparando">Preparando</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className={styles.cardTopo}>
                    <div className={styles.identificacao}>
                      <div className={styles.imagensPedido}>
                        {(pedido.itens || []).slice(0, 3).map((item) => (
                          <div key={item.id} className={styles.imagemMini}>
                            <img
                              src={`/${imagemProduto(item)}`}
                              alt={item.produto?.nome || "Produto"}
                            />
                          </div>
                        ))}

                        {(pedido.itens || []).length > 3 && (
                          <div className={styles.maisItens}>
                            +{(pedido.itens || []).length - 3}
                          </div>
                        )}
                      </div>

                      <div>
                        <h2>Pedido #{pedido.id}</h2>

                        <p>
                          {primeiroItem?.produto?.nome || "Produto"}{" "}
                          {pedido.itens && pedido.itens.length > 1
                            ? `+ ${pedido.itens.length - 1} item(ns)`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`${styles.status} ${
                        styles[`status_${pedido.status}`] || ""
                      }`}
                    >
                      {formatarStatus(pedido.status)}
                    </span>
                  </div>

                  <div className={styles.infoGrid}>
                    <div className={styles.infoBox}>
                      <span>Cliente</span>
                      <strong>{pedido.user?.nome || "Sem nome"}</strong>
                      <small>{pedido.user?.email || "Sem email"}</small>
                    </div>

                    <div className={styles.infoBox}>
                      <span>Data</span>
                      <strong>
                        {new Date(pedido.createdAt).toLocaleDateString("pt-BR")}
                      </strong>
                      <small>
                        {new Date(pedido.createdAt).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </small>
                    </div>

                    <div className={styles.infoBox}>
                      <span>Produtos</span>
                      <strong>
                        {formatarMoeda(pedido.total_produtos || 0)}
                      </strong>
                      <small>{totalItens} unidade(s)</small>
                    </div>

                    <div className={styles.infoBox}>
                      <span>Frete</span>
                      <strong>
                        {pedido.frete_tipo
                          ? pedido.frete_tipo === "normal"
                            ? "Normal"
                            : "Expresso"
                          : "Não definido"}
                      </strong>
                      <small>{formatarMoeda(pedido.frete_valor || 0)}</small>
                    </div>

                    <div className={styles.infoBoxDestaque}>
                      <span>Total final</span>
                      <strong>{formatarMoeda(pedido.total)}</strong>
                    </div>
                  </div>

                  <div className={styles.produtosArea}>
                    <div className={styles.subtituloArea}>
                      <strong>Produtos do pedido</strong>
                      <span>{totalItens} unidade(s)</span>
                    </div>

                    <div className={styles.produtos}>
                      {(pedido.itens || []).map((item) => (
                        <div key={item.id} className={styles.produtoLinha}>
                          <img
                            src={`/${imagemProduto(item)}`}
                            alt={item.produto?.nome || "Produto"}
                          />

                          <div>
                            <strong>{item.produto?.nome || "Produto"}</strong>
                            <span>Quantidade: {item.quantidade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {pedido.logsStatus && pedido.logsStatus.length > 0 && (
                    <div className={styles.logsBox}>
                      <div className={styles.logsHeader}>
                        <strong>Histórico de status</strong>
                        <span>{pedido.logsStatus.length} alteração(ões)</span>
                      </div>

                      <div className={styles.logsLista}>
                        {pedido.logsStatus.map((log) => (
                          <div key={log.id} className={styles.logItem}>
                            <div className={styles.logPonto} />

                            <div>
                              <p>
                                <strong>
                                  {formatarStatus(log.status_anterior)}
                                </strong>{" "}
                                →{" "}
                                <strong>
                                  {formatarStatus(log.status_novo)}
                                </strong>
                              </p>

                              <small>
                                {new Date(log.createdAt).toLocaleString(
                                  "pt-BR",
                                )}
                              </small>

                              {log.observacao && <em>{log.observacao}</em>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.acoes}>
                    <button
                      type="button"
                      className={styles.botaoDetalhes}
                      onClick={() => router.push(`/pedido/${pedido.id}`)}
                    >
                      Ver detalhes
                    </button>

                    {prox && podeAlterarStatus && (
                      <button
                        type="button"
                        className={styles.botaoProximo}
                        onClick={() => alterarStatusPedido(pedido.id, prox)}
                        disabled={alterandoId === pedido.id}
                      >
                        {alterandoId === pedido.id
                          ? "Atualizando..."
                          : `Mover para ${formatarStatus(prox)}`}
                      </button>
                    )}

                    <div className={styles.statusManual}>
                      {statusEntrega.map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => alterarStatusPedido(pedido.id, status)}
                          disabled={
                            pedido.status === status ||
                            alterandoId === pedido.id ||
                            !podeAlterarStatus
                          }
                        >
                          {formatarStatus(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
