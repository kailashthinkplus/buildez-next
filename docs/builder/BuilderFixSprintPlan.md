# Builder Fix Sprint Plan

Date: 2026-07-08  
Phase: BSP-6  
Status: Ordered fix sprint plan

This plan converts BSP-2 fix waves into an execution sequence. It does not apply fixes.

## Sprint 1: Serialization, Schema, and History Transactions

Goal: Establish the stable mutation and persistence contract.

Primary bugs: BUG-0037, BUG-0025, BUG-0038, BUG-0031, BUG-0032, BUG-0033.  
Required outcomes: versioned blueprint schema, save-time validation, bounded history, transaction grouping, compile-safe specs promoted toward executable tests.

## Sprint 2: Responsive Architecture and Inspector Binding Proof

Primary bugs: BUG-0002, BUG-0019, BUG-0049, BUG-0007, BUG-0044.  
Required outcomes: desktop/tablet/mobile value model, canvas/inspector device sync, binding proof harness, unsafe inspector controls identified.

## Sprint 3: Canvas, Runtime, Preview, and Publish Parity

Primary bugs: BUG-0039, BUG-0026, BUG-0027, BUG-0004, BUG-0009.  
Required outcomes: parity baseline, preview contract, publish contract, header/footer editability policy input, full/boxed behavior baseline.

## Sprint 4: Clipboard, Layers Sorting, and Layout Repair Basics

Primary bugs: BUG-0010, BUG-0011, BUG-0015, BUG-0035, BUG-0036, BUG-0046.  
Required outcomes: copy/paste node, copy/paste style, sortable layers, reorder/reparent constraints, manual repair loop.

## Sprint 5: Inspector UX Controls

Primary bugs: BUG-0001, BUG-0006, BUG-0008, BUG-0040, BUG-0048.  
Required outcomes: professional color picker, unit picker, alignment controls, rich text policy, dead-control cleanup.

## Sprint 6: Theme Panels, Header/Footer Policy, and Column Selector

Primary bugs: BUG-0016, BUG-0017, BUG-0041, BUG-0004, BUG-0018.  
Required outcomes: theme colors, theme settings, editable header/footer policy, column structure selector.

## Sprint 7: AI Compatibility Remediation

Primary bugs: BUG-0002, BUG-0007, BUG-0024, BUG-0025, BUG-0026, BUG-0027, BUG-0031, BUG-0033, BUG-0037, BUG-0039.  
Required outcomes: rescore BSP-5 contracts, enable safe claims only where validated, keep AI mutation blocked until release gate passes.

## Sprint 8: Final QA and Regression

Primary bugs: all remaining blocker/critical/high release-gate bugs.  
Required outcomes: regression suite run, stress suite run, manual QA checklist pass, Builder Quality Score 90+, AI Compatibility 90+, final release gate pass.
