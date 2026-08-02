// ==========================================================================
// 1. SÉLECTION ET SÉCURISATION DU DOM (Éviter les erreurs Null/Undefined)
// ==========================================================================
const learnButton = document.getElementById('learn-btn');
const topicInput = document.getElementById('course-topic');
const outputCard = document.getElementById('output-card');
const explanationSection = document.getElementById('explanation-section');

const subjectButtons = document.querySelectorAll('.subject-btn');
const chaptersBox = document.getElementById('chapters-box');
const chaptersList = document.getElementById('chapters-list');

const btnShowSummary = document.getElementById('btn-show-summary');
const btnShowQuiz = document.getElementById('btn-show-quiz');
const btnCopySummary = document.getElementById('btn-copy-summary');
const btnDownloadSummary = document.getElementById('btn-download-summary');

const themeButton = document.getElementById('theme-btn');
const timerBanner = document.getElementById('timer-banner');
const timerClock = document.getElementById('timer-clock');

const academicHistoryList = document.getElementById('academic-history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const iaChatBox = document.getElementById('ia-chat-box');
const chatMessages = document.getElementById('chat-messages');
const chatUserInput = document.getElementById('chat-user-input');
const chatSendBtn = document.getElementById('chat-send-btn');

const scanBtn = document.getElementById('scan-btn');
const cameraContainer = document.getElementById('camera-container');
const webcamElement = document.getElementById('webcam');
const captureBtn = document.getElementById('capture-btn');

const fileChooser = document.getElementById('file-chooser');
const btnTriggerFile = document.getElementById('btn-trigger-file');
const btnSaveDocument = document.getElementById('btn-save-document');
const documentNameInput = document.getElementById('document-name');
const documentTypeSelect = document.getElementById('document-type');
const selectedFileLabel = document.getElementById('selected-file-label');
const lockerList = document.getElementById('locker-list');

// ==========================================================================
// 2. BASE DE DONNÉES PÉDAGOGIQUE (LMD SCIENCES CÔTE D'IVOIRE)
// ==========================================================================
// ==========================================================================
// 2. BASE DE DONNÉES PÉDAGOGIQUE (LMD SCIENCES CÔTE D'IVOIRE COMPLÈTE)
// ==========================================================================
const universityProgram = {
    l1_mi: [
        "[Semestre 1] UE Analyse 1 : Nombres réels et Fonctions",
        "[Semestre 1] UE Algèbre 1 : Logique, Ensembles et Polynômes",
        "[Semestre 1] UE Informatique 1 : Algorithmique et Programmation C",
        "[Semestre 1] UE Physique 1 : Mécanique du point et Cinématique",
        "[Semestre 2] UE Analyse 2 : Intégration et Développements limités",
        "[Semestre 2] UE Algèbre 2 : Espaces vectoriels et Matrices",
        "[Semestre 2] UE Informatique 2 : Structures de données en C",
        "[Semestre 2] UE Physique 2 : Électrostatique et Magnétostatique"
    ],
    l1_pc: [
        "[Semestre 1] UE Chimie 1 : Atomistique et Liaison Chimique",
        "[Semestre 1] UE Physique 1 : Mécanique du point matériel",
        "[Semestre 1] UE Mathématiques 1 : Outils mathématiques pour la physique",
        "[Semestre 2] UE Chimie 2 : Thermodynamique Chimique et Cinétique",
        "[Semestre 2] UE Chimie 3 : Chimie Organique Générale",
        "[Semestre 2] UE Physique 2 : Électromagnétisme et Optique Géométrique",
        "[Semestre 2] UE Physique 3 : Thermodynamique Physique"
    ],
    l1_cbg: [
        "[Semestre 1] UE Biologie 1 : Biologie Cellulaire et Moléculaire",
        "[Semestre 1] UE Sciences de la Terre 1 : Géologie Générale",
        "[Semestre 1] UE Chimie 1 : Chimie Générale et Atomistique",
        "[Semestre 2] UE Biologie 2 : Biologie Végétale et Animale",
        "[Semestre 2] UE Biochimie 1 : Biochimie Structurale",
        "[Semestre 2] UE Sciences de la Terre 2 : Cristallographie et Minéralogie"
    ],
    l2_info: [
        "[Semestre 3] UE Algorithmique Avancée et Graphes",
        "[Semestre 3] UE Architecture des Ordinateurs",
        "[Semestre 3] UE Programmation Orientée Objet (Java/C++)",
        "[Semestre 4] UE Systèmes d'Exploitation (Linux & Scripting)",
        "[Semestre 4] UE Bases de Données (Modèle Relationnel et SQL)",
        "[Semestre 4] UE Réseaux Informatiques (Modèle OSI, TCP/IP)"
    ],
    l2_maths: [
        "[Semestre 3] UE Analyse 3 : Séries numériques et Séries de fonctions",
        "[Semestre 3] UE Algèbre 3 : Réduction des endomorphismes",
        "[Semestre 4] UE Analyse 4 : Calcul différentiel et Intégrales multiples",
        "[Semestre 4] UE Algèbre 4 : Formes quadratiques et Espaces euclidiens",
        "[Semestre 4] UE Probabilités et Statistique Inférentielle"
    ],
    l2_phys: [
        "[Semestre 3] UE Électromagnétisme dans le vide",
        "[Semestre 3] UE Mécanique Analytique et Vibrations",
        "[Semestre 3] UE Optique Ondulatoire",
        "[Semestre 4] UE Mécanique Quantique 1",
        "[Semestre 4] UE Thermodynamique Statistique",
        "[Semestre 4] UE Physique du Solide"
    ],
    l3_info: [
        "[Semestre 5] UE Génie Logiciel et Modélisation UML",
        "[Semestre 5] UE Développement Web (HTML, CSS, JS, PHP)",
        "[Semestre 5] UE Administration Systèmes et Réseaux",
        "[Semestre 6] UE Sécurité Informatique et Cryptographie",
        "[Semestre 6] UE Intelligence Artificielle et Machine Learning",
        "[Semestre 6] UE Programmation Mobile (Android/Flutter)"
    ],
    l3_maths: [
        "[Semestre 5] UE Topologie et Espaces Métriques",
        "[Semestre 5] UE Intégration de Lebesgue",
        "[Semestre 6] UE Analyse Complexe",
        "[Semestre 6] UE Équations Différentielles",
        "[Semestre 6] UE Géométrie Différentielle"
    ]
};
let currentActiveSubject = "libre";
let revisionTimer = null;
let localStream = null;
let tempFileDataUrl = "";
let tempFileName = "";

// Initialisation des données locales
let academicHistory = JSON.parse(localStorage.getItem('academicHistory')) || [];
let savedLockerDocs = []; // Sera désormais rempli par la base de données IndexedDB
let activeChatHistory = [];

// ==========================================================================
// 3. GESTION DES CRÉDITS LMD ET DU SUIVI (FONCTION UNIFIÉE EN O(n))
// ==========================================================================
function renderAcademicHistory() {
    if (!academicHistoryList) return;
    academicHistoryList.innerHTML = "";
    
    if (academicHistory.length === 0) {
        academicHistoryList.innerHTML = `<li style="color: #94a3b8; justify-content: center;">Aucune UE validée. Terminez 5 minutes d'étude pour capitaliser vos crédits !</li>`;
        return;
    }

    let totalCredits = 0;

    academicHistory.forEach(item => {
        const li = document.createElement('li');
        const ueCredits = 5; // Allocation standard de 5 crédits par UE validée
        totalCredits += ueCredits;

        let levelName = "Cours Libre";
        if (item.subject === "l1_mi") levelName = "L1-MI";
        if (item.subject === "l1_pc") levelName = "L1-PC";
        if (item.subject === "l1_cbg") levelName = "L1-CBG";
        if (item.subject === "l2_info") levelName = "L2-Info";
        if (item.subject === "l2_maths") levelName = "L2-Maths";
        if (item.subject === "l2_phys") levelName = "L2-Phys";
        if (item.subject === "l3_info") levelName = "L3-Info";
        if (item.subject === "l3_maths") levelName = "L3-Maths";

        li.innerHTML = `
            <div>
                <span class="history-tag tag-${item.subject}">${levelName}</span>
                <span style="margin-left: 8px; font-weight: 500;">${item.title}</span>
            </div>
            <span class="history-date">🎓 +${ueCredits} Crédits acquis (${item.date})</span>
        `;
        academicHistoryList.appendChild(li);
    });

    // Affichage de la progression globale vers la Licence (180 Crédits)
    const summaryLi = document.createElement('li');
    summaryLi.style.cssText = "font-weight: 700; color: #4f46e5; justify-content: center; background: #e0e7ff; padding: 10px; border-radius: 6px; margin-top: 10px;";
    summaryLi.innerText = `📈 PROGRESSION : ${totalCredits} / 180 Crédits LMD requis pour la Licence`;
    academicHistoryList.appendChild(summaryLi);
}

// ==========================================================================
// 4. INTERACTIVITÉ DU PROGRAMME ET DE L'ÉTUDE
// ==========================================================================
if (subjectButtons) {
    subjectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            subjectButtons.forEach(b => b.classList.remove('active-subject'));
            btn.classList.add('active-subject');

            currentActiveSubject = btn.getAttribute('data-subject');
            const chapters = universityProgram[currentActiveSubject] || [];

            if (chaptersList) {
                chaptersList.innerHTML = "";
                chapters.forEach(chapter => {
                    const chapterBtn = document.createElement('button');
                    chapterBtn.className = 'chapter-item-btn';
                    chapterBtn.innerText = chapter;
                    chapterBtn.addEventListener('click', () => {
                        if (topicInput) topicInput.value = chapter;
                        startRevision(chapter);
                    });
                    chaptersList.appendChild(chapterBtn);
                });
            }
            if (chaptersBox) chaptersBox.style.display = "block";
        });
    });
}

