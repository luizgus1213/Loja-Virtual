import { GetServerSideProps } from "next";
import axios from "axios";
import styles from "./style.module.css";
import CaixaPesquisa from "@/components/CaixaPesquisa";
import { useRouter } from "next/router";
import { useState } from "react";
import homeStyles from "@/styles/Home.module.css";

interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: number;
  avaliacao: number;
  estoque: number;
  imagem?: { link: string };
}

interface Props {
  produto: Produto | null;
  relacionados: Produto[];
}
export default function ProdutoPage({ produto, relacionados }: Props) {
  const [, setProdutos] = useState<Produto[]>([]);
  const router = useRouter();

  if (!produto) {
    return (
      <div className={styles.erro}>
        <h2>Produto não encontrado 😢</h2>
        <button onClick={() => router.push("/")}>Voltar</button>
      </div>
    );
  }

  return (
    <>
      <header className={homeStyles.header}>
        <h1>LG TRAMBICAGENS</h1>
      </header>
      <div className={styles.container}>
        <CaixaPesquisa
          callback={setProdutos}
          setFiltroAberto={() => {}}
          router={router}
        />{" "}
        <div className={styles.cardPrincipal}>
          <div className={styles.produto}>
            {produto.imagem?.link && (
              <img src={`/${produto.imagem.link}`} alt={produto.nome} />
            )}

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

              <div className={styles.botoes}>
                <button className={styles.btnCarrinho}>
                  Adicionar ao carrinho
                </button>

                <button className={styles.btnComprar}>Comprar agora</button>
              </div>

              <div className={styles.descricao}>
                <h3>Descrição</h3>
                <p>{produto.descricao}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.relacionadosBox}>
          <h3>Outros produtos</h3>

          <div className={styles.relacionados}>
            {relacionados.map((p) => (
              <div
                key={p.id}
                className={styles.card}
                onClick={() => router.push(`/produto/${p.id}`)}
              >
                {p.imagem?.link && (
                  <img src={`/${p.imagem.link}`} alt={p.nome} />
                )}
                <p>{p.nome}</p>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(p.preco)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.params!;

  try {
    // produto específico
    const produtoRes = await axios.get(
      process.env.SERVER_URL + `/api/produto/${id}`,
    );

    const produto = produtoRes.data;

    // outros produtos
    const outrosRes = await axios.get(
      process.env.SERVER_URL + "/api/pesquisar",
    );

    const relacionados = (outrosRes.data || [])
      .filter((p: any) => p.id !== Number(id))
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
