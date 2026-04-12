# Curriculum Integration TODO

## Current Status
- [x] curriculum.json created (needs validation)
- [ ] Lesson page updated to use curriculum.json
- [ ] Level listing pages updated  
- [ ] Learn overview page updated
- [ ] Visual components for new card types
- [ ] Testing complete

## Step 1: Validate curriculum.json
```
read_file src/data/curriculum.json
```

## Step 2: Update Lesson Page Component
**File:** `src/app/[locale]/learn/[level]/[lesson]/page.tsx`
```
Replace individual imports + switch statement with:
import curriculum from "@/data/curriculum.json"
Map JSON cards → LessonCard format
```

## Step 3: Update Level Pages
**Files:** 
- `src/app/[locale]/learn/[level]/page.tsx`
- `src/app/[locale]/learn/page.tsx`

## Step 4: Test
```
npm run dev
Navigate: /en/learn/level2/l2-1
Verify content loads from new JSON
