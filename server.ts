/**
 * Servidor de desenvolvimento/local (Express + Vite).
 *
 * Em produção na Vercel este arquivo NÃO é usado: o site é servido como
 * arquivos estáticos (dist/) e as rotas /api/* são as funções da pasta api/,
 * que reutilizam exatamente os mesmos handlers de server/.
 */
import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { handleWebhook, handleCreateCheckout, paymentsEnabled } from "./server/payments.js";
import { handleAiGenerate } from "./server/ai.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Necessário para o login com popup do Google.
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });

  // Webhook lê o corpo bruto para validar a assinatura: registrar ANTES do express.json().
  app.post('/api/webhook', (req, res) => { handleWebhook(req as any, res); });

  app.use(express.json({ limit: '1mb' }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", paymentsEnabled: paymentsEnabled(), aiEnabled: !!process.env.GEMINI_API_KEY });
  });
  app.post("/api/create-checkout-session", (req, res) => { handleCreateCheckout(req as any, res); });
  app.post("/api/ai/generate", (req, res) => { handleAiGenerate(req as any, res); });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lagos GO rodando em http://localhost:${PORT}`);
  });

  return app;
}

const appPromise = startServer();
export default appPromise;
