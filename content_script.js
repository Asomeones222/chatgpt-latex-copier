const getCopyElement = () => {
  const copyElement = document.createElement("img");
  copyElement.classList.add("latex-copy-img");
  copyElement.style.width = "24px";
  copyElement.style.height = "24px";
  copyElement.style.position = "absolute";
  copyElement.style.cursor = "pointer";
  copyElement.style.zIndex = "999";
  copyElement.style.right = "0";
  copyElement.style.top = "0";
  copyElement.style.margin = "0";
  copyElement.style.padding = "0";
  copyElement.style.opacity = "0";
  copyElement.style.transitionDuration = "0.5s";
  copyElement.addEventListener(
    "mouseenter",
    () => (copyElement.style.opacity = "1")
  );
  return copyElement;
};

const getLaTeXCopyElement = () => {
  const laTeXCopyElement = getCopyElement();
  laTeXCopyElement.src = browser.runtime.getURL("assets/icons/latex-copy.svg");
  laTeXCopyElement.title = "Copy raw LaTeX";
  laTeXCopyElement.style.right = "30px";
  return laTeXCopyElement;
};

// MathMl is easier for Word to understand
const getMathMLCopyElement = () => {
  const mathMLCopyElement = getCopyElement();
  mathMLCopyElement.src = browser.runtime.getURL(
    "assets/icons/mathml-copy.svg"
  );
  mathMLCopyElement.title = "Copy MathML, suitable for Word";
  return mathMLCopyElement;
};

const addCopyBtnToLaTeXElements = () => {
  /** @type {HTMLSpanElement[]} */
  const laTeXElements = Array.from(
    document.querySelectorAll(".katex:not(.latex-copy-bound)")
  );
  console.debug("Copy", "laTeXElements", laTeXElements);

  laTeXElements.forEach((el) => {
    el.classList.add("latex-copy-bound");
    el.style.position = "relative";

    const laTeXCopyElement = getLaTeXCopyElement();
    const mathMLCopyElement = getMathMLCopyElement();
    el.insertAdjacentElement("afterbegin", laTeXCopyElement);
    el.insertAdjacentElement("afterbegin", mathMLCopyElement);

    el.addEventListener("mouseenter", () => {
      laTeXCopyElement.style.opacity = "0.7";
      mathMLCopyElement.style.opacity = "0.7";
    });
    el.addEventListener("mouseleave", () => {
      laTeXCopyElement.style.opacity = "0";
      mathMLCopyElement.style.opacity = "0";
    });

    laTeXCopyElement.addEventListener("click", () => {
      const laTeX = el.querySelector(".katex-mathml annotation").innerHTML;

      try {
        navigator.clipboard.writeText(`$$${laTeX}$$`);
        laTeXCopyElement.src = browser.runtime.getURL(
          "assets/icons/copy-success.svg"
        );
        setTimeout(() => {
          laTeXCopyElement.src = browser.runtime.getURL(
            "assets/icons/latex-copy.svg"
          );
        }, 1500);
      } catch (error) {
        console.debug("Copy", "Failed to copy latex: ", error);
      }
    });

    mathMLCopyElement.addEventListener("click", () => {
      const laTeX = el.querySelector(".katex-mathml annotation").innerHTML;
      const mathML = temml.renderToString(laTeX, {
        displayMode: true,
        annotate: true,
        xml: true,
      });

      try {
        navigator.clipboard.writeText(mathML);
        mathMLCopyElement.src = browser.runtime.getURL(
          "assets/icons/copy-success.svg"
        );
        setTimeout(() => {
          mathMLCopyElement.src = browser.runtime.getURL(
            "assets/icons/mathml-copy.svg"
          );
        }, 1500);
      } catch (error) {
        console.debug("Copy", "Failed to copy mathml: ", error);
      }
    });
  });
};

/** @param {MutationRecord} mutation */
const isMutationRelevant = (mutation) => {
  const addedNodes = Array.from(mutation.addedNodes);
  // If the node mutated is either a latex element or contains a latex element return true
  return addedNodes.some(
    (node) =>
      node.nodeType === 1 &&
      (node.matches(".katex, .katex *") || node.querySelector(".katex"))
  );
};

/** @type {MutationCallback} */
const observerCallBack = (mutations) => {
  console.debug("Copy", "Called observer");
  if (mutations.some((el) => el.type === "childList" && isMutationRelevant(el)))
    addCopyBtnToLaTeXElements();
};

const addCSSStyle = () => {
  const style = document.createElement("style");
  style.textContent = `.dark .latex-copy-img{ filter:invert(1); }`;
  document.head.appendChild(style);
};

const init = () => {
  addCSSStyle();
  const observer = new MutationObserver(observerCallBack);
  observer.observe(document.body, { childList: true, subtree: true });
};
init();
