import { useState } from "react";
import styles from "@/styles/Home.module.css";
import CardProduto from "@/components/CardProduto";
import { GetServerSideProps } from "next";
import axios from "axios";
import CaixaPesquisa from "@/components/CaixaPesquisa";
import MenuHamburguer from "@/components/Menu/MenuHamburguer";
import { verificarToken } from "@/lib/auth";

interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: number;
  avaliacao?: number;
  estoque: number;
  imagem: { id: number; nome: string; link: string };
}

interface HomeProps {
  produtos: Produto[];
  UMPALUMPA: string;
  user: {
    id: number;
    email: string;
    nome: string;
    acesso: string;
  };
}

function Home({ produtos, UMPALUMPA, user }: HomeProps) {
  const [produtosNaTela, setProdutosNaTela] = useState<Produto[]>(produtos);
  const [filtroAberto, setFiltroAberto] = useState(false);
  return (
    <>
      <header className={styles.header}>
        <h1>{UMPALUMPA}</h1>
        {user?.acesso === "admin" && (
          <a href="/cadastrar" className={styles.botaoCriar}>
            + Criar
          </a>
        )}
      </header>

      <main
        className={`${styles.main_section} ${
          filtroAberto ? styles.comFiltro : ""
        }`}
      >
        <CaixaPesquisa
          callback={setProdutosNaTela}
          setFiltroAberto={setFiltroAberto}
        />
        <div className={styles.menuHamburguer}>
          <MenuHamburguer />
        </div>

        <div className={styles.grade}>
          {produtosNaTela.length === 0 ? (
            <div className={styles.semResultados}>
              <div className={styles.icon}>🔍</div>

              <h2>Nenhum produto encontrado</h2>

              <p>Verifique a ortografia ou tente buscar com outros termos.</p>

              <button
                className={styles.limparErro}
                onClick={() => window.location.reload()}
              >
                Limpar busca
              </button>
            </div>
          ) : (
            produtosNaTela.map((produto) => (
              <CardProduto
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                marca={produto.marca}
                categoria={produto.categoria}
                descricao={produto.descricao}
                preco={produto.preco}
                avaliacao={produto.avaliacao || 0}
                estoque={produto.estoque}
                imagem={produto.imagem}
              />
            ))
          )}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const response = await axios.get(process.env.SERVER_URL + "/api/hello");

  const token = req.cookies.token || null;
  let user = null;

  if (token) {
    user = verificarToken(token);
  }

  return {
    props: {
      produtos: response.data,
      UMPALUMPA: "LG TRAMBICAGENS",
      user,
    },
  };
};

export default Home;
