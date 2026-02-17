// ============================================
// OPTICORE VIPRO - "BILLION DOLLAR" ENGINE UPGRADE
// Features: Decoupled Rendering, Physics Smoothing, Zero Lag
// ============================================

// State Management
let state = {
    isCameraActive: false,
    selectedGlasses: {
        id: 1,
        name: "Classic Thick-Rim Rectangular",
        price: "Professional Grade",
        image: "frame1.png",
        style: "classic",
        scale: 0.8,
        verticalAdjust: 0.25
    },
    isStaticMode: false,
    faceDetectionActive: false,
    currentFilter: "none",
    modelsLoaded: false,
    smartMode: false,
    glassesScale: 1.0,
    verticalOffset: 0.0,
    horizontalOffset: 0.0,
    glassesX: 50,
    glassesY: 40,
    lastCapturedImage: null,
    
    // SMOOTHING ENGINE: Separates Target (AI) from Render (Visuals)
    target: {
        x: 0,
        y: 0,
        scale: 0,
        angle: 0,
        valid: false
    },
    
    // Current visual state (interpolated)
    render: {
        x: 0,
        y: 0,
        scale: 0,
        angle: 0,
        initialized: false
    },
    
    // BIOMETRICS STATE
    biometrics: {
        pd: 0,
        faceWidth: 0,
        lastUpdated: 0
    }
};

// Glasses Catalog
const glassesCatalog = [
    { id: 1, name: "Classic Thick-Rim", price: "Professional Grade", image: "frame1.png", category: ["professional", "classic"], badge: "Premium", scale: 0.8, style: "classic", verticalAdjust: 0.20 },
    { id: 2, name: "Wide Rectangular", price: "Professional Grade", image: "frame2.png", category: ["professional", "contemporary"], scale: 0.8, style: "modern", verticalAdjust: 0.22 },
    { id: 3, name: "Thin Metal", price: "Professional Grade", image: "frame3.png", category: ["professional", "contemporary"], badge: "Trending", scale: 0.75, style: "designer", verticalAdjust: 0.21 },
    { id: 4, name: "Gold Metal", price: "Professional Grade", image: "frame4.png", category: ["professional", "classic"], scale: 0.78, style: "vintage", verticalAdjust: 0.23 },
    { id: 5, name: "Aviator", price: "Professional Grade", image: "frame5.png", category: ["professional", "contemporary"], scale: 0.85, style: "aviator", verticalAdjust: 0.25 },
    { id: 6, name: "Modern Square", price: "Professional Grade", image: "frame6.png", category: ["professional", "contemporary"], scale: 0.82, style: "cateye", verticalAdjust: 0.19 },
    { id: 7, name: "Soft Square", price: "Professional Grade", image: "frame7.png", category: ["professional", "classic"], scale: 0.77, style: "round", verticalAdjust: 0.21 },
    { id: 8, name: "Oversized Square", price: "Professional Grade", image: "frame8.png", category: ["professional", "classic"], badge: "Popular", scale: 0.9, style: "oversized", verticalAdjust: 0.27 },
    { id: 9, name: "Slim Oval", price: "Professional Grade", image: "frame9.png", category: ["professional", "contemporary"], scale: 0.76, style: "rectangle", verticalAdjust: 0.20 },
    { id: 10, name: "Bold Square", price: "Professional Grade", image: "frame10.png", category: ["professional", "contemporary"], scale: 0.88, style: "oversized", verticalAdjust: 0.24 },
    { id: 11, name: "Round Metal", price: "Professional Grade", image: "frame11.png", category: ["professional", "contemporary"], badge: "Premium", scale: 0.74, style: "rimless", verticalAdjust: 0.21 },
    { id: 12, name: "Compact Rectangular", price: "Professional Grade", image: "frame12.png", category: ["professional", "contemporary"], scale: 0.8, style: "geometric", verticalAdjust: 0.22 }
];

// DOM Elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const staticContainer = document.getElementById('staticContainer');
const staticGlasses = document.getElementById('staticGlasses');
const loadingOverlay = document.getElementById('loadingOverlay');
const permissionOverlay = document.getElementById('permissionOverlay');
const startCameraBtn = document.getElementById('startCameraBtn');
const useStaticModeBtn = document.getElementById('useStaticModeBtn');
const toggleCameraBtn = document.getElementById('toggleCameraBtn');
const cameraStatus = document.getElementById('cameraStatus');
const captureBtn = document.getElementById('captureBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const resetBtn = document.getElementById('resetBtn');
const glassesGrid = document.getElementById('glassesGrid');
const selectedFrameImg = document.getElementById('selectedFrameImg');
const selectedFrameName = document.getElementById('selectedFrameName');
const selectedFramePrice = document.getElementById('selectedFramePrice');
const loadingText = document.getElementById('loadingText');
const sendToWhatsAppBtn = document.getElementById('sendToWhatsAppBtn');

// Biometrics DOM Elements
const pdValueDisplay = document.getElementById('pdValue');
const faceWidthValueDisplay = document.getElementById('faceWidthValue');
const biometricStatusDisplay = document.getElementById('biometricStatus');

// Consultation DOM Elements
const directCallBtn = document.getElementById('directCallBtn');
const whatsappConsultBtn = document.getElementById('whatsappConsultBtn');

// Navigation Elements
const framesLink = document.getElementById('framesLink');
const howItWorksLink = document.getElementById('howItWorksLink');
const privacyLink = document.getElementById('privacyLink');
const contactLink = document.getElementById('contactLink');

// Popup Elements
const howItWorksPopup = document.getElementById('howItWorksPopup');
const privacyPopup = document.getElementById('privacyPopup');
const contactPopup = document.getElementById('contactPopup');

// NEW: Ava DOM Elements
const avaToggleBtn = document.getElementById('avaToggleBtn');
const avaStatus = document.getElementById('avaStatus');
const avaInterface = document.getElementById('avaInterface');
const avaCloseBtn = document.getElementById('avaCloseBtn');
const avaMessages = document.getElementById('avaMessages');

// Image Cache
const imageCache = new Map();

// ===== MOBILE EXIT FUNCTION =====
function attemptExit() {
    try {
        window.close();
    } catch (e) {
        window.location.href = "about:blank";
    }
}

// ===== CODE PROTECTION (ANTI-INSPECT) =====
function enableCodeProtection() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showNotification('🔒 System Protected: Source Code Access Restricted', 'warning');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            showNotification('🔒 Developer Tools Disabled in Production Mode', 'warning');
        }
    });
}

