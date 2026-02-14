const NOTES = { 'C': 261.6, 'D': 293.7, 'E': 329.6, 'F': 349.2, 'G': 392.0, 'A': 440.0, 'B': 493.9 };
let targetSequence = [];
let currentGuess = [];
let attempts = 0;
const maxAttempts = 6;
const sequenceLength = 5;

// Initialize Game
function initGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear board
    for (let i = 0; i < maxAttempts; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${i}`;
        for (let j = 0; j < sequenceLength; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    
    // Generate Random Sequence
    const keys = Object.keys(NOTES);
    targetSequence = Array.from({ length: 5 }, () => keys[Math.floor(Math.random() * keys.length)]);
    attempts = 0;
    currentGuess = [];
}

// Audio logic
let audioCtx;
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
    
    osc.type = 'triangle'; // Richer than 'sine'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Attack and Decay (The "Pluck" sound)
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05); // Quick fade in
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6); // Smooth fade out
    
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

// Input Logic
function addNote(note) {
    if (currentGuess.length < sequenceLength && attempts < maxAttempts) {
        playNote(NOTES[note]);
        currentGuess.push(note);
        updateUI();
    }
}

function deleteNote() {
    currentGuess.pop();
    updateUI();
}

function updateUI() {
    const row = document.getElementById(`row-${attempts}`);
    const cells = row.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
        cell.textContent = currentGuess[i] || '';
    });
    document.getElementById('submit-btn').disabled = currentGuess.length !== sequenceLength;
}

function submitGuess() {
    const row = document.getElementById(`row-${attempts}`);
    const cells = row.querySelectorAll('.cell');
    
    let correctCount = 0;

    currentGuess.forEach((note, i) => {
        // Staggered reveal effect
        setTimeout(() => {
            if (note === targetSequence[i]) {
                cells[i].classList.add('green', 'bounce');
                correctCount++;
            } else {
                cells[i].classList.add('grey');
            }

            // Check win condition ONLY after the last note is revealed
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
        }, i * 150); // 150ms delay between each note reveal
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
        
        // Cleanup
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Start game on load
window.onload = initGame;