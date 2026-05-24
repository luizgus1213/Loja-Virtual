import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAlerta } from "@/contexts/AlertaContext";
export default function ComprarProduto() {
  const router = useRouter();
  const { exibirAlerta } = useAlerta();
  const { id } = router.query;

  const [produto, setProduto] = useState<any>(null);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  async function carregarProduto() {
    try {
      if (!id) return;

      const res = await axios.get(`/api/produto/${id}`);

      setProduto(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function comprar() {
    try {
      const res = await axios.post("/api/checkout/comprar_direto", {
        produtoId: produto.id,
        quantidade: 1,
        cor: "Padrão",
        tamanho: "tamanho=Padrão",
      });

      router.push(`/pedido/${res.data.pedidoId}`);
    } catch (err: any) {
      exibirAlerta(err.response?.data?.erro || "Erro ao comprar", "erro");
    }
  }

  useEffect(() => {
    carregarProduto();
  }, [id]);

  if (!produto) {
    return <p>Carregando...</p>;
  }

  return (
    <div
      style={{
        padding: 30,
      }}
    >
      <img src={`/${produto.imagem?.link}`} width={300} />

      <h1>{produto.nome}</h1>

      <p>{produto.descricao}</p>

      <h2>
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(produto.preco)}
      </h2>

      <button onClick={comprar}>Comprar agora</button>
    </div>
  );
}
