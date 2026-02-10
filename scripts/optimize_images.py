#!/usr/bin/env python3
"""
Image optimization script for web performance.
Compresses JPEGs and generates WebP versions for all gallery images.
"""

import os
import sys
from PIL import Image
from pathlib import Path

# Set UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

# Configuration
GALLERY_DIR = Path("assets/images/gallery")
MAX_WIDTH = 1200  # Max width for gallery display
MAX_HEIGHT = 1200  # Max height for gallery display
JPEG_QUALITY = 85  # Good balance of quality vs size
WEBP_QUALITY = 80  # WebP can use slightly lower quality
TARGET_MAX_SIZE_KB = 500  # Target max file size in KB

def get_image_files(directory):
    """Get all image files in directory."""
    image_extensions = {'.jpg', '.jpeg', '.png'}
    return [f for f in directory.iterdir() 
            if f.is_file() and f.suffix.lower() in image_extensions]

def get_file_size_kb(filepath):
    """Get file size in KB."""
    return os.path.getsize(filepath) / 1024

def optimize_image(input_path, output_jpg_path, output_webp_path):
    """Optimize image and create WebP version."""
    with Image.open(input_path) as img:
        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Get original dimensions
        orig_width, orig_height = img.size
        
        # Calculate new dimensions if resizing is needed
        if orig_width > MAX_WIDTH or orig_height > MAX_HEIGHT:
            ratio = min(MAX_WIDTH / orig_width, MAX_HEIGHT / orig_height)
            new_width = int(orig_width * ratio)
            new_height = int(orig_height * ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"  Resized: {orig_width}x{orig_height} -> {new_width}x{new_height}")
        
        # Save optimized JPEG
        img.save(output_jpg_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
        
        # Save WebP version
        img.save(output_webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        
        jpg_size = get_file_size_kb(output_jpg_path)
        webp_size = get_file_size_kb(output_webp_path)
        
        return jpg_size, webp_size

def main():
    print("=" * 60)
    print("Image Optimization Tool")
    print("=" * 60)
    
    if not GALLERY_DIR.exists():
        print(f"Error: Directory not found: {GALLERY_DIR}")
        sys.exit(1)
    
    image_files = get_image_files(GALLERY_DIR)
    
    if not image_files:
        print("No image files found in gallery directory.")
        sys.exit(0)
    
    print(f"\nFound {len(image_files)} images to optimize\n")
    
    total_original = 0
    total_optimized = 0
    total_webp = 0
    
    for img_path in sorted(image_files):
        print(f"Processing: {img_path.name}")
        
        original_size = get_file_size_kb(img_path)
        total_original += original_size
        
        # Create optimized filenames
        base_name = img_path.stem
        optimized_jpg = GALLERY_DIR / f"{base_name}_opt.jpg"
        webp_path = GALLERY_DIR / f"{base_name}.webp"
        
        try:
            jpg_size, webp_size = optimize_image(img_path, optimized_jpg, webp_path)
            total_optimized += jpg_size
            total_webp += webp_size
            
            jpg_savings = ((original_size - jpg_size) / original_size) * 100
            webp_savings = ((original_size - webp_size) / original_size) * 100
            
            print(f"  Original: {original_size:.1f} KB")
            print(f"  Optimized JPEG: {jpg_size:.1f} KB ({jpg_savings:.1f}% smaller)")
            print(f"  WebP: {webp_size:.1f} KB ({webp_savings:.1f}% smaller)")
            print()
            
        except Exception as e:
            print(f"  Error: {e}\n")
    
    print("=" * 60)
    print("Optimization Summary")
    print("=" * 60)
    print(f"Total original size: {total_original:.1f} KB ({total_original/1024:.1f} MB)")
    print(f"Total optimized JPEG: {total_optimized:.1f} KB ({total_optimized/1024:.1f} MB)")
    print(f"Total WebP: {total_webp:.1f} KB ({total_webp/1024:.1f} MB)")
    print()
    print(f"JPEG savings: {((total_original - total_optimized) / total_original) * 100:.1f}%")
    print(f"WebP savings: {((total_original - total_webp) / total_original) * 100:.1f}%")
    print()
    print("Optimized files created with '_opt' suffix and '.webp' extension")
    print("=" * 60)

if __name__ == "__main__":
    main()
