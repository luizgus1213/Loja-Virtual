import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/Home.module.css";

import CardProduto from "@/components/CardProduto";
import CaixaPesquisa from "@/components/CaixaPesquisa";

import { verificarToken } from "@/lib/auth";

interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: number;
  avaliacao?: number;
  estoque: number;

  capa?: {
    id?: number;
    nome?: string;
    link: string;
  } | null;
}

interface HomeProps {
  aleatorios: Produto[];
  maisAvaliados: Produto[];
  produtos: Produto[];
  UMPALUMPA: string;
  user: {
    id: number;
    email: string;
    nome: string;
    acesso: string;
  } | null;
}

function IconeCelular() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function IconeComputador() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </svg>
  );
}

function IconeFone() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="7" rx="2" />
      <rect x="17" y="13" width="4" height="7" rx="2" />
    </svg>
  );
}

function IconeGame() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="8" width="18" height="10" rx="4" />
      <line x1="8" y1="11" x2="8" y2="15" />
      <line x1="6" y1="13" x2="10" y2="13" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="18.5" cy="15" r="1" />
    </svg>
  );
}

function IconeMoveis() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
      <path d="M4 12h16a2 2 0 0 1 2 2v5H2v-5a2 2 0 0 1 2-2z" />
      <line x1="5" y1="19" x2="5" y2="22" />
      <line x1="19" y1="19" x2="19" y2="22" />
    </svg>
  );
}

