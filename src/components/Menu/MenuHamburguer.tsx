import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./menu.module.css";

const MenuHamburguer = () => {
  const [aberto, setAberto] = useState(false);
  const [user, setUser] = useState<any>(null);

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
          carregarUsuario(); // 🔥 atualiza ao abrir
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

                <button
                  className={styles.botaoPerfil}
                  onClick={() => (window.location.href = "/perfil")}
                >
                  Meu Perfil
                </button>

                <button
                  className={styles.botaoLogin}
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
