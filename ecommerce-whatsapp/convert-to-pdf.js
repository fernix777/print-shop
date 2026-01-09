const fs = require('fs');
const path = require('path');

// Leer el archivo Markdown
const mdFile = path.join(__dirname, 'FACEBOOK_API_IMPLEMENTATION_REPORT.md');
const pdfFile = path.join(__dirname, 'FACEBOOK_API_IMPLEMENTATION_REPORT.pdf');

const markdownText = fs.readFileSync(mdFile, 'utf8');

// Convertir Markdown a HTML básico
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Code blocks
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Lists
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    
    // Checkboxes
    html = html.replace(/- \[x\] (.*?)/g, '<li style="list-style: none;">✅ $1</li>');
    html = html.replace(/- \[ \] (.*?)/g, '<li style="list-style: none;">☐ $1</li>');
    
    return html;
}

const htmlContent = markdownToHtml(markdownText);

// Crear HTML completo
const fullHtml = `
<!DOCTYPE html>
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 2.5em;
            margin: 40px 0 20px 0;
            color: #1a73e8;
            border-bottom: 3px solid #1a73e8;
            padding-bottom: 10px;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 1.8em;
            margin: 30px 0 15px 0;
            color: #2d5016;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 1.3em;
            margin: 20px 0 10px 0;
            color: #34a853;
            page-break-after: avoid;
        }
        
        p {
            margin: 10px 0;
            text-align: justify;
        }
        
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            border-left: 4px solid #1a73e8;
        }
        
        pre code {
            background: none;
            padding: 0;
            font-size: 0.85em;
        }
        
        strong {
            color: #1a73e8;
            font-weight: 600;
        }
        
        em {
            font-style: italic;
            color: #666;
        }
        
        a {
            color: #1a73e8;
            text-decoration: none;
        }
        
        a:hover {
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
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        
        th {
            background: #f5f5f5;
            font-weight: 600;
        }
        
        .checklist {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 15px 0;
        }
        
        .checklist-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 15px;
            margin: 15px 0;
            color: #666;
            font-style: italic;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .section {
            margin: 30px 0;
        }
        
        .emoji {
            font-size: 1.2em;
            margin-right: 5px;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            h1, h2, h3 {
                page-break-after: avoid;
            }
            p {
                orphans: 3;
                widows: 3;
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
    
    <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; font-size: 0.9em; color: #999;">
        <p>Documento generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
        <p>Magnolia Novedades - Facebook Conversion API Implementation</p>
    </div>
</body>
</html>
`;

// Guardar HTML
const htmlFile = path.join(__dirname, 'FACEBOOK_API_IMPLEMENTATION_REPORT.html');
fs.writeFileSync(htmlFile, fullHtml);

console.log('✅ HTML generado:', htmlFile);
console.log('\nAhora abre el archivo HTML en tu navegador y usa Ctrl+P para imprimir como PDF.');
console.log('Pasos:');
console.log('1. Abre:', htmlFile);
console.log('2. Presiona Ctrl+P');
console.log('3. Selecciona "Guardar como PDF"');
console.log('4. Elige ubicación:', pdfFile);
