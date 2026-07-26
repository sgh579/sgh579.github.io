/* ==========================================================================
   Various functions that we want to use within the template
   ========================================================================== */

// Determine the expected state of the theme toggle, which can be "dark", "light", or
// "system". Default is "system".
let determineThemeSetting = () => {
  let themeSetting = localStorage.getItem("theme");
  return (themeSetting != "dark" && themeSetting != "light" && themeSetting != "system") ? "system" : themeSetting;
};

// Determine the computed theme, which can be "dark" or "light". If the theme setting is
// "system", the computed theme is determined based on the user's system preference.
let determineComputedTheme = () => {
  let themeSetting = determineThemeSetting();
  if (themeSetting != "system") {
    return themeSetting;
  }
  return (userPref && userPref("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
};

// detect OS/browser preference
const browserPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Set the theme on page load or when explicitly called
let setTheme = (theme) => {
  const use_theme =
    theme ||
    localStorage.getItem("theme") ||
    $("html").attr("data-theme") ||
    browserPref;

  if (use_theme === "dark") {
    $("html").attr("data-theme", "dark");
    $("#theme-icon").removeClass("fa-sun").addClass("fa-moon");
  } else if (use_theme === "light") {
    $("html").removeAttr("data-theme");
    $("#theme-icon").removeClass("fa-moon").addClass("fa-sun");
  }
};

// Toggle the theme manually
var toggleTheme = () => {
  const current_theme = $("html").attr("data-theme");
  const new_theme = current_theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", new_theme);
  setTheme(new_theme);
};

/* ==========================================================================
   Plotly integration script so that Markdown codeblocks will be rendered
   ========================================================================== */

// Read the Plotly data from the code block, hide it, and render the chart as new node. This allows for the 
// JSON data to be retrieve when the theme is switched. The listener should only be added if the data is 
// actually present on the page.
import { plotlyDarkLayout, plotlyLightLayout } from './theme.js';
let plotlyElements = document.querySelectorAll("pre>code.language-plotly");
if (plotlyElements.length > 0) {
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      plotlyElements.forEach((elem) => {
        // Parse the Plotly JSON data and hide it
        var jsonData = JSON.parse(elem.textContent);
        elem.parentElement.classList.add("hidden");

        // Add the Plotly node
        let chartElement = document.createElement("div");
        elem.parentElement.after(chartElement);

        // Set the theme for the plot and render it
        const theme = (determineComputedTheme() === "dark") ? plotlyDarkLayout : plotlyLightLayout;
        if (jsonData.layout) {
          jsonData.layout.template = (jsonData.layout.template) ? { ...theme, ...jsonData.layout.template } : theme;
        } else {
          jsonData.layout = { template: theme };
        }
        Plotly.react(chartElement, jsonData.data, jsonData.layout);
      });
    }
  });
}

/* ==========================================================================
   Actions that should occur when the page has been fully loaded
   ========================================================================== */

$(document).ready(function () {
  // SCSS SETTINGS - These should be the same as the settings in the relevant files 
  const scssLarge = 925;          // pixels, from /_sass/_themes.scss
  const scssMastheadHeight = 70;  // pixels, from the current theme (e.g., /_sass/theme/_default.scss)

  // If the user hasn't chosen a theme, follow the OS preference
  setTheme();
  window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "dark" : "light");
          }
        });

  // Enable the theme toggle
  $('#theme-toggle').on('click', toggleTheme);

  // Enable the sticky footer
  var bumpIt = function () {
    $("body").css("padding-bottom", "0");
    $("body").css("margin-bottom", $(".page__footer").outerHeight(true));
  }
  $(window).resize(function () {
    didResize = true;
  });
  setInterval(function () {
    if (didResize) {
      didResize = false;
      bumpIt();
    }}, 250);
  var didResize = false;
  bumpIt();

  // FitVids init
  fitvids();

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").fadeToggle("fast", function () { });
    $(".author__urls-wrapper button").toggleClass("open");
  });

  // Restore the follow menu if toggled on a window resize
  jQuery(window).on('resize', function () {
    if ($('.author__urls.social-icons').css('display') == 'none' && $(window).width() >= scssLarge) {
      $(".author__urls").css('display', 'block')
    }
  });

  // Init smooth scroll, this needs to be slightly more than then fixed masthead height
  $("a").smoothScroll({
    offset: -scssMastheadHeight,
    preventDefault: false,
  });

});

/* ==========================================================================
   Palpation V1 evidence gallery
   ========================================================================== */

