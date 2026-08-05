// Application State
let selectedDuration = 60;
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;
let secondsRemaining = 60;
let isRecording = false;

const samplePrompts = {
  "Impromptu": [
    "Is artificial intelligence eliminating or redefining creativity?",
    "What is the most overrated virtue in modern society?",
    "Should failing fast be celebrated or re-examined?"
  ],
  "Tech & Future": [
    "How will quantum computing impact daily life in 2030?",
    "Is spatial computing the end of screen time?"
  ],
  "Leadership": [
    "How do you deliver bad news with empathy and clarity?",
    "What separates a good manager from a true mentor?"
  ],
  "Personal Story": [
    "Describe a mistake that reshaped your personal career trajectory."
  ]
};

const curiosities = [
  "Can one tiny decision change history?",
  "Why do humans remember embarrassment more than praise?",
  "Why does inflation never really stop?",
  "Is free will an illusion?",
  "Why do companies become monopolies?",
  "What makes a story unforgettable?"
];

document.addEventListener("DOMContentLoaded", () => {
  setGreetingTime();
  setRandomCuriosity();
  loadSavedSessions();
});

// Navigation Handling
function showView(viewName) {
  const views = document.querySelectorAll(".view");
  views.forEach(v => v.classList.remove("active"));
  
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add("active");
  }
}

// Greeting Dynamic Time
function setGreetingTime() {
  const hour = new Date().getHours();
  const greetingElement = document.getElementById("greetingTime");

  if (hour < 12) {
    greetingElement.textContent = "Good morning,";
  } else if (hour < 18) {
    greetingElement.textContent = "Good afternoon,";
  } else {
    greetingElement.textContent = "Good evening,";
  }
}

// Random Curiosity Generation
function setRandomCuriosity() {
  const randomIndex = Math.floor(Math.random() * curiosities.length);
  const selected = curiosities[randomIndex];
  document.getElementById("curiosityText").textContent = `"${selected}"`;
  document.getElementById("learnTopic").textContent = selected;
}

// Practice Duration Selection
function setDuration(seconds, element) {
  selectedDuration = seconds;
  secondsRemaining = seconds;
  document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  element.classList.add("active");
}

// Practice Setup to Recording Transition
function startPracticeSession() {
  const category = document.getElementById("practiceCategory").value;
  const prompts = samplePrompts[category] || samplePrompts["Impromptu"];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  document.getElementById("activeCategory").textContent = category;
  document.getElementById("activePrompt").textContent = `"${randomPrompt}"`;
  
  updateTimerDisplay(selectedDuration);
  
  document.getElementById("practice-step-setup").classList.add("hidden");
  document.getElementById("practice-step-recording").classList.remove("hidden");
}

function startLearnPractice() {
  showView("practice");
  document.getElementById("practiceCategory").value = "Impromptu";
  document.getElementById("activeCategory").textContent = "Today's Curiosity";
  document.getElementById("activePrompt").textContent = `"${document.getElementById("learnTopic").textContent}"`;
  
  updateTimerDisplay(selectedDuration);
  document.getElementById("practice-step-setup").classList.add("hidden");
  document.getElementById("practice-step-recording").classList.remove("hidden");
}

function updateTimerDisplay(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById("timerDisplay").textContent = `${mins}:${secs}`;
}

// Audio Recording via Web Audio API
async function toggleRecording() {
  const recordBtn = document.getElementById("recordBtn");
  const finishBtn = document.getElementById("finishBtn");
  const statusIndicator = document.getElementById("recordingStatus");

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.start();

      isRecording = true;
      recordBtn.textContent = "⏸ Pause Session";
      recordBtn.classList.add("recording");
      finishBtn.classList.remove("hidden");
      statusIndicator.textContent = "Recording audio... Speak clearly.";

      startTimer();
    } catch (err) {
      statusIndicator.textContent = "Microphone access denied or unavailable.";
    }
  } else {
    stopTimer();
    isRecording = false;
    recordBtn.textContent = "▶ Resume Recording";
    recordBtn.classList.remove("recording");
    statusIndicator.textContent = "Recording paused.";
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (secondsRemaining > 0) {
      secondsRemaining--;
      updateTimerDisplay(secondsRemaining);
    } else {
      stopTimer();
      finishRecording();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function finishRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  
  stopTimer();
  isRecording = false;

  const statusIndicator = document.getElementById("recordingStatus");
  statusIndicator.textContent = "Saving session to Journal...";

  setTimeout(() => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      saveToJournal(audioUrl);
    }
    
    // Reset views
    document.getElementById("practice-step-recording").classList.add("hidden");
    document.getElementById("practice-step-setup").classList.remove("hidden");
    document.getElementById("recordBtn").textContent = "● Start Recording";
    document.getElementById("recordBtn").classList.remove("recording");
    document.getElementById("finishBtn").classList.add("hidden");
    statusIndicator.textContent = "Microphone ready";
    secondsRemaining = selectedDuration;
    
    showView("journal");
  }, 500);
}

// Journal Operations & Local Storage Persistence
function saveToJournal(audioUrl) {
  const promptText = document.getElementById("activePrompt").textContent;
  const categoryText = document.getElementById("activeCategory").textContent;
  
  const session = {
    id: Date.now(),
    title: promptText,
    category: categoryText,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    audioUrl: audioUrl,
    selfReflection: ""
  };

  renderJournalEntry(session, true);
}

function renderJournalEntry(session, prepend = false) {
  const journalContainer = document.getElementById("journalEntries");
  const emptyState = journalContainer.querySelector(".empty-state");
  if (emptyState) emptyState.remove();

  const card = document.createElement("div");
  card.className = "journal-card";
  card.innerHTML = `
    <div class="journal-header">
      <div>
        <span class="card-category">${session.category}</span>
        <h3 class="journal-title">${session.title}</h3>
      </div>
      <span class="journal-date">${session.date}</span>
    </div>
    <audio controls class="journal-audio" src="${session.audioUrl}"></audio>
    <div class="self-eval-box">
      <label>Self Evaluation & Notes</label>
      <textarea placeholder="Evaluate your filler words, cadence, and pause quality..." onchange="updateReflection(${session.id}, this.value)">${session.selfReflection}</textarea>
    </div>
  `;

  if (prepend) {
    journalContainer.prepend(card);
  } else {
    journalContainer.appendChild(card);
  }
}

function loadSavedSessions() {
  // Mock loaded entry for immediate evaluation testing
  const initialSession = {
    id: 1,
    title: '"The Future of Work"',
    category: "Impromptu",
    date: "2 days ago",
    audioUrl: "",
    selfReflection: "Pacing was good, but noticed 3 filler words ('um') during transitions."
  };
  renderJournalEntry(initialSession);
}

function updateReflection(id, text) {
  // Reflection autosaved in runtime state
}
