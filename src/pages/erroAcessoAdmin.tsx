import { verificarToken } from "@/lib/auth";
import { GetServerSideProps } from "next";

interface PaginaDeErroProps {
  erro: string;
  redirect: string;
}

const PaginaDeErro = ({ erro, redirect }: PaginaDeErroProps) => {
  return (
    <div
      style={{
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
        height: "100vh",
      }}
    >
      <h1>ERRO AO ACESSAR PAGINA DE ADMIN</h1>

      <span>{erro}</span>

      <button onClick={() => (window.location.href = redirect)}>Ok</button>
    </div>
  );
};

export default PaginaDeErro;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let erro = "Erro não identificado";
  let redirect = "/";
  const token = req.cookies.token || null;
  let user = null;

  if (token) {
    user = verificarToken(token);
  }

  if (!user) {
    erro = "Você precisa estar logado para acessar essa página";
    redirect = "/auth";
  } else if (user?.acesso !== "admin") {
    erro = "Essa página é restrita apenas para administradores";
  }
  return {
    props: { erro, redirect },
  };
};
