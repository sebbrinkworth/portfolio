# Gallery Image Metadata

## Images Added

### 1. PXL_20240315_132744500.MP-EDIT.jpg
- **Date:** March 15, 2024
- **Time:** 13:27:44 (1:27 PM)
- **Size:** ~2.2 MB
- **Camera:** Google Pixel (indicated by PXL_ prefix)
- **Location:** Not extracted (null)
- **Notes:** MP suffix indicates Motion Photo feature

### 2. PXL_20240517_203243228.jpg
- **Date:** May 17, 2024
- **Time:** 20:32:43 (8:32 PM)
- **Size:** ~3.0 MB
- **Camera:** Google Pixel
- **Location:** Not extracted (null)
- **Notes:** Evening/night photo

### 3. PXL_20240914_154150204.MP-EDIT.jpg
- **Date:** September 14, 2024
- **Time:** 15:41:50 (3:41 PM)
- **Size:** ~2.3 MB
- **Camera:** Google Pixel
- **Location:** Not extracted (null)
- **Notes:** Motion Photo, edited version

### 4. PXL_20241128_004843639-EDIT.jpg
- **Date:** November 28, 2024
- **Time:** 00:48:43 (12:48 AM)
- **Size:** ~1.9 MB
- **Camera:** Google Pixel
- **Location:** Not extracted (null)
- **Notes:** Late night/early morning, edited

### 5. PXL_20241205_105347814.NIGHT.jpg
- **Date:** December 5, 2024
- **Time:** 10:53:47 (10:53 AM)
- **Size:** ~992 KB
- **Camera:** Google Pixel
- **Location:** Not extracted (null)
- **Notes:** Night mode photo (despite morning timestamp)

### 6. cat.jpg
- **Date:** Unknown
- **Time:** Unknown
- **Size:** ~3.1 MB
- **Camera:** Unknown
- **Location:** Not extracted (null)
- **Notes:** Generic filename, no timestamp data

## Location Data Extraction

### Method 1: Using ExifTool (Recommended)
```bash
# Install exiftool first
# Then run:
exiftool -GPSLatitude -GPSLongitude -GPSPosition -GPSAltitude *.jpg

# Or save to a file:
exiftool -GPSPosition -csv *.jpg > gallery_locations.csv
```

### Method 2: Using Python with Pillow
```python
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def get_gps_info(image_path):
    img = Image.open(image_path)
    exif = img._getexif()
    
    if not exif:
        return None
    
    gps_info = {}
    for tag_id, value in exif.items():
        tag = TAGS.get(tag_id, tag_id)
        if tag == 'GPSInfo':
            for gps_tag_id, gps_value in value.items():
                gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                gps_info[gps_tag] = gps_value
    
    return gps_info

# Example usage
for img in ['PXL_20240315_132744500.MP-EDIT.jpg', ...]:
    gps = get_gps_info(img)
    print(f"{img}: {gps}")
```

### Method 3: Online Tools
1. **exifdata.com** - Upload images to view metadata
2. **pic2map.com** - Shows photos on a map
3. **metapicz.com** - Drag and drop EXIF viewer

### Method 4: Google Photos
Since these are Google Pixel photos:
1. Open Google Photos
2. Select the photo
3. Tap the info icon (i)
4. View location on map

## Google Pixel Filename Format

The filenames follow this pattern:
```
PXL_YYYYMMDD_HHMMSS[.extension][-suffix].jpg

Examples:
- PXL_20240315_132744500.MP-EDIT.jpg
  └─ 2024-03-15 at 13:27:44.500 (Motion Photo, Edited)
  
- PXL_20241205_105347814.NIGHT.jpg
  └─ 2024-12-05 at 10:53:47.814 (Night Mode)
```

### Components:
- **PXL_** - Google Pixel identifier
- **YYYYMMDD** - Date (Year, Month, Day)
- **HHMMSS** - Time (24-hour format)
- **.MP** - Motion Photo (3-second video clip embedded)
- **-EDIT** - Edited in Google Photos
- **.NIGHT** - Night Sight mode used

## Storage Notes

All images are stored in: `assets/images/gallery/`

Total gallery size: ~13.5 MB
- Largest: cat.jpg (3.1 MB)
- Smallest: PXL_20241205_105347814.NIGHT.jpg (992 KB)

## Updating Location Data

Once you extract location data, update `data/gallery.json`:

```json
{
  "src": "assets/images/gallery/PXL_20240315_132744500.MP-EDIT.jpg",
  "thumbnail": "assets/images/gallery/PXL_20240315_132744500.MP-EDIT.jpg",
  "title": "March 2024",
  "description": "Captured in the afternoon",
  "alt": "Photo taken on March 15, 2024 at 13:27",
  "ratio": "square",
  "date": "2024-03-15",
  "time": "13:27:44",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "name": "New York, NY",
    "altitude": 10.5
  }
}
```

## Privacy Consideration

These photos contain timestamps but location data has been stripped or is embedded in a format that requires specialized tools to extract. If sharing publicly, consider:
- Removing EXIF data entirely: `exiftool -all= *.jpg`
- Or only removing GPS: `exiftool -GPS:All= *.jpg`