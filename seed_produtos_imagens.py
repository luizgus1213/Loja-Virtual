import sqlite3
import random
import shutil
import html
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "database.sqlite"
UPLOADS_DIR = BASE_DIR / "public" / "uploads"

# MUDE AQUI PARA A PASTA ONDE ESTÃO SUAS IMAGENS
PASTA_IMAGENS = Path(r"C:\Users\Luiz Gustavo\Desktop\react\lg_trambicagens\imagens_produtos")

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

EXTENSOES_PERMITIDAS = [".jpg", ".jpeg", ".png", ".webp", ".svg"]

marcas = [
    "LG Trambicagens",
    "TechMax",
    "Samsung",
    "Apple",
    "Sony",
    "Dell",
    "HP",
    "AOC",
    "Philips",
    "HyperX",
    "Logitech",
    "Microsoft",
    "Xiaomi",
]

categorias_por_nome = {
    "cadeira": "Móveis",
    "controle": "Games",
    "estante": "Casa",
    "fone": "Eletrônicos",
    "geladeira": "Eletrodomésticos",
    "hd": "Informática",
    "iphone": "Celulares",
    "mesa": "Móveis",
    "monitor": "Informática",
    "mouse": "Informática",
    "nintendo": "Games",
    "notebook": "Informática",
    "pendrive": "Informática",
    "play station": "Games",
    "playstation": "Games",
    "samsung": "Celulares",
    "smartphone": "Celulares",
    "ssd": "Informática",
    "teclado": "Informática",
    "tênis": "Roupas",
    "tenis": "Roupas",
    "tv": "Eletrônicos",
    "xbox": "Games",
}

cores_svg = [
    ("#2563eb", "#60a5fa"),
    ("#16a34a", "#86efac"),
    ("#dc2626", "#fca5a5"),
    ("#7c3aed", "#c4b5fd"),
    ("#ea580c", "#fdba74"),
    ("#0891b2", "#67e8f9"),
    ("#4f46e5", "#a5b4fc"),
    ("#9333ea", "#d8b4fe"),
]


def limpar_nome_arquivo(nome: str) -> str:
    nome = nome.replace("_", " ").replace("-", " ")
    nome = nome.replace(".jpg", "").replace(".jpeg", "").replace(".png", "")
    nome = nome.replace(".webp", "").replace(".svg", "")
    nome = " ".join(nome.split())
    return nome.title()


def descobrir_categoria(nome: str) -> str:
    nome_lower = nome.lower()

    for chave, categoria in categorias_por_nome.items():
        if chave in nome_lower:
            return categoria

    return "Produtos"


def descobrir_marca(nome: str) -> str:
    nome_lower = nome.lower()

    for marca in marcas:
        if marca.lower() in nome_lower:
            return marca

    if "iphone" in nome_lower:
        return "Apple"

    if "samsung" in nome_lower:
        return "Samsung"

    if "sony" in nome_lower:
        return "Sony"

    if "dell" in nome_lower:
        return "Dell"

    if "hp" in nome_lower:
        return "HP"

    if "aoc" in nome_lower:
        return "AOC"

    if "philips" in nome_lower:
        return "Philips"

    if "hyperx" in nome_lower:
        return "HyperX"

    return random.choice(marcas)


def preco_por_categoria(categoria: str) -> float:
    if categoria == "Celulares":
        return round(random.uniform(799.90, 3999.90), 2)

    if categoria == "Informática":
        return round(random.uniform(49.90, 3499.90), 2)

    if categoria == "Games":
        return round(random.uniform(89.90, 4499.90), 2)

    if categoria == "Eletrodomésticos":
        return round(random.uniform(999.90, 4999.90), 2)

    if categoria == "Móveis":
        return round(random.uniform(149.90, 1499.90), 2)

    if categoria == "Roupas":
        return round(random.uniform(59.90, 499.90), 2)

    return round(random.uniform(29.90, 899.90), 2)


def criar_svg(caminho: Path, titulo: str, subtitulo: str, cor1: str, cor2: str):
    titulo = html.escape(titulo[:28])
    subtitulo = html.escape(subtitulo)

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{cor1}"/>
      <stop offset="100%" stop-color="{cor2}"/>
    </linearGradient>
  </defs>

  <rect width="900" height="900" rx="60" fill="url(#g)"/>
  <circle cx="710" cy="150" r="170" fill="rgba(255,255,255,0.18)"/>
  <circle cx="170" cy="720" r="210" fill="rgba(255,255,255,0.12)"/>

  <rect x="110" y="245" width="680" height="370" rx="44" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>

  <text x="450" y="405" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800" fill="#ffffff">
    {titulo}
  </text>

  <text x="450" y="475" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600" fill="rgba(255,255,255,0.88)">
    {subtitulo}
  </text>

  <text x="450" y="805" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.85)">
    LG TRAMBICAGENS
  </text>
