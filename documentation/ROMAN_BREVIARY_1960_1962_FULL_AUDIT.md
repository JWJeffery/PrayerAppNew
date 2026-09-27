# Roman Breviary 1960/1962 — Full Content Audit

**Status:** ACTIVE — first full pass, 2026-09-27.
**Authorization.** This lane's own architecture doc (`ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md` §15)
bars a broad audit campaign and limits audits to five narrow checks (see
`ROMAN_BREVIARY_1960_1962_AUDIT.md`). **Josh explicitly overrode that restriction**: "I don't care
what the docs say I am authorizing a full complete audit. Document every single deficiency, and
then propose fixes." This document is that full audit, done under that explicit authorization.
§15's own restriction stands for future sessions unless Josh says otherwise again — this is a
one-time authorized exception, not a standing repeal, and is noted as such in the architecture doc.

**Scope.** The lane's entire existing corpus: the dev vertical slice, one day (2026-11-02, All
Souls), one hour (Matins). There is nothing else built yet to audit.

**Method — deliberately deeper than "compare against the mirrored office file."** Reading just
`Sancti/11-02.txt` and `Commune/C9.txt` (as the narrow-check pass did) cannot catch a structural
omission — a piece that should exist but doesn't leaves no trace in the file that IS being read. So
this pass went further:

1. Read both source files **in full**, not spot sections, including the `[Rule]` blocks that the
   narrow-check pass never had reason to open.
2. **Read the actual Divinum Officium Perl engine** (`web/cgi-bin/horas/specmatins.pl` and related
   modules, cloned read-only from the primary source repo — not the pinned mirror, which by design
   holds only data files, not the engine) to resolve every `[Rule]` directive whose meaning wasn't
   obvious from the data file alone, rather than guessing from rubric-keyword vocabulary.
3. Attempted to cross-check the actual rendered Nov 2 / Rubrics 1960 Matins output from
   `divinumofficium.com` directly — **blocked by Cloudflare** (403, bot-protection) even through a
   real headless-Chromium session; this was not pursued further (respecting the site's access
   controls, not attempting to circumvent them). Where this would have given definitive proof, the
   finding below is marked as resting on source/engine reading, not live-output confirmation.
4. **Verified every one of the 26 (now 29) units' extracted text against its declared source
   section programmatically** — not spot checks — to rule out any parsing/extraction bug across the
   whole corpus, not just the units already checked in the prior pass.
5. Fixed what the source and engine reading resolved unambiguously; disclosed, not guessed, what
   still depends on a source this session doesn't have (a live oracle response, or a printed
   1960/1962 Breviarium Romanum).

---

## Summary table

