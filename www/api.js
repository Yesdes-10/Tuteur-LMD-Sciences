// ==========================================================================
// CONFIGURATION DE LA CONNEXION AU SERVEUR PROXY SÉCURISÉ
// ==========================================================================

// ⚠️ IMPORTANT : Remplacez "localhost" par votre adresse IP locale (ex: 192.168.1.15) 
// si vous testez l'application sur un vrai smartphone ou un émulateur !
const PROXY_BASE_URL = "https://https://tuteur-lmd-sciences.onrender.com/api/generer-cours";

const API_CONFIG = {
    TIMEOUT_MS: 15000, // 15 secondes max par requête
    MAX_RETRIES: 3     // Nombre de tentatives en cas de réseau instable
};

/**
 * Configure les consignes pour la génération du cours de Licence
 */
function generateAcademicModule(topic) {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return null;

    return `Tu es un professeur d'université expert pour les facultés de sciences de Côte d'Ivoire (UFHB, UNA). 
    Génère un module de révision universitaire (Licence L1/L2/L3) sur le thème : "${cleanTopic}".
    Matières cibles : Mathématiques, Informatique, Physique ou Chimie.
    
    STRUCTURE OBLIGATOIRE DE LA SYNTHÈSE DE COURS :
    Pour CHAQUE théorème majeur, loi physique ou propriété clé énoncée, structure ainsi :
    1. ÉNONCÉ DU THÉORÈME / PROPRIÉTÉ : Formulation mathématique ou scientifique rigoureuse en français (utilise LaTeX pour les formules sans espace autour des $).
    2. EXPLICATION VISUELLE OU CONCRÈTE : Une analogie simple ou une explication conceptuelle intuitive.
    3. EXERCICE D'APPLICATION DIRECTE : Un problème court ciblant la mise en pratique de CE théorème.
    4. CORRECTION DÉTAILLÉE : Résolution étape par étape, calculs intermédiaires et pièges classiques.

    Une fois la synthèse terminée, écris une ligne de séparation "---" puis génère 5 questions de Quiz d'examen (QCM) avec les réponses justifiées.`;
}

/**
 * Configure les consignes pour le scanner d'exercice par photo
 */
function generateScanCorrectionPrompt(extractedText) {
    return `Tu es un professeur d'université expert. On vient de te soumettre un exercice de Licence Sciences contenant ce texte extrait par photo OCR : "${extractedText}".
    Rédige une réponse académique irréprochable en 3 parties :
    1. 📚 RAPPEL DU COURS : Identifie précisément le théorème, la loi ou la propriété indispensable (avec formules LaTeX).
    2. 💡 COMPRÉHENSION : Explique le principe appliqué à ce contexte précis.
    3. 🛠️ CORRECTION STRICTE ET RÉSOLUTION : Résous l'exercice étape par étape de manière rigoureuse avec les calculs détaillés ou le code informatique.`;
}

/**
 * Conçoit un examen blanc obligatoire de 4 exercices à partir du TD/TP téléversé.
 */
function generateLockerExamPrompt(documentName, documentContent) {
    return `Tu es un examinateur de l'Université Félix Houphouët-Boigny. Tu as sous les yeux le document de TD/TP intitulé "${documentName}" qui contient le texte suivant : "${documentContent}".
    
    CONCEVOIR UN EXAMEN BLANC OBLIGATOIRE DE 4 EXERCICES :
    Extrais ou adapte rigoureusement 4 exercices présents dans ce document. Formule-les de manière claire (utilise LaTeX pour les formules).
    
    STRUCTURE DE LA RÉPONSE :
    Génère l'examen sous la forme d'un sujet officiel du MESRS. Écris une ligne de séparation "---" puis propose un quiz de validation de 4 questions (une question par exercice) permettant de vérifier que l'étudiant a correctement résolu le problème avec justifications détaillées.`;
}

