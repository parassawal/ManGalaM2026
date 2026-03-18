// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    const form = document.getElementById('sharkTankForm');
    const sections = document.querySelectorAll('.form-section');
    const progressBar = document.getElementById('formProgress');
    const completedText = document.getElementById('completedSections');
    const submitBtn = document.getElementById('submitBtn');

    // File upload elements
    const pitchDeckUpload = document.getElementById('pitchDeckUpload');
    const pitchDeckInput = document.getElementById('pitchDeck');
    const prototypeUpload = document.getElementById('prototypeUpload');
    const prototypeInput = document.getElementById('prototypeImages');

    // Section progression logic
    const inputs = form.querySelectorAll('input, select, textarea');

    // Setup validation messages
    inputs.forEach(input => {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'This field is required';
        input.parentElement.appendChild(errorMsg);

        input.addEventListener('input', () => {
            validateInput(input);
            updateProgress();
        });

        input.addEventListener('change', () => {
            validateInput(input);
            updateProgress();
        });
    });

    function validateInput(input) {
        if (!input.required) return true;

        let isValid = false;

        if (input.type === 'checkbox') {
            isValid = input.checked;
        } else if (input.type === 'file') {
            isValid = input.files.length > 0;
        } else {
            isValid = input.value.trim() !== '';

            if (input.type === 'email' && isValid) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = re.test(input.value);
                const errorMsg = input.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = isValid ? '' : 'Please enter a valid email';
            }
        }

        const inputEl = input.type === 'file' ? input.closest('.upload-area') : input;

        // Remove error styling if valid
        if (isValid) {
            inputEl.classList.remove('input-error');
            const errorMsg = input.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.classList.remove('show');
        }

        return isValid;
    }

    function checkSectionValidity(section) {
        const sectionInputs = section.querySelectorAll('input[required], select[required], textarea[required]');
        let isSectionValid = true;

        sectionInputs.forEach(input => {
            if (!validateInput(input)) {
                isSectionValid = false;
            }
        });

        return isSectionValid;
    }

    function updateProgress() {
        let completed = 0;
        let allValidSoFar = true;

        sections.forEach((section, index) => {
            const isValid = checkSectionValidity(section);

            if (isValid) {
                completed++;
                // Unlock next section
                if (index + 1 < sections.length) {
                    sections[index + 1].classList.remove('collapsed');
                    sections[index + 1].classList.add('active');
                }
            } else {
                allValidSoFar = false;
                // Keep subsequent sections collapsed if this one is invalid
                for (let i = index + 1; i < sections.length; i++) {
                    sections[i].classList.add('collapsed');
                    sections[i].classList.remove('active');
                }
            }
        });

        const sectionCount = sections.length;
        // Check if there are visually "active" sections by counting them, 
        // User could have filled out portion of section 2 while section 1 is complete.
        // A simple heuristic for progress: 
        // 1 + completed (capped at total)
        let visualProgress = Math.min(completed + (allValidSoFar ? 0 : 1), sectionCount);
        if (completed === sectionCount) visualProgress = sectionCount;

        completedText.textContent = visualProgress;
        progressBar.style.width = `${(visualProgress / sectionCount) * 100}%`;

        // Button glow effect based on cursor position
        if (completed === sectionCount) {
            submitBtn.classList.remove('disabled');
        } else {
            submitBtn.classList.add('disabled');
        }
    }

    // Initialize progress
    updateProgress();

    // File Upload Handlers
    function setupFileUpload(uploadArea, fileInput) {
        if (!uploadArea || !fileInput) return; // Robustness check for forms without uploads

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFileName(fileInput, uploadArea);
                updateProgress();
            }
        });

        fileInput.addEventListener('change', () => {
            updateFileName(fileInput, uploadArea);
            updateProgress();
        });
    }

    function updateFileName(input, area) {
        const fileNameSpan = area.querySelector('.file-name');
        if (input.files.length > 0) {
            const names = Array.from(input.files).map(f => f.name).join(', ');
            fileNameSpan.textContent = names;
            area.classList.remove('input-error');
            const errorMsg = area.querySelector('.error-message');
            if (errorMsg) errorMsg.classList.remove('show');
        } else {
            fileNameSpan.textContent = '';
        }
    }

    setupFileUpload(pitchDeckUpload, pitchDeckInput);
    setupFileUpload(prototypeUpload, prototypeInput);

    // Mouse glow effect on button
    submitBtn.addEventListener('mousemove', (e) => {
        const glow = submitBtn.querySelector('.btn-glow');
        const rect = submitBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - 25; // 25 is half of the glow width
        const y = e.clientY - rect.top - 25;

        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
    });

    // Google Apps Script Web App URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkJFrdmeBNfUPKlavwAopmdIDQgRAiC36mpNLRfQ57dEPdZ6GKJdSrPrss18jod_L2/exec';

    // File to Base64 helper
    const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            data: reader.result.split(',')[1] // Strip Data URI prefix
        });
        reader.onerror = error => reject(error);
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
                const inputEl = input.type === 'file' ? input.closest('.upload-area') : input;
                inputEl.classList.add('input-error');
                const errorMsg = input.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.classList.add('show');
            }
        });

        if (isValid) {
            // Animate submit button
            submitBtn.innerHTML = '<i data-lucide="loader-2" class="btn-icon"></i><span class="btn-text">Uploading... Please wait</span>';
            const icon = submitBtn.querySelector('i');
            icon.style.animation = 'spin 1s linear infinite';
            lucide.createIcons();

            submitBtn.style.opacity = '0.8';
            submitBtn.style.pointerEvents = 'none';

            try {
                // Robust payload generator for dynamic forms
                const safeVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "N/A";

                // Prepare Payload
                const payload = {
                    leaderName: safeVal('leaderName'),
                    leaderEmail: safeVal('leaderEmail'),
                    leaderPhone: safeVal('leaderPhone'),
                    leaderOrg: safeVal('leaderOrg'),
                    teamName: safeVal('teamName'),
                    teamSize: safeVal('teamSize'),
                    memberNames: safeVal('memberNames'),
                    startupName: safeVal('startupName'),
                    problemStatement: safeVal('problemStatement'),
                    proposedSolution: safeVal('proposedSolution'),
                    targetMarket: safeVal('targetMarket'),
                    estimatedBudget: safeVal('estimatedBudget'),
                    committeePreference: safeVal('committeePreference') // Added for MUN
                };

                // Add Document Uploads if they exist in the DOM
                if (pitchDeckInput && pitchDeckInput.files.length > 0) {
                    payload.pitchDeck = await getBase64(pitchDeckInput.files[0]);
                }

                // Add Prototypes (Multiple Files) if it exists
                payload.prototypes = [];
                if (prototypeInput && prototypeInput.files.length > 0) {
                    for (let i = 0; i < prototypeInput.files.length; i++) {
                        payload.prototypes.push(await getBase64(prototypeInput.files[i]));
                    }
                }

                if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                    alert("⚠️ Developer Note: You need to replace SCRIPT_URL in script.js with your actual Google Apps Script Web App URL! Check the setup guide.");
                    throw new Error("Missing SCRIPT_URL");
                }

                // Send to Google Sheets
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.result === 'success') {
                    form.style.display = 'none';
                    const successState = document.getElementById('successState');
                    successState.classList.remove('hidden');
                } else {
                    throw new Error(result.error || "Unknown error occurred on server");
                }
            } catch (error) {
                console.error("Submission failed:", error);
                alert("Submission failed. Please check your network or SCRIPT_URL. See console for details.");
                // Reset button
                submitBtn.innerHTML = '<span class="btn-text">Submit Pitch</span><i data-lucide="rocket" class="btn-icon"></i><div class="btn-glow"></div>';
                lucide.createIcons();
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'all';
            }
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.input-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
});

// Add spin animation dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
