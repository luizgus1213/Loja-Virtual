import User from "@/models/User";
import Notificacao from "@/models/Notificacao";

type TipoNotificacao = "pedido" | "promocao" | "seguranca";

interface CriarNotificacaoParams {
  userId: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link?: string | null;
}

function usuarioAceitaNotificacao(user: any, tipo: TipoNotificacao) {
  if (tipo === "pedido") {
    return Boolean(user.notificar_pedidos);
  }

  if (tipo === "promocao") {
    return Boolean(user.notificar_promocoes);
  }

  if (tipo === "seguranca") {
    return Boolean(user.notificar_seguranca);
  }

  return false;
}

export async function criarNotificacaoSePermitido({
  userId,
  tipo,
  titulo,
  mensagem,
  link = null,
}: CriarNotificacaoParams) {
  const user: any = await User.findByPk(userId);

  if (!user) {
    return null;
  }

  if (user.conta_desativada) {
    return null;
  }

  const permitido = usuarioAceitaNotificacao(user, tipo);

  if (!permitido) {
    return null;
  }

  const notificacao = await Notificacao.create({
    user_id: userId,
    tipo,
    titulo,
    mensagem,
    link,
    lida: false,
  });

  return notificacao;
}
