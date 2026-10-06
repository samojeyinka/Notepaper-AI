export function inlineFormat(text) {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

export function markdownToHtml(md) {
    const lines = md.split('\n');
    const out = [];
    let inUl = false, inOl = false;

    const closeList = () => {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        if (/^### /.test(line))       { closeList(); out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`); }
        else if (/^## /.test(line))   { closeList(); out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`); }
        else if (/^# /.test(line))    { closeList(); out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`); }
        else if (/^[-*] /.test(line)) {
            if (!inUl) { closeList(); out.push('<ul>'); inUl = true; }
            out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
        } else if (/^\d+\. /.test(line)) {
            if (!inOl) { closeList(); out.push('<ol>'); inOl = true; }
            out.push(`<li>${inlineFormat(line.replace(/^\d+\. /, ''))}</li>`);
        } else if (/^-{3,}$/.test(line.trim())) {
            closeList(); out.push('<hr>');
        } else if (line.trim() === '') {
            closeList(); out.push('<br>');
        } else {
            closeList(); out.push(`<div>${inlineFormat(line)}</div>`);
        }
    }
    closeList();
    return out.join('');
}