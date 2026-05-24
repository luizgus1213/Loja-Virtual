import { useState } from "react";
import axios from "axios";
import styles from "./style.module.css";

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
    id: number;
    nome: string;
    link: string;
  } | null;
}

interface Props {
  callback: (produtos: Produto[]) => void;
  setFiltroAberto?: (aberto: boolean) => void;
  modo?: "home" | "produto";
}

const categorias = [
  "Celulares",
  "Informática",
  "Eletrônicos",
  "Games",
  "Móveis",
  "Eletrodomésticos",
  "Roupas",
  "Acessórios",
];

export default function CaixaPesquisa({
  callback,
  setFiltroAberto,
  modo = "home",
}: Props) {
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [valorMinimo, setValorMinimo] = useState("");
  const [valorMaximo, setValorMaximo] = useState("");
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false);

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function pesquisar(filtros?: {
    pesquisa?: string;
    categoria?: string;
    valorMinimo?: string;
    valorMaximo?: string;
    ordenacao?: string;
    apenasDisponiveis?: boolean;
  }) {
    try {
      setCarregando(true);

      const pesquisaFinal = filtros?.pesquisa ?? pesquisa;
      const categoriaFinal = filtros?.categoria ?? categoria;
      const valorMinimoFinal = filtros?.valorMinimo ?? valorMinimo;
      const valorMaximoFinal = filtros?.valorMaximo ?? valorMaximo;
      const ordenacaoFinal = filtros?.ordenacao ?? ordenacao;
      const apenasDisponiveisFinal =
        filtros?.apenasDisponiveis ?? apenasDisponiveis;

      const res = await axios.get("/api/pesquisar", {
        params: {
          pesquisa: pesquisaFinal.trim(),
          categoria: categoriaFinal,
          valorMinimo: valorMinimoFinal || 0,
          valorMaximo: valorMaximoFinal || 999999999,
          ordenacao: ordenacaoFinal,
          apenasDisponiveis: apenasDisponiveisFinal,
        },
      });

      callback(res.data || []);
    } catch (err: any) {
      console.log("ERRO AO PESQUISAR:", err);
      alert(err?.response?.data?.erro || "Erro ao pesquisar produtos");
    } finally {
      setCarregando(false);
    }
  }

  function abrirFecharFiltros() {
    const novoValor = !filtrosAbertos;

    setFiltrosAbertos(novoValor);

    if (setFiltroAberto) {
      setFiltroAberto(novoValor);
    }
  }

  function limparFiltros() {
    setPesquisa("");
    setCategoria("todos");
    setValorMinimo("");
    setValorMaximo("");
    setOrdenacao("relevancia");
    setApenasDisponiveis(false);

    window.location.href = "/";
  }

  function pesquisarComEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      pesquisar();
    }
  }

  function aplicarPreco(min: string, max: string) {
    setValorMinimo(min);
    setValorMaximo(max);

    pesquisar({
      valorMinimo: min,
      valorMaximo: max,
    });
  }

  function aplicarOrdenacao(valor: string) {
    setOrdenacao(valor);

    pesquisar({
      ordenacao: valor,
    });
  }

  function aplicarCategoria(valor: string) {
    setCategoria(valor);

    pesquisar({
      categoria: valor,
    });
  }

  function alternarEstoque() {
    const novoValor = !apenasDisponiveis;

    setApenasDisponiveis(novoValor);

    pesquisar({
      apenasDisponiveis: novoValor,
    });
  }

  return (
    <section
      className={`${styles.caixa} ${
        modo === "produto" ? styles.caixaProduto : ""
      }`}
    >
      <div className={styles.barraPrincipal}>
        <input
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          onKeyDown={pesquisarComEnter}
          placeholder={
            modo === "produto"
              ? "Buscar outro produto na loja..."
              : "Pesquisar produtos, marcas ou categorias..."
          }
          className={styles.inputPesquisa}
        />

        <button
          type="button"
          className={styles.botaoPesquisar}
          onClick={() => pesquisar()}
          disabled={carregando}
        >
          {carregando ? "Buscando..." : "Pesquisar"}
        </button>

        <button
          type="button"
          className={styles.botaoFiltro}
          onClick={abrirFecharFiltros}
        >
          {filtrosAbertos ? "Fechar filtros" : "Filtros"}
        </button>
      </div>
      {modo === "home" && (
        <div className={styles.filtrosRapidos}>
          <button type="button" onClick={() => aplicarPreco("0", "100")}>
            Até R$100
          </button>

          <button type="button" onClick={() => aplicarPreco("0", "300")}>
            Até R$300
          </button>

          <button type="button" onClick={() => aplicarPreco("300", "800")}>
            R$300 a R$800
          </button>

          <button type="button" onClick={() => aplicarPreco("800", "1500")}>
            R$800 a R$1500
          </button>

          <button type="button" onClick={() => aplicarPreco("1500", "3000")}>
            R$1500 a R$3000
          </button>

          <button
            type="button"
            onClick={() => aplicarPreco("3000", "999999999")}
          >
            Acima de R$3000
          </button>

          <button
            type="button"
            className={apenasDisponiveis ? styles.chipAtivo : ""}
            onClick={alternarEstoque}
          >
            Com estoque
          </button>

          <button type="button" onClick={() => aplicarOrdenacao("menor_preco")}>
            Menor preço
          </button>

          <button type="button" onClick={() => aplicarOrdenacao("maior_preco")}>
            Maior preço
          </button>

          <button
            type="button"
            onClick={() => aplicarOrdenacao("melhor_avaliacao")}
          >
            Mais avaliados
          </button>
        </div>
      )}

      {filtrosAbertos && (
        <div className={styles.filtrosBox}>
          <div className={styles.bloco}>
            <div className={styles.blocoTitulo}>
              <strong>Categorias</strong>
              <span>Clique para filtrar automaticamente</span>
            </div>

            <div className={styles.chips}>
              <button
                type="button"
                className={categoria === "todos" ? styles.chipAtivo : ""}
                onClick={() => aplicarCategoria("todos")}
              >
                Todos
              </button>

              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={categoria === cat ? styles.chipAtivo : ""}
                  onClick={() => aplicarCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.bloco}>
            <div className={styles.blocoTitulo}>
              <strong>Faixa de preço</strong>
              <span>Clique em uma faixa para pesquisar na hora</span>
            </div>

            <div className={styles.chips}>
              <button type="button" onClick={() => aplicarPreco("0", "100")}>
                Até R$100
              </button>

              <button type="button" onClick={() => aplicarPreco("0", "300")}>
                Até R$300
              </button>

              <button type="button" onClick={() => aplicarPreco("300", "800")}>
                R$300 a R$800
              </button>

              <button type="button" onClick={() => aplicarPreco("800", "1500")}>
                R$800 a R$1500
              </button>

              <button
                type="button"
                onClick={() => aplicarPreco("1500", "3000")}
              >
                R$1500 a R$3000
              </button>

              <button
                type="button"
                onClick={() => aplicarPreco("3000", "999999999")}
              >
                Acima de R$3000
              </button>
            </div>

            <div className={styles.precoManual}>
              <label>
                Mínimo
                <input
                  type="number"
                  min="0"
                  value={valorMinimo}
                  onChange={(e) => setValorMinimo(e.target.value)}
                  placeholder="R$ 0"
                />
              </label>

              <label>
                Máximo
                <input
                  type="number"
                  min="0"
                  value={valorMaximo}
                  onChange={(e) => setValorMaximo(e.target.value)}
                  placeholder="R$ 9999"
                />
              </label>
            </div>
          </div>

          <div className={styles.bloco}>
            <div className={styles.blocoTitulo}>
              <strong>Ordenação</strong>
              <span>Clique para ordenar automaticamente</span>
            </div>

            <div className={styles.chips}>
              <button
                type="button"
                className={ordenacao === "relevancia" ? styles.chipAtivo : ""}
                onClick={() => aplicarOrdenacao("relevancia")}
              >
                Relevância
              </button>

              <button
                type="button"
                className={ordenacao === "menor_preco" ? styles.chipAtivo : ""}
                onClick={() => aplicarOrdenacao("menor_preco")}
              >
                Menor preço
              </button>

              <button
                type="button"
                className={ordenacao === "maior_preco" ? styles.chipAtivo : ""}
                onClick={() => aplicarOrdenacao("maior_preco")}
              >
                Maior preço
              </button>

              <button
                type="button"
                className={
                  ordenacao === "melhor_avaliacao" ? styles.chipAtivo : ""
                }
                onClick={() => aplicarOrdenacao("melhor_avaliacao")}
              >
                Melhor avaliação
              </button>

              <button
                type="button"
                className={
                  ordenacao === "mais_recentes" ? styles.chipAtivo : ""
                }
                onClick={() => aplicarOrdenacao("mais_recentes")}
              >
                Mais recentes
              </button>

              <button
                type="button"
                className={
                  ordenacao === "maior_estoque" ? styles.chipAtivo : ""
                }
                onClick={() => aplicarOrdenacao("maior_estoque")}
              >
                Maior estoque
              </button>
            </div>
          </div>

          <div className={styles.bloco}>
            <div className={styles.blocoTitulo}>
              <strong>Disponibilidade</strong>
              <span>Filtra produtos disponíveis</span>
            </div>

            <label className={styles.checkBox}>
              <input
                type="checkbox"
                checked={apenasDisponiveis}
                onChange={alternarEstoque}
              />

              <span>Mostrar somente produtos com estoque</span>
            </label>
          </div>

          <div className={styles.acoesFiltro}>
            <button
              type="button"
              className={styles.botaoAplicar}
              onClick={() => pesquisar()}
              disabled={carregando}
            >
              {carregando ? "Aplicando..." : "Aplicar filtros manuais"}
            </button>

            <button
              type="button"
              className={styles.botaoLimpar}
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
