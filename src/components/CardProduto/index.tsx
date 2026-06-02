import BotaoComprar from "../BotaoComprar";
import axios from "axios";
import style from "./style.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
import { useRouter } from "next/router";
import Image from "next/image";
import { caminhoImagem } from "@/lib/imagem";
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
    // Impede que o clique no botão de favoritar também acione o clique do card.
    e.stopPropagation();

    try {
      await axios.post(
        "/api/favoritos/adicionar",
        {
          produtoId: prod.id,
        },
        {
          // Envia o cookie do usuário logado para o backend identificar quem está favoritando.
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
      // Permite abrir o produto também pelo teclado usando Enter, melhorando a acessibilidade.
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          abrirProduto();
        }
      }}
    >
      <div className={style["imagem-box"]}>
        <Image
          className={style["card-imagem"]}
          src={caminhoImagem(prod.capa?.link)}
          alt={prod.nome}
          fill
          sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, 250px"
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
            // Impede que clicar nos botões de ação abra a página do produto sem querer.
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
            // Se o estoque for zero, adiciona uma classe extra para estilizar como indisponível.
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
