# levimeyers.github.io
Early-stage OST guessing game website

Checklist is currently only for Deltarune (first game on the list). More will be added later
- <del>Navigation sidebar
- <del>Settings page:
  - <del>Chapter select
  - <del>Unlisted tracks toggle
  - <del>Multiple choice modes: track name, motif, location played
  - <del>Difficulties (multiple choice only): easy, medium, hard
  - <del>Text entry modes: track name, motif
  - <del>Number of rounds
- Repeatable game round page using data from settings + song info
  - Now playing...
  - Obscured -> track name with cool text shadow effect or something
  - Prompt: track name, motif, location played
  - Multiple choice: 3+ buttons, answer feedback on buttons after clicked
  - Text entry: entry box, answer feedback above after clicked
  - Non-case sensitive disclaimer
- Song info data scraped from mediawiki using REST API
- Song playback using leveraged bandcamp/spotify widget
- Get unlisted tracks manually(?)

Long-term:
- Collect other game data and create individual pages
- Switch index.html to game selection page
- Cross-platform multiplayer similar to Kahoot (will probably need to switch hosting service for this)
