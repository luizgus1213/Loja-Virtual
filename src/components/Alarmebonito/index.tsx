import styles from "./style.module.css";
import { useEffect, useState } from "react";

interface Props {
  mensagem: string;
  tipo: "sucesso" | "erro" | "info";
  visivel?: boolean;
  tempo?: number;
  onClose?: (redirect?: string) => void;
  redirect?: string;
}

export default function Alarmebonito({
  mensagem,
  tipo,
  visivel = true,
  tempo = 4000,
  onClose,
  redirect,
}: Props) {
  const [larguraBarra, setLarguraBarra] = useState(100);

  useEffect(() => {
    if (!visivel) return;

    setLarguraBarra(100);

    const inicio = Date.now();

    const intervalo = setInterval(() => {
      const tempoPassado = Date.now() - inicio;

      const porcentagem = 100 - (tempoPassado / tempo) * 100;

      setLarguraBarra(Math.max(porcentagem, 0));

      if (tempoPassado >= tempo) {
        clearInterval(intervalo);

        if (onClose) {
          onClose(redirect);
        }
      }
    }, 16);

    return () => clearInterval(intervalo);
  }, [visivel, tempo]);

  return (
    <div
      className={`${styles.toast} ${styles[tipo]} ${
        visivel ? styles.entrar : styles.sair
      }`}
    >
      <div
        className={styles.barra}
        style={{
          width: `${larguraBarra}%`,
        }}
      />

      <span className={styles.icone} onClick={() => onClose?.()}>
        {tipo === "sucesso" && "✓"}
        {tipo === "erro" && "✕"}
        {tipo === "info" && "!"}
      </span>

      <p>{mensagem}</p>
    </div>
  );
}