if (learnButton) {
    learnButton.addEventListener('click', () => {
        const userTopic = topicInput ? topicInput.value.trim() : "";
        if (!userTopic) {
            showToast("Veuillez sélectionner une matière ou saisir un sujet de cours.", "warning");
            return;
        }
        const isOfficial = Object.values(universityProgram).flat().includes(userTopic);
        if (!isOfficial) currentActiveSubject = "libre";
        startRevision(userTopic);
    });
}

async function startRevision(topicName) {
    if (!outputCard || !explanationSection) return;
    outputCard.style.display = "block";
    explanationSection.innerHTML = `<div class="loader">🧠 Le professeur Gemini analyse le programme et prépare vos fiches de Licence...</div>`;
    
    const graphSection = document.getElementById('graph-section');
    if (graphSection) graphSection.style.display = "none"; 
    outputCard.scrollIntoView({ behavior: 'smooth' });

    if (btnShowQuiz && btnShowSummary) {
        btnShowQuiz.classList.remove('active');
        btnShowSummary.classList.add('active');
        explanationSection.classList.remove('hide-summary-elements');
        explanationSection.classList.add('hide-quiz-elements');
    }

    startCompulsorySession(0 * 60); // Minuteur 0 minutes

    if (typeof generateChartIllustration === "function") {
        generateChartIllustration(topicName); 
    }

    const quizPrompt = typeof generateAcademicModule === "function" 
        ? generateAcademicModule(topicName) 
        : `Génère un cours universitaire complet sur : ${topicName}`;

    if (quizPrompt) {
        const systemInstruction = "Tu es un tuteur universitaire de Licence en Sciences en Côte d'Ivoire. Rédige un cours rigoureux en français.";
        
        // 1. Préparation de la boîte avec le curseur clignotant
        explanationSection.innerHTML = '';
        const contentBox = document.createElement('div');
        // Ajout des classes CSS que vous aviez déjà préparées
        contentBox.className = "content-box streaming-cursor";
        contentBox.id = "ai-streaming-output"; 
        contentBox.style.cssText = "white-space: pre-wrap; line-height: 1.6;";
        explanationSection.appendChild(contentBox);

        let texteComplet = "";

        try {
            // 2. Appel de la NOUVELLE fonction streaming
            await streamGeminiAI(systemInstruction, quizPrompt, (fragment) => {
                texteComplet += fragment;
                contentBox.innerText = texteComplet; // Met à jour l'écran en temps réel
                // Autoscroll léger pour suivre le texte
                if(outputCard) outputCard.scrollTop = outputCard.scrollHeight; 
            });
            
            // 3. Le flux est terminé : on retire le curseur clignotant
            contentBox.classList.remove('streaming-cursor');
            
        } catch (error) {
            contentBox.classList.remove('streaming-cursor');
            contentBox.innerHTML = `<span style="color: #ef4444; font-weight: 600;">❌ Erreur lors de la communication avec le Proxy. Vérifiez votre connexion.</span>`;
        }
    }
}

