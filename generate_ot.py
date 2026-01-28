from meaningless import WebBible  # Correct import for NRSV from Bible Gateway

# Initialize the Bible object for NRSV translation
try:
    bible = WebBible(translation='NRSV')
except Exception as e:
    print(f"Error initializing Bible: {e}")
    exit(1)  # Stop if there's an issue

# Dictionary of OT books and their chapter counts (standard canon)
ot_chapter_counts = {
    'Genesis': 50,
    'Exodus': 40,
    'Leviticus': 27,
    'Numbers': 36,
    'Deuteronomy': 34,
    'Joshua': 24,
    'Judges': 21,
    'Ruth': 4,
    '1 Samuel': 31,
    '2 Samuel': 24,
    '1 Kings': 22,
    '2 Kings': 25,
    '1 Chronicles': 29,
    '2 Chronicles': 36,
    'Ezra': 10,
    'Nehemiah': 13,
    'Esther': 10,
    'Job': 42,
    'Psalms': 150,
    'Proverbs': 31,
    'Ecclesiastes': 12,
    'Song of Solomon': 8,
    'Isaiah': 66,
    'Jeremiah': 52,
    'Lamentations': 5,
    'Ezekiel': 48,
    'Daniel': 12,
    'Hosea': 14,
    'Joel': 3,
    'Amos': 9,
    'Obadiah': 1,
    'Jonah': 4,
    'Micah': 7,
    'Nahum': 3,
    'Habakkuk': 3,
    'Zephaniah': 3,
    'Haggai': 2,
    'Zechariah': 14,
    'Malachi': 4
}

# Empty list to hold JSON data
json_data = []

# Loop through each book and chapter
for book, chapters in ot_chapter_counts.items():
    try:
        for chapter in range(1, chapters + 1):
            # Fetch the full chapter text as a list of verses
            verses = bible.get_chapter(book, chapter)
            text = ' '.join(verses)  # Join verses into one paragraph
            # Add to JSON structure
            json_data.append({
                "id": f"{book.upper()} {chapter}",
                "text": {"NRSV": text}
            })
            print(f"Processed {book} {chapter}")
    except Exception as e:
        print(f"Error processing {book} chapter {chapter}: {e}")

# Save to file
try:
    with open('ot_nrsv.json', 'w') as f:
        import json
        json.dump(json_data, f, indent=2)
    print("OT JSON generated and saved to ot_nrsv.json!")
except Exception as e:
    print(f"Error saving file: {e}")