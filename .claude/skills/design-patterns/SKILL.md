---
name: design-patterns
description: >-
  Apply design patterns for architecture design before writing code.
  Analyze requirements to select appropriate creational, structural,
  behavioral, or architectural patterns that improve reusability,
  maintainability, extensibility, and reduce coupling. Use when starting
  new features, refactoring existing code, building modules/services,
  designing APIs, or when the user mentions design patterns, architecture
  design, SOLID principles, code structure, or decoupling.
---

# Design Patterns Architecture Guide

## Core Workflow

Before writing implementation code, follow this process:

### Step 1: Analyze Requirements

Identify from the task:
- **Entities & responsibilities**: What objects/modules exist? What does each do?
- **Variation points**: What is likely to change or extend in the future?
- **Relationships**: How do components interact? What are the dependencies?
- **Constraints**: Performance, concurrency, persistence, or framework limitations?

### Step 2: Check SOLID Violations

Evaluate the current or planned design against SOLID:

| Principle | Check | Red Flag |
|-----------|-------|----------|
| **S**ingle Responsibility | Does each class/module have one reason to change? | God class, mixed concerns |
| **O**pen/Closed | Can behavior be extended without modifying existing code? | Frequent edits to core classes |
| **L**iskov Substitution | Can subtypes replace base types without breaking? | Type checks, conditional casting |
| **I**nterface Segregation | Are interfaces focused and minimal? | Fat interfaces with unused methods |
| **D**ependency Inversion | Do high-level modules depend on abstractions? | Direct instantiation of dependencies |

### Step 3: Select Patterns

Match problems to patterns using this decision guide:

**Object Creation Problems:**
- Need to decouple instantiation from usage → **Factory Method / Abstract Factory**
- Complex object with many optional params → **Builder**
- Need exactly one instance globally → **Singleton** (use sparingly)
- Create objects by cloning → **Prototype**

**Structure & Composition Problems:**
- Incompatible interfaces need to work together → **Adapter**
- Add behavior without modifying classes → **Decorator**
- Simplify a complex subsystem → **Facade**
- Represent part-whole hierarchies → **Composite**
- Share fine-grained objects efficiently → **Flyweight**
- Control access or add cross-cutting concerns → **Proxy**
- Separate abstraction from implementation → **Bridge**

**Behavior & Communication Problems:**
- Switch algorithms at runtime → **Strategy**
- Notify multiple objects of state changes → **Observer / Event Bus**
- Encapsulate requests as objects → **Command**
- Define a skeleton algorithm, let subclasses fill steps → **Template Method**
- Process requests through a chain → **Chain of Responsibility**
- Traverse collections without exposing internals → **Iterator**
- Add operations to objects without changing their classes → **Visitor**
- Manage object state transitions → **State**
- Reduce direct dependencies between objects → **Mediator**
- Capture and restore object state → **Memento**
- Define a grammar and interpret sentences → **Interpreter**

**Architecture-Level Problems:**
- Separate presentation, logic, and data → **MVC / MVP / MVVM**
- Decouple data access from business logic → **Repository**
- Separate read/write models for scalability → **CQRS**
- Build event-driven audit trails → **Event Sourcing**
- Orchestrate complex business processes → **Saga**
- Expose clean service boundaries → **Service Layer**
- Handle cross-cutting concerns (logging, auth) → **Middleware / Pipeline**
- Invert control of dependencies → **Dependency Injection**

### Step 4: Design Before Code

Present the architecture decision:

```
## Architecture Design

### Problem Analysis
[1-2 sentences describing the core design challenge]

### Selected Pattern(s): [Pattern Name]
**Reason**: [Why this pattern fits the problem]

### Component Structure
- ComponentA (role): responsibility
- ComponentB (role): responsibility
- Interface/Abstract: contract definition

### Key Interactions
[Brief description of how components collaborate]
```

Then proceed to implementation.

## Pattern Application Rules

1. **Prefer composition over inheritance** — use interfaces/protocols + delegation
2. **Don't over-engineer** — apply patterns only when they solve a real problem, not preemptively for hypothetical future needs
3. **Combine patterns wisely** — patterns often work together (e.g., Strategy + Factory, Observer + Mediator)
4. **Keep it idiomatic** — adapt patterns to the language's conventions (e.g., use closures instead of Strategy classes in functional languages)
5. **Name components after their pattern roles** — `UserFactory`, `PaymentStrategy`, `OrderObserver` make intent clear

## When to Skip This Workflow

- Simple scripts or one-off utilities
- Trivial CRUD with no business logic
- Bug fixes that don't affect architecture
- Configuration changes or data updates
- The user explicitly says "just write the code"

## Pattern Reference

For detailed pattern descriptions, structure diagrams, and usage examples, see [patterns-reference.md](patterns-reference.md).