// ==========================================================================
// 5. ONGLETS, EXPORTS ET THÈMES
// ==========================================================================
if (btnShowSummary && btnShowQuiz) {
    btnShowSummary.addEventListener('click', () => {
        btnShowQuiz.classList.remove('active');
        btnShowSummary.classList.add('active');
        explanationSection.classList.remove('hide-summary-elements');
        explanationSection.classList.add('hide-quiz-elements');
    });

    btnShowQuiz.addEventListener('click', () => {
        btnShowSummary.classList.remove('active');
        btnShowQuiz.classList.add('active');
        explanationSection.classList.remove('hide-quiz-elements');
        explanationSection.classList.add('hide-summary-elements');
    });
}

if (btnCopySummary) {
    btnCopySummary.addEventListener('click', async () => {
        const summaryText = explanationSection ? explanationSection.innerText : "";
        if (!summaryText || summaryText.includes("analyse le programme")) {
            showToast("Aucune synthèse disponible pour le moment.", "warning");
            return;
        }
        try {
            await navigator.clipboard.writeText(summaryText);
            btnCopySummary.innerText = "✅";
            setTimeout(() => { btnCopySummary.innerText = "📋"; }, 1500);
        } catch (err) {
            console.error("Erreur de copie :", err);
        }
    });
}

