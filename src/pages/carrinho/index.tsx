import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./style.module.css";
interface CarrinhoResponse {
  itens?: CarrinhoItem[];
}
interface Produto {
  id: number;
  nome: string;
  marca?: string;
  categoria?: string;
  preco: number;
  estoque: number;
  estoque_reservado?: number;

  imagem?: {
    link: string;
  };

  capa?: {
    link: string;
  };
}

interface CarrinhoItem {
  id: number;
  quantidade: number;
  cor?: string;
  tamanho?: string | null;
  produto?: Produto;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function obterImagemProduto(produto?: Produto) {
  return produto?.imagem?.link || produto?.capa?.link || "sem-imagem.png";
}

function calcularDisponivel(produto?: Produto) {
  return (
    Number(produto?.estoque || 0) - Number(produto?.estoque_reservado || 0)
  );
}

export default function CarrinhoPage() {
  const router = useRouter();

  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  const itensSelecionados = useMemo(() => {
    return itens.filter((item) => selecionados.includes(item.id));
  }, [itens, selecionados]);

  const totalProdutos = useMemo(() => {
    return itensSelecionados.reduce((acc, item) => {
      const preco = Number(item.produto?.preco || 0);
      const quantidade = Number(item.quantidade || 0);

      return acc + preco * quantidade;
    }, 0);
  }, [itensSelecionados]);

  async function carregarCarrinho() {
    try {
      setLoading(true);

      const res = await axios.get<CarrinhoResponse | CarrinhoItem[]>(
        "/api/carrinho/listar",
        {
          withCredentials: true,
        },
      );

      const lista: CarrinhoItem[] = Array.isArray(res.data)
        ? res.data
        : res.data.itens || [];

      setItens(lista);
      setSelecionados(lista.map((item) => item.id));
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao carregar carrinho");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function removerItem(itemId: number) {
    try {
      setRemovendoId(itemId);

      await axios.request({
        method: "DELETE",
        url: "/api/carrinho/remover",
        data: {
          itemId,
        },
        withCredentials: true,
      });

      setItens((prev) => prev.filter((item) => item.id !== itemId));
      setSelecionados((prev) => prev.filter((id) => id !== itemId));
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao remover item");
    } finally {
      setRemovendoId(null);
    }
  }

  function alternarSelecionado(itemId: number) {
    setSelecionados((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }

      return [...prev, itemId];
    });
  }

  function selecionarTodos() {
    if (selecionados.length === itens.length) {
      setSelecionados([]);
    } else {
      setSelecionados(itens.map((item) => item.id));
    }
  }

  async function finalizarCompra() {
    try {
      if (itensSelecionados.length === 0) {
        alert("Selecione pelo menos um produto");
        return;
      }

      setFinalizando(true);

      const ids = itensSelecionados.map((item) => item.id).join(",");

      router.push(`/checkout?itens=${ids}`);
    } catch {
      alert("Erro ao abrir checkout");
    } finally {
      setFinalizando(false);
    }
  }

  useEffect(() => {
    carregarCarrinho();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando carrinho...</h1>
        </div>
      </main>
    );
  }

  if (itens.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.vazio}>
          <h1>Seu carrinho está vazio</h1>
          <p>Adicione produtos ao carrinho para continuar sua compra.</p>

          <button type="button" onClick={() => router.push("/")}>
            Ver produtos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => router.push("/")}
        >
          ← Voltar
        </button>

        <header className={styles.header}>
          <div>
            <span>Meu carrinho</span>
            <h1>Produtos selecionados</h1>
            <p>
              Selecione os itens que deseja comprar. Cupom, endereço e frete
              serão escolhidos no checkout.
            </p>
          </div>

          <button
            type="button"
            className={styles.botaoSelecionar}
            onClick={selecionarTodos}
          >
            {selecionados.length === itens.length
              ? "Desmarcar todos"
              : "Selecionar todos"}
          </button>
        </header>

