import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./informacoes.module.css";
import { useAlerta } from "@/contexts/AlertaContext";
interface User {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  numero_telefone?: string;
  acesso?: string;

  foto_perfil?: {
    link: string;
  } | null;
}

export default function InformacoesPage() {
  const router = useRouter();
  const { exibirAlerta } = useAlerta();
  const [user, setUser] = useState<User | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  async function carregarPerfil() {
    try {
      setLoading(true);

      const res = await axios.get<User>("/api/auth/me", {
        withCredentials: true,
      });

      const usuario = res.data;

      setUser(usuario);
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      setCpf(usuario.cpf || "");
      setTelefone(usuario.numero_telefone || "");
    } catch (err) {
      console.log(err);
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  }

  function selecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      exibirAlerta("Selecione apenas uma imagem", "erro");
      return;
    }

    if (previewFoto) {
      URL.revokeObjectURL(previewFoto);
    }

    setFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
  }

  async function salvarFoto() {
    try {
      if (!foto) {
        exibirAlerta("Selecione uma foto primeiro", "erro");
        return;
      }

      setEnviandoFoto(true);

      const formData = new FormData();
      formData.append("arquivo", foto);

      await axios.post("/api/perfil/foto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      exibirAlerta("Foto atualizada!", "sucesso");

      setFoto(null);

      if (previewFoto) {
        URL.revokeObjectURL(previewFoto);
      }

      setPreviewFoto("");

      await carregarPerfil();
    } catch (err: any) {
      console.log(err);
      exibirAlerta(
        err?.response?.data?.erro || "Erro ao atualizar foto",
        "erro",
      );
    } finally {
      setEnviandoFoto(false);
    }
  }
  async function salvarPerfil() {
    try {
      if (!nome.trim()) {
        exibirAlerta("Informe seu nome", "erro");
        return;
      }

      if (!email.trim()) {
        exibirAlerta("Informe seu email", "erro");
        return;
      }

      setSalvando(true);

      const res = await axios.put(
        "/api/perfil/atualizar",
        {
          nome: nome.trim(),
          email: email.trim(),
          cpf: cpf.trim(),
          numero_telefone: telefone.trim(),
        },
        {
          withCredentials: true,
        },
      );

      exibirAlerta(res.data?.mensagem || "Informações atualizadas!", "sucesso");

      if (res.data?.emailAlterado) {
        setTimeout(() => {
          router.push("/verificar-email");
        }, 800);

        return;
      }

      await carregarPerfil();
    } catch (err: any) {
      console.log(err);

      exibirAlerta(
        err?.response?.data?.erro || "Erro ao atualizar perfil",
        "erro",
      );
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();

    return () => {
      if (previewFoto) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando informações...</h1>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.naoEncontrado}>
          <h1>Usuário não encontrado</h1>

          <button type="button" onClick={() => router.push("/auth")}>
            Entrar novamente
          </button>
        </div>
      </main>
    );
  }

  const imagemPerfil =
    previewFoto || (user.foto_perfil?.link ? `/${user.foto_perfil.link}` : "");

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
          <h1>Informações pessoais</h1>
          <p>Atualize seus dados principais e sua foto de perfil.</p>
        </header>

        <section className={styles.layout}>
          <aside className={styles.cardFoto}>
            <div className={styles.avatarBox}>
              {imagemPerfil ? (
                <img src={imagemPerfil} alt="Foto de perfil" />
              ) : (
                <div className={styles.avatarTexto}>
                  {user.nome?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <h2>{user.nome}</h2>
            <p>{user.email}</p>

            {user.acesso === "admin" && (
              <span className={styles.tagAdmin}>Administrador</span>
            )}

            <label className={styles.inputFoto}>
              Escolher nova foto
              <input type="file" accept="image/*" onChange={selecionarFoto} />
            </label>

            {foto && (
              <button
                type="button"
                className={styles.botaoFoto}
                onClick={salvarFoto}
                disabled={enviandoFoto}
              >
                {enviandoFoto ? "Enviando..." : "Salvar foto"}
              </button>
            )}
          </aside>

          <section className={styles.cardFormulario}>
            <div className={styles.cardTopo}>
              <div>
                <h2>Dados da conta</h2>
                <p>Essas informações serão usadas no seu perfil e pedidos.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label>
                Nome completo
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                />
              </label>

              <label>
                CPF
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Digite seu CPF"
                />
              </label>

              <label>
                Telefone
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Digite seu telefone"
                />
              </label>
            </div>

            <button
              type="button"
              className={styles.botaoSalvar}
              onClick={salvarPerfil}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </section>
        </section>
      </div>
    </main>
  );
}
