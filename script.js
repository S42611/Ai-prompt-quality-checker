/* =========================================================
   AI Prompt Quality Checker - script.js
   Sections:
   1. Settings (keywords, suggestions, sample prompt)
   2. Page elements
   3. Helper functions (detection, rating)
   4. Showing results
   5. Button actions
   ========================================================= */


/* ---------- 1. Settings ---------- */

// Each component is worth 20 marks (5 components x 20 = 100)
const POINTS_PER_COMPONENT = 20;

// The five components. A component counts as "detected" when the prompt
// contains at least ONE of its keywords. All matching is lower-case,
// so "Act As" and "act as" are treated the same.
// Keywords ending in a space (like "as a ") avoid matching inside other words.
const COMPONENTS = [
  {
    id: "role",
    name: "Role",
    keywords: [
      "act as", "you are", "pretend", "your role", "role of", "as a ", "as an ",
      "behave like", "expert", "tutor", "teacher", "professor", "mentor",
      "coach", "consultant", "developer", "engineer", "analyst"
    ],
    suggestion: "Tell the AI who it should be. Example: \"Act as an experienced computer science tutor.\""
  },
  {
    id: "task",
    name: "Task",
    keywords: [
      "write", "explain", "create", "generate", "summarize", "summarise",
      "describe", "analyze", "analyse", "compare", "translate", "solve",
      "draft", "suggest", "design", "build", "develop", "give me", "help me",
      "prepare", "review", "tell me", "list ", "teach", "calculate", "convert", "plan"
    ],
    suggestion: "State clearly what you want done, using an action verb. Example: \"Explain how binary search works.\""
  },
  {
    id: "context",
    name: "Context",
    keywords: [
      "context", "background", "audience", "for a ", "for an ", "beginner",
      "student", "college", "university", "because", "so that", "purpose",
      "goal", "scenario", "situation", "i am ", "i'm ", "my ", "intended for",
      "who is", "who are"
    ],
    suggestion: "Add background about the situation or the reader. Example: \"The answer is for a first-year college student who is new to programming.\""
  },
  {
    id: "constraints",
    name: "Constraints",
    keywords: [
      "under ", "within ", "no more than", "at most", "at least", "maximum",
      "minimum", "limit", "avoid", "do not", "don't", "must ", "should ",
      "only ", "without ", "exactly", "words", "sentences", "paragraphs",
      "simple language", "tone", "keep it", "keep the", "not exceed"
    ],
    suggestion: "Set limits or rules. Example: \"Use simple language, keep it under 200 words and avoid jargon.\""
  },
  {
    id: "format",
    name: "Output format",
    keywords: [
      "format", "table", "bullet", "numbered", "step-by-step", "step by step",
      "steps", "json", "csv", "markdown", "code block", "code example",
      "heading", "paragraph", "essay", "report", "outline", "summary",
      "present", "structure", "list"
    ],
    suggestion: "Say how the answer should look. Example: \"Present it as a numbered list of steps followed by a short code example.\""
  }
];

// A prompt that contains all five components
const SAMPLE_PROMPT =
  "Act as an experienced computer science tutor. " +
  "Explain how binary search works to a first-year college student who is a beginner in programming. " +
  "Use simple language, keep the answer under 200 words, and avoid complex jargon. " +
  "Present the answer as a step-by-step numbered list followed by a short Python code example.";


/* ---------- 2. Page elements ---------- */

const promptInput    = document.getElementById("promptInput");
const wordCount      = document.getElementById("wordCount");
const errorMessage   = document.getElementById("errorMessage");

const checkBtn       = document.getElementById("checkBtn");
const sampleBtn      = document.getElementById("sampleBtn");
const clearBtn       = document.getElementById("clearBtn");

const emptyState     = document.getElementById("emptyState");
const resultsContent = document.getElementById("resultsContent");

const scoreValue     = document.getElementById("scoreValue");
const ratingBadge    = document.getElementById("ratingBadge");
const progressTrack  = document.getElementById("progressTrack");
const progressFill   = document.getElementById("progressFill");
const suggestionList = document.getElementById("suggestionList");

// Remembers the running score animation so it can be cancelled
let scoreAnimationId = null;


/* ---------- 3. Helper functions ---------- */

// Returns true if the prompt contains at least one of the keywords
function hasKeyword(promptText, keywords) {
  // Lower-case the text (case-insensitive check), turn curly apostrophes
  // into normal ones, and squash extra spaces/new lines into single spaces.
  // The spaces added at both ends help keywords like "as a " match at the very end.
  const cleanText = " " +
    promptText
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\s+/g, " ") +
    " ";

  return keywords.some(function (keyword) {
    return cleanText.includes(keyword);
  });
}

// Converts a score into a rating label and a CSS class suffix
function getRating(score) {
  if (score === 100) return { label: "Excellent",         type: "excellent" };
  if (score >= 80)   return { label: "Very good",         type: "verygood" };
  if (score >= 60)   return { label: "Good",              type: "good" };
  if (score >= 40)   return { label: "Average",           type: "average" };
  return                    { label: "Needs Improvement", type: "poor" };
}

// Counts the words in the text area
function countWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}


