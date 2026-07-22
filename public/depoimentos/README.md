# Prints de depoimentos

Como adicionar um novo print real de WhatsApp:

1. Recorte o print deixando só a(s) bolha(s) de mensagem relevante(s) —
   sem status bar do celular, sem nome/foto de perfil do cliente, sem
   número de telefone.
2. Redimensione para no máximo ~800px de largura; mantenha o arquivo leve
   (idealmente < 300KB).
3. Salve aqui nesta pasta com o nome
   `{primeiro-nome-sem-acento-minusculo}-{servico-curto}.jpg`
   (ex.: `lucas-limpeza.jpg`).
4. No arquivo `src/data/constants.js`, adicione o campo
   `print: "/depoimentos/{arquivo}"` no item correspondente de
   `DEPOIMENTOS`.

Ver spec completo em
`docs/superpowers/specs/2026-07-21-depoimentos-prints-design.md`.
