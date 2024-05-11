const getCopyElement = () => {
  const copyElement = document.createElement("img");
  copyElement.src = chrome.extension.getURL("assets/icons/copy.svg");
  copyElement.style.width = "28px";
  copyElement.style.width = "28px";
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
    document.querySelectorAll(".katex:not(.copy-bound)")
  );
  laTeXElements.forEach((el) => {
    el.classList.add("copy-bound");
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
          copyElement.src = chrome.extension.getURL(
            "assets/icons/copy-success.svg"
          );
          setTimeout(() => {
            copyElement.src = chrome.extension.getURL("assets/icons/copy.svg");
          }, 1500);
        })
        .catch((err) => {
          console.error("Failed to copy latex: ", err);
        });
    });
  });
};

const init = () => {
  /** @type {MutationCallback} */
  const observerCallBack = (mutations) => {
    if (mutations.some((el) => el.type === "childList"))
      addCopyBtnToLaTeXElements();
  };
  const observer = new MutationObserver(observerCallBack);
  observer.observe(document.body, { childList: true, subtree: true });
};
init();
