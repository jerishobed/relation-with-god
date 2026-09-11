#!/usr/bin/env python3
"""
Extract 365-day Chronological Bible Reading Plan from 'Bible Chronological Order-2_PrintReady.docx'
Generates src/data/readingPlan.json and copies booklet images into public/assets/
"""
import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os
import shutil

DOCX_PATH = 'Bible Chronological Order-2_PrintReady.docx'
ASSETS_DIR = 'public/assets'
OUTPUT_JSON = 'src/data/readingPlan.json'

tamil_to_en = {
    'ஆதி': ('Genesis', 'ஆதியாகமம்'),
    'யாத்': ('Exodus', 'யாத்திராகமம்'),
    'லேவி': ('Leviticus', 'லேவியராகமம்'),
    'எண்': ('Numbers', 'எண்ணாகமம்'),
    'உபா': ('Deuteronomy', 'உபாகமம்'),
    'யோசு': ('Joshua', 'யோசுவா'),
    'நியா': ('Judges', 'நியாயாதிபதிகள்'),
    'ரூத்': ('Ruth', 'ரூத்'),
    '1 சாமு': ('1 Samuel', '1 சாமுவேல்'),
    '2 சாமு': ('2 Samuel', '2 சாமுவேல்'),
    '1 இராஜா': ('1 Kings', '1 இராஜாக்கள்'),
    '2 இராஜா': ('2 Kings', '2 இராஜாக்கள்'),
    '1 இரா': ('1 Kings', '1 இராஜாக்கள்'),
    '2 இரா': ('2 Kings', '2 இராஜாக்கள்'),
    '1 நாளா': ('1 Chronicles', '1 நாளாகமம்'),
    '2 நாளா': ('2 Chronicles', '2 நாளாகமம்'),
    'எஸ்றா': ('Ezra', 'எஸ்றா'),
    'நெகே': ('Nehemiah', 'நெகேமியா'),
    'எஸ்தர்': ('Esther', 'எஸ்தர்'),
    'யோபு': ('Job', 'யோபு'),
    'சங்': ('Psalms', 'சங்கீதம்'),
    'நீதி': ('Proverbs', 'நீதிமொழிகள்'),
    'பிரசங்கி': ('Ecclesiastes', 'பிரசங்கி'),
    'உன்ன': ('Song of Solomon', 'உன்னதப்பாட்டு'),
    'ஏசாயா': ('Isaiah', 'ஏசாயா'),
    'எரே': ('Jeremiah', 'எரேமியா'),
    'புலம்பல்': ('Lamentations', 'புலம்பல்'),
    'எசே': ('Ezekiel', 'எசேக்கியேல்'),
    'தானி': ('Daniel', 'தானியேல்'),
    'ஓசியா': ('Hosea', 'ஓசியா'),
    'யோவேல்': ('Joel', 'யோவேல்'),
    'ஆமோ': ('Amos', 'ஆமோஸ்'),
    'ஒபதியா': ('Obadiah', 'ஒபதியா'),
    'யோனா': ('Jonah', 'யோனா'),
    'மீகா': ('Micah', 'மீகா'),
    'நாகூம்': ('Nahum', 'நாகூம்'),
    'ஆபகூக்': ('Habakkuk', 'ஆபகூக்'),
    'செப்': ('Zephaniah', 'செப்பனியா'),
    'ஆகாய்': ('Haggai', 'ஆகாய்'),
    'சகரியா': ('Zechariah', 'சகரியா'),
    'மல்கியா': ('Malachi', 'மல்கியா'),
    'மத்தே': ('Matthew', 'மத்தேயு'),
    'மாற்கு': ('Mark', 'மாற்கு'),
    'லூக்கா': ('Luke', 'லூக்கா'),
    'யோவா': ('John', 'யோவான்'),
    'அப்': ('Acts', 'அப்போஸ்தலர்'),
    'ரோமர்': ('Romans', 'ரோமர்'),
    '1 கொரி': ('1 Corinthians', '1 கொரிந்தியர்'),
    '2 கொரி': ('2 Corinthians', '2 கொரிந்தியர்'),
    'கலா': ('Galatians', 'கலாத்தியர்'),
    'எபேசியர்': ('Ephesians', 'எபேசியர்'),
    'பிலி': ('Philippians', 'பிலிப்பியர்'),
    'கொலோ': ('Colossians', 'கொலோசெயர்'),
    '1 தெச': ('1 Thessalonians', '1 தெசலோனிக்கேயர்'),
    '2 தெச': ('2 Thessalonians', '2 தெசலோனிக்கேயர்'),
    '1 தீமோ': ('1 Timothy', '1 தீமோத்தேயு'),
    '2 தீமோ': ('2 Timothy', '2 தீமோத்தேயு'),
    'தீத்து': ('Titus', 'தீத்து'),
    'பிலே': ('Philemon', 'பிலேமோன்'),
    'எபி': ('Hebrews', 'எபிரெயர்'),
    'யாக்கோபு': ('James', 'யாக்கோபு'),
    '1 பேதுரு': ('1 Peter', '1 பேதுரு'),
    '2 பேதுரு': ('2 Peter', '2 பேதுரு'),
    '1 யோவா': ('1 John', '1 யோவான்'),
    '2 யோவா': ('2 John', '2 யோவான்'),
    '3 யோவா': ('3 John', '3 யோவான்'),
    'யூதா': ('Jude', 'யூதா'),
    'வெளி': ('Revelation', 'வெளிப்படுத்தின விசேஷம்')
}

