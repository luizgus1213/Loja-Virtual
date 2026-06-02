export function caminhoImagem(link?: string | null) {
  if (!link) {
    return "/sem-imagem.png";
  }

  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  if (link.startsWith("/")) {
    return link;
  }

  return `/${link}`;
}
