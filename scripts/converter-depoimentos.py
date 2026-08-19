# scripts/converter-depoimentos.py
"""
Converte os prints .heic de depoimentos em public/depoimentos/ para
.webp prontos para web. Dois dos quatro prints originais (Enzo e
Fêrnanda) tinham nome completo e/ou foto de rosto no cabeçalho da
conversa — este script já aplica o recorte de privacidade definido
em 18/08/2026 antes de salvar.

Uso: python scripts/converter-depoimentos.py
"""
import pillow_heif
from PIL import Image
import os

pillow_heif.register_heif_opener()

AQUI = os.path.dirname(os.path.abspath(__file__))
DEPOIMENTOS_DIR = os.path.join(AQUI, "..", "public", "depoimentos")

# (arquivo de origem, recorte opcional (top, bottom) em px na imagem já
# aberta, nome de saída)
CONVERSOES = [
    ("IMG_7230.heic", None, "print-01.webp"),
    ("IMG_7875.heic", None, "print-02.webp"),
    ("IMG_3630.heic", (300, None), "print-03.webp"),      # remove cabeçalho "Enzo" + avatar
    ("IMG_9248.heic", (300, 1880), "print-04.webp"),      # remove cabeçalho "Fêrnanda Álves Cliente" + foto de rosto E o bloco de resposta citada no final, que repete o nome completo
]

MAX_WIDTH = 900

for origem, recorte, destino in CONVERSOES:
    caminho_origem = os.path.join(DEPOIMENTOS_DIR, origem)
    if not os.path.exists(caminho_origem):
        print(f"AVISO: {origem} não encontrado, pulando.")
        continue
    img = Image.open(caminho_origem).convert("RGB")
    if recorte:
        top, bottom = recorte
        top = top or 0
        bottom = bottom or img.height
        img = img.crop((0, top, img.width, bottom))
    if img.width > MAX_WIDTH:
        nova_altura = int(img.height * (MAX_WIDTH / img.width))
        img = img.resize((MAX_WIDTH, nova_altura), Image.LANCZOS)
    caminho_destino = os.path.join(DEPOIMENTOS_DIR, destino)
    img.save(caminho_destino, "webp", quality=82)
    tamanho_kb = os.path.getsize(caminho_destino) / 1024
    print(f"{origem} -> {destino} ({img.width}x{img.height}, {tamanho_kb:.0f} KB)")

print("\nConversão concluída. Confira visualmente os 4 arquivos .webp antes de");
print("apagar os .heic originais (eles NÃO devem ser commitados/publicados).")