| # | Finding | Status |
|---|---|---|
| 1 | Conclusio's `&Gloria` macro was left unresolved (diagnostic-only, no text shown) | **FIXED, then CORRECTED, 2026-09-27 continued yet further — the first fix used the wrong text** |
| 2 | Per-nocturn "Pater totum secreto" rubric (required by `[Rule]`'s "Limit Benedictiones") was missing entirely | **FIXED** |
| 3 | `[Rank]` ambiguity — two candidate ranks, "Duplex" vs "I. classis" | **Investigated — not a defect** |
| 4 | `[Rule]`'s bare "Responsory9" line | **Investigated — not a defect (inert annotation)** |
| 5 | `[Initial]`'s Pater/Ave omission under rubric 1960 | **Investigated — confirmed correct as built (by omission)** |
| 6 | `[Oratio Matutinum]` (Matins' own collect) not built | **FIXED** — confirmed via `orationes.pl`'s `oratio()`, not an outside source |
| 7 | 3 of 6 scripture-reading units differ from the plain Vulgate text | **FULLY RESOLVED, 2026-09-27 continued yet further — all three confirmed correct** |
| 8 | Antiphon-doubling convention (full antiphon before *and* after the psalm on higher ranks) not modeled | **Disclosed — minor, presentational** |
| 9 | Every unit's extracted text verified against its declared source section | **PASS — no extraction defects found** |

---

## 1. Conclusio's `&Gloria` macro — FIXED, then CORRECTED, 2026-09-27 continued yet further

**The defect.** `[Conclusio]` in `Sancti/11-02.txt` reads `!Conclusio specialis / &Gloria / V.
Requiéscant in pace. / R. Amen.` The `&Gloria` macro was left completely unresolved by the
generator — not fabricated, but not shown either: the unit's own `display_diagnostics` said
`"unresolved-divinum-macro... &Gloria"`, and the rendered Conclusio showed only the two-line
dismissal, silently missing the doxology that belongs before it.

**Original fix (WRONG — see correction below).** This pass originally reasoned: "the Gloria Patri
is not office-specific or variable content — it is the single fixed doxology said everywhere in the
Roman rite," and resolved `&Gloria` to the standard Gloria Patri text from
`Psalterium/Common/Prayers.txt`'s `[Gloria]` section. **That "everywhere" claim was false** — the
whole point of a Requiem office is that Gloria Patri is *not* said; this is a well-known Roman-rite
mourning convention this pass simply didn't check for at the time.

**How the error was caught.** Building the full oracle-based generation pipeline (see the new
`ROMAN_BREVIARY_1960_1962_BUILDOUT.md`) — which runs Divinum Officium's own Perl engine offline and
compares its real output against this hand-built content, rather than trusting a hand-trace of the
rubric — showed the real, engine-computed Conclusio has **no Gloria Patri text at all**. Reading
`web/cgi-bin/horas/horasscripts.pl`'s `sub Gloria` directly confirms why:
```perl
sub Gloria : ScriptFunc {
  ...
  if ($rule =~ /Requiem gloria/i) { return prayer('Requiem', $lang); }
  ...
}
```
`Sancti/11-02.txt`'s own `[Rule]` block contains exactly the line `Requiem gloria`. So `&Gloria` in
this specific office resolves to the *Requiem substitute* (`prayer('Requiem', $lang)`), not the
standard doxology — matching the ordinary Roman-rite practice that a Requiem replaces "Glory be to
the Father" with "Eternal rest grant unto them, O Lord" throughout.

**Correction.** `REQUIEM_GLORIA_SUBSTITUTE_TEXT` (`Psalterium/Common/Prayers.txt`'s `[Requiem]`
section: "V. Réquiem ætérnam \* dona eis, Dómine. / R. Et lux perpétua \* lúceat eis.") replaces the
Gloria Patri text in the `conclusio-doxology` unit; the block's label changed from "Gloria Patri" to
"Réquiem ætérnam (in loco Gloria Patri)" so the label doesn't claim content that isn't there. The
unit's `source.section` now cites `Requiem`, not `Gloria`, and records the `Requiem gloria` rule
that governs the choice. Verified against the oracle's own rendered text (word-for-word match,
including the `*` mediant markers) and against `checks 1-5` of the narrow-check audit (still 0
failing) and a live headless-Chromium render (correct text visible, zero console errors).

**The lesson.** "This content is fixed and used everywhere" is exactly the kind of claim that needs
checking, not assuming — the same discipline already applied to scripture-text variants (finding 7)
should have been applied here from the start. Caught by building an independent oracle rather than
trusting a second hand-trace of the same rubric text.

---

## 2. Missing "Pater totum secreto" rubric (one per nocturn) — FIXED

**The defect, and why it needed the engine, not just the data file, to resolve.** `Sancti/11-02.txt`'s
`[Rule]` includes `Limit Benedictiones Oratio`. Read in isolation, this reads like "use a reduced set
of blessings" — which is what this document's own narrow-check-pass predecessor assumed when it
first flagged this as an open question. Reading `web/cgi-bin/horas/specmatins.pl`'s `lectiones()`
subroutine (the actual code that "collects and prints the Benedictio," per its own header comment)
shows the real behavior:

```perl
if ($rule !~ /Limit.*?Benedictio/i && $version !~ /Cist/i) {
    ... # full Absolutio + per-lesson "Jube domne" + Benedictio ritual
} elsif ($version !~ /Cist/i || $rule =~ /Matutinum Romanum/i) {
    push(@s, "\$Pater totum secreto") ...
}
...
if ($rule !~ /Limit.*?Benedictio/i) {
    push(@s, prayer('Jube domne', $lang));
    push(@s, "Benedictio. $a[$i]", '$Amen');
    ...
}
```

Our `[Rule]` string contains "Limit Benedictiones", so `$rule =~ /Limit.*?Benedictio/i` **matches**,
meaning `$rule !~ ...` is **false** both times. That skips the entire per-lesson "Jube, domne,
benedícere" + blessing-response ritual (which would otherwise run 9 times, differently worded per
nocturn) and replaces it with a single `$Pater totum secreto` push — called once per nocturn, before
that nocturn's lessons begin (confirmed from the calling code: `nocturn(...); lectiones($_, ...)`
runs once per nocturn number, in that order). "Limit Benedictiones" does not mean "a limited set of
blessings" — it means the customary blessing ritual is replaced by a single silent Our Father, three
times total (once per nocturn), not nine.

