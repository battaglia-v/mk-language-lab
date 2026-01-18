#!/bin/bash
# ==============================================
# Codex Phase 68.1 Verification Report
# Runs verification steps and compiles a report.
# ==============================================

echo "=== Phase 68.1 Verification Report: Starting ==="

# ------------------------------
# 1) Load agent contract & context
# ------------------------------
CONTRACT=".codex/AGENT_CONTRACT.md"
CONTEXT=".codex/CONTEXT.md"
PIPELINE=".codex/PIPELINE.md"

echo "Using governance contract: $CONTRACT"
echo "Using context: $CONTEXT"
echo "Using pipeline roles: $PIPELINE"

# ------------------------------
# 2) Repo Map Summary
# ------------------------------
echo "Step 1: Repo Map Summary"
ls -1 > .codex/verifier_repo_map.txt
echo "Repo map saved to .codex/verifier_repo_map.txt"

# ------------------------------
# 3) Phase 68.1 Artifact Review
# ------------------------------
echo "Step 2: Review Phase 68.1 Artifacts"
ARTIFACTS_OUT=".codex/verifier_artifacts_excerpt.txt"
: > "$ARTIFACTS_OUT"
for f in .planning/phases/68-practice-modes/68.1-*.md; do
    echo "=== $f (first 20 lines) ===" >> "$ARTIFACTS_OUT"
    head -n 20 "$f" >> "$ARTIFACTS_OUT"
    echo "" >> "$ARTIFACTS_OUT"
done
echo "Artifacts excerpt saved to $ARTIFACTS_OUT"

# ------------------------------
# 4) Architecture Review
# ------------------------------
echo "Step 3: Architecture Review"
ARCH_OUT=".codex/verifier_architecture_notes.txt"
cat <<'EOF' > "$ARCH_OUT"
Verify apps/mobile Expo setup, package.json, package-lock.json, shared node_modules
Review docs/architecture.md and note stack differences
EOF
echo "Architecture notes saved to $ARCH_OUT"

# ------------------------------
# 5) Diff-Review Baseline
# ------------------------------
echo "Step 4: Diff-Review Baseline"
git status -sb > .codex/verifier_git_status.txt
git diff --stat > .codex/verifier_git_diff.txt
echo "Git status saved to .codex/verifier_git_status.txt"
echo "Git diff saved to .codex/verifier_git_diff.txt"

# ------------------------------
# 6) Apply Babel plugin fix (safe, config-only)
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
# 7) iOS Simulator Verification
# ------------------------------
echo "Step 6: iOS Simulator Verification"
cd apps/mobile
echo "Starting Expo iOS simulator (logs saved to .codex/verifier_ios_log.txt)"
npx expo start --ios -c &> ../../.codex/verifier_ios_log.txt
cd ../../
echo "iOS simulator logs captured at .codex/verifier_ios_log.txt"
echo "Stop immediately if any runtime errors appear."

# ------------------------------
# 8) Android Verification Placeholder
# ------------------------------
echo "Step 7: Android Verification"
ANDROID_NOTE=".codex/verifier_android_note.txt"
cat <<'EOF' > "$ANDROID_NOTE"
Provision an emulator/device locally. Rerun verification when available.
Logs can be captured similarly to iOS if desired.
EOF
echo "Android note saved to $ANDROID_NOTE"

# ------------------------------
# 9) Assumptions, Risks, Test Plan Enforcement
# ------------------------------
echo "Step 8: Assumptions & Risks"
ASSUMPTIONS_OUT=".codex/verifier_assumptions_risks_test_plan.txt"
cat <<'EOF' > "$ASSUMPTIONS_OUT"
A1: Manual simulator tests run locally
A2: React 19.2.0 acceptable with Expo SDK 54
A3: No duplicate React copies in node_modules
R1: EXPO_ROUTER_APP_ROOT env error may block iOS launch
R2: Expo SDK 54 warnings may mask runtime issues
R3: Android verification blocked if no device/emulator
T1: Manual simulator iOS tests; T2: Check tabs, hook errors, Grammar Practice; T3: Android test when available
EOF
echo "Assumptions/risks/test plan saved to $ASSUMPTIONS_OUT"

# ------------------------------
# 10) Final Diff-Review After Verification
# ------------------------------
echo "Step 9: Final Diff-Review"
git diff > .codex/verifier_final_diff.txt
echo "Final diff saved at .codex/verifier_final_diff.txt"

# ------------------------------
# 11) Report Assembly
# ------------------------------
echo "Step 10: Assemble report"
REPORT=".codex/Phase68.1_Verification_Report.md"
{
    echo "# Phase 68.1 Verification Report"
    echo ""
    echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo ""
    echo "## Governance"
    echo "- Contract: $CONTRACT"
    echo "- Context: $CONTEXT"
    echo "- Pipeline: $PIPELINE"
    echo ""
    echo "## Repo Map"
    cat .codex/verifier_repo_map.txt
    echo ""
    echo "## Artifacts (first 20 lines)"
    cat "$ARTIFACTS_OUT"
    echo ""
    echo "## Architecture Notes"
    cat "$ARCH_OUT"
    echo ""
    echo "## Diff Review (baseline)"
    echo "### git status -sb"
    cat .codex/verifier_git_status.txt
    echo ""
    echo "### git diff --stat"
    cat .codex/verifier_git_diff.txt
    echo ""
    echo "## iOS Log"
    cat .codex/verifier_ios_log.txt
    echo ""
    echo "## Android Note"
    cat "$ANDROID_NOTE"
    echo ""
    echo "## Assumptions / Risks / Test Plan"
    cat "$ASSUMPTIONS_OUT"
    echo ""
    echo "## Final Diff"
    cat .codex/verifier_final_diff.txt
} > "$REPORT"

echo "Report saved to $REPORT"
echo "=== Phase 68.1 Verification Report: Complete ==="
