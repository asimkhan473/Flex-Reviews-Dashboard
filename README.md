# Flex Living – Reviews Dashboard & Public Page (v3, complete bundle)

## Contents
- index.html — light, minimal Flex-style dashboard & public page (upload JSON).
- server.js — Express API: GET /api/reviews/hostaway (normalizes; mock fallback).
- mock-reviews.json — includes Hostaway example (Shane Finkelstein).
- assets/ — stock images mapped to listing names.
- package.json — includes a "start" script.

## Run
```bash
cd flex_living_reviews_project_v3_complete
npm install
npm start
# open http://localhost:3000/index.html
```
(If you want Hostaway live data)
```bash
export HOSTAWAY_ACCOUNT_ID=61148
export HOSTAWAY_API_KEY=YOUR_KEY
npm start
```
