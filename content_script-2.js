class copyLaTeXGPT {
  constructor() {
    this.enableObserver();
  }

  enableObserver() {
    const observer = new MutationObserver(this.handleDomChanges.bind(this));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  handleDomChanges(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        this.createCopyEquationButtons();
      }
    }
  }

  createCopyEquationButtons() {
    const equations = Array.from(
      document.querySelectorAll(".katex:not(.copy-bound)")
    );

    equations.forEach((equation) => {
      equation.style.cursor = "pointer";
      equation.classList.add("copy-bound"); // Mark this element as having an event listener attached

      equation.addEventListener("mouseover", () => {
        equation.style.outline = "1px solid #fff";
      });

      equation.addEventListener("mouseout", () => {
        equation.style.outline = "";
      });

      equation.addEventListener("click", (e) => {
        const text = equation.querySelector(
          ".katex-mathml annotation"
        ).innerHTML;
        navigator.clipboard
          .writeText(`$$${text}$$`)
          .then(() => {
            this.showPopup("Copied LaTeX", e.clientX, e.clientY);
          })
          .catch((err) => {
            console.error("Failed to write text: ", err);
          });
      });
    });
  }

  showPopup(message, x, y) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.backgroundColor = "#333";
    popup.style.color = "#fff";
    popup.style.padding = "5px 10px";
    popup.style.borderRadius = "3px";
    popup.style.zIndex = "10000";
    popup.style.textAlign = "center";
    popup.style.fontSize = "14px";
    popup.style.fontWeight = "bold";
    popup.style.whiteSpace = "nowrap";

    document.body.appendChild(popup);

    setTimeout(() => {
      document.body.removeChild(popup);
    }, 2000);
  }
}

const copyLaTeXGPTInstance = new copyLaTeXGPT();
