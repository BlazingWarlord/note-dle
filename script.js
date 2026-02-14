const NOTES = { 'C': 261.6, 'D': 293.7, 'E': 329.6, 'F': 349.2, 'G': 392.0, 'A': 440.0, 'B': 493.9 };

// Use 'let' so these can be changed when switching modes
let targetSequence = [];
let currentGuess = [];
let attempts = 0;
let maxAttempts = 5;
let sequenceLength = 5;

let audioCtx;

// 1. Initialize Game
function initGame(len = 5, tries = 5, btnElement = null) {
    // Update global settings
    sequenceLength = len;
    maxAttempts = tries;
    attempts = 0;
    currentGuess = [];
    
    // UI Feedback: Highlight active mode button
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active-mode'));
    if (btnElement) {
        btnElement.classList.add('active-mode');
    } else {
        // Default highlight for first load
        document.querySelector('.mode-btn')?.classList.add('active-mode');
    }

    const board = document.getElementById('game-board');
    board.innerHTML = ''; 

    // Adjust sizes for 8-note mode
    const cellSize = len === 8 ? '40px' : '58px';

    for (let i = 0; i < maxAttempts; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${i}`;
        for (let j = 0; j < sequenceLength; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = cellSize;
            cell.style.height = cellSize;
            cell.style.fontSize = len === 8 ? '1.1rem' : '1.5rem';
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    
    // Generate Target
    const keys = Object.keys(NOTES);
    targetSequence = Array.from({ length: sequenceLength }, () => 
        keys[Math.floor(Math.random() * keys.length)]
    );

    document.getElementById('submit-btn').disabled = true;
}

// 2. Audio Logic
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playNote(freq) {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
}

function playSequence(seq) {
    seq.forEach((note, i) => {
        setTimeout(() => playNote(NOTES[note]), i * 500);
    });
}

// 3. Input Logic
function addNote(note) {
    if (currentGuess.length < sequenceLength && attempts < maxAttempts) {
        playNote(NOTES[note]);
        currentGuess.push(note);
        updateUI();
    }
}

function deleteNote() {
    if (currentGuess.length > 0) {
        currentGuess.pop();
        updateUI();
    }
}

function updateUI() {
    const row = document.getElementById(`row-${attempts}`);
    if (!row) return;
    const cells = row.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
        cell.textContent = currentGuess[i] || '';
    });
    document.getElementById('submit-btn').disabled = currentGuess.length !== sequenceLength;
}

// 4. Submit & Win Logic
function submitGuess() {
    const row = document.getElementById(`row-${attempts}`);
    const cells = row.querySelectorAll('.cell');
    let correctCount = 0;

    // Snapshot of current guess to prevent issues during staggered reveal
    const guessToCheck = [...currentGuess];

    guessToCheck.forEach((note, i) => {
        setTimeout(() => {
            if (note === targetSequence[i]) {
                cells[i].classList.add('green', 'bounce');
                correctCount++;
            } else {
                cells[i].classList.add('grey');
            }

            // After last note reveal, check win/loss
            if (i === sequenceLength - 1) {
                if (correctCount === sequenceLength) {
                    launchConfetti();
                    setTimeout(() => alert("🎵 Perfect Pitch!"), 500);
                } else {
                    attempts++;
                    currentGuess = [];
                    if (attempts === maxAttempts) {
                        alert("Game Over! The sequence was: " + targetSequence.join('-'));
                    }
                }
            }
        }, i * 150);
    });

    document.getElementById('submit-btn').disabled = true;
}

function launchConfetti() {
    const emojis = ['🎵', '🎶', '✨', '🎹', '🎸'];
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Single entry point
window.onload = () => {
    initGame(5, 5); 
};
