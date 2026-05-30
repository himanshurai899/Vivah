import { createReadStream, existsSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
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

const writableCollections = {
  vendors: ["data", "vendors", "vendors.json"],
  budget: ["data", "finance", "budget.json"],
  expenses: ["data", "finance", "expenses.json"],
  invitations: ["data", "invitations", "invitations.json"],
  events: ["data", "events", "events.json"],
  tasks: ["data", "tasks", "tasks.json"],
  hotels: ["data", "hotels", "hotels.json"],
  roomAllocations: ["data", "accommodation", "room-allocations.json"],
  travel: ["data", "travel", "travel.json"],
  rituals: ["data", "rituals", "rituals.json"],
  responsibilities: ["data", "responsibilities", "responsibilities.json"],
  reports: ["data", "reports", "report-config.json"],
  liveStatus: ["data", "command-center", "live-status.json"],
  alerts: ["data", "alerts", "alerts.json"],
  guestCheckins: ["data", "checkin", "guest-checkins.json"],
  whatsappTemplates: ["data", "messages", "whatsapp-templates.json"]
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "POST" && url.pathname.startsWith("/api/data/")) {
    await handleDataWrite(request, response, decodeURIComponent(url.pathname.replace("/api/data/", "")));
    return;
  }

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

async function handleDataWrite(request, response, collection) {
  try {
    const body = await readBody(request);
    const payload = JSON.parse(body || "[]");
    if (!Array.isArray(payload)) {
      sendJson(response, 400, { error: "Payload must be an array." });
      return;
    }

    if (collection === "guests") {
      await writeJson(join(root, "data", "guests", "groom-guests.json"), payload.filter((item) => item.side !== "Bride"));
      await writeJson(join(root, "data", "guests", "bride-guests.json"), payload.filter((item) => item.side === "Bride"));
      sendJson(response, 200, { ok: true });
      return;
    }

    const target = writableCollections[collection];
    if (!target) {
      sendJson(response, 404, { error: `Unknown collection: ${collection}` });
      return;
    }

    await writeJson(join(root, ...target), payload);
    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Unable to write data." });
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        request.destroy(new Error("Request body too large."));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
