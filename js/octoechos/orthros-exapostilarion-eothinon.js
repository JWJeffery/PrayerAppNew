/* Orthros — Sunday Resurrectional Exapostilarion (Svetilen)
 *
 * Namespace : window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon
 * Keying    : 11-part Eothinon (Morning Gospel) cycle, not the 8-tone Octoechos.
 * Source    : 'Web-sourced English Exapostilaria (compiled; not edition-verified)'
 *
 * Structure:
 *   .gospels[1–11]  — null until transcribed; engine treats null as
 *                     'orthros-sunday-exapostilarion-eothinon-text-untranscribed'.
 *
 * Integration: Read by _resolveOrthrosSlots() in js/horologion-engine.js
 *              when dayOfWeek === 0 and OrthrosEothinonEngine returns
 *              applicable === true.
 *
 * Relationship to orthros-exapostilarion-sunday.js:
 *   That file (window.OCTOECHOS.orthros.exapostilarion.sunday.tones) is a
 *   schema error — it keys exapostilarion by Octoechos tone, which is
 *   incorrect for this slot. It is NOT read by the resolver. This file
 *   supersedes it for the Sunday Resurrectional Exapostilarion path.
 *
 * v1.0 — namespace and engine wiring established; corpus not yet transcribed.
 */

window.OCTOECHOS        = window.OCTOECHOS        || {};
window.OCTOECHOS.orthros = window.OCTOECHOS.orthros || {};
window.OCTOECHOS.orthros.exapostilarion =
    window.OCTOECHOS.orthros.exapostilarion || {};

window.OCTOECHOS.orthros.exapostilarion.sunday =
    window.OCTOECHOS.orthros.exapostilarion.sunday || {};

window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon = {

    meta: {
        label:     'Sunday Resurrectional Exapostilarion (Svetilen)',
        office:    'orthros',
        family:    'exapostilarion',
        cycle:     'eothinon',
        source:    'UNTRANSCRIBED — requires verified source (Jordanville 2008 / OCA Orthros)',
        note:      'Keyed to the Resurrectional Matins Gospel (1–11), not to the Octoechos tone.'
    },

    gospels: {

    1: 'Let us ascend, O disciples, into Galilee by faith to behold Christ Who has risen from the dead; and let us learn how all authority in heaven and on earth has been given unto Him. Wherefore, He commanded them to teach all nations and to baptize them in the name of the Father, and of the Son, and of the Holy Spirit, abiding with them unto the end of the age. Therefore we cry: Glory to Thy Resurrection, O Lord!',

    2: 'Let us behold the stone rolled away from the tomb, and the women bearing myrrh proclaiming the Resurrection; for they heard from the Angel: Why seek ye the living among the dead? He is risen as He said. Therefore let us also cry aloud: Glory to Thy Resurrection, O Lord!',

    3: 'Let us glorify Christ Who arose from the dead, Who appeared first to Mary Magdalene, and then to the disciples, rebuking their unbelief. He commanded them to preach unto all creation and promised to be with them always. Therefore we cry: Glory to Thy Resurrection, O Lord!',

    4: 'Very early in the morning the women came unto the tomb bearing spices, and found the stone rolled away. They beheld Angels who proclaimed: Why seek ye the living among the dead? He is risen. And Peter, running, beheld the linen cloths. Therefore we glorify Christ Who has risen, granting the world great mercy.',

    5: 'Christ appeared unto the disciples on the road to Emmaus, and was made known unto them in the breaking of the bread; for their hearts burned within them as He opened unto them the Scriptures. Therefore, proclaiming His Resurrection, we cry: Glory to Thee, O Lord!',

    6: 'When Christ stood in the midst of His disciples, He said unto them: Peace be unto you. And showing them His hands and His side, He did eat before them. Then He opened their minds to understand the Scriptures, and blessing them, He was taken up into heaven. Therefore we glorify His Resurrection.',

    7: 'Mary Magdalene came early unto the tomb and found it empty; and running, she came unto Peter and John. And they, hastening, beheld the linen cloths lying apart, and marveled at the mystery of the Resurrection. Therefore we glorify Christ Who has risen from the dead.',

    8: 'Mary stood weeping at the tomb, and beheld two Angels; and turning herself back, she saw Christ, yet knew Him not, until He called her by name. Then she proclaimed unto the disciples: I have seen the Lord. Therefore we glorify His Resurrection.',

    9: 'The doors being shut, Jesus came and stood in the midst of His disciples and said: Peace be unto you. And showing them His wounds, He strengthened their faith; and Thomas, touching His side, cried aloud: My Lord and my God. Therefore we glorify His Resurrection.',

    10: 'At the Sea of Tiberias Christ appeared unto His disciples, and filled their nets with a multitude of fishes. And in the breaking of the bread He was made known unto them. Therefore, knowing Him as the risen Lord, we cry: Glory to Thy Resurrection!',

    11: 'After His Resurrection the Lord said unto Peter: Lovest thou Me? And thrice committing unto him the care of His flock, He foretold his martyrdom and called him to follow Him. Therefore we glorify Christ Who has risen from the dead.'

}
};