const initV1EvidenceGallery = () => {
  const root = document.querySelector("[data-v1-gallery]");
  if (!root) return;

  const grid = root.querySelector(".palpation-evidence__grid");
  const loading = root.querySelector(".palpation-evidence__loading");
  const errorNode = root.querySelector(".palpation-evidence__error");
  const replayRoot = document.querySelector("[data-v1-replay]");
  const replayVideo = replayRoot?.querySelector("[data-replay-video]");
  const replaySource = replayVideo?.querySelector("source");
  const replayDownload = replayVideo?.querySelector("a");
  const replayPrevious = replayRoot?.querySelector("[data-replay-previous]");
  const replayNext = replayRoot?.querySelector("[data-replay-next]");
  const replayStage = replayRoot?.querySelector(".palpation-replay__stage");
  const replayStatus = replayRoot?.querySelector("[data-replay-status]");
  const replayStiffnessCanvas = replayRoot?.querySelector("[data-replay-stiffness-output]");
  const replayProposedCanvas = replayRoot?.querySelector("[data-replay-proposed-output]");
  let galleryData = null;
  let renderedCards = [];
  let replayIndex = 0;

  const palette = () => {
    const dark = document.documentElement.hasAttribute("data-theme");
    return {
      background: dark ? "#303030" : "#f5f6f7",
      grid: dark ? "#565b5e" : "#d8dde0",
      prediction: dark ? "#69bdd6" : "#237c99",
      truth: dark ? "#ffc857" : "#a54c00",
    };
  };

  const prepare = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { context, width, height };
  };

  const interpolate = (a, b, amount) => a + (b - a) * amount;

  const viridis = (amount) => {
    const stops = [
      [68, 1, 84],
      [59, 82, 139],
      [33, 145, 140],
      [94, 201, 98],
      [253, 231, 37],
    ];
    const value = Math.max(0, Math.min(0.9999, amount)) * (stops.length - 1);
    const index = Math.floor(value);
    const local = value - index;
    const left = stops[index];
    const right = stops[Math.min(stops.length - 1, index + 1)];
    return `rgb(${Math.round(interpolate(left[0], right[0], local))},${Math.round(interpolate(left[1], right[1], local))},${Math.round(interpolate(left[2], right[2], local))})`;
  };

  const drawTruth = (context, truth, originX, originY, cell, color) => {
    const rows = truth.length;
    const columns = truth[0].length;
    const inside = (row, column) => (
      row >= 0 && row < rows && column >= 0 && column < columns && truth[row][column] > 0
    );
    context.beginPath();
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (!inside(row, column)) continue;
        const x = originX + column * cell;
        const y = originY + row * cell;
        if (!inside(row - 1, column)) {
          context.moveTo(x, y);
          context.lineTo(x + cell, y);
        }
        if (!inside(row + 1, column)) {
          context.moveTo(x, y + cell);
          context.lineTo(x + cell, y + cell);
        }
        if (!inside(row, column - 1)) {
          context.moveTo(x, y);
          context.lineTo(x, y + cell);
        }
        if (!inside(row, column + 1)) {
          context.moveTo(x + cell, y);
          context.lineTo(x + cell, y + cell);
        }
      }
    }
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    context.stroke();
  };

  const drawStiffnessMap = (canvas, values) => {
    const surface = prepare(canvas);
    const colors = palette();
    const context = surface.context;
    context.fillStyle = colors.background;
    context.fillRect(0, 0, surface.width, surface.height);
    const rows = values.length;
    const columns = values[0].length;
    const margin = 5;
    const side = Math.min(surface.width, surface.height) - margin * 2;
    const cell = side / columns;
    const originX = (surface.width - side) / 2;
    const originY = (surface.height - side) / 2;
    const minimum = galleryData.stiffnessRangeNPerM[0];
    const maximum = galleryData.stiffnessRangeNPerM[1];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const normalized = (values[row][column] - minimum) / Math.max(1, maximum - minimum);
        context.fillStyle = viridis(normalized);
        context.fillRect(
          originX + column * cell,
          originY + row * cell,
          cell + 0.25,
          cell + 0.25
        );
      }
    }
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    context.strokeRect(originX, originY, side, side);
  };

  const drawPrediction = (canvas, probability, truth, threshold) => {
    const surface = prepare(canvas);
    const colors = palette();
    const context = surface.context;
    context.fillStyle = colors.background;
    context.fillRect(0, 0, surface.width, surface.height);
    const rows = probability.length;
    const columns = probability[0].length;
    const margin = 5;
    const side = Math.min(surface.width, surface.height) - margin * 2;
    const cell = side / columns;
    const originX = (surface.width - side) / 2;
    const originY = (surface.height - side) / 2;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const value = probability[row][column];
        if (value < threshold) continue;
        context.globalAlpha = 0.4 + 0.6 * Math.min(
          1,
          (value - threshold) / Math.max(0.01, 1 - threshold)
        );
        context.fillStyle = colors.prediction;
        context.fillRect(
          originX + column * cell,
          originY + row * cell,
          cell + 0.25,
          cell + 0.25
        );
      }
    }
    context.globalAlpha = 1;
    drawTruth(context, truth, originX, originY, cell, colors.truth);
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    context.strokeRect(originX, originY, side, side);
  };

  const redraw = () => {
    if (!galleryData) return;
    renderedCards.forEach((card) => {
      drawStiffnessMap(card.stiffnessCanvas, card.example.stiffnessNPerM);
      drawPrediction(
        card.stiffnessOutputCanvas,
        card.example.stiffnessProbability,
        card.example.groundTruth,
        galleryData.selection.stiffnessThreshold
      );
      drawPrediction(
        card.proposedOutputCanvas,
        card.example.proposedProbability,
        card.example.groundTruth,
        galleryData.selection.proposedThreshold
      );
    });
    if (replayRoot && replayStiffnessCanvas && replayProposedCanvas) {
      const example = galleryData.examples[replayIndex];
      drawPrediction(
        replayStiffnessCanvas,
        example.stiffnessProbability,
        example.groundTruth,
        galleryData.selection.stiffnessThreshold
      );
      drawPrediction(
        replayProposedCanvas,
        example.proposedProbability,
        example.groundTruth,
        galleryData.selection.proposedThreshold
      );
    }
  };

  const selectReplay = (nextIndex) => {
    if (!galleryData || !replayRoot || !replayVideo || !replaySource) return;
    const count = galleryData.examples.length;
    replayIndex = (nextIndex + count) % count;
    const example = galleryData.examples[replayIndex];
    const mediaRoot = replayRoot.dataset.mediaRoot.replace(/\/$/, "");
    const videoUrl = `${mediaRoot}/${example.sampleId}.mp4`;
    const posterUrl = `${mediaRoot}/${example.sampleId}.png`;

    replayVideo.pause();
    replayVideo.poster = posterUrl;
    replayVideo.setAttribute(
      "aria-label",
      `Point-synchronized replay for ${example.sampleId.replace("_", " ")}.`
    );
    replaySource.src = videoUrl;
    if (replayDownload) replayDownload.href = videoUrl;
    replayVideo.load();
    const playback = replayVideo.play();
    if (playback) playback.catch(() => {});

    if (replayStatus) {
      replayStatus.textContent = (
        `${example.sampleId.replace("_", " ")} · ${replayIndex + 1}/${count}`
      );
    }
    if (replayStiffnessCanvas) {
      replayStiffnessCanvas.setAttribute(
        "aria-label",
        `Baseline output for ${example.sampleId.replace("_", " ")}`
      );
    }
    if (replayProposedCanvas) {
      replayProposedCanvas.setAttribute(
        "aria-label",
        `Proposed model output for ${example.sampleId.replace("_", " ")}`
      );
    }
    redraw();
  };

  const initReplay = () => {
    if (!replayRoot) return;
    replayPrevious?.addEventListener("click", () => selectReplay(replayIndex - 1));
    replayNext?.addEventListener("click", () => selectReplay(replayIndex + 1));
    replayStage?.addEventListener("keydown", (event) => {
      if (event.target !== replayStage) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        selectReplay(replayIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        selectReplay(replayIndex + 1);
      }
    });
    selectReplay(0);
  };

  const figure = (label, ariaLabel) => {
    const node = document.createElement("figure");
    const canvas = document.createElement("canvas");
    canvas.className = "palpation-example__canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", ariaLabel);
    const caption = document.createElement("figcaption");
    caption.textContent = label;
    node.append(canvas, caption);
    return { node, canvas };
  };

  const buildCards = () => {
    galleryData.examples.forEach((example) => {
      const article = document.createElement("article");
      article.className = "palpation-example";
      const header = document.createElement("header");
      header.className = "palpation-example__header";
      const title = document.createElement("h3");
      title.textContent = `#${String(example.rank).padStart(2, "0")} · ${example.sampleId.replace("_", " ")}`;
      header.append(title);

      const plots = document.createElement("div");
      plots.className = "palpation-example__plots";
      const stiffnessMap = figure(
        "Stiffness map",
        `${example.sampleId} equivalent-stiffness map`
      );
      const stiffnessOutput = figure(
        "Baseline",
        `${example.sampleId} baseline prediction with ground-truth outline`
      );
      const proposedOutput = figure(
        "Proposed",
        `${example.sampleId} proposed model prediction with ground-truth outline`
      );
      plots.append(stiffnessMap.node, stiffnessOutput.node, proposedOutput.node);

      const metadata = document.createElement("p");
      metadata.className = "palpation-example__meta";
      metadata.textContent = `${example.numLumps} inclusion${example.numLumps === 1 ? "" : "s"} · ${example.shapes.join(", ")}`;
      article.append(header, plots, metadata);
      grid.appendChild(article);
      renderedCards.push({
        example,
        stiffnessCanvas: stiffnessMap.canvas,
        stiffnessOutputCanvas: stiffnessOutput.canvas,
        proposedOutputCanvas: proposedOutput.canvas,
      });
    });
  };

  fetch(root.dataset.source)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      galleryData = data;
      loading.hidden = true;
      buildCards();
      initReplay();
      const resizeObserver = new ResizeObserver(redraw);
      resizeObserver.observe(grid);
      if (replayRoot) resizeObserver.observe(replayRoot);
      const themeObserver = new MutationObserver(redraw);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    })
    .catch(() => {
      loading.hidden = true;
      errorNode.hidden = false;
      errorNode.textContent = "The qualitative examples could not be loaded.";
    });
};

document.addEventListener("DOMContentLoaded", initV1EvidenceGallery);
