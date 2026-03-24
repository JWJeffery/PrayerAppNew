# PrayerAppNew

## Horologion Data

### Orthros (Byzantine Matins)

**Current version:** v6.5

**Weekday Theotokion corpus** — COMPLETE  
All 48 slots (Tones I–VIII × Monday–Saturday) are fully transcribed and live.  
Source: Lambertsen, *The Octoechos*, Vols. I–IV, St. John of Kronstadt Press.  
Data path: `window.OCTOECHOS.orthros.theotokion.weekday.tones[tone][day]`  
Runtime resolution: `type:'text'`, `resolvedAs:'orthros-ordinary-weekday-theotokion-text'`. No rubric fallback. The previous null-sentinel scaffold has been retired.  
Wednesday and Friday correctly resolve as Stavrotheotokion by label; no separate resolver path is required.

**Remaining weekday corpus families** (null-sentinel scaffolds, awaiting source-secure transcription):  
`sessional-hymns`, `canon`, `praises`, `aposticha`

**Sunday corpora** — COMPLETE  
Resurrectional Praises (tones 1–8), Eothinon Exapostilarion (gospels 1–11), Sessional Hymns (tones 1–8), Resurrectional Canon (tones 1–8).
