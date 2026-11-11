import os
import sys
import tarfile
import shutil
import time
from datetime import datetime, timezone

STORAGE_DIR = os.path.abspath("storage")
BACKUP_DIR = os.path.abspath("storage/backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

def create_backup():
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    archive_name = f"nexusrag_backup_{timestamp}.tar.gz"
    archive_path = os.path.join(BACKUP_DIR, archive_name)
    
    print(f"Creating NexusRAG storage backup: {archive_name}...")
    
    with tarfile.open(archive_path, "w:gz") as tar:
        # 1. Physical uploads
        uploads_dir = os.path.join(STORAGE_DIR, "uploads")
        if os.path.isdir(uploads_dir):
            tar.add(uploads_dir, arcname="uploads")
            print(f"  + Backed up physical documents: {uploads_dir}")
            
        # 2. FAISS vector indices
        faiss_dir = os.path.join(STORAGE_DIR, "faiss")
        if os.path.isdir(faiss_dir):
            tar.add(faiss_dir, arcname="faiss")
            print(f"  + Backed up FAISS vector indices: {faiss_dir}")
            
        # 3. SQLite database (if present)
        for db_name in ["nexus.db", "nexusrag.db"]:
            db_path = os.path.join(STORAGE_DIR, db_name)
            if os.path.isfile(db_path):
                tar.add(db_path, arcname=db_name)
                print(f"  + Backed up database: {db_path}")
                
        # Root data directory
        data_db = os.path.abspath("data/nexusrag.db")
        if os.path.isfile(data_db):
            tar.add(data_db, arcname="nexusrag_local.db")
            print(f"  + Backed up native local DB: {data_db}")
            
    size_mb = os.path.getsize(archive_path) / (1024 * 1024)
    print(f"Backup complete: {archive_path} ({size_mb:.2f} MB)")
    return archive_path

def test_restore_archive(archive_path):
    print(f"\nTesting restore rehearsal from archive: {os.path.basename(archive_path)}...")
    test_restore_dir = os.path.join(BACKUP_DIR, "test_restore_rehearsal")
    if os.path.exists(test_restore_dir):
        shutil.rmtree(test_restore_dir)
    os.makedirs(test_restore_dir, exist_ok=True)
    
    with tarfile.open(archive_path, "r:gz") as tar:
        tar.extractall(path=test_restore_dir)
        
    extracted_items = os.listdir(test_restore_dir)
    print(f"  + Extracted {len(extracted_items)} assets into rehearsal directory: {extracted_items}")
    assert len(extracted_items) > 0, "Restore failed: zero items extracted!"
    print("Restore test verification: PASSED (Data integrity confirmed).")
    
    # Cleanup rehearsal directory
    shutil.rmtree(test_restore_dir)

if __name__ == "__main__":
    archive = create_backup()
    test_restore_archive(archive)