</svg>"""

    caminho.write_text(svg, encoding="utf-8")


def buscar_imagens():
    if not PASTA_IMAGENS.exists():
        print("ERRO: Pasta de imagens não encontrada:")
        print(PASTA_IMAGENS)
        return []

    imagens = []

    for arquivo in PASTA_IMAGENS.iterdir():
        if arquivo.is_file() and arquivo.suffix.lower() in EXTENSOES_PERMITIDAS:
            imagens.append(arquivo)

    return imagens


def main():
    if not DB_PATH.exists():
        print("ERRO: database.sqlite não encontrado:")
        print(DB_PATH)
        return

    imagens = buscar_imagens()

    if len(imagens) == 0:
        print("Nenhuma imagem encontrada na pasta:")
        print(PASTA_IMAGENS)
        return

    print(f"{len(imagens)} imagens encontradas.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Se você quiser exatamente 200 produtos, deixe 200.
    # Se quiser só 1 produto por imagem, troque para len(imagens).
    TOTAL_PRODUTOS = 200

    for i in range(TOTAL_PRODUTOS):
        imagem_origem = imagens[i % len(imagens)]

        nome_produto = limpar_nome_arquivo(imagem_origem.name)
        categoria = descobrir_categoria(nome_produto)
        marca = descobrir_marca(nome_produto)

        if i >= len(imagens):
            nome_produto = f"{nome_produto} Extra {i + 1}"

        descricao = (
            f"{nome_produto} da marca {marca}. Produto cadastrado automaticamente "
            f"com imagem real da pasta e uma segunda imagem gerada para teste."
        )

        preco = preco_por_categoria(categoria)
        avaliacao = random.randint(3, 5)
        estoque = random.randint(5, 80)

        cursor.execute(
            """
            INSERT INTO produtos (
              nome,
              marca,
              categoria,
              descricao,
              preco,
              avaliacao,
              estoque,
              imagem_id,
              estoque_reservado,
              createdAt,
              updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)
            """,
            (
                nome_produto,
                marca,
                categoria,
                descricao,
                preco,
                avaliacao,
                estoque,
                agora,
                agora,
            ),
        )

        produto_id = cursor.lastrowid

        # IMAGEM 1: imagem real da sua pasta
        novo_nome_real = f"produto_{produto_id}_real{imagem_origem.suffix.lower()}"
        destino_real = UPLOADS_DIR / novo_nome_real

        shutil.copy2(imagem_origem, destino_real)

        cursor.execute(
            """
            INSERT INTO arquivos (
              nome,
              provider,
              link,
              createdAt,
              updatedAt
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                imagem_origem.name,
                "local",
                f"uploads/{novo_nome_real}",
                agora,
                agora,
            ),
        )

        arquivo_real_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO produto_imagens (
              produto_id,
              arquivo_id,
              principal,
              ordem,
              createdAt,
              updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                produto_id,
                arquivo_real_id,
                1,
                0,
                agora,
                agora,
            ),
        )

        # IMAGEM 2: imagem gerada automaticamente
        cor1, cor2 = random.choice(cores_svg)

        novo_nome_svg = f"produto_{produto_id}_extra.svg"
        destino_svg = UPLOADS_DIR / novo_nome_svg

        criar_svg(
            destino_svg,
            nome_produto,
            "Imagem extra",
            cor1,
            cor2,
        )

        cursor.execute(
            """
            INSERT INTO arquivos (
              nome,
              provider,
              link,
              createdAt,
              updatedAt
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                novo_nome_svg,
                "local",
                f"uploads/{novo_nome_svg}",
                agora,
                agora,
            ),
        )

        arquivo_svg_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO produto_imagens (
              produto_id,
              arquivo_id,
              principal,
              ordem,
              createdAt,
              updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                produto_id,
                arquivo_svg_id,
                0,
                1,
                agora,
                agora,
            ),
        )

        # Define a imagem real como capa principal antiga também
        cursor.execute(
            """
            UPDATE produtos
            SET imagem_id = ?
            WHERE id = ?
            """,
            (
                arquivo_real_id,
                produto_id,
            ),
        )

        print(f"Produto criado: {produto_id} - {nome_produto}")

    conn.commit()
    conn.close()

    print("\nFINALIZADO!")
    print(f"{TOTAL_PRODUTOS} produtos criados.")
    print(f"{TOTAL_PRODUTOS * 2} imagens vinculadas.")
    print("Cada produto recebeu 1 imagem real da pasta + 1 imagem extra gerada.")


if __name__ == "__main__":
    main()