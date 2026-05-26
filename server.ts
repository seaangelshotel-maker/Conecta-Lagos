import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
let db: admin.firestore.Firestore;

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN;
const PAGBANK_BASE_URL = process.env.PAGBANK_ENV === 'production' 
  ? 'https://api.pagseguro.com' 
  : 'https://sandbox.api.pagseguro.com';

async function startServer() {
  if (getApps().length === 0) {
    try {
      initializeApp({
        projectId: "conectario-dd04b",
      });
      console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Firebase Admin:", error);
    }
  }

  db = getFirestore();
  console.log("✅ Firestore Admin instance created");

  const app = express();
  const PORT = 3000;

  app.use(cors());
  
  // Add headers for Cross-Origin-Opener-Policy to fix signInWithPopup issues
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });
  
  // Webhook endpoint for PagBank
  app.post('/api/webhook', express.json(), async (request, response) => {
    const payload = request.body;
    
    // PagBank sends notifications for various events
    // For simplicity, we'll look for payment success
    // Note: In production, you should verify the authenticity of the webhook
    
    console.log('PagBank Webhook received:', JSON.stringify(payload));

    const { reference, status } = payload;
    
    // Status 3 means 'Paid' in PagBank
    if (status === 3 || status === 'PAID' || (payload.charges && payload.charges[0]?.status === 'PAID')) {
      // Reference usually contains our internal IDs
      // We'll assume reference is "userId:businessId:planId:planName"
      if (reference) {
        const [userId, businessId, planId, planName] = reference.split(':');
        
        try {
          // Update User
          if (userId) {
            await db.collection('users').doc(userId).update({
              paymentSubscriptionStatus: 'active',
              plan: planName,
              role: 'COMPANY'
            });
          }

          // Update Business
          if (businessId) {
            await db.collection('businesses').doc(businessId).update({
              paymentSubscriptionStatus: 'active',
              plan: planName,
              planId: planId
            });
          }
          console.log(`Successfully updated plan for ${businessId} via PagBank`);
        } catch (error) {
          console.error('Error updating Firestore from PagBank webhook:', error);
        }
      }
    }

    response.send({ received: true });
  });

  // Regular API routes need JSON body parser
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/admin/save-payment-settings", async (req, res) => {
    try {
      const { settings, userId } = req.body;
      console.log(`[ADMIN] Attempting to save settings for user: ${userId}`);
      
      if (!userId) {
        return res.status(400).json({ error: "ID do usuário é obrigatório" });
      }

      // Verify user is SUPER_ADMIN or the owner email
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.error(`[ADMIN] User ${userId} not found in Firestore`);
        return res.status(403).json({ error: "Usuário não encontrado no sistema" });
      }
      
      const userData = userDoc.data();
      console.log(`[ADMIN] User role: ${userData?.role}, email: ${userData?.email}`);
      
      const isSuperAdmin = userData?.role === 'SUPER_ADMIN';
      const isOwnerEmail = userData?.email === 'sea.angelshotel@gmail.com';
      
      if (!isSuperAdmin && !isOwnerEmail) {
        return res.status(403).json({ error: "Acesso negado: Apenas SUPER_ADMIN pode alterar estas configurações" });
      }
      
      await db.collection('settings').doc('payment').set(settings);
      console.log(`[ADMIN] Payment settings updated by user ${userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      res.status(500).json({ error: `Erro interno ao salvar configurações: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, planName, price, period, businessId, userId, userEmail, userName } = req.body;
      
      // Check for test mode in environment or Firestore
      let isTestMode = true; // Default to true (bypass ativado por padrão, conforme solicitado)
      
      try {
        const settingsDoc = await db.collection('settings').doc('payment').get();
        if (settingsDoc.exists) {
          const settings = settingsDoc.data();
          // If it's explicitly set in Firestore, use that
          if (settings?.isDirectPaymentTest !== undefined) {
            // Temporariamente ignorando a configuração do banco para forçar o bypass
            // isTestMode = settings.isDirectPaymentTest; 
          }
        }
      } catch (e) {
        console.warn("Could not fetch payment settings from Firestore, falling back to env/default:", e);
      }

      // Fallback automático: se não houver token do PagBank, ativa o modo de teste para evitar erros
      if (!isTestMode && !process.env.PAGBANK_TOKEN) {
        console.log("[AUTO-TEST] PAGBANK_TOKEN não configurado. Ativando modo de teste automaticamente.");
        isTestMode = true;
      }

      const baseUrl = process.env.APP_URL || req.headers.origin;

      if (isTestMode) {
        console.log(`[TEST MODE] Simulating successful payment for user ${userId}, business ${businessId}, plan ${planName}`);
        
        try {
          // Update User
          if (userId) {
            await db.collection('users').doc(userId).set({
              paymentSubscriptionStatus: 'active',
              plan: planName,
              role: 'COMPANY'
            }, { merge: true });
          }

          // Update Business
          if (businessId) {
            await db.collection('businesses').doc(businessId).set({
              paymentSubscriptionStatus: 'active',
              plan: planName,
              planId: planId
            }, { merge: true });
          }
          
          const successUrl = `${baseUrl}/admin-dashboard?plan_id=${planId}&status=success&test_mode=true`;
          return res.json({ id: 'test_session', url: successUrl });
        } catch (error) {
          console.error('[TEST MODE] Error updating Firestore:', error);
          // Return a proper JSON error so the frontend can display it
          return res.status(500).json({ error: "Erro ao processar pagamento em modo de teste: " + (error instanceof Error ? error.message : String(error)) });
        }
      }

      if (!PAGBANK_TOKEN) {
        return res.status(500).json({ error: "PagBank is not configured" });
      }

      // Create a PagBank Checkout
      // Reference: https://developer.pagbank.com.br/reference/criar-checkout
      const reference = `${userId}:${businessId}:${planId}:${planName}`;
      
      const payload = {
        reference: reference,
        customer: {
          name: userName || "Cliente Lagos GO",
          email: userEmail,
        },
        items: [
          {
            reference: planId,
            name: `Plano ${planName} - ${period === 'monthly' ? 'Mensal' : 'Anual'}`,
            quantity: 1,
            unit_amount: Math.round(price * 100), // PagBank expects amounts in cents
          }
        ],
        payment_methods: [
          { type: "CREDIT_CARD" },
          { type: "BOLETO" },
          { type: "PIX" }
        ],
        redirect_url: `${baseUrl}/admin-dashboard?plan_id=${planId}&status=success`,
        notification_urls: [`${baseUrl}/api/webhook`]
      };

      const response = await fetch(`${PAGBANK_BASE_URL}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAGBANK_TOKEN}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("PagBank API Error:", data);
        throw new Error(data.error_messages?.[0]?.description || "Erro ao criar checkout no PagBank");
      }

      // PagBank returns a link to the checkout page
      const checkoutUrl = data.links.find((l: any) => l.rel === 'PAY')?.href;

      res.json({ id: data.id, url: checkoutUrl });
    } catch (error) {
      console.error("PagBank Checkout Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return app;
}

const appPromise = startServer();
export default appPromise;
