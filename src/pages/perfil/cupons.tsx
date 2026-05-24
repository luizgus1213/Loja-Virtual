import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./cupons.module.css";

interface Cupom {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  ativo: boolean;
  data_expiracao?: string | null;
  uso_maximo?: number | null;
  usos_atual: number;
  valor_minimo_pedido: number;
}

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function formatarDesconto(cupom: Cupom) {
  if (cupom.tipo === "fixo") {
    return moeda(cupom.valor);
  }

  return `${cupom.valor}%`;
}

export default function MeusCupons() {
  const router = useRouter();

  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarCupons() {
    try {
      setLoading(true);

      const res = await axios.get("/api/cupons/disponiveis", {
        withCredentials: true,
      });

      setCupons(res.data || []);
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao carregar cupons");

      if (err?.response?.status === 401) {
        router.push("/auth?modo=cadastro");
      }
    } finally {
      setLoading(false);
    }
  }

  function usarCupom(codigo: string) {
    router.push(`/checkout?cupom=${encodeURIComponent(codigo)}`);
  }

  useEffect(() => {
    carregarCupons();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando seus cupons...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => router.push("/perfil")}
        >
          ← Voltar para minha conta
        </button>

        <header className={styles.header}>
          <span>Minha conta</span>
          <h1>Meus cupons</h1>
          <p>Veja os cupons disponíveis para usar no checkout.</p>
        </header>

        {cupons.length === 0 ? (
          <section className={styles.vazio}>
            <h2>Nenhum cupom disponível</h2>
            <p>Quando houver cupons ativos, eles aparecerão aqui.</p>

            <button type="button" onClick={() => router.push("/")}>
              Ver produtos
            </button>
          </section>
        ) : (
          <section className={styles.grid}>
            {cupons.map((cupom) => (
              <article key={cupom.id} className={styles.card}>
                <div className={styles.cardTopo}>
                  <div>
                    <span>Cupom</span>
                    <h2>{cupom.codigo}</h2>
                  </div>

                  <strong>{formatarDesconto(cupom)}</strong>
                </div>

                <div className={styles.info}>
                  <p>
                    <span>Tipo</span>
                    <strong>
                      {cupom.tipo === "fixo" ? "Valor fixo" : "Porcentagem"}
                    </strong>
                  </p>

                  <p>
                    <span>Pedido mínimo</span>
                    <strong>{moeda(cupom.valor_minimo_pedido)}</strong>
                  </p>

                  <p>
                    <span>Uso</span>
                    <strong>
                      {cupom.usos_atual}
                      {cupom.uso_maximo ? `/${cupom.uso_maximo}` : ""}
                    </strong>
                  </p>

                  <p>
                    <span>Expiração</span>
                    <strong>
                      {cupom.data_expiracao
                        ? new Date(cupom.data_expiracao).toLocaleDateString(
                            "pt-BR",
                          )
                        : "Sem expiração"}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.botaoUsar}
                  onClick={() => usarCupom(cupom.codigo)}
                >
                  Usar cupom
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
