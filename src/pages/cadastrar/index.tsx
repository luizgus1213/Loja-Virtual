import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import style from "./style.module.css";
import axios from "axios";
import { verificarToken } from "@/lib/auth";
import { useRouter } from "next/router";
import { useTema } from "@/contexts/ThemeContext";
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
    link: string;
  };

  imagens?: {
    arquivo: {
      link: string;
    };
  }[];
}
interface AuthMeResponse {
  id: number;
  nome: string;
  email: string;
  acesso: "admin" | "user";
}
const produtoInicial = {
  nome: "",
  marca: "",
  categoria: "",
  descricao: "",
  preco: 0,
  estoque: 0,
  promocao: false,
  avaliacao: 0,
};

export default function AdicionarItens() {
  const router = useRouter();
  const { tema } = useTema();
  const { exibirAlerta } = useAlerta();

  const [produto, setProduto] = useState(produtoInicial);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [imagens, setImagens] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  const [limit, setLimit] = useState(10);
  const [buscaAdmin, setBuscaAdmin] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function verificarAdmin() {
    try {
      const res = await axios.get<AuthMeResponse>("/api/auth/me", {
        withCredentials: true,
      });

      if (res.data?.acesso === "admin") {
        setAutorizado(true);
        return;
      }

      router.push("/");
    } catch {
      router.push("/auth");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarProdutos() {
    try {
      setSalvando(true);

      const response = await axios.get<Produto[]>("/api/admin/listar", {
        params: {
          limit,
          pesquisa: buscaAdmin,
        },
        withCredentials: true,
      });

      setProdutos(response.data || []);
    } catch (err) {
      console.error(err);
      exibirAlerta("Erro ao carregar produtos", "erro");
    } finally {
      setSalvando(false);
    }
  }
  function abrirEdicao(produtoSelecionado: Produto) {
    setEditandoId(produtoSelecionado.id);

    setProduto({
      nome: produtoSelecionado.nome || "",
      marca: produtoSelecionado.marca || "",
      categoria: produtoSelecionado.categoria || "",
      descricao: produtoSelecionado.descricao || "",
      preco: Number(produtoSelecionado.preco || 0),
      estoque: Number(produtoSelecionado.estoque || 0),
      promocao: false,
      avaliacao: Number(produtoSelecionado.avaliacao || 0),
    });

    setImagens([]);

    preview.forEach((img) => URL.revokeObjectURL(img));
    setPreview([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setProduto(produtoInicial);
    setImagens([]);

    preview.forEach((img) => URL.revokeObjectURL(img));
    setPreview([]);
  }

  async function salvarEdicaoProduto() {
    try {
      if (!editandoId) {
        return exibirAlerta("Nenhum produto selecionado para editar", "erro");
      }

      if (!produto.nome.trim()) {
        return exibirAlerta("Informe o nome do produto", "erro");
      }

      if (!produto.marca.trim()) {
        return exibirAlerta("Informe a marca do produto", "erro");
      }

      if (!produto.categoria.trim()) {
        return exibirAlerta("Informe a categoria do produto", "erro");
      }

      if (!produto.descricao.trim()) {
        return exibirAlerta("Informe a descrição do produto", "erro");
      }

      if (Number(produto.preco) <= 0) {
        return exibirAlerta("Informe um preço válido", "erro");
      }

      if (!Number.isInteger(Number(produto.estoque)) || produto.estoque < 0) {
        return exibirAlerta("Informe um estoque válido", "erro");
      }

      setSalvando(true);

      await axios.put(
        "/api/admin/produtos/editar",
        {
          id: editandoId,
          nome: produto.nome.trim(),
          marca: produto.marca.trim(),
          categoria: produto.categoria.trim(),
          descricao: produto.descricao.trim(),
          preco: produto.preco,
          estoque: produto.estoque,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Produto atualizado com sucesso!", "sucesso");

      cancelarEdicao();
      carregarProdutos();
    } catch (err: any) {
      console.error(err);
      exibirAlerta(
        err?.response?.data?.erro || "Erro ao editar produto",
        "erro",
      );
    } finally {
      setSalvando(false);
    }
  }
  function adicionarImagens(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setImagens((imagensAntigas) => [...imagensAntigas, ...files]);

    const novosPreviews = files.map((file) => URL.createObjectURL(file));

    setPreview((previewsAntigos) => [...previewsAntigos, ...novosPreviews]);

    e.target.value = "";
  }

  function removerImagem(index: number) {
    setImagens((imagensAntigas) =>
      imagensAntigas.filter((_, i) => i !== index),
    );

    setPreview((previewsAntigos) => {
      URL.revokeObjectURL(previewsAntigos[index]);

      return previewsAntigos.filter((_, i) => i !== index);
    });
  }

  async function cadastrarProduto() {
    try {
      if (!produto.nome.trim()) {
        return exibirAlerta("Informe o nome do produto", "erro");
      }

      if (!produto.marca.trim()) {
        return exibirAlerta("Informe a marca do produto", "erro");
      }

      if (!produto.categoria.trim()) {
        return exibirAlerta("Informe a categoria do produto", "erro");
      }

      if (!produto.descricao.trim()) {
        return exibirAlerta("Informe a descrição do produto", "erro");
      }

      if (Number(produto.preco) <= 0) {
        return exibirAlerta("Informe um preço válido", "erro");
      }

      if (!Number.isInteger(Number(produto.estoque)) || produto.estoque < 0) {
        return exibirAlerta("Informe um estoque válido", "erro");
      }

      setSalvando(true);

      const formData = new FormData();

      formData.append("nome", produto.nome.trim());
      formData.append("marca", produto.marca.trim());
      formData.append("categoria", produto.categoria.trim());
      formData.append("descricao", produto.descricao.trim());
      formData.append("preco", produto.preco.toString());
      formData.append("estoque", produto.estoque.toString());
      formData.append("avaliacao", produto.avaliacao.toString());

      imagens.forEach((imagem) => {
        formData.append("arquivos", imagem);
      });

      await axios.post("/api/criar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      exibirAlerta("Produto cadastrado!", "sucesso");

      setProduto(produtoInicial);
      setImagens([]);

      preview.forEach((img) => URL.revokeObjectURL(img));
      setPreview([]);

      carregarProdutos();
    } catch (err) {
      console.error(err);
      exibirAlerta("Erro ao cadastrar produto", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id: number) {
    try {
      const confirmar = confirm("Tem certeza que deseja excluir este produto?");

      if (!confirmar) return;

      await axios.delete("/api/excluir", {
        params: {
          id,
        },
        withCredentials: true,
      });

      setProdutos((prev) => prev.filter((p) => p.id !== id));

      exibirAlerta("Produto excluído!", "sucesso");
    } catch (err) {
      console.error(err);
      exibirAlerta("Erro ao excluir produto", "erro");
    }
  }

  async function adicionarImagemProduto(
    e: React.ChangeEvent<HTMLInputElement>,
    produtoId: number,
  ) {
    try {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) return;

      const imagensValidas = files.filter((file) =>
        file.type.startsWith("image/"),
      );

      if (imagensValidas.length === 0) {
        e.target.value = "";
        return exibirAlerta("Selecione apenas imagens", "erro");
      }

      for (const file of imagensValidas) {
        const formulario = new FormData();

        formulario.append("arquivo", file);
        formulario.append("produto_id", produtoId.toString());

        await axios.post("/api/upload", formulario, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      }

      exibirAlerta("Imagem adicionada!", "sucesso");

      e.target.value = "";

      carregarProdutos();
    } catch (err) {
      console.error(err);
      exibirAlerta("Erro ao adicionar imagem", "erro");
    }
  }

  function formatarPrecoInput(valor: number) {
    if (valor === 0) return "";

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function alterarPreco(valorDigitado: string) {
    const somenteNumeros = valorDigitado.replace(/\D/g, "");
    const numero = Number(somenteNumeros) / 100;

    setProduto({
      ...produto,
      preco: numero,
    });
  }

  function imagemPrincipalProduto(produto: Produto) {
    if (produto.imagens?.[0]?.arquivo?.link) {
      return produto.imagens[0].arquivo.link;
    }

    if (produto.imagem?.link) {
      return produto.imagem.link;
    }

    return null;
  }

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    if (autorizado) {
      carregarProdutos();
    }
  }, [limit, buscaAdmin, autorizado]);

  useEffect(() => {
    return () => {
      preview.forEach((img) => {
        URL.revokeObjectURL(img);
      });
    };
  }, [preview]);

  if (carregando) {
    return (
      <div
        className={`${style.adicionarContainer} ${tema === "dark" ? "dark" : ""}`}
      >
        <h1>Verificando acesso...</h1>
      </div>
    );
  }

  if (!autorizado) {
    return null;
  }

  return (
    <div
      className={`${style.adicionarContainer} ${tema === "dark" ? "dark" : ""}`}
    >
      <button className={style.botaoVoltar} onClick={() => router.push("/")}>
        ← Voltar para início
      </button>

      <h1>{editandoId ? "Editar produto" : "Adicionar produto ao catálogo"}</h1>
      <input
        className={style.buscaAdmin}
        type="text"
        placeholder="Buscar produto para excluir..."
        value={buscaAdmin}
        onChange={(e) => setBuscaAdmin(e.target.value)}
      />

      <div className={style.formulario}>
        <input
          type="text"
          placeholder="Nome do produto"
          value={produto.nome}
          onChange={(e) =>
            setProduto({
              ...produto,
              nome: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Marca"
          value={produto.marca}
          onChange={(e) =>
            setProduto({
              ...produto,
              marca: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Categoria"
          value={produto.categoria}
          onChange={(e) =>
            setProduto({
              ...produto,
              categoria: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Descrição do produto"
          value={produto.descricao}
          onChange={(e) =>
            setProduto({
              ...produto,
              descricao: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Preço (R$)"
          value={formatarPrecoInput(produto.preco)}
          onChange={(e) => alterarPreco(e.target.value)}
        />

        <input
          type="number"
          placeholder="Estoque"
          min={0}
          value={produto.estoque === 0 ? "" : produto.estoque}
          onChange={(e) =>
            setProduto({
              ...produto,
              estoque: Number(e.target.value),
            })
          }
        />

        {!editandoId && (
          <>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={adicionarImagens}
            />

            {preview.length > 0 && (
              <div className={style.previewContainer}>
                {preview.map((img, index) => (
                  <div key={index} className={style.previewItem}>
                    <img
                      src={img}
                      className={style.previewImagem}
                      alt={`Prévia ${index + 1}`}
                    />

                    <button
                      type="button"
                      className={style.botaoRemoverImagem}
                      onClick={() => removerImagem(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {preview.length > 0 && (
          <div className={style.previewContainer}>
            {preview.map((img, index) => (
              <div key={index} className={style.previewItem}>
                <img
                  src={img}
                  className={style.previewImagem}
                  alt={`Prévia ${index + 1}`}
                />

                <button
                  type="button"
                  className={style.botaoRemoverImagem}
                  onClick={() => removerImagem(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          disabled={salvando}
          className={style.botao}
          onClick={editandoId ? salvarEdicaoProduto : cadastrarProduto}
        >
          {salvando
            ? "Salvando..."
            : editandoId
              ? "Salvar alterações"
              : "Adicionar produto"}
        </button>

        {editandoId && (
          <button
            type="button"
            className={style.botaoCancelarEdicao}
            onClick={cancelarEdicao}
            disabled={salvando}
          >
            Cancelar edição
          </button>
        )}
      </div>

      <h2>Produtos cadastrados</h2>

      <div className={style["produtos-cadastrados"]}>
        {produtos.map((p) => {
          const imagem = imagemPrincipalProduto(p);

          return (
            <div key={p.id} className={style.produtoItem}>
              {imagem ? (
                <img src={`/${imagem}`} alt={p.nome} />
              ) : (
                <div className={style["upload-box"]}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => adicionarImagemProduto(e, p.id)}
                  />
                </div>
              )}

              <div className={style.infoProduto}>
                <h3>{p.nome}</h3>

                <p>
                  {p.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>

                <p>
                  Avaliação:{" "}
                  {Number(p.avaliacao || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>

              <div className={style.acoesProduto}>
                <button
                  type="button"
                  onClick={() => abrirEdicao(p)}
                  className={style.editar}
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => excluirProduto(p.id)}
                  className={style.excluir}
                >
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={style.carregarMais}
        onClick={() => setLimit(limit + 20)}
      >
        Carregar mais produtos
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.token || null;

  let user: AuthMeResponse | null = null;

  if (token) {
    user = verificarToken(token) as AuthMeResponse | null;
  }

  if (!user || user.acesso !== "admin") {
    return {
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
