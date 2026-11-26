AI Prompt Quality Checker

A simple, modern web app that helps college students check the quality of their AI prompts and improve their prompt engineering skills. Paste a prompt, click Check Prompt, and see which of the five key components it contains, along with a score out of 100 and tips for improving it.

Built with plain HTML, CSS and JavaScript. No frameworks, no libraries, no backend, and it works offline.

Features
Text area to type or paste any AI prompt
Detects five prompt components using simple keyword-based logic (case-insensitive):
Role: who the AI should act as
Task: what the AI should do
Context: background and target audience
Constraints: limits, rules and things to avoid
Output format: how the answer should be presented
Green ✓ for detected components, red ✕ for missing ones
Score out of 100 (20 marks per component) with an animated progress bar
Rating based on the score
Improvement suggestions for every missing component
Load Sample Prompt button to see a full-score example
Clear button to reset the input, score, progress bar and results
Error message when the input is empty
Live word counter
Fully responsive (desktop, tablet and mobile)
Scoring and Ratings

Each detected component earns 20 marks.

Score	Rating
100	Excellent
80	Very good
60	Good
40	Average
0-20	Needs Improvement
Project Structure
ai-prompt-quality-checker/
├── index.html   # Page structure and UI elements
├── style.css    # Styling, responsive layout and animations
├── script.js    # Keyword detection, scoring, validation and button actions
└── README.md
How to Run
Download or clone this repository:
bash
git clone https://github.com/<your-username>/ai-prompt-quality-checker.git
Open the folder.
Double-click index.html to open it in your browser.

No installation or internet connection is needed.

How It Works
The text is converted to lowercase so matching is case-insensitive.
For each component, the app checks whether the prompt contains at least one of that component's keywords.
Every detected component adds 20 marks to the total score.
The score decides the rating, the progress bar colour and which suggestions are shown.

Example keywords:

Component	Example keywords
Role	act as, you are, tutor, expert
Task	explain, write, create, summarize
Context	student, beginner, audience, background
Constraints	under, avoid, words, simple language
Output format	table, bullet, numbered, step-by-step
Customising the keywords

Open script.js and edit the COMPONENTS array at the top of the file. Add or remove words in any keywords list and save.

Sample Prompt
Act as an experienced computer science tutor. Explain how binary search works
to a first-year college student who is a beginner in programming. Use simple
language, keep the answer under 200 words, and avoid complex jargon. Present
the answer as a step-by-step numbered list followed by a short Python code example.

This prompt contains all five components and scores 100/100 (Excellent).

Limitations

The checker uses simple keyword matching, so it cannot understand the meaning of a prompt. A prompt can be detected as having a component just because it contains a matching word. Use the results as a guide for learning, not as a final grade.

Future Improvements
Dark mode toggle
Save and compare previous prompt scores
More keyword sets and example prompts
Highlight the detected keywords inside the prompt
Tech Stack
HTML5
CSS3 (Flexbox, Grid, transitions, media queries)
Vanilla JavaScript (ES6)
Author

Made by  suriya prasanth

License

This project is open source and available under the MIT License.
