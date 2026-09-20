const fs = require('fs');
const path = 'src/app/[locale]/(routes)/contacts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add ImportModal to imports
content = content.replace(
  "import { AlertModal } from '@/components/modals/alert-modal';",
  "import { AlertModal } from '@/components/modals/alert-modal';\nimport { ImportModal } from '@/components/modals/import-modal';"
);

// 2. Add Upload icon to lucide-react import
content = content.replace(
  "Trash, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';",
  "Trash, ExternalLink, Loader2, ShieldCheck, Upload } from 'lucide-react';"
);

// 3. Add isImportOpen state
content = content.replace(
  "const [isModalOpen, setIsModalOpen] = useState(false);",
  "const [isModalOpen, setIsModalOpen] = useState(false);\n  const [isImportOpen, setIsImportOpen] = useState(false);"
);

// 4. Add Import Button
content = content.replace(
  "<Button\n          onClick={() => {",
  `<Button
          variant="outline"
          onClick={() => setIsImportOpen(true)}
          className="flex gap-2"
        >
          <Upload size={18} /> Import CSV
        </Button>
        <Button\n          onClick={() => {`
);

// 5. Add ImportModal component before the last closing div
content = content.replace(
  "    </div>\n  );\n}",
  `      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)}
        title="Import Contacts"
        description="Upload a CSV file containing your contacts. Must include 'legalName' header."
        onUpload={async (file) => {
          try {
            const res = await contactsAPI.importCsv(file);
            return { success: true, message: res.data.message };
          } catch (err: any) {
            return { success: false, message: err.response?.data?.message || 'Upload failed', errors: err.response?.data?.errors };
          }
        }}
        onSuccess={() => {
          fetchContacts();
        }}
      />
    </div>
  );
}`
);

fs.writeFileSync(path, content);
