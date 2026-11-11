import os
import re
import sys

FORBIDDEN_PHRASES = [
    # Reference copy
    "NEW Your knowledge base + enterprise search",
    "Where knowledge goes to die",
    "What will you discover today?",
    "SO simple and useful",
    "Martijn Hazelaar",
    "Flexdealer",
    "Logically File Annotator",
    "Slite delivers beautiful documentation",
    "Ask a general knowledge question",
    "COMM 112",
    "COMM 185",
    "College Vlog",
    "Media Richness Theory",
    # Overclaims
    "skip hallucinated answers",
    "skip hallucination",
    "deterministic Directed Acyclic Graph",
    "links deterministically",
    "256-bit isolation",
    "Citation Integrity: 100% verified",
    # Invented proof
    "annual_financial_report.pdf",
    "Operating revenue rose to $120.4 million",
    # Internship in UI
    "ShadowFox AI Track Advanced Level",
]

# Patterns for fake scores or invented claims in JSX
SUSPICIOUS_PATTERNS = [
    r'18 chunks indexed \(768-dim\)',
    r'Passed 0\.700',
    r'ws:visitor',
]

def scan_frontend_files():
    base_dir = os.path.abspath("frontend/src")
    findings = []
    
    for root, dirs, files in os.walk(base_dir):
        # Skip test files and mock data
        if "test" in root or "__tests__" in root:
            continue
        for file in files:
            if not file.endswith((".jsx", ".js", ".html")):
                continue
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            for phrase in FORBIDDEN_PHRASES:
                if phrase.lower() in content.lower():
                    findings.append({
                        "file": os.path.relpath(path),
                        "type": "FORBIDDEN_PHRASE",
                        "match": phrase
                    })
                    
            for pat in SUSPICIOUS_PATTERNS:
                matches = re.findall(pat, content, re.IGNORECASE)
                if matches:
                    findings.append({
                        "file": os.path.relpath(path),
                        "type": "SUSPICIOUS_PATTERN",
                        "match": matches[0]
                    })
                    
    return findings

def main():
    print("=" * 60)
    print("NEXUSRAG REAL-DATA & ORIGINALITY AUDIT")
    print("=" * 60)
    
    findings = scan_frontend_files()
    if findings:
        print(f"FAILED: Found {len(findings)} prohibited phrases or patterns:")
        for item in findings:
            print(f"  - [{item['type']}] {item['file']}: '{item['match']}'")
        sys.exit(1)
    else:
        print("PASSED: 0 forbidden phrases, 0 copied reference strings, 0 overclaims found in frontend/src.")
        print("Scanned all .jsx, .js, .html production files cleanly.")

if __name__ == "__main__":
    main()

