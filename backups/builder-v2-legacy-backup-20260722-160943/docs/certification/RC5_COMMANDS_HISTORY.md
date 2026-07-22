# Builder RC-5 — Commands & History Certification

Status: 🟡 IN PROGRESS

---

## Certification Scope

### Command System

- [ ] Insert Node
- [ ] Delete Node
- [ ] Update Node
- [ ] Duplicate Node
- [ ] Move Node
- [ ] Wrap Node
- [ ] Unwrap Node
- [ ] Paste Node
- [ ] Cross-container move
- [ ] Section insertion
- [ ] Block insertion

---

### History

- [ ] Undo
- [ ] Redo
- [ ] Multi-step Undo
- [ ] Multi-step Redo
- [ ] History integrity
- [ ] Transaction rollback
- [ ] Failed command rollback

---

### Stress Tests

- [ ] 100 sequential commands
- [ ] 250 sequential commands
- [ ] 500 sequential commands
- [ ] Random undo/redo
- [ ] Nested container operations

---

### Production Requirements

- No Blueprint corruption

- No orphan nodes

- No duplicate IDs

- No history desynchronization

- Undo/Redo deterministic

