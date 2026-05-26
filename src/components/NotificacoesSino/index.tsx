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

// Tipo da resposta da API. Ela retorna a lista de notificações e a quantidade de não lidas.
interface NotificacoesResponse {
  notificacoes: Notificacao[];
  naoLidas: number;
}

export default function NotificacoesSino() {
  const router = useRouter();

  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  async function carregar() {
    try {
      // Busca as notificações do usuário logado usando o cookie de autenticação.
      const res = await axios.get<NotificacoesResponse>(
        "/api/notificacoes/listar",
        {
          withCredentials: true,
        },
      );

      setNotificacoes(res.data.notificacoes || []);
      setNaoLidas(Number(res.data.naoLidas || 0));
    } catch {
      // Se o usuário não estiver logado ou der erro, o sino fica sem notificações.
      setNotificacoes([]);
      setNaoLidas(0);
    }
  }

  async function abrirNotificacao(notificacao: Notificacao) {
    try {
      // Se a notificação ainda não foi lida, marca como lida antes de abrir o link.
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

      // Se a notificação tiver link, redireciona o usuário para a página relacionada.
      if (notificacao.link) {
        router.push(notificacao.link);
      }
    } catch {
      // Mesmo se der erro ao marcar como lida, ainda tenta abrir o link da notificação.
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

    // Atualiza as notificações automaticamente a cada 30 segundos.
    const intervalo = setInterval(() => {
      carregar();
    }, 30000);

    // Limpa o intervalo quando o componente sai da tela para evitar consumo desnecessário.
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

          {/* Renderização condicional: se não tiver notificações, mostra mensagem; se tiver, mostra a lista. */}
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
