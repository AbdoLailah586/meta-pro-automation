<div align="center">

# ⚡ Meta Pro Marketing Suite & WhatsApp Pro CRM
### 🌐 Unified Omnichannel Marketing & Social Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Meta Graph API](https://img.shields.io/badge/Meta_API-v26.0-0866FF?style=for-the-badge&logo=meta&logoColor=white)](https://developers.facebook.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp_Pro-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com)
[![Neon DB](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Railway-Live-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)
[![OpenRouter](https://img.shields.io/badge/AI_Powered-OpenRouter-6366F1?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

<p align="center">
  <b>Publish once. Broadcast everywhere.</b><br/>
  An enterprise-grade, omnichannel automation suite designed to compose, schedule, and simultaneously broadcast high-converting marketing campaigns across <b>Facebook Pages</b>, <b>Instagram Professional Accounts</b>, and <b>WhatsApp Audiences</b> with built-in AI copywriting and unified cloud analytics.
</p>

---

[🚀 Quick Start](#-quick-start) •
[✨ Core Features](#-core-features) •
[🏛️ Architecture](#%EF%B8%8F-system-architecture) •
[🗄️ Neon Database](#%EF%B8%8F-unified-neon-database) •
[📱 WhatsApp Engine](#-whatsapp-pro-crm-bridge) •
[☁️ Deployment](#%EF%B8%8F-cloud-deployment) •
[🔑 Meta API Setup](#-meta-graph-api-v260-setup)

---

</div>

<br/>

## ✨ Core Features

<table>
  <tr>
    <td width="50%">
      <h3>📢 Omnichannel Unified Composer</h3>
      <ul>
        <li><b>Simultaneous Multi-Platform Dispatch</b>: Publish to Facebook + Instagram + WhatsApp in one click.</li>
        <li><b>Dynamic Live Device Mockups</b>: Real-time interactive previews for Facebook Feed, Instagram Post, and WhatsApp Dark Chat Bubble with blue double checks <code>✓✓</code>.</li>
        <li><b>Smart Link Sanitizer</b>: Automatically optimizes post captions for Instagram's bio link policies while preserving URLs for Facebook & WhatsApp.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🤖 Free OpenRouter AI Marketing Suite</h3>
      <ul>
        <li><b>Top-tier Open Models</b>: Native integration with <code>Llama 3 8B</code>, <code>Gemini 2.0 Flash</code>, and <code>DeepSeek R1</code>.</li>
        <li><b>Preset Marketing Angles</b>: 1-click generation for Viral Hooks, Limited-time Offers & CTAs, Educational Value, and High-engagement Polls.</li>
        <li><b>Image AI Generation</b>: Generates matching ad visual prompts and direct image mockups.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📱 WhatsApp Pro CRM Bridge</h3>
      <ul>
        <li><b>549+ Customer Reach</b>: Directly queries and broadcasts to the active contacts database in Neon PostgreSQL.</li>
        <li><b>Anti-Ban Safeguards</b>: Randomized jitter and throttling delay mechanisms prevent spam detection.</li>
        <li><b>Railway Live Daemon Integration</b>: Seamlessly talks to the Baileys WebSocket microservice hosted on Railway.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 Unified Analytics & Cloud Calendar</h3>
      <ul>
        <li><b>Interactive Content Calendar</b>: Plan, reschedule, edit, and trigger scheduled posts with a visual timeline.</li>
        <li><b>Live Post Metrics</b>: Track organic reach, impressions, likes, comments, and shares directly from Meta Graph API.</li>
        <li><b>Cloud Dual-Sync Engine</b>: Neon Cloud PostgreSQL with seamless zero-downtime offline fallback.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏛️ System Architecture

```mermaid
graph TD
    User([👤 Marketing Manager]) -->|Composes Campaign| Frontend[💻 Next.js 14 Web Dashboard]
    
    subgraph Core Application Engine
        Frontend --> Composer[Unified Omnichannel Composer]
        Composer --> AIMaster[🤖 OpenRouter AI Assistant]
        Composer --> MockupPreview[📱 Live Interactive Previews]
        Composer --> CloudDB[(🐘 Neon PostgreSQL Cloud)]
    end
    
    subgraph Multi-Channel Dispatch Engine
        Composer -->|Meta Graph API v26.0| FacebookPage[📘 Facebook Official Page]
        Composer -->|Content Publishing API| InstagramPro[📸 Instagram Business Account]
        Composer -->|REST Bridge & DB Pipeline| WhatsAppBridge[⚡ WhatsApp Pro CRM Service]
    end
    
    subgraph WhatsApp Infrastructure
        WhatsAppBridge --> RailwayDaemon[🚂 Railway Persistent Daemon]
        RailwayDaemon --> Baileys[📲 WhatsApp Web Protocol]
        Baileys --> Contacts[👥 549+ Targeted Contacts]
    end
    
    subgraph Shared Data Layer
        CloudDB <--> meta_settings[⚙️ meta_settings]
        CloudDB <--> meta_campaigns[📈 meta_campaigns]
        CloudDB <--> meta_posts[📝 meta_posts]
        CloudDB <--> contacts_table[📇 public.contacts]
    end
```

---

## 🗄️ Unified Neon Database

Both **Meta Pro Suite** and **WhatsApp Pro CRM** share a high-performance **Neon Cloud PostgreSQL** cluster:

| Table Name | Primary Role | Key Columns |
| :--- | :--- | :--- |
| `public.meta_settings` | Cloud Meta tokens & AI API keys | `id`, `settings_json`, `updated_at` |
| `public.meta_campaigns` | Marketing campaigns & target goals | `id`, `name`, `status`, `budget`, `platforms` |
| `public.meta_posts` | Post content, schedule, media & IDs | `id`, `content`, `platforms`, `scheduled_at`, `status`, `meta_post_ids` |
| `public.contacts` | WhatsApp Pro targeted customer list | `phone_number`, `name`, `tags`, `is_active` |

---

## 📱 WhatsApp Pro CRM Bridge

The custom bridge located at `lib/whatsappBridge.js` guarantees high availability and robust broadcast delivery:

1. **Direct Database Sync**: Reads active targeted leads from `public.contacts` (549+ active customer records).
2. **REST API Dispatch**: Dispatches the broadcast payload directly to the live Railway worker:
   ```bash
   POST https://whatsapp-pro-crm-production-613b.up.railway.app/api/campaigns
   ```
3. **Queue Fallback**: If the live daemon is momentarily offline, campaigns are persisted in the shared cloud queue with scheduled triggers so no marketing messages are ever lost.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/AbdoLailah586/meta-pro-automation.git
cd meta-pro-automation
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database and API endpoints:
```ini
# Neon Cloud PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_Cpfy34RkcLbX@ep-morning-block-b20747cx-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# WhatsApp Pro CRM Railway Daemon
WHATSAPP_SERVER_URL="https://whatsapp-pro-crm-production-613b.up.railway.app"

# Optional: OpenRouter AI Key
OPENROUTER_API_KEY="sk-or-v1-..."
DEFAULT_AI_MODEL="meta-llama/llama-3-8b-instruct:free"
```

### 3. Install & Run Locally
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> [!TIP]
> **Windows Users**: You can start the app instantly with a single double-click on:
> 📂 `تشغيل_البرنامج.bat`

---

## ☁️ Cloud Deployment

### Option A: Vercel (Recommended for Meta Pro Web Dashboard)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `WHATSAPP_SERVER_URL`: Your Railway WhatsApp Pro endpoint.
   - *(Optional)* `OPENROUTER_API_KEY`.
3. Click **Deploy** — your Next.js serverless app goes live across global Edge CDN in under 60 seconds!

### Option B: Railway (Container Deployment)
1. In [Railway.app](https://railway.app), click **New Project** → **Deploy from GitHub repo**.
2. Select `meta-pro-automation`. Railway automatically detects the included `Dockerfile` and `railway.json`.
3. Set your environment variables in the Railway dashboard.

---

## 🛠️ One-Click GitHub Push Script

This repository includes custom Windows Batch and PowerShell deployment automation scripts:

- 🪟 **`push_to_github.bat`**: Double-click, paste your repository URL, and let the script initialize git, stage changes, commit, and push automatically.
- 💻 **`push_to_github.ps1`**: Modern UTF-8 PowerShell script with colored logging and error handling.

---

## 🔑 Meta Graph API (v26.0) Setup

<details>
<summary><b>Click here to view Meta App & Token configuration steps</b></summary>

1. Navigate to **[Meta for Developers](https://developers.facebook.com)** and sign in.
2. Go to **My Apps** → **Create App** → Select **Business** application type.
3. Open **Tools** → **[Graph API Explorer](https://developers.facebook.com/tools/explorer/)**.
4. Select your app in the dropdown and choose **Get Page Access Token**.
5. Ensure the following permissions are approved:
   - `pages_manage_posts` (Required for publishing to Facebook Pages)
   - `pages_read_engagement` (Required for viewing feed interactions)
   - `instagram_basic` (Required for fetching Instagram account info)
   - `instagram_content_publish` (Required for publishing posts to Instagram)
   - `business_management`
6. Click **Generate Access Token**.
7. In the Meta Pro Dashboard, navigate to **Settings** → **Meta Credentials** and paste your Page ID & Page Access Token.

</details>

---

## 🛡️ Tech Stack & Dependencies

- **Frontend & Framework**: [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [Lucide React](https://lucide.dev/)
- **Database Engine**: [Neon Cloud Serverless PostgreSQL](https://neon.tech/) with `pg` connection pool
- **AI Acceleration**: [OpenRouter](https://openrouter.ai/) (Llama 3, Gemini 2.0 Flash, DeepSeek R1)
- **Social Graph APIs**: Meta Graph API v26.0 (Pages API, Instagram Graph API)
- **Messaging Protocol**: WhatsApp Web Multi-Device Protocol via Baileys WebSocket Daemon

---

<div align="center">

Made with ❤️ by **[Abdulrahman Reda](https://github.com/AbdoLailah586)**  
*Omnichannel Marketing Automation & Enterprise CRM Solutions*

</div>
