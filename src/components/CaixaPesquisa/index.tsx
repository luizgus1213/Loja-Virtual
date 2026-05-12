import { useState, useEffect } from "react";
import axios from "axios";
import style from "./style.module.css";
import Product from "@/models/Produto";
interface CaixaPesquisaProps {
  callback: any;
  setFiltroAberto: any;
  router?: any;
}

const CaixaPesquisa = ({
  callback,
  setFiltroAberto,
  router,
}: CaixaPesquisaProps) => {
  const [pesquisa, setPesquisa] = useState("");
  const [valorMinimo, setvalorMinimo] = useState(0);
  const [valorMaximo, setvalorMaximo] = useState(99999999999999999999);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const [sidebarFechada, setSidebarFechada] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [avaliacaoMin, setAvaliacaoMin] = useState(0);
  const [ordenar, setOrdenar] = useState("");
  const [estoque, setEstoque] = useState(false);
  const buscarSugestoes = async (texto: string) => {
    if (!texto) {
      setSugestoes([]);
      return;
    }

    const response = await axios.get("/api/buscar", {
      params: { q: texto },
    });

    const nomes = response.data.map((p: any) => p.nome);

    const textoLower = texto.toLowerCase();

    const ordenado = nomes.sort((a: string, b: string) => {
      const aStarts = a.toLowerCase().startsWith(textoLower);
      const bStarts = b.toLowerCase().startsWith(textoLower);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.localeCompare(b);
    });

    setSugestoes(ordenado);
  };

  const pesquisar = async (min = valorMinimo, max = valorMaximo) => {
    if (pesquisa === "") return;

    const response = await axios.get("/api/pesquisar", {
      params: {
        pesquisa,
        valorMinimo: min,
        valorMaximo: max,
        marca,
        categoria,
        avaliacaoMin,
        ordenar,
        estoque,
      },
    });
    callback(response.data);
    setMostrarSugestoes(false);
  };

  const limparFiltros = async () => {
    setPesquisa("");
    setvalorMinimo(0);
    setvalorMaximo(100);
    setMarca("");
    setCategoria("");
    setAvaliacaoMin(0);
    setOrdenar("");
    setEstoque(false);

    const response = await axios.get("/api/pesquisar");
    callback(response.data);
    buscarSugestoes("");
  };

  useEffect(() => {
    if (pesquisa === "") return;

    pesquisar();
  }, [
    valorMinimo,
    valorMaximo,
    marca,
    categoria,
    avaliacaoMin,
    ordenar,
    estoque,
  ]);
  return (
    <>
      <div className={style.topo}>
        <button
          className={style.botaoReset}
          onClick={async () => {
            if (router) {
              router.back();
              return;
            }

            setPesquisa("");
            setMostrarSugestoes(false);

            const response = await axios.get("/api/pesquisar");
            callback(response.data);
          }}
        >
          ←
        </button>
        <input
          className={style.input}
          value={pesquisa}
          onChange={(e) => {
            setPesquisa(e.target.value);

            if (e.target.value.length > 0) {
              setMostrarSugestoes(true);
            } else {
              setMostrarSugestoes(false);
            }

            buscarSugestoes(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setMostrarSidebar(true);
              pesquisar();
            }
          }}
          type="text"
          placeholder="Buscar produtos,marcas e muito mais..."
        />
        {mostrarSugestoes && sugestoes.length > 0 && (
          <div className={style.sugestoes}>
            {sugestoes.map((s, i) => (
              <div
                key={i}
                className={style.itemSugestao}
                onClick={() => {
                  setPesquisa(s);
                  setSugestoes([]);
                  setMostrarSugestoes(false);
                  pesquisar();
                }}
              >
                🔍 {s}
              </div>
            ))}
          </div>
        )}
        {pesquisa.length > 0 ? (
          <button
            className={style.botaoCancelar}
            onClick={() => {
              setPesquisa("");
              setMostrarSugestoes(false);
              setMostrarSidebar(false);
            }}
          >
            X
          </button>
        ) : (
          <button className={style.botaoBuscar} onClick={() => pesquisar()}>
            🔍
          </button>
        )}
      </div>

      <div
        className={`
    ${style.sidebar}
    ${mostrarSidebar ? style.ativo : ""}
    ${sidebarFechada ? style.sidebarFechada : ""}
  `}
      >
        <button
          className={style.botaoSidebar}
          onClick={() => setSidebarFechada(!sidebarFechada)}
        >
          {sidebarFechada ? "→" : "←"}
        </button>

        {!sidebarFechada && (
          <>
            <h3>Filtros</h3>

            <p
              onClick={() => {
                setvalorMinimo(0);
                setvalorMaximo(350);
              }}
            >
              Até R$ 350
            </p>

            <p
              onClick={() => {
                setvalorMinimo(350);
                setvalorMaximo(650);
              }}
            >
              R$ 350 a R$ 650
            </p>

            <p
              onClick={() => {
                setvalorMinimo(650);
                setvalorMaximo(99999999999999999999);
              }}
            >
              Mais de R$ 650
            </p>

            <div className={style.precoRange}>
              <input
                value={valorMinimo === 0 ? "" : valorMinimo}
                onChange={(e) => setvalorMinimo(Number(e.target.value) || 0)}
                type="number"
                placeholder="Mínimo"
              />

              <span>-</span>

              <input
                value={valorMaximo === 99999999999999999999 ? "" : valorMaximo}
                onChange={(e) => setvalorMaximo(Number(e.target.value) || 0)}
                type="number"
                placeholder="Máximo"
              />
            </div>

            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              type="text"
              placeholder="Marca"
            />

            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              type="text"
              placeholder="Categoria"
            />

            <select
              value={avaliacaoMin}
              onChange={(e) => setAvaliacaoMin(Number(e.target.value))}
            >
              <option value={0}>Qualquer avaliação</option>
              <option value={1}>1⭐ ou mais</option>
              <option value={2}>2⭐ ou mais</option>
              <option value={3}>3⭐ ou mais</option>
              <option value={4}>4⭐ ou mais</option>
            </select>

            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
            >
              <option value="">Ordenar</option>
              <option value="preco_ASC">Preço ↑</option>
              <option value="preco_DESC">Preço ↓</option>
              <option value="avaliacao_DESC">Melhor avaliados</option>
            </select>

            <label className="label_Estoque">
              <input
                className="Estoque"
                type="checkbox"
                checked={estoque}
                onChange={(e) => setEstoque(e.target.checked)}
              />
              Somente em estoque
            </label>

            <button className={style.botaoLimpar} onClick={limparFiltros}>
              Limpar filtros
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default CaixaPesquisa;
