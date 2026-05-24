import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./notificacoes.module.css";

export default function AdminNotificacoes() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [link, setLink] = useState("/");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);

  async function enviarPromocao() {
    try {
      if (!titulo.trim()) {
        alert("Digite o título da notificação");
        return;
      }

      if (!mensagem.trim()) {
        alert("Digite a mensagem da notificação");
        return;
      }

      if (titulo.trim().length > 80) {
        alert("O título não pode passar de 80 caracteres");
        return;
      }

      if (mensagem.trim().length > 300) {
        alert("A mensagem não pode passar de 300 caracteres");
        return;
      }

      setEnviando(true);
      setResultado(null);

      const res = await axios.post(
        "/api/admin/notificacoes/promocao",
        {
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          link: link.trim() || "/",
        },
        {
          withCredentials: true,
        },
      );

      setResultado(Number(res.data.criadas || 0));

      alert(`Notificação enviada para ${res.data.criadas} usuário(s)!`);

      setTitulo("");
      setMensagem("");
      setLink("/");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao enviar notificação");
    } finally {
      setEnviando(false);
    }
  }

  function preencherCupom() {
    setTitulo("Cupom novo disponível");
    setMensagem("Use LG10 no checkout e ganhe desconto na sua compra.");
    setLink("/checkout");
  }

  function preencherPromocao() {
    setTitulo("Promoção especial na loja");
    setMensagem(
      "Confira os produtos em destaque e aproveite as ofertas disponíveis.",
    );
    setLink("/");
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => router.push("/admin/cupons")}
        >
          ← Voltar
        </button>

        <header className={styles.header}>
          <span>Administração</span>
          <h1>Notificações</h1>
          <p>
            Envie avisos de promoção para usuários que permitiram receber
            notificações promocionais.
          </p>
        </header>

        <section className={styles.layout}>
          <section className={styles.card}>
            <h2>Enviar promoção</h2>

            <label>
              Título
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Cupom novo disponível"
                maxLength={80}
              />
            </label>

            <label>
              Mensagem
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Ex: Use LG10 no checkout e ganhe desconto."
                maxLength={300}
              />
            </label>

            <label>
              Link ao clicar
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ex: /checkout ou /"
              />
            </label>

            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={enviarPromocao}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar notificação"}
            </button>

            {resultado !== null && (
              <p className={styles.resultado}>
                Notificação criada para {resultado} usuário(s).
              </p>
            )}
          </section>

          <aside className={styles.cardPreview}>
            <h2>Prévia</h2>

            <div className={styles.preview}>
              <span>🔔</span>

              <div>
                <strong>{titulo || "Título da notificação"}</strong>

                <p>
                  {mensagem ||
                    "A mensagem da notificação aparecerá aqui para o usuário."}
                </p>

                <small>{link || "/"}</small>
              </div>
            </div>

            <div className={styles.modelos}>
              <h3>Modelos rápidos</h3>

              <button type="button" onClick={preencherCupom}>
                Cupom novo
              </button>

              <button type="button" onClick={preencherPromocao}>
                Promoção geral
              </button>
            </div>

            <div className={styles.aviso}>
              <strong>Aviso pra tu</strong>
              <p>gastei mt tempo nisso deve estar chei de erro</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
