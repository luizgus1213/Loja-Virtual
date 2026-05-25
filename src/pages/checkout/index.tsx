import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./style.module.css";

interface ItemCarrinho {
  id: number;
  quantidade: number;
  cor: string;
  tamanho?: string | null;

  produto: {
    id: number;
    nome: string;
    preco: number;
    estoque: number;

    imagem?: {
      link: string;
    } | null;

    capa?: {
      link: string;
    } | null;
  };
}

interface Endereco {
  id: number;
  nome?: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
  endereco_padrao?: boolean;
}

interface CupomAplicado {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  desconto: number;
}

interface ValidarCupomResponse {
  cupom: CupomAplicado;
}

interface FinalizarPedidoResponse {
  pedidoId: number;
}

interface CarrinhoResponse {
  itens: ItemCarrinho[];
}

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function obterImagem(item: ItemCarrinho) {
  return (
    item.produto?.imagem?.link || item.produto?.capa?.link || "sem-imagem.png"
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);

  const [itensSelecionadosIds, setItensSelecionadosIds] = useState<number[]>(
    [],
  );

  const [enderecoId, setEnderecoId] = useState<number | null>(null);
  const [freteTipo, setFreteTipo] = useState<"normal" | "expresso">("normal");

  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<CupomAplicado | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [validandoCupom, setValidandoCupom] = useState(false);

  const freteValor = freteTipo === "expresso" ? 25 : 0;

  const itensSelecionados = useMemo(() => {
    return itens.filter((item) => itensSelecionadosIds.includes(item.id));
  }, [itens, itensSelecionadosIds]);

  const totalProdutos = useMemo(() => {
    return itensSelecionados.reduce((acc, item) => {
      return acc + Number(item.produto.preco || 0) * Number(item.quantidade);
    }, 0);
  }, [itensSelecionados]);

  const desconto = Number(cupomAplicado?.desconto || 0);

  const totalFinal = Math.max(totalProdutos + freteValor - desconto, 0);

  async function carregarDados() {
    try {
      setLoading(true);

      const [resCarrinho, resEnderecos] = await Promise.all([
        axios.get<ItemCarrinho[] | CarrinhoResponse>("/api/carrinho/listar", {
          withCredentials: true,
        }),

        axios.get<Endereco[]>("/api/enderecos/listar", {
          withCredentials: true,
        }),
      ]);

      const listaItens: ItemCarrinho[] = Array.isArray(resCarrinho.data)
        ? resCarrinho.data
        : resCarrinho.data.itens || [];

      const listaEnderecos: Endereco[] = resEnderecos.data || [];

      setItens(listaItens);
      setEnderecos(listaEnderecos);

      const queryItens = String(router.query.itens || "");

      if (queryItens) {
        const ids = queryItens
          .split(",")
          .map((id) => Number(id))
          .filter((id) => id && !Number.isNaN(id));

        setItensSelecionadosIds(ids);
      } else {
        setItensSelecionadosIds(listaItens.map((item) => item.id));
      }

      const enderecoPadrao = listaEnderecos.find(
        (endereco) => endereco.endereco_padrao,
      );

      if (enderecoPadrao) {
        setEnderecoId(enderecoPadrao.id);
      } else if (listaEnderecos.length > 0) {
        setEnderecoId(listaEnderecos[0].id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao carregar checkout");
      router.push("/carrinho");
    } finally {
      setLoading(false);
    }
  }

  async function validarCupom() {
    try {
      const codigo = cupomCodigo.trim().toUpperCase();

      if (!codigo) {
        alert("Digite um cupom");
        return;
      }

      if (cupomAplicado?.codigo === codigo) {
        alert("Este cupom já está aplicado");
        return;
      }

      if (totalProdutos <= 0) {
        alert("Selecione produtos primeiro");
        return;
      }

      setValidandoCupom(true);

      const res = await axios.post<ValidarCupomResponse>(
        "/api/cupons/validar",
        {
          codigo,
          totalProdutos,
        },
        {
          withCredentials: true,
        },
      );

      setCupomAplicado(res.data.cupom);
      setCupomCodigo(res.data.cupom.codigo);

      alert("Cupom aplicado!");
    } catch (err: any) {
      setCupomAplicado(null);
      alert(err?.response?.data?.erro || "Cupom inválido");
    } finally {
      setValidandoCupom(false);
    }
  }

  async function finalizarPedido() {
    try {
      if (itensSelecionadosIds.length === 0) {
        alert("Selecione pelo menos um produto");
        return;
      }

      if (!enderecoId) {
        alert("Selecione um endereço");
        return;
      }

      setFinalizando(true);

      const res = await axios.post<FinalizarPedidoResponse>(
        "/api/checkout/finalizar",
        {
          itensIds: itensSelecionadosIds,
          enderecoId,
          freteTipo,
          cupomCodigo: cupomAplicado?.codigo || null,
        },
        {
          withCredentials: true,
        },
      );

      router.push(`/pedido/${res.data.pedidoId}`);
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao finalizar pedido");
    } finally {
      setFinalizando(false);
    }
  }

  function alternarItem(id: number) {
    setItensSelecionadosIds((atual) => {
      if (atual.includes(id)) {
        return atual.filter((itemId) => itemId !== id);
      }

      return [...atual, id];
    });

    setCupomAplicado(null);
  }

  function marcarTodos() {
    setItensSelecionadosIds(itens.map((item) => item.id));
    setCupomAplicado(null);
  }

  function desmarcarTodos() {
    setItensSelecionadosIds([]);
    setCupomAplicado(null);
  }

  useEffect(() => {
    if (!router.isReady) return;

    const cupomUrl = router.query.cupom;

    if (typeof cupomUrl === "string") {
      setCupomCodigo(cupomUrl.toUpperCase());
    }

    carregarDados();
  }, [router.isReady]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando checkout...</h1>
        </div>
      </main>
    );
  }

  if (itens.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.vazio}>
          <h1>Seu carrinho está vazio</h1>
          <p>Adicione produtos antes de finalizar a compra.</p>

          <button type="button" onClick={() => router.push("/")}>
            Voltar para loja
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
          onClick={() => router.push("/carrinho")}
        >
          ← Voltar ao carrinho
        </button>

        <header className={styles.header}>
          <span>Finalização</span>
          <h1>Checkout</h1>
          <p>Confira os produtos, endereço, frete e cupom antes de pagar.</p>
        </header>

        <section className={styles.layout}>
          <div className={styles.colunaPrincipal}>
            <section className={styles.card}>
              <div className={styles.cardTopo}>
                <div>
                  <span>1</span>
                  <h2>Produtos selecionados</h2>
                </div>

                <div className={styles.acoesSelecao}>
                  <button type="button" onClick={marcarTodos}>
                    Marcar todos
                  </button>

                  <button type="button" onClick={desmarcarTodos}>
                    Desmarcar todos
                  </button>
                </div>
              </div>

              <div className={styles.listaItens}>
                {itens.map((item) => {
                  const selecionado = itensSelecionadosIds.includes(item.id);

                  return (
                    <article
                      key={item.id}
                      className={`${styles.item} ${
                        selecionado ? styles.itemSelecionado : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarItem(item.id)}
                      />

                      <img
                        src={`/${obterImagem(item)}`}
                        alt={item.produto.nome}
                      />

                      <div className={styles.itemInfo}>
                        <h3>{item.produto.nome}</h3>

                        <p>
                          Qtd: {item.quantidade}
                          {item.cor ? ` • Cor: ${item.cor}` : ""}
                          {item.tamanho ? ` • Tam: ${item.tamanho}` : ""}
                        </p>

                        <strong>
                          {moeda(item.produto.preco * item.quantidade)}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardTopo}>
                <div>
                  <span>2</span>
                  <h2>Endereço de entrega</h2>
                </div>

                <button
                  type="button"
                  className={styles.botaoPequeno}
                  onClick={() => router.push("/enderecos")}
                >
                  Gerenciar endereços
                </button>
              </div>

              {enderecos.length === 0 ? (
                <div className={styles.semEndereco}>
                  <p>Você ainda não cadastrou endereço.</p>

                  <button
                    type="button"
                    onClick={() => router.push("/enderecos")}
                  >
                    Cadastrar endereço
                  </button>
                </div>
              ) : (
                <div className={styles.enderecosGrid}>
                  {enderecos.map((endereco) => (
                    <button
                      key={endereco.id}
                      type="button"
                      className={`${styles.enderecoCard} ${
                        enderecoId === endereco.id ? styles.enderecoAtivo : ""
                      }`}
                      onClick={() => setEnderecoId(endereco.id)}
                    >
                      <strong>{endereco.nome || "Endereço"}</strong>

                      <p>
                        {endereco.rua}, {endereco.numero}
                      </p>

                      <small>
                        {endereco.bairro}, {endereco.cidade}/{endereco.estado}
                      </small>

                      {endereco.endereco_padrao && <span>Padrão</span>}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardTopo}>
                <div>
                  <span>3</span>
                  <h2>Frete</h2>
                </div>
              </div>

              <div className={styles.freteGrid}>
                <button
                  type="button"
                  className={freteTipo === "normal" ? styles.freteAtivo : ""}
                  onClick={() => setFreteTipo("normal")}
                >
                  <strong>Normal</strong>
                  <p>Entrega padrão</p>
                  <span>Grátis</span>
                </button>

                <button
                  type="button"
                  className={freteTipo === "expresso" ? styles.freteAtivo : ""}
                  onClick={() => setFreteTipo("expresso")}
                >
                  <strong>Expresso</strong>
                  <p>Entrega mais rápida</p>
                  <span>R$ 25,00</span>
                </button>
              </div>
            </section>
          </div>

          <aside className={styles.resumo}>
            <h2>Resumo do pedido</h2>

            <div className={styles.cupomBox}>
              <label>Cupom</label>

              <div>
                <input
                  value={cupomCodigo}
                  onChange={(e) => {
                    setCupomCodigo(e.target.value.toUpperCase());

                    if (cupomAplicado) {
                      setCupomAplicado(null);
                    }
                  }}
                  placeholder="Digite seu cupom"
                />

                <button
                  type="button"
                  onClick={validarCupom}
                  disabled={validandoCupom || !!cupomAplicado}
                >
                  {validandoCupom
                    ? "..."
                    : cupomAplicado
                      ? "Aplicado"
                      : "Aplicar"}
                </button>
              </div>

              {cupomAplicado && (
                <div className={styles.cupomAplicadoBox}>
                  <p>Cupom {cupomAplicado.codigo} aplicado</p>

                  <button
                    type="button"
                    onClick={() => {
                      setCupomAplicado(null);
                      setCupomCodigo("");
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            <div className={styles.linhaResumo}>
              <span>Produtos</span>
              <strong>{moeda(totalProdutos)}</strong>
            </div>

            <div className={styles.linhaResumo}>
              <span>Frete</span>
              <strong>{moeda(freteValor)}</strong>
            </div>

            <div className={styles.linhaResumo}>
              <span>Desconto</span>
              <strong className={styles.desconto}>- {moeda(desconto)}</strong>
            </div>

            <div className={styles.totalResumo}>
              <span>Total</span>
              <strong>{moeda(totalFinal)}</strong>
            </div>

            <button
              type="button"
              className={styles.botaoFinalizar}
              onClick={finalizarPedido}
              disabled={finalizando || itensSelecionadosIds.length === 0}
            >
              {finalizando ? "Finalizando..." : "Finalizar pedido"}
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
