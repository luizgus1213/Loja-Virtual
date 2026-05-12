import BotaoComprar from "../BotaoComprar";

import style from "./style.module.css";

const CardProduto = (prod: Produto) => {
  return (
    <div className={style["card-produto"]}>
      <img
        className={style["card-imagem"]}
        src={`/${prod.imagem?.link}`}
        alt=""
      />
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

        <BotaoComprar text="Comprar Agora" id={prod.id} />
        <div className={style["card-rodape"]}>
          <span className={style["card-avaliacao"]}>
            {"⭐".repeat(Math.round(prod.avaliacao))} <br />
          </span>
          <span className={style["card-estoque"]}>Restam {prod.estoque}</span>
        </div>
      </div>
    </div>
  );
};

export default CardProduto;