// ===== POPUP MANAGEMENT =====
function showPopup(popupElement) {
    document.querySelectorAll('.popup-overlay').forEach(popup => {
        popup.style.display = 'none';
    });
    
    popupElement.style.display = 'flex';
    
    setTimeout(() => {
        popupElement.addEventListener('click', function(e) {
            if (e.target === this) {
                hidePopup(popupElement);
            }
        });
    }, 100);
}

function hidePopup(popupElement) {
    popupElement.style.display = 'none';
}

function setupPopupCloseButtons() {
    document.querySelectorAll('.popup-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const popup = this.closest('.popup-overlay');
            hidePopup(popup);
        });
    });
}

// ===== NAVIGATION FUNCTIONS =====
function setupNavigation() {
    framesLink.addEventListener('click', function(e) {
        e.preventDefault();
        const framesSection = document.getElementById('framesSection');
        if (framesSection) {
            framesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            updateActiveNavLink('frames');
        }
    });

    howItWorksLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPopup(howItWorksPopup);
        updateActiveNavLink('howItWorks');
    });

    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPopup(privacyPopup);
        updateActiveNavLink('privacy');
    });

    contactLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPopup(contactPopup);
    });
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    switch(activeLink) {
        case 'frames':
            framesLink.classList.add('active');
            break;
        case 'howItWorks':
            howItWorksLink.classList.add('active');
            break;
        case 'privacy':
            privacyLink.classList.add('active');
            break;
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔬 Opticore ViPro - Billon Dollar Engine Loaded");
    
    enableCodeProtection();
    setupPopupCloseButtons();
    setupNavigation();
    
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        initApplication();
    }, 4200);
});

function initApplication() {
    renderGlassesGrid();
    setupEventListeners();
    showPermissionOverlay();
    loadFaceModels();
    shareBtn.disabled = false;
    
    // FIXED: Initialize Ava Assistant
    setupAvaButton();
}

// ===== AVA AI ASSISTANT SETUP =====
function setupAvaButton() {
    if (avaToggleBtn) {
        avaToggleBtn.addEventListener('click', toggleAva);
        
        // Setup close button
        if (avaCloseBtn) {
            avaCloseBtn.addEventListener('click', toggleAva);
        }
        
        // Setup quick action buttons
        document.querySelectorAll('.ava-quick-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                handleAvaQuickAction(action);
            });
        });
        
        // Setup keyboard shortcut (Ctrl + M)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                toggleAva();
            }
        });
    }
}

function toggleAva() {
    if (avaInterface.style.display === 'flex') {
        avaInterface.style.display = 'none';
        avaStatus.textContent = 'Off';
        avaToggleBtn.style.background = 'linear-gradient(135deg, #9c27b0, #673ab7)';
    } else {
        avaInterface.style.display = 'flex';
        avaStatus.textContent = 'On';
        avaToggleBtn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
        
        // Show welcome message if empty
        if (avaMessages.children.length === 0) {
            showAvaMessage("Hello! I'm Ava, your optical intelligence assistant. How can I help you with your virtual try-on experience today?", true);
        }
    }
}

