"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

interface ThemeContextData {
  tema: "light" | "dark";
  setTema: Dispatch<SetStateAction<"light" | "dark">>;
}

export const ContextoTema = createContext<ThemeContextData | undefined>(
  undefined,
);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "light" || temaSalvo === "dark") {
      setTema(temaSalvo);
    }
  }, []);

  // Salva tema e aplica no body
  useEffect(() => {
    localStorage.setItem("tema", tema);

    document.body.classList.remove("light", "dark");
    document.body.classList.add(tema);
  }, [tema]);

  return (
    <ContextoTema.Provider value={{ tema, setTema }}>
      {children}
    </ContextoTema.Provider>
  );
};

export const useTema = () => {
  const context = useContext(ContextoTema);

  if (!context) {
    throw new Error("useTema deve ser usado dentro de um ThemeProvider");
  }

  return context;
};
