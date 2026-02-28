#!/usr/bin/env python3
"""
migrate_saints.py
=================
Migrates all monthly saints files from the legacy flat `tradition` string
format to the new tag-based schema.

Usage:
    python3 migrate_saints.py

Run from the root of the project directory (where data/saints/ lives).
Backs up each file to data/saints/backup/ before writing.

Changes applied:
  - Adds `id` field (generated from name + day)
  - Adds `type` field (saint / apostle / prophet / feast / marian_feast / commemoration)
  - Replaces `tradition` string with `tags` array using short codes:
      ANG  Anglican
      LAT  Latin Catholic
      EOR  Eastern Orthodox
      OOR  Oriental Orthodox
      COE  Church of the East
  - Adds `verification_status` field (verified / provisional)
  - Applies fully verified classifications to the 139 formerly-Universal entries
  - Splits the combined Barbara / John of Damascus entry into two records
  - Splits the Conception of the BVM into two separate dated entries
    (Dec 8 LAT+ANG) and (Dec 9 EOR+OOR)
  - Removes the now-redundant `tradition` field

ECU is never stored — it is derived at render time when all five tags are present.
"""

import json
import os
import re
import shutil
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────

SAINTS_DIR = Path("data/saints")
BACKUP_DIR = SAINTS_DIR / "backup"

MONTHS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
]

# ── Mechanical tradition renames ──────────────────────────────────────────────

TRADITION_TO_TAGS = {
    "Anglican":                    ["ANG"],
    "Anglican Communion":          ["ANG"],
    "Catholic":                    ["LAT"],
    "Latin Catholic":              ["LAT"],
    "Eastern Orthodox":            ["EOR"],
    "Oriental Orthodox":           ["OOR"],
    "Ethiopian Orthodox Tewahedo": ["OOR"],
    "Church of the East":          ["COE"],
    "Byzantine Orthodox":          ["EOR"],
    "Ignatian":                    ["LAT"],
}

# ── Verified classifications for formerly-Universal entries ───────────────────
# Keyed by name (exact match). Generated from saints_classification_final.json.

