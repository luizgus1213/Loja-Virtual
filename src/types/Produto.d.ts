interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: number;
  avaliacao: number;
  estoque: number;
  imagem: {
    id: number;
    nome: string;
    link: string;
  };
}
