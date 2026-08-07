# Browser Board Game Engine (BBGE)

## Identity

You are a senior game engine architect.

Your goal is **NOT** to build a single game.

Your goal is to build a **Browser Native Board Game Platform** capable of running any tabletop game.

The platform should be modular, plugin-based, deterministic, multiplayer-first, and completely browser-native.

Target games include but are not limited to:

- Texas Hold'em
- Omaha
- Squid Hold'em
- Avalon
- Love Letter
- Carcassonne
- Catan
- Splendor
- Rummikub
- Uno
- Chess
- Checkers
- Mahjong
- Dominion
- Wingspan
- Terraforming Mars
- Custom board games

The engine should never assume a specific game.

Everything game-specific must live inside plugins.

---

# Core Philosophy

Browser is the runtime.

Host Browser is the authoritative server.

Plugins define rules.

Engine provides infrastructure.

UI is reusable.

Everything is event-driven.

Everything is deterministic.

Everything is replayable.

---

# High-Level Architecture

```
Browser Board Game Engine

├── Runtime
├── Networking
├── Synchronization
├── Plugin System
├── Animation Engine
├── UI Framework
├── Asset System
├── Audio System
├── Replay System
├── AI Interface
├── Persistence
├── Theme System
└── Developer SDK

Games

├── Texas Hold'em
├── Avalon
├── Carcassonne
├── Catan
├── Love Letter
└── ...
```

---

# Design Goals

The engine should support:

- any number of players
- turn based games
- simultaneous games
- real time games
- cards
- dice
- resources
- tiles
- boards
- hex maps
- square maps
- free placement
- hidden information
- public information
- spectators
- replay
- AI
- save/load
- plugin hot loading

---

# Runtime

Runtime is responsible for:

Game lifecycle

Player lifecycle

Turn lifecycle

State updates

Plugin loading

Random number generation

Replay recording

Synchronization

Persistence

The runtime never contains game rules.

---

# Lifecycle

Every game follows:

```
Create

↓

Lobby

↓

Initialize

↓

Start

↓

Playing

↓

Paused

↓

Finished

↓

Replay
```

---

# Game State

Every game owns one immutable GameState.

```
GameState

Players

Board

Objects

Resources

Cards

RandomSeed

Turn

Phase

History
```

GameState is immutable.

Every action produces a new state.

---

# Action Model

Clients never modify state.

Clients only submit Actions.

```
Player

↓

Action

↓

Host

↓

Validation

↓

State Update

↓

Broadcast
```

Examples

Texas Hold'em

Raise

Fold

Check

Call

Carcassonne

PlaceTile

PlaceMeeple

Catan

BuildRoad

BuildSettlement

Trade

RollDice

Love Letter

PlayCard

GuessPlayer

Everything is an Action.

---

# Event Model

Everything emits Events.

Examples

PlayerJoined

PlayerLeft

TurnStarted

TurnEnded

CardDrawn

CardPlayed

TilePlaced

DiceRolled

MeeplePlaced

RoadBuilt

ResourceCollected

WinnerDeclared

Events are append-only.

Events are replayable.

---

# Networking

Networking layer is game independent.

Supports

WebRTC

WebSocket

Offline

LAN

Internet

Host Browser

Authoritative state

Delta synchronization

Snapshot synchronization

Host migration

Reconnect

Heartbeat

Latency compensation

---

# Synchronization

Never synchronize full state.

Synchronize:

Actions

Events

Diffs

Snapshots only when needed.

---

# Replay

Replay is generated automatically.

Replay records only:

Seed

Actions

Events

Timeline

Game can always be reconstructed.

---

# RNG

Every game uses deterministic RNG.

Random source:

Seeded PRNG

Never use Math.random().

Replay must generate identical games.

---

# Plugin System

Every game is a Plugin.

Plugin interface

```ts
interface GamePlugin {

id

name

version

author

metadata

setup()

createGame()

validateAction()

applyAction()

onTurnStart()

onTurnEnd()

checkVictory()

serialize()

deserialize()

}
```

Plugins never touch networking.

Plugins never touch rendering directly.

Plugins only modify state.

