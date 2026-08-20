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

`LandingPage.jsx` monta, em ordem: fundo de partículas animado → navbar → hero → serviços (com preços e prazos) → antes&depois (slider comparativo) → depoimentos (carrossel 3D com prints reais de clientes, com lightbox) → localização (endereço + link do Google Maps) → footer.

Todo botão de ação (orçamento, WhatsApp, contato) redireciona para o WhatsApp da loja com uma mensagem pré-preenchida (número configurado em `src/data/constants.js`, chave `WHATSAPP_NUMBER`).

## Conteúdo editável

Praticamente todo o conteúdo dinâmico da página vive em `src/data/constants.js`:

- `SERVICOS` — catálogo de serviços, categoria e preço
- `PRAZOS` — prazo de entrega por serviço
- `DEPOIMENTOS` — depoimentos de clientes (com print opcional, ver `public/depoimentos/README.md` para o passo a passo de como adicionar um novo)
- `LOCATION` — endereço, bairro, CEP, horários de atendimento
- `FAQ_ITEMS` — perguntas frequentes
- `NUMEROS` — indicadores exibidos na página (pares restaurados, nota média, etc.)

## Build

O `vite.config.js` separa os vendor chunks (`react`/`react-dom`, `lucide-react`, `three`) para manter os bundles individuais dentro do limite de aviso de tamanho.

`npm run build` agora executa pré-renderização automaticamente via hook `postbuild` (veja **Scripts de otimização** abaixo). Isso garante que o `dist/index.html` saia com HTML totalmente renderizado em vez de um `<div id="root">` vazio, melhorando SEO e a experiência de crawlers.

## Scripts de otimização

### Converter depoimentos (Python)
```bash
pip install pillow-heif pillow
python scripts/converter-depoimentos.py
```
Converte prints de depoimentos de HEIC/JPEG para WebP (lossy, com 75% de qualidade padrão), economizando até 80% do tamanho. Lê de `public/depoimentos/`, sobrescreve originais com versão `.webp`. Ideal ao adicionar screenshots novos em alta resolução.

### Otimizar imagens (Python)
```bash
pip install pillow-heif pillow
python scripts/otimizar-imagens.py
```
Otimiza PNGs e JPEGs em `public/` (raiz) para WebP, mantendo nomes iguais mas com extensão `.webp`. Use após adicionar logos, ícones ou imagens de hero.

### Pré-renderização (automática)
O hook `postbuild` dispara Node.js + Puppeteer para renderizar cada rota da landing ao final do `npm run build`. Assim:
- O HTML enviado para o navegador já inclui conteúdo renderizado (não apenas um app React vazio).
- Crawlers de SEO (Google, OpenGraph, Twitter Card, etc.) veem a página pronta sem esperar por JavaScript.
- Cada arquivo gerado em `dist/` sai com markup completo e pronto para servir.

Para desabilitar (só recomendado em CI/debug), comente a linha `postbuild` no `package.json`.

## Documentação adicional

`docs/superpowers/` guarda spec e plano de implementação de features específicas (ex.: suporte a prints reais de depoimentos), para referência histórica de decisões de design.
