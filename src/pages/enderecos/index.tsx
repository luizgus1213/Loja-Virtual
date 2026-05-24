import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./style.module.css";

interface Endereco {
  id: number;
  nome?: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

const enderecoVazio = {
  nome: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  complemento: "",
};

export default function EnderecosPage() {
  const router = useRouter();

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [form, setForm] = useState(enderecoVazio);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);

  async function carregarEnderecos() {
    try {
      setLoading(true);

      const res = await axios.get("/api/enderecos/listar", {
        withCredentials: true,
      });

      setEnderecos(res.data || []);
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao carregar endereços");
      router.push("/perfil");
    } finally {
      setLoading(false);
    }
  }

  function limparFormulario() {
    setForm(enderecoVazio);
    setEditandoId(null);
    setFormAberto(false);
  }

  function abrirNovoEndereco() {
    setForm(enderecoVazio);
    setEditandoId(null);
    setFormAberto(true);
  }

  function editarEndereco(endereco: Endereco) {
    setForm({
      nome: endereco.nome || "",
      rua: endereco.rua || "",
      numero: endereco.numero || "",
      bairro: endereco.bairro || "",
      cidade: endereco.cidade || "",
      estado: endereco.estado || "",
      cep: endereco.cep || "",
      complemento: endereco.complemento || "",
    });

    setEditandoId(endereco.id);
    setFormAberto(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function validarFormulario() {
    if (!form.nome.trim()) {
      alert("Informe um nome para o endereço. Ex: Casa, Trabalho");
      return false;
    }

    if (!form.cep.trim()) {
      alert("Informe o CEP");
      return false;
    }

    if (!form.rua.trim()) {
      alert("Informe a rua");
      return false;
    }

    if (!form.numero.trim()) {
      alert("Informe o número");
      return false;
    }

    if (!form.bairro.trim()) {
      alert("Informe o bairro");
      return false;
    }

    if (!form.cidade.trim()) {
      alert("Informe a cidade");
      return false;
    }

    if (!form.estado.trim()) {
      alert("Informe o estado");
      return false;
    }

    return true;
  }

  async function salvarEndereco() {
    try {
      if (!validarFormulario()) return;

      setSalvando(true);

      const dados = {
        nome: form.nome.trim(),
        rua: form.rua.trim(),
        numero: form.numero.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
        cep: form.cep.trim(),
        complemento: form.complemento.trim(),
      };

      if (editandoId) {
        await axios.put(
          `/api/enderecos/${editandoId}`,
          {
            data: dados,
          },
          {
            withCredentials: true,
          },
        );

        alert("Endereço atualizado!");
      } else {
        await axios.post("/api/endereco/criar", dados, {
          withCredentials: true,
        });

        alert("Endereço cadastrado!");
      }

      limparFormulario();
      await carregarEnderecos();
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao salvar endereço");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirEndereco(id: number) {
    try {
      const confirmar = confirm(
        "Tem certeza que deseja excluir este endereço?",
      );

      if (!confirmar) return;

      await axios.delete("/api/endereco/excluir", {
        data: {
          id,
        },
        withCredentials: true,
      });

      alert("Endereço excluído!");
      await carregarEnderecos();
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao excluir endereço");
    }
  }

  useEffect(() => {
    carregarEnderecos();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h1>Carregando endereços...</h1>
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
          <div>
            <span>Minha conta</span>
            <h1>Endereços</h1>
            <p>Cadastre e edite os endereços usados nas suas entregas.</p>
          </div>

          <button type="button" onClick={abrirNovoEndereco}>
            + Novo endereço
          </button>
        </header>

        {formAberto && (
          <section className={styles.formBox}>
            <div className={styles.formHeader}>
              <div>
                <span>
                  {editandoId ? "Editando endereço" : "Novo endereço"}
                </span>
                <h2>
                  {editandoId
                    ? "Atualizar endereço"
                    : "Cadastrar novo endereço"}
                </h2>
              </div>

              <button type="button" onClick={limparFormulario}>
                Fechar
              </button>
            </div>

            <div className={styles.formGrid}>
              <label>
                Nome do endereço
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Casa, Trabalho..."
                />
              </label>

              <label>
                CEP
                <input
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </label>

              <label className={styles.campoGrande}>
                Rua
                <input
                  value={form.rua}
                  onChange={(e) => setForm({ ...form, rua: e.target.value })}
                  placeholder="Nome da rua"
                />
              </label>

              <label>
                Número
                <input
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="123"
                />
              </label>

              <label>
                Bairro
                <input
                  value={form.bairro}
                  onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                  placeholder="Bairro"
                />
              </label>

              <label>
                Cidade
                <input
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  placeholder="Cidade"
                />
              </label>

              <label>
                Estado
                <input
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  placeholder="MG"
                  maxLength={2}
                />
              </label>

              <label className={styles.campoGrande}>
                Complemento
                <input
                  value={form.complemento}
                  onChange={(e) =>
                    setForm({ ...form, complemento: e.target.value })
                  }
                  placeholder="Apartamento, referência..."
                />
              </label>
            </div>

            <button
              type="button"
              className={styles.botaoSalvar}
              onClick={salvarEndereco}
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : editandoId
                  ? "Salvar alterações"
                  : "Cadastrar endereço"}
            </button>
          </section>
        )}

        {enderecos.length === 0 ? (
          <section className={styles.vazio}>
            <h2>Nenhum endereço cadastrado</h2>
            <p>Cadastre um endereço para usar no carrinho e no pagamento.</p>

            <button type="button" onClick={abrirNovoEndereco}>
              Cadastrar endereço
            </button>
          </section>
        ) : (
          <section className={styles.lista}>
            {enderecos.map((endereco) => (
              <article key={endereco.id} className={styles.card}>
                <div className={styles.cardTopo}>
                  <div>
                    <span>{endereco.nome || "Endereço"}</span>
                    <h2>
                      {endereco.rua}, {endereco.numero}
                    </h2>
                  </div>

                  <strong>{endereco.estado}</strong>
                </div>

                <p>
                  {endereco.bairro}, {endereco.cidade}/{endereco.estado}
                </p>

                <p>CEP: {endereco.cep}</p>

                {endereco.complemento && (
                  <p>Complemento: {endereco.complemento}</p>
                )}

                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.botaoEditar}
                    onClick={() => editarEndereco(endereco)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className={styles.botaoExcluir}
                    onClick={() => excluirEndereco(endereco.id)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