`$Pater totum secreto` itself resolves (via `web/www/horas/Latin/Psalterium/Common/Rubricae.txt`,
`[Pater totum secreto]`) to a **rubric**, not prayer text to display in full — the source itself
marks it with the file's own `/:...:/ ` rubric-text convention:
> « Pater Noster » dicitur totum secreto.

**Fix.** Added a new `nocturnus{N}.pater-secreto` unit per nocturn (`kind: rubric`, text transcribed
verbatim including the guillemets), and a new manifest block per nocturn (`role: rubric`, label
"Pater Noster"), placed after that nocturn's Versiculum and before its first Lectio — matching the
engine's own build order exactly. Three new units, three new blocks, one per nocturn.

**What this fix deliberately does not attempt.** It does not print the Pater Noster's full text
(the rubric says it is said *silently*, so there is nothing to display beyond the instruction
itself — printing invented "silent" text would be exactly the fabrication this project's own
discipline forbids). It also does not attempt to model the *skipped* Benedictiones text at all
(which specific blessing-formula variant from `Psalterium/Benedictions.txt` would have applied is
now moot — they're not used under this rule — so the earlier ambiguity between the Roman/Dominican/
monastic blessing-line variants in that file never needed resolving).

---

## 3. `[Rank]` ambiguity — investigated, not a defect

`Sancti/11-02.txt` has two `[Rank]` blocks: a bare `[Rank]` ("Duplex") and `[Rank] (rubrica 196)`
("I. classis"). The build already uses "I. classis" (hardcoded in the generator, with no recorded
justification before this pass). Investigated whether `(rubrica 196)` is a truncated/malformed
rubric-year flag (a real defect, possibly upstream) or a genuine Divinum Officium convention:

- Grepped the full `DivinumOfficium/divinum-officium` repo (cloned read-only for this session):
  `(rubrica 196)` appears **122 times** across many unrelated `Sancti` files, consistently as a bare
  3-digit form — not a one-off. `(rubrica 195)` (4 occurrences) and `(rubrica 193)` (2 occurrences)
  exist the same way. Meanwhile fully-specified 4-digit forms (`rubrica 1960`: 99 occurrences;
  `rubrica 1962`: 9 occurrences) also exist elsewhere, including in this same file
  (`(rubrica 1955 aut rubrica 1960) No prima Vespera`, two lines below the ambiguous one).
- Conclusion: `(rubrica 19X)` is a genuine, deliberate **decade-family flag** (matching any rubric
  year beginning `19X`), distinct from a specific-year flag. This is exactly the family this lane's
  own `rubrics_1960_1962` scope falls under, and matches the well-documented 1960 Rubricae reform's
  replacement of the old Duplex/Semiduplex hierarchy with the I-IV classis system for many feasts.
- **The build's existing choice ("I. classis") is correct for a 1960/1962-rubric build.** Not
  fixed because nothing was wrong; the generator source now needs no change here. Recorded so a
  future session doesn't reopen this as if it were still unresolved.

---

## 4. `[Rule]`'s bare "Responsory9" line — investigated, appears inert