if (btnDownloadSummary) {
    btnDownloadSummary.addEventListener('click', () => {
        // Au lieu de récupérer l'innerText, on récupère le HTML complet (innerHTML) pour garder la mise en forme
        const contentToExport = explanationSection ? explanationSection.innerHTML : "";
        const currentTopic = (topicInput && topicInput.value.trim()) ? topicInput.value.trim() : "cours_sciences";

        if (!contentToExport || contentToExport.includes("analyse le programme") || contentToExport.includes("timer-alert")) {
            alert("Aucun document validé à exporter pour le moment.");
            return;
        }

        // 1. Changement d'état du bouton pour rassurer l'utilisateur (UX Pro)
        const originalBtnHTML = btnDownloadSummary.innerHTML;
        btnDownloadSummary.innerHTML = "⏳ Création PDF...";
        btnDownloadSummary.disabled = true;
        btnDownloadSummary.style.opacity = "0.7";

        // 2. Création d'un conteneur virtuel propre pour le PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = "20px";
        pdfContainer.style.fontFamily = "'Inter', sans-serif";
        pdfContainer.style.color = "#1e293b";
        pdfContainer.style.lineHeight = "1.6";

        // 3. Construction de l'en-tête officiel de l'Université / MESRS
        const headerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 15px;">
                <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800;">RÉPUBLIQUE DE CÔTE D'IVOIRE</h2>
                <h3 style="margin: 5px 0; color: #64748b; font-size: 14px;">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESRS)</h3>
                <h1 style="margin: 20px 0 10px 0; color: #1e293b; font-size: 24px;">Fiche de Révision Universitaire - Cycle Licence</h1>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-style: italic; margin-top: 15px;">
                    <span><strong>Matière / Sujet :</strong> ${currentTopic}</span>
                    <span><strong>Généré le :</strong> ${new Date().toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
            <div style="font-size: 14px;">
        `;

        // Assemblage de l'en-tête et du cours généré
        pdfContainer.innerHTML = headerHTML + contentToExport + `</div>`;

        // 4. Configuration stricte du moteur PDF
        const opt = {
            margin:       10, // Marge de 10mm
            filename:     `fiche_licence_${currentTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 5. Génération, sauvegarde et restauration du bouton
        html2pdf().set(opt).from(pdfContainer).save().then(() => {
            btnDownloadSummary.innerHTML = "✅ PDF Téléchargé";
            setTimeout(() => {
                btnDownloadSummary.innerHTML = originalBtnHTML;
                btnDownloadSummary.disabled = false;
                btnDownloadSummary.style.opacity = "1";
            }, 3000);
        }).catch(err => {
            console.error("Erreur de génération PDF :", err);
            btnDownloadSummary.innerHTML = "❌ Erreur";
            btnDownloadSummary.disabled = false;
        });
    });
}

if (themeButton) {
    if (localStorage.getItem('academic-theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeButton.innerText = "☀️";
    }
    themeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeButton.innerText = isDark ? "☀️" : "🌙";
        localStorage.setItem('academic-theme', isDark ? 'dark' : 'light');
    });
}

// ==========================================================================
// 6. MINUTEUR DE BLOCAGE ET DÉVERROUILLAGE
// ==========================================================================
function startCompulsorySession(durationInSeconds) {
    if (revisionTimer) clearInterval(revisionTimer);
    let timeLeft = durationInSeconds;

    if (btnShowQuiz) {
        btnShowQuiz.disabled = true;
        btnShowQuiz.style.opacity = "0.5";
        btnShowQuiz.style.cursor = "not-allowed";
        btnShowQuiz.innerText = "✍️ Entraînement / Quiz (Verrouillé)";
    }
    if (btnDownloadSummary) {
        btnDownloadSummary.disabled = true;
        btnDownloadSummary.style.opacity = "0.5";
        btnDownloadSummary.style.cursor = "not-allowed";
    }
    if (timerBanner) {
        timerBanner.classList.remove('unlocked');
        timerBanner.style.display = "block";
    }
    updateClockDisplay(timeLeft);

    revisionTimer = setInterval(() => {
        timeLeft--;
        updateClockDisplay(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(revisionTimer);
            unlockSession();
        }
    }, 1000);
}

function updateClockDisplay(seconds) {
    if (!timerClock) return;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerClock.innerText = `${mins}:${secs}`;
}

