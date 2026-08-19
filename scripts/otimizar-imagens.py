"""
Converte as imagens estáticas pesadas de public/ para WebP.
Uso: python scripts/otimizar-imagens.py
"""
from PIL import Image
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(AQUI, "..", "public")

ARQUIVOS = [
    ("antes.jpeg", "antes.webp", 1400),
    ("depois.jpeg", "depois.webp", 1400),
    ("gucci_sneaker.png", "gucci_sneaker.webp", 1200),
    ("Logo-preta.png", "Logo-preta.webp", 480),
]

for origem, destino, largura_max in ARQUIVOS:
    caminho_origem = os.path.join(PUBLIC_DIR, origem)
    if not os.path.exists(caminho_origem):
        print(f"AVISO: {origem} não encontrado, pulando.")
        continue
    img = Image.open(caminho_origem).convert("RGBA" if origem.endswith(".png") else "RGB")
    if img.width > largura_max:
        nova_altura = int(img.height * (largura_max / img.width))
        img = img.resize((largura_max, nova_altura), Image.LANCZOS)
    caminho_destino = os.path.join(PUBLIC_DIR, destino)
    img.save(caminho_destino, "webp", quality=82)
    antes_kb = os.path.getsize(caminho_origem) / 1024
    depois_kb = os.path.getsize(caminho_destino) / 1024
    print(f"{origem} ({antes_kb:.0f} KB) -> {destino} ({depois_kb:.0f} KB)")
