# What We Built (Explained Like You're 3)

## The Big Idea

ORACLE is a magic crystal ball on a website.

You ask it a question. Instead of writing words back, it shows you a moving picture — a tiny world that feels like your question.

- 🌊 Worried about money? It shows you an **ocean**.
- ⛈️ Worried about the stock market? It shows you a **storm**.
- 🌌 Asking about your dreams? It shows you **space**.
- 🏙️ Have too much homework? It shows you a **city**.

## My Job

Two of the four worlds belong to me:

- 🌌 **Cosmos** (space) — when you ask big "what's next" questions
- 🏙️ **City** — when you ask "I have so much to do" questions

The other two (Ocean, Storm) belong to teammates. I do not touch their toys.

## What's Inside the Cosmos

Imagine sitting in a spaceship looking out the window:

- **900 stars** zoom past you. The faster you ask, the faster they zoom.
- **Glowing clouds** float in the back (those are called nebulas). They change color depending on the mood:
  - 🟧 Warm orange = "good things are coming"
  - 🟡 Soft gold = "everything is calm"
  - 🟣 Cool purple = "we don't know yet"
- **Tiny dust** drifts around to feel like real space.
- **Star nodes connect with golden lines** — these are your numbers (like "happiness 80%" or "money 30%"). They look like a constellation in the sky.
- **Stars twinkle** so the sky feels alive.
- The robot brain (the AI) can also send custom colors and custom star shapes. The cosmos listens and changes.

## What's Inside the City

Imagine looking down at a city like in a video game:

- **64 buildings** in a grid. The taller a building, the more important that task is.
- **Windows light up and flicker** like real windows at night.
- **Cars drive around** as glowing streaks. The busier you are, the more cars there are.
- **The sky changes** based on mood:
  - 🌅 Sunset = chill productive day
  - 🌃 Blue night = busy city
  - 🟥 Red night = you're drowning, smog everywhere, traffic jam
- The most important buildings have **gold floating labels** above them with the task name.
- The far-away buildings have tiny window lights too — gives the city depth.

## What I Did Today

1. **Made the two scenes look beautiful** — colors, animations, glow.
2. **Fixed a sneaky bug** — when you asked a new question, the stars used to reset to the start. Now the animation keeps flowing smoothly.
3. **Fixed the city's depth** — buildings in the back used to cover buildings in the front. Now they're stacked correctly.
4. **Added "smart props"** — the robot brain can now send the cosmos:
   - Custom star positions (`nodes`)
   - Custom star connections (`connections`)
   - Custom colors per question (`palette`)
5. **Made it work on phones** — the city shrinks correctly on small screens.
6. **Saved memory** — the glowing clouds are now drawn once and reused, not every frame.
7. **Respect for people who don't like motion** — if your computer says "I don't like spinning things," the scenes stay still.

## What I Touched That Wasn't Mine

I had to touch two files outside my zone (sorry team!):

- `OracleLayout.tsx` — to test that my "smooth animation" fix works without the canvas resetting.
- `director.ts` — to make the first thing you see be a calm cosmos instead of a black screen.

I'll send a Discord message about this so nobody is surprised.

## What Still Needs to Happen Before We Submit

- [ ] **Connect the real AI brain** (Gemini with structured output). Right now `directOracle` is a stand-in — it picks scenes from keywords, not actual thinking.
- [ ] **Wire the CTA button** so clicking it asks a follow-up question. The locked plan calls this our "we are agentic, not just art" proof.
- [ ] **Polish OceanScene + StormScene** (teammates).
- [ ] **Hide the STRESS TEST button** in production builds (currently visible — bad for demo).
- [ ] **Deploy on Vercel** so the demo URL works.
- [ ] **Record the 2–3 minute demo video** with 3 rehearsed questions.
- [ ] **Submit on the global hackathon portal** before midnight PDT today.

## How To Run It

```bash
cd apps/frontend
npm install
npm run dev
# open http://localhost:3010
```

Type a question. Watch the world appear. That's it.
