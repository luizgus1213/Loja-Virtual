import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { caminhoImagem } from "@/lib/imagem";
import styles from "./style.module.css";
interface PedidoResponse {
  pedido: Pedido;
  itens: Item[];
}

interface DefinirEnderecoResponse {
  pedido: Pedido;
}

interface PixResponse {
  codigoPix?: string;
  copiaecola?: string;
}
interface Item {
  id: number;
  quantidade: number;
  preco_unitario: number;
  cor?: string;
  tamanho?: string | null;

  produto?: {
    id: number;
    nome: string;
    imagem?: {
      link: string;
    };
    capa?: {
      link: string;
    };
  };
}

interface Endereco {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  complemento?: string;
}

interface Cupom {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
}

interface LogStatus {
  id: number;
  status_anterior: string;
  status_novo: string;
  observacao?: string | null;
  createdAt: string;
}

interface Pedido {
  id: number;
  total: number;
  total_produtos?: number;
  frete_valor?: number;
  desconto_valor?: number;
  endereco_id?: number | null;
  frete_tipo?: string | null;
  status: string;
  expiresAt?: string | null;
  createdAt: string;

  endereco?: Endereco | null;
  cupom?: Cupom | null;
  logsStatus?: LogStatus[];
}

const etapasPedido = [
  {
    status: "aguardando_pagamento",
    titulo: "Pedido criado",
    descricao: "Seu pedido foi criado e está aguardando pagamento.",
  },
  {
    status: "pago",
    titulo: "Pagamento confirmado",
    descricao: "Recebemos seu pagamento com sucesso.",
  },
  {
    status: "preparando",
    titulo: "Preparando pedido",
    descricao: "Estamos separando seus produtos.",
  },
  {
    status: "enviado",
    titulo: "Pedido enviado",
    descricao: "Seu pedido saiu para entrega.",
  },
  {
    status: "entregue",
    titulo: "Pedido entregue",
    descricao: "Seu pedido foi entregue.",
  },
];

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

function indiceStatus(status: string) {
  const index = etapasPedido.findIndex((etapa) => etapa.status === status);

  if (index === -1) return 0;

  return index;
}

function imagemProduto(item: Item) {
  return (
    item.produto?.imagem?.link || item.produto?.capa?.link || "sem-imagem.png"
  );
}

