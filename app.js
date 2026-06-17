(function () {
  "use strict";

  const page = document.body.dataset.page;

  if (page === "donazioni") {
    initDonationDemo();
  }

  if (page === "storia") {
    initStoryCrawl();
  }

  function initStoryCrawl() {
    const stage = document.querySelector("#storyStage");
    const crawl = document.querySelector("#storyCrawl");
    const status = document.querySelector("#storyStatus");

    if (!stage || !crawl || !status) {
      return;
    }

    let resizeTimer = 0;

    function configureCrawl() {
      const stageHeight = stage.clientHeight || window.innerHeight;
      const textHeight = crawl.scrollHeight;
      const start = Math.round(stageHeight * 0.82);
      const end = -Math.round(textHeight + stageHeight * 0.95);
      const duration = Math.min(190, Math.max(120, Math.round((textHeight + stageHeight * 1.6) / 26)));

      crawl.style.setProperty("--story-start", `${start}px`);
      crawl.style.setProperty("--story-end", `${end}px`);
      crawl.style.setProperty("--story-duration", `${duration}s`);
    }

    function togglePause() {
      const isPaused = stage.classList.toggle("is-paused");
      stage.setAttribute("aria-pressed", isPaused ? "true" : "false");
      status.textContent = isPaused ? "Testo storico in pausa." : "Testo storico in movimento.";
    }

    stage.setAttribute("aria-pressed", "false");
    stage.addEventListener("click", togglePause);
    stage.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePause();
      }
    });

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(configureCrawl, 150);
    });

    configureCrawl();
  }

  function initDonationDemo() {
    const storageKey = "madonna-del-rio-luci-accese";
    const points = Array.from(document.querySelectorAll(".light-point"));
    const planShell = document.querySelector("#planShell");
    const simulateButton = document.querySelector("#simulateButton");
    const fakeDonationButton = document.querySelector("#fakeDonationButton");
    const resetButton = document.querySelector("#resetButton");
    const statusMessage = document.querySelector("#statusMessage");
    const lightsCount = document.querySelector("#lightsCount");
    const totalLights = document.querySelector("#totalLights");
    const progressFill = document.querySelector("#progressFill");
    const progressText = document.querySelector("#progressText");
    const amountButtons = Array.from(document.querySelectorAll(".amount-option"));

    let selecting = false;
    let selectedAmount = "25";
    let litLights = loadLights(storageKey);

    totalLights.textContent = String(points.length);
    updateLights();
    updateProgress();

    amountButtons.forEach((button) => {
      button.setAttribute("aria-pressed", button.classList.contains("is-selected") ? "true" : "false");

      button.addEventListener("click", () => {
        selectedAmount = button.dataset.amount || "libera";
        amountButtons.forEach((item) => {
          const isSelected = item === button;
          item.classList.toggle("is-selected", isSelected);
          item.setAttribute("aria-pressed", isSelected ? "true" : "false");
        });
      });
    });

    simulateButton.addEventListener("click", beginSelection);
    fakeDonationButton.addEventListener("click", beginSelection);

    resetButton.addEventListener("click", () => {
      selecting = false;
      litLights = new Set();
      localStorage.removeItem(storageKey);
      updateLights();
      updateProgress();
      setStatus("Demo azzerata. Puoi accendere nuove luci.", "warning");
    });

    points.forEach((point) => {
      const hitTarget = createHitTarget(point);
      hitTarget.addEventListener("click", () => choosePoint(point));

      point.addEventListener("click", () => choosePoint(point));
      point.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          choosePoint(point);
        }
      });
    });

    // Adds a larger invisible touch area without changing the visible SVG points.
    function createHitTarget(point) {
      const hitTarget = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hitTarget.setAttribute("class", "light-hit");
      hitTarget.setAttribute("cx", point.getAttribute("cx"));
      hitTarget.setAttribute("cy", point.getAttribute("cy"));
      hitTarget.setAttribute("r", "34");
      hitTarget.setAttribute("aria-hidden", "true");
      point.parentNode.insertBefore(hitTarget, point);
      return hitTarget;
    }

    function beginSelection() {
      if (litLights.size >= points.length) {
        setStatus("Tutte le luci sono già accese. Usa Reset demo per ricominciare.", "success");
        return;
      }

      selecting = true;
      updateChoiceMode();
      const amountText = selectedAmount === "libera" ? "offerta libera" : `${selectedAmount} €`;
      setStatus(`Donazione simulata da ${amountText}: scegli un punto spento sulla piantina.`, "");
    }

    function choosePoint(point) {
      const id = point.dataset.lightId;
      const area = point.dataset.area || "santuario";

      if (!selecting) {
        setStatus("Premi “Simula una donazione” prima di scegliere una luce.", "warning");
        return;
      }

      if (litLights.has(id)) {
        setStatus("Questa luce è già accesa. Scegli un altro punto spento.", "warning");
        return;
      }

      litLights.add(id);
      saveLights(storageKey, litLights);
      selecting = false;
      updateLights();
      updateProgress();
      setStatus(`Grazie, hai acceso una luce nel santuario. Zona: ${area}.`, "success");
    }

    function updateLights() {
      points.forEach((point) => {
        const isLit = litLights.has(point.dataset.lightId);
        point.classList.toggle("is-lit", isLit);
        point.setAttribute("aria-pressed", isLit ? "true" : "false");
      });
      updateChoiceMode();
    }

    function updateChoiceMode() {
      planShell.classList.toggle("is-selecting", selecting);
      points.forEach((point) => {
        const canChoose = selecting && !litLights.has(point.dataset.lightId);
        point.classList.toggle("is-choice", canChoose);
      });
    }

    function updateProgress() {
      const total = points.length;
      const current = litLights.size;
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

      lightsCount.textContent = String(current);
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}% del santuario illuminato`;
    }

    function setStatus(message, type) {
      statusMessage.textContent = message;
      statusMessage.classList.toggle("is-success", type === "success");
      statusMessage.classList.toggle("is-warning", type === "warning");
    }
  }

  function loadLights(storageKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(saved) ? saved : []);
    } catch (error) {
      return new Set();
    }
  }

  function saveLights(storageKey, litLights) {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(litLights)));
  }
})();
