# Recipe sync checklist

Whenever a recipe changes in MelaRecipes (the master spreadsheet), propagate it to these files. They are NOT auto-generated — each one needs a manual edit.

1. `MakennaRecipeApp/src/data/recipes-seed.json` — master recipe text for the app.
2. `makenna-study-app/data/study-recipe-cards.json` — study app copy. Match by `drink` name; `id` does not need to match recipes-seed.json.
3. `MakennaEmployeePortal/web/src/data/study-recipe-cards.json` — portal copy. Keep its `id` in sync with #2 (same drink currently shares one id across these two files).
4. `makenna-barista-test/lib/recipe-fill-questions.json` and the portal's copy at `MakennaEmployeePortal/web/src/data/recipe-fill-questions.json` — ONLY add/update an entry if the recipe uses a pump-measured syrup, sauce, powder, or Kona Cloud cream from the controlled vocabulary in that file's `options` block. Recipes built from scoops/shots/drizzles/mix-ins outside that list (e.g. brown sugar scoops, cinnamon powder, honey drizzle) don't get a fill-in-the-blank entry.

Before adding a "new" entry, search all four files for the drink name first — it may already exist with stale recipe text that just needs updating in place, rather than a fresh insert (duplicate entries will result otherwise).
