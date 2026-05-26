import Produto from "./Produto";
import Favorito from "./Favorito";
import User from "./User";
import Notificacao from "./Notificacao";
import Avaliacao from "./Avaliacao";
import Endereco from "./Endereco";
import Pedido from "./Pedido";
import PedidoItem from "./PedidoItem";
import PedidoStatusLog from "./PedidoStatusLog";

import Carrinho from "./Carrinho";
import CarrinhoItem from "./CarrinhoItem";

import Arquivo from "./Arquivo";
import ProdutoImagem from "./ProdutoImagem";
import Cupom from "./Cupom";

/* FAVORITOS */

Favorito.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

Produto.hasMany(Favorito, {
  foreignKey: "produto_id",
  as: "favoritos",
});

/* PEDIDOS */

Pedido.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(Pedido, {
  foreignKey: "user_id",
  as: "pedidos",
});

Pedido.hasMany(PedidoItem, {
  foreignKey: "pedido_id",
  as: "itens",
});

PedidoItem.belongsTo(Pedido, {
  foreignKey: "pedido_id",
  as: "pedido",
});

PedidoItem.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

Produto.hasMany(PedidoItem, {
  foreignKey: "produto_id",
  as: "itensPedido",
});

/* CARRINHO */

Carrinho.hasMany(CarrinhoItem, {
  foreignKey: "carrinho_id",
  as: "itens",
});

CarrinhoItem.belongsTo(Carrinho, {
  foreignKey: "carrinho_id",
  as: "carrinho",
});

Produto.hasMany(CarrinhoItem, {
  foreignKey: "produto_id",
  as: "itensCarrinho",
});

CarrinhoItem.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

/* IMAGENS DO PRODUTO */

Produto.hasMany(ProdutoImagem, {
  foreignKey: "produto_id",
  as: "imagens",
});

ProdutoImagem.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

ProdutoImagem.belongsTo(Arquivo, {
  foreignKey: "arquivo_id",
  as: "arquivo",
});

Arquivo.hasMany(ProdutoImagem, {
  foreignKey: "arquivo_id",
  as: "produtoImagens",
});

Produto.belongsTo(Arquivo, {
  foreignKey: "imagem_id",
  as: "capa",
});

Arquivo.hasOne(Produto, {
  foreignKey: "imagem_id",
  as: "produtoCapa",
});

/* AVALIAÇÕES */

Produto.hasMany(Avaliacao, {
  foreignKey: "produto_id",
  as: "avaliacoes",
});

Avaliacao.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

User.hasMany(Avaliacao, {
  foreignKey: "user_id",
  as: "avaliacoes",
});

Avaliacao.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Pedido.hasMany(Avaliacao, {
  foreignKey: "pedido_id",
  as: "avaliacoes",
});

Avaliacao.belongsTo(Pedido, {
  foreignKey: "pedido_id",
  as: "pedido",
});

/* LOGS DE STATUS DO PEDIDO */

Pedido.hasMany(PedidoStatusLog, {
  foreignKey: "pedido_id",
  as: "logsStatus",
});

PedidoStatusLog.belongsTo(Pedido, {
  foreignKey: "pedido_id",
  as: "pedido",
});

User.hasMany(PedidoStatusLog, {
  foreignKey: "admin_id",
  as: "logsAlterados",
});

PedidoStatusLog.belongsTo(User, {
  foreignKey: "admin_id",
  as: "admin",
});

/* CUPONS */

Pedido.belongsTo(Cupom, {
  foreignKey: "cupom_id",
  as: "cupom",
});

Cupom.hasMany(Pedido, {
  foreignKey: "cupom_id",
  as: "pedidos",
});

/* ENDEREÇOS */

Pedido.belongsTo(Endereco, {
  foreignKey: "endereco_id",
  as: "endereco",
});

Endereco.hasMany(Pedido, {
  foreignKey: "endereco_id",
  as: "pedidos",
});

/* NOTIFICAÇÕES */

User.hasMany(Notificacao, {
  foreignKey: "user_id",
  as: "notificacoes",
});

Notificacao.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
