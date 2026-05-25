import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAlerta } from "@/contexts/AlertaContext";

interface ProdutoResponse {
  id: number;
  nome: string;
  descricao: string;
  preco: number;

  imagem?: {
    link: string;
  } | null;

  capa?: {
    link: string;
  } | null;
}

interface ComprarDiretoResponse {
  pedidoId: number;
}

export default function ComprarProduto() {
  const router = useRouter();
  const { exibirAlerta } = useAlerta();
  const { id } = router.query;

  const [produto, setProduto] = useState<ProdutoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);

  async function carregarProduto() {
    try {
      if (!id || Array.isArray(id)) return;

      setLoading(true);

      const res = await axios.get<ProdutoResponse>(`/api/produto/${id}`);

      setProduto(res.data);
    } catch (err) {
      console.log(err);
      exibirAlerta("Erro ao carregar produto", "erro");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function comprar() {
    try {
      if (!produto) {
        exibirAlerta("Produto não carregado", "erro");
        return;
      }

      setComprando(true);

      const res = await axios.post<ComprarDiretoResponse>(
        "/api/checkout/comprar_direto",
        {
          produtoId: produto.id,
          quantidade: 1,
          cor: "Padrão",
          tamanho: "Padrão",
        },
        {
          withCredentials: true,
        },
      );

      router.push(`/pedido/${res.data.pedidoId}`);
    } catch (err: any) {
      exibirAlerta(err?.response?.data?.erro || "Erro ao comprar", "erro");

      if (err?.response?.status === 401) {
        router.push("/auth?modo=cadastro");
      }
    } finally {
      setComprando(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;

    carregarProduto();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <div
        style={{
          padding: 30,
        }}
      >
        <p>Carregando...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div
        style={{
          padding: 30,
        }}
      >
        <p>Produto não encontrado.</p>

        <button type="button" onClick={() => router.push("/")}>
          Voltar para loja
        </button>
      </div>
    );
  }

  const imagem = produto.imagem?.link || produto.capa?.link || "sem-imagem.png";

  return (
    <div
      style={{
        padding: 30,
      }}
    >
      <img
        src={`/${imagem}`}
        width={300}
        alt={produto.nome}
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: 12,
        }}
      />

      <h1>{produto.nome}</h1>

      <p>{produto.descricao}</p>

      <h2>
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(produto.preco || 0))}
      </h2>

      <button type="button" onClick={comprar} disabled={comprando}>
        {comprando ? "Comprando..." : "Comprar agora"}
      </button>
    </div>
  );
}
