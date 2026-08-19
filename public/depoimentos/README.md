# Prints de depoimentos

Como adicionar um novo print real de WhatsApp:

1. Salve o print original (`.heic` do iPhone ou `.jpg`/`.png`) fora do
   repositório, ex. `Área de Trabalho/Projetos/lira-sneakers-prints-originais/`.
   Os arquivos brutos **não** devem ir para `public/`, que é publicado
   como está — nem para o controle de versão.
2. Abra o print e identifique se o cabeçalho da conversa (nome completo
   e/ou foto de perfil do cliente) ou algum bloco de resposta citada
   aparece na área visível. Se aparecer, anote em que altura (px) a
   conversa "limpa" começa e/ou termina — isso vira o recorte
   `(top, bottom)`.
3. Copie o arquivo de origem para `public/depoimentos/` (temporariamente,
   só para a conversão) e adicione uma entrada em `CONVERSOES` no script
   `scripts/converter-depoimentos.py`:
   ```python
   ("NOME-DO-ARQUIVO.heic", (top, bottom) ou None, "print-0N.webp"),
   ```
   Use `None` no lugar do recorte quando a imagem já vier sem
   nome/foto de perfil visível. `top`/`bottom` aceitam `None`
   individualmente (ex. `(300, None)` remove só o topo).
4. Rode `python scripts/converter-depoimentos.py` (dependências:
   `pip install pillow-heif pillow`). O script converte para `.webp`,
   redimensiona para no máximo 900px de largura e aplica o recorte.
5. **Confira visualmente cada `.webp` gerado** antes de prosseguir —
   confirme que nenhum mostra nome completo nem foto de rosto de
   cliente. Esse é o passo que garante a privacidade, não é opcional.
6. Apague o arquivo de origem de `public/depoimentos/` (ele não deve
   ficar no repositório — `git status` não deve mostrar `.heic`/`.jpg`
   brutos pendentes) e, se quiser manter para referência futura, guarde
   só na pasta fora do git do passo 1.
7. No arquivo `src/data/constants.js`, adicione o campo
   `print: "/depoimentos/print-0N.webp"` no item correspondente de
   `DEPOIMENTOS`.

Ver spec completo em
`docs/superpowers/specs/2026-07-21-depoimentos-prints-design.md`.
