(function () {
  function copyURI(e, copyLink) {
    e.preventDefault();

    const url = copyLink.dataset.copyHref || window.location.href;

    const handleCopy = (btn, success) => {
      if (success) {
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 1000);
      } else {
        btn.classList.add("notCopied");
        setTimeout(() => btn.classList.remove("notCopied"), 1000);
      }
    };

    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => handleCopy(copyLink, true))
        .catch(() => handleCopy(copyLink, false));
    } else {
      // Fallback for unsupported browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed"; // avoid scrolling
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        handleCopy(copyLink, successful);
      } catch (err) {
        handleCopy(copyLink, false);
      }

      document.body.removeChild(textArea);
    }
  }

  const copyLinks = document.querySelectorAll(".copy-btn");
  copyLinks.forEach((copyLink) =>
    copyLink.addEventListener("click", (e) => copyURI(e, copyLink))
  );
})();
