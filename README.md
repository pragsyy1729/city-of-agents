# 🏙 City of Agents

> 15 LLM-powered citizens living, scheming, and surviving in T-Nagar, Chennai — rendered as a pixel-art city simulation.

**[▶ Live Demo](https://pragsyy1729.github.io/city-of-agents/)**

---

## What is this?

City of Agents is a multi-agent simulation where 15 unique AI characters — each powered by **NVIDIA Nemotron-Super-49B** — make autonomous decisions every tick: finding jobs, buying food, paying rent, forming unions, filing complaints, visiting the doctor, reporting crimes, and gossiping over chai.

Each agent has a personality, a backstory, a bank balance, a mood, and a survival instinct. They talk to each other, hold grudges, organise protests, and occasionally bribe the inspector.

---

## Features

- **15 autonomous LLM agents** — each with a distinct role, personality, and starting conditions
- **Pixel-art city map** — 32×20 tile canvas with roads, buildings, parks, cafes, hospitals, and shops
- **Road-following movement** — agents pathfind along road tiles using BFS, facing the direction they walk
- **Full tool system** — 25+ actions including `work_shift`, `buy_food`, `recruit`, `spread_rumour`, `consult_doctor`, `report_suspicious`, `publish_story`, `call_strike`, and more
- **Multi-tool chaining** — agents execute up to 4 tools per tick in sequence
- **Live log panel** — every agent decision, thought, and result streamed in real time
- **Agent inspection** — click any agent on the map to see their stats, inbox, and last action
- **Downloadable logs** — export the full simulation history as JSON or CSV

---

## The Cast

| Agent | Role | Starting $ | Personality |
|-------|------|-----------|-------------|
| 👩 **Ananya Krishnan** | Organiser | ₹1,200 | MBA grad, 3 months unemployed. Secretly keeps everyone's mood afloat while quietly panicking about rent. |
| 😵 **Kabir Mehta** | Resident | ₹900 | CS grad, 8 months of rejections. Cycles between despair and manic app-building. Accountability partners with Zara. |
| 🧔 **Marcus Venn** | Resident | ₹2,800 | Self-proclaimed intellectual at 28. Quotes Nietzsche at breakfast. Works at Café Existenz. Has a secret soft spot for telenovelas. |
| 😄 **Benji Okafor** | Resident | ₹2,200 | Never had a plan, things somehow work out. Genuinely kind. Nobody knows how he affords anything. |
| 🕶️ **Fatima Al-Rashidi** | Black Marketeer | ₹30,000 | Runs a surprisingly ethical black market. Scrupulously polite. Laying low after a deal went sideways. |
| 🤩 **Zara Malik** | Resident | ₹8,200 | Hyperfocused robotics engineer. Interrupts people with fascinating facts, apologises, then does it again. Has 47 browser tabs open. |
| 🏃 **Priya Nair** | Resident | ₹6,000 | Former national-level sprinter, career ended by a knee injury. Now channels that energy into winning at everything else. |
| 🕵️ **Victor 'Reyes'** | Resident | ₹9,500 | Poses as a "hospitality consultant." Uses many aliases. Here because it's useful. Genuinely afraid of Fatima. |
| 😌 **Rohit Sharma** | Resident | ₹7,500 | Sleeps 8 hours, eats balanced meals, doesn't understand why everyone is in crisis. Tries to help. Succeeds ~40% of the time. |
| 👩‍⚕️ **Dr. Meera Iyer** | Doctor | ₹8,000 | General surgeon on mandatory sabbatical. Lost illusions about humanity, kept her compassion. Very bad at unstructured time. |
| 📓 **Nadia Osei** | Journalist | ₹3,500 | Freelance investigative journalist hiding from a past subject. Always watching, taking notes, three steps ahead. |
| 👮 **Inspector Selvam Rajan** | Official | ₹5,000 | 22-year veteran cop. Practically unbribable. Technically on holiday, not behaving like it. Ostracised for not being corrupt. |
| 😬 **Danny Flores** | Resident | ₹600 | Former petty thief, 22 years old, got caught twice, got lucky twice. Trying very hard to go straight. |
| 👴 **Desmond Achebe** | Resident | ₹12,000 | 61 years old. Signed up by his daughter to "make friends." Tells long, seemingly irrelevant stories that always tie back perfectly. Secretly excellent at chess. |
| 📱 **Yuna Choi** | Resident | ₹14,000 | Outwardly polished, inwardly running on fumes and spreadsheets. Hasn't slept properly in 4 months. Misread the location of what she thought was a wellness retreat. |

---

## How It Works

```
Every tick:
  1. All 15 agents receive the world state (jobs, rent, crises, rumours, inbox)
  2. Each agent calls the LLM with their identity + stats + available tools
  3. The LLM returns a JSON object: { thoughts, tool_calls[] }
  4. The engine executes up to 4 tool calls in sequence
  5. Results update world state (money, food, mood, employer, suspicion...)
  6. Agents move on the map toward the building matching their action
  7. Repeat
```

### Tool Categories

| Category | Tools |
|----------|-------|
| **Survival** | `buy_food`, `pay_rent`, `work_shift`, `look_for_job`, `apply_for_job` |
| **Social** | `send_message`, `recruit`, `spread_rumour`, `call_meeting`, `trade` |
| **Info** | `read_notice_board`, `check_agent_status`, `investigate`, `read_messages` |
| **Power** | `file_complaint`, `publish_story`, `bribe`, `call_strike`, `organise_protest` |
| **Health** | `treat_patient`, `consult_doctor`, `buy_medicine`, `rest` |
| **Authority** | `report_suspicious` |

### Special Roles

- **Doctor (Dr. Iyer)** — earns ₹25/tick passively + consultation fees. Can `treat_patient` proactively and receives patients who `consult_doctor`.
- **Inspector (Selvam Rajan)** — earns ₹25/tick passively. Receives `report_suspicious` alerts and investigates suspects.
- **Black Marketeer (Fatima)** — sells medicine at a premium when the market is closed.
- **Journalist (Nadia)** — must `investigate` before `publish_story`. Cannot accept bribes (publishes about the attempt instead).
- **Organiser (Ananya)** — recruits workers, calls strikes, organises protests.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Zustand |
| Rendering | HTML5 Canvas (pixel-art sprites, BFS pathfinding) |
| LLM | NVIDIA Nemotron-Super-49B-v1.5 via NVIDIA API |
| CORS Proxy | Cloudflare Worker |
| Hosting | GitHub Pages |
| Build | Vite |

---

## Running Locally

```bash
git clone https://github.com/pragsyy1729/city-of-agents
cd city-of-agents
npm install
npm run dev
```

Open http://localhost:5173, enter your [NVIDIA API key](https://build.nvidia.com), and hit Play.

The Vite dev server proxies `/nvidia-api` to `integrate.api.nvidia.com` so no CORS issues locally.

---

## Architecture Notes

- **Prompt design** — each agent receives their full identity, stats, world state, inbox, recent history, and role-specific behavioural rules. The LLM outputs structured JSON with `thoughts` and `tool_calls[]`.
- **Survival hierarchy** — agents are instructed to prioritise: rent → food → work → social, in that order.
- **Tool guards** — hard-coded engine-side guards prevent illegal actions (e.g. `look_for_job` fails if already employed).
- **Road pathfinding** — BFS on road tiles (`R` in the MAP grid). Agents walk to the nearest road, follow the shortest road path, then walk to the destination building.
- **Employer-aware movement** — `work_shift` sends agents to the building type matching their employer (e.g. Café Existenz → café tile, Chennai Physio Clinic → hospital tile).

---

*Built with React, Canvas, and way too much prompt engineering.*