function showAvaMessage(message, isAva = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ava-message ${isAva ? 'ava-message' : 'user-message'}`;
    messageDiv.textContent = message;
    
    if (isAva) {
        messageDiv.classList.add('ava-welcome-msg');
    }
    
    avaMessages.appendChild(messageDiv);
    avaMessages.scrollTop = avaMessages.scrollHeight;
}

function handleAvaQuickAction(action) {
    let message = '';
    let response = '';
    
    switch(action) {
        case 'neural':
            message = "Tell me about Neural Calibration";
            response = "Neural Calibration is our advanced AI layer that enables precise facial mapping. Activate it with Ctrl+D to see real-time biometric data and facial landmarks. This helps ensure your eyewear fits perfectly by analyzing 68 facial points.";
            break;
        case 'pupil':
            message = "How do I measure pupil distance?";
            response = "Pupillary Distance (PD) is automatically calculated when your face is detected. For accurate results:\n1. Position yourself 40-60cm from camera\n2. Ensure good lighting\n3. Look directly at the camera\n4. Keep your head straight\nThe system will display your PD in millimeters for professional prescription.";
            break;
        case 'frames':
            message = "How do I select frames?";
            response = "Selecting frames is easy:\n1. Browse our 12 professional models\n2. Click any frame to try it instantly\n3. Use +/- keys to adjust size\n4. Use arrow keys for positioning\n5. Try different categories: Professional, Contemporary, Classic\nPro tip: Frames with 'Premium' badges offer advanced optical features.";
            break;
        case 'help':
            message = "I need help";
            response = "I'm here to help! Here are key features:\n• Camera: Click 'Start Visual Analysis'\n• Static Mode: Use reference image\n• Capture: Save/download your try-on\n• Share: Send to consultation\n• Adjustments: Use keyboard shortcuts\n• Contact: Direct call/WhatsApp support\nPress Ctrl+M anytime to talk to me!";
            break;
    }
    
    if (message && response) {
        showAvaMessage(message, false);
        setTimeout(() => {
            showAvaMessage(response, true);
        }, 500);
    }
}

// ===== FACE MODEL LOADING =====
async function loadFaceModels() {
    loadingText.textContent = 'Loading visual intelligence...';
    loadingOverlay.style.display = 'flex';
    
    try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        
        state.modelsLoaded = true;
        loadingText.textContent = 'Systems ready';
        
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 1000);
        
    } catch (error) {
        console.error('Model loading error:', error);
        loadingText.textContent = 'Basic mode activated';
        state.modelsLoaded = false;
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 2000);
    }
}

// ===== RENDER GLASSES GRID =====
function renderGlassesGrid() {
    glassesGrid.innerHTML = '';
    
    glassesCatalog.forEach(glasses => {
        const card = document.createElement('div');
        card.className = 'glasses-card';
        card.dataset.id = glasses.id;
        
        let badgeHTML = '';
        if (glasses.badge) {
            badgeHTML = `<div class="card-badge">${glasses.badge}</div>`;
        }
        
        card.innerHTML = `
            <img src="assets/glasses/${glasses.image}" alt="${glasses.name}">
            <h4>${glasses.name}</h4>
            <p>${glasses.price}</p>
            ${badgeHTML}
        `;
        
        card.addEventListener('click', () => selectGlasses(glasses));
        glassesGrid.appendChild(card);
        
        preloadImage(`assets/glasses/${glasses.image}`, glasses.id);
    });
    
    selectGlasses(glassesCatalog[0]);
}

// ===== PRELOAD IMAGE =====
function preloadImage(src, id) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        imageCache.set(id, img);
        console.log(`✅ Loaded: ${src}`);
    };
    img.onerror = function() {
        console.error(`❌ Failed: ${src}`);
    };
    img.src = src;
}

// ===== SELECT GLASSES =====
function selectGlasses(glasses) {
    state.selectedGlasses = glasses;
    state.glassesScale = 1.0;
    state.verticalOffset = 0;
    state.horizontalOffset = 0;
    
    const cachedImg = imageCache.get(glasses.id);
    if (cachedImg) {
        selectedFrameImg.src = cachedImg.src;
    } else {
        selectedFrameImg.src = `assets/glasses/${glasses.image}`;
    }
    
    selectedFrameName.textContent = glasses.name;
    selectedFramePrice.textContent = glasses.price;
    
    if (state.isStaticMode) {
        if (cachedImg) {
            staticGlasses.src = cachedImg.src;
        } else {
            staticGlasses.src = `assets/glasses/${glasses.image}`;
        }
        staticGlasses.style.width = `${200 * state.glassesScale}px`;
    }
    
    document.querySelectorAll('.glasses-card').forEach(card => {
        if (card.dataset.id == glasses.id) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    startCameraBtn.addEventListener('click', startCamera);
    useStaticModeBtn.addEventListener('click', activateStaticMode);
    toggleCameraBtn.addEventListener('click', toggleCamera);
    
    captureBtn.addEventListener('click', () => capturePhoto('open'));
    downloadBtn.addEventListener('click', () => capturePhoto('download'));
    shareBtn.addEventListener('click', () => capturePhoto('share'));
    resetBtn.addEventListener('click', resetApp);
    
    document.querySelectorAll('.adjust-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.adjust;
            handleAdjustment(action);
        });
    });
    
    document.querySelectorAll('.light-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.light-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            applyCanvasFilter(filter);
        });
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterGlasses(this.textContent.toLowerCase());
        });
    });
    
    sendToWhatsAppBtn.addEventListener('click', sendToWhatsAppDirect);
    
    // NEW: Consultation Button Logic
    directCallBtn.addEventListener('click', () => {
        window.location.href = 'tel:+254113400063';
    });

    whatsappConsultBtn.addEventListener('click', () => {
        const message = 'Hello, I would like to request a consultation';
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/254113400063?text=${encodedMessage}`, '_blank');
    });
    
    // Setup How It Works popup start button
    document.querySelector('.start-try-on-btn').addEventListener('click', function() {
        hidePopup(howItWorksPopup);
        startCamera();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.ctrlKey && e.key === 'd') {
            state.smartMode = !state.smartMode;
            showNotification(
                `Neural Calibration Layer ${state.smartMode ? 'ENABLED' : 'DISABLED'}`, 
                state.smartMode ? 'success' : 'info'
            );
            e.preventDefault();
            return;
        }
        
        switch(e.key) {
            case '+': case '=':
                state.glassesScale = Math.min(2.0, state.glassesScale + 0.1);
                if (state.isStaticMode) staticGlasses.style.width = `${200 * state.glassesScale}px`;
                e.preventDefault(); break;
            case '-': case '_':
                state.glassesScale = Math.max(0.5, state.glassesScale - 0.1);
                if (state.isStaticMode) staticGlasses.style.width = `${200 * state.glassesScale}px`;
                e.preventDefault(); break;
            case 'ArrowUp':
                handleAdjustment('position-up'); e.preventDefault(); break;
            case 'ArrowDown':
                handleAdjustment('position-down'); e.preventDefault(); break;
            case 'ArrowLeft':
                handleAdjustment('position-left'); e.preventDefault(); break;
            case 'ArrowRight':
                handleAdjustment('position-right'); e.preventDefault(); break;
        }
    });
}

