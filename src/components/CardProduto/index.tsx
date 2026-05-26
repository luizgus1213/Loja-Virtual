import BotaoComprar from "../BotaoComprar";
import axios from "axios";
import style from "./style.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
import { useRouter } from "next/router";

interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: number;
  avaliacao: number;
  estoque: number;

  capa?: {
    id?: number;
    nome?: string;
    link: string;
  } | null;
}

const CardProduto = (prod: Produto) => {
  const { exibirAlerta } = useAlerta();
  const router = useRouter();

  function abrirProduto() {
    router.push(`/produto/${prod.id}`);
  }

  const favoritar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      await axios.post(
        "/api/favoritos/adicionar",
        {
          produtoId: prod.id,
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta("Produto favoritado!", "sucesso");
    } catch (err: any) {
      exibirAlerta(err.response?.data?.erro || "Erro", "erro");
    }
  };

  return (
    <article
      className={style["card-produto"]}
      onClick={abrirProduto}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          abrirProduto();
        }
      }}
    >
      <div className={style["imagem-box"]}>
        <img
          className={style["card-imagem"]}
          src={prod.capa?.link ? `/api/${prod.capa.link}` : "/sem-imagem.png"}
          alt={prod.nome}
        />
      </div>

      <div className={style["card-conteudo"]}>
        <h2 className={style["card-titulo"]}>{prod.nome}</h2>

        <div className={style["card-tags"]}>
          <span className={style.tag}>{prod.marca}</span>
          <span className={style.tag}>{prod.categoria}</span>
        </div>

        <p className={style["card-descricao"]}>{prod.descricao}</p>

        <strong className={style["card-preco"]}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(prod.preco)}
        </strong>

        <div
          className={style["acoes"]}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <BotaoComprar text="Comprar Agora" id={prod.id} />

          <button
            type="button"
            className={style["botao-favorito"]}
            onClick={favoritar}
          >
            ♡ Favoritar
          </button>
        </div>

        <div className={style["card-rodape"]}>
          <span className={style["card-avaliacao"]}>
            {prod.avaliacao > 0
              ? "⭐".repeat(Math.round(prod.avaliacao))
              : "Sem avaliação"}
          </span>

          <span
            className={`${style["card-estoque"]} ${
              prod.estoque <= 0 ? style["sem-estoque"] : ""
            }`}
          >
            {prod.estoque > 0 ? `${prod.estoque} em estoque` : "Indisponível"}
          </span>
        </div>
      </div>
    </article>
  );
};

export default CardProduto;
