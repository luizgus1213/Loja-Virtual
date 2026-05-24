import { useRouter } from "next/router";
import style from "./style.module.css";
import theme from "@/theme";
import { useTema } from "@/contexts/ThemeContext";

interface BtnProps {
  text: string;
  id: number;
}

const BotaoComprar = (props: BtnProps) => {
  const router = useRouter();
  const { tema } = useTema();

  return (
    <button
      style={{ background: "var(--button)" }}
      className={style.btn}
      onClick={() => router.push(`/produto/${props.id}`)}
    >
      {props.text}
    </button>
  );
};

export default BotaoComprar;
