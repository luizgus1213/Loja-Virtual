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

const AlertaContext = createContext({} as ContextProps);

export function AlertaProvider({ children }: { children: ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  function exibirAlerta(
    mensagem: string,
    tipo: Tipo = "info",
    redirect?: string,
    tempo = 4000,
  ) {
    const id = Date.now();

    setAlertas((antigos) => [
      ...antigos,
      {
        id,
        mensagem,
        tipo,
        redirect,
      },
    ]);

    setTimeout(() => {
      removerAlerta(id);
    }, tempo);
  }

  function removerAlerta(id: number) {
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

export function useAlerta() {
  return useContext(AlertaContext);
}
