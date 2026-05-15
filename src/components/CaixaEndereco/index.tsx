import styles from "./styles.module.css";
import { useState } from "react";
import axios from "axios";

interface EnderecoType {
  id?: number;

  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}

interface CaixaEnderecoProps {
  modo?: "atualizar" | "cadastrar";

  endereco?: EnderecoType;

  carregarUsuario?: () => void;
}

const textosComponente = {
  cadastrar: {
    titulo: "Cadastro de novo endereço",
    bt_salvar: "Cadastrar endereço",
  },

  atualizar: {
    titulo: "Atualize seu endereço",
    bt_salvar: "Salvar alterações",
  },
};

const CaixaEndereco = ({
  endereco,
  modo = "atualizar",
  carregarUsuario,
}: CaixaEnderecoProps) => {
  const [loading, setLoading] = useState(false);

  const [enderecoAtual, setEnderecoAtual] = useState<EnderecoType>({
    id: endereco?.id,

    nome: endereco?.nome || "",
    rua: endereco?.rua || "",
    numero: endereco?.numero || "",
    cidade: endereco?.cidade || "",
    estado: endereco?.estado || "",
    bairro: endereco?.bairro || "",
    cep: endereco?.cep || "",
  });

  const salvarEndereco = async () => {
    try {
      setLoading(true);

      if (
        !enderecoAtual.nome ||
        !enderecoAtual.rua ||
        !enderecoAtual.numero ||
        !enderecoAtual.cidade ||
        !enderecoAtual.estado ||
        !enderecoAtual.bairro ||
        !enderecoAtual.cep
      ) {
        return alert("Preencha tudo");
      }
      if (enderecoAtual.cep.replace(/\D/g, "").length !== 8) {
        return alert("CEP inválido");
      }

      if (enderecoAtual.estado.length !== 2) {
        return alert("Estado inválido");
      }
      if (modo === "cadastrar") {
        await axios.post("/api/endereco/criar", enderecoAtual, {
          withCredentials: true,
        });

        alert("Endereço criado!");
      } else {
        await axios.post("/api/endereco/atualizar", enderecoAtual, {
          withCredentials: true,
        });

        alert("Endereço atualizado!");
      }

      carregarUsuario?.();
    } catch (err) {
      console.log(err);

      alert("Erro ao salvar endereço");
    } finally {
      setLoading(false);
    }
  };
  const excluirEndereco = async () => {
    try {
      if (!enderecoAtual.id) return;

      const confirmar = confirm(
        "Tem certeza que deseja excluir este endereço?",
      );

      if (!confirmar) return;

      await axios.post(
        "/api/endereco/excluir",
        {
          id: enderecoAtual.id,
        },
        {
          withCredentials: true,
        },
      );

      alert("Endereço excluído!");

      carregarUsuario?.();
    } catch (err) {
      console.log(err);

      alert("Erro ao excluir");
    }
  };

  return (
    <div className={styles.editarBox}>
      <div className={styles.topoEndereco}>
        <span>{enderecoAtual.nome || "Novo endereço"}</span>
      </div>
      <h2 className={styles.titulo}>{textosComponente[modo].titulo}</h2>

      <div className={styles.bloco}>
        <label>Nome do endereço</label>

        <input
          placeholder="Casa, Trabalho..."
          maxLength={30}
          value={enderecoAtual.nome}
          onChange={(e) => {
            setEnderecoAtual({
              ...enderecoAtual,
              nome: e.target.value,
            });
          }}
        />
        <label>CEP</label>

        <input
          placeholder="00000-000"
          maxLength={9}
          value={enderecoAtual.cep}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, "");

            valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

            setEnderecoAtual({
              ...enderecoAtual,
              cep: valor,
            });
          }}
        />

        <label>Estado</label>

        <input
          placeholder="SP"
          maxLength={2}
          value={enderecoAtual.estado}
          onChange={(e) => {
            let valor = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();

            setEnderecoAtual({
              ...enderecoAtual,
              estado: valor,
            });
          }}
        />

        <label>Cidade</label>

        <input
          placeholder="São Paulo"
          value={enderecoAtual.cidade}
          onChange={(e) => {
            let valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

            setEnderecoAtual({
              ...enderecoAtual,
              cidade: valor,
            });
          }}
        />

        <label>Bairro</label>

        <input
          placeholder="Bela Vista"
          value={enderecoAtual.bairro}
          onChange={(e) => {
            let valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

            setEnderecoAtual({
              ...enderecoAtual,
              bairro: valor,
            });
          }}
        />

        <label>Rua</label>

        <input
          placeholder="Avenida Paulista"
          value={enderecoAtual.rua}
          onChange={(e) => {
            setEnderecoAtual({
              ...enderecoAtual,
              rua: e.target.value,
            });
          }}
        />

        <label>Número</label>

        <input
          placeholder="1578 ou S/N"
          maxLength={10}
          value={enderecoAtual.numero}
          onChange={(e) => {
            let valor = e.target.value
              .replace(/[^a-zA-Z0-9\s/-]/g, "")
              .toUpperCase();

            setEnderecoAtual({
              ...enderecoAtual,
              numero: valor,
            });
          }}
        />
      </div>

      <button
        className={styles.botaoSalvar}
        onClick={salvarEndereco}
        disabled={loading}
      >
        {loading ? "Salvando..." : textosComponente[modo].bt_salvar}
      </button>

      {modo === "atualizar" && (
        <button className={styles.botaoExcluir} onClick={excluirEndereco}>
          Excluir endereço
        </button>
      )}
    </div>
  );
};

export default CaixaEndereco;