// ===== BIOMETRICS CALCULATION =====
let lastBiometricUpdate = 0;

function calculateBiometrics(landmarks) {
    const now = Date.now();
    // THROTTLE: Update UI only every 200ms to save CPU and prevent lag
    if (now - lastBiometricUpdate < 200) return;
    lastBiometricUpdate = now;

    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    const leftEyeCenter = getCenterPoint(leftEye);
    const rightEyeCenter = getCenterPoint(rightEye);
    
    const pdPixels = Math.sqrt(
        Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
        Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
    );
    
    const jaw = landmarks.getJawOutline();
    const faceWidthPixels = Math.sqrt(
        Math.pow(jaw[16].x - jaw[0].x, 2) + 
        Math.pow(jaw[16].y - jaw[0].y, 2)
    );
    
    const averageFaceWidthMm = 145; 
    const mmPerPx = averageFaceWidthMm / faceWidthPixels;
    
    const pdMm = pdPixels * mmPerPx;
    const faceWidthMm = faceWidthPixels * mmPerPx;
    
    state.biometrics.pd = pdMm.toFixed(1);
    state.biometrics.faceWidth = faceWidthMm.toFixed(1);
    state.biometrics.lastUpdated = now;
    
    pdValueDisplay.textContent = `${state.biometrics.pd} mm`;
    faceWidthValueDisplay.textContent = `${state.biometrics.faceWidth} mm`;
    biometricStatusDisplay.innerHTML = '<i class="fas fa-check-circle"></i> Analysis Active';
    biometricStatusDisplay.style.color = '#81c784';
}

// ===== CAMERA FUNCTIONS =====
async function startCamera() {
    try {
        loadingOverlay.style.display = 'flex';
        loadingText.textContent = 'Requesting camera access...';
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });
        
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        canvasElement.style.display = 'block';
        staticContainer.style.display = 'none';
        
        videoElement.onloadedmetadata = async () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            
            state.isCameraActive = true;
            state.isStaticMode = false;
            cameraStatus.textContent = 'On';
            toggleCameraBtn.innerHTML = '<i class="fas fa-video"></i> Camera: On';
            
            loadingOverlay.style.display = 'none';
            permissionOverlay.style.display = 'none';
            
            state.render.initialized = false;
            state.target.valid = false;
            biometricStatusDisplay.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Calibrating...';
            
            if (state.modelsLoaded) {
                startFaceDetection();
                startRenderLoop(); // CRITICAL: Start separate render loop
            } else {
                drawBasicVideo();
            }
        };
        
    } catch (error) {
        console.error('Camera error:', error);
        loadingOverlay.style.display = 'none';
        showNotification('Camera access denied. Using static mode.', 'warning');
        activateStaticMode();
    }
}

// ===== FACE DETECTION FUNCTIONS =====
async function startFaceDetection() {
    if (!state.isCameraActive || state.isStaticMode) return;
    
    state.faceDetectionActive = true;
    
    // Run detection loop independent of rendering
    detectionLoop();
}

// NEW: Separated Detection Loop (Async, updates Target)
async function detectionLoop() {
    if (!state.faceDetectionActive || !state.isCameraActive) return;
    
    try {
        const detections = await faceapi
            .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions({
                inputSize: 320, // Slightly smaller for speed (performance tweak)
                scoreThreshold: 0.4 // Lower threshold for better tracking
            }))
            .withFaceLandmarks(true);
        
        if (detections.length > 0) {
            const detection = detections[0];
            const landmarks = detection.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            
            const leftEyeCenter = getCenterPoint(leftEye);
            const rightEyeCenter = getCenterPoint(rightEye);
            
            const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
            const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
            
            const eyeDistance = Math.sqrt(
                Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
                Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
            );
            
            const dx = rightEyeCenter.x - leftEyeCenter.x;
            const dy = rightEyeCenter.y - leftEyeCenter.y;
            const angle = Math.atan2(dy, dx);
            
            const baseWidth = eyeDistance * 2.4;
            const frameScale = state.selectedGlasses.scale || 0.8;
            const userScale = state.glassesScale;
            
            // UPDATE TARGET STATE (Do not draw yet)
            state.target.x = centerX;
            state.target.y = centerY;
            state.target.scale = baseWidth * frameScale * userScale;
            state.target.angle = angle;
            state.target.valid = true;
            state.target.eyeDistance = eyeDistance; // Needed for offsets
            
            calculateBiometrics(landmarks);
            
            if (state.smartMode) {
                // Store detection for smart mode render (needs canvas context in render loop)
                state.lastSmartDetection = detection;
            }
        } else {
            // If no face, don't invalidate target immediately (allows smooth fade/hold)
            // But mark it as old so render loop can handle "lost face" logic if needed
            // For "Silicon Valley" feel, we keep them where they were
        }
        
        // Keep detecting
        detectionLoop();
        
    } catch (error) {
        console.error('Detection error:', error);
        setTimeout(detectionLoop, 100);
    }
}

