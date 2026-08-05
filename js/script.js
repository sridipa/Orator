document.addEventListener("DOMContentLoaded", () => {
  setGreetingTime();
  setRandomCuriosity();
});

// Dynamic Greeting based on time of day
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

// Random curiosity prompt generation
const curiosities = [
  "Can one tiny decision change history?",
  "Why do humans remember embarrassment more than praise?",
  "Why does inflation never really stop?",
  "Is free will an illusion?",
  "Why do companies become monopolies?",
  "What makes a story unforgettable?"
];

function setRandomCuriosity() {
  const curiosityElement = document.getElementById("curiosityText");
  const randomIndex = Math.floor(Math.random() * curiosities.length);
  curiosityElement.textContent = `"${curiosities[randomIndex]}"`;
}