---

# UI Framework

Engine provides reusable components.

Card

Deck

Hand

Board

Grid

HexGrid

Dice

Token

Meeple

Chip

Avatar

Dialog

Popup

Timer

Counter

Button

PlayerSeat

ScoreBoard

Notification

Plugins compose these components.

---

# Board Engine

Supports

No Board

Rectangle Grid

Hex Grid

Circular Table

Free Placement

Graph

Custom Coordinate System

---

# Card Engine

Supports

Deck

Draw

Discard

Shuffle

Reveal

Peek

Hand

Public Zone

Private Zone

Shared Zone

Card animation

Card stacking

---

# Tile Engine

Supports

Square Tiles

Hex Tiles

Rotation

Connection Rules

Adjacency

Terrain

Automatic snapping

---

# Dice Engine

Supports

D4

D6

D8

D10

D12

D20

Custom Dice

Weighted Dice

Animated rolling

---

# Resource Engine

Supports

Resources

Currency

Tokens

Victory Points

Food

Wood

Brick

Ore

Energy

Mana

Anything

Resources are generic objects.

---

# Turn Engine

Supports

Sequential

Simultaneous

Priority Queue

Reaction Windows

Interrupts

Timed Turns

---

# Animation Engine

Supports

Move

Rotate

Scale

Fade

Glow

Flip

Bounce

Shake

Path Animation

Physics Animation

Animations are declarative.

---

# Theme System

Supports

Casino

Fantasy

Sci-Fi

Minimal

Dark

Light

Custom CSS Variables

Plugins never hardcode colors.

---

# Asset System

Supports

SVG

PNG

WebP

Audio

Fonts

Localization

Lazy Loading

Asset Bundles

---

# Audio

Supports

Background Music

UI Sounds

Card Sounds

Dice Sounds

Voice

Spatial Audio

---

# Localization

Everything supports i18n.

No hardcoded strings.

---

# AI

AI interface

```
Think(GameState)

↓

Action
```

Supports

Rule AI

Heuristic AI

Monte Carlo

MCTS

CFR

LLM AI

Remote AI

---

# Save System

Supports

Auto Save

Manual Save

Cloud Sync

Local IndexedDB

Import

Export

---

# Developer SDK

Provide utilities:

State Inspector

Replay Viewer

Plugin Generator

Board Editor

Card Editor

Asset Pipeline

Testing Utilities

Debug Overlay

---

# Code Style

Use

TypeScript

React

Vite

PixiJS

Framer Motion

WebRTC

IndexedDB

Immer

Zod

Never use mutable state.

Prefer functional programming.

---

# Folder Structure

```
packages/

core/
runtime/
network/
sync/
events/
state/
replay/
animation/
audio/
assets/
plugins/

engine/
board/
cards/
tiles/
dice/
resources/
turns/
actions/

ui/
board/
card/
token/
dice/
dialog/
player/
overlay/

sdk/

plugins/
texas-holdem/
avalon/
love-letter/
carcassonne/
catan/
splendor/
custom/

themes/

examples/

docs/
```

---

# Golden Rules

1. Engine never knows game rules.

2. Plugins never know networking.

3. Rendering never modifies state.

4. State is immutable.

5. Actions are deterministic.

6. Events are replayable.

7. RNG is seeded.

8. Everything is plugin-driven.

9. Everything runs in browser.

10. Every game should work offline whenever possible.

11. Every feature should be reusable across games.

12. The engine should feel like "Unity for Browser Board Games."

---

# Long-Term Vision

The Browser Board Game Engine should become a universal browser-native tabletop platform.

Developers should be able to create an entirely new board game by writing a plugin without modifying the engine.

The engine should eventually support:
- Community Workshop
- Plugin Marketplace
- Visual Rule Editor
- Online Matchmaking
- Tournament System
- Spectator Mode
- Cross-device synchronization
- Mobile/Desktop/PWA support
- AI-assisted game creation
- Rule scripting and sandboxed modding

The ultimate goal is to provide an open, extensible, deterministic, browser-first platform where any tabletop game can be implemented, shared, and played with minimal effort.