// NEW: Separated Render Loop (60fps, draws Smooth)
function startRenderLoop() {
    if (!state.isCameraActive || state.isStaticMode) return;
    
    const ctx = canvasElement.getContext('2d');
    
    function loop() {
        if (!state.isCameraActive) return;

        // 1. Draw Video Feed (Always happens, even if detection lags)
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // 2. Apply Filters to Canvas
        if (state.currentFilter && state.currentFilter !== 'none') {
            ctx.filter = state.currentFilter;
        } else {
            ctx.filter = 'none';
        }

        // 3. Handle SmartMode Overlay (on top of video)
        if (state.smartMode && state.lastSmartDetection) {
            drawCoolSmartMode(ctx, state.lastSmartDetection);
        }

        // 4. Physics-Based Smoothing (LERP)
        // Move render state towards target state
        const smoothingFactor = 0.25; // Adjust for "weight" feel. Lower = heavier/smoother.
        
        if (state.target.valid) {
            if (!state.render.initialized) {
                // Instant snap on first detection
                state.render.x = state.target.x;
                state.render.y = state.target.y;
                state.render.scale = state.target.scale;
                state.render.angle = state.target.angle;
                state.render.initialized = true;
            } else {
                // Smoothly interpolate
                state.render.x += (state.target.x - state.render.x) * smoothingFactor;
                state.render.y += (state.target.y - state.render.y) * smoothingFactor;
                state.render.scale += (state.target.scale - state.render.scale) * smoothingFactor;
                
                let deltaAngle = state.target.angle - state.render.angle;
                // Handle angle wrapping (PI to -PI)
                while (deltaAngle <= -Math.PI) deltaAngle += Math.PI * 2;
                while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
                state.render.angle += deltaAngle * smoothingFactor;
            }
            
            // Draw Glasses at SMOOTHED position
            const glassesImg = imageCache.get(state.selectedGlasses.id);
            if (glassesImg && glassesImg.complete) {
                const aspectRatio = glassesImg.width / glassesImg.height;
                const verticalAdjust = (state.selectedGlasses.verticalAdjust || 0.20) * state.target.eyeDistance;
                const userVerticalOffset = state.verticalOffset * state.target.eyeDistance;
                const userHorizontalOffset = state.horizontalOffset * state.target.eyeDistance;
                
                // Apply offsets to smoothed position
                const finalX = state.render.x + userHorizontalOffset;
                const finalY = state.render.y + verticalAdjust + userVerticalOffset;

                drawGlasses(ctx, finalX, finalY, state.render.scale, state.render.angle, glassesImg, aspectRatio);
            }
        } else {
            biometricStatusDisplay.innerHTML = '<i class="fas fa-search"></i> Awaiting Face';
        }

        requestAnimationFrame(loop);
    }
    loop();
}

// Unified Draw Function
function drawGlasses(ctx, x, y, width, angle, img, aspectRatio) {
    const height = width / aspectRatio;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
        img,
        -width / 2,
        -height / 2,
        width,
        height
    );
    
    ctx.restore();
}

