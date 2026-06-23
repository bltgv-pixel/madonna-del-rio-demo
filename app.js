(function () {
  "use strict";

  const page = document.body.dataset.page;

  if (page === "donazioni") {
    initDonationDemo();
  }

  if (page === "donazioni-sperimentale") {
    initExperimentalDonationDemo();
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

  function initExperimentalDonationDemo() {
    const storageKey = "madonna-del-rio-rendering-luce-v1";
    const zones = ["altare", "abside", "navata", "altare-sinistro", "altare-destro", "pareti"];
    const zoneLabels = {
      "altare": "Altare maggiore",
      "abside": "Abside e coro",
      "navata": "Navata",
      "altare-sinistro": "Altare laterale sinistro",
      "altare-destro": "Altare laterale destro",
      "pareti": "Pareti e volte",
    };
    const amountEnergy = {
      "10": 10,
      "25": 22,
      "50": 42,
      "100": 78,
      "libera": 16,
    };

    const stage = document.querySelector("#restorationStage");
    const amountButtons = Array.from(document.querySelectorAll(".experimental-amount"));
    const zoneButtons = Array.from(document.querySelectorAll("[data-exp-zone-choice]"));
    const donateButton = document.querySelector("#experimentalDonateButton");
    const resetButton = document.querySelector("#experimentalResetButton");
    const statusMessage = document.querySelector("#experimentalStatus");
    const donationCount = document.querySelector("#experimentalDonationCount");
    const energyCount = document.querySelector("#experimentalEnergyCount");
    const progressFill = document.querySelector("#experimentalProgressFill");
    const progressText = document.querySelector("#experimentalProgressText");

    if (!stage || !donateButton || !resetButton || !statusMessage) {
      return;
    }

    let selectedAmount = "25";
    let selectedZone = "altare";
    let state = loadExperimentalState(storageKey, zones);

    amountButtons.forEach((button) => {
      button.setAttribute("aria-pressed", button.classList.contains("is-selected") ? "true" : "false");
      button.addEventListener("click", () => {
        selectedAmount = button.dataset.expAmount || "25";
        amountButtons.forEach((item) => {
          const isSelected = item === button;
          item.classList.toggle("is-selected", isSelected);
          item.setAttribute("aria-pressed", isSelected ? "true" : "false");
        });
      });
    });

    zoneButtons.forEach((button) => {
      button.addEventListener("click", () => selectZone(button.dataset.expZoneChoice || "altare"));
    });

    donateButton.addEventListener("click", () => {
      const gain = amountEnergy[selectedAmount] || amountEnergy.libera;
      state.zones[selectedZone] = (state.zones[selectedZone] || 0) + gain;
      state.donations += 1;
      saveExperimentalState(storageKey, state);
      renderExperimentalState();

      const amountLabel = selectedAmount === "libera" ? "offerta libera" : `${selectedAmount} euro`;
      const zoneLabel = zoneLabels[selectedZone] || "zona scelta";
      setExperimentalStatus(
        `Grazie. Donazione simulata da ${amountLabel}: ${zoneLabel} ha ricevuto ${gain} punti luce.`,
        "success"
      );
    });

    resetButton.addEventListener("click", () => {
      state = createExperimentalState(zones);
      saveExperimentalState(storageKey, state);
      renderExperimentalState();
      setExperimentalStatus("Demo azzerata. Puoi ricominciare a illuminare il rendering.", "warning");
    });

    selectZone(selectedZone);
    renderExperimentalState();

    function selectZone(zoneId) {
      selectedZone = zones.includes(zoneId) ? zoneId : "altare";

      zoneButtons.forEach((button) => {
        const isSelected = button.dataset.expZoneChoice === selectedZone;
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });

    }

    function renderExperimentalState() {
      const totalEnergy = zones.reduce((sum, zoneId) => sum + (state.zones[zoneId] || 0), 0);
      const veilOpacity = Math.max(0.05, 0.84 - Math.min(0.79, totalEnergy / 640));
      const imageBrightness = Math.min(1.72, 0.24 + totalEnergy / 440);
      const imageSaturation = Math.min(1.28, 0.48 + totalEnergy / 720);
      const imageContrast = Math.min(1.15, 0.88 + totalEnergy / 1200);
      const milestone = Math.floor(totalEnergy / 100) + 1;
      const milestoneProgress = totalEnergy === 0 ? 0 : totalEnergy % 100 || 100;

      stage.style.setProperty("--veil-opacity", veilOpacity.toFixed(3));
      stage.style.setProperty("--image-brightness", imageBrightness.toFixed(3));
      stage.style.setProperty("--image-saturation", imageSaturation.toFixed(3));
      stage.style.setProperty("--image-contrast", imageContrast.toFixed(3));

      zones.forEach((zoneId) => {
        const value = state.zones[zoneId] || 0;
        const glow = Math.min(1, 0.08 + Math.sqrt(value) / 8.7);
        const scale = Math.min(2.15, 0.92 + value / 120);
        const glare = Math.min(0.9, Math.max(0, (value - 125) / 150));
        const meterWidth = Math.min(100, value);
        const level = document.querySelector(`[data-exp-zone-level="${zoneId}"]`);
        const meter = document.querySelector(`[data-exp-zone-meter="${zoneId}"]`);

        stage.style.setProperty(`--${zoneId}-glow`, value > 0 ? glow.toFixed(3) : "0");
        stage.style.setProperty(`--${zoneId}-scale`, scale.toFixed(3));
        stage.style.setProperty(`--${zoneId}-glare`, glare.toFixed(3));

        if (level) {
          level.textContent = String(value);
        }

        if (meter) {
          meter.style.width = `${meterWidth}%`;
        }
      });

      donationCount.textContent = String(state.donations);
      energyCount.textContent = String(totalEnergy);
      progressFill.style.width = `${milestoneProgress}%`;
      progressText.textContent = `Livello ${milestone}: ${totalEnergy} punti luce accumulati`;
    }

    function setExperimentalStatus(message, type) {
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

  function createExperimentalState(zones) {
    return {
      donations: 0,
      zones: zones.reduce((result, zoneId) => {
        result[zoneId] = 0;
        return result;
      }, {}),
    };
  }

  function loadExperimentalState(storageKey, zones) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      const state = createExperimentalState(zones);

      if (!saved || typeof saved !== "object") {
        return state;
      }

      state.donations = Number.isFinite(saved.donations) ? saved.donations : 0;
      zones.forEach((zoneId) => {
        const value = saved.zones && Number.isFinite(saved.zones[zoneId]) ? saved.zones[zoneId] : 0;
        state.zones[zoneId] = Math.max(0, Math.round(value));
      });

      return state;
    } catch (error) {
      return createExperimentalState(zones);
    }
  }

  function saveExperimentalState(storageKey, state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
})();
