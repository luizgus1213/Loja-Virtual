import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { useAlerta } from "@/contexts/AlertaContext";

interface Pedido {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  expiresAt?: string | null;

  itens?: {
    id: number;
    quantidade: number;
    produto?: {
      id: number;
      nome: string;
      imagem?: {
        link: string;
      } | null;
    };
  }[];
}
export default function Historico() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<
    "todos" | "pendentes" | "pagos" | "preparando" | "enviados" | "entregues"
  >("todos");
  const { exibirAlerta } = useAlerta();
  const router = useRouter();

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const res = await axios.get("/api/historico/listar", {
        withCredentials: true,
      });

      setPedidos(res.data);
    } catch (err) {
      console.log(err);
      exibirAlerta("Erro ao carregar histórico", "erro");
    } finally {
      setLoading(false);
    }
  };

  const todos = pedidos;

  const pendentes = useMemo(() => {
    return pedidos.filter((pedido) => pedido.status === "aguardando_pagamento");
  }, [pedidos]);

  const pagos = useMemo(() => {
    return pedidos.filter((pedido) => pedido.status === "pago");
  }, [pedidos]);

  const preparando = useMemo(() => {
    return pedidos.filter((pedido) => pedido.status === "preparando");
  }, [pedidos]);

  const enviados = useMemo(() => {
    return pedidos.filter((pedido) => pedido.status === "enviado");
  }, [pedidos]);

  const entregues = useMemo(() => {
    return pedidos.filter((pedido) => pedido.status === "entregue");
  }, [pedidos]);

  async function cancelarPedido(pedidoId: number) {
    try {
      const confirmar = confirm("Tem certeza que deseja cancelar este pedido?");

      if (!confirmar) return;

      await axios.post(
        "/api/pedido/cancelar",
        {
          pedidoId,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Pedido cancelado!", "sucesso");

      carregarHistorico();
    } catch (err: any) {
      exibirAlerta(
        err?.response?.data?.erro || "Erro ao cancelar pedido",
        "erro",
      );
    }
  }

  async function comprarNovamente(pedidoId: number) {
    try {
      const res = await axios.post(
        "/api/pedido/comprar-novamente",
        {
          pedidoId,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Novo pedido criado!", "sucesso");

      router.push(`/pedido/${res.data.pedidoId}`);
    } catch (err: any) {
      exibirAlerta(
        err?.response?.data?.erro || "Erro ao comprar novamente",
        "erro",
      );
    }
  }

  if (loading) {
    return <h1>Carregando...</h1>;
  }

  const listaAtual =
    aba === "todos"
      ? todos
      : aba === "pendentes"
        ? pendentes
        : aba === "pagos"
          ? pagos
          : aba === "preparando"
            ? preparando
            : aba === "enviados"
              ? enviados
              : entregues;
  return (
    <div className={styles.container}>
      <button className={styles.botaoVoltar} onClick={() => router.push("/")}>
        <ArrowLeft size={20} />
        Voltar
      </button>

      <h1 className={styles.titulo}>Histórico de Compras</h1>

      <div className={styles.abas}>
        <button
          className={aba === "todos" ? styles.abaAtiva : ""}
          onClick={() => setAba("todos")}
          type="button"
        >
          Todos <span>{todos.length}</span>
        </button>

        <button
          className={aba === "pendentes" ? styles.abaAtiva : ""}
          onClick={() => setAba("pendentes")}
          type="button"
        >
          Pendentes <span>{pendentes.length}</span>
        </button>

        <button
          className={aba === "pagos" ? styles.abaAtiva : ""}
          onClick={() => setAba("pagos")}
          type="button"
        >
          Pagos <span>{pagos.length}</span>
        </button>

        <button
          className={aba === "preparando" ? styles.abaAtiva : ""}
          onClick={() => setAba("preparando")}
          type="button"
        >
          Preparando <span>{preparando.length}</span>
        </button>

        <button
          className={aba === "enviados" ? styles.abaAtiva : ""}
          onClick={() => setAba("enviados")}
          type="button"
        >
          Enviados <span>{enviados.length}</span>
        </button>

        <button
          className={aba === "entregues" ? styles.abaAtiva : ""}
          onClick={() => setAba("entregues")}
          type="button"
        >
          Entregues <span>{entregues.length}</span>
        </button>
      </div>
      {listaAtual.length === 0 && (
        <div className={styles.vazio}>
          {aba === "todos" && "Você ainda não tem pedidos."}
          {aba === "pendentes" && "Você não tem pedidos pendentes."}
          {aba === "pagos" && "Você ainda não tem pedidos pagos."}
          {aba === "preparando" && "Nenhum pedido em preparação."}
          {aba === "enviados" && "Nenhum pedido enviado."}
          {aba === "entregues" && "Nenhum pedido entregue."}
        </div>
      )}

      <div className={styles.lista}>
        {listaAtual.map((pedido) => (
          <div className={styles.card} key={pedido.id}>
            <div
              className={styles.areaCliqueCard}
              onClick={() => {
                if (pedido.status === "aguardando_pagamento") {
                  router.push(`/pedido/${pedido.id}`);
                  return;
                }

                router.push(`/pedido/${pedido.id}`);
              }}
            >
              <div className={styles.topo}>
                <div className={styles.resumoPedidoTopo}>
                  <div className={styles.imagensPedidoPequenas}>
                    {(pedido.itens || []).slice(0, 3).map((item) => (
                      <div key={item.id} className={styles.imagemPedidoPequena}>
                        <img
                          src={`/${item.produto?.imagem?.link || "sem-imagem.png"}`}
                          alt={item.produto?.nome || "Produto"}
                          loading="lazy"
                        />

                        {item.quantidade > 1 && (
                          <span className={styles.quantidadeMini}>
                            x{item.quantidade}
                          </span>
                        )}
                      </div>
                    ))}

                    {(pedido.itens || []).length > 3 && (
                      <div className={styles.maisProdutosMini}>
                        +{(pedido.itens || []).length - 3}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className={styles.numero}>Pedido #{pedido.id}</span>

                    <p className={styles.resumoPedidoTexto}>
                      {(pedido.itens || []).length} produto
                      {(pedido.itens || []).length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <span
                  className={
                    pedido.status === "aguardando_pagamento"
                      ? styles.statusPendente
                      : styles.statusPago
                  }
                >
                  {pedido.status === "aguardando_pagamento"
                    ? "Aguardando pagamento"
                    : pedido.status === "pago"
                      ? "Pago"
                      : pedido.status === "preparando"
                        ? "Preparando"
                        : pedido.status === "enviado"
                          ? "Enviado"
                          : pedido.status === "entregue"
                            ? "Entregue"
                            : pedido.status}
                </span>
              </div>

              <div className={styles.info}>
                <strong>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(pedido.total)}
                </strong>

                <span>
                  {new Date(pedido.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {pedido.status === "aguardando_pagamento" && pedido.expiresAt && (
                <p className={styles.expiraEm}>
                  Expira em {new Date(pedido.expiresAt).toLocaleString("pt-BR")}
                </p>
              )}
            </div>

            {pedido.status === "aguardando_pagamento" && (
              <div className={styles.acoesPedido}>
                <button
                  className={styles.botaoPagar}
                  onClick={() => router.push(`/pedido/${pedido.id}`)}
                  type="button"
                >
                  Pagar agora
                </button>

                <button
                  className={styles.botaoCancelar}
                  onClick={() => cancelarPedido(pedido.id)}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            )}

            {["pago", "preparando", "enviado", "entregue"].includes(
              pedido.status,
            ) && (
              <div className={styles.acoesPedido}>
                <button
                  className={styles.botaoVer}
                  onClick={() => router.push(`/pedido/${pedido.id}`)}
                  type="button"
                >
                  Ver compra
                </button>

                <button
                  className={styles.botaoComprarNovamente}
                  onClick={() => comprarNovamente(pedido.id)}
                  type="button"
                >
                  Comprar de novo
                </button>

                <button
                  className={styles.botaoAvaliar}
                  onClick={() => router.push(`/pedido/${pedido.id}`)}
                  type="button"
                >
                  Avaliar produtos
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
