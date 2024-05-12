const getCopyElement = () => {
  const copyElement = document.createElement("img");
  copyElement.classList.add("latex-copy-img");
  copyElement.src = browser.extension.getURL("assets/icons/copy.svg");
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

const addCopyBtnToLaTeXElements = () => {
  /** @type {HTMLSpanElement[]} */
  const laTeXElements = Array.from(
    document.querySelectorAll(".katex:not(.latex-copy-bound)")
  );
  console.debug("Copy", "laTeXElements", laTeXElements);

  laTeXElements.forEach((el) => {
    el.classList.add("latex-copy-bound");
    el.style.position = "relative";
    const copyElement = getCopyElement();
    el.insertAdjacentElement("afterbegin", copyElement);

    el.addEventListener(
      "mouseenter",
      () => (copyElement.style.opacity = "0.7")
    );
    el.addEventListener("mouseleave", () => (copyElement.style.opacity = "0"));

    copyElement.addEventListener("click", () => {
      const text = el.querySelector(".katex-mathml annotation").innerHTML;

      navigator.clipboard
        .writeText(`$$${text}$$`)
        .then(() => {
          copyElement.src = browser.extension.getURL(
            "assets/icons/copy-success.svg"
          );
          setTimeout(() => {
            copyElement.src = browser.extension.getURL("assets/icons/copy.svg");
          }, 1500);
        })
        .catch((err) => {
          console.debug("Copy", "Failed to copy latex: ", err);
        });
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