function unlockSession() {
    if (btnShowQuiz) {
        btnShowQuiz.disabled = false;
        btnShowQuiz.style.opacity = "1";
        btnShowQuiz.style.cursor = "pointer";
        btnShowQuiz.innerText = "✍️ Entraînement / Quiz";
    }
    if (btnDownloadSummary) {
        btnDownloadSummary.disabled = false;
        btnDownloadSummary.style.opacity = "1";
        btnDownloadSummary.style.cursor = "pointer";
    }
    if (timerBanner) {
        timerBanner.classList.add('unlocked');
        timerBanner.innerHTML = "🎉 Félicitations ! Votre séance d'étude est validée. Les exercices et les téléchargements sont débloqués.";
    }

    const topicTitle = (topicInput && topicInput.value.trim()) ? topicInput.value.trim() : "Chapitre Inconnu";
    if (academicHistory.length === 0 || academicHistory[0].title !== topicTitle) {
        academicHistory.unshift({
            title: topicTitle,
            subject: currentActiveSubject,
            date: new Date().toLocaleDateString('fr-FR')
        });
        localStorage.setItem('academicHistory', JSON.stringify(academicHistory));
        renderAcademicHistory();
    }

    if (iaChatBox) {
        iaChatBox.style.display = "block";
        const currentTopicKey = 'chat_' + topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        activeChatHistory = JSON.parse(localStorage.getItem(currentTopicKey)) || [];
        
        if (activeChatHistory.length === 0 && chatMessages) {
            chatMessages.innerHTML = `<div class="msg ai">👋 Félicitations pour avoir lu la synthèse ! Je suis votre professeur IA. Une question sur ce cours ? Posez-la moi ici !</div>`;
        } else {
            renderSavedChat();
        }
    }
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Voulez-vous vraiment effacer votre historique de progression et remettre votre suivi à zéro ?")) {
            academicHistory = [];
            localStorage.removeItem('academicHistory');
            renderAcademicHistory();

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('chat_')) localStorage.removeItem(key);
            });
            if (chatMessages) chatMessages.innerHTML = `<div class="msg ai">Historique des discussions réinitialisé.</div>`;
        }
    });
}

// ==========================================================================
// 7. CHAT IA INTERACTIF
// ==========================================================================
if (chatSendBtn && chatUserInput) {
    chatSendBtn.addEventListener('click', handleUserQuestion);
    chatUserInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserQuestion(); });
}

