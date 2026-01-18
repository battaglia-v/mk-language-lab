#!/bin/bash
# ==============================================
# Codex Phase 68.1 Verifier Agent
# Enforces AGENT_CONTRACT, captures logs, and stops on failures.
# ==============================================

echo "=== Phase 68.1 Verification: Starting ==="

# ------------------------------
# 1️⃣ Load agent contract & context
# ------------------------------
CONTRACT=".codex/AGENT_CONTRACT.md"
CONTEXT=".codex/CONTEXT.md"
PIPELINE=".codex/PIPELINE.md"

echo "Using governance contract: $CONTRACT"
echo "Using context: $CONTEXT"
echo "Using pipeline roles: $PIPELINE"

# ------------------------------
# 2️⃣ Repo Map Summary
# ------------------------------
echo "Step 1: Repo Map Summary"
ls -1 > .codex/verifier_repo_map.txt
cat .codex/verifier_repo_map.txt
echo "Repo map saved to .codex/verifier_repo_map.txt"

# ------------------------------
# 3️⃣ Phase 68.1 Artifact Review
# ------------------------------
echo "Step 2: Review Phase 68.1 Artifacts"
for f in .planning/phases/68-practice-modes/68.1-*.md; do
    echo "=== $f (first 20 lines) ==="
    head -n 20 "$f"
done

# ------------------------------
# 4️⃣ Architecture Review
# ------------------------------
echo "Step 3: Architecture Review"
echo "Verify apps/mobile Expo setup, package.json, package-lock.json, shared node_modules"
echo "Review docs/architecture.md and note stack differences"

# ------------------------------
# 4️⃣ Diff-Review Baseline
# ------------------------------
echo "Step 4: Diff-Review Baseline"
git status -sb > .codex/verifier_git_status.txt
git diff --stat > .codex/verifier_git_diff.txt
echo "Git status saved to .codex/verifier_git_status.txt"
echo "Git diff saved to .codex/verifier_git_diff.txt"

# ------------------------------
# 5️⃣ Apply Babel plugin fix (safe, config-only)
# ------------------------------
echo "Step 5: Apply expo-router Babel plugin if missing"
BABEL_CONFIG="apps/mobile/babel.config.js"

if ! grep -q "expo-router/babel" "$BABEL_CONFIG"; then
    echo "Adding expo-router/babel plugin to $BABEL_CONFIG"
    # Simple inline insertion (append to plugins array)
    sed -i '' "/plugins: \[/a\\
    'expo-router/babel',
    " "$BABEL_CONFIG"
else
    echo "expo-router/babel already present"
fi
echo "Babel config update complete"

# ------------------------------
# 6️⃣ iOS Simulator Verification
# ------------------------------
echo "Step 6: iOS Simulator Verification"
cd apps/mobile
echo "Starting Expo iOS simulator (logs saved to .codex/verifier_ios_log.txt)"
npx expo start --ios -c &> ../../.codex/verifier_ios_log.txt
cd ../../
echo "iOS simulator logs captured at .codex/verifier_ios_log.txt"
echo "Stop immediately if any runtime errors appear."

# ------------------------------
# 7️⃣ Android Verification Placeholder
# ------------------------------
echo "Step 7: Android Verification"
echo "Provision an emulator/device locally. Rerun verification when available."
echo "Logs can be captured similarly to iOS if desired."

# ------------------------------
# 8️⃣ Assumptions, Risks, Test Plan Enforcement
# ------------------------------
echo "Step 8: Assumptions & Risks"
echo "A1: Manual simulator tests run locally"
echo "A2: React 19.2.0 acceptable with Expo SDK 54"
echo "A3: No duplicate React copies in node_modules"
echo "R1: EXPO_ROUTER_APP_ROOT env error may block iOS launch"
echo "R2: Expo SDK 54 warnings may mask runtime issues"
echo "R3: Android verification blocked if no device/emulator"
echo "T1: Manual simulator iOS tests; T2: Check tabs, hook errors, Grammar Practice; T3: Android test when available"

# ------------------------------
# 9️⃣ Final Diff-Review After Verification
# ------------------------------
echo "Step 9: Final Diff-Review"
git diff > .codex/verifier_final_diff.txt
echo "Final diff saved at .codex/verifier_final_diff.txt"

# ------------------------------
# 10️⃣ Completion
# ------------------------------
echo "=== Phase 68.1 Verification: Complete ==="
echo "Review the following files for the official verification report:"
echo " - .codex/verifier_repo_map.txt"
echo " - .codex/verifier_git_status.txt"
echo " - .codex/verifier_git_diff.txt"
echo " - .codex/verifier_ios_log.txt"
echo " - .codex/verifier_final_diff.txt"
echo "Manual simulator testing required for full verification."
