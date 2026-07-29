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
const universityProgram = {
    l1_mi: [
        "[Semestre 1] UE Analyse 1 : Fonctions d'une variable réelle",
        "[Semestre 1] UE Algèbre 1 : Structures algébriques et Polynômes",
        "[Semestre 1] UE Informatique 1 : Algorithmique et Introduction au C",
        "[Semestre 2] UE Analyse 2 : Intégration et Développements limités",
        "[Semestre 2] UE Algèbre 2 : Espaces vectoriels et Systèmes linéaires"
    ],
    l1_pc: [
        "[Semestre 1] UE Physique 1 : Mécanique du point et Vecteurs",
        "[Semestre 1] UE Chimie 1 : Structure de la matière et Atomistique",
        "[Semestre 2] UE Physique 2 : Thermodynamique physique et Électricité",
        "[Semestre 2] UE Chimie 2 : Thermodynamique chimique et Solutions aqueuses"
    ],
    l2_info: [
        "[Semestre 3] UE Algorithmique avancée et Structures de données en C",
        "[Semestre 3] UE Architecture des Ordinateurs et Langage Assembleur",
        "[Semestre 4] UE Systèmes d'Exploitation (Linux et Programmation Script)",
        "[Semestre 4] UE Systèmes de Gestion de Bases de Données (SGBD/SQL)"
    ],
    l3_maths: [
        "[Semestre 5] UE Topologie et Espaces métriques",
        "[Semestre 5] UE Intégration de Lebesgue et Analyse de Fourier",
        "[Semestre 6] UE Algèbre bilinéaire et Géométrie",
        "[Semestre 6] UE Probabilités fondamentales et Statistiques"
    ]
};

let currentActiveSubject = "libre";
let revisionTimer = null;
let localStream = null;
let tempFileDataUrl = "";
let tempFileName = "";

// Initialisation des données locales
let academicHistory = JSON.parse(localStorage.getItem('academicHistory')) || [];
let savedLockerDocs = JSON.parse(localStorage.getItem('studentLocker')) || [];
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
        if (item.subject === "l2_info") levelName = "L2-Info";
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
            alert("Veuillez sélectionner une matière ou saisir un sujet de cours.");
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
        try {
            const geminiResponse = await callGeminiAI(systemInstruction, quizPrompt);
            explanationSection.innerHTML = `<div class="content-box" style="white-space: pre-wrap; line-height: 1.6;">${geminiResponse}</div>`;
        } catch (error) {
            explanationSection.innerHTML = `<div style="color: #ef4444; font-weight: 600;">❌ Erreur lors de la communication avec Gemini. Veuillez vérifier votre connexion.</div>`;
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
            alert("Aucune synthèse disponible pour le moment.");
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
        const contentToDownload = explanationSection ? explanationSection.innerText : "";
        const currentTopic = (topicInput && topicInput.value.trim()) ? topicInput.value.trim() : "cours_sciences";

        if (!contentToDownload || contentToDownload.includes("analyse le programme")) {
            alert("Aucun document à exporter pour le moment.");
            return;
        }

        const fileHeader = `==================================================\n` +
                           `   RÉPUBLIQUE DE CÔTE D'IVOIRE - MESRS\n` +
                           `   FICHE DE RÉVISION UNIVERSITAIRE - LICENCE\n` +
                           `   Sujet : ${currentTopic}\n` +
                           `   Généré le : ${new Date().toLocaleDateString('fr-FR')}\n` +
                           `==================================================\n\n`;

        const blob = new Blob([fileHeader + contentToDownload], { type: 'text/plain;charset=utf-8' });
        const downloadLink = document.createElement('a');
        downloadLink.download = `fiche_licence_${currentTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
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

    activeChatHistory.push({ text: question, sender: 'user' });
    appendMessage(question, 'user');
    chatUserInput.value = "";
    saveChatToLocalStorage();

    const loadingId = appendMessage("Gemini est en train de rédiger une explication... 🧠", 'ai');
    const currentCourseContent = explanationSection ? explanationSection.innerText : "";
    
    const systemInstruction = "Tu es un professeur de sciences en Licence en Côte d'Ivoire. Réponds de façon concise et pédagogique.";
    try {
        const response = await callGeminiAI(systemInstruction, `Contexte du cours : ${currentCourseContent}\n\nQuestion de l'étudiant : ${question}`);
        const loaderElem = document.getElementById(loadingId);
        if (loaderElem) loaderElem.innerText = response;
        activeChatHistory.push({ text: response, sender: 'ai' });
        saveChatToLocalStorage();
    } catch (error) {
        const loaderElem = document.getElementById(loadingId);
        if (loaderElem) loaderElem.innerText = "❌ Erreur de réponse de l'IA.";
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
        msgDiv.innerText = msg.text;
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
            alert("Impossible d'accéder à l'appareil photo. Vérifiez les autorisations.");
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
    btnSaveDocument.addEventListener('click', () => {
        const docCustomName = documentNameInput ? documentNameInput.value.trim() : "";
        const docType = documentTypeSelect ? documentTypeSelect.value : "TD";

        if (!docCustomName || !tempFileDataUrl) {
            alert("Veuillez donner un nom et sélectionner un fichier.");
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

        savedLockerDocs.unshift(newDocRecord);
        try {
            localStorage.setItem('studentLocker', JSON.stringify(savedLockerDocs));
            renderLockerList();
            if (documentNameInput) documentNameInput.value = "";
            if (selectedFileLabel) selectedFileLabel.innerText = "";
            tempFileDataUrl = "";
            tempFileName = "";
        } catch (storageError) {
            alert("⚠️ Espace de stockage plein (limite 5 Mo). Supprimez d'anciens documents.");
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

        li.querySelector('.btn-delete-doc').addEventListener('click', (e) => {
            const docId = e.target.getAttribute('data-id');
            if (confirm("Supprimer ce document de votre casier ?")) {
                savedLockerDocs = savedLockerDocs.filter(d => d.id !== docId);
                localStorage.setItem('studentLocker', JSON.stringify(savedLockerDocs));
                renderLockerList();
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
window.addEventListener('DOMContentLoaded', () => {
    renderAcademicHistory();
    renderLockerList();
});

// Enregistrement sécurisé du Service Worker (Évite les erreurs sur les protocoles non-HTTP)
if ("serviceWorker" in navigator && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then((reg) => console.log("✅ PWA prête pour l'installation sur mobile !", reg.scope))
            .catch((err) => console.warn("ℹ️ Service worker non enregistré (Mode aperçu local) :", err.message));
    });
}