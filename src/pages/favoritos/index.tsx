import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import styles from "./style.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
interface Favorito {
  id: number;

  produto: {
    id: number;
    nome: string;
    preco: number;

    imagem?: {
      link: string;
    };
  };
}

export default function Favoritos() {
  const router = useRouter();

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const { exibirAlerta } = useAlerta();

  async function carregar() {
    try {
      const res = await axios.get<Favorito[]>("/api/favoritos/listar", {
        withCredentials: true,
      });

      setFavoritos(res.data || []);
    } catch (err) {
      console.log(err);

      exibirAlerta("Erro ao carregar favoritos", "erro");
    } finally {
      setLoading(false);
    }
  }

  async function removerFavorito(produtoId: number) {
    try {
      await axios.delete("/api/favoritos/remover", {
        data: {
          produtoId,
        },
      });
      setFavoritos((prev) => prev.filter((f) => f.produto.id !== produtoId));

      exibirAlerta("Favorito removido!", "sucesso");
      setFavoritos((prev) => prev.filter((f) => f.produto.id !== produtoId));
    } catch (err) {
      console.log(err);

      exibirAlerta("Erro ao remover favorito", "erro");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return <h1>Carregando...</h1>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.botaoVoltar} onClick={() => router.push("/")}>
        <ArrowLeft size={20} />
        Voltar
      </button>

      <h1 className={styles.titulo}>Favoritos</h1>

      {favoritos.length === 0 && (
        <p className={styles.vazio}>Nenhum favorito</p>
      )}

      <div className={styles.grid}>
        {favoritos.map((favorito) => (
          <div key={favorito.id} className={styles.card}>
            {favorito.produto.imagem?.link && (
              <img
                src={`/${favorito.produto.imagem.link}`}
                alt={favorito.produto.nome}
                className={styles.imagem}
                onClick={() => router.push(`/produto/${favorito.produto.id}`)}
              />
            )}

            <h3 className={styles.nome}>{favorito.produto.nome}</h3>

            <strong className={styles.preco}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(favorito.produto.preco)}
            </strong>

            <button
              className={styles.botaoRemover}
              onClick={() => removerFavorito(favorito.produto.id)}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
