# Sistema de Devolução e Troca - Lojas Eluz

Sistema web desenvolvido para gerenciamento de solicitações de devolução e troca da **Lojas Eluz Móveis**, com integração ao **Google Sheets** através do **Google Apps Script**.

---

## 🚀 Funcionalidades

* Formulário moderno e responsivo
* Upload de PDF
* Integração automática com Google Planilhas
* Proteção contra envio duplicado
* Página de confirmação após envio
* Layout personalizado com identidade visual Eluz
* Compatível com Android (PWA)
* Pode ser transformado em APK

---

## 🖥️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Google Apps Script
* GitHub Pages
* PWA (Progressive Web App)

---

## 📂 Estrutura do Projeto

```bash
📦 Devolucao
 ┣ 📜 index.html
 ┣ 📜 sucesso.html
 ┣ 📜 styles.css
 ┣ 📜 script.js
 ┣ 📜 manifest.json
 ┣ 🖼️ fundo-eluz-azul.png
 ┣ 🖼️ logo-eluz-3d.png
 ┣ 🖼️ icon-192.png
 ┣ 🖼️ icon-512.png
 ┗ 📜 README.md
```

---

## ⚙️ Configuração

### 1. Configure o Google Apps Script

Substitua no arquivo `script.js`:

```javascript
const GOOGLE_SCRIPT_URL = "SUA_URL_DO_WEB_APP";
```

Pela URL do seu Web App publicado no Google Apps Script.

---

## 🌐 Publicação no GitHub Pages

1. Faça upload dos arquivos no GitHub
2. Vá em:

```bash
Settings > Pages
```

3. Em:

```bash
Branch: main
Folder: /root
```

4. Clique em:

```bash
Save
```

---

## 📱 Instalação no Android

A aplicação é compatível com PWA.

Pode ser instalada diretamente pelo navegador Chrome ou convertida em APK usando:

* PWABuilder
* Android Studio
* Capacitor

---

## 🔗 Link da Aplicação

```bash
https://segeluzmoveis-oss.github.io/Devolucao/
```

---

## ✅ Recursos Implementados

* [x] Página de sucesso
* [x] Layout responsivo
* [x] Fundo personalizado
* [x] Logo personalizada
* [x] Upload PDF
* [x] Envio único
* [x] Integração Google Sheets
* [x] Compatível com PWA

---

## 👨‍💻 Desenvolvedor

**Daniel Soares**
Portfólio de Automações

---

## 📄 Licença

Este projeto é privado e destinado ao uso interno da Lojas Eluz Móveis.
