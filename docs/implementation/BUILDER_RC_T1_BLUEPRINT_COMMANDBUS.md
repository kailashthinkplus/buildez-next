# Builder RC-T1 — Blueprint and CommandBus

Implemented an executable `node:test` + `tsx` Builder harness, adapted regression descriptors into real assertions, and added native Blueprint/CommandBus integrity coverage. Fixed phantom undo history for unchanged commands and corrected test fixture serialization of optional fields.

Verification: typecheck passed; Blueprint 32/32; CommandBus 55/55; RC-T1 87/87 twice. The full inventory reports 314/320 with six documented later-phase P2 failures. No CI workflow exists; package commands are CI-ready.
