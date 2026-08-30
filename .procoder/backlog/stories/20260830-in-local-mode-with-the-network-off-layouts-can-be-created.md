# In local mode with the network off, layouts can be created, edited and reopened, and edits survive a full restart with no explicit save — `TestLocalModePersistsWithoutNetwork` — fails if any edit is lost across a restart, or the client issues an HTTP request in local mode.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-8 (Local mode storage)
Plan: Task 19: Layouts screen, import, autosave and the conflict path
Test: `TestLocalModePersistsWithoutNetwork`

The home-lab owner needs this to hold: in local mode with the network off, layouts can be created, edited and reopened, and edits survive a full restart with no explicit save.

Done when `TestLocalModePersistsWithoutNetwork` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] In local mode with the network off, layouts can be created, edited and reopened, and edits survive a full restart with no explicit save — `TestLocalModePersistsWithoutNetwork` — fails if any edit is lost across a restart, or the client issues an HTTP request in local mode.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

