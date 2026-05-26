import os
import random
from pathlib import Path

import requests

BASE_URL = "https://lg-tranbicagens.onrender.com"

EMAIL_ADMIN = "luizgus397@gmail.com"
SENHA_ADMIN = "Peixe2020!"

PASTA_IMAGENS = Path(
    r"C:\Users\Luiz Gustavo\Desktop\react\lg_trambicagens\imagens_produtos"
)

EXTENSOES_PERMITIDAS = [".jpg", ".jpeg", ".png", ".webp"]

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
    "tenis": "Roupas",
    "tênis": "Roupas",
    "tv": "Eletrônicos",
    "xbox": "Games",
}


def limpar_nome_arquivo(nome: str) -> str:
    nome = Path(nome).stem
    nome = nome.replace("_", " ").replace("-", " ")
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


def login_admin(session: requests.Session):
    resposta = session.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": EMAIL_ADMIN,
            "senha": SENHA_ADMIN,
        },
        timeout=60,
    )

    print("LOGIN:", resposta.status_code)
    print(resposta.text)

    if resposta.status_code != 200:
        raise Exception("Erro ao fazer login como admin")


def cadastrar_produto(session: requests.Session, imagem: Path, index: int):
    nome_produto = limpar_nome_arquivo(imagem.name)
    categoria = descobrir_categoria(nome_produto)
    marca = descobrir_marca(nome_produto)
    preco = preco_por_categoria(categoria)
    estoque = random.randint(5, 80)

    descricao = (
        f"{nome_produto} da marca {marca}. Produto cadastrado automaticamente "
        f"usando imagem da pasta local."
    )

    dados = {
        "nome": nome_produto,
        "marca": marca,
        "categoria": categoria,
        "descricao": descricao,
        "preco": str(preco),
        "estoque": str(estoque),
        "avaliacao": "0",
    }

    mime = "image/jpeg"

    if imagem.suffix.lower() == ".png":
        mime = "image/png"
    elif imagem.suffix.lower() == ".webp":
        mime = "image/webp"

    with open(imagem, "rb") as arquivo:
        arquivos = [
            (
                "arquivos",
                (
                    imagem.name,
                    arquivo,
                    mime,
                ),
            )
        ]

        resposta = session.post(
            f"{BASE_URL}/api/criar",
            data=dados,
            files=arquivos,
            timeout=120,
        )

    print(f"\n[{index}] Cadastrando: {nome_produto}")
    print("STATUS:", resposta.status_code)
    print("RESPOSTA:", resposta.text[:500])

    if resposta.status_code != 200:
        print("ERRO AO CADASTRAR:", nome_produto)


def main():
    imagens = buscar_imagens()

    if not imagens:
        print("Nenhuma imagem encontrada.")
        return

    print(f"{len(imagens)} imagens encontradas.")

    session = requests.Session()

    login_admin(session)

    for index, imagem in enumerate(imagens, start=1):
        cadastrar_produto(session, imagem, index)

    print("\nFINALIZADO!")
    print(f"{len(imagens)} produtos enviados para o site online.")


if __name__ == "__main__":
    main()