/* ---------- 4. Showing results ---------- */

// Updates one component row with a green tick or a red cross
function updateComponentRow(component, isDetected) {
  const row   = document.getElementById("comp-" + component.id);
  const icon  = row.querySelector(".status-icon");
  const label = row.querySelector(".status-label");

  row.classList.remove("detected", "missing");

  if (isDetected) {
    row.classList.add("detected");
    icon.textContent  = "✓";
    label.textContent = "Detected  +" + POINTS_PER_COMPONENT;
  } else {
    row.classList.add("missing");
    icon.textContent  = "✕";
    label.textContent = "Missing  +0";
  }
}

// Counts the number up from 0 to the final score
function animateScoreNumber(finalScore) {
  cancelAnimationFrame(scoreAnimationId);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || finalScore === 0) {
    scoreValue.textContent = finalScore;
    return;
  }

  const duration  = 1000; // milliseconds
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    scoreValue.textContent = Math.round(progress * finalScore);
    if (progress < 1) {
      scoreAnimationId = requestAnimationFrame(step);
    }
  }
  scoreAnimationId = requestAnimationFrame(step);
}

// Fills the progress bar. The CSS "transition" makes the width change smooth.
function animateProgressBar(score, ratingType) {
  // Start from 0 so the animation plays on every check
  progressFill.style.width = "0%";
  progressFill.className = "progress-fill fill-" + ratingType;

  // Reading offsetWidth forces the browser to apply the 0% width first
  void progressFill.offsetWidth;

  progressFill.style.width = score + "%";
  progressTrack.setAttribute("aria-valuenow", score);
}

// Builds the list of improvement suggestions for missing components
function showSuggestions(missingComponents) {
  suggestionList.innerHTML = "";

  // Nothing missing: show a congratulation message instead
  if (missingComponents.length === 0) {
    const item = document.createElement("li");
    item.className = "suggestion-item all-good";
    item.innerHTML = "<strong>Great work!</strong><p>Your prompt includes all five components. Nothing to add.</p>";
    suggestionList.appendChild(item);
    return;
  }

  missingComponents.forEach(function (component) {
    const item  = document.createElement("li");
    item.className = "suggestion-item";

    const title = document.createElement("strong");
    title.textContent = "Add a " + component.name.toLowerCase();

    const text  = document.createElement("p");
    text.textContent = component.suggestion;

    item.appendChild(title);
    item.appendChild(text);
    suggestionList.appendChild(item);
  });
}

// Shows or hides the results panel
function showResultsPanel(show) {
  resultsContent.hidden = !show;
  emptyState.hidden = show;
}

// Shows or hides the error message under the text area
function showError(message) {
  if (message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    promptInput.classList.add("has-error");
  } else {
    errorMessage.hidden = true;
    promptInput.classList.remove("has-error");
  }
}


/* ---------- 5. Button actions ---------- */

// "Check Prompt" button
function checkPrompt() {
  const promptText = promptInput.value;

  // Validation: the prompt must not be empty or only spaces
  if (promptText.trim() === "") {
    showError("Please enter a prompt before checking.");
    showResultsPanel(false);
    promptInput.focus();
    return;
  }
  showError("");

  let totalScore = 0;
  const missingComponents = [];

  // Check every component, add marks and update its row
  COMPONENTS.forEach(function (component) {
    const isDetected = hasKeyword(promptText, component.keywords);

    if (isDetected) {
      totalScore += POINTS_PER_COMPONENT;
    } else {
      missingComponents.push(component);
    }
    updateComponentRow(component, isDetected);
  });

  // Rating label and colour
  const rating = getRating(totalScore);
  ratingBadge.textContent = rating.label;
  ratingBadge.className = "rating-badge rating-" + rating.type;

  // Show everything
  showResultsPanel(true);
  animateScoreNumber(totalScore);
  animateProgressBar(totalScore, rating.type);
  showSuggestions(missingComponents);
}

// "Load Sample Prompt" button
function loadSamplePrompt() {
  promptInput.value = SAMPLE_PROMPT;
  wordCount.textContent = countWords(SAMPLE_PROMPT) + " words";
  showError("");
  promptInput.focus();
}

// "Clear" button: resets the input, score, progress bar and results
function clearAll() {
  promptInput.value = "";
  wordCount.textContent = "0 words";
  showError("");

  cancelAnimationFrame(scoreAnimationId);
  scoreValue.textContent = "0";
  progressFill.style.width = "0%";
  progressTrack.setAttribute("aria-valuenow", 0);
  ratingBadge.textContent = "Rating";
  ratingBadge.className = "rating-badge";
  suggestionList.innerHTML = "";

  showResultsPanel(false);
  promptInput.focus();
}

// Live word counter, and removes the error as soon as the user starts typing
function handleTyping() {
  wordCount.textContent = countWords(promptInput.value) + " words";
  if (promptInput.value.trim() !== "") {
    showError("");
  }
}

// Connect the buttons and text area to their functions
checkBtn.addEventListener("click", checkPrompt);
sampleBtn.addEventListener("click", loadSamplePrompt);
clearBtn.addEventListener("click", clearAll);
promptInput.addEventListener("input", handleTyping);
