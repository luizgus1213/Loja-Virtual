import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./configuracoes.module.css";
import { useTema } from "@/contexts/ThemeContext";

interface Configuracoes {
  tema_preferido: "light" | "dark";
  notificar_pedidos: boolean;
  notificar_promocoes: boolean;
  notificar_seguranca: boolean;
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { setTema } = useTema();

  const [loading, setLoading] = useState(true);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [saindoTodos, setSaindoTodos] = useState(false);
  const [desativando, setDesativando] = useState(false);

  const [config, setConfig] = useState<Configuracoes>({
    tema_preferido: "dark",
    notificar_pedidos: true,
    notificar_promocoes: false,
    notificar_seguranca: true,
  });

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState("");

  async function carregarConfiguracoes() {
    try {
      setLoading(true);

      const res = await axios.get<Configuracoes>("/api/user/configuracoes", {
        withCredentials: true,
      });

      setConfig(res.data);
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao carregar configurações");
      router.push("/perfil");
    } finally {
      setLoading(false);
    }
  }

  async function salvarConfiguracoes() {
    try {
      setSalvandoConfig(true);

      await axios.put("/api/user/configuracoes", config, {
        withCredentials: true,
      });

      setTema(config.tema_preferido);

      alert("Configurações salvas!");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao salvar configurações");
    } finally {
      setSalvandoConfig(false);
    }
  }

  async function alterarSenha() {
    try {
      setAlterandoSenha(true);

      await axios.post(
        "/api/user/alterar-senha",
        {
          senhaAtual,
          novaSenha,
          confirmarNovaSenha,
        },
        {
          withCredentials: true,
        },
      );

      alert("Senha alterada. Faça login novamente.");

      router.push("/auth");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao alterar senha");
    } finally {
      setAlterandoSenha(false);
    }
  }

  async function sairTodosDispositivos() {
    try {
      const ok = confirm("Deseja sair de todos os dispositivos?");

      if (!ok) return;

      setSaindoTodos(true);

      await axios.post(
        "/api/user/sair-todos-dispositivos",
        {},
        {
          withCredentials: true,
        },
      );

      alert("Você saiu de todos os dispositivos.");

      router.push("/auth");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao sair dos dispositivos");
    } finally {
      setSaindoTodos(false);
    }
  }

  async function desativarConta() {
    try {
      const ok = confirm("Tem certeza que deseja desativar sua conta?");

      if (!ok) return;

      setDesativando(true);

      await axios.request({
        method: "DELETE",
        url: "/api/user/desativar-conta",
        data: {
          senha: senhaExcluir,
          confirmacao: confirmacaoExcluir,
        },
        withCredentials: true,
      });

      alert("Conta desativada.");

      router.push("/auth");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao desativar conta");
    } finally {
      setDesativando(false);
    }
  }

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando configurações...</h1>
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
          <h1>Configurações</h1>
          <p>Segurança, tema, notificações e preferências da conta.</p>
        </header>

        <section className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <span>Preferências</span>
              <h2>Tema do site</h2>
              <p>Escolha o tema padrão salvo na sua conta.</p>
            </div>

            <div className={styles.opcoesLinha}>
              <button
                type="button"
                className={
                  config.tema_preferido === "light" ? styles.ativo : ""
                }
                onClick={() =>
                  setConfig({
                    ...config,
                    tema_preferido: "light",
                  })
                }
              >
                Claro
              </button>

              <button
                type="button"
                className={config.tema_preferido === "dark" ? styles.ativo : ""}
                onClick={() =>
                  setConfig({
                    ...config,
                    tema_preferido: "dark",
                  })
                }
              >
                Escuro
              </button>
            </div>

            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={salvarConfiguracoes}
              disabled={salvandoConfig}
            >
              {salvandoConfig ? "Salvando..." : "Salvar preferências"}
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <span>Notificações</span>
              <h2>Preferências de avisos</h2>
              <p>Escolha quais tipos de avisos deseja receber.</p>
            </div>

            <label className={styles.checkLinha}>
              <input
                type="checkbox"
                checked={config.notificar_pedidos}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notificar_pedidos: e.target.checked,
                  })
                }
              />
              <div>
                <strong>Pedidos</strong>
                <small>Receber avisos sobre pagamentos e entregas.</small>
              </div>
            </label>

            <label className={styles.checkLinha}>
              <input
                type="checkbox"
                checked={config.notificar_promocoes}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notificar_promocoes: e.target.checked,
                  })
                }
              />
              <div>
                <strong>Promoções</strong>
                <small>Receber ofertas e cupons.</small>
              </div>
            </label>

            <label className={styles.checkLinha}>
              <input
                type="checkbox"
                checked={config.notificar_seguranca}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notificar_seguranca: e.target.checked,
                  })
                }
              />
              <div>
                <strong>Segurança</strong>
                <small>Receber alertas importantes da conta.</small>
              </div>
            </label>

            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={salvarConfiguracoes}
              disabled={salvandoConfig}
            >
              {salvandoConfig ? "Salvando..." : "Salvar notificações"}
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <span>Segurança</span>
              <h2>Alterar senha</h2>
              <p>Troque sua senha usando a senha atual.</p>
            </div>

            <div className={styles.form}>
              <input
                type="password"
                placeholder="Senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />

              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={alterarSenha}
              disabled={alterandoSenha}
            >
              {alterandoSenha ? "Alterando..." : "Alterar senha"}
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTopo}>
              <span>Sessões</span>
              <h2>Sair de todos os dispositivos</h2>
              <p>Encerra sua sessão atual e invalida acessos antigos.</p>
            </div>

            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={sairTodosDispositivos}
              disabled={saindoTodos}
            >
              {saindoTodos ? "Saindo..." : "Sair de todos os dispositivos"}
            </button>
          </section>

          <section className={`${styles.card} ${styles.cardPerigo}`}>
            <div className={styles.cardTopo}>
              <span>Área perigosa</span>
              <h2>Desativar conta</h2>
              <p>Sua conta será desativada, mas seus pedidos serão mantidos.</p>
            </div>

            <div className={styles.form}>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senhaExcluir}
                onChange={(e) => setSenhaExcluir(e.target.value)}
              />

              <input
                type="text"
                placeholder="Digite EXCLUIR"
                value={confirmacaoExcluir}
                onChange={(e) => setConfirmacaoExcluir(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.botaoPerigo}
              onClick={desativarConta}
              disabled={desativando}
            >
              {desativando ? "Desativando..." : "Desativar conta"}
            </button>
          </section>
        </section>
      </div>
    </main>
  );
}