// ===== COOL SMARTMODE VISUALS =====
function drawCoolSmartMode(ctx, detection) {
    const landmarks = detection.landmarks;
    const box = detection.detection.box;
    const positions = landmarks.positions;
    
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    
    for (let i = 0; i < positions.length - 1; i++) {
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[i+1].x, positions[i+1].y);
    }
    ctx.moveTo(positions[positions.length-1].x, positions[positions.length-1].y);
    ctx.lineTo(positions[0].x, positions[0].y);
    
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    ctx.fillStyle = '#ff00ff';
    const features = [30, 48, 54, 0, 16];
    
    features.forEach(idx => {
        ctx.beginPath();
        ctx.arc(positions[idx].x, positions[idx].y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const leftEyeCenter = getCenterPoint(leftEye);
    const rightEyeCenter = getCenterPoint(rightEye);
    
    const eyes = [
        { p: leftEyeCenter, label: 'R' },
        { p: rightEyeCenter, label: 'L' }
    ];
    
    ctx.font = 'bold 16px "Segoe UI"';
    eyes.forEach(eye => {
        ctx.beginPath();
        ctx.arc(eye.p.x, eye.p.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(eye.label, eye.p.x, eye.p.y + 1);
    });
    
    const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#00ff00';
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Segoe UI"';
    ctx.fillText('C', centerX, centerY + 1);
    
    ctx.restore();
}

function getCenterPoint(points) {
    let sumX = 0, sumY = 0;
    points.forEach(point => {
        sumX += point.x;
        sumY += point.y;
    });
    return { 
        x: sumX / points.length, 
        y: sumY / points.length 
    };
}

function drawCenteredGlasses(ctx) {
    const glassesImg = imageCache.get(state.selectedGlasses.id);
    if (!glassesImg || !glassesImg.complete) return;
    
    const scale = 0.3 * state.glassesScale;
    const x = canvasElement.width / 2;
    const y = canvasElement.height / 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;

    if (state.currentFilter && state.currentFilter !== 'none') {
        ctx.filter = state.currentFilter;
    }
    
    ctx.drawImage(
        glassesImg,
        -glassesImg.width * scale / 2,
        -glassesImg.height * scale / 2,
        glassesImg.width * scale,
        glassesImg.height * scale
    );
    
    ctx.restore();
}

function drawBasicVideo() {
    function drawLoop() {
        if (!state.isCameraActive || state.isStaticMode) return;
        
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        drawCenteredGlasses(ctx);
        
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
}

function activateStaticMode() {
    state.isStaticMode = true;
    state.isCameraActive = false;
    state.faceDetectionActive = false;
    
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    
    staticContainer.style.display = 'flex';
    videoElement.style.display = 'none';
    canvasElement.style.display = 'none';
    permissionOverlay.style.display = 'none';
    loadingOverlay.style.display = 'none';
    
    cameraStatus.textContent = 'Static';
    toggleCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Camera: Static';
    
    const cachedImg = imageCache.get(state.selectedGlasses.id);
    staticGlasses.src = cachedImg ? cachedImg.src : `assets/glasses/${state.selectedGlasses.image}`;
    
    staticGlasses.style.position = 'absolute';
    staticGlasses.style.width = `${200 * state.glassesScale}px`;
    staticGlasses.style.left = `${state.glassesX}%`;
    staticGlasses.style.top = `${state.glassesY}%`;
    staticGlasses.style.transform = 'translate(-50%, -50%)';
    staticGlasses.style.cursor = 'grab';
    
    pdValueDisplay.textContent = "-- mm";
    faceWidthValueDisplay.textContent = "-- mm";
    biometricStatusDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Static Mode';
    biometricStatusDisplay.style.color = '#ffab91';
    
    makeDraggable(staticGlasses);
}

function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDragTouch);
    
    function startDrag(e) {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        element.style.cursor = 'grabbing';
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        e.preventDefault();
    }
    
    function startDragTouch(e) {
        isDragging = true;
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        document.addEventListener('touchmove', dragTouch);
        document.addEventListener('touchend', stopDrag);
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging) return;
        const container = staticContainer.getBoundingClientRect();
        const x = e.clientX - container.left - offsetX;
        const y = e.clientY - container.top - offsetY;
        
        const percentX = (x / container.width) * 100;
        const percentY = (y / container.height) * 100;
        
        state.glassesX = Math.max(10, Math.min(percentX, 90));
        state.glassesY = Math.max(10, Math.min(percentY, 90));
        
        element.style.left = `${state.glassesX}%`;
        element.style.top = `${state.glassesY}%`;
        element.style.transform = 'translate(-50%, -50%)';
    }
    
    function dragTouch(e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const container = staticContainer.getBoundingClientRect();
        const x = touch.clientX - container.left - offsetX;
        const y = touch.clientY - container.top - offsetY;
        
        const percentX = (x / container.width) * 100;
        const percentY = (y / container.height) * 100;
        
        state.glassesX = Math.max(10, Math.min(percentX, 90));
        state.glassesY = Math.max(10, Math.min(percentY, 90));
        
        element.style.left = `${state.glassesX}%`;
        element.style.top = `${state.glassesY}%`;
        element.style.transform = 'translate(-50%, -50%)';
    }
    
    function stopDrag() {
        isDragging = false;
        element.style.cursor = 'grab';
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', dragTouch);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }
}

function toggleCamera() {
    if (state.isCameraActive) {
        state.faceDetectionActive = false;
        const stream = videoElement.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
        
        state.isCameraActive = false;
        cameraStatus.textContent = 'Off';
        toggleCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Camera: Off';
        
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        showPermissionOverlay();
    } else {
        startCamera();
    }
}

function showPermissionOverlay() {
    permissionOverlay.style.display = 'flex';
}

// ===== CAPTURE FUNCTION =====
function capturePhoto(action = 'open') {
    try {
        let dataUrl;
        
        if (state.isCameraActive && !state.isStaticMode) {
            dataUrl = captureFromCanvas();
        } else if (state.isStaticMode) {
            dataUrl = captureFromStatic();
        } else {
            throw new Error('No active view to capture');
        }
        
        if (!dataUrl) throw new Error('Failed to generate image');
        
        state.lastCapturedImage = dataUrl;
        
        switch(action) {
            case 'open':
                openResultPage(dataUrl);
                showNotification('Capture successful!', 'success');
                break;
            case 'download':
                downloadImage(dataUrl);
                break;
            case 'share':
                shareImage(dataUrl);
                break;
        }
        
    } catch (error) {
        console.error('Capture error:', error);
        showNotification(`Capture failed: ${error.message}`, 'error');
    }
}

// ===== WATERMARK HELPER =====
function drawWatermark(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('Opticore Vipro', width - 20, height - 20);
    ctx.restore();
}

function captureFromCanvas() {
    try {
        // Create a temp canvas to apply watermark without affecting live view
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        tempCanvas.width = canvasElement.width;
        tempCanvas.height = canvasElement.height;

        // Draw current canvas state to temp
        ctx.drawImage(canvasElement, 0, 0);

        // Apply filters if active
        if (state.currentFilter && state.currentFilter !== 'none') {
            ctx.filter = state.currentFilter;
            ctx.drawImage(canvasElement, 0, 0); // Re-draw with filter
        }

        // Draw Watermark
        drawWatermark(ctx, tempCanvas.width, tempCanvas.height);

        return tempCanvas.toDataURL('image/png', 1.0);
    } catch (e) {
        console.warn('Direct canvas capture failed. Trying video only.');
        return captureVideoOnly();
    }
}

function captureVideoOnly() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvasElement.width;
    tempCanvas.height = canvasElement.height;
    
    ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
    
    if (state.currentFilter && state.currentFilter !== 'none') {
        ctx.filter = state.currentFilter;
        ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
    }
    
    // Draw Watermark
    drawWatermark(ctx, tempCanvas.width, tempCanvas.height);
    
    return tempCanvas.toDataURL('image/png', 1.0);
}

function captureFromStatic() {
    try {
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        
        tempCanvas.width = 800;
        tempCanvas.height = 600;
        
        if (state.currentFilter && state.currentFilter !== 'none') {
            ctx.filter = state.currentFilter;
        }
        
        const bg = document.getElementById('staticModel');
        if (bg && bg.complete) {
            const scale = Math.min(tempCanvas.width / bg.naturalWidth, tempCanvas.height / bg.naturalHeight) * 0.85;
            const width = bg.naturalWidth * scale;
            const height = bg.naturalHeight * scale;
            ctx.drawImage(bg, (tempCanvas.width - width)/2, (tempCanvas.height - height)/2, width, height);
        }
        
        ctx.filter = 'none';
        
        const glassesImg = imageCache.get(state.selectedGlasses.id);
        if (glassesImg && glassesImg.complete) {
            const container = staticContainer;
            const rect = staticGlasses.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const x = (rect.left - containerRect.left) * (tempCanvas.width / container.offsetWidth);
            const y = (rect.top - containerRect.top) * (tempCanvas.height / container.offsetHeight);
            const width = rect.width * (tempCanvas.width / container.offsetWidth);
            const height = rect.height * (tempCanvas.height / container.offsetHeight);
            
            ctx.drawImage(glassesImg, x, y, width, height);
        }
        
        // Draw Watermark
        drawWatermark(ctx, tempCanvas.width, tempCanvas.height);
        
        return tempCanvas.toDataURL('image/png', 1.0);
        
    } catch (error) {
        console.error('Static capture error:', error);
        return createFallbackCapture();
    }
}

function createFallbackCapture() {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = 800;
    tempCanvas.height = 600;
    
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    const glassesImg = imageCache.get(state.selectedGlasses.id);
    if (glassesImg && glassesImg.complete) {
        const scale = 0.5;
        ctx.drawImage(glassesImg, tempCanvas.width/2 - (glassesImg.width*scale)/2, tempCanvas.height/2 - (glassesImg.height*scale)/2, glassesImg.width*scale, glassesImg.height*scale);
    }
    
    ctx.fillStyle = '#1a2980';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(state.selectedGlasses.name, tempCanvas.width / 2, 100);
    
    // Draw Watermark
    drawWatermark(ctx, tempCanvas.width, tempCanvas.height);
    
    return tempCanvas.toDataURL('image/png', 1.0);
}

function downloadImage(dataUrl) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `opticore-tryon-${timestamp}.png`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
        
        showNotification('Download started!', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed.', 'error');
    }
}

