import "@/styles/globals.css";

import type { AppProps } from "next/app";

import HeaderLoja from "@/components/HeaderLoja";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AlertaProvider } from "@/contexts/AlertaContext";
import { configurarAxiosAuthRedirect } from "@/lib/axiosConfig";

export default function App({ Component, pageProps, router }: AppProps) {
  configurarAxiosAuthRedirect();

  const rotasSemHeader = ["/auth", "/verificar-email"];

  const esconderHeader = rotasSemHeader.includes(router.pathname);

  return (
    <ThemeProvider>
      <AlertaProvider>
        {!esconderHeader && <HeaderLoja />}

        <Component {...pageProps} />
      </AlertaProvider>
    </ThemeProvider>
  );
}