The same `[Rule]` block includes a bare line reading `Responsory9`. Two candidate readings: (a) an
active rule keyword the engine matches against (like "9 lectiones", which the code does
regex-match: `$rule =~ /9 lectiones/i`), or (b) an annotation. Grepped `specmatins.pl` for any
`$rule =~ /Responsory9/` pattern: **none exists.** The only code references to `Responsory9` are
`exists($winner{Responsory9})` — a check for a `[Responsory9]` **section** (which does exist, in
`Commune/C9.txt`, and is the section our own `responsorium9` unit already correctly resolves from —
see finding 9), unrelated to `[Rule]`-text parsing. Grepping the wider `Sancti/` corpus for other
files using this same `[Rule]`-text line found none. Conclusion: this line does not appear to drive
any engine behavior — it reads as a documentary annotation (confirming a `[Responsory9]` section is
in use, as opposed to the file's own alternate `[Responsory91]` section) rather than an active
directive. No build action needed; already correctly resolves the right section regardless.

---

## 5. `[Initial]`'s Pater/Ave omission under rubric 1960 — confirmed correct

`[Initial]` specifies the opening Pater Noster/Ave Maria, then `(sed rubrica 1960 aut rubrica
innovata omittuntur)` — under 1960 (or later "innovated") rubrics, this opening is omitted entirely.
No unit or block for this Initial content exists in the current build. Given this lane's own
`edition_or_recension` is `rubrics_1960_1962`, the omission is correct, and was arrived at (whether
deliberately or by the generator simply never having built it) in a way that happens to match the
source's own instruction. Recorded as confirmed-correct rather than left as an unexplained gap a
future reader might wrongly try to "fix" by adding the Pater/Ave back in.

---

## 6. `[Oratio Matutinum]` (Matins' own closing collect) — FIXED, 2026-09-27 continued further

**Originally disclosed as genuinely open** (see the account below, preserved for the record) after
`specmatins.pl` and `horascommon.pl` turned up no `Oratio`-building call, suggesting the content
might belong to Lauds' own (not-yet-built) ending instead of standalone Matins.

**Resolved by reading one more file, not by any outside source.** `web/cgi-bin/horas/specials/
orationes.pl`'s `oratio()` subroutine — the generic per-hour collect builder, called from a shared
item-processing loop (`specials.pl`) that every hour (including Matins) runs through — contains an
explicit branch:

```perl
if ($hora eq 'Matutinum' && exists($winner{'Oratio Matutinum'})) {
    $w = $w{'Oratio Matutinum'};
}
```

This proves Matins does print its own closing collect, resolving `[Oratio Matutinum]` exactly as
our source file already names it. The earlier "no `Oratio` call in `specmatins.pl`" finding was a
true observation that led to a wrong inference — the generic collect logic lives in `orationes.pl`
and is shared across hours, not duplicated inside each hour's own specialized module the way the
lesson/blessing logic is.

**A genuine wrinkle found while confirming this, disclosed rather than silently decided.**
`[Oratio Matutinum]`'s own `&Dominus_vobiscum` versicle macro (`web/cgi-bin/horas/horasscripts.pl`)
branches on a `$priest` flag: the priest form is "V. Dóminus vobíscum. R. Et cum spíritu tuo."; the
lay form is "V. Dómine, exáudi oratiónem meam. R. Et clamor meus ad te véniat." This dev slice has
no priest/lay preference concept at all. **Defaulted to the lay form** as the more broadly
applicable case for a general prayer app audience — an explicit, disclosed simplification, not a
claim that the priest form doesn't exist or doesn't matter. Revisit this default if/when the lane
ever gains a user-role concept.

**Fix.** New `rb1960.la.sancti.11-02.oratio-matutinum` unit (`kind: prayer`) combining the lay-form
versicle with `Commune/C9`'s `[Oratio_Fid]` text, and a new `role: prayer` manifest block
("Oratio"), placed after the ninth responsory and before the Gloria Patri/Conclusio pair — matching
where `oratio()` fires relative to the rest of the hour's structure. Extended
`normalizeDivinumDisplayText` with two more universal-macro cases (`$Oremus`, `$Qui vivis`),
transcribed verbatim from the already-mirrored `Psalterium/Common/Prayers.txt`, the same treatment
the pre-existing `$Requiem` case already got — these will recur in any future office built, not just
this one.

**Verified**: `node --check` clean; the narrow-check audit still passes all five checks; live-verified
in headless Chromium — the new "Oratio" block renders in the correct position (after Responsorium IX,
before Gloria Patri) with the full resolved text, zero new console errors.

### Original account, preserved for the record

`Sancti/11-02.txt` defines `[Oratio Matutinum]` (`&Dominus_vobiscum` + `@Commune/C9:Oratio_Fid`,
resolving to "Fidélium, Deus, ómnium Cónditor et Redémptor..."). No unit or block for it exists in
the current build, and `[Rule]`'s "Limit ... Oratio" does not say to omit it outright (only to
"limit" it — the same word that, per finding 2, turned out to mean "replace with something simpler,"
not "omit").

