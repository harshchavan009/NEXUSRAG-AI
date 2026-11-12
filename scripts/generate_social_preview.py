#!/usr/bin/env python3
"""
Generate a GitHub Social Preview Open Graph image (1280x640)
Composites unmocked real workspace screenshots from the live application.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1280
HEIGHT = 640
BG_COLOR = (15, 23, 42)          # slate-900
PANEL_BG = (30, 41, 59)          # slate-800
BORDER_COLOR = (51, 65, 85)      # slate-700
ACCENT_BLUE = (56, 189, 248)     # sky-400
TEXT_WHITE = (248, 250, 252)     # slate-50
TEXT_MUTED = (148, 163, 184)     # slate-400
TEXT_LIGHT = (203, 213, 225)     # slate-300
TAG_BG = (30, 41, 59)            # slate-800
TAG_BORDER = (71, 85, 105)       # slate-600

def get_font(size, bold=False):
    font_path = "/System/Library/Fonts/Helvetica.ttc"
    try:
        # index 0 is regular, index 1 is bold in Helvetica.ttc on macOS
        index = 1 if bold else 0
        return ImageFont.truetype(font_path, size, index=index)
    except Exception:
        try:
            return ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", size)
        except Exception:
            return ImageFont.load_default()

def generate_social_preview():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Subtle top border line
    draw.line([(0, 0), (WIDTH, 0)], fill=ACCENT_BLUE, width=4)

    # Fonts
    font_badge = get_font(13, bold=True)
    font_title = get_font(42, bold=True)
    font_subtitle = get_font(19, bold=False)
    font_tag = get_font(12, bold=True)
    font_meta = get_font(13, bold=False)

    # 1. Left branding block (x: 64 to 520)
    # Category badge
    draw.text((64, 60), "RESEARCH SYNTHESIS ENGINE", fill=ACCENT_BLUE, font=font_badge)

    # Title
    draw.text((64, 88), "NexusRAG", fill=TEXT_WHITE, font=font_title)

    # Subtitle
    subtitle_lines = [
        "Verifiable multi-document RAG with",
        "LangGraph state machine traces,",
        "sentence citations, and honest abstention."
    ]
    y_text = 154
    for line in subtitle_lines:
        draw.text((64, y_text), line, fill=TEXT_LIGHT, font=font_subtitle)
        y_text += 28

    # Feature tags (rectangular, rounded-md with radius 4)
    tags = [
        "Gemini 3.5 Flash Lite",
        "gemini-embedding-2 (768d)",
        "FAISS IndexIDMap2",
        "Strict Evidence Gate (0.650)",
        "Tenant-Isolated Workspaces",
        "FastAPI + React 18"
    ]
    tag_x = 64
    tag_y = 265
    for i, tag in enumerate(tags):
        # Measure text
        bbox = draw.textbbox((0, 0), tag, font=font_tag)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        pad_x = 10
        pad_y = 6
        tag_w = tw + pad_x * 2
        tag_h = th + pad_y * 2

        if tag_x + tag_w > 510:
            tag_x = 64
            tag_y += tag_h + 10

        draw.rounded_rectangle(
            [(tag_x, tag_y), (tag_x + tag_w, tag_y + tag_h)],
            radius=4,
            fill=TAG_BG,
            outline=TAG_BORDER,
            width=1
        )
        draw.text((tag_x + pad_x, tag_y + pad_y - 1), tag, fill=TEXT_WHITE, font=font_tag)
        tag_x += tag_w + 8

    # Bottom repository URL and license notice
    draw.line([(64, 550), (500, 550)], fill=BORDER_COLOR, width=1)
    draw.text((64, 566), "github.com/harshchavan009/NEXUSRAG-AI", fill=TEXT_MUTED, font=font_meta)
    draw.text((64, 588), "MIT Licensed • 51 Backend + 19 Frontend Tests Passing", fill=TEXT_MUTED, font=font_meta)

    # 2. Right Workspace Preview Frame (x: 540, y: 55, w: 680, h: 530)
    frame_x = 540
    frame_y = 55
    frame_w = 680
    frame_h = 530

    # Draw outer frame
    draw.rounded_rectangle(
        [(frame_x, frame_y), (frame_x + frame_w, frame_y + frame_h)],
        radius=8,
        fill=(15, 23, 42),
        outline=BORDER_COLOR,
        width=2
    )

    # Window title bar
    bar_h = 32
    draw.rounded_rectangle(
        [(frame_x, frame_y), (frame_x + frame_w, frame_y + bar_h)],
        radius=8,
        fill=(30, 41, 59)
    )
    # Fill bottom corners of title bar
    draw.rectangle(
        [(frame_x, frame_y + bar_h - 8), (frame_x + frame_w, frame_y + bar_h)],
        fill=(30, 41, 59)
    )
    draw.line([(frame_x, frame_y + bar_h), (frame_x + frame_w, frame_y + bar_h)], fill=BORDER_COLOR, width=1)

    # Window control dots (gray/subtle)
    dot_y = frame_y + 16
    draw.ellipse([(frame_x + 16, dot_y - 4), (frame_x + 24, dot_y + 4)], fill=(239, 68, 68))
    draw.ellipse([(frame_x + 32, dot_y - 4), (frame_x + 40, dot_y + 4)], fill=(234, 179, 8))
    draw.ellipse([(frame_x + 48, dot_y - 4), (frame_x + 56, dot_y + 4)], fill=(34, 197, 94))

    window_title = "NexusRAG - Research Desk with Interactive Sentence Citations"
    draw.text((frame_x + 72, frame_y + 8), window_title, fill=TEXT_MUTED, font=font_badge)

    # Load and crop real app screenshot
    screenshot_path = "frontend/public/screenshots/research.png"
    if os.path.exists(screenshot_path):
        sc_img = Image.open(screenshot_path).convert("RGB")
        target_w = frame_w - 4
        target_h = frame_h - bar_h - 4
        
        # Scale to width and crop to fit
        ratio = target_w / float(sc_img.width)
        scaled_h = int(float(sc_img.height) * ratio)
        sc_scaled = sc_img.resize((target_w, scaled_h), Image.Resampling.LANCZOS)
        
        if scaled_h > target_h:
            sc_cropped = sc_scaled.crop((0, 0, target_w, target_h))
        else:
            sc_cropped = sc_scaled
            
        img.paste(sc_cropped, (frame_x + 2, frame_y + bar_h + 1))

    # Save outputs
    os.makedirs("docs", exist_ok=True)
    os.makedirs("frontend/public", exist_ok=True)
    img.save("docs/social-preview.png", "PNG", optimize=True)
    img.save("frontend/public/social-preview.png", "PNG", optimize=True)
    print("Successfully generated docs/social-preview.png and frontend/public/social-preview.png (1280x640)")

if __name__ == "__main__":
    generate_social_preview()