/**
 * APPEL RÉSILIENT VERS LE SERVEUR PROXY (Pour OCR, Quiz, Examens Blancs)
 * Redirigé vers notre serveur Node.js pour protéger la clé API !
 */
async function callGeminiAI(promptSystem, promptUser) {
    if (!navigator.onLine) {
        throw new Error("HORS_LIGNE : Impossible de contacter l'IA sans connexion internet.");
    }

    const promptComplet = `${promptSystem}\n\nQuestion/Consigne : ${promptUser}`;
    let tentative = 0;
    let delaiAttente = 1000; // 1 seconde initiale

    while (tentative < API_CONFIG.MAX_RETRIES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

            // Appel vers votre propre serveur proxy au lieu d'appeler directement Google
            const response = await fetch(PROXY_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: promptComplet }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.erreur || `Erreur serveur (${response.status})`);
            }

            // Le serveur proxy nous renvoie un flux, on le lit complètement pour les fonctions classiques
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let texteComplet = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lignes = buffer.split("\n");
                buffer = lignes.pop();

                for (const ligne of lignes) {
                    if (ligne.startsWith("data: ")) {
                        const jsonStr = ligne.replace("data: ", "").trim();
                        if (!jsonStr) continue;
                        try {
                            const data = JSON.parse(jsonStr);
                            const fragment = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                            texteComplet += fragment;
                        } catch (e) {
                            // Ignorer les fragments incomplets
                        }
                    }
                }
            }

            if (!texteComplet) {
                throw new Error("L'IA n'a généré aucune réponse.");
            }

            return texteComplet;

        } catch (error) {
            tentative++;
            console.warn(`Tentative Proxy ${tentative}/${API_CONFIG.MAX_RETRIES} échouée :`, error.message);

            if (tentative >= API_CONFIG.MAX_RETRIES) {
                console.error("Échec critique de communication après retries :", error);
                return "❌ Désolé, le serveur tuteur rencontre des difficultés réseau ou techniques. Veuillez vérifier votre connexion ou réessayez dans quelques instants.";
            }

            // Attente exponentielle (1s -> 2s -> 4s) avant la prochaine tentative
            await new Promise(resolve => setTimeout(resolve, delaiAttente));
            delaiAttente *= 2;
        }
    }
}

/* ==========================================================================
   MOTEUR DE STREAMING (AFFICHAGE EN TEMPS RÉEL VIA PROXY)
   ========================================================================== */

/**
 * Interroge notre propre serveur proxy en mode Streaming et renvoie le texte mot à mot.
 * @param {string} prompt - La question ou le sujet demandé par l'étudiant.
 * @param {function} onChunkReceived - Fonction appelée à chaque nouveau fragment de texte reçu.
 * @returns {Promise<string>} Le texte complet une fois le streaming terminé.
 */
async function genererCoursStream(prompt, onChunkReceived) {
    if (!navigator.onLine) {
        throw new Error("HORS_LIGNE : Impossible de contacter le serveur sans connexion internet.");
    }

    try {
        const response = await fetch(PROXY_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.erreur || `Erreur réseau (${response.status}) : Impossible de joindre le Professeur IA.`);
        }

        // Lecture du flux SSE depuis notre serveur proxy Node.js
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let texteComplet = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break; 

            buffer += decoder.decode(value, { stream: true });
            const lignes = buffer.split("\n");
            buffer = lignes.pop(); 

            for (const ligne of lignes) {
                if (ligne.startsWith("data: ")) {
                    const jsonStr = ligne.replace("data: ", "").trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        const fragment = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        
                        if (fragment) {
                            texteComplet += fragment;
                            onChunkReceived(fragment, texteComplet);
                        }
                    } catch (e) {
                        console.warn("Fragment JSON incomplet ignoré pendant le streaming.");
                    }
                }
            }
        }

        return texteComplet;

    } catch (erreur) {
        console.error("Erreur critique de streaming :", erreur);
        throw erreur;
    }
}