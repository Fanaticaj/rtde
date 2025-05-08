# Real‑Time Document Editor (RTDE)
# by: TitanTechs2.0(Anthony,Kyle,Jaytee,Michael,Christopher)

A starter template for building a real‑time collaborative text editor with Next.js (App Router) and AWS Amplify.  
Users can sign in (Cognito + social providers), read & update a shared document via AppSync GraphQL & DynamoDB, and receive live updates via GraphQL subscriptions.

---

## 🚀 Features

- **Authentication**  
  - Email/password and Sign in with Google
  - Secure routes with Amplify’s `<Authenticator>` component
- **API & Database**  
  - GraphQL CRUD API powered by AWS AppSync  
  - DynamoDB table for persistence
  - Realtime updates with GraphQL subscriptions
- **Framework**  
  - Next.js 14 (App Router + “use client” components)
  - TypeScript, Tailwind CSS
- **Infrastructure as Code**  
  - CDK / Terraform modules under `infra/`
  - Local sandbox support via `npx ampx sandbox`

---

## 📁 Repo Structure

```
/
├── amplify/                       # Amplify‑generated backend config & stubs
├── app/                           # Next.js “app” directory (pages & client components)
├── infra/terraform_security       # IaC for AWS resources (Cognito, AppSync, DynamoDB)
├── lib/                           # Shared React/utility code
├── public/                        # Static assets
├── amplify.yml                    # Amplify Console build settings
├── next.config.js                 # Next.js configuration
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE (MIT‑0)
└── SECURITY.md
```



---

## 🔧 Prerequisites

- [Node.js 20+](https://nodejs.org)  
- [Yarn](https://yarnpkg.com) or npm  
- AWS account & [Amplify CLI](https://docs.amplify.aws/cli/) (for sandbox)  
- (Optional) Join the free Amplify “sandbox” for zero‑config AWS resources:
  ```bash
  npm install -g @aws-amplify/cli
  npx ampx sandbox --once \
    --outputs-format json \
    --outputs-version 1 \
    --outputs-out-dir amplify


📥 Getting Started
Clone this repo

bash
Copy
Edit
git clone https://github.com/KyleParato/rtde.git
cd rtde
Install dependencies

bash
Copy
Edit
npm install
or
yarn install
Bootstrap AWS backend

If using the Amplify sandbox:

bash
Copy
Edit
npx ampx sandbox --once \
  --outputs-format json \
  --outputs-version 1 \
  --outputs-out-dir amplify
Otherwise, configure your Amplify project and run:

bash
Copy
Edit
amplify init
amplify push --yes
Configure your frontend

Confirm amplify/amplify_outputs.json is committed (it contains your API endpoints, Cognito settings, etc.)

In amplifyConfig.ts, import and pass it to Amplify.configure().

Run the development server

bash
Copy
Edit
npm run dev
or
yarn dev
Open http://localhost:3000 to view the editor.

📦 Available Scripts
dev: Next.js local dev server

build: Compile for production

start: Run the compiled app

amplify: Amplify CLI shortcut for local sandbox & push

☁️ Deployment
This repo is preconfigured for AWS Amplify Hosting. Simply connect your GitHub repo to Amplify Console and it will:

Install dependencies

Run amplify pull or npm run amplify:sandbox

Build & deploy both backend (AppSync, Cognito, DynamoDB) and frontend in one pipeline

See amplify.yml for the exact steps.

🤝 Contributing
Please read CONTRIBUTING.md for guidelines on code style, branch naming, and pull requests.

📜 License
This project is released under the MIT‑0 License. See LICENSE for details.

RTDE is maintained by TitanTechs2.0

**Feel free to iterate** on any section—rearrange or rename things to fit your workflow and naming conventions.