"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import Alarmebonito from "@/components/Alarmebonito";

type Tipo = "sucesso" | "erro" | "info";

interface Alerta {
  id: number;
  mensagem: string;
  tipo: Tipo;
  redirect?: string;
}

interface ContextProps {
  exibirAlerta: (
    mensagem: string,
    tipo?: Tipo,
    redirect?: string,
    tempo?: number,
  ) => void;
}

// Cria um contexto global para permitir que qualquer componente do projeto chame exibirAlerta.
const AlertaContext = createContext({} as ContextProps);

export function AlertaProvider({ children }: { children: ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  function exibirAlerta(
    mensagem: string,
    tipo: Tipo = "info",
    redirect?: string,
    tempo = 4000,
  ) {
    // Usa Date.now para criar um id único para cada alerta.
    const id = Date.now();

    // basicamente aq ele adiciona o novo alerta mantendo os alertas antigos.
    setAlertas((antigos) => [
      ...antigos,
      {
        id,
        mensagem,
        tipo,
        redirect,
      },
    ]);

    // Remove o alerta automaticamente depois do tempo definido.
    setTimeout(() => {
      removerAlerta(id);
    }, tempo);
  }

  function removerAlerta(id: number) {
    // aqui ele filtra a lista e remove apenas o alerta com o id recebido.
    setAlertas((antigos) => antigos.filter((a) => a.id !== id));
  }

  return (
    <AlertaContext.Provider value={{ exibirAlerta }}>
      {children}

      <div
        style={{
          position: "fixed",
          top: 30,
          right: 30,
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* to utilizando pa renderizar todos os alertas ativos na tela. */}
        {alertas.map((alerta) => (
          <Alarmebonito
            key={alerta.id}
            mensagem={alerta.mensagem}
            tipo={alerta.tipo}
            redirect={alerta.redirect}
            onClose={() => removerAlerta(alerta.id)}
          />
        ))}
      </div>
    </AlertaContext.Provider>
  );
}

// Hook personalizado para acessar o contexto de alerta em qualquer componente.
export function useAlerta() {
  return useContext(AlertaContext);
}
