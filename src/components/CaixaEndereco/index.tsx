import styles from "./styles.module.css";
import { useState } from "react";
import axios from "axios";
import { useAlerta } from "@/contexts/AlertaContext";

// Tipo da resposta da API ViaCEP. Isso ajuda o TypeScript a entender quais campos vêm em res.data.
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface EnderecoType {
  id?: number; // O id é opcional porque um endereço novo ainda não tem id.

  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}

// Props que deixam o componente reutilizável: ele pode cadastrar ou atualizar um endereço.
interface CaixaEnderecoProps {
  modo?: "atualizar" | "cadastrar";

  endereco?: EnderecoType;

  carregarUsuario?: () => void; // Função opcional para atualizar os dados na tela após salvar ou excluir.
}

// Textos mudam conforme o modo do componente, evitando repetir código no JSX.
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
  const { exibirAlerta } = useAlerta();

  const [visivel, setVisivel] = useState(false);

  // Estado principal do formulário. Se vier um endereço por props, preenche os campos; se não, começa vazio.
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

  const buscarCEP = async (cep: string) => {
    try {
      // Remove caracteres que não são números e só busca na API quando o CEP tiver 8 dígitos.
      const cepLimpo = cep.replace(/\D/g, "");

      if (cepLimpo.length !== 8) return;

      // Busca o endereço na API ViaCEP e usa o tipo ViaCepResponse para tipar res.data.
      const res = await axios.get<ViaCepResponse>(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      if (res.data.erro) {
        exibirAlerta("CEP não encontrado", "erro");

        return;
      }

      // Mantém os dados já digitados e preenche automaticamente rua, bairro, cidade e estado.
      setEnderecoAtual((prev) => ({
        ...prev,
        rua: res.data.logradouro || "",
        bairro: res.data.bairro || "",
        cidade: res.data.localidade || "",
        estado: res.data.uf || "",
      }));
    } catch (err) {
      console.log(err);

      exibirAlerta("Erro ao buscar CEP", "erro");
    }
  };

  const salvarEndereco = async () => {
    try {
      setLoading(true);

      // Valida campos obrigatórios antes de enviar para o backend.
      if (
        !enderecoAtual.nome ||
        !enderecoAtual.rua ||
        !enderecoAtual.numero ||
        !enderecoAtual.cidade ||
        !enderecoAtual.estado ||
        !enderecoAtual.bairro ||
        !enderecoAtual.cep
      ) {
        exibirAlerta("Preencha todos os campos", "erro");
        return;
      }

      if (enderecoAtual.cep.replace(/\D/g, "").length !== 8) {
        exibirAlerta("CEP inválido", "erro");
        return;
      }

      if (enderecoAtual.estado.length !== 2) {
        exibirAlerta("Estado inválido", "erro");
        return;
      }

      // Decide qual API chamar dependendo do modo: cadastrar cria um novo endereço, atualizar edita um existente.
      if (modo === "cadastrar") {
        await axios.post("/api/endereco/criar", enderecoAtual, {
          withCredentials: true, // Envia os cookies do login para o backend identificar o usuário.
        });

        exibirAlerta("Endereço criado!", "sucesso");
      } else {
        await axios.post("/api/endereco/atualizar", enderecoAtual, {
          withCredentials: true, // Envia os cookies do login para o backend identificar o usuário.
        });

        exibirAlerta("Endereço atualizado!", "sucesso");
      }

      // Chama a função recebida por props somente se ela existir, evitando erro.
      carregarUsuario?.();
    } catch (err) {
      console.log(err);

      exibirAlerta("Erro ao salvar endereço", "erro");
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

      exibirAlerta("Endereço excluído!", "sucesso");

      carregarUsuario?.();
      window.location.reload();
    } catch (err) {
      console.log(err);

      exibirAlerta("Erro ao excluir endereço", "erro");
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
            // Máscara do CEP: remove caracteres não numéricos e formata como 00000-000.
            let valor = e.target.value.replace(/\D/g, "");

            valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

            setEnderecoAtual({
              ...enderecoAtual,
              cep: valor,
            });

            // Quando o CEP completa 8 números, busca os dados automaticamente.
            if (valor.replace(/\D/g, "").length === 8) {
              buscarCEP(valor);
            }
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

      {/* Botão de excluir só aparece quando o endereço já existe e está sendo atualizado. */}
      {modo === "atualizar" && (
        <button className={styles.botaoExcluir} onClick={excluirEndereco}>
          Excluir endereço
        </button>
      )}
    </div>
  );
};

export default CaixaEndereco;
