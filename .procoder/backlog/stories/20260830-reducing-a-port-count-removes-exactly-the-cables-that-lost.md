# Reducing a port count removes exactly the cables that lost their port, and undo restores them — `TestPortReductionPrunesExactLinks` — fails if a surviving link points at an index beyond the new count, or an unaffected link is removed.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-15 (Undo/redo and integrity)
Plan: Task 5: Connections — network ports and PDU outlets
Test: `TestPortReductionPrunesExactLinks`

The home-lab owner needs this to hold: reducing a port count removes exactly the cables that lost their port, and undo restores them.

Done when `TestPortReductionPrunesExactLinks` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Reducing a port count removes exactly the cables that lost their port, and undo restores them — `TestPortReductionPrunesExactLinks` — fails if a surviving link points at an index beyond the new count, or an unaffected link is removed.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

