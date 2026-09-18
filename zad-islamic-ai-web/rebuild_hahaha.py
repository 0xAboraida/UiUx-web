from pathlib import Path
import subprocess
import tempfile
import shutil
import os

# =========================
# Configuration
# =========================

PROJECT_ROOT = Path.cwd()

DIFF_FILE = PROJECT_ROOT.parent / "figma code" / "diff.txt"

TARGET_FILE = PROJECT_ROOT / "src" / "features" / "knowledge" / "KnowledgeBase.tsx"

OUTPUT_FILE = (
    PROJECT_ROOT / "src" / "features" / "knowledge" / "KnowledgeBase.recovered.tsx"
)

GIT_PATH = "zad-islamic-ai-web/src/features/knowledge/KnowledgeBase.tsx"


# =========================
# Check files
# =========================

if not DIFF_FILE.exists():
    raise FileNotFoundError(f"diff.txt not found:\n{DIFF_FILE}")

print(f"Diff file : {DIFF_FILE}")
print(f"Target    : {TARGET_FILE}")
print(f"Output    : {OUTPUT_FILE}")


# =========================
# Get old version from Git
# =========================

print("\n[1/4] Getting old version from Git...")

result = subprocess.run(
    ["git", "show", f"HEAD:{GIT_PATH}"], cwd=PROJECT_ROOT, capture_output=True
)

if result.returncode != 0:
    print(result.stderr.decode(errors="replace"))
    raise RuntimeError("Could not retrieve the old version from Git.")

old_code = result.stdout.decode("utf-8", errors="replace")

print(f"Old version: {len(old_code.splitlines())} lines")


# =========================
# Create temporary structure
# =========================

print("\n[2/4] Creating temporary patch workspace...")

temp_dir = Path(tempfile.mkdtemp(prefix="zad_recover_"))

try:
    temp_target = temp_dir / GIT_PATH
    temp_target.parent.mkdir(parents=True, exist_ok=True)

    temp_target.write_text(old_code, encoding="utf-8")

    temp_diff = temp_dir / "diff.txt"

    shutil.copy2(DIFF_FILE, temp_diff)

    # =========================
    # Apply diff
    # =========================

    print("[3/4] Applying diff...")

    result = subprocess.run(
        [
            "git",
            "apply",
            "--unsafe-paths",
            "--directory",
            str(temp_dir),
            str(temp_diff),
        ],
        cwd=PROJECT_ROOT,
        capture_output=True,
    )

    if result.returncode != 0:

        print("\n❌ Git could not apply the diff automatically.")

        print("\nSTDERR:")
        print(result.stderr.decode(errors="replace"))

        print("\nSTDOUT:")
        print(result.stdout.decode(errors="replace"))

        raise RuntimeError("Patch could not be applied.")

    # =========================
    # Read recovered file
    # =========================

    print("[4/4] Reading recovered file...")

    if not temp_target.exists():
        raise FileNotFoundError(f"Recovered file was not created:\n{temp_target}")

    recovered_code = temp_target.read_text(encoding="utf-8", errors="replace")

    OUTPUT_FILE.write_text(recovered_code, encoding="utf-8")

    print("\n========================================")
    print("✅ RECOVERY SUCCESSFUL")
    print("========================================")
    print(f"Recovered lines: {len(recovered_code.splitlines())}")
    print(f"Output file:")
    print(OUTPUT_FILE)
    print("========================================")


finally:
    shutil.rmtree(temp_dir, ignore_errors=True)
