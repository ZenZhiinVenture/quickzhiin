const fs = require('fs');
const path = 'src/app/[locale]/(routes)/accounting/reports/sst-02/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove LHDN EXPORT button
content = content.replace(/<Button variant="outline"[\s\S]*?LHDN EXPORT\s*<\/Button>/g, "");

fs.writeFileSync(path, content);
