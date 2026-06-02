import { adminDb } from "@/lib/firebaseAdmin";

interface CriarNotificacaoFirebaseParams {
  userId: number | string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string | null;
}

export async function criarNotificacaoFirebase({
  userId,
  tipo,
  titulo,
  mensagem,
  link = null,
}: CriarNotificacaoFirebaseParams) {
  const doc = await adminDb.collection("notificacoes").add({
    userId: String(userId),
    tipo: String(tipo),
    titulo: String(titulo),
    mensagem: String(mensagem),
    link: link || "/",
    lida: false,
    createdAt: new Date(),
  });

  return doc.id;
}
