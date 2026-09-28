const titleInput = document.getElementById("poster-title");
const subtitleInput = document.getElementById("poster-subtitle");
const chordInput = document.getElementById("chord-data");
const poster = document.getElementById("poster");

const parseChords = (rawText) =>
  rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, shape] = line.split(/\s+/, 2);
      if (!name || !shape || shape.length !== 6 || !/^[0-9xX]+$/.test(shape)) {
        return null;
      }
      return { name, shape: shape.toLowerCase() };
    })
    .filter(Boolean);

const createChordDiagram = (shape) => {
  const width = 120;
  const height = 150;
  const strings = 6;
  const frets = 5;
  const left = 20;
  const top = 24;
  const gridWidth = 80;
  const gridHeight = 100;
  const stringSpacing = gridWidth / (strings - 1);
  const fretSpacing = gridHeight / frets;
  const values = shape.split("").map((value) => (value === "x" ? value : Number(value)));
  const playedFrets = values.filter((value) => Number.isInteger(value) && value > 0);
  const baseFret = playedFrets.length ? Math.min(...playedFrets) : 1;

  const lines = [];
  for (let string = 0; string < strings; string += 1) {
    const x = left + string * stringSpacing;
    lines.push(`<line x1="${x}" y1="${top}" x2="${x}" y2="${top + gridHeight}" stroke="#181c29" stroke-width="1.4"/>`);
  }
  for (let fret = 0; fret <= frets; fret += 1) {
    const y = top + fret * fretSpacing;
    const thickness = fret === 0 && baseFret === 1 ? 4 : 1.4;
    lines.push(`<line x1="${left}" y1="${y}" x2="${left + gridWidth}" y2="${y}" stroke="#181c29" stroke-width="${thickness}"/>`);
  }

  const markers = values
    .map((value, string) => {
      const x = left + string * stringSpacing;
      if (value === "x") {
        return `<text x="${x}" y="16" text-anchor="middle" font-size="13" fill="#6d7691">x</text>`;
      }
      if (value === 0) {
        return `<circle cx="${x}" cy="12" r="5" fill="none" stroke="#2b3147" stroke-width="1.3"/>`;
      }
      if (value < baseFret || value > baseFret + frets - 1) {
        return "";
      }
      const y = top + (value - baseFret + 0.5) * fretSpacing;
      return `<circle cx="${x}" cy="${y}" r="6" fill="#2e5be7"/>`;
    })
    .join("");

  const label =
    baseFret > 1
      ? `<text x="${left + gridWidth + 8}" y="${top + fretSpacing}" font-size="12" fill="#4d556f">${baseFret}fr</text>`
      : "";

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="120" role="img" aria-label="Chord diagram">${lines.join(
    ""
  )}${markers}${label}</svg>`;
};

const renderPoster = () => {
  const title = titleInput.value.trim() || "Guitar Chord Poster";
  const subtitle = subtitleInput.value.trim();
  const chords = parseChords(chordInput.value);
  poster.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = title;
  poster.appendChild(heading);

  if (subtitle) {
    const subtitleNode = document.createElement("p");
    subtitleNode.className = "subtitle";
    subtitleNode.textContent = subtitle;
    poster.appendChild(subtitleNode);
  }

  if (chords.length) {
    const grid = document.createElement("section");
    grid.className = "chord-grid";

    chords.forEach((chord) => {
      const card = document.createElement("article");
      card.className = "chord-card";

      const name = document.createElement("h3");
      name.className = "chord-name";
      name.textContent = chord.name;
      card.appendChild(name);

      const diagram = document.createElement("div");
      diagram.innerHTML = createChordDiagram(chord.shape);
      card.appendChild(diagram);

      grid.appendChild(card);
    });

    poster.appendChild(grid);
  } else {
    const message = document.createElement("p");
    message.className = "message";
    message.textContent = 'No valid chords yet. Use "Name Position" and six characters, e.g. "D xx0232".';
    poster.appendChild(message);
  }
};

document.getElementById("generate").addEventListener("click", renderPoster);
document.getElementById("print").addEventListener("click", () => window.print());
titleInput.addEventListener("input", renderPoster);
subtitleInput.addEventListener("input", renderPoster);
chordInput.addEventListener("input", renderPoster);

renderPoster();