        <section className={styles.produtosTopo}>
          <div className={styles.produtosTopoHeader}>
            <h2>Produtos no carrinho</h2>

            <span>
              {selecionados.length} de {itens.length} selecionado(s)
            </span>
          </div>

          <div className={styles.produtosTopoLista}>
            {itens.map((item) => {
              const produto = item.produto;
              const imagem = obterImagemProduto(produto);
              const selecionado = selecionados.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.produtoTopoCard} ${
                    selecionado ? styles.produtoTopoSelecionado : ""
                  }`}
                  onClick={() => alternarSelecionado(item.id)}
                >
                  <img src={`/${imagem}`} alt={produto?.nome || "Produto"} />

                  <div>
                    <strong>{produto?.nome || "Produto"}</strong>

                    <span>
                      {item.quantidade}x{" "}
                      {formatarMoeda(Number(produto?.preco || 0))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.listaItens}>
            {itens.map((item) => {
              const produto = item.produto;
              const imagem = obterImagemProduto(produto);
              const selecionado = selecionados.includes(item.id);

              const preco = Number(produto?.preco || 0);
              const quantidade = Number(item.quantidade || 0);
              const subtotal = preco * quantidade;
              const disponivel = calcularDisponivel(produto);

              return (
                <article
                  key={item.id}
                  className={`${styles.itemCard} ${
                    selecionado ? styles.itemSelecionado : ""
                  }`}
                >
                  <label className={styles.checkboxArea}>
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => alternarSelecionado(item.id)}
                    />
                    <span />
                  </label>

                  <img
                    src={`/${imagem}`}
                    alt={produto?.nome || "Produto"}
                    className={styles.imagemProduto}
                  />

                  <div className={styles.infoProduto}>
                    <h2>{produto?.nome || "Produto"}</h2>

                    <p className={styles.marcaCategoria}>
                      {produto?.marca || "Sem marca"} •{" "}
                      {produto?.categoria || "Sem categoria"}
                    </p>

                    <div className={styles.detalhesItem}>
                      {item.cor && (
                        <span>
                          <strong>Cor:</strong> {item.cor}
                        </span>
                      )}

                      {item.tamanho && (
                        <span>
                          <strong>Tamanho:</strong> {item.tamanho}
                        </span>
                      )}

                      <span>
                        <strong>Qtd:</strong> {item.quantidade}
                      </span>

                      <span>
                        <strong>Disponível:</strong> {disponivel}
                      </span>
                    </div>

                    <div className={styles.precos}>
                      <strong>{formatarMoeda(preco)}</strong>
                      <span>Subtotal: {formatarMoeda(subtotal)}</span>
                    </div>
                  </div>

                  <div className={styles.acoesItem}>
                    <button
                      type="button"
                      className={styles.botaoVer}
                      onClick={() => router.push(`/produto/${produto?.id}`)}
                    >
                      Ver produto
                    </button>

                    <button
                      type="button"
                      className={styles.botaoRemover}
                      onClick={() => removerItem(item.id)}
                      disabled={removendoId === item.id}
                    >
                      {removendoId === item.id ? "Removendo..." : "Remover"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className={styles.resumoBox}>
            <h2>Resumo da compra</h2>

            <div className={styles.linhaResumo}>
              <span>Itens selecionados</span>
              <strong>{itensSelecionados.length}</strong>
            </div>

            <div className={styles.linhaResumo}>
              <span>Total parcial</span>
              <strong>{formatarMoeda(totalProdutos)}</strong>
            </div>

            <div className={styles.totalFinal}>
              <span>Total parcial</span>
              <strong>{formatarMoeda(totalProdutos)}</strong>
            </div>

            <button
              type="button"
              className={styles.botaoFinalizar}
              onClick={finalizarCompra}
              disabled={finalizando || itensSelecionados.length === 0}
            >
              {finalizando ? "Abrindo checkout..." : "Ir para checkout"}
            </button>

            <p className={styles.aviso}>
              Cupom, endereço e frete serão escolhidos na próxima etapa.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
