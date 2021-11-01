async function render (data = {}) {
let html = '';
html += `<!DOCTYPE html>`;
html += `<html lang="${this.locale.language}">`;
html += `<head>`;
html += `<meta charset="UTF-8"/>`;
html += `<meta http-equiv="X-UA-Compatible" content="IE=edge"/>`;
html += `<meta name="viewport" content="width=device-width, initial-scale=1.0"/>`;
html += `<meta name="description" content="${this?.app?.description}"/>`;
html += `<title >`;
html += `Landing - `;
html += `${this?.app?.name}`;
html += `</title>`;
html += `</head>`;
html += `<body>`;
html += `</body>`;
html += `</html>`;
return html;
}