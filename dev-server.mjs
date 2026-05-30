import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 8080);
const root = process.cwd();
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(root, safePath);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, "index.html");
  }

  response.setHeader("Content-Type", types[extname(filePath)] || "application/octet-stream");
  createReadStream(filePath)
    .on("error", () => {
      response.writeHead(404);
      response.end("Not found");
    })
    .pipe(response);
}).listen(port, () => {
  console.log(`Vivah running at http://localhost:${port}`);
});
