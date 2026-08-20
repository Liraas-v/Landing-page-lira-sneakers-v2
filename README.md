# Lira Sneakers — Landing Page

Landing page da **Lira Sneakers Lab**, lavanderia especializada em limpeza, restauração e proteção de sneakers em São Paulo. Site de uma página só, focado em converter visita em contato via WhatsApp.

**Produção:** https://landing-page-lira-sneakers.vercel.app *(ajustar se o domínio mudar)*

## Stack

- **React 18** + **Vite 5**
- **Three.js** para o carrossel 3D de depoimentos
- **lucide-react** para ícones
- CSS puro (design system em `src/styles/global.css`), sem framework de UI

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera build de produção em dist/
npm run preview   # serve o build de produção localmente
```

## Estrutura

```
src/
├── main.jsx                 # entry point
├── App.jsx                  # provider de tema/toast + render da página
├── context/AppContext.jsx   # contexto global de tema (claro/escuro) e toast
├── hooks/useToast.js        # hook de notificação toast
├── components/
│   ├── Carousel3D.jsx       # carrossel 3D de depoimentos com Three.js
│   ├── Icon.jsx             # wrapper de ícones (lucide-react)
│   ├── ThemeToggle.jsx      # botão de alternância de tema
│   ├── Toast.jsx            # componente visual do toast
│   ├── WhatsAppButton.jsx   # botão com mensagem pré-preenchida para WhatsApp
│   └── WhatsAppFloating.jsx # botão flutuante de WhatsApp
├── data/
│   ├── brand.js             # logos por tema
│   └── constants.js         # serviços, preços, prazos, depoimentos, localização, FAQ
├── pages/LandingPage.jsx    # todas as seções da landing (ver abaixo)
└── styles/global.css        # design system (cores, tipografia, tokens)

public/
├── Logo-branca.jpeg / Logo-preta.webp
├── antes.webp / depois.webp / gucci_sneaker.webp
└── depoimentos/              # prints reais de WhatsApp usados nos depoimentos
    └── README.md              # convenção para adicionar novos prints
```

## Seções da landing page

`LandingPage.jsx` monta, em ordem: fundo de partículas animado → navbar → hero → serviços (com preços e prazos) → antes&depois (slider comparativo) → depoimentos (carrossel 3D com prints reais de clientes, com lightbox) → localização (endereço + link do Google Maps) → FAQ (perguntas frequentes, accordion) → footer. Além disso, um botão flutuante de WhatsApp fica fixo na tela durante o scroll, fora da ordem das seções.

Todo botão de ação (orçamento, WhatsApp, contato) redireciona para o WhatsApp da loja com uma mensagem pré-preenchida (número configurado em `src/data/constants.js`, chave `WHATSAPP_NUMBER`).

## Conteúdo editável

Praticamente todo o conteúdo dinâmico da página vive em `src/data/constants.js`:

- `SERVICOS` — catálogo de serviços, categoria e preço
- `PRAZOS` — prazo de entrega por serviço
- `DEPOIMENTOS` — depoimentos de clientes (com print opcional, ver `public/depoimentos/README.md` para o passo a passo de como adicionar um novo)
- `LOCATION` — endereço, bairro, CEP, horários de atendimento
- `FAQ_ITEMS` — perguntas frequentes
- `NUMEROS` — indicadores exibidos na página (pares restaurados, nota média, etc.)
- `TAXA_URGENCIA` — descrição e preço do complemento de entrega prioritária em 24h
- `HERO_BENEFICIO` — frase de benefício exibida logo abaixo do título do hero

## Build

O `vite.config.js` separa os vendor chunks (`react`/`react-dom`, `lucide-react`, `three`) para manter os bundles individuais dentro do limite de aviso de tamanho.

`npm run build` agora executa pré-renderização automaticamente via hook `postbuild` (veja **Scripts de otimização** abaixo). Isso garante que o `dist/index.html` saia com HTML totalmente renderizado em vez de um `<div id="root">` vazio, melhorando SEO e a experiência de crawlers.

## Scripts de otimização

### Converter depoimentos (Python)
```bash
pip install pillow-heif pillow
python scripts/converter-depoimentos.py
```
Converte uma lista fixa (`CONVERSOES`, no topo do script) de prints `.heic` de depoimentos para `.webp` (qualidade 82, redimensionados para no máximo 900px de largura). Lê os arquivos de origem de `public/depoimentos/` e grava cada um como `print-0N.webp` — os arquivos originais **não** são sobrescritos nem apagados automaticamente; eles continuam em `public/depoimentos/` até serem removidos manualmente (passo 6 de `public/depoimentos/README.md`).

Além de converter, o script já aplica o recorte de privacidade (`(top, bottom)` em px) definido para cada print — é o motivo do script existir: dois dos prints originais tinham nome completo e/ou foto de rosto do cliente no cabeçalho da conversa, e o recorte remove essa área antes de salvar o `.webp`. Para adicionar um novo print, siga o passo a passo completo em `public/depoimentos/README.md` (inclui como adicionar uma entrada em `CONVERSOES`).

### Otimizar imagens (Python)
```bash
pip install pillow
python scripts/otimizar-imagens.py
```
Converte uma lista fixa de 4 arquivos hardcoded (`ARQUIVOS`, no topo do script — atualmente `antes.jpeg`, `depois.jpeg`, `gucci_sneaker.png`, `Logo-preta.png`) para `.webp` (qualidade 82), redimensionando cada um para a largura máxima definida na própria lista. Não usa `pillow-heif` (só lida com JPEG/PNG). Adicionar uma imagem nova em `public/` e rodar o script **não tem efeito** — é preciso primeiro incluir uma entrada em `ARQUIVOS` com o nome do arquivo, o nome de saída e a largura máxima desejada.

### Pré-renderização (automática)
O hook `postbuild` (`scripts/prerender.mjs`) dispara Node.js + Puppeteer ao final do `npm run build` para renderizar a página (a landing tem uma única rota) e sobrescrever só o `dist/index.html` com o HTML já montado pelo React. Assim:
- O HTML enviado para o navegador já inclui conteúdo renderizado (não apenas um app React vazio).
- Crawlers de SEO (Google, OpenGraph, Twitter Card, etc.) veem a página pronta sem esperar por JavaScript.
- Os demais arquivos gerados em `dist/` (JS, CSS, imagens) não são alterados pelo script.

Qualquer falha na pré-renderização (Puppeteer, timeout, porta) só gera um aviso no log — o `dist/index.html` fica com a casca gerada pelo Vite (como antes desse hook existir) e o build não quebra.

Para desabilitar de fato (só recomendado em CI/debug), remova a linha `"postbuild": "node scripts/prerender.mjs",` do bloco `scripts` em `package.json` — `package.json` é JSON e não aceita comentários `//`.

## Documentação adicional

`docs/superpowers/` guarda spec e plano de implementação de features específicas (ex.: suporte a prints reais de depoimentos), para referência histórica de decisões de design.
