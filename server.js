require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
// 🛠️ AJOUT CRUCIAL : Dire à Express de faire confiance au proxy de Render
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// 1. SÉCURITÉ CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

// 2. AUTORISER LES GROS VOLUMES DE DONNÉES (OCR & TD/TP)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 3. BOUCLIER ANTI-SPAM
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100, // <-- Augmentez cette limite pour vos tests
    message: { 
        erreur: "⏳ Limite de requêtes atteinte. Prenez 10 minutes pour relire vos cours avant de poser une nouvelle question !" 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/generer-cours", limiter);

// Page d'accueil pour vérifier que Render est en ligne
app.get("/", (req, res) => {
    res.send("🚀 Le Serveur Proxy Tuteur LMD Sciences est en ligne !");
});

/* ==========================================================================
   🔍 ROUTE DE DIAGNOSTIC : VOIR VOS MODÈLES AUTORISÉS EN 1 CLIC
   ========================================================================== */
app.get("/api/modeles", async (req, res) => {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ erreur: "Clé API absente sur Render." });

    try {
        const reponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await reponse.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ erreur: e.message });
    }
});

/* ==========================================================================
   4. ROUTE DE STREAMING SÉCURISÉE VERS GEMINI (gemini-2.5-flash)
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

    // CORRECTION 404 : Utilisation de gemini-2.5-flash
    // Correction officielle d'après la liste des modèles de votre clé API :
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`;

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

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

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

app.listen(PORT, () => {
    console.log(`🚀 Serveur Proxy LMD opérationnel sur le port ${PORT}`);
});