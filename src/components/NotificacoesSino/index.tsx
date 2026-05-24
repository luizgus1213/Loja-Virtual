import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./style.module.css";

interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string | null;
  lida: boolean;
  createdAt: string;
}

export default function NotificacoesSino() {
  const router = useRouter();

  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  async function carregar() {
    try {
      const res = await axios.get("/api/notificacoes/listar", {
        withCredentials: true,
      });

      setNotificacoes(res.data.notificacoes || []);
      setNaoLidas(res.data.naoLidas || 0);
    } catch {
      setNotificacoes([]);
      setNaoLidas(0);
    }
  }

  async function abrirNotificacao(notificacao: Notificacao) {
    try {
      if (!notificacao.lida) {
        await axios.put(
          "/api/notificacoes/marcar-lida",
          {
            notificacaoId: notificacao.id,
          },
          {
            withCredentials: true,
          },
        );
      }

      await carregar();

      if (notificacao.link) {
        router.push(notificacao.link);
      }
    } catch {
      if (notificacao.link) {
        router.push(notificacao.link);
      }
    }
  }

  async function marcarTodas() {
    try {
      await axios.put(
        "/api/notificacoes/marcar-todas-lidas",
        {},
        {
          withCredentials: true,
        },
      );

      await carregar();
    } catch {
      alert("Erro ao marcar notificações");
    }
  }

  useEffect(() => {
    carregar();

    const intervalo = setInterval(() => {
      carregar();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.sino}
        onClick={() => setAberto(!aberto)}
      >
        🔔
        {naoLidas > 0 && <span>{naoLidas > 9 ? "9+" : naoLidas}</span>}
      </button>

      {aberto && (
        <div className={styles.dropdown}>
          <div className={styles.topo}>
            <strong>Notificações</strong>

            {naoLidas > 0 && (
              <button type="button" onClick={marcarTodas}>
                Marcar lidas
              </button>
            )}
          </div>

          {notificacoes.length === 0 ? (
            <p className={styles.vazio}>Nenhuma notificação</p>
          ) : (
            <div className={styles.lista}>
              {notificacoes.map((notificacao) => (
                <button
                  key={notificacao.id}
                  type="button"
                  className={`${styles.item} ${
                    !notificacao.lida ? styles.naoLida : ""
                  }`}
                  onClick={() => abrirNotificacao(notificacao)}
                >
                  <strong>{notificacao.titulo}</strong>
                  <p>{notificacao.mensagem}</p>
                  <small>
                    {new Date(notificacao.createdAt).toLocaleString("pt-BR")}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