async function handleUserQuestion() {
    const question = chatUserInput.value.trim();
    if (!question) return;

    // 1. ANTI-SPAM : Désactivation de l'interface pendant l'envoi
    chatUserInput.disabled = true;
    chatSendBtn.disabled = true;

    // Affichage de la question de l'utilisateur
    activeChatHistory.push({ text: question, sender: 'user' });
    appendMessage(question, 'user');
    chatUserInput.value = "";
    saveChatToLocalStorage();

    const currentCourseContent = explanationSection ? explanationSection.innerText : "";
    
    // 2. MÉMOIRE IA : Construction de l'historique récent (les 4 derniers échanges)
    let memoireConversation = "";
    const recentHistory = activeChatHistory.slice(-5, -1); 
    recentHistory.forEach(msg => {
        memoireConversation += (msg.sender === 'user' ? "Étudiant: " : "Professeur: ") + msg.text + "\n";
    });

    // 3. PROMPT AUGMENTÉ : On envoie le cours + l'historique + la nouvelle question
    const systemInstruction = "Tu es un professeur de sciences en Licence en Côte d'Ivoire. Réponds de façon concise et pédagogique.";
    const promptComplet = `Contexte du cours actuel : ${currentCourseContent.substring(0, 2000)}...
    
Historique de notre discussion :
${memoireConversation}

Nouvelle question de l'étudiant : ${question}`;

    // 4. PRÉPARATION DE LA BULLE IA ET DU STREAMING
    const loadingId = appendMessage("✍️ Gemini réfléchit...", 'ai');
    const loaderElem = document.getElementById(loadingId);
    
    try {
        let reponseComplete = "";
        
        // On utilise la nouvelle fonction de streaming pour un effet temps réel
        // On utilise la nouvelle fonction de streaming pour un effet temps réel
        await streamGeminiAI(systemInstruction, promptComplet, (fragment) => {
            if (reponseComplete === "") loaderElem.innerHTML = ""; // innerHTML au lieu de innerText
            
            reponseComplete += fragment;
            // On formate le texte à la volée pendant qu'il s'écrit !
            loaderElem.innerHTML = formatAIText(reponseComplete);
            
            // Auto-scroll fluide vers le bas
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // Sauvegarde de la réponse finale
        activeChatHistory.push({ text: reponseComplete, sender: 'ai' });
        saveChatToLocalStorage();

    } catch (error) {
        loaderElem.innerText = "❌ Désolé, je n'ai pas pu joindre le serveur. Vérifiez votre connexion.";
    } finally {
        // 5. RÉACTIVATION DE L'INTERFACE
        chatUserInput.disabled = false;
        chatSendBtn.disabled = false;
        chatUserInput.focus(); // Replace le curseur de saisie pour l'étudiant
    }
}

function appendMessage(text, sender) {
    if (!chatMessages) return null;
    const msgDiv = document.createElement('div');
    const uniqueId = "msg-" + Date.now() + Math.random().toString(36).substr(2, 5);
    msgDiv.className = `msg ${sender}`;
    msgDiv.id = uniqueId;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return uniqueId;
}

function renderSavedChat() {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    activeChatHistory.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${msg.sender}`;
        
        // Si c'est l'IA, on applique notre joli formatage HTML
        if (msg.sender === 'ai') {
            msgDiv.innerHTML = formatAIText(msg.text);
        } else {
            // Si c'est l'utilisateur, on garde le texte brut pour la sécurité
            msgDiv.innerText = msg.text;
        }
        
        chatMessages.appendChild(msgDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChatToLocalStorage() {
    const topicTitle = (topicInput && topicInput.value.trim()) ? topicInput.value.trim() : "general";
    const currentTopicKey = 'chat_' + topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    localStorage.setItem(currentTopicKey, JSON.stringify(activeChatHistory));
}

// ==========================================================================
// 8. SCANNER PHOTO AVEC COMPRESSION CANVAS ($O(1)$ RAM) ET OCR
// ==========================================================================
/**
 * Compresse l'image du flux vidéo pour éviter la saturation RAM sur smartphone
 */
function captureAndCompressImage(videoEl, maxWidth = 1024, maxHeight = 1024) {
    const canvas = document.createElement('canvas');
    let width = videoEl.videoWidth;
    let height = videoEl.videoHeight;

    if (width > height) {
        if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.8); // Compression à 80%
}

if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
        if (localStream) {
            stopCamera();
            return;
        }
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            if (webcamElement) webcamElement.srcObject = localStream;
            if (cameraContainer) cameraContainer.style.display = "block";
            scanBtn.innerText = "❌";
        } catch (err) {
            showToast("Impossible d'accéder à l'appareil photo. Vérifiez les autorisations.", "error");
        }
    });
}

if (captureBtn) {
    captureBtn.addEventListener('click', async () => {
        if (!localStream || !webcamElement) return;

        // Capture compressée en O(1) mémoire
        const imageDataUrl = captureAndCompressImage(webcamElement);
        stopCamera();

        if (outputCard) outputCard.style.display = "block";
        if (explanationSection) {
            explanationSection.innerHTML = `<div class="loader">📷 Numérisation OCR (Tesseract.js) en cours... Patientez...</div>`;
            outputCard.scrollIntoView({ behavior: 'smooth' });
        }

        try {
            const result = await Tesseract.recognize(imageDataUrl, 'fra');
            const extractedText = result.data.text.trim();

            if (!extractedText) throw new Error("Aucun texte lisible détecté sur l'image.");

            if (explanationSection) {
                explanationSection.innerHTML = `<div class="loader">🧠 Énoncé lu : "${extractedText.substring(0, 60)}..."<br>Gemini prépare la correction...</div>`;
            }

            const scanPrompt = typeof generateScanCorrectionPrompt === "function"
                ? generateScanCorrectionPrompt(extractedText)
                : `Voici un énoncé OCR : "${extractedText}". Fais un rappel de cours et résous-le étape par étape.`;

            const systemInstruction = "Tu es un professeur de sciences en Licence. Corrige rigoureusement l'exercice en français.";
            const geminiScanResponse = await callGeminiAI(systemInstruction, scanPrompt);

            if (explanationSection) {
                explanationSection.innerHTML = `<div class="content-box" style="white-space: pre-wrap; line-height: 1.6;">${geminiScanResponse}</div>`;
            }

            if (topicInput) topicInput.value = "Exercice Scanné par Photo";
            currentActiveSubject = "libre";
            if (revisionTimer) clearInterval(revisionTimer);
            unlockSession();

        } catch (error) {
            if (explanationSection) {
                explanationSection.innerHTML = `<div style="color: #ef4444; font-weight: 600; padding: 1rem; border: 1px solid #ef4444; border-radius: 8px;">❌ Erreur : ${error.message} Veuillez réessayer avec une photo plus nette.</div>`;
            }
        }
    });
}

function stopCamera() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (cameraContainer) cameraContainer.style.display = "none";
    if (scanBtn) scanBtn.innerText = "📷";
}
// ==========================================================================
// 8.5. MOTEUR DE BASE DE DONNÉES INDEXEDDB (STOCKAGE HAUTE CAPACITÉ)
// ==========================================================================
const dbName = "TuteurLMD_DB";
const storeName = "studentLockerStore";
let appDB;

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            appDB = event.target.result;
            if (!appDB.objectStoreNames.contains(storeName)) {
                appDB.createObjectStore(storeName, { keyPath: "id" });
            }
        };
        request.onsuccess = (event) => {
            appDB = event.target.result;
            resolve(appDB);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

function addDocToDB(doc) {
    return new Promise((resolve, reject) => {
        const transaction = appDB.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(doc);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

function deleteDocFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = appDB.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

function getAllDocsFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = appDB.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}
// ==========================================================================
// 9. CASIER NUMÉRIQUE PERSONNEL (TD & TP)
// ==========================================================================
if (btnTriggerFile && fileChooser) {
    btnTriggerFile.addEventListener('click', () => fileChooser.click());
    
    fileChooser.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        tempFileName = file.name;
        if (selectedFileLabel) selectedFileLabel.innerText = `📁 Fichier : ${file.name}`;

        const reader = new FileReader();
        reader.onload = (event) => { tempFileDataUrl = event.target.result; };
        reader.readAsDataURL(file);
    });
}

if (btnSaveDocument) {
    btnSaveDocument.addEventListener('click', async () => { // Ajout de 'async'
        const docCustomName = documentNameInput ? documentNameInput.value.trim() : "";
        const docType = documentTypeSelect ? documentTypeSelect.value : "TD";

        if (!docCustomName || !tempFileDataUrl) {
            showToast("Veuillez donner un nom et sélectionner un fichier.", "warning");
            return;
        }

        const newDocRecord = {
            id: "doc_" + Date.now(),
            displayName: `${docCustomName} (${docType})`,
            fileData: tempFileDataUrl,
            fileName: tempFileName,
            level: currentActiveSubject,
            date: new Date().toLocaleDateString('fr-FR')
        };

        try {
            // Sauvegarde dans IndexedDB (Fini la limite des 5 Mo !)
            await addDocToDB(newDocRecord);
            
            savedLockerDocs.unshift(newDocRecord);
            renderLockerList();
            
            // Nettoyage de l'interface
            if (documentNameInput) documentNameInput.value = "";
            if (selectedFileLabel) selectedFileLabel.innerText = "";
            tempFileDataUrl = "";
            tempFileName = "";
        } catch (storageError) {
            showToast("Erreur lors de la sauvegarde du document. L'espace est saturé.", "error");
            console.error(storageError);
        }
    });
}

function renderLockerList() {
    if (!lockerList) return;
    lockerList.innerHTML = "";

    if (savedLockerDocs.length === 0) {
        lockerList.innerHTML = `<li style="color: #94a3b8; justify-content: center; padding: 15px 0;">Votre casier est vide. Centralisez vos TD/TP ici.</li>`;
        return;
    }

    savedLockerDocs.forEach(doc => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <a class="document-link" href="${doc.fileData}" download="${doc.fileName}">📄 ${doc.displayName}</a>
                <span style="font-size: 11px; color: #94a3b8; margin-left: 5px;">[${doc.date}]</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn-evaluate-doc" data-id="${doc.id}" style="background-color: #4f46e5; padding: 4px 10px; font-size: 12px; color: white; border: none; border-radius: 4px; cursor: pointer;">🧠 S'évaluer</button>
                <button class="btn-delete-doc" data-id="${doc.id}" title="Supprimer" style="cursor: pointer;">❌</button>
            </div>
        `;

        li.querySelector('.btn-evaluate-doc').addEventListener('click', async (e) => {
            const docId = e.target.getAttribute('data-id');
            const targetDoc = savedLockerDocs.find(d => d.id === docId);
            if (!targetDoc || !outputCard || !explanationSection) return;

            outputCard.style.display = "block";
            explanationSection.innerHTML = `<div class="loader">🔍 Extraction du texte de votre document en cours...</div>`;
            outputCard.scrollIntoView({ behavior: 'smooth' });

            let textContent = "";
            if (targetDoc.fileData.startsWith("data:image/")) {
                try {
                    const ocrResult = await Tesseract.recognize(targetDoc.fileData, 'fra');
                    textContent = ocrResult.data.text.trim();
                } catch(err) {
                    explanationSection.innerHTML = `<div style="color: #ef4444;">❌ Erreur OCR sur cette image.</div>`;
                    return;
                }
            } else {
                textContent = atob(targetDoc.fileData.split(',')[1]);
            }

            if (!textContent || textContent.length < 10) {
                explanationSection.innerHTML = `<div style="color: #ef4444;">❌ Impossible d'extraire suffisamment de texte pour concevoir un examen.</div>`;
                return;
            }

            explanationSection.innerHTML = `<div class="loader">🎓 Le professeur Gemini conçoit votre examen blanc obligatoire (4 exercices)...</div>`;
            
            const examPrompt = generateLockerExamPrompt(targetDoc.displayName, textContent);
            const systemInstruction = "Tu es un examinateur de licence scientifique en Côte d'Ivoire. Conçois un examen strict.";
            const geminiResponse = await callGeminiAI(systemInstruction, examPrompt);

            if (btnShowSummary) {
                btnShowSummary.disabled = true;
                btnShowSummary.style.opacity = "0.5";
            }
            if (btnShowQuiz) {
                btnShowQuiz.classList.add('active');
                btnShowSummary.classList.remove('active');
            }

            explanationSection.innerHTML = `
                <div class="timer-alert" style="background-color: #fca5a5; color: #7f1d1d; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                    🚨 CONTRÔLE CONTINU OBLIGATOIRE : Résolvez les 4 exercices pour débloquer votre espace.
                </div>
                <div class="content-box" style="white-space: pre-wrap; line-height: 1.6;">${geminiResponse}</div>
            `;
            interceptEvaluationEnd();
        });

        li.querySelector('.btn-delete-doc').addEventListener('click', async (e) => { // Ajout de 'async'
            const docId = e.target.getAttribute('data-id');
            if (confirm("Supprimer ce document de votre casier ?")) {
                try {
                    await deleteDocFromDB(docId); // Suppression physique dans IndexedDB
                    savedLockerDocs = savedLockerDocs.filter(d => d.id !== docId);
                    renderLockerList();
                } catch(err) {
                    showToast("Erreur lors de la suppression.", "error");
                }
            }
        });

        lockerList.appendChild(li);
    });
}