**What this pass could establish, and what it couldn't.** Searching `specmatins.pl` and
`horascommon.pl` for how a generic hour's closing collect gets resolved (hoping to find whether
Matins itself invokes an `Oratio` section, the way `lectiones()` explicitly handles Benedictiones)
found no `Oratio`-building call inside `specmatins.pl` at all. That's suggestive — in choir
practice, Matins and Lauds are prayed as one continuous unit and only one closing collect is said,
after Lauds, so `[Oratio Matutinum]`'s content may belong to *Lauds'* own build path (which doesn't
exist yet in this repo) rather than to Matins alone — but this pass could not find the Lauds-side
code that would confirm it (a broader Perl-engine search than was practical in this pass), and the
live oracle that would have settled it definitively was unreachable (Cloudflare-blocked, per the
Method section above).

**Not fixed, not guessed — at the time.** Per Josh's own standing instruction from the prior pass
(verify content questions against a real source rather than ruling from two competing readings),
this was recorded as open, not resolved either way. It turned out the actual resolution needed
neither a printed source nor the Lauds module — just reading one more already-available file
(`orationes.pl`) that the first pass hadn't opened yet.

---

## 7. Three scripture-reading text variants — FULLY RESOLVED, 2026-09-27 continued yet further

**Original finding** (from the prior narrow-check + sourcing pass,
`ROMAN_BREVIARY_1960_1962_AUDIT.md`'s addendum): `lectio1` (Job 7:16), `lectio7` (1 Cor 15:12), and
`lectio8` (1 Cor 15:44) each differ from the plain Vulgate text now held in
`data/bible/translations/vulgate-clementine`, and no independent source had yet been found to rule
on whether that's ordinary lesson-trimming or a real error. Recorded as open, needing a printed
source, and left there for two further passes.

**What resolved it.** Josh found and uploaded two real printed sources: a 4.4MB RTF full-text
download (`Breviarium_Roman.rtf`, confirmed to be the *Pars Hiemalis et Verna* volume — wrong
season for Nov 2, not usable for this) and, after that, a second file,
`breviariumromanu04cath_0_hocr_searchtext.txt.gz` — the OCR text of archive.org item
`breviariumromanu04cath_0`, a Benziger Brothers *Breviarium Romanum*, confirmed by its own title-page
OCR to be the ***Pars Autumnalis*** (Autumn volume) — the correct season for All Souls' Day.
Decompressed to `/tmp/brev04.txt` (19,658 lines) and searched directly, this volume's own
`Officium Defunctorum` common/votive section (starting around its printed page 187, "AD MATUTINUM")
contains all nine Matins lessons of the ordinary (ferial/votive) Office of the Dead, verbatim,
entirely from Job (7, 10, 10, 13, 11, 14, 17, 19, 10 — matching `Commune/C9.txt`'s own `Lectio1`
through `Lectio9` exactly, including the missing-`Domine`-conjunction detail below).

**Sub-finding A — `lectio1` / Job 7:16, now CONFIRMED CORRECT byte-for-byte.** The printed volume's
Lectio i reads (OCR, with plain-text `d` misreading an initial cap `P`): *"arce mihi, Domine, nihil
enim sunt dies mei. Quid est homo, quia magnificas eum? ... Ecce nunc in pulvere dormiam: et si mane
me quaesieris, non subsistam."* This matches `Commune/C9.txt`'s `[Lectio1]` (`"Parce mihi, Dómine;
nihil enim sunt dies mei..."` through `"...non subsístam."`) word for word, including the *absence*
of any leading conjunction before "Parce" — which was one of the two specific wording questions on
the table. **Closed: the lesson text is exactly what an independent 1960s-era printed Breviarium
Romanum prints.** This also gives real (not merely structural) confidence in `Commune/C9.txt`'s
overall wording fidelity, since it was checked against a source with no editorial relationship to
Divinum Officium at all.

**Sub-finding B — `lectio7`-`lectio9` / 1 Cor 15:12-22, 35-44, 51-58: confirmed as authentic content
for this specific feast, not an error.** The printed Pars Autumnalis volume's own `Officium
Defunctorum` section — the one just checked above — is the ordinary/ferial/votive Office of the
Dead, and it uses all-Job lessons throughout (matching pre-reform tradition). It has no 1
Corinthians 15 lessons anywhere in its Office of the Dead material, which at first reading looks
like it might contradict `Sancti/11-02.txt`'s own `[Lectio7]`-`[Lectio9]` (which give 1 Cor 15, not
more Job). It doesn't: `Sancti/11-02.txt` is not the ordinary/votive office, it is the *proper* Office
for the annual feast of the Commemoration of All Souls itself (`[Rank]`: "Duplex" / "I. classis"),
and that proper office is not the same nine lessons as the votive one. Independent web research
(not this repo, not Divinum Officium) confirms why: Pope St. Pius X's breviary reform (effective
1911-1913, and carried forward unchanged into the 1960 rubrics) specifically restructured *All
Souls Day's own* Matins into three nocturns with three distinct sources — first nocturn kept the
traditional Job lessons, second nocturn was newly given extracts from St. Augustine's *De cura pro
mortuis gerenda*, and third nocturn was newly given extracts from 1 Corinthians 15 — a change that
did not touch the separate, older, all-Job votive/ferial Office of the Dead said on ordinary days
(see "St Pius X's New Office of All Souls",
[musingsofanoldcurmudgeon.blogspot.com](https://musingsofanoldcurmudgeon.blogspot.com/2021/11/nov-mutationes-st-pius-xs-new-office-of.html):
*"Only the first Nocturn would retain the readings from Job... the second Nocturn [extracts from]
St Augustine's De cura pro mortuis gerenda, like in the Dominican and Carmelite uses... The lessons
of the third Nocturn, finally, were extracts from chapter 15 of St Paul's first Epistle to the
Corinthians"*). `Sancti/11-02.txt`'s `[Lectio4]`-`[Lectio6]` (Augustine, *De cura pro mortuis
gerenda*, cap. 2-3 / 4 / 18) and `[Lectio7]`-`[Lectio9]` (1 Cor 15) are exactly this reformed proper
scheme. **Closed: this is genuine, historically-documented content for this specific I. classis
feast, not a fabrication or a wrong-book mix-up** — the apparent mismatch against the printed
volume's Job-only Officium Defunctorum was comparing the wrong two things (the annual proper vs. the
generic votive), not a real discrepancy.

**Confirmed precisely why the uploaded volume doesn't have it: it predates the reform.** The
volume's own colophon (searched directly, not assumed) dates it exactly: printed at Mechlin
(Malines, Belgium) by H. Dessain for Benziger Brothers, "MCMVI" (1906), approved "Ex Secretaria
Sacrorum Rituum Congregationis, die 24 Februarii 1906." Pius X's reform was 1911-1913. This is not
a case of having the right kind of book but the wrong section, or a different edition family that
happens to omit the reformed proper — **this specific printed copy is five to seven years too old
to contain it, full stop.** That is the whole explanation for why its Nov 2 page shows only "Secunda
die infra Oct. Omnium Sanctorum" with a rubric pointing at the plain votive Office of the Dead: in
1906 there was nothing else to print there yet.

**Sub-finding C — found the right volume, and it's a complete, exact match. FINDING 7 FULLY
CLOSED.** Since the 1906 volume predates the reform, the actual object of the search became: a
*Pars Autumnalis* printed after ~1913. Searched `archive.org`'s own advanced-search API directly
(`archive.org/advancedsearch.php`, `title:(breviarium romanum autumnalis)`) rather than guessing —
found `breviarium-romanum-1942-pars-autumnalis`, no access restriction, plain-text OCR
(`Breviarium_Romanum_1942_-_Pars_Autumnalis_djvu.txt`) freely downloadable. Its own title page reads
"CURA... Pii Papæ X... AUCTORITATE REFORMATUM" (Desclée & Socii, Rome/Tournai/Paris) — an explicitly
Pius-X-reformed edition, unlike the 1906 volume — and it has a full, dedicated "In Commemoratione
Omnium Fidelium Defunctorum, DUPLEX" proper (pp. 737-745), not just a rubric cross-reference.

Read the entire proper's nine lessons directly against `Sancti/11-02.txt` + `Commune/C9.txt`. Every
one matches, word for word, including the two specific things this finding was still waiting on:

- **Lectio i (Job 7:16-21)** — `"Parce mihi, Dómine; nihil enim sunt dies mei..."` through
  `"...non subsístam."` — exact match, same absent leading conjunction as sub-finding A already
  confirmed from the 1906 votive office.
- **Lectio iv-vi (Augustine, *De cura pro mortuis gerenda*, cap. 2-3 / 4 / 18)** — exact match
  throughout, including Lectio vi's closing line, `"...sit étiam quodámmodo ejúsdem fídei
  testimónium!"`
- **Lectio vii (1 Cor 15:12-22) — the specific "autem" question, now definitively answered.** The
  1942 print reads: *"Si Christus prædicátur quod resurréxit a mórtuis... Si autem resurréctio
  mortuórum non est, neque Christus resurréxit."* **No "autem" before "Christus" in the opening
  clause** — exactly matching `Sancti/11-02.txt`'s `"Si Christus prædicátur..."`, not the plain
  Vulgate's `"Si autem Christus prædicátur..."`. The print's own very next sentence *does* use
  "autem" normally ("Si autem resurréctio...") — confirming this isn't sloppy transcription or an
  OCR artifact dropping the word throughout, but a deliberate, consistent editorial choice at
  exactly the lesson's opening clause (where there is no antecedent for "autem" to refer back to,
  the reading sub-finding B already anticipated as the likely explanation). **Confirmed correct.**