function IconeCasa() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export default function Home({ aleatorios, maisAvaliados, user }: HomeProps) {
  const [filtroAberto, setFiltroAberto] = useState(false);

  const [produtosNaTela, setProdutosNaTela] = useState<Produto[]>(
    aleatorios || [],
  );

  const [modoPesquisa, setModoPesquisa] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [carregandoCategoria, setCarregandoCategoria] = useState(false);

  const [vistosRecentemente, setVistosRecentemente] = useState<Produto[]>([]);

  async function buscarPorCategoria(categoria: string) {
    try {
      setCarregandoCategoria(true);
      setModoPesquisa(false);
      setCategoriaAtiva(categoria);

      if (categoria === "todos") {
        setProdutosNaTela(aleatorios || []);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const res = await axios.get<Produto[]>("/api/pesquisar", {
        params: {
          pesquisa: "",
          categoria,
          valorMinimo: 0,
          valorMaximo: 999999999,
        },
      });

      setProdutosNaTela(res.data || []);

      setTimeout(() => {
        window.scrollTo({
          top: 720,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.log(err);
      alert("Erro ao buscar categoria");
    } finally {
      setCarregandoCategoria(false);
    }
  }

  function receberPesquisa(produtos: Produto[]) {
    setProdutosNaTela(produtos);
    setModoPesquisa(true);
    setCategoriaAtiva("pesquisa");

    setTimeout(() => {
      window.scrollTo({
        top: 650,
        behavior: "smooth",
      });
    }, 100);
  }
  function limparPesquisa() {
    setProdutosNaTela(aleatorios || []);
    setModoPesquisa(false);
    setCategoriaAtiva("todos");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function limparVistosRecentemente() {
    localStorage.removeItem("produtosVistos");
    setVistosRecentemente([]);
  }

  useEffect(() => {
    const salvos = localStorage.getItem("produtosVistos");

    if (salvos) {
      try {
        setVistosRecentemente(JSON.parse(salvos));
      } catch {
        setVistosRecentemente([]);
      }
    }
  }, []);

  return (
    <>
      <main
        className={`${styles.main_section} ${
          filtroAberto ? styles.comFiltro : ""
        }`}
      >
        {user?.acesso === "admin" && (
          <div className={styles.areaCriarProduto}>
            <a href="/cadastrar" className={styles.botaoCriar}>
              + Criar produto
            </a>
          </div>
        )}
        <CaixaPesquisa
          callback={receberPesquisa}
          setFiltroAberto={setFiltroAberto}
        />

        {!modoPesquisa && (
          <>
            <section className={styles.bannerLoja}>
              <img src="/logo.jpg" alt="Banner da loja" />

              <div className={styles.bannerConteudo}>
                <span>Ofertas selecionadas</span>

                <h2>Produtos em destaque</h2>

                <p>Confira eletrônicos, acessórios, móveis e muito mais.</p>

                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({
                      top: 720,
                      behavior: "smooth",
                    });
                  }}
                >
                  Ver produtos
                </button>
              </div>
            </section>

            <section className={styles.categoriasHome}>
              <div className={styles.categoriasTopo}>
                <h2>Categorias em destaque</h2>

                <button
                  type="button"
                  onClick={() => buscarPorCategoria("todos")}
                >
                  Ver todos →
                </button>
              </div>

              <div className={styles.listaCategorias}>
                <button
                  type="button"
                  onClick={() => buscarPorCategoria("Celulares")}
                  className={`${styles.categoriaCard} ${
                    categoriaAtiva === "Celulares" ? styles.categoriaAtiva : ""
                  }`}
                >
                  <span className={styles.iconeBox}>
                    <IconeCelular />
                  </span>
                  <strong>Celulares</strong>
                </button>

                <button
                  type="button"
                  onClick={() => buscarPorCategoria("Informática")}
                  className={`${styles.categoriaCard} ${
                    categoriaAtiva === "Informática"
                      ? styles.categoriaAtiva
                      : ""
                  }`}
                >
                  <span className={styles.iconeBox}>
                    <IconeComputador />
                  </span>
                  <strong>Informática</strong>
                </button>

                <button
                  type="button"
                  onClick={() => buscarPorCategoria("Eletrônicos")}
                  className={`${styles.categoriaCard} ${
                    categoriaAtiva === "Eletrônicos"
                      ? styles.categoriaAtiva
                      : ""
                  }`}
                >
                  <span className={styles.iconeBox}>
                    <IconeFone />
                  </span>
                  <strong>Eletrônicos</strong>
                </button>

                <button
                  type="button"
                  onClick={() => buscarPorCategoria("Games")}
                  className={`${styles.categoriaCard} ${
                    categoriaAtiva === "Games" ? styles.categoriaAtiva : ""
                  }`}
                >
                  <span className={styles.iconeBox}>
                    <IconeGame />
                  </span>
                  <strong>Games</strong>
                </button>

                <button
                  type="button"
                  onClick={() => buscarPorCategoria("Móveis")}
                  className={`${styles.categoriaCard} ${
                    categoriaAtiva === "Móveis" ? styles.categoriaAtiva : ""
                  }`}
                >
                  <span className={styles.iconeBox}>
                    <IconeMoveis />
                  </span>
                  <strong>Móveis</strong>
                </button>

                <button
                  type="button"
                  onClick={() => buscarPorCategoria("Eletrodomésticos")}
                  className={`${styles.categoriaCard} ${
                    categoriaAtiva === "Eletrodomésticos"
                      ? styles.categoriaAtiva
                      : ""
                  }`}
                >
                  <span className={styles.iconeBox}>
                    <IconeCasa />
                  </span>
                  <strong>Eletrodomésticos</strong>
                </button>
              </div>

              {carregandoCategoria && (
                <p className={styles.carregandoCategoria}>
                  Buscando produtos...
                </p>
              )}
            </section>
          </>
        )}

        {modoPesquisa && (
          <section className={styles.modoPesquisaBox}>
            <div>
              <span>Modo pesquisa</span>

              <h2>
                {produtosNaTela.length > 0
                  ? `${produtosNaTela.length} produto(s) encontrado(s)`
                  : "Nenhum produto encontrado"}
              </h2>

              <p>Confira os resultados encontrados para sua busca.</p>
            </div>

            <button type="button" onClick={limparPesquisa}>
              Limpar pesquisa
            </button>
          </section>
        )}

        {!modoPesquisa && vistosRecentemente.length > 0 && (
          <section className={styles.secaoVistos}>
            <div className={styles.topoVistos}>
              <h2>Vistos recentemente</h2>

              <button type="button" onClick={limparVistosRecentemente}>
                Limpar
              </button>
            </div>

            <div className={styles.grade}>
              {vistosRecentemente.map((produto) => (
                <CardProduto
                  key={produto.id}
                  id={produto.id}
                  nome={produto.nome}
                  marca={produto.marca}
                  categoria={produto.categoria}
                  descricao={produto.descricao}
                  preco={produto.preco}
                  avaliacao={produto.avaliacao || 0}
                  estoque={produto.estoque}
                  capa={produto.capa}
                />
              ))}
            </div>
          </section>
        )}

        {produtosNaTela.length > 0 ? (
          <>
            <h2 className={styles.tituloSecao}>
              {modoPesquisa
                ? "Resultados da pesquisa"
                : categoriaAtiva === "todos"
                  ? "Produtos em destaque"
                  : `Categoria: ${categoriaAtiva}`}
            </h2>

            <div className={styles.grade}>
              {produtosNaTela.map((produto) => (
                <CardProduto
                  key={produto.id}
                  id={produto.id}
                  nome={produto.nome}
                  marca={produto.marca}
                  categoria={produto.categoria}
                  descricao={produto.descricao}
                  preco={produto.preco}
                  avaliacao={produto.avaliacao || 0}
                  estoque={produto.estoque}
                  capa={produto.capa}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {modoPesquisa || categoriaAtiva !== "todos" ? (
              <div className={styles.semResultadosPesquisa}>
                <h2>
                  {modoPesquisa
                    ? "Nenhum produto encontrado"
                    : `Nenhum produto em ${categoriaAtiva}`}
                </h2>

                <p>Tente pesquisar por outro nome, marca ou categoria.</p>

                <button type="button" onClick={limparPesquisa}>
                  Ver produtos novamente
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.tituloSecao}>Descubra Mais</h2>

                <div className={styles.grade}>
                  {(aleatorios || []).map((produto) => (
                    <CardProduto
                      key={produto.id}
                      id={produto.id}
                      nome={produto.nome}
                      marca={produto.marca}
                      categoria={produto.categoria}
                      descricao={produto.descricao}
                      preco={produto.preco}
                      avaliacao={produto.avaliacao || 0}
                      estoque={produto.estoque}
                      capa={produto.capa}
                    />
                  ))}
                </div>

                <h2 className={styles.tituloSecao}>
                  Mais avaliados ao seu gosto :]
                </h2>

                <div className={styles.grade}>
                  {(maisAvaliados || []).map((produto) => (
                    <CardProduto
                      key={produto.id}
                      id={produto.id}
                      nome={produto.nome}
                      marca={produto.marca}
                      categoria={produto.categoria}
                      descricao={produto.descricao}
                      preco={produto.preco}
                      avaliacao={produto.avaliacao || 0}
                      estoque={produto.estoque}
                      capa={produto.capa}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  interface HelloResponse {
    aleatorios: Produto[];
    maisAvaliados: Produto[];
  }
  const response = await axios.get<HelloResponse>(
    `${process.env.SERVER_URL}/api/hello`,
  );
  const token = req.cookies.token || null;
  let user = null;

  if (token) {
    user = verificarToken(token);
  }

  return {
    props: {
      aleatorios: response.data.aleatorios,
      maisAvaliados: response.data.maisAvaliados,
      produtos: [],
      UMPALUMPA: "LG TRAMBICAGENS",
      user,
    },
  };
};
