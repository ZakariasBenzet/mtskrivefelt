  (function () {
    const overlay = document.getElementById("disclaimerOverlay");
    const content = document.getElementById("disclaimerContent");
    const btn = document.getElementById("disclaimerAcceptBtn");

    // Always show on every load (as requested)
    function openModal() {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      // Optional: prevent scrolling behind modal
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      btn.focus();
    }

    function closeModal() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    // Pull notice text from readme.md
    async function loadReadme() {
      try {
        const res = await fetch("./README.md", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load readme.md");
        const text = await res.text();

        // Display raw markdown nicely (not rendering HTML = safer)
        content.textContent = text;
      } catch (err) {
        // Fallback if readme can't be loaded
        content.textContent =
          "Notice could not be loaded. This site is an educational demo and not an official school tool.";
      }
    }

    // Button dismiss
    btn.addEventListener("click", closeModal);

    // Optional: ESC closes (still shows again on reload)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Init
    loadReadme().finally(openModal);
  })();