youversion_codes = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
    '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
    'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA',
    'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
    'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS',
    'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC',
    'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC',
    'Malachi': 'MAL', 'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
    'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
    'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE',
    '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD',
    'Revelation': 'REV'
}

def get_period(day_num, first_book):
    if day_num <= 40:
        return {'id': 'patriarchs', 'nameEn': 'Creation & Patriarchs', 'nameTa': 'படைப்பு மற்றும் முற்பிதாக்கள்'}
    elif day_num <= 80:
        return {'id': 'exodus', 'nameEn': 'Exodus & The Law', 'nameTa': 'யாத்திராகமம் மற்றும் நியாயப்பிரமாணம்'}
    elif day_num <= 120:
        return {'id': 'conquest', 'nameEn': 'Promised Land & Judges', 'nameTa': 'வாக்குத்தத்த தேசம் மற்றும் நியாயாதிபதிகள்'}
    elif day_num <= 170:
        return {'id': 'united_kingdom', 'nameEn': 'United Kingdom & Psalms', 'nameTa': 'ஒன்றிணைந்த ராஜ்யம் மற்றும் சங்கீதம்'}
    elif day_num <= 230:
        return {'id': 'divided_kingdom', 'nameEn': 'Divided Kingdom & Prophets', 'nameTa': 'பிளவுபட்ட ராஜ்யம் மற்றும் தீர்க்கதரிசிகள்'}
    elif day_num <= 270:
        return {'id': 'exile_return', 'nameEn': 'Exile & Restoration', 'nameTa': 'சிறையிருப்பு மற்றும் மறுமலர்ச்சி'}
    elif day_num <= 315:
        return {'id': 'gospels', 'nameEn': 'Life of Christ & Gospels', 'nameTa': 'இயேசு கிறிஸ்துவின் ஜீவியம் மற்றும் சுவிசேஷம்'}
    elif day_num <= 355:
        return {'id': 'epistles', 'nameEn': 'Early Church & Epistles', 'nameTa': 'ஆதித் திருச்சபை மற்றும் நிருபங்கள்'}
    else:
        return {'id': 'revelation', 'nameEn': 'End Times & Consummation', 'nameTa': 'கடைசி கால தீர்க்கதரிசனம் மற்றும் நித்தியம்'}

