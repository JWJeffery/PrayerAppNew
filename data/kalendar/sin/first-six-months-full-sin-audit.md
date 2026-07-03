# First Six Months Full SIN Completion Audit

## Scope

This audit completes the first Universal Office Saint Identification Number pass for the first six completed Kalendar v0.1 months: July through December.

The prior pass controlled only rank-1 daily identities. This pass adds SIN maps for the alternate candidate rows currently present in the July-December candidate matrices.

## Completion result

- Rank-1 files remain in `data/kalendar/sin/rank1/`.
- Alternate-row files now live in `data/kalendar/sin/alternate/`.
- The first six-month SIN space currently runs through `UO-SIN-000616`.

The SIN assignment now covers candidate rows currently present in the July, August, September, October, November, and December ranked candidate matrices.

## Files added in the alternate pass

- `data/kalendar/sin/alternate/README.md`
- `data/kalendar/sin/alternate/july-alternate-sins.csv`
- `data/kalendar/sin/alternate/august-alternate-sins.csv`
- `data/kalendar/sin/alternate/september-alternate-sins-part1.csv`
- `data/kalendar/sin/alternate/september-alternate-sins-part2.csv`
- `data/kalendar/sin/alternate/october-alternate-sins-part1.csv`
- `data/kalendar/sin/alternate/october-alternate-sins-part2.csv`
- `data/kalendar/sin/alternate/november-alternate-sins-part1.csv`
- `data/kalendar/sin/alternate/november-alternate-sins-part2.csv`
- `data/kalendar/sin/alternate/december-alternate-sins.csv`

## Normalization decisions

1. Same identity, date conflict: reuse the same SIN.

Examples: Thomas the Apostle, Thomas Becket, Nicholas Ferrar, John of the Cross, Hilda of Whitby, Elizabeth of Hungary, Frances Joseph-Gaudet, and other date-harmonization cases.

2. Group source-form: assign a group SIN.

When the candidate row is a received group form, the group receives a group SIN rather than silently replacing it with individual member SINs. Examples include Joachim and Anne, the Martyrs of New Guinea, the English Mystics, the Reformation Martyrs source forms, and the November women-martyr group.

3. Individual inside a group: assign a distinct individual SIN when separately present.

Examples: Martin de Porres, Sojourner Truth, Catherine of Alexandria, Cecilia of Rome, Margery Kempe, and Samuel Johnson.

4. Ambiguous same-name figures: split the SINs.

Examples include Bruno of Cologne the Carthusian and Bruno of Cologne the Archbishop; Stephen the Protomartyr and Stephen the Younger; Nicholas of Myra and Nicholas Ferrar; multiple Thomas entries; and feast names involving Mary distinct from Saint Mary the Virgin.

5. Non-person entries: assign a SIN but preserve entity type.

Feasts, observances, commemorations, and events receive SINs because Universal Office needs stable daily identity metadata, but the `entity_type` field prevents confusing them with individual saints.

## Continuing limitations

This is an identity-control pass, not a final-governance pass. The candidate rows still retain their underlying review burdens: source verification, date harmonization, Reformation-context handling, modern-figure review, social-impact caution, legendary-material review, Great Church labeling, and feast/genre review.

The next hard audit should check that every monthly candidate CSV row has either a rank-1 SIN or an alternate-row SIN, and then decide whether the monthly candidate CSVs should receive an explicit `sin` column or remain paired with these external SIN maps.
