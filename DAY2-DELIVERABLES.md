# Day 2 — Hook + Agent Observability

## Custom Hook
- PostToolUse hook
- Matcher: Write|Edit
- Automatically runs npm run build after editing .js, .jsx or .css files
- Hook file: .claude/hooks/post-edit-build.cjs
- Configuration: .claude/settings.json

## Hook Test
- Tested by editing src/App.jsx
- PostToolUse hook fired automatically
- npm run build ran automatically
- Vite build completed successfully
- Temporary test change was removed afterward

## Built-in Subagent
- Used Claude Code's built-in Explore subagent
- Investigated the /recipes/chicken-biryani route
- Inspected the relevant RecipeHub files
- Did not modify project files

## Agent Observability
- Used Agents Observe v0.9.12
- Docker runtime was used
- Agents Observe captured the Explore subagent activity
- Activity included subagent start and multiple file-read/tool events

## Evidence
- Screenshot: screenshots/agents-observe-subagent.png
