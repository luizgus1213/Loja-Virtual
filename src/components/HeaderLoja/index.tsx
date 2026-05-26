import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import MenuHamburguer from "@/components/Menu/MenuHamburguer";
import styles from "./style.module.css";
import NotificacoesSino from "@/components/NotificacoesSino";

interface Endereco {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}

function IconeCarrinho() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icone}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

function IconeLocalizacao() {
  return (
    <svg viewBox="0 0 24 24" className={styles.iconeEndereco}>
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export default function HeaderLoja() {
  const router = useRouter();
  const [endereco, setEndereco] = useState<Endereco | null>(null);

  async function carregarEndereco() {
    try {
      // Busca os endereços do usuário logado e tipa a resposta como uma lista de Endereco.
      const res = await axios.get<Endereco[]>("/api/enderecos/listar", {
        withCredentials: true,
      });

      const lista: Endereco[] = res.data || [];

      // Se o usuário tiver endereço cadastrado, mostra o primeiro no cabeçalho.
      // Caso contrário, mostra a mensagem para informar endereço.
      if (lista.length > 0) {
        setEndereco(lista[0]);
      } else {
        setEndereco(null);
      }
    } catch {
      // Se o usuário não estiver logado ou der erro na API, o endereço fica vazio.
      setEndereco(null);
    }
  }

  useEffect(() => {
    // Executa uma vez quando o componente aparece na tela para carregar o endereço.
    carregarEndereco();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.logoArea}
          onClick={() => router.push("/")}
        >
          <div className={styles.logoIcone}>LG</div>

          <div className={styles.logoTexto}>
            <strong>LG TRAMBICAGENS</strong>
            <span>Loja online</span>
          </div>
        </button>

        <button
          type="button"
          className={styles.enderecoArea}
          onClick={() => router.push("/enderecos")}
          title="Alterar endereço de entrega"
        >
          <IconeLocalizacao />

          <div>
            <span>Enviar para</span>

            {/* Renderização condicional: se existe endereço, mostra cidade/estado; se não, pede para informar. */}
            {endereco ? (
              <strong>
                {endereco.cidade}/{endereco.estado}
              </strong>
            ) : (
              <strong>Informe seu endereço</strong>
            )}
          </div>
        </button>

        <div className={styles.acoes}>
          <button
            type="button"
            className={styles.botaoCarrinho}
            onClick={() => router.push("/carrinho")}
          >
            <IconeCarrinho />
            <span>Carrinho</span>
          </button>

          <NotificacoesSino />

          <div className={styles.menuBox}>
            <MenuHamburguer />
          </div>
        </div>
      </div>
    </header>
  );
}