async function shareImage(dataUrl) {
    try {
        const message = `Check out my virtual try-on with ${state.selectedGlasses.name} from Opticore ViPro!`;
        
        if (navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'opticore-tryon.png', { type: 'image/png' });
                
                await navigator.share({
                    title: 'My Opticore ViPro Virtual Try-On',
                    text: message,
                    files: [file]
                });
                showNotification('Shared successfully!', 'success');
                return;
            } catch (shareError) {
                if (shareError.name !== 'AbortError') console.log('Web Share failed:', shareError);
            }
        }
        
        showShareOptions(dataUrl, message);
        
    } catch (error) {
        console.error('Share error:', error);
        showNotification('Share failed. Try downloading instead.', 'error');
    }
}

function showShareOptions(dataUrl, message) {
    const encodedMessage = encodeURIComponent(message);
    const shareHTML = `
        <div class="popup-overlay" id="sharePopup" style="display: flex;">
            <div class="popup-content">
                <div class="popup-header">
                    <h3><i class="fas fa-share-alt"></i> Share Your Try-On</h3>
                    <button class="popup-close" onclick="document.getElementById('sharePopup').remove()">×</button>
                </div>
                <div class="popup-body">
                    <p style="margin-bottom: 1.5rem; color: #5a6c7d;">Choose how to share:</p>
                    <div class="contact-options">
                        <a href="https://wa.me/?text=${encodedMessage}" target="_blank" class="contact-option-btn whatsapp-option">
                            <i class="fab fa-whatsapp"></i>
                            <div>
                                <strong>WhatsApp</strong>
                                <p style="font-size: 0.9rem; color: #7f8c8d; margin: 0;">Share via WhatsApp</p>
                            </div>
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="contact-option-btn" style="border-color: #3b5998;">
                            <i class="fab fa-facebook" style="color: #3b5998; font-size: 1.5rem;"></i>
                            <div>
                                <strong>Facebook</strong>
                                <p style="font-size: 0.9rem; color: #7f8c8d; margin: 0;">Share on Facebook</p>
                            </div>
                        </a>
                        <button onclick="navigator.clipboard.writeText('${dataUrl}').then(() => alert('Image data copied!')).catch(() => alert('Download first'));" class="contact-option-btn" style="border-color: #e74c3c;">
                            <i class="fas fa-download" style="color: #e74c3c; font-size: 1.5rem;"></i>
                            <div>
                                <strong>Download First</strong>
                                <p style="font-size: 0.9rem; color: #7f8c8d; margin: 0;">Download image to share</p>
                            </div>
                        </button>
                    </div>
                    <button onclick="document.getElementById('sharePopup').remove()" class="btn-secondary" style="width: 100%; margin-top: 1rem;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = shareHTML;
    document.body.appendChild(div);
}

function openResultPage(dataUrl) {
    const win = window.open('', '_blank', 'width=1000,height=750,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes');
    if (!win) {
        showNotification('Please allow popups.', 'warning');
        downloadImage(dataUrl);
        return;
    }
    
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Your Try-On</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
                .result-container { background: white; border-radius: 24px; padding: 3rem; max-width: 900px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #1a2980; margin-bottom: 1rem; font-size: 2.5rem; }
                img { max-width: 100%; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 2rem; }
                .btn-primary { background: linear-gradient(135deg, #1a2980, #2980b9); color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="result-container">
                <h1>Result</h1>
                <img src="${dataUrl}">
                <button class="btn-primary" onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
    win.document.close();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">×</button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

if(!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
        .notification { position: fixed; top: 20px; right: 20px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 10000; display: flex; align-items: center; gap: 15px; border-left: 5px solid #3498db; transform: translateX(120%); transition: transform 0.3s; }
        .notification.show { transform: translateX(0); }
        .notification-success { border-left-color: #27ae60; background: linear-gradient(to right, #f0f9ff, white); }
        .notification-warning { border-left-color: #f39c12; background: linear-gradient(to right, #fef9e7, white); }
        .notification-content { display: flex; align-items: center; gap: 10px; }
        .notification-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #95a5a6; }
    `;
    document.head.appendChild(style);
}

