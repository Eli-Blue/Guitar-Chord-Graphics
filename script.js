const titleInput = document.getElementById("poster-title");
const subtitleInput = document.getElementById("poster-subtitle");
const chordInput = document.getElementById("chord-data");
const poster = document.getElementById("poster");
const statusMessage = document.getElementById("status-message");
const SVG_NS = "http://www.w3.org/2000/svg";

const parseChords = (rawText) => {
  let invalidCount = 0;

  const chords = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*\S)\s+([0-9xX]{6})$/);
      if (!match) {
        invalidCount += 1;
        return null;
      }

      const [, name, shape] = match;
      const normalizedShape = shape.toLowerCase();
      const playedFrets = normalizedShape
        .split("")
        .map((value) => (value === "x" ? value : Number(value)))
        .filter((value) => Number.isInteger(value) && value > 0);
      if (playedFrets.length) {
        const minFret = Math.min(...playedFrets);
        const maxFret = Math.max(...playedFrets);
        if (maxFret - minFret > 4) {
          invalidCount += 1;
          return null;
        }
      }

      return { name, shape: normalizedShape };
    })
    .filter(Boolean);

  return { chords, invalidCount };
};

const createChordDiagram = (name, shape) => {
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
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "120");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${name} chord diagram`);

  const createSvgElement = (tag, attributes) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, `${value}`);
    });
    return element;
  };

  for (let string = 0; string < strings; string += 1) {
    const x = left + string * stringSpacing;
    svg.appendChild(
      createSvgElement("line", { x1: x, y1: top, x2: x, y2: top + gridHeight, stroke: "#181c29", "stroke-width": 1.4 })
    );
  }
  for (let fret = 0; fret <= frets; fret += 1) {
    const y = top + fret * fretSpacing;
    const thickness = fret === 0 && baseFret === 1 ? 4 : 1.4;
    svg.appendChild(
      createSvgElement("line", {
        x1: left,
        y1: y,
        x2: left + gridWidth,
        y2: y,
        stroke: "#181c29",
        "stroke-width": thickness
      })
    );
  }

  values.forEach((value, string) => {
    const x = left + string * stringSpacing;
    if (value === "x") {
      const marker = createSvgElement("text", { x, y: 16, "text-anchor": "middle", "font-size": 13, fill: "#6d7691" });
      marker.textContent = "x";
      svg.appendChild(marker);
      return;
    }
    if (value === 0) {
      svg.appendChild(
        createSvgElement("circle", { cx: x, cy: 12, r: 5, fill: "none", stroke: "#2b3147", "stroke-width": 1.3 })
      );
      return;
    }
    const fretOffset = baseFret > 1 ? 1.5 : 0.5;
    const y = top + (value - baseFret + fretOffset) * fretSpacing;
    svg.appendChild(createSvgElement("circle", { cx: x, cy: y, r: 6, fill: "#2e5be7" }));
  });

  if (baseFret > 1) {
    const label = createSvgElement("text", {
      x: left + gridWidth + 8,
      y: top + fretSpacing,
      "font-size": 12,
      fill: "#4d556f"
    });
    label.textContent = `${baseFret}fr`;
    svg.appendChild(label);
  }

  return svg;
};

const renderPoster = () => {
  const title = titleInput.value.trim() || "Guitar Chord Poster";
  const subtitle = subtitleInput.value.trim();
  const { chords, invalidCount } = parseChords(chordInput.value);
  poster.replaceChildren();
  statusMessage.textContent =
    invalidCount > 0
      ? `${invalidCount} line${invalidCount === 1 ? "" : "s"} ignored. Check format: Name Position (single-digit frets only).`
      : "";

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
      diagram.appendChild(createChordDiagram(chord.name, chord.shape));
      card.appendChild(diagram);

      grid.appendChild(card);
    });

    poster.appendChild(grid);
  } else {
    const message = document.createElement("p");
    message.className = "message";
    message.textContent =
      'No valid chords yet. Use "Name Position" and six characters with single-digit frets, e.g. "D xx0232".';
    poster.appendChild(message);
  }
};

document.getElementById("generate").addEventListener("click", renderPoster);
document.getElementById("print").addEventListener("click", () => window.print());
titleInput.addEventListener("input", renderPoster);
subtitleInput.addEventListener("input", renderPoster);
chordInput.addEventListener("input", renderPoster);

renderPoster();
