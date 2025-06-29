# 🧠 Data Alchemist - Smart Data Validator & Rule Engine

**Data Alchemist** is an AI-enhanced data management tool for uploading, validating, correcting, and configuring datasets with smart business rules — specifically for managing **clients**, **workers**, and **tasks** in scheduling and workforce planning systems.

![Data Alchemist UI](./preview.png)

---

## 🚀 Features

### 📂 File Upload & Intelligent Header Mapping
- Supports `.csv` and `.xlsx` files for **clients**, **workers**, and **tasks**
- Automatically detects file type based on filename
- Uses **Gemini AI** to normalize and remap column headers to match canonical schema
- Fallback to heuristic mapping if AI fails

### 📊 Interactive Data Grids
- Inline editing for all data points
- Preset sliders for priority levels
- Row-wise error highlighting (malformed values, invalid JSON, duplicates, etc.)
- AI-powered **"Suggest Fix"** button to auto-correct problematic rows

### 🧪 Validation Engine
- Entity-level validation:
  - `Clients`: Priority range, JSON fields, duplicate IDs
  - `Workers`: Slot limits, skills format, group tags
  - `Tasks`: Duration checks, required skills, concurrency caps
- Cross-entity validation:
  - Reference integrity (e.g. client ↔ task ↔ worker mapping)

### 🔍 Natural Language Filtering
- Search using **natural language rules**
  - e.g., `PriorityLevel > 3`, `GroupTag = TAG2`
- Automatically parses user queries into filter rules
- Multi-condition support using `AND`

### 🧠 Rule Engine
- Add custom rules via UI for:
  - Co-run (`tasks` to be scheduled together)
  - Slot restriction (minimum shared availability)
  - Load limit (max slots per phase for a group)
  - Phase window (task allowed in specific phases)
- **Natural Language Rule Parsing**
  - Describe a rule like "Run T1 and T3 together"
  - AI converts it to structured config automatically

### ⚖️ Prioritization Panel
- Intuitive sliders to set weights for:
  - Priority
  - Fairness
  - Load Balance
- Preset buttons to auto-configure weights
- Total weight tracker ensures valid config

### 🤖 AI Rule Suggestions
- With one click, let AI suggest relevant business rules based on current dataset
- Helps enforce best practices and save manual effort

### 🧾 Data & Rules Export
- Export cleaned JSON versions of all entities
- Download validation error report
- Export `rules.json` with all configured rules and weights

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, ShadCN, TanStack Table
- **AI APIs**: Google Gemini (via `@google/genai`)
- **Data Parsing**: PapaParse (CSV), SheetJS (XLSX)
- **Validation & Logic**: Custom JS/TS validators + AI correction backend

---

## 📦 File Structure
  ![FILE_STRUCTURE](./public/Screenshot 2025-06-29 215840.png)


    ## 🧑‍💻 Setup

```bash
git clone https://github.com/your-org/data-alchemist.git
cd data-alchemist

# Install dependencies
npm install

# Create .env.local
echo "GEMINI_API_KEY=your-google-api-key" > .env.local

# Run the dev server
npm run dev