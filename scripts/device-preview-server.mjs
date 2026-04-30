import http from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { URL } from "node:url";

const DEFAULT_PORT = 3200;
const DEFAULT_TARGET = "http://localhost:8082";

const htmlPath = resolve(process.cwd(), "tools", "device-preview", "index.html");
const htmlTemplate = readFileSync(htmlPath, "utf8");

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

const port = Number(getArgValue("--port") ?? process.env.DEVICE_PREVIEW_PORT ?? DEFAULT_PORT);
const target = getArgValue("--target") ?? process.env.DEVICE_PREVIEW_TARGET ?? DEFAULT_TARGET;

const presets = [
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max", width: 932, height: 430, type: "phone" },
  { id: "iphone-15", label: "iPhone 15", width: 852, height: 393, type: "phone" },
  { id: "galaxy-s24", label: "Galaxy S24", width: 780, height: 360, type: "phone" },
  { id: "pixel-9", label: "Pixel 9", width: 915, height: 412, type: "phone" },
  { id: "ipad-mini", label: "iPad Mini", width: 1133, height: 744, type: "tablet" },
  { id: "iphone-15-pro-max-portrait", label: "iPhone 15 Pro Max Portrait", width: 430, height: 932, type: "phone" },
  { id: "iphone-15-portrait", label: "iPhone 15 Portrait", width: 393, height: 852, type: "phone" },
  { id: "galaxy-s24-portrait", label: "Galaxy S24 Portrait", width: 360, height: 780, type: "phone" },
  { id: "pixel-9-portrait", label: "Pixel 9 Portrait", width: 412, height: 915, type: "phone" },
  { id: "ipad-mini-portrait", label: "iPad Mini Portrait", width: 744, height: 1133, type: "tablet" },
  { id: "portrait-9-16", label: "9:16 Portrait", width: 360, height: 640, type: "generic" },
  { id: "portrait-3-4", label: "3:4 Portrait", width: 480, height: 640, type: "generic" },
  { id: "landscape-16-9", label: "16:9 Landscape", width: 640, height: 360, type: "generic" },
  { id: "landscape-4-3", label: "4:3 Landscape", width: 640, height: 480, type: "generic" },
];

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://localhost:${port}`);

  if (requestUrl.pathname !== "/") {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const html = htmlTemplate
    .replace("__TARGET_URL__", JSON.stringify(target))
    .replace("__PRESETS__", JSON.stringify(presets));

  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
});

server.listen(port, () => {
  console.log("");
  console.log(`Device preview is running on http://localhost:${port}`);
  console.log(`Preview target: ${target}`);
  console.log("");
  console.log("Examples:");
  console.log("  npm run preview:device");
  console.log("  npm run preview:device -- --target http://localhost:3000");
  console.log("  npm run preview:device -- --target http://localhost:8082 --port 3300");
  console.log("");
});
