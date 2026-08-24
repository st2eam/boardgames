# Design Patterns Reference

## Creational Patterns

### Factory Method
**Intent**: Define an interface for creating objects, let subclasses decide which class to instantiate.
**Use when**: A class can't anticipate the type of objects it needs to create; creation logic should be delegated.
**Structure**: `Creator` declares `factoryMethod()` → `ConcreteCreator` overrides it → returns `ConcreteProduct`.
**Example scenario**: A notification system that creates EmailNotification, SMSNotification, or PushNotification based on user preferences.

### Abstract Factory
**Intent**: Create families of related objects without specifying concrete classes.
**Use when**: The system must work with multiple families of products (e.g., UI themes, database backends).
**Structure**: `AbstractFactory` declares creation methods → `ConcreteFactory` produces a family of `ConcreteProducts`.
**Example scenario**: A cross-platform UI toolkit producing Windows/Mac/Linux-specific buttons, dialogs, and menus.

### Builder
**Intent**: Construct complex objects step by step, separating construction from representation.
**Use when**: Object has many optional parameters; construction involves multiple steps; need to create different representations.
**Structure**: `Director` orchestrates → `Builder` defines steps → `ConcreteBuilder` implements → produces `Product`.
**Example scenario**: Building an HTTP request with optional headers, body, query params, auth tokens, and timeouts.

### Singleton
**Intent**: Ensure a class has exactly one instance with a global access point.
**Use when**: Exactly one instance is needed (connection pools, configuration, logging). Use sparingly — prefer DI.
**Caution**: Makes testing harder, introduces global state. Prefer dependency injection in most cases.

### Prototype
**Intent**: Create new objects by cloning existing ones.
**Use when**: Object creation is expensive; need copies with slight variations; avoid subclassing for each config.
**Example scenario**: A game level editor cloning pre-configured enemy templates with position overrides.

---

## Structural Patterns

### Adapter
**Intent**: Convert one interface to another that clients expect.
**Use when**: Integrating third-party libraries, legacy systems, or APIs with incompatible interfaces.
**Structure**: `Client` → `Target` interface ← `Adapter` wraps → `Adaptee`.
**Example scenario**: Wrapping a legacy XML payment API to conform to your JSON-based payment interface.

### Bridge
**Intent**: Separate an abstraction from its implementation so both can vary independently.
**Use when**: You want to avoid a cartesian product of subclasses (e.g., Shape × Renderer).
**Structure**: `Abstraction` holds reference to → `Implementor` interface ← `ConcreteImplementor`.
**Example scenario**: A messaging system where Message (email/SMS/push) × Formatter (plain/HTML/markdown) vary independently.

### Composite
**Intent**: Compose objects into tree structures; treat individual objects and compositions uniformly.
**Use when**: You have part-whole hierarchies (file systems, UI components, org charts).
**Structure**: `Component` interface ← `Leaf` and `Composite` (contains children Components).
**Example scenario**: A menu system where MenuItem and SubMenu share the same render/click interface.

### Decorator
**Intent**: Attach additional responsibilities to objects dynamically, as an alternative to subclassing.
**Use when**: Need to add behavior at runtime; avoid subclass explosion for feature combinations.
**Structure**: `Component` interface ← `ConcreteComponent` and `Decorator` (wraps Component, delegates + adds behavior).
**Example scenario**: Adding compression, encryption, and buffering to a data stream in any combination.

### Facade
**Intent**: Provide a simplified interface to a complex subsystem.
**Use when**: A subsystem has many classes; clients only need a subset of functionality; reduce coupling to internals.
**Example scenario**: A `VideoConverter` facade that hides codec selection, bitrate calculation, and file I/O details.

### Flyweight
**Intent**: Share fine-grained objects to reduce memory usage.
**Use when**: Large numbers of similar objects; most state can be shared (intrinsic) vs. unique (extrinsic).
**Example scenario**: A text editor sharing Font/Style objects across thousands of characters.

### Proxy
**Intent**: Provide a surrogate to control access to another object.
**Variants**: Lazy loading (virtual proxy), access control (protection proxy), caching (smart proxy), remote access (remote proxy).
**Example scenario**: A lazy-loading image proxy that fetches the real image only when `display()` is called.

---

## Behavioral Patterns

### Strategy
**Intent**: Define a family of algorithms, encapsulate each one, make them interchangeable.
**Use when**: Multiple algorithms for a task; algorithm should be selected at runtime; avoid conditional branching.
**Structure**: `Context` holds → `Strategy` interface ← `ConcreteStrategy` variants.
**Example scenario**: A shipping cost calculator with strategies for FedEx, UPS, and DHL.

### Observer
**Intent**: Define a one-to-many dependency; when one object changes state, all dependents are notified.
**Use when**: Changes in one object require updating others; the set of dependents is dynamic.
**Structure**: `Subject` maintains list of → `Observer` interface ← `ConcreteObservers`.
**Example scenario**: A stock ticker notifying multiple display widgets when prices change.

### Command
**Intent**: Encapsulate a request as an object, enabling parameterization, queuing, logging, and undo.
**Use when**: Need undo/redo, request queuing, macro recording, or deferred execution.
**Structure**: `Invoker` stores → `Command` interface (execute/undo) ← `ConcreteCommand` acts on → `Receiver`.
**Example scenario**: A text editor with undo/redo using command history stack.

