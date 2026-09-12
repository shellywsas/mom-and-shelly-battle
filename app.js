/**
 * לוגיקת המשחק: קרב הדורות – אמא מול שלי 👩‍👧
 * מעבר קלפים, סינון קטגוריות, סימון נקודות, צלילים נעימים וקונפטי
 */

// --- מנוע צלילים נעים (Web Audio API) ---
class PleasantSoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playChime() {
    try {
      this.init();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - אקורד מז'ור מתוק
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = this.ctx.currentTime + idx * 0.07;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {}
  }

  playBothChime() {
    try {
      this.init();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = this.ctx.currentTime + idx * 0.06;
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch (e) {}
  }
}

const sounds = new PleasantSoundManager();

// --- מנוע קונפטי פסטלי ---
class PastelConfetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 70) {
    const colors = ['#fb7185', '#c084fc', '#fcd34d', '#6ee7b7', '#93c5fd', '#f472b6'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 150,
        y: this.canvas.height / 3 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1) * 14 - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        life: 1
      });
    }
    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.rotation += p.rotSpeed;
      p.life -= 0.01;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();

      if (p.life <= 0 || p.y > this.canvas.height + 30) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
    }
  }
}

// --- ניהול מצב המשחק (State) ---
const STORAGE_KEY = 'mom_and_shelly_battle_state_v1';

let gameState = {
  shellyScore: 0,
  momScore: 0,
  activeCategory: 'all',
  currentDeck: [],
  currentIndex: 0
};

let confetti = null;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed.shellyScore === 'number' && typeof parsed.momScore === 'number') {
        gameState.shellyScore = parsed.shellyScore;
        gameState.momScore = parsed.momScore;
        if (parsed.activeCategory) gameState.activeCategory = parsed.activeCategory;
      }
    } catch (e) {}
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    shellyScore: gameState.shellyScore,
    momScore: gameState.momScore,
    activeCategory: gameState.activeCategory
  }));
}

// ערבוב מערך (Fisher-Yates Shuffle)
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function buildDeck(category = 'all') {
  let list = BATTLE_QUESTIONS;
  if (category !== 'all') {
    list = BATTLE_QUESTIONS.filter(q => q.category === category);
  }
  gameState.currentDeck = shuffleArray(list);
  gameState.currentIndex = 0;
}

// --- אתחול היישום ---
window.addEventListener('DOMContentLoaded', () => {
  loadState();

  const canvas = document.getElementById('confettiCanvas');
  if (canvas) {
    confetti = new PastelConfetti(canvas);
  }

  buildDeck(gameState.activeCategory);
  setupListeners();
  renderScores();
  renderCurrentQuestion();
  updateCategoryChipsUI();
});

function setupListeners() {
  // כפתור חשיפת תשובה
  document.getElementById('btnReveal').addEventListener('click', () => {
    sounds.playPop();
    document.getElementById('revealBox').style.display = 'block';
    document.getElementById('btnReveal').style.display = 'none';
    document.getElementById('scoringActions').style.display = 'flex';
  });

  // כפתורי חלוקת נקודות
  document.getElementById('btnPointShelly').addEventListener('click', () => awardPoint('shelly'));
  document.getElementById('btnPointMom').addEventListener('click', () => awardPoint('mom'));
  document.getElementById('btnPointBoth').addEventListener('click', () => awardPoint('both'));
  document.getElementById('btnPointNone').addEventListener('click', () => awardPoint('none'));

  // כפתור איפוס תוצאות
  document.getElementById('btnResetScores').addEventListener('click', () => {
    if (confirm('לאפס את לוח הניקוד ולהתחיל מחדש?')) {
      gameState.shellyScore = 0;
      gameState.momScore = 0;
      saveState();
      renderScores();
      buildDeck(gameState.activeCategory);
      renderCurrentQuestion();
      sounds.playPop();
    }
  });

  // צ'יפים של סינון קטגוריות
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.category;
      gameState.activeCategory = cat;
      saveState();
      updateCategoryChipsUI();
      buildDeck(cat);
      renderCurrentQuestion();
      sounds.playPop();
    });
  });
}

function updateCategoryChipsUI() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    if (chip.dataset.category === gameState.activeCategory) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function renderScores() {
  document.getElementById('scoreShelly').textContent = gameState.shellyScore;
  document.getElementById('scoreMom').textContent = gameState.momScore;
}

function renderCurrentQuestion() {
  const currentQ = gameState.currentDeck[gameState.currentIndex];

  if (!currentQ) {
    // אם נגמר הדק
    document.getElementById('categoryTag').textContent = '🎉 סיימתן את כל הקלפים!';
    document.getElementById('targetTag').textContent = 'אלופות!';
    document.getElementById('questionText').textContent = 'עברתן על כל השאלות בקטגוריה זו! רוצות להתחיל שוב מחדש?';
    document.getElementById('hintPill').style.display = 'none';
    document.getElementById('revealBox').style.display = 'none';
    document.getElementById('btnReveal').style.display = 'none';
    document.getElementById('scoringActions').style.display = 'none';
    return;
  }

  // איפוס ממשק לתצוגת שאלה
  document.getElementById('categoryTag').textContent = currentQ.categoryName;
  document.getElementById('targetTag').textContent = currentQ.target;
  document.getElementById('questionText').textContent = currentQ.question;
  
  if (currentQ.hint) {
    document.getElementById('hintPill').textContent = `💡 רמז: ${currentQ.hint}`;
    document.getElementById('hintPill').style.display = 'inline-block';
  } else {
    document.getElementById('hintPill').style.display = 'none';
  }

  document.getElementById('revealText').textContent = currentQ.answer;

  document.getElementById('revealBox').style.display = 'none';
  document.getElementById('btnReveal').style.display = 'inline-flex';
  document.getElementById('scoringActions').style.display = 'none';

  // עדכון מונה
  document.getElementById('cardCounter').textContent = `קלף ${gameState.currentIndex + 1} מתוך ${gameState.currentDeck.length}`;
}

function awardPoint(recipient) {
  if (recipient === 'shelly') {
    gameState.shellyScore++;
    sounds.playChime();
    if (confetti) confetti.burst(40);
  } else if (recipient === 'mom') {
    gameState.momScore++;
    sounds.playChime();
    if (confetti) confetti.burst(40);
  } else if (recipient === 'both') {
    gameState.shellyScore++;
    gameState.momScore++;
    sounds.playBothChime();
    if (confetti) confetti.burst(60);
  } else {
    sounds.playPop();
  }

  saveState();
  renderScores();

  // מעבר לשאלה הבאה
  gameState.currentIndex++;
  renderCurrentQuestion();
}
