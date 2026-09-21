<div align="center">

# QuickZhiin

**Open-source, multi-tenant cloud accounting software for modern businesses.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

[Live Demo](#) · [Report a Bug](https://github.com/ZenZhiinVenture/quickzhiin/issues) · [Request Feature](https://github.com/ZenZhiinVenture/quickzhiin/issues)

</div>

---

## 🧭 Overview

QuickZhiin is a **polyrepo**, full-stack, open-source accounting platform built for global businesses. It is designed to compete with proprietary cloud accounting solutions by offering complete financial management — sales cycle, purchase cycle, inventory, banking, and accounting — as transparent, auditable, self-hostable software.

### Polyrepo Architecture

This repository is the **frontend web application**. It works together with its companion API:

| Repository | Description | Link |
|---|---|---|
| **`quickzhiin`** (this repo) | Next.js 16 App Router frontend | You are here |
| **`quickzhiin-api`** | Node.js / Express REST API backend | [→ quickzhiin-api](../quickzhiin-api) |

> **Decoupled microservices** for regional compliance are planned as separate repositories:
> - `quickzhiin-lhdn` — Malaysia e-Invoice (MyInvois / LHDN) integration
> - `quickzhiin-peppol` — Global Peppol network e-invoicing

---

## ✨ Features

### Sales Cycle
- Quotations → Sales Orders → Delivery Orders → Invoices → Credit Notes → Payments & Refunds

### Purchase Cycle
- Purchase Requisitions → Purchase Orders → Goods Received Notes → Bills → Credit Notes → Payments

### Inventory
- Products, Bundles, Categories, Warehouses, Stock Movements, Inventory Reports

### Core Accounting
- Chart of Accounts (Double-Entry Bookkeeping)
- Journal Entries with multi-line debit/credit balancing
- **Trial Balance** — verify ledger integrity
- **Profit & Loss** — income statement with COGS split and margin analysis
- **Balance Sheet** — assets, liabilities & equity with automatic retained earnings
- Aged Receivables & Aged Payables reports
- Fixed Assets & Depreciation

### Banking
- Bank Accounts, Transactions, Statements, Manual Reconciliation

### CRM & Contacts
- Customers, Suppliers, Contact Persons, Addresses

### Platform
- 🌐 **Multi-language** — English, Bahasa Malaysia, 中文 (extendable)
- 🏢 **Multi-tenant** — isolated tenant databases with central user management
- 📥 **CSV Bulk Import** — Contacts, Products, Journal Entries
- 🔒 **JWT Authentication** with role-based access
- 📄 **PDF Generation** for Invoices and Bills

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | React Query (server state) + Zustand (UI state) |
| i18n | next-intl |
| HTTP Client | Axios |
| Testing | Playwright (E2E) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- The `quickzhiin-api` backend running (see [quickzhiin-api README](../quickzhiin-api/README.md))

### Installation

```bash
# 1. Clone the frontend
git clone https://github.com/ZenZhiinVenture/quickzhiin.git
cd quickzhiin

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```env
# Backend API URL (must match quickzhiin-api server)
NEXT_PUBLIC_API_URL=http://localhost:3001

# (Optional) Set to 'true' to use local mock data instead of real API
NEXT_PUBLIC_USE_MOCK=false
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

> **Note:** If the production build fails with a Turbopack/PostCSS error, delete the `.next` cache directory and rebuild:
> ```bash
> rm -rf .next && npm run build
> ```

---

## 📁 Project Structure

```
quickzhiin/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── (auth)/          # Login, Forgot Password
│   │       └── (routes)/        # Protected pages
│   │           ├── dashboard/
│   │           ├── sales/       # Sales cycle (Quotes → Invoices)
│   │           ├── purchases/   # Purchase cycle (PO → Bills)
│   │           ├── inventory/   # Products, Warehouses, Reports
│   │           ├── accounting/  # Journals, Reports (P&L, BS, TB)
│   │           ├── contacts/    # Customers & Suppliers
│   │           ├── banking/     # Bank Accounts & Transactions
│   │           └── settings/    # Tenant & User Management
│   ├── components/              # Reusable UI components (Atomic Design)
│   ├── hooks/                   # Custom React hooks (SWR / React Query)
│   ├── services/
│   │   └── api/                 # Axios API client modules
│   ├── messages/                # i18n translation files (en, ms, zh)
│   ├── styles/                  # Global CSS (Tailwind)
│   └── utils/                   # Shared utilities
├── tests/
│   └── e2e/                     # Playwright end-to-end tests
├── playwright.config.ts
├── tailwind.config.ts
└── next.config.ts
```

---

## 🧪 Testing

```bash
# Run E2E tests (requires dev server running on :3000)
npx playwright test

# Run in interactive UI mode
npx playwright test --ui
```

---

## 🤝 Contributing

QuickZhiin is open-source and welcomes contributions! Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📜 License

QuickZhiin is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

This means:
- ✅ You can freely use, modify, and distribute this software
- ✅ You can run it for your own business
- ⚠️ If you modify and **host it as a service**, you **must** release your modifications under the same AGPLv3 license

See the [LICENSE](./LICENSE) file for full details.

---

## 🗺 Roadmap

See our full [Roadmap](./ROADMAP.md) for planned features including:
- Accounting Periods (closing the books)
- Multi-Currency with exchange rate tracking
- Bank Feed integrations
- `quickzhiin-lhdn` — Malaysia e-Invoice microservice
- `quickzhiin-peppol` — Global Peppol e-invoicing microservice

---

<div align="center">
Built with ❤️ by <a href="https://zenzhiin.com">ZenZhiin Venture</a>
</div>
