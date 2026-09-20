const fs = require('fs');
const path = 'src/app/[locale]/(routes)/accounting/journals/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add ImportModal to imports
content = content.replace(
  "import { JournalEntryForm, JournalEntryFormValues } from '@/components/forms/accounting/JournalEntryForm';",
  "import { JournalEntryForm, JournalEntryFormValues } from '@/components/forms/accounting/JournalEntryForm';\nimport { ImportModal } from '@/components/modals/import-modal';"
);

// 2. Add Upload icon to lucide-react import
content = content.replace(
  "Plus, BookText, MoreHorizontal, Eye, MessageSquareQuote } from 'lucide-react';",
  "Plus, BookText, MoreHorizontal, Eye, MessageSquareQuote, Upload } from 'lucide-react';"
);

// 3. Add isImportOpen state
content = content.replace(
  "const [isModalOpen, setIsModalOpen] = useState(false);",
  "const [isModalOpen, setIsModalOpen] = useState(false);\n  const [isImportOpen, setIsImportOpen] = useState(false);"
);

// 4. Add Import Button
content = content.replace(
  "<Button\n          onClick={() => setIsModalOpen(true)}",
  `<Button
          variant="outline"
          onClick={() => setIsImportOpen(true)}
          className="flex gap-2"
        >
          <Upload size={18} /> Import CSV
        </Button>
        <Button\n          onClick={() => setIsModalOpen(true)}`
);

// 5. Add ImportModal component before the last closing div
content = content.replace(
  "    </div>\n  );\n}",
  `      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)}
        title="Import Journal Entries"
        description="Upload a CSV file containing your journal lines. Rows with the same 'reference' will be grouped as one entry. Must include 'accountId', 'debit', and 'credit'."
        onUpload={async (file) => {
          try {
            const res = await journalEntryAPI.importCsv(file);
            return { success: true, message: res.data.message };
          } catch (err: any) {
            return { success: false, message: err.response?.data?.message || 'Upload failed', errors: err.response?.data?.errors };
          }
        }}
        onSuccess={() => {
          fetchEntries();
        }}
      />
    </div>
  );
}`
);

fs.writeFileSync(path, content);
