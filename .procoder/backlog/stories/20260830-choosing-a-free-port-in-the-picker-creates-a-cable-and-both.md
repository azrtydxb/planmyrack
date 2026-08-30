# Choosing a free port in the picker creates a cable and both ports then read as connected — `TestConnectFreePorts` — fails if the link is absent from the layout or either endpoint still reports as free.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-6 (Port-to-port connections)
Plan: Task 5: Connections — network ports and PDU outlets and Task 16: Port picker, cable overlay and cable schedule
Test: `TestConnectFreePorts`

The home-lab owner needs this to hold: choosing a free port in the picker creates a cable and both ports then read as connected.

Done when `TestConnectFreePorts` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Choosing a free port in the picker creates a cable and both ports then read as connected — `TestConnectFreePorts` — fails if the link is absent from the layout or either endpoint still reports as free.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

