function getGFGCode() {
  const editor = document.querySelector(".ace_editor");

  if (!editor) {
    return null;
  }

  if (!editor.env || !editor.env.editor) {
    return null;
  }

  return editor.env.editor.getValue();
}

window.addEventListener("GFG_GET_CODE", () => {
  const code = getGFGCode();

  window.dispatchEvent(
    new CustomEvent("GFG_CODE_RESULT", {
      detail: code,
    }),
  );
});
