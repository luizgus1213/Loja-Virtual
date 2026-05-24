import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./menu.module.css";
import { useTema } from "@/contexts/ThemeContext";
import { useRouter } from "next/router";
const MenuHamburguer = () => {
  const [aberto, setAberto] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { tema, setTema } = useTema();
  const router = useRouter();

  const carregarUsuario = async () => {
    try {
      const res = await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    carregarUsuario();
  }, []);

  return (
    <>
      <div
        className={styles.botao}
        onClick={() => {
          setAberto(true);
          carregarUsuario();
        }}
      >
        ☰
      </div>

      {aberto && (
        <>
          <div className={styles.overlay} onClick={() => setAberto(false)} />

          <div className={styles.menu}>
            <button className={styles.fechar} onClick={() => setAberto(false)}>
              ✕
            </button>

            <button
              className={styles.botaoLogin}
              onClick={() => {
                if (tema === "light") setTema("dark");
                else setTema("light");
              }}
            >
              {tema === "light"
                ? "Definir Tema como Dark"
                : "Definir tema como Light"}
            </button>

            {user ? (
              <>
                <img
                  src={
                    user.foto_perfil?.link
                      ? `/${user.foto_perfil.link}`
                      : "/perfil.png"
                  }
                  alt="Foto de perfil"
                  className={styles.fotoTopo}
                />
                <h2 className={styles.nome}>{user.nome}</h2>

                <div className={styles.areaBotoesUsuario}>
                  <button
                    type="button"
                    className={styles.botaoPerfil}
                    onClick={() => {
                      setAberto(false);
                      router.push("/perfil");
                    }}
                  >
                    Meu Perfil
                  </button>

                  <button
                    type="button"
                    className={styles.botaoFavoritos}
                    onClick={() => {
                      setAberto(false);
                      router.push("/favoritos");
                    }}
                  >
                    Favoritos
                  </button>

                  <button
                    type="button"
                    className={styles.botaoHistorico}
                    onClick={() => {
                      setAberto(false);
                      router.push("/historico");
                    }}
                  >
                    Compras
                  </button>
                  {user?.acesso === "admin" && (
                    <>
                      <button
                        className={styles.botaoAdmin}
                        onClick={() => {
                          setAberto(false);
                          router.push("/admin");
                        }}
                      >
                        Painel admin
                      </button>

                      <button
                        className={styles.botaoAdmin}
                        onClick={() => {
                          setAberto(false);
                          router.push("/admin/pedidos");
                        }}
                      >
                        Gerenciar pedidos
                      </button>

                      <button
                        className={styles.botaoAdmin}
                        onClick={() => {
                          setAberto(false);
                          router.push("/admin/cupons");
                        }}
                      >
                        Gerenciar cupons
                      </button>

                      <button
                        className={styles.botaoAdmin}
                        onClick={() => {
                          setAberto(false);
                          router.push("/admin/notificacoes");
                        }}
                      >
                        Enviar notificações
                      </button>
                    </>
                  )}
                </div>

                <button
                  className={styles.botaoSair}
                  onClick={async () => {
                    await axios.post("/api/auth/logout");
                    setUser(null);
                    setAberto(false);
                    window.location.reload();
                  }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <div className={styles.naoLogado}>
                  <img src="/userdefault.png" className={styles.avatarGrande} />

                  <h2 className={styles.titulo}>Bem-vindo!</h2>

                  <p className={styles.subtitulo}>
                    Entre na sua conta para comprar e vender com segurança
                  </p>

                  <button
                    className={styles.botaoPrincipal}
                    onClick={() => (window.location.href = "/auth")}
                  >
                    Entrar ou cadastrar
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default MenuHamburguer;
