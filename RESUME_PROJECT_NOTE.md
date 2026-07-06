
## Immediate pending work (as of end of session, 2026-07-05)

Mid-way through auditing the BCP Holy Days collects (Common of Saints) against BCP1979.pdf. 8 confirmed wording errors identified and verified against source, NOT YET APPLIED to components/anglican.json:

1. **bcp-collect-bartholomew** — "Grant, we pray, to your Church to love" should be "Grant that your Church may love"
2. **bcp-collect-mary-virgin** — has an extra "your Son" inserted before "Jesus Christ our Lord" that isn't in the source
3. **bcp-collect-michael-all-angels** — "who with you and the Holy Spirit lives and reigns" should be "who lives and reigns with you and the Holy Spirit"
4. **bcp-collect-st-john** — same reordering error as Michael and All Angels
5. **bcp-collect-nativity-john-baptist** — "his holy doctrine" should be "his teaching"; "and after his example" should be "and, following his example,"; missing "your Son" before final "our Lord"
6. **bcp-collect-philip-james** — substantially different second half, not just wording: app says "grace and power to witness to the truth... being grounded in the same faith, may be obedient to your word in all things" — real text is "grace and strength to bear witness to the truth... being mindful of their victory of faith, may glorify in life and death the Name of our Lord Jesus Christ"
7. **bcp-collect-st-mark** — "who by the hand of Mark the evangelist have given" is grammatically broken; should be "by the hand of Mark the evangelist you have given"
8. **bcp-collect-st-paul-conversion** — "show forth our thankfulness to you for the same by following the holy doctrine which he taught" should be "show ourselves thankful to you by following his holy teaching"

Checked and CONFIRMED CORRECT (no fix needed, trivial variance only): bcp-collect-st-andrew (capitalization only), bcp-collect-st-thomas (curly vs straight apostrophe only).

Still unchecked in this batch: bcp-collect-holy-cross (source extraction failed to isolate it cleanly — needs a direct manual pull), and none of the Common of Saints collects beyond the Holy Days already covered.

Once these 8 are applied: commit to `audit-ledger-workspace` branch, update the dashboard's Collects note and bump SEED_VERSION, verify with `node --check` before both commits, update the governance ledger.
