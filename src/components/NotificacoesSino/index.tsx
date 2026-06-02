import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./style.module.css";

import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

interface FirebaseTokenResponse {
  token: string;
  uid: string;
}

interface Notificacao {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string | null;
  lida: boolean;
  createdAt?: any;
}

function formatarData(data: any) {
  try {
    if (!data) return "";

    if (data instanceof Timestamp) {
      return data.toDate().toLocaleString("pt-BR");
    }

    if (data?.seconds) {
      return new Date(data.seconds * 1000).toLocaleString("pt-BR");
    }

    return new Date(data).toLocaleString("pt-BR");
  } catch {
    return "";
  }
}

function pegarTempo(data: any) {
  try {
    if (!data) return 0;

    if (data instanceof Timestamp) {
      return data.toDate().getTime();
    }

    if (data?.seconds) {
      return data.seconds * 1000;
    }

    return new Date(data).getTime();
  } catch {
    return 0;
  }
}

export default function NotificacoesSino() {
  const router = useRouter();

  const [aberto, setAberto] = useState(false);
  const [uid, setUid] = useState("");
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  const iniciouRef = useRef(false);

  const naoLidas = useMemo(() => {
    return notificacoes.filter((n) => !n.lida).length;
  }, [notificacoes]);

  async function autenticarFirebase() {
    try {
      const res = await axios.get<FirebaseTokenResponse>(
        "/api/firebase/token",
        {
          withCredentials: true,
        },
      );

      await signInWithCustomToken(firebaseAuth, res.data.token);

      setUid(res.data.uid);
    } catch (err) {
      console.log("ERRO AO AUTENTICAR FIREBASE:", err);
      setLoading(false);
    }
  }

  async function marcarComoLida(notificacao: Notificacao) {
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

      if (notificacao.link) {
        router.push(notificacao.link);
      }
    } catch (err) {
      console.log("ERRO AO MARCAR NOTIFICAÇÃO:", err);

      if (notificacao.link) {
        router.push(notificacao.link);
      }
    }
  }

  async function marcarTodasComoLidas() {
    try {
      await axios.put(
        "/api/notificacoes/marcar-todas-lidas",
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.log("ERRO AO MARCAR TODAS:", err);
    }
  }

  useEffect(() => {
    if (iniciouRef.current) return;

    iniciouRef.current = true;

    autenticarFirebase();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (user?.uid) {
        setUid(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!uid) return;

    setLoading(true);

    const q = query(
      collection(firebaseDb, "notificacoes"),
      where("userId", "==", String(uid)),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Notificacao, "id">;

          return {
            id: doc.id,
            ...data,
          };
        });

        const ordenadas = lista.sort((a, b) => {
          return pegarTempo(b.createdAt) - pegarTempo(a.createdAt);
        });

        setNotificacoes(ordenadas.slice(0, 20));
        setLoading(false);
      },
      (err) => {
        console.log("ERRO AO OUVIR NOTIFICAÇÕES:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.sino}
        onClick={() => setAberto(!aberto)}
      >
        🔔
        {naoLidas > 0 && <span className={styles.badge}>{naoLidas}</span>}
      </button>

      {aberto && (
        <div className={styles.dropdown}>
          <div className={styles.topo}>
            <div>
              <strong>Notificações</strong>
              <span>{naoLidas} não lida(s)</span>
            </div>

            {naoLidas > 0 && (
              <button type="button" onClick={marcarTodasComoLidas}>
                Marcar todas
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.vazio}>Carregando...</div>
          ) : notificacoes.length === 0 ? (
            <div className={styles.vazio}>Nenhuma notificação ainda.</div>
          ) : (
            <div className={styles.lista}>
              {notificacoes.map((notificacao) => (
                <button
                  key={notificacao.id}
                  type="button"
                  className={`${styles.item} ${
                    !notificacao.lida ? styles.naoLida : ""
                  }`}
                  onClick={() => marcarComoLida(notificacao)}
                >
                  <div>
                    <strong>{notificacao.titulo}</strong>
                    <p>{notificacao.mensagem}</p>
                    <small>{formatarData(notificacao.createdAt)}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
