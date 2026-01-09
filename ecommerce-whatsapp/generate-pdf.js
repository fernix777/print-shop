const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Crear una aplicación sencilla que genere PDF
const mdFile = path.join(__dirname, 'FACEBOOK_API_IMPLEMENTATION_REPORT.md');
const htmlFile = path.join(__dirname, 'FACEBOOK_API_IMPLEMENTATION_REPORT.html');
const pdfFile = path.join(__dirname, 'FACEBOOK_API_IMPLEMENTATION_REPORT.pdf');

// Leer y convertir markdown a HTML
const markdown = fs.readFileSync(mdFile, 'utf8');

// Conversión simple de Markdown a HTML
let html = markdown;

// Escape HTML
html = html.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&amp;lt;/g, '&lt;')
    .replace(/&amp;gt;/g, '&gt;')
    .replace(/&amp;amp;/g, '&amp;');

// Headers (revertir escapes para headers)
html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');

// Bold
html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

// Italic
html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
html = html.replace(/_(.*?)_/g, '<em>$1</em>');

// Links
html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

// Code blocks
html = html.replace(/```[\s\S]*?```/g, function(match) {
    const code = match.replace(/```/g, '').trim();
    return '<pre><code>' + code + '</code></pre>';
});

// Inline code
html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

// Line breaks to paragraphs
html = html.replace(/\n\n+/g, '</p><p>');
html = '<p>' + html + '</p>';

// Listas
html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
html = html.replace(/^\✅ (.*?)$/gm, '<li style="list-style: none; color: green;">✅ $1</li>');
html = html.replace(/^\⏳ (.*?)$/gm, '<li style="list-style: none; color: orange;">⏳ $1</li>');
html = html.replace(/^\🆘 (.*?)$/gm, '<li style="list-style: none; color: red;">🆘 $1</li>');

// Listas numeradas
html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

// Checkboxes
html = html.replace(/\- \[x\] (.*?)/g, '<li style="list-style: none;">✅ $1</li>');
html = html.replace(/\- \[ \] (.*?)/g, '<li style="list-style: none;">☐ $1</li>');

// Horizontal rules
html = html.replace(/^-{3,}$/gm, '<hr>');

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facebook Conversion API Implementation Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #333;
            background: white;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 2.5em;
            margin: 50px 0 20px 0;
            color: #1a73e8;
            border-bottom: 3px solid #1a73e8;
            padding-bottom: 15px;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 1.8em;
            margin: 40px 0 15px 0;
            color: #2d5016;
            page-break-after: avoid;
            border-left: 5px solid #34a853;
            padding-left: 15px;
        }
        
        h3 {
            font-size: 1.3em;
            margin: 25px 0 10px 0;
            color: #34a853;
            page-break-after: avoid;
        }
        
        h4 {
            font-size: 1.1em;
            margin: 15px 0 8px 0;
            color: #666;
            page-break-after: avoid;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
        }
        
        code {
            background: #f5f5f5;
            padding: 3px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #c41e3a;
        }
        
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            border-left: 4px solid #1a73e8;
            page-break-inside: avoid;
        }
        
        pre code {
            background: none;
            padding: 0;
            font-size: 0.85em;
            color: #333;
        }
        
        strong {
            color: #1a73e8;
            font-weight: 700;
        }
        
        em {
            font-style: italic;
            color: #666;
        }
        
        a {
            color: #1a73e8;
            text-decoration: underline;
        }
        
        li {
            margin-left: 20px;
            margin-bottom: 8px;
            line-height: 1.8;
        }
        
        ul, ol {
            margin: 15px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #f5f5f5;
            font-weight: 700;
            color: #1a73e8;
        }
        
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 15px;
            margin: 15px 0;
            color: #666;
            font-style: italic;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ddd;
            margin: 30px 0;
            page-break-after: always;
        }
        
        .emoji {
            margin-right: 5px;
        }
        
        .footer {
            margin-top: 80px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 0.85em;
            color: #999;
            page-break-before: avoid;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            h1, h2, h3, h4 {
                page-break-after: avoid;
            }
            p {
                orphans: 3;
                widows: 3;
            }
            pre {
                page-break-inside: avoid;
            }
            table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    ${html}
    
    <div class="footer">
        <p><strong>Documento generado automáticamente</strong></p>
        <p>Magnolia Novedades - Facebook Conversion API Implementation Report</p>
        <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
    </div>
</body>
</html>`;

fs.writeFileSync(htmlFile, fullHtml);
console.log('✅ Archivo HTML generado en:');
console.log(htmlFile);
console.log('\n📋 Instrucciones para convertir a PDF:');
console.log('\nOpción 1 - Navegador (Recomendado):');
console.log('1. Abre el archivo HTML en tu navegador predeterminado');
console.log('2. Presiona Ctrl+P (o Cmd+P en Mac)');
console.log('3. Cambia la opción de "Destino" a "Guardar como PDF"');
console.log('4. Haz clic en "Guardar"');
console.log('\nEl archivo se guardará como: ' + pdfFile);

// Intentar abrir el archivo en el navegador
const { exec } = require('child_process');
exec(`start "" "${htmlFile}"`, (error) => {
    if (error) {
        console.log('\n⚠️ No se pudo abrir automáticamente. Abre manualmente:', htmlFile);
    } else {
        console.log('\n✅ HTML abierto en tu navegador');
    }
});
