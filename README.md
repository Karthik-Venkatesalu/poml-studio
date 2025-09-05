````markdown
# POML Studio

> 🛠️ From raw text to orchestrated prompts — a visual studio for POML.

POML Studio is a standalone **React-based web app** that converts plain text prompts into structured [POML](https://microsoft.github.io/poml/latest/) (Prompt Orchestration Markup Language).  
Think of it as *Postman for prompt engineers* — paste messy instructions, watch them become clean `<Role>`, `<Task>`, `<Constraints>`, and `<OutputFormat>` blocks, ready to run and reuse.

---

## ✨ Features (planned)

- **Plain text → POML**  
  Paste or type any prompt, auto-detect Role, Task, Constraints, Examples, and Output format.

- **Interactive Inspector**  
  Side panel to edit extracted sections before generating final POML.

- **Live Preview**  
  Syntax-highlighted POML view with instant updates.

- **Linting & Guardrails**  
  Catch missing `<Role>`/`<Task>`, unresolved variables, or unsafe constraints.

- **One-click Refinements**  
  Buttons for “Make JSON-strict”, “Add Safety Rules”, or “Generate Example”.

- **Export / Import**  
  Save prompts as `.poml` files, reload them later, or share across teams.

---

## 🚀 Getting Started

### Clone and install
```bash
git clone https://github.com/your-username/poml-studio.git
cd poml-studio
npm install
````

### Run locally

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use POML Studio.

### Build for production

```bash
npm run build
```

---

## 🗂️ Project Structure

```
poml-studio/
  ├─ src/
  │   ├─ components/     # React UI (Editor, Preview, Inspector)
  │   ├─ parser/         # Plain text → semantic sections
  │   ├─ generator/      # Sections → POML emitter
  │   ├─ linter/         # Static checks
  │   ├─ hooks/          # State mgmt (usePoml, useLint, etc.)
  │   └─ App.tsx
  ├─ public/
  ├─ package.json
  └─ README.md
```

---

## 🧭 Roadmap

* [ ] MVP: Paste text → Generate & download `.poml`
* [ ] Inspector UI for editing sections
* [ ] Linting + Guardrail suggestions
* [ ] Preset OutputFormat styles (JSON, Markdown, CSV)
* [ ] Live model test (optional, with user-provided API key)
* [ ] Sharing via gists or permalinks

---

## 🤝 Contributing

Contributions are welcome!
If you have ideas for heuristics, linting rules, or UI improvements, open an issue or submit a pull request.

---

## 📜 License

MIT License © 2025 [Karthik Venkatesalu]

```