export default function PedidoPage() {
  const router = useRouter();
  const { id } = router.query;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [avaliandoProdutoId, setAvaliandoProdutoId] = useState<number | null>(
    null,
  );

  const [notaAvaliacao, setNotaAvaliacao] = useState(5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [freteTipo, setFreteTipo] = useState<"normal" | "expresso">("normal");
  const [itens, setItens] = useState<Item[]>([]);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [enderecoId, setEnderecoId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);

  const [codigoPix, setCodigoPix] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [gerandoPix, setGerandoPix] = useState(false);

  const enderecoSelecionado = useMemo(() => {
    return enderecos.find((endereco) => endereco.id === enderecoId) || null;
  }, [enderecos, enderecoId]);

  const enderecoSalvo =
    pedido?.endereco_id &&
    enderecoId &&
    Number(pedido.endereco_id) === Number(enderecoId);

  const etapaAtual = useMemo(() => {
    if (!pedido) return 0;

    return indiceStatus(pedido.status);
  }, [pedido]);

  async function carregarPedido() {
    try {
      if (!id) return;

      setLoading(true);

      const res = await axios.get<PedidoResponse>(`/api/pedido/${id}`, {
        withCredentials: true,
      });

      const pedidoCarregado: Pedido = res.data.pedido;

      setPedido(pedidoCarregado);
      setItens(res.data.itens || []);

      if (pedidoCarregado?.frete_tipo === "expresso") {
        setFreteTipo("expresso");
      } else {
        setFreteTipo("normal");
      }

      if (pedidoCarregado?.endereco_id) {
        setEnderecoId(Number(pedidoCarregado.endereco_id));
      }
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao carregar pedido");
      router.push("/historico");
    } finally {
      setLoading(false);
    }
  }

  async function carregarEnderecos() {
    try {
      const res = await axios.get<Endereco[]>("/api/enderecos/listar", {
        withCredentials: true,
      });

      const lista: Endereco[] = res.data || [];

      setEnderecos(lista);

      if (lista.length > 0) {
        setEnderecoId((atual) => atual || lista[0].id);
      }
    } catch (err) {
      console.log("Erro ao carregar endereços:", err);
    }
  }

  async function salvarEnderecoNoPedido() {
    try {
      if (!pedido) return false;

      if (!enderecoId) {
        alert("Selecione um endereço de entrega");
        return false;
      }

      setSalvandoEndereco(true);

      const res = await axios.post<DefinirEnderecoResponse>(
        "/api/pedido/definir-endereco",
        {
          pedidoId: pedido.id,
          enderecoId,
          freteTipo,
        },
        {
          withCredentials: true,
        },
      );

      setPedido(res.data.pedido);

      await carregarPedido();

      setCodigoPix("");

      return true;
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao salvar endereço");
      return false;
    } finally {
      setSalvandoEndereco(false);
    }
  }

  async function gerarPix() {
    try {
      if (!pedido) return;

      if (!enderecoId) {
        alert("Selecione um endereço de entrega");
        return;
      }

      setGerandoPix(true);

      if (!enderecoSalvo) {
        const salvou = await salvarEnderecoNoPedido();

        if (!salvou) {
          return;
        }
      }

      const res = await axios.post<PixResponse>(
        "/api/pix/criar",
        {
          pedidoId: pedido.id,
        },
        {
          withCredentials: true,
        },
      );

      const codigo = res.data.codigoPix || res.data.copiaecola || "";

      if (!codigo) {
        alert("PIX gerado, mas o código veio vazio");
        return;
      }

      setCodigoPix(codigo);
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao gerar PIX");
      carregarPedido();
    } finally {
      setGerandoPix(false);
    }
  }
  async function enviarAvaliacao(produtoId: number) {
    try {
      if (!pedido) return;

      if (pedido.status !== "entregue") {
        alert("Você só pode avaliar depois que o pedido for entregue");
        return;
      }

      setEnviandoAvaliacao(true);

      await axios.post(
        "/api/avaliacoes/criar",
        {
          pedidoId: pedido.id,
          produtoId,
          nota: notaAvaliacao,
          comentario: comentarioAvaliacao,
        },
        {
          withCredentials: true,
        },
      );

      alert("Avaliação enviada!");

      setAvaliandoProdutoId(null);
      setNotaAvaliacao(5);
      setComentarioAvaliacao("");

      await carregarPedido();
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao enviar avaliação");
    } finally {
      setEnviandoAvaliacao(false);
    }
  }

  async function copiarPix() {
    try {
      if (!codigoPix) {
        alert("Gere o PIX primeiro");
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(codigoPix);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = codigoPix;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const copiou = document.execCommand("copy");

        document.body.removeChild(textarea);

        if (!copiou) {
          throw new Error("Não foi possível copiar");
        }
      }

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 1800);
    } catch (err) {
      console.error("ERRO AO COPIAR PIX:", err);

      alert(
        "Não foi possível copiar automaticamente. Selecione o código e copie manualmente.",
      );
    }
  }

  async function confirmarPagamento() {
    try {
      if (!pedido) return;

      if (!enderecoSalvo) {
        alert("Salve o endereço de entrega antes de pagar");
        return;
      }

      setPagando(true);

      await axios.post(
        "/api/pix/pagar",
        {
          pedidoId: pedido.id,
        },
        {
          withCredentials: true,
        },
      );

      alert("Pagamento confirmado!");

      await carregarPedido();

      setCodigoPix("");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao confirmar pagamento");
      carregarPedido();
    } finally {
      setPagando(false);
    }
  }
  function baixarRecibo() {
    if (!pedido) return;

    window.open(`/api/pedido/recibo?pedidoId=${pedido.id}`, "_blank");
  }
  useEffect(() => {
    if (!router.isReady) return;

    carregarPedido();
  }, [router.isReady, id]);

  useEffect(() => {
    carregarEnderecos();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando pedido...</h1>
        </div>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className={styles.page}>
        <div className={styles.naoEncontrado}>
          <h1>Pedido não encontrado</h1>

          <button type="button" onClick={() => router.push("/historico")}>
            Voltar para histórico
          </button>
        </div>
      </main>
    );
  }

  const totalProdutos = Number(pedido.total_produtos || pedido.total || 0);
  const freteValor = Number(pedido.frete_valor || 0);
  const descontoValor = Number(pedido.desconto_valor || 0);
  const totalFinal = Number(pedido.total || 0);

  const podePagar = pedido.status === "aguardando_pagamento";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => router.push("/historico")}
        >
          ← Voltar
        </button>

        <section className={styles.cardPedido}>
          <div className={styles.topo}>
            <div>
              <span className={styles.tagPedido}>Pedido #{pedido.id}</span>
              <h1>{formatarStatus(pedido.status)}</h1>
              <p>{new Date(pedido.createdAt).toLocaleString("pt-BR")}</p>
            </div>

            <div className={styles.acoesTopoPedido}>
              <span
                className={`${styles.status} ${
                  styles[`status_${pedido.status}`] || ""
                }`}
              >
                {formatarStatus(pedido.status)}
              </span>

              <button
                type="button"
                className={styles.botaoRecibo}
                onClick={baixarRecibo}
              >
                Baixar recibo
              </button>
            </div>
          </div>

          <section className={styles.timelineCard}>
            <h2>Rastreamento do pedido</h2>

            <div className={styles.timeline}>
              {etapasPedido.map((etapa, index) => {
                const concluida = index < etapaAtual;
                const atual = index === etapaAtual;
                const bloqueada = index > etapaAtual;

                return (
                  <div
                    key={etapa.status}
                    className={`${styles.timelineEtapa} ${
                      concluida ? styles.timelineConcluida : ""
                    } ${atual ? styles.timelineAtual : ""} ${
                      bloqueada ? styles.timelineBloqueada : ""
                    }`}
                  >
                    <div className={styles.timelineBolinha}>
                      {concluida ? "✓" : atual ? "●" : ""}
                    </div>

                    <div>
                      <strong>{etapa.titulo}</strong>
                      <p>{etapa.descricao}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

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
            <div className={styles.cupomPedidoBox}>
              <strong>Cupom usado:</strong> {pedido.cupom.codigo}
            </div>
          )}

          {pedido.expiresAt && podePagar && (
            <div className={styles.expiraBox}>
              <strong>Expira em:</strong>{" "}
              {new Date(pedido.expiresAt).toLocaleString("pt-BR")}
            </div>
          )}
        </section>

        <section className={styles.layout}>
          <div className={styles.colunaItens}>
            <h2>Itens do pedido</h2>

            <div className={styles.listaItens}>
              {itens.map((item) => {
                const imagem = imagemProduto(item);
                const subtotal =
                  Number(item.preco_unitario || 0) *
                  Number(item.quantidade || 0);

                return (
                  <article key={item.id} className={styles.itemCard}>
                    <div className={styles.itemImagemBox}>
                      <Image
                        src={caminhoImagem(imagem)}
                        alt={item.produto?.nome || "Produto"}
                        fill
                        sizes="96px"
                        className={styles.itemImagem}
                      />
                    </div>

                    <div className={styles.itemInfo}>
                      <h3>{item.produto?.nome || "Produto"}</h3>
                      {pedido.status === "entregue" && item.produto?.id && (
                        <div className={styles.avaliacaoBox}>
                          {avaliandoProdutoId === item.produto.id ? (
                            <>
                              <strong>Avaliar produto</strong>

                              <select
                                value={notaAvaliacao}
                                onChange={(e) =>
                                  setNotaAvaliacao(Number(e.target.value))
                                }
                              >
                                <option value={5}>5 estrelas</option>
                                <option value={4}>4 estrelas</option>
                                <option value={3}>3 estrelas</option>
                                <option value={2}>2 estrelas</option>
                                <option value={1}>1 estrela</option>
                              </select>

                              <textarea
                                value={comentarioAvaliacao}
                                onChange={(e) =>
                                  setComentarioAvaliacao(e.target.value)
                                }
                                placeholder="Escreva sua opinião sobre o produto..."
                                maxLength={500}
                              />

                              <div className={styles.avaliacaoAcoes}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    enviarAvaliacao(item.produto!.id)
                                  }
                                  disabled={enviandoAvaliacao}
                                >
                                  {enviandoAvaliacao
                                    ? "Enviando..."
                                    : "Enviar avaliação"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAvaliandoProdutoId(null);
                                    setComentarioAvaliacao("");
                                    setNotaAvaliacao(5);
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              className={styles.botaoAvaliar}
                              onClick={() =>
                                setAvaliandoProdutoId(item.produto!.id)
                              }
                            >
                              Avaliar produto
                            </button>
                          )}
                        </div>
                      )}
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
                    </div>
                  </article>
                );
              })}
            </div>

            <section className={styles.historicoStatusBox}>
              <h2>Histórico do pedido</h2>

              {pedido.logsStatus && pedido.logsStatus.length > 0 ? (
                <div className={styles.logsLista}>
                  {pedido.logsStatus.map((log) => (
                    <article key={log.id} className={styles.logItem}>
                      <div className={styles.logPonto} />

                      <div>
                        <p>
                          <strong>{formatarStatus(log.status_anterior)}</strong>{" "}
                          → <strong>{formatarStatus(log.status_novo)}</strong>
                        </p>

                        <small>
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </small>

                        {log.observacao && <em>{log.observacao}</em>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.textoSecundario}>
                  Nenhuma alteração de status registrada ainda.
                </p>
              )}
            </section>
          </div>

          <aside className={styles.pagamentoBox}>
            <div className={styles.blocoCheckout}>
              <div className={styles.blocoTitulo}>
                <span>1</span>

                <div>
                  <h2>Endereço de entrega</h2>
                  <p>Escolha onde o pedido será entregue.</p>
                </div>
              </div>

              {podePagar ? (
                <div className={styles.enderecoBox}>
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
                    <>
                      <select
                        value={enderecoId || ""}
                        onChange={(e) => {
                          setEnderecoId(Number(e.target.value));
                          setCodigoPix("");
                        }}
                      >
                        {enderecos.map((endereco) => (
                          <option key={endereco.id} value={endereco.id}>
                            {endereco.rua}, {endereco.numero} -{" "}
                            {endereco.bairro}, {endereco.cidade}/
                            {endereco.estado}
                          </option>
                        ))}
                      </select>

                      {enderecoSelecionado && (
                        <div className={styles.enderecoPreview}>
                          <strong>Endereço selecionado:</strong>

                          <p>
                            {enderecoSelecionado.rua},{" "}
                            {enderecoSelecionado.numero} -{" "}
                            {enderecoSelecionado.bairro},{" "}
                            {enderecoSelecionado.cidade}/
                            {enderecoSelecionado.estado}
                          </p>

                          {enderecoSelecionado.cep && (
                            <small>CEP: {enderecoSelecionado.cep}</small>
                          )}
                        </div>
                      )}

                      <div className={styles.freteBox}>
                        <strong>Escolha o frete</strong>

                        <button
                          type="button"
                          className={
                            freteTipo === "normal" ? styles.freteAtivo : ""
                          }
                          onClick={() => {
                            setFreteTipo("normal");
                            setCodigoPix("");
                          }}
                        >
                          <span>Normal</span>
                          <small>Grátis</small>
                        </button>

                        <button
                          type="button"
                          className={
                            freteTipo === "expresso" ? styles.freteAtivo : ""
                          }
                          onClick={() => {
                            setFreteTipo("expresso");
                            setCodigoPix("");
                          }}
                        >
                          <span>Expresso</span>
                          <small>R$ 25,00</small>
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.botaoSalvarEndereco}
                        onClick={salvarEnderecoNoPedido}
                        disabled={salvandoEndereco}
                      >
                        {salvandoEndereco
                          ? "Salvando..."
                          : enderecoSalvo
                            ? "Endereço salvo"
                            : "Salvar endereço"}
                      </button>
                    </>
                  )}
                </div>
              ) : pedido.endereco ? (
                <div className={styles.enderecoAtual}>
                  <strong>Endereço de entrega:</strong>

                  <p>
                    {pedido.endereco.rua}, {pedido.endereco.numero} -{" "}
                    {pedido.endereco.bairro}, {pedido.endereco.cidade}/
                    {pedido.endereco.estado}
                  </p>
                </div>
              ) : (
                <div className={styles.avisoStatus}>
                  <strong>Pedido sem endereço salvo.</strong>
                </div>
              )}
            </div>

            <div className={styles.blocoCheckout}>
              <div className={styles.blocoTitulo}>
                <span>2</span>

                <div>
                  <h2>Pagamento PIX</h2>
                  <p>Gere o código PIX depois de salvar o endereço.</p>
                </div>
              </div>

              {podePagar ? (
                <>
                  {!codigoPix ? (
                    <button
                      type="button"
                      className={styles.botaoPix}
                      onClick={gerarPix}
                      disabled={gerandoPix || !enderecoId}
                    >
                      {gerandoPix ? "Gerando PIX..." : "Gerar PIX"}
                    </button>
                  ) : (
                    <div className={styles.pixArea}>
                      <label>Código PIX copia e cola</label>

                      <textarea readOnly value={codigoPix} />

                      <button
                        type="button"
                        className={styles.botaoCopiar}
                        onClick={copiarPix}
                      >
                        {copiado ? "Copiado!" : "Copiar código"}
                      </button>

                      <button
                        type="button"
                        className={styles.botaoConfirmar}
                        onClick={confirmarPagamento}
                        disabled={pagando}
                      >
                        {pagando ? "Confirmando..." : "Confirmar pagamento"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.avisoStatus}>
                  <strong>
                    Este pedido não está disponível para pagamento.
                  </strong>

                  <p>Status atual: {formatarStatus(pedido.status)}</p>

                  <button
                    type="button"
                    onClick={() => router.push(`/pedido/${pedido.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
