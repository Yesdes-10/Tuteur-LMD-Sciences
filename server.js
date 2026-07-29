require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. SÉCURITÉ CORS
app.use(cors({
    origin: "*",
    methods: ["POST"]
}));

// 2. CORRECTION CRITIQUE (PayloadTooLargeError) : 
// Autoriser les gros volumes de données jusqu'à 50 Mo (indispensable pour le scan OCR et les TD/TP)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 3. BOUCLIER ANTI-SPAM (Rate Limiting)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 15, // 15 requêtes max par IP
    message: { 
        erreur: "⏳ Vous avez dépassé la limite de requêtes. Prenez 10 minutes pour relire vos cours avant de poser une nouvelle question !" 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/generer-cours", limiter);

/* ==========================================================================
   4. ROUTE DE STREAMING SÉCURISÉE VERS GEMINI
   ========================================================================== */
app.post("/api/generer-cours", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ erreur: "Le sujet du cours est invalide ou manquant." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("❌ ERREUR CRITIQUE : La clé API Gemini est introuvable sur le serveur !");
        return res.status(500).json({ erreur: "Erreur de configuration du serveur d'IA." });
    }

    // CORRECTION CRITIQUE (Erreur 404 Google) : 
    // Utilisation de l'identifiant officiel "gemini-1.5-flash-latest"
    // Utilisez cette URL standard compatible avec la version v1beta :
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        }
    };

    try {
        const geminiResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            console.error(`Erreur Google (${geminiResponse.status}):`, errText);
            return res.status(geminiResponse.status).json({ erreur: "Le Professeur IA est momentanément indisponible." });
        }

        // Configuration des en-têtes pour le Streaming SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Redirection en continu du flux vers l'application
        for await (const chunk of geminiResponse.body) {
            res.write(chunk);
        }

        res.end();

    } catch (erreur) {
        console.error("Erreur de communication avec l'IA:", erreur);
        if (!res.headersSent) {
            res.status(500).json({ erreur: "Interruption du réseau serveur." });
        } else {
            res.end();
        }
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur Proxy LMD opérationnel sur le port ${PORT}`);
    console.log(`🔒 Clé API protégée et bouclier anti-spam activé.`);
});