function interceptEvaluationEnd() {
    setTimeout(() => {
        if (btnShowSummary) {
            btnShowSummary.disabled = false;
            btnShowSummary.style.opacity = "1";
        }
        const successBanner = document.createElement('div');
        successBanner.className = "timer-alert unlocked";
        successBanner.style.cssText = "background-color: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; margin-top: 15px;";
        successBanner.innerHTML = "🎉 Examen validé ! Vous pouvez maintenant consulter la synthèse complète.";
        if (explanationSection) explanationSection.appendChild(successBanner);
    }, 10000); // Déblocage au bout de 10 secondes de lecture/travail
}

// ==========================================================================
// 10. INITIALISATION AU DÉMARRAGE ET SERVICE WORKER PWA
// ==========================================================================
window.addEventListener('DOMContentLoaded', async () => {
    renderAcademicHistory();
    
    // Initialisation de la base de données haute capacité
    try {
        await initIndexedDB();
        const storedDocs = await getAllDocsFromDB();
        // Tri décroissant pour afficher les documents les plus récents en haut
        savedLockerDocs = storedDocs.sort((a, b) => b.id.localeCompare(a.id));
        renderLockerList();
    } catch (error) {
        console.error("Impossible de charger le casier :", error);
        if (lockerList) {
            lockerList.innerHTML = `<li style="color: #ef4444; padding: 15px; justify-content: center;">❌ Erreur d'accès au stockage local.</li>`;
        }
    }

});

