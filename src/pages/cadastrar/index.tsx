import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import style from "./style.module.css";
import axios from "axios";
import { verificarToken } from "@/lib/auth";

const AdicionarItens = () => {
  const [produto, setProduto] = useState({
    nome: "",
    marca: "",
    categoria: "",
    descricao: "",
    preco: 0,
    estoque: 0,
    promocao: false,
    avaliacao: 0,
  });

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [imagem, setImagem] = useState<File | null>(null);
  const [produtoParaSalvarId, setProdutoParaSalvarId] = useState<number | null>(
    null,
  );
  const [limit, setLimit] = useState(10);
  const [imagemParaSalvar, setImagemParaSalvar] = useState(null);
  const [buscaAdmin, setBuscaAdmin] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  const verificarAdmin = async () => {
    try {
      const res = await axios.get("/api/auth/me");

      if (res.data?.acesso === "admin") {
        setAutorizado(true);
      } else {
        window.location.href = "/";
      }
    } catch {
      window.location.href = "/auth";
    } finally {
      setCarregando(false);
    }
  };

  const carrega_produtos = async () => {
    try {
      const response = await axios.get("/api/admin/listar", {
        params: {
          limit,
          pesquisa: buscaAdmin,
        },
      });

      setProdutos(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cadastra_produto = async () => {
    try {
      const formData = new FormData();

      formData.append("nome", produto.nome);
      formData.append("marca", produto.marca);
      formData.append("categoria", produto.categoria);
      formData.append("descricao", produto.descricao);
      formData.append("preco", produto.preco.toString());
      formData.append("estoque", produto.estoque.toString());
      formData.append("avaliacao", produto.avaliacao.toString());

      if (imagem) {
        formData.append("arquivo", imagem);
      }

      await axios.post("/api/criar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Produto criado com imagem!");

      setProduto({
        nome: "",
        marca: "",
        categoria: "",
        descricao: "",
        preco: 0,
        estoque: 0,
        promocao: false,
        avaliacao: 0,
      });

      setImagem(null);

      carrega_produtos();
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar");
    }
  };

  const excluirProduto = async (id: number) => {
    try {
      await axios.delete("/api/excluir", {
        params: { id },
      });

      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir produto");
    }
  };

  const mudaImagem = (e: any, produto_id: number) => {
    const arquivo_selecionado = e.target.files[0];
    setImagemParaSalvar(arquivo_selecionado);
    setProdutoParaSalvarId(produto_id);
  };

  const faz_upload = async () => {
    if (!produtoParaSalvarId || !imagemParaSalvar) {
      return alert("Por favor, selecione um arquivo primeiro.");
    }

    const formulario = new FormData();
    formulario.append("arquivo", imagemParaSalvar);
    formulario.append("produto_id", produtoParaSalvarId.toString());

    try {
      await axios.post("/api/upload", formulario, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImagemParaSalvar(null);
      setProdutoParaSalvarId(null);
      carrega_produtos();
      alert("Imagem salva com sucesso!");
    } catch (err) {
      console.log(err);
      alert("Não foi possível salvar a imagem no servidor");
    }
  };

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    if (autorizado) {
      carrega_produtos();
    }
  }, [limit, buscaAdmin, autorizado]);

  if (carregando) return <h1>Verificando acesso...</h1>;
  if (!autorizado) return null;

  return (
    <div className={style["adicionar-container"]}>
      <h1>Adicionar produto ao catálogo</h1>

      <input
        className={style["buscaAdmin"]}
        type="text"
        placeholder="Buscar produto para excluir..."
        value={buscaAdmin}
        onChange={(e) => setBuscaAdmin(e.target.value)}
      />

      <div className={style["formulario"]}>
        <input
          type="text"
          placeholder="Nome do produto"
          value={produto.nome}
          onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
        />

        <input
          type="text"
          placeholder="Marca"
          value={produto.marca}
          onChange={(e) => setProduto({ ...produto, marca: e.target.value })}
        />

        <input
          type="text"
          placeholder="Categoria"
          value={produto.categoria}
          onChange={(e) =>
            setProduto({ ...produto, categoria: e.target.value })
          }
        />

        <textarea
          placeholder="Descrição do produto"
          value={produto.descricao}
          onChange={(e) =>
            setProduto({ ...produto, descricao: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Preço (R$)"
          value={
            produto.preco === 0
              ? ""
              : produto.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
          }
          onChange={(e) => {
            let valor = e.target.value;
            valor = valor.replace(/\D/g, "");
            const numero = Number(valor) / 100;
            setProduto({ ...produto, preco: numero });
          }}
        />

        <input
          type="number"
          placeholder="Estoque"
          value={produto.estoque === 0 ? "" : produto.estoque}
          onChange={(e) =>
            setProduto({ ...produto, estoque: Number(e.target.value) })
          }
        />

        <label>Avaliação:</label>
        <select
          value={produto.avaliacao}
          onChange={(e) =>
            setProduto({ ...produto, avaliacao: Number(e.target.value) })
          }
        >
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <option key={v} value={v}>
              {v} ⭐
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setImagem(e.target.files?.[0] || null)}
        />

        <button onClick={cadastra_produto}>Adicionar produto</button>
      </div>

      <h2>Produtos cadastrados</h2>

      <div className={style["produtos-cadastrados"]}>
        {produtos.map((p) => (
          <div key={p.id} className={style["produto-item"]}>
            {p.imagem ? (
              <img src={p.imagem.link} alt={p.nome} width={80} />
            ) : (
              <div className={style["upload-box"]}>
                <input type="file" onChange={(e) => mudaImagem(e, p.id)} />
                {produtoParaSalvarId === p.id && (
                  <button onClick={faz_upload}>Confirmar Upload</button>
                )}
              </div>
            )}

            <div>
              <h3>{p.nome}</h3>
              <p>R$ {p.preco.toFixed(2)}</p>
              <p>{"⭐".repeat(Math.floor(p.avaliacao))}</p>
            </div>

            <button
              onClick={() => {
                if (confirm("Tem certeza que deseja excluir?")) {
                  excluirProduto(p.id);
                }
              }}
              className={style["excluir"]}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>

      <button
        className={style["carregarMais"]}
        onClick={() => setLimit(limit + 20)}
      >
        Carregar mais produtos
      </button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const token = req.cookies.token || null;
  let user = null;

  if (token) {
    user = verificarToken(token);
  }

  if (!user || user?.acesso !== "admin") {
    return {
      props: {},
      redirect: {
        destination: "/erroAcessoAdmin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default AdicionarItens;
