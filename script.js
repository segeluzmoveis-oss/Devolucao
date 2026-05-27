const form = document.querySelector("#returnForm");
const fileInput = document.querySelector("#saleSummary");
const fileName = document.querySelector("#fileName");
const successMessage = document.querySelector("#successMessage");
const submitButton = document.querySelector("#submitButton");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwmoNbPx4EGV7yszEIYkxdtWByfmCLbdtey3AnpEdzkyPLdzxDeua8mTfsj6Z5aAyYG6g/exec";
const GOOGLE_SCRIPT_PLACEHOLDER = "COLE_AQUI_A_URL_DO_SEU_WEB_APP";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

let isSubmitting = false;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? file.name : "Nenhum arquivo escolhido";
  successMessage.textContent = "";
  fileInput.setCustomValidity("");
});

form.addEventListener("reset", () => {
  fileName.textContent = "Nenhum arquivo escolhido";
  successMessage.textContent = "";
  successMessage.className = "success";
  unlockSubmitButton();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSubmitting) return;

  const file = fileInput.files[0];
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === GOOGLE_SCRIPT_PLACEHOLDER) {
    showMessage("Cole a URL do Web App do Google Apps Script no arquivo script.js.", true);
    return;
  }

  if (!file || (file.type && file.type !== "application/pdf")) {
    fileInput.setCustomValidity("Anexe um arquivo em PDF.");
    fileInput.reportValidity();
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    fileInput.setCustomValidity(`O PDF deve ter no máximo ${MAX_FILE_SIZE_MB} MB.`);
    fileInput.reportValidity();
    return;
  }

  fileInput.setCustomValidity("");
  lockSubmitButton();
  showMessage("Enviando dados...", false);

  try {
    const payload = {
      reason: form.reason.value.trim(),
      branch: form.branch.value.trim(),
      delivered: form.delivered.value,
      location: form.location.value.trim(),
      destination: form.destination.value.trim(),
      file: {
        name: file.name,
        mimeType: file.type || "application/pdf",
        content: await fileToBase64(file),
      },
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    window.location.href = "sucesso.html";
  } catch (error) {
    showMessage("Não foi possível enviar o formulário. Verifique a URL do Apps Script.", true);
    unlockSubmitButton();
  }
});

function lockSubmitButton() {
  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
}

function unlockSubmitButton() {
  isSubmitting = false;
  submitButton.disabled = false;
  submitButton.textContent = "Enviar";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showMessage(message, isError) {
  successMessage.textContent = message;
  successMessage.className = isError ? "success error" : "success";
}
