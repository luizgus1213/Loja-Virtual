import { GetServerSideProps } from "next";
import axios from "axios";
import styles from "./style.module.css";
import CaixaPesquisa from "@/components/CaixaPesquisa";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAlerta } from "@/contexts/AlertaContext";

interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: number;
  avaliacao: number;
  estoque: number;

  imagem?: {
    id?: number;
    link: string;
  } | null;

  capa?: {
    id?: number;
    link: string;
  } | null;

  imagens?: {
    id: number;
    principal: boolean;
    ordem: number;
    arquivo: {
      id: number;
      link: string;
    };
  }[];
}

interface Avaliacao {
  id: number;
  nota: number;
  comentario?: string | null;

  user?: {
    id: number;
    nome: string;
  } | null;
}

interface AvaliacaoStatusResponse {
  podeAvaliar: boolean;

  avaliacao?: {
    nota: number;
    comentario?: string | null;
  } | null;
}

interface CarrinhoAdicionarResponse {
  itemId?: number;
  sucesso?: boolean;
  mensagem?: string;
}

interface Props {
  produto: Produto | null;
  relacionados: Produto[];
}

export default function ProdutoPage({ produto, relacionados }: Props) {
  const [podeAvaliar, setPodeAvaliar] = useState(false);
  const [notaAvaliacao, setNotaAvaliacao] = useState(5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [produtosPesquisa, setProdutosPesquisa] = useState<any[]>([]);
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [corSelecionada, setCorSelecionada] = useState("");
  const [recomendados, setRecomendados] = useState<Produto[]>([]);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [loadingCarrinho, setLoadingCarrinho] = useState(false);

  const touchStartRef = useRef<number | null>(null);

  const router = useRouter();
  const { exibirAlerta } = useAlerta();

  const imagensProduto = produto?.imagens || [];

  const imagemPrincipal =
    imagensProduto[imagemAtual]?.arquivo?.link ||
    produto?.imagem?.link ||
    produto?.capa?.link ||
    "sem-imagem.png";

  const isRoupa = useMemo(() => {
    return (
      produto?.categoria?.toLowerCase().includes("roupa") ||
      produto?.descricao?.toLowerCase().includes("roupa")
    );
  }, [produto]);

  const precoTotal = useMemo(() => {
    if (!produto) return 0;

    return produto.preco * quantidade;
  }, [produto, quantidade]);

  function voltarImagem() {
    if (imagensProduto.length === 0) return;

    setImagemAtual((prev) =>
      prev === 0 ? imagensProduto.length - 1 : prev - 1,
    );
  }

  function avancarImagem() {
    if (imagensProduto.length === 0) return;

    setImagemAtual((prev) =>
      prev === imagensProduto.length - 1 ? 0 : prev + 1,
    );
  }

  function tocarInicio(e: React.TouchEvent<HTMLDivElement>) {
    touchStartRef.current = e.touches[0].clientX;
  }

  function tocarFim(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartRef.current === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diferenca = touchStartRef.current - touchEnd;

    if (diferenca > 50) {
      avancarImagem();
    }

    if (diferenca < -50) {
      voltarImagem();
    }

    touchStartRef.current = null;
  }

  async function carregarAvaliacaoStatus() {
    try {
      if (!produto) return;

      const res = await axios.post<AvaliacaoStatusResponse>(
        "/api/avaliacoes/status",
        {
          produtoId: produto.id,
        },
        {
          withCredentials: true,
        },
      );

      setPodeAvaliar(Boolean(res.data.podeAvaliar));

      if (res.data.avaliacao) {
        setNotaAvaliacao(res.data.avaliacao.nota);
        setComentarioAvaliacao(res.data.avaliacao.comentario || "");
      }
    } catch (err) {
      console.log("ERRO STATUS AVALIAÇÃO:", err);
      setPodeAvaliar(false);
    }
  }

  async function carregarAvaliacoes() {
    try {
      if (!produto) return;

      const res = await axios.get<Avaliacao[]>("/api/avaliacoes/listar", {
        params: {
          produtoId: produto.id,
        },
      });

      setAvaliacoes(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  async function enviarAvaliacao() {
    try {
      if (!produto) return;

      await axios.post(
        "/api/avaliacoes/criar",
        {
          produtoId: produto.id,
          nota: notaAvaliacao,
          comentario: comentarioAvaliacao,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Avaliação enviada!", "sucesso");

      carregarAvaliacoes();
      carregarAvaliacaoStatus();

      router.replace(router.asPath);
    } catch (err: any) {
      exibirAlerta(
        err?.response?.data?.erro || "Erro ao avaliar produto",
        "erro",
      );
    }
  }

  const validarCompra = () => {
    if (!produto) {
      exibirAlerta("Produto não encontrado", "erro");
      return false;
    }

    if (!corSelecionada) {
      exibirAlerta("Selecione uma cor", "erro");
      return false;
    }

    if (quantidade < 1) {
      exibirAlerta("Quantidade inválida", "erro");
      return false;
    }

    if (quantidade > produto.estoque) {
      exibirAlerta("Quantidade maior que o estoque", "erro");
      return false;
    }

    if (isRoupa && !tamanho) {
      exibirAlerta("Selecione um tamanho", "erro");
      return false;
    }

    return true;
  };

  const comprar = async (produtoAtual: Produto) => {
    try {
      setLoadingCompra(true);

      const valido = validarCompra();

      if (!valido) return;

      const resCarrinho = await axios.post<CarrinhoAdicionarResponse>(
        "/api/carrinho/adicionar",
        {
          produtoId: produtoAtual.id,
          quantidade,
          cor: corSelecionada,
          tamanho: isRoupa ? tamanho : null,
        },
        {
          withCredentials: true,
        },
      );

      const itemId = resCarrinho.data.itemId;

      if (itemId) {
        router.push(`/checkout?itens=${itemId}`);
        return;
      }

      router.push("/checkout");
    } catch (err: any) {
      console.log(err?.response?.data);

      exibirAlerta(err?.response?.data?.erro || "Erro ao comprar", "erro");

      if (err?.response?.status === 401) {
        router.push("/auth?modo=cadastro");
      }
    } finally {
      setLoadingCompra(false);
    }
  };

  const adicionarCarrinho = async () => {
    try {
      setLoadingCarrinho(true);

      const valido = validarCompra();

      if (!valido || !produto) return;

      await axios.post(
        "/api/carrinho/adicionar",
        {
          produtoId: produto.id,
          quantidade,
          cor: corSelecionada,
          tamanho: isRoupa ? tamanho : null,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Produto adicionado ao carrinho!", "sucesso");
    } catch (err: any) {
      console.error(err);

      exibirAlerta(
        err?.response?.data?.erro || "Erro ao adicionar ao carrinho",
        "erro",
      );

      if (err?.response?.status === 401) {
        router.push("/auth?modo=cadastro");
      }
    } finally {
      setLoadingCarrinho(false);
    }
  };

  useEffect(() => {
    async function carregarRecomendados() {
      try {
        if (!produto) return;

        const res = await axios.get<Produto[]>(
          `/api/produto/recomendados?categoria=${produto.categoria}&produtoId=${produto.id}`,
        );

        setRecomendados(res.data || []);
      } catch (err) {
        console.log(err);
      }
    }

    if (produto) {
      carregarRecomendados();
      carregarAvaliacaoStatus();
      carregarAvaliacoes();
    }
  }, [produto]);

  useEffect(() => {
    if (!produto) return;

    try {
      const produtoVisto = {
        id: produto.id,
        nome: produto.nome,
        marca: produto.marca,
        categoria: produto.categoria,
        descricao: produto.descricao,
        preco: produto.preco,
        avaliacao: produto.avaliacao || 0,
        estoque: produto.estoque,
        capa: produto.imagens?.[0]?.arquivo || produto.imagem || null,
      };

      const vistosSalvos = localStorage.getItem("produtosVistos");
      const vistos = vistosSalvos ? JSON.parse(vistosSalvos) : [];

      const semRepetido = vistos.filter((item: any) => item.id !== produto.id);
      const novaLista = [produtoVisto, ...semRepetido].slice(0, 8);

      localStorage.setItem("produtosVistos", JSON.stringify(novaLista));
    } catch (err) {
      console.log("Erro ao salvar produto visto:", err);
    }
  }, [produto]);

  if (!produto) {
    return (
      <div className={styles.erro}>
        <h2>Produto não encontrado 😢</h2>

        <button type="button" onClick={() => router.push("/")}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <CaixaPesquisa
          callback={setProdutosPesquisa}
          setFiltroAberto={() => {}}
          modo="produto"
        />

        {produtosPesquisa.length > 0 && (
          <div className={styles.resultadosPesquisa}>
            <div className={styles.topoResultados}>
              <h2>Resultados da pesquisa</h2>

              <button type="button" onClick={() => setProdutosPesquisa([])}>
                Limpar pesquisa
              </button>
            </div>

            <div className={styles.gridPesquisa}>
              {produtosPesquisa.map((item) => (
                <div
                  key={item.id}
                  className={styles.cardPesquisa}
                  onClick={() => router.push(`/produto/${item.id}`)}
                >
                  <img
                    src={`/${
                      item.capa?.link ||
                      item.imagem?.link ||
                      item.imagens?.[0]?.arquivo?.link ||
                      "sem-imagem.png"
                    }`}
                    alt={item.nome}
                    loading="lazy"
                  />

                  <h3>{item.nome}</h3>

                  <strong>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.preco)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.cardPrincipal}>
          <div className={styles.produto}>
            <div className={styles.galeria}>
              <div
                className={styles.imagemPrincipalBox}
                onTouchStart={tocarInicio}
                onTouchEnd={tocarFim}
              >
                <img
                  className={styles.imagemPrincipal}
                  src={`/${imagemPrincipal}`}
                  alt={produto.nome}
                  loading="lazy"
                />

                {imagensProduto.length > 1 && (
                  <>
                    <button
                      className={styles.botaoImagemAnterior}
                      onClick={voltarImagem}
                      type="button"
                      aria-label="Imagem anterior"
                    >
                      ‹
                    </button>

                    <button
                      className={styles.botaoImagemProxima}
                      onClick={avancarImagem}
                      type="button"
                      aria-label="Próxima imagem"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {imagensProduto.length > 1 && (
                <div className={styles.miniaturas}>
                  {imagensProduto.map((img, index) => (
                    <button
                      key={img.id}
                      type="button"
                      className={`${styles.miniatura} ${
                        imagemAtual === index ? styles.miniaturaAtiva : ""
                      }`}
                      onClick={() => setImagemAtual(index)}
                    >
                      <img
                        src={`/${img.arquivo.link}`}
                        alt={`${produto.nome} ${index + 1}`}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.info}>
              <h2 className={styles.nome}>{produto.nome}</h2>

              <div className={styles.avaliacao}>
                {"⭐".repeat(Math.round(produto.avaliacao || 0))}
              </div>

              <div className={styles.preco}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produto.preco)}
              </div>

              <div className={styles.infoLinha}>
                <strong>Marca:</strong> {produto.marca}
              </div>

              <div className={styles.infoLinha}>
                <strong>Estoque:</strong>{" "}
                {produto.estoque > 0
                  ? `${produto.estoque} disponíveis`
                  : "Sem estoque"}
              </div>

              <div className={styles.opcoes}>
                {isRoupa && (
                  <div className={styles.grupoOpcao}>
                    <label>Tamanho</label>

                    <select
                      value={tamanho}
                      onChange={(e) => setTamanho(e.target.value)}
                      className={styles.selectCor}
                    >
                      <option value="">Escolha</option>
                      <option value="PP">PP</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                    </select>
                  </div>
                )}

                <div className={styles.grupoOpcao}>
                  <label>Quantidade</label>

                  <div className={styles.quantidadeBox}>
                    <button
                      type="button"
                      disabled={quantidade <= 1}
                      onClick={() => setQuantidade((q) => (q > 1 ? q - 1 : 1))}
                    >
                      -
                    </button>

                    <span>{quantidade}</span>

                    <button
                      type="button"
                      disabled={quantidade >= produto.estoque}
                      onClick={() =>
                        setQuantidade((q) =>
                          q < produto.estoque ? q + 1 : produto.estoque,
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.grupoOpcao}>
                  <label>Cor</label>

                  <select
                    value={corSelecionada}
                    onChange={(e) => setCorSelecionada(e.target.value)}
                    className={styles.selectCor}
                  >
                    <option value="">Escolha uma cor</option>
                    <option value="Preto">Preto</option>
                    <option value="Branco">Branco</option>
                    <option value="Azul">Azul</option>
                    <option value="Vermelho">Vermelho</option>
                  </select>
                </div>
              </div>

              <div className={styles.totalProduto}>
                Total:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(precoTotal)}
              </div>

              <div className={styles.botoes}>
                <button
                  className={styles.btnCarrinho}
                  disabled={loadingCarrinho || produto.estoque <= 0}
                  onClick={adicionarCarrinho}
                  type="button"
                >
                  {loadingCarrinho ? "Adicionando..." : "Adicionar ao carrinho"}
                </button>

                <button
                  className={styles.btnComprar}
                  disabled={loadingCompra || produto.estoque <= 0}
                  onClick={() => comprar(produto)}
                  type="button"
                >
                  {loadingCompra ? "Processando..." : "Comprar agora"}
                </button>
              </div>

              {produto.estoque <= 0 && (
                <p className={styles.indisponivel}>
                  Produto indisponível no momento
                </p>
              )}

              <div className={styles.descricao}>
                <h3>Descrição</h3>
                <p>{produto.descricao}</p>
              </div>

              <div className={styles.avaliacoesBox}>
                <h3>Avaliações dos clientes</h3>

                <div className={styles.mediaAvaliacao}>
                  <span>{"⭐".repeat(Math.round(produto.avaliacao || 0))}</span>
                  <strong>
                    {Number(produto.avaliacao || 0).toFixed(1)} / 5
                  </strong>
                </div>

                {podeAvaliar ? (
                  <div className={styles.formAvaliacao}>
                    <h4>Sua avaliação</h4>

                    <select
                      value={notaAvaliacao}
                      onChange={(e) => setNotaAvaliacao(Number(e.target.value))}
                    >
                      <option value={5}>5 ⭐ Excelente</option>
                      <option value={4}>4 ⭐ Muito bom</option>
                      <option value={3}>3 ⭐ Bom</option>
                      <option value={2}>2 ⭐ Ruim</option>
                      <option value={1}>1 ⭐ Péssimo</option>
                    </select>

                    <textarea
                      placeholder="Escreva um comentário opcional"
                      value={comentarioAvaliacao}
                      maxLength={500}
                      onChange={(e) => setComentarioAvaliacao(e.target.value)}
                    />

                    <button type="button" onClick={enviarAvaliacao}>
                      Enviar avaliação
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.btnComprar}
                    type="button"
                    onClick={() => router.push("/historico")}
                  >
                    Ver meus pedidos
                  </button>
                )}

                <div className={styles.listaAvaliacoes}>
                  {avaliacoes.length === 0 ? (
                    <p className={styles.avisoAvaliacao}>
                      Nenhuma avaliação ainda.
                    </p>
                  ) : (
                    avaliacoes.map((avaliacao) => (
                      <div key={avaliacao.id} className={styles.cardAvaliacao}>
                        <div>
                          <strong>{avaliacao.user?.nome || "Usuário"}</strong>
                          <span>{"⭐".repeat(Number(avaliacao.nota))}</span>
                        </div>

                        {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.relacionadosBox}>
          <div className={styles.relacionadosHeader}>
            <div>
              <span className={styles.relacionadosTag}>Sugestões</span>
              <h2>Produtos relacionados</h2>
              <p>Veja outros produtos que combinam com este item.</p>
            </div>

            <button
              className={styles.botaoVerMais}
              onClick={() => router.push("/")}
              type="button"
            >
              Ver loja
            </button>
          </div>

          {recomendados.length > 0 && (
            <section className={styles.secaoRelacionados}>
              <h3>Quem comprou isso também viu</h3>

              <div className={styles.gridRelacionados}>
                {recomendados.map((item) => {
                  const imagem =
                    item.imagem?.link ||
                    item.capa?.link ||
                    item.imagens?.[0]?.arquivo?.link ||
                    "sem-imagem.png";

                  return (
                    <div
                      key={item.id}
                      className={styles.cardRelacionado}
                      onClick={() => router.push(`/produto/${item.id}`)}
                    >
                      <div className={styles.imagemRelacionadoBox}>
                        <img
                          src={`/${imagem}`}
                          alt={item.nome}
                          loading="lazy"
                          className={styles.imagemRelacionado}
                        />
                      </div>

                      <div className={styles.infoRelacionado}>
                        <span className={styles.categoriaRelacionado}>
                          {item.categoria || "Produto"}
                        </span>

                        <h4>{item.nome}</h4>

                        <div className={styles.avaliacaoRelacionado}>
                          {"⭐".repeat(Math.round(item.avaliacao || 0))}
                          <span>{Number(item.avaliacao || 0).toFixed(1)}</span>
                        </div>

                        <strong>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.preco)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {relacionados.length > 0 && (
            <section className={styles.secaoRelacionados}>
              <h3>Mais opções para você</h3>

              <div className={styles.gridRelacionados}>
                {relacionados.map((item) => {
                  const imagem =
                    item.imagem?.link ||
                    item.capa?.link ||
                    item.imagens?.[0]?.arquivo?.link ||
                    "sem-imagem.png";

                  return (
                    <div
                      key={item.id}
                      className={styles.cardRelacionado}
                      onClick={() => router.push(`/produto/${item.id}`)}
                    >
                      <div className={styles.imagemRelacionadoBox}>
                        <img
                          src={`/${imagem}`}
                          alt={item.nome}
                          loading="lazy"
                          className={styles.imagemRelacionado}
                        />
                      </div>

                      <div className={styles.infoRelacionado}>
                        <span className={styles.categoriaRelacionado}>
                          {item.categoria || "Produto"}
                        </span>

                        <h4>{item.nome}</h4>

                        <div className={styles.avaliacaoRelacionado}>
                          {"⭐".repeat(Math.round(item.avaliacao || 0))}
                          <span>{Number(item.avaliacao || 0).toFixed(1)}</span>
                        </div>

                        <strong>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.preco)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {recomendados.length === 0 && relacionados.length === 0 && (
            <div className={styles.semRelacionados}>
              <h3>Nenhum produto relacionado encontrado</h3>
              <p>Volte para a loja e veja outros produtos disponíveis.</p>

              <button onClick={() => router.push("/")} type="button">
                Voltar para loja
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const idParam = ctx.params?.id;

  if (!idParam || Array.isArray(idParam)) {
    return {
      props: {
        produto: null,
        relacionados: [],
      },
    };
  }

  try {
    const produtoRes = await axios.get<Produto>(
      `${process.env.SERVER_URL}/api/produto/${idParam}`,
    );

    const produto = produtoRes.data;

    const outrosRes = await axios.get<Produto[]>(
      `${process.env.SERVER_URL}/api/pesquisar`,
    );

    const relacionados = (outrosRes.data || [])
      .filter((p) => p.id !== Number(idParam))
      .slice(0, 4);

    return {
      props: {
        produto,
        relacionados,
      },
    };
  } catch {
    return {
      props: {
        produto: null,
        relacionados: [],
      },
    };
  }
};
