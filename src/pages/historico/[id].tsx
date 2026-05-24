import { GetServerSideProps } from "next";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./detalhes.module.css";

interface Item {
  id: number;
  quantidade: number;
  preco?: number;
  preco_unitario: number;
  cor?: string;
  tamanho?: string | null;

  produto?: {
    id: number;
    nome: string;

    imagem?: {
      link: string;
    };
  };
}

interface Pedido {
  id: number;
  total: number;
  status: string;
  createdAt: string;

  total_produtos?: number;
  frete_valor?: number;
  desconto_valor?: number;

  cupom?: {
    id: number;
    codigo: string;
    tipo: string;
    valor: number;
  } | null;

  itens: Item[];
}

interface Props {
  pedido: Pedido | null;
}

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

export default function PedidoDetalhes({ pedido }: Props) {
  const router = useRouter();

  if (!pedido) {
    return (
      <div className={styles.naoEncontrado}>
        <h1>Pedido não encontrado</h1>

        <button type="button" onClick={() => router.push("/historico")}>
          Voltar para histórico
        </button>
      </div>
    );
  }

  const totalProdutos = Number(pedido.total_produtos || pedido.total || 0);
  const freteValor = Number(pedido.frete_valor || 0);
  const descontoValor = Number(pedido.desconto_valor || 0);
  const totalFinal = Number(pedido.total || 0);

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={() => router.push("/historico")}
        className={styles.botaoVoltar}
      >
        ← Voltar
      </button>

      <section className={styles.cardResumo}>
        <div className={styles.topoPedido}>
          <div>
            <h1>Pedido #{pedido.id}</h1>
            <p>{new Date(pedido.createdAt).toLocaleString("pt-BR")}</p>
          </div>

          <span
            className={`${styles.status} ${
              styles[`status_${pedido.status}`] || ""
            }`}
          >
            {formatarStatus(pedido.status)}
          </span>
        </div>

        <hr />

        <div className={styles.resumoGrid}>
          <div className={styles.resumoItem}>
            <span>Total produtos</span>
            <strong>{formatarMoeda(totalProdutos)}</strong>
          </div>

          <div className={styles.resumoItem}>
            <span>Frete</span>
            <strong>{formatarMoeda(freteValor)}</strong>
          </div>

          <div
            className={`${styles.resumoItem} ${
              descontoValor > 0 ? styles.resumoDesconto : ""
            }`}
          >
            <span>Desconto</span>
            <strong>- {formatarMoeda(descontoValor)}</strong>
          </div>

          <div className={styles.resumoTotal}>
            <span>Total final</span>
            <strong>{formatarMoeda(totalFinal)}</strong>
          </div>
        </div>

        {pedido.cupom && (
          <div className={styles.cupomBox}>
            <strong>Cupom usado:</strong> <span>{pedido.cupom.codigo}</span>
            <p>
              Tipo: {pedido.cupom.tipo} | Valor:{" "}
              {pedido.cupom.tipo === "percentual"
                ? `${pedido.cupom.valor}%`
                : formatarMoeda(pedido.cupom.valor)}
            </p>
          </div>
        )}
      </section>

      <h2 className={styles.tituloItens}>Itens do pedido</h2>

      <div className={styles.listaItens}>
        {pedido.itens.map((item) => {
          const imagem = item.produto?.imagem?.link || "sem-imagem.png";
          const subtotal = Number(item.preco_unitario || 0) * item.quantidade;

          return (
            <article key={item.id} className={styles.itemCard}>
              <img
                src={`/${imagem}`}
                alt={item.produto?.nome || "Produto"}
                className={styles.itemImagem}
              />

              <div className={styles.itemInfo}>
                <h2>{item.produto?.nome || "Produto"}</h2>

                <p>
                  <strong>Quantidade:</strong> {item.quantidade}
                </p>

                {item.cor && (
                  <p>
                    <strong>Cor:</strong> {item.cor}
                  </p>
                )}

                {item.tamanho && (
                  <p>
                    <strong>Tamanho:</strong> {item.tamanho}
                  </p>
                )}

                <p>
                  <strong>Preço unitário:</strong>{" "}
                  {formatarMoeda(item.preco_unitario)}
                </p>

                <p>
                  <strong>Subtotal:</strong> {formatarMoeda(subtotal)}
                </p>

                <div className={styles.botoesItem}>
                  {pedido.status === "entregue" && (
                    <button
                      type="button"
                      className={styles.botaoAvaliar}
                      onClick={() => {
                        router.push(`/produto/${item.produto?.id}`);
                      }}
                    >
                      Avaliar produto
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.botaoProduto}
                    onClick={() => {
                      router.push(`/produto/${item.produto?.id}`);
                    }}
                  >
                    Ver produto
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { id } = ctx.query;

    const protocolo = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = ctx.req.headers.host;

    const res = await axios.get(`${protocolo}://${host}/api/historico/${id}`, {
      headers: {
        cookie: ctx.req.headers.cookie || "",
      },
    });

    return {
      props: {
        pedido: res.data,
      },
    };
  } catch {
    return {
      props: {
        pedido: null,
      },
    };
  }
};
