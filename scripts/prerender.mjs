// scripts/prerender.mjs
// Roda depois de `vite build` (hook postbuild do npm). Sobe um servidor
// estático local servindo dist/, abre a página num Chromium headless,
// espera o React terminar de montar o conteúdo real, e sobrescreve
// dist/index.html com o HTML já renderizado — assim rastreadores que não
// executam JavaScript (ou demoram para executar) recebem texto de
// verdade, não só a casca <div id="root">.
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const PORT = 4173;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const urlPath = req.url.split("?")[0];
      const filePath = join(DIST, urlPath === "/" ? "index.html" : urlPath);
      try {
        const data = await readFile(filePath);
        res.writeHead(200, {
          "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
        });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    server.on("error", reject);
    server.listen(PORT, () => resolve(server));
  });
}

const server = await startServer();
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  // Espera um elemento que só existe depois do React montar as seções
  // reais (não é o mesmo componente lazy-carregado do Task 12 — este
  // seletor é da seção de Serviços, que monta de imediato).
  await page.waitForSelector("#servicos-section", { timeout: 15000 });
  // As seções usam a classe "reveal" (opacity:0 até entrar na viewport
  // via IntersectionObserver). Sem isso, só o hero (dentro da viewport
  // 800x600 padrão do Puppeteer) sai "visible" no HTML estático, e
  // qualquer consumidor que não executa JS vê a página quase em branco.
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  });
  const html = await page.evaluate(
    () => "<!doctype html>\n" + document.documentElement.outerHTML,
  );
  await writeFile(join(DIST, "index.html"), html, "utf-8");
  console.log("Pré-renderização concluída: dist/index.html agora tem o HTML renderizado.");
} finally {
  await browser.close();
  server.close();
}