function sendToWhatsAppDirect() {
    const timestamp = new Date().toLocaleString();
    const pd = state.biometrics.pd || "Not measured";
    const faceWidth = state.biometrics.faceWidth || "Not measured";
    
    const message = `
*OPTICORE VIPRO - PRESCRIPTION READY REPORT*
-------------------------------------------
👤 *Client Analysis*
Frame: ${state.selectedGlasses.name}
Analysis Time: ${timestamp}

📏 *Clinical Measurements*
👁 Pupillary Distance (PD): ${pd}
📐 Face Width: ${faceWidth}

🔍 *Status:* READY FOR PRESCRIPTION

Please review attached image for final fitting confirmation.
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/254113400063?text=${encodedMessage}`;
    window.open(url, '_blank');
}

function applyCanvasFilter(filter) {
    state.currentFilter = filter;
    canvasElement.style.filter = filter;
    staticContainer.style.filter = filter;
}

function handleAdjustment(action) {
    switch(action) {
        case 'size-up':
            state.glassesScale = Math.min(2.0, state.glassesScale + 0.1);
            if (state.isStaticMode) staticGlasses.style.width = `${200 * state.glassesScale}px`;
            break;
        case 'size-down':
            state.glassesScale = Math.max(0.5, state.glassesScale - 0.1);
            if (state.isStaticMode) staticGlasses.style.width = `${200 * state.glassesScale}px`;
            break;
        case 'position-up':
            state.verticalOffset = Math.max(-0.3, state.verticalOffset - 0.03);
            if (state.isStaticMode) { state.glassesY = Math.max(10, state.glassesY - 2); staticGlasses.style.top = `${state.glassesY}%`; }
            break;
        case 'position-down':
            state.verticalOffset = Math.min(0.3, state.verticalOffset + 0.03);
            if (state.isStaticMode) { state.glassesY = Math.min(90, state.glassesY + 2); staticGlasses.style.top = `${state.glassesY}%`; }
            break;
        case 'position-left':
            state.horizontalOffset = Math.max(-0.3, state.horizontalOffset - 0.03);
            if (state.isStaticMode) { state.glassesX = Math.max(10, state.glassesX - 2); staticGlasses.style.left = `${state.glassesX}%`; }
            break;
        case 'position-right':
            state.horizontalOffset = Math.min(0.3, state.horizontalOffset + 0.03);
            if (state.isStaticMode) { state.glassesX = Math.min(90, state.glassesX + 2); staticGlasses.style.left = `${state.glassesX}%`; }
            break;
    }
}

function filterGlasses(category) {
    const cards = document.querySelectorAll('.glasses-card');
    cards.forEach(card => {
        const id = parseInt(card.dataset.id);
        const glasses = glassesCatalog.find(g => g.id === id);
        if (category === 'all collections' || category === 'all') card.style.display = 'block';
        else if (category === 'professional') card.style.display = glasses.category.includes('professional') ? 'block' : 'none';
        else if (category === 'contemporary') card.style.display = glasses.category.includes('contemporary') ? 'block' : 'none';
        else if (category === 'classic design') card.style.display = glasses.category.includes('classic') ? 'block' : 'none';
        else card.style.display = 'block';
    });
}

function resetApp() {
    if (confirm("Reset?")) {
        if (state.isCameraActive) {
            state.faceDetectionActive = false;
            if (videoElement.srcObject) videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        
        Object.assign(state, {
            isCameraActive: false, selectedGlasses: glassesCatalog[0], isStaticMode: false, faceDetectionActive: false,
            currentFilter: "none", modelsLoaded: state.modelsLoaded, smartMode: false,
            glassesScale: 1.0, verticalOffset: 0.0, horizontalOffset: 0.0, glassesX: 50, glassesY: 40,
            lastCapturedImage: null, 
            render: { x: 0, y: 0, scale: 0, angle: 0, initialized: false },
            target: { x:0, y:0, scale:0, angle:0, valid: false },
            biometrics: { pd: 0, faceWidth: 0, lastUpdated: 0 }
        });
        
        videoElement.style.display = 'none'; canvasElement.style.display = 'none'; staticContainer.style.display = 'none';
        canvasElement.style.filter = 'none'; staticContainer.style.filter = 'none';
        staticGlasses.style.left = '50%'; staticGlasses.style.top = '40%'; staticGlasses.style.transform = 'translate(-50%, -50%)'; staticGlasses.style.width = '200px';
        
        document.querySelectorAll('.light-btn').forEach((btn, i) => { btn.classList.remove('active'); if(i===0) btn.classList.add('active'); });
        document.querySelectorAll('.filter-btn').forEach((btn, i) => { btn.classList.remove('active'); if(i===0) btn.classList.add('active'); });
        
        pdValueDisplay.textContent = "-- mm";
        faceWidthValueDisplay.textContent = "-- mm";
        biometricStatusDisplay.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Awaiting Face Scan';
        
        showPermissionOverlay();
        selectGlasses(glassesCatalog[0]);
        filterGlasses('all');
        showNotification('Reset successfully', 'success');
    }
}

console.log("✅ Opticore ViPro - Billion Dollar Engine Active");
