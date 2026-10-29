/* LOJAS ELUZ - NOVA CONEXÃO.
 * Cole abaixo SOMENTE a URL /exec da sua NOVA implantação Apps Script.
 * NÃO use a URL do formulário antigo.
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjXwQAygrRoHmy8czLufG_yKAwN5n81B-iZEbgYwErsyhRl1fHCToOEsK-qDUuUINo/exec";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CONFIRMATION_TIMEOUT_MS = 120000;

const form = document.querySelector("#returnForm");
const fileInput = document.querySelector("#saleSummary");
const fileName = document.querySelector("#fileName");
const successMessage = document.querySelector("#successMessage");
const submitButton = document.querySelector("#submitButton");
const resetButton = form.querySelector('button[type="reset"]');
let sending = false;
let pendingRequestId = null;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? file.name : "Nenhum arquivo escolhido";
  fileInput.setCustomValidity("");
  message("");
});
form.addEventListener("reset", () => {
  fileName.textContent = "Nenhum arquivo escolhido";
  message("");
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (sending) return;
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(GOOGLE_SCRIPT_URL)) {
    message("Nova conexão não configurada: substitua COLE_AQUI_A_NOVA_URL_DO_APPS_SCRIPT pela URL /exec da NOVA implantação no arquivo script.js.", true);
    return;
  }
  const file = fileInput.files[0];
  if (!file || !/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
    fileInput.setCustomValidity("Selecione um arquivo PDF válido.");
    fileInput.reportValidity();
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    fileInput.setCustomValidity("O PDF deve ter até 10 MB.");
    fileInput.reportValidity();
    return;
  }
  fileInput.setCustomValidity("");
  setSending(true);
  try {
    // Se a confirmação falhou anteriormente, consulte primeiro o mesmo ID.
    // Isso impede um segundo POST duplicado com os mesmos dados.
    if (pendingRequestId) {
      message("Verificando o envio anterior antes de tentar novamente...");
      const previous = await checkStatus(pendingRequestId);
      if (previous.status === "success") {
        window.location.assign("sucesso.html");
        return;
      }
      if (previous.status === "pending") {
        message("O envio anterior ainda não foi confirmado. Confira a planilha e tente verificar novamente; nenhum novo envio foi iniciado.", true);
        return;
      }
      // erro registrado: um novo envio pode ser tentado
      pendingRequestId = null;
    }
    message("Preparando o PDF e enviando a solicitação...");
    const payload = {
      requestId: newRequestId(),
      reason: field("reason"),
      seller: field("seller"),
      branch: field("branch"),
      delivered: field("delivered"),
      operation: field("operation"),
      cancellation: field("cancellation"),
      location: field("location"),
      destination: field("destination"),
      file: {name: file.name, mimeType: "application/pdf", content: await readPdf(file)}
    };
    pendingRequestId = payload.requestId;
    // no-cors permite o envio a partir do GitHub Pages, mas NÃO confirma a gravação.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(payload)
    });
    message("Aguardando a confirmação da planilha...");
    const result = await waitForStatus(payload.requestId);
    if (result.status === "success") {
      pendingRequestId = null;
      window.location.assign("sucesso.html");
      return;
    }
    if (result.status === "error") {
      pendingRequestId = null;
      throw new Error(result.error || "Erro identificado pelo Apps Script.");
    }
    throw new Error("Ainda não houve confirmação. Confira a planilha e as Execuções do Apps Script. Ao clicar Enviar novamente, primeiro será consultado o mesmo protocolo, sem duplicar o envio.");
  } catch (error) {
    console.error("Envio Eluz:", error);
    message(error.message || "Falha no envio ou na confirmação.", true);
  } finally {
    setSending(false);
  }
});
function field(name) {return String(form.elements[name].value || "").trim();}
function setSending(value) {
  sending = value;
  submitButton.disabled = value;
  resetButton.disabled = value;
  submitButton.textContent = value ? "Enviando..." : "Enviar";
}
function message(text, isError = false) {
  successMessage.textContent = text;
  successMessage.className = isError ? "success error" : "success";
}
function newRequestId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return "eluz-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}
function readPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo PDF."));
    reader.readAsDataURL(file);
  });
}
// Consulta por JSONP porque o ContentService do Apps Script não oferece CORS para fetch.
function checkStatus(id) {
  return new Promise((resolve, reject) => {
    const callback = "eluzStatus_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    let done = false;
    const finish = (err, response) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      script.remove();
      delete window[callback];
      err ? reject(err) : resolve(response);
    };
    const timer = setTimeout(() => finish(new Error("O Apps Script não respondeu à consulta de status.")), 12000);
    window[callback] = response => finish(null, response);
    script.onerror = () => finish(new Error("Não foi possível consultar o status. Confirme a URL /exec e as permissões do Web App."));
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set("action", "status");
    url.searchParams.set("id", id);
    url.searchParams.set("callback", callback);
    url.searchParams.set("_", String(Date.now()));
    script.src = url.href;
    document.head.appendChild(script);
  });
}
async function waitForStatus(id) {
  const end = Date.now() + CONFIRMATION_TIMEOUT_MS;
  while (Date.now() < end) {
    try {
      const response = await checkStatus(id);
      if (response && (response.status === "success" || response.status === "error")) return response;
    } catch (err) {
      console.warn("Consulta de status:", err);
    }
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  return {status:"pending"};
}
