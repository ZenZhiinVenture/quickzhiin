const fs = require('fs');
const path = 'src/app/[locale]/(routes)/sales/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove LHDN Status Column
content = content.replace(
  /\{\n\s+id: 'lhdnStatus',\n\s+accessorKey: 'lhdnStatus',\n\s+header: 'LHDN Status',\n\s+cell: \(\{ row \}\) => \{\n\s+const lhdn = row\.original\.lhdnStatus;\n\s+if \(!lhdn\) return <span className="text-muted-foreground text-xs">Unsubmitted<\/span>;\n\s+return <StatusBadge status=\{lhdn\} \/>;\n\s+\},\n\s+\},/g,
  ""
);

// Remove LHDN Status Column (alternative if it doesn't match perfectly)
content = content.replace(/\{\s*id:\s*'lhdnStatus'[\s\S]*?\},/g, "");

// Remove LHDN dropdown actions
content = content.replace(/<DropdownMenuSeparator \/>\s*<DropdownMenuItem[\s\S]*?Submit to LHDN\s*<\/DropdownMenuItem>/g, "");
content = content.replace(/<DropdownMenuItem[\s\S]*?Check LHDN Status\s*<\/DropdownMenuItem>/g, "");

fs.writeFileSync(path, content);