// Enregistrement sécurisé du Service Worker (Évite les erreurs sur les protocoles non-HTTP)
if ("serviceWorker" in navigator && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then((reg) => console.log("✅ PWA prête pour l'installation sur mobile !", reg.scope))
            .catch((err) => console.warn("ℹ️ Service worker non enregistré (Mode aperçu local) :", err.message));
    });
}
// ==========================================================================
// 11. GESTION DE LA NAVIGATION (SINGLE PAGE APPLICATION)
// ==========================================================================
const navItems = document.querySelectorAll('.nav-item');
const appViews = document.querySelectorAll('.app-view');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // 1. Retirer l'état 'active' de tous les boutons de la barre
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // 2. Mettre en surbrillance le bouton cliqué
        item.classList.add('active');

        // 3. Cacher toutes les sections de l'application
        appViews.forEach(view => view.classList.remove('active-view'));
        
        // 4. Afficher uniquement la section ciblée par le bouton
        const targetId = item.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active-view');
            // Petit scroll automatique vers le haut lors du changement de page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
// ==========================================================================
// 12. SYSTÈME DE NOTIFICATIONS (TOASTS NON-BLOQUANTS)
// ==========================================================================
function showToast(message, type = 'info') {
    // 1. Création du conteneur s'il n'existe pas encore
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Création de la notification
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Définition de l'icône selon la gravité
    let icon = 'ℹ️';
    if(type === 'success') icon = '✅';
    if(type === 'error') icon = '❌';
    if(type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // 3. Déclenchement de l'animation CSS (léger délai nécessaire)
    setTimeout(() => toast.classList.add('show'), 10);

    // 4. Auto-destruction après 3.5 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        // On attend la fin de l'animation (0.4s) pour supprimer l'élément du DOM
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}
// ==========================================================================
// 13. FORMATAGE DU TEXTE IA (TRADUCTEUR MARKDOWN LÉGER)
// ==========================================================================
function formatAIText(text) {
    if (!text) return "";
    return text
        // 1. Blocs de code (```code```)
        .replace(/```([\s\S]*?)```/g, '<pre style="background:#1e293b; color:#f8fafc; padding:10px; border-radius:6px; overflow-x:auto; margin:8px 0; font-size: 13px;"><code>$1</code></pre>')
        // 2. Code en ligne (`code`)
        .replace(/`([^`]+)`/g, '<code style="background:#e2e8f0; padding:2px 4px; border-radius:4px; color:#ef4444; font-family: monospace; font-size: 13px;">$1</code>')
        // 3. Titres (### Titre)
        .replace(/^### (.*$)/gim, '<strong style="color: var(--primary, #4f46e5); display: block; margin-top: 10px; font-size: 15px;">$1</strong>')
        // 4. Mots en gras (**texte**)
        .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #111827;">$1</strong>')
        // 5. Mots en italique (*texte*)
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // 6. Listes à puces (- ou *)
        .replace(/^[*-] (.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>')
        // 7. Sauts de ligne (pour aérer les paragraphes)
        .replace(/\n/g, '<br>');
}