def main():
    os.makedirs(ASSETS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    
    with zipfile.ZipFile(DOCX_PATH) as z:
        # Extract assets
        for n in z.namelist():
            if 'media/image1.png' in n:
                with open(os.path.join(ASSETS_DIR, 'booklet-cover.png'), 'wb') as f:
                    f.write(z.read(n))
                print('Extracted booklet-cover.png')
            elif 'media/image2.png' in n:
                with open(os.path.join(ASSETS_DIR, 'bible-facts.png'), 'wb') as f:
                    f.write(z.read(n))
                print('Extracted bible-facts.png')

        root = ET.fromstring(z.read('word/document.xml'))
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        tbl = root.find('.//w:tbl', ns)
        rows = tbl.findall('.//w:tr', ns)
        
        days_list = []
        total_chapters_count = 0
        
        for r in rows:
            cells = r.findall('.//w:tc', ns)
            texts = [' '.join([''.join(t.itertext()) for t in c.findall('.//w:p', ns)]).strip() for c in cells]
            if not texts or not texts[0].startswith('Day '):
                continue
                
            day_num = int(texts[0].replace('Day ', '').strip())
            ch_list = []
            
            for raw_ch in texts[2:]:
                if not raw_ch.strip():
                    continue
                total_chapters_count += 1
                cleaned = raw_ch.replace('.', '').strip()
                matched_prefix = None
                for k in sorted(tamil_to_en.keys(), key=len, reverse=True):
                    if cleaned.startswith(k):
                        matched_prefix = k
                        break
                
                en_book, ta_book = tamil_to_en[matched_prefix]
                remainder = cleaned[len(matched_prefix):].strip()
                remainder = re.sub(r'^\s*[:\.]\s*', '', remainder).strip()
                yv_code = youversion_codes.get(en_book, '')
                ch_num = remainder.split(':')[0].strip()
                
                ch_id = f'{yv_code}_{ch_num}'
                
                ch_list.append({
                    'id': ch_id,
                    'raw': raw_ch,
                    'bookEnglish': en_book,
                    'bookTamil': ta_book,
                    'passage': remainder,
                    'chapter': ch_num,
                    'englishRef': f'{en_book} {remainder}',
                    'tamilRef': f'{ta_book} {remainder}',
                    'youversionCode': yv_code,
                    'youversionEnglishUrl': f'https://www.bible.com/bible/1/{yv_code}.{ch_num}.KJV',
                    'youversionTamilUrl': f'https://www.bible.com/bible/339/{yv_code}.{ch_num}.TAM'
                })
            
            first_book = ch_list[0]['bookEnglish'] if ch_list else 'Genesis'
            period = get_period(day_num, first_book)
            
            days_list.append({
                'day': day_num,
                'period': period,
                'chaptersCount': len(ch_list),
                'chapters': ch_list,
                'tamilSummary': ', '.join([c['tamilRef'] for c in ch_list]),
                'englishSummary': ', '.join([c['englishRef'] for c in ch_list])
            })
            
        data = {
            'program': {
                'titleEn': 'Read the Bible in 365 Days: Chronological Journey',
                'titleTa': 'பரிசுத்த வேதாகமம் காலவரிசை வாசிப்பு: 365 நாட்கள்',
                'author': 'J Jerish Obed',
                'contact': '+91 9442418286',
                'instagram': 'https://www.instagram.com/relations_with_god/',
                'instagramHandle': '@relations_with_god',
                'youtube': 'https://www.youtube.com/@relationswithgod',
                'youtubeHandle': '@relationswithgod',
                'keyVerse': {
                    'verse': 'Psalm 119:105',
                    'textEn': 'Thy word is a lamp unto my feet, and a light unto my path.',
                    'textTa': 'உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.'
                },
                'totalDays': len(days_list),
                'totalChapters': total_chapters_count
            },
            'days': days_list
        }
        
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as out:
            json.dump(data, out, ensure_ascii=False, indent=2)
            
        print(f'Successfully generated {OUTPUT_JSON} with {len(days_list)} days and {total_chapters_count} chapters.')

if __name__ == '__main__':
    main()