- **Lectio viii (1 Cor 15:35-44) — the endpoint question, now definitively answered.** The 1942
  print's Lectio viii ends at exactly the same place `lectio8` does: `"...seminátur corpus animále,
  surget corpus spiritále."` — verse 44, no more, no less. **Confirmed correct**, no truncation.
- **Lectio ix (1 Cor 15:51-58)** — exact match through to the closing responsory.

**Finding 7 is now fully resolved, not merely narrowed.** All three of the original scripture-text
variants — `lectio1`/Job 7:16, `lectio7`/1 Cor 15:12, `lectio8`/1 Cor 15:44 — are confirmed correct
against a genuine, independent, Pius-X-reformed printed Breviarium Romanum containing the actual
All Souls proper (not the votive stand-in the two earlier volumes offered). Nothing in this office's
scripture-reading units needs further sourcing or correction.

---

## 8. Antiphon-doubling convention — disclosed, minor, presentational

Higher-ranked offices (including `I. classis`, per finding 3) traditionally show each psalm's
antiphon in full both before *and* after the psalm, rather than only once. The current
`psalmi-antiphonae` units store each antiphon's full text once per psalm (correct content, just not
modeling the doubled before/after presentation). This is a display/performance convention, not a
missing or wrong piece of text — the antiphon text itself is complete and verified correct. Recorded
as a minor, disclosed simplification; not investigated further in this pass given the much larger,
structural findings above took priority, and fixing it is a rendering-layer decision (how to repeat
a unit's text at render time) rather than a content-sourcing one.

---

## 9. Full extraction-integrity re-verification — PASS

Every one of the units now in `dev-vertical-slice.json` (29, after this pass's additions) was
checked programmatically against its declared `source.section`, not just the ones already spot
checked in the prior pass: parsed both source files into their own section map independently of the
generator's own code, and compared each unit's `raw_text` against the corresponding section text
verbatim (accounting for the antiphon units' correct 3-of-9 slicing, verified separately). Result:
**zero extraction defects** — every unit's raw text is exactly what its cited source section
contains, no truncation, no cross-wired sections, no off-by-one slicing.

---

## What this pass did not do

- **Did not attempt to build Lauds, Vespers, or any other hour.** The full audit's scope is the
  existing corpus (Matins only); building new hours is new-content work, not an audit, and would
  itself need the same rigor applied here, including the Lauds-side Perl research finding 6 flags
  as still needed.
- **Did not retry or attempt to circumvent divinumofficium.com's Cloudflare block.** The site
  denied the request; this was treated as a real access boundary, not an obstacle to route around.
- **Did not resolve findings 6 and 7** without a source this session doesn't have. Both are
  disclosed with a concrete proposed next step rather than guessed at.
- **Did not touch `audit-ledger.html`'s dashboard.** Per the same reasoning as the narrow-check
  pass: that dashboard tracks the broad cross-tradition campaign this lane's own architecture
  document exempts itself from by default; Josh's authorization for *this* pass doesn't establish
  standing membership in that campaign going forward.
