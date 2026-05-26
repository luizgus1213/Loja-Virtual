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

export default function AdminCupons() {
  const router = useRouter();

  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [autorizado, setAutorizado] = useState(false);

  const [form, setForm] = useState({
    codigo: "",
    tipo: "porcentagem",
    valor: "",
    uso_maximo: "",
    valor_minimo_pedido: "0",
    data_expiracao: "",
  });

  async function carregarCupons() {
    try {
      setLoading(true);
      setAutorizado(false);

      // Busca os cupons cadastrados na área admin.
      // O tipo Cupom[] informa ao TypeScript que a API retorna uma lista de cupons.
      const res = await axios.get<Cupom[]>("/api/admin/cupons/listar", {
        withCredentials: true,
      });

      setCupons(res.data || []);
      setAutorizado(true);
    } catch (err: any) {
      // Se der erro, o usuário provavelmente não está logado ou não é admin.
      setAutorizado(false);

      alert(err?.response?.data?.erro || "Acesso negado");

      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function criarCupom() {
    try {
      if (!form.codigo.trim()) {
        alert("Digite o código do cupom");
        return;
      }

      if (!form.valor || Number(form.valor) <= 0) {
        alert("Digite um valor válido");
        return;
      }

      setSalvando(true);

      await axios.post(
        "/api/admin/cupons/criar",
        {
          // O código é salvo em maiúsculo para evitar diferença entre lg10, LG10 e Lg10.
          codigo: form.codigo.trim().toUpperCase(),
          tipo: form.tipo,
          valor: Number(form.valor),
          uso_maximo: form.uso_maximo ? Number(form.uso_maximo) : null,
          valor_minimo_pedido: Number(form.valor_minimo_pedido || 0),
          data_expiracao: form.data_expiracao || null,
        },
        {
          // Envia o cookie de autenticação para o backend confirmar que o usuário é admin.
          withCredentials: true,
        },
      );

      alert("Cupom criado!");

      setForm({
        codigo: "",
        tipo: "porcentagem",
        valor: "",
        uso_maximo: "",
        valor_minimo_pedido: "0",
        data_expiracao: "",
      });

      await carregarCupons();
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao criar cupom");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(cupomId: number) {
    try {
      // Essa função alterna o status do cupom.
      // Se estiver ativo, desativa. Se estiver inativo, ativa.
      await axios.put(
        "/api/admin/cupons/alternar-ativo",
        {
          cupomId,
        },
        {
          withCredentials: true,
        },
      );

      await carregarCupons();
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao alterar cupom");
    }
  }

  async function excluirCupom(cupomId: number) {
    try {
      const ok = confirm("Tem certeza que deseja excluir este cupom?");

      if (!ok) return;

      // Usa axios.request porque algumas tipagens do axios não aceitam data dentro de axios.delete.
      await axios.request({
        method: "DELETE",
        url: "/api/admin/cupons/excluir",
        data: {
          cupomId,
        },
        withCredentials: true,
      });

      await carregarCupons();
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao excluir cupom");
    }
  }

  useEffect(() => {
    // Carrega os cupons uma vez quando a página abre.
    carregarCupons();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando cupons...</h1>
        </div>
      </main>
    );
  }

  if (!autorizado) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => router.push("/admin/pedidos")}
        >
          ← Voltar
        </button>

        <header className={styles.header}>
          <span>Administração</span>
          <h1>Cupons</h1>
          <p>Crie e gerencie cupons de desconto da loja.</p>
        </header>

        <section className={styles.layout}>
          <section className={styles.formCard}>
            <h2>Novo cupom</h2>

            <label>
              Código
              <input
                value={form.codigo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    codigo: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ex: LG10"
              />
            </label>

            <label>
              Tipo
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo: e.target.value,
                  })
                }
              >
                <option value="porcentagem">Porcentagem</option>
                <option value="fixo">Valor fixo</option>
              </select>
            </label>

            <label>
              Valor
              <input
                type="number"
                value={form.valor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    valor: e.target.value,
                  })
                }
                placeholder="Ex: 10"
              />
            </label>

            <label>
              Pedido mínimo
              <input
                type="number"
                value={form.valor_minimo_pedido}
                onChange={(e) =>
                  setForm({
                    ...form,
                    valor_minimo_pedido: e.target.value,
                  })
                }
                placeholder="Ex: 50"
              />
            </label>

            <label>
              Uso máximo
              <input
                type="number"
                value={form.uso_maximo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    uso_maximo: e.target.value,
                  })
                }
                placeholder="Ex: 100"
              />
            </label>

            <label>
              Data de expiração
              <input
                type="datetime-local"
                value={form.data_expiracao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    data_expiracao: e.target.value,
                  })
                }
              />
            </label>

            <button type="button" onClick={criarCupom} disabled={salvando}>
              {salvando ? "Criando..." : "Criar cupom"}
            </button>
          </section>

          <section className={styles.listaCard}>
            <h2>Cupons cadastrados</h2>

            {cupons.length === 0 ? (
              <p className={styles.vazio}>Nenhum cupom cadastrado.</p>
            ) : (
              <div className={styles.lista}>
                {cupons.map((cupom) => (
                  <article key={cupom.id} className={styles.cupomCard}>
                    <div className={styles.cupomTopo}>
                      <div>
                        <strong>{cupom.codigo}</strong>

                        <span
                          className={
                            cupom.ativo ? styles.ativo : styles.inativo
                          }
                        >
                          {cupom.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alternarAtivo(cupom.id)}
                      >
                        {cupom.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </div>

                    <div className={styles.infoGrid}>
                      <p>
                        <span>Tipo</span>
                        <strong>{cupom.tipo}</strong>
                      </p>

                      <p>
                        <span>Valor</span>
                        <strong>
                          {/* Se for cupom fixo, mostra em reais. Se for porcentagem, mostra com %. */}
                          {cupom.tipo === "fixo"
                            ? moeda(cupom.valor)
                            : `${cupom.valor}%`}
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
                    </div>

                    {cupom.data_expiracao && (
                      <p className={styles.expira}>
                        Expira em:{" "}
                        {new Date(cupom.data_expiracao).toLocaleString("pt-BR")}
                      </p>
                    )}

                    <button
                      type="button"
                      className={styles.botaoExcluir}
                      onClick={() => excluirCupom(cupom.id)}
                    >
                      Excluir
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