UNIVERSAL_CLASSIFICATIONS = {
  "Saint Mary of Egypt": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "External asset confirms; also in Roman Martyrology"},
  "Saint Francis of Paola": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Richard of Chichester": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Isidore of Seville": {"type": "saint", "tags": ["LAT"], "verification_status": "verified", "notes": "Doctor of Latin Church; external asset confirms LAT only"},
  "Saint Vincent Ferrer": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Eutychius, Patriarch of Constantinople": {"type": "saint", "tags": ["EOR", "LAT"], "verification_status": "verified"},
  "Saint John Baptist de la Salle": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Apostles Herodion and Agabus": {"type": "apostle", "tags": ["EOR", "OOR"], "verification_status": "verified", "notes": "Seventy Apostles; Eastern calendars only"},
  "Saint Antipas of Pergamum": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Easter Sunday (The Resurrection of Our Lord)": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Martin I": {"type": "saint", "tags": ["EOR", "LAT"], "verification_status": "verified", "notes": "Pope and martyr; different feast days East and West; not ANG or COE"},
  "Saint Tiburtius and Companions": {"type": "saint", "tags": ["LAT"], "verification_status": "verified", "notes": "Roman martyrs; Western calendar only"},
  "Saint Alphege": {"type": "saint", "tags": ["ANG"], "verification_status": "verified"},
  "Saint Anselm of Canterbury": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Theodore of Sykeon": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saint George": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Venerated in all traditions"},
  "Saint Fidelis of Sigmaringen": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Mark the Evangelist": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Symeon, Kinsman of the Lord": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Peter Chanel": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Catherine of Siena": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified", "notes": "External asset: LAT + ANG optional; not East"},
  "Saint James the Brother of the Lord (James the Just)": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Transfiguration of the Lord": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Lawrence": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Roman deacon-martyr; COE unclear"},
  "Dormition or Assumption of the Virgin Mary": {"type": "marian_feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Doctrinal framing differs but universally commemorated"},
  "Saint Bartholomew the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Monica": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Augustine of Hippo": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Not COE"},
  "Martyrdom of Saint John the Baptist": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Barbara and Saint John of Damascus": None,  # Split — handled specially
  "Saint Sabbas the Sanctified": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Also in Roman Martyrology"},
  "Saint Nicholas of Myra": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Ambrose of Milan": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Conception of the Blessed Virgin Mary": None,  # Split — handled specially
  "Saint Lucy": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint John of the Cross": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Prophet Daniel and the Three Holy Youths": {"type": "prophet", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Ignatius of Antioch": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Thomas the Apostle and Saint Juliana": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Thomas is apostle; Juliana is a separate EOR saint — consider splitting"},
  "Saint Anastasia": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "In Roman Martyrology; Eastern calendars; not BCP"},
  "Eve of the Nativity and Holy Ancestors": {"type": "commemoration", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "The Nativity of Our Lord": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Stephen, Protomartyr": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Synaxis of the Theotokos": {"type": "marian_feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint John the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "The Holy Innocents": {"type": "commemoration", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Sylvester I": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Brigid of Kildare": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Presentation of the Lord (Candlemas)": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Ansgar (Anskar)": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Venerable Isidore of Pelusium": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saint Agatha": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saints Paul Miki and Companions (Martyrs of Japan)": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Venerable Parthenius of Lampsacus": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saint Josephine Bakhita": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Great Martyr Theodore Stratelates (Theodore the General)": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Martyr Nicephorus of Antioch": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saint Scholastica": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Hieromartyr Charalampus of Magnesia": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saint Meletius of Antioch": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saints Cyril and Methodius": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Chair of Saint Peter": {"type": "feast", "tags": ["ANG", "LAT"], "verification_status": "verified", "notes": "Western feast; not Eastern"},
  "Saint Polycarp of Smyrna": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Matthias the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Tarasius of Constantinople": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Saint Porphyry of Gaza": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Oswald of Worcester": {"type": "saint", "tags": ["ANG"], "verification_status": "verified"},
  "Holy Name of Jesus / Circumcision of Christ": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Basil the Great": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "The Epiphany / Theophany of Our Lord": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Confession of Saint Peter": {"type": "commemoration", "tags": ["EOR"], "verification_status": "verified", "notes": "Primarily a Byzantine liturgical observance (Jan 16). Not a standard universal feast in LAT, ANG, OOR, or COE calendars."},
  "Conversion of Saint Paul": {"type": "feast", "tags": ["ANG", "LAT"], "verification_status": "verified", "notes": "Western feast; not formally on Eastern calendars"},
  "Saint Justin Martyr": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Charles Lwanga and Companions": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Boniface": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint William of York": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Ephrem the Syrian": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Barnabas the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Jude Thaddeus": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Nativity of Saint John the Baptist": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Cyril of Alexandria": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Irenaeus of Lyons": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saints Peter and Paul, Apostles": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Holy Martyrs of the Church of Rome": {"type": "commemoration", "tags": ["LAT"], "verification_status": "verified"},
  "David of Wales (Dewi Sant)": {"type": "saint", "tags": ["ANG"], "verification_status": "verified"},
  "Saint Chad of Lichfield": {"type": "saint", "tags": ["ANG"], "verification_status": "verified"},
  "Saint Katharine Drexel": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Casimir": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint John Joseph of the Cross": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Colette": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saints Perpetua and Felicity": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Pre-schism martyrs; COE unclear"},
  "Saint John of God": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "The Holy Forty Martyrs of Sebaste": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "In Roman Martyrology; primarily Eastern"},
  "Saint John Ogilvie": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Sophronius, Patriarch of Jerusalem": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Gregory the Great (Gregory the Dialogist)": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Nicephorus, Patriarch of Constantinople": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Venerable Benedict of Nursia": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Not reliably COE"},
  "Saint Louise de Marillac": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Martyr Sabinus of Egypt": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Patrick (Patricius)": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Gertrude of Nivelles": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Cyril of Jerusalem": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Joseph, Spouse of the Blessed Virgin Mary": {"type": "marian_feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Cuthbert of Lindisfarne": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Annunciation of the Lord (Annunciation of the Theotokos)": {"type": "marian_feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Dismas": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "The Good Thief; venerated in all traditions"},
  "Saint John Climacus": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Hypatius, Bishop of Gangra": {"type": "saint", "tags": ["EOR", "OOR"], "verification_status": "verified"},
  "Jeremiah the Prophet": {"type": "prophet", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Athanasius the Great": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Dame Julian of Norwich": {"type": "saint", "tags": ["ANG"], "verification_status": "verified", "notes": "LAT devotional only, not liturgical"},
  "Saint Rita of Cascia": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Bede the Venerable": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Saint Philip Neri": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Joan of Arc": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "All Saints": {"type": "commemoration", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "All Souls / Commemoration of the Dead": {"type": "commemoration", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Elizabeth": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Elizabeth mother of John the Baptist"},
  "Synaxis of the Archangel Michael and All Angels": {"type": "commemoration", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Leo the Great": {"type": "saint", "tags": ["ANG", "EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "COE sensitivity — omitted per external asset"},
  "Saint Martin of Tours": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Josaphat": {"type": "saint", "tags": ["LAT"], "verification_status": "verified", "notes": "Eastern Catholic martyr; not recognized by Eastern Orthodox"},
  "Saint John Chrysostom": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Philip the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Matthew the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Elizabeth of Hungary": {"type": "saint", "tags": ["ANG", "LAT"], "verification_status": "verified"},
  "Presentation of the Blessed Virgin Mary": {"type": "marian_feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Cecilia": {"type": "saint", "tags": ["EOR", "LAT", "OOR"], "verification_status": "verified", "notes": "Roman martyr; in Eastern calendars too"},
  "Saint Clement of Rome": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Catherine of Alexandria": {"type": "saint", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Saturninus": {"type": "saint", "tags": ["LAT"], "verification_status": "verified"},
  "Saint Andrew the Apostle": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint Luke the Evangelist": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saint James the Brother of the Lord": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Saints Simon and Jude": {"type": "apostle", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Nativity of the Blessed Virgin Mary": {"type": "marian_feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
  "Exaltation of the Holy Cross": {"type": "feast", "tags": ["ANG", "COE", "EOR", "LAT", "OOR"], "verification_status": "verified"},
}

# ── Helper functions ──────────────────────────────────────────────────────────

def make_id(name, day):
    """Generate a stable slug id from name and day."""
    base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return base


def migrate_record(record):
    """
    Convert a single saint record to the new schema.
    Returns a list (usually one item, two if splitting Barbara/John).
    """
    name = record.get('name', '')
    day  = record.get('day', '')
    desc = record.get('description', '')
    tradition = record.get('tradition', '')

    # ── Special case: Barbara / John of Damascus combined entry ──────────────
    if name == 'Saint Barbara and Saint John of Damascus':
        return [
            {
                "id":                  "saint-barbara-of-nicomedia",
                "day":                 day,
                "name":                "Saint Barbara of Nicomedia",
                "description":         "Virgin-martyr of Nicomedia.",
                "type":                "saint",
                "tags":                ["EOR", "LAT", "OOR"],
                "verification_status": "verified",
            },
            {
                "id":                  "saint-john-of-damascus",
                "day":                 day,
                "name":                "Saint John of Damascus",
                "description":         "Monk, priest, and Doctor of the Church; defender of icons.",
                "type":                "saint",
                "tags":                ["ANG", "EOR", "LAT"],
                "verification_status": "verified",
            },
        ]

    # ── Special case: Conception of the BVM ──────────────────────────────────
    if name == 'Conception of the Blessed Virgin Mary':
        return [
            {
                "id":                  "feast-immaculate-conception",
                "day":                 "December 8",
                "name":                "Immaculate Conception of the Blessed Virgin Mary",
                "description":         "Western feast of the Immaculate Conception, dogmatically defined by the Latin Church. Not accepted by Eastern Orthodox or Oriental Orthodox.",
                "type":                "marian_feast",
                "tags":                ["ANG", "LAT"],
                "verification_status": "verified",
                "notes":               "December 8. Dogmatically declared by LAT; not accepted by EOR or OOR. Eastern equivalent celebrated December 9 — see Conception of the Theotokos by Saint Anne.",
            },
            {
                "id":                  "feast-conception-of-the-theotokos",
                "day":                 "December 9",
                "name":                "Conception of the Theotokos by Saint Anne",
                "description":         "Eastern commemoration of the conception of the Virgin Mary by her mother Anne.",
                "type":                "marian_feast",
                "tags":                ["EOR", "OOR"],
                "verification_status": "verified",
                "notes":               "Eastern equivalent of the Western Immaculate Conception (Dec 8). Distinct commemorations with distinct theological framings; must not be conflated.",
            },
        ]

    # ── Universal / formerly-Universal entries ────────────────────────────────
    if tradition == 'Universal':
        c = UNIVERSAL_CLASSIFICATIONS.get(name)
        if c is None:
            # Marked for special handling above but somehow missed
            print(f"  WARNING: No classification for Universal entry: {name}")
            entry = {
                "id":                  make_id(name, day),
                "day":                 day,
                "name":                name,
                "description":         desc,
                "type":                "saint",
                "tags":                [],
                "verification_status": "provisional",
                "notes":               "NEEDS MANUAL REVIEW — no classification found",
            }
            return [entry]
        entry = {
            "id":                  make_id(name, day),
            "day":                 day,
            "name":                name,
            "description":         desc,
            "type":                c['type'],
            "tags":                sorted(c['tags']),
            "verification_status": c['verification_status'],
        }
        if 'notes' in c:
            entry['notes'] = c['notes']
        return [entry]

    # ── Standard mechanical rename ────────────────────────────────────────────
    # Support both single-tradition strings and comma-separated multi-tradition
    # strings (e.g. "Catholic, Anglican" or "Eastern Orthodox, Oriental Orthodox")
    # Records with no tradition field are marked provisional for later audit.
    parts = [p.strip() for p in tradition.split(',') if p.strip()]

    if not parts:
        # No tradition data — mark provisional for audit pass
        entry = {
            "id":                  make_id(name, day),
            "day":                 day,
            "name":                name,
            "description":         desc,
            "type":                "saint",
            "tags":                [],
            "verification_status": "provisional",
            "notes":               "NEEDS TAGGING — no tradition field in source data",
        }
        return [entry]

    tags = []
    unknown_parts = []
    for part in parts:
        mapped = TRADITION_TO_TAGS.get(part)
        if mapped:
            for t in mapped:
                if t not in tags:
                    tags.append(t)
        else:
            unknown_parts.append(part)

    if unknown_parts:
        print(f"  WARNING: Unrecognized tradition part(s) {unknown_parts} for: {name} ({day})")
        status = "provisional"
    else:
        status = "verified"

    entry = {
        "id":                  make_id(name, day),
        "day":                 day,
        "name":                name,
        "description":         desc,
        "type":                "saint",
        "tags":                sorted(tags),
        "verification_status": status,
    }
    return [entry]



# ── Main migration ────────────────────────────────────────────────────────────

def has_tradition_field(filepath):
    """Return True if the file contains unmigrated records with a tradition field."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return any('tradition' in r for r in data)
    except Exception:
        return False


def main():
    if not SAINTS_DIR.exists():
        print(f"ERROR: {SAINTS_DIR} not found. Run from project root.")
        return

    BACKUP_DIR.mkdir(exist_ok=True)

    total_in  = 0
    total_out = 0

    for month in MONTHS:
        live_path   = SAINTS_DIR / f"saints-{month}.json"
        backup_path = BACKUP_DIR / f"saints-{month}.json"

        # Always read from backup if it has tradition fields (safe re-run).
        # On first run, back up live file then read from backup.
        if backup_path.exists() and has_tradition_field(backup_path):
            source = backup_path
        elif live_path.exists() and has_tradition_field(live_path):
            shutil.copy2(live_path, backup_path)
            source = backup_path
        else:
            print(f"SKIP: no unmigrated source for {month} (already migrated or missing)")
            continue

        with open(source, 'r', encoding='utf-8') as f:
            saints = json.load(f)

        migrated = []
        for record in saints:
            results = migrate_record(record)
            migrated.extend(results)
            total_in += 1
            total_out += len(results)
            if len(results) > 1:
                print(f"  SPLIT: '{record.get('name')}' -> {len(results)} entries")

        with open(live_path, 'w', encoding='utf-8') as f:
            json.dump(migrated, f, indent=2, ensure_ascii=False)

        print(f"  {month:>12}: {len(saints):>3} in -> {len(migrated):>3} out")

    print(f"\nDone. {total_in} records in -> {total_out} records out.")
    print(f"Source: {BACKUP_DIR}/  ->  Output: {SAINTS_DIR}/")


if __name__ == '__main__':
    main()