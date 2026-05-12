import { useRouter } from "next/router";
import style from "./style.module.css";

interface BtnProps {
  text: string;
  id: number;
}

const BotaoComprar = (props: BtnProps) => {
  const router = useRouter();

  return (
    <button
      className={style.btn}
      onClick={() => router.push(`/produto/${props.id}`)}
    >
      {props.text}
    </button>
  );
};

export default BotaoComprar;