### Template Method
**Intent**: Define an algorithm skeleton, deferring some steps to subclasses.
**Use when**: Multiple classes share the same algorithm structure but differ in specific steps.
**Structure**: `AbstractClass` defines `templateMethod()` calling abstract steps → `ConcreteClass` overrides steps.
**Example scenario**: A data import pipeline with common parse-validate-transform-load flow, varying by data source.

### Chain of Responsibility
**Intent**: Pass a request along a chain of handlers; each handler decides to process it or pass it on.
**Use when**: Multiple objects may handle a request; handler set is dynamic; decouple sender from receiver.
**Example scenario**: Middleware pipeline in a web framework: auth → rate-limit → logging → handler.

### Iterator
**Intent**: Access elements of a collection sequentially without exposing its underlying representation.
**Use when**: Need uniform traversal over different collection types; support multiple traversal strategies.
**Note**: Most modern languages provide built-in iterator support (for-of, generators, itertools).

### Visitor
**Intent**: Add new operations to object structures without modifying the objects.
**Use when**: The object structure is stable but you frequently add new operations (AST processing, document export).
**Structure**: `Element` accepts `Visitor` → `Visitor` has visit method per element type.
**Example scenario**: An AST walker that can type-check, optimize, or generate code using different visitors.

### State
**Intent**: Let an object alter its behavior when its internal state changes.
**Use when**: Object behavior depends on state; complex conditional logic based on state; state transitions are explicit.
**Structure**: `Context` delegates to → `State` interface ← `ConcreteState` variants.
**Example scenario**: A document workflow transitioning through Draft → Review → Approved → Published.

### Mediator
**Intent**: Define an object that encapsulates how a set of objects interact, reducing direct dependencies.
**Use when**: Many objects communicate in complex ways; want to centralize interaction logic.
**Example scenario**: A chat room mediator coordinating message routing between user objects.

### Memento
**Intent**: Capture and restore an object's internal state without violating encapsulation.
**Use when**: Need snapshots for undo, checkpoints, or serialization.
**Structure**: `Originator` creates → `Memento` (state snapshot) managed by → `Caretaker`.
**Example scenario**: A game save system capturing player position, inventory, and progress.

### Interpreter
**Intent**: Define a grammar representation and an interpreter to process sentences.
**Use when**: A simple language or DSL needs evaluation (math expressions, query filters, config rules).
**Note**: For complex grammars, prefer parser generators over manual interpreter patterns.

---

## Architectural Patterns

### MVC / MVP / MVVM
**Intent**: Separate concerns between presentation, business logic, and data.
- **MVC**: Controller handles input → updates Model → Model notifies View.
- **MVP**: Presenter mediates between View and Model; View is passive.
- **MVVM**: ViewModel exposes data via bindings; View binds declaratively.
**Choose**: MVC for server-rendered, MVVM for reactive UI frameworks, MVP for testable UIs.

### Repository
**Intent**: Mediate between domain and data mapping layers using a collection-like interface.
**Use when**: Decouple business logic from data access; enable unit testing with in-memory repositories.
**Structure**: `Service` → `Repository` interface ← `ConcreteRepository` (SQL/NoSQL/API/File).

### CQRS (Command Query Responsibility Segregation)
**Intent**: Separate read and write models for independent scaling and optimization.
**Use when**: Read and write patterns differ significantly; need different read/write representations.

### Event Sourcing
**Intent**: Store state changes as a sequence of events rather than current state.
**Use when**: Need complete audit trails, temporal queries, or event replay for debugging.

### Dependency Injection
**Intent**: Supply dependencies externally rather than creating them internally.
**Use when**: Always — this is a foundational practice. Improves testability, flexibility, and decoupling.
**Variants**: Constructor injection (preferred), method injection, property injection.

### Middleware / Pipeline
**Intent**: Process requests through a chain of composable processing steps.
**Use when**: Cross-cutting concerns (auth, logging, validation) need to be applied uniformly.
**Example scenario**: Express/Koa middleware, ASP.NET pipeline, Python WSGI middleware.

### Service Layer
**Intent**: Define an application's boundary with a layer of services that coordinate business logic.
**Use when**: Business operations span multiple domain objects; need to define transaction boundaries.

### Saga
**Intent**: Manage distributed transactions as a sequence of local transactions with compensating actions.
**Use when**: Microservices need coordinated transactions; eventual consistency is acceptable.
**Variants**: Choreography (event-driven) vs. Orchestration (central coordinator).

---

## Pattern Combination Cheat Sheet

| Scenario | Pattern Combination |
|----------|-------------------|
| Extensible object creation | Factory Method + Strategy |
| Plugin architecture | Abstract Factory + Observer + Strategy |
| Undo/redo system | Command + Memento |
| Event-driven microservices | Observer + Mediator + CQRS |
| Configurable processing pipeline | Chain of Responsibility + Decorator |
| Complex domain with persistence | Repository + Service Layer + DI |
| UI with dynamic behavior | State + Observer + MVVM |
| API gateway | Facade + Proxy + Adapter |
