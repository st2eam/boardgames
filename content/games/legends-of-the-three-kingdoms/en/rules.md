# Sanguosha (Legends of the Three Kingdoms) Rules

## Overview

Sanguosha is a Chinese card game inspired by the Romance of the Three Kingdoms. Players assume the identities of legendary heroes, each with unique abilities. Hidden roles determine each player's allegiance and victory condition.

## Components

- **Identity Cards** — 1 Monarch, 2 Loyalists, 4 Rebels, 1 Traitor (for 8 players)
- **Hero Cards** — 25+ heroes from the Three Kingdoms era, each with unique skills
- **Game Cards** — Basic cards (Slash, Dodge, Peach), Strategy cards (Scrolls), and Equipment cards
- **Health Cards** — To track each hero's remaining health

## Roles & Victory Conditions

| Role | Team | Objective |
|------|------|-----------|
| **Monarch (主公)** | Ruler | Eliminate all Rebels and the Traitor |
| **Loyalist (忠臣)** | Ruler | Protect the Monarch; eliminate Rebels and Traitor |
| **Rebel (反贼)** | Rebel | Eliminate the Monarch |
| **Traitor (内奸)** | Solo | Be the last player standing (Monarch eliminated last) |

Roles are kept secret except the Monarch, who reveals immediately.

## Setup

1. Select identity cards based on player count. Each player draws one face down. The Monarch reveals their identity.
2. The Monarch receives 5 hero cards to choose from; other players receive 3 each.
3. Each player selects a hero and reveals it. The Monarch gets +1 maximum health.
4. Starting from the Monarch (counterclockwise), each player draws 4 starting cards.

## Card Types

### Basic Cards
- **Slash (杀)** — Attack one player within range. Deals 1 damage if not dodged. Limit 1 per turn (unless hero ability says otherwise).
- **Dodge (闪)** — Played in response to negate one Slash.
- **Peach (桃)** — Restore 1 health to yourself (during your turn), or save a dying player (any time).
- **Wine (酒)** — Use during Play Phase (once per turn); your next Slash deals +1 damage. Or use during dying state as a Peach substitute to restore 1 health.

### Strategy Cards (Non-Delayed)
- **Something from Nothing (无中生有)** — Draw 2 cards for yourself.
- **Duel (决斗)** — Challenge one player. Alternate playing Slashes (target goes first); first to fail takes 1 damage.
- **Archery Attack (万箭齐发)** — All other players must play a Dodge or take 1 damage.
- **Barbarian Assault (南蛮入侵)** — All other players must play a Slash or take 1 damage.
- **Dismantle (过河拆桥)** — Discard one card from any player (hand or equipped).
- **Snatch (顺手牵羊)** — Take one card from a player within distance 1.
- **Borrowed Sword (借刀杀人)** — Order a weapon-equipped player to Slash a target you designate; if they refuse, you take their weapon.
- **Bountiful Harvest (五谷丰登)** — Reveal cards from deck equal to player count; each player picks one.
- **Peach Garden (桃园结义)** — All players recover 1 health (cannot exceed max).
- **Nullification (无懈可击)** — Cancel any strategy card's effect. Anyone may play after targeting but before resolution (delayed: before judgment reveals). Can be countered by another Nullification.
- **Iron Shackles (铁索连环)** — Select 1-2 characters; toggle their chain state (sideways/upright). Chained characters taking elemental damage propagate it to the next chained character in seat order. May also be reforged.
- **Fire Attack (火攻)** — Target any player (including yourself) to reveal a hand card; you discard a card of the same suit to deal 1 Fire damage to them.

### Strategy Cards (Delayed)
- **Contentment (乐不思蜀)** — Place on another player's judgment zone. They judge: if NOT Hearts, skip **Play Phase**.
- **Supply Shortage (兵粮寸断)** — Place on another player within distance 1. They judge: if NOT Clubs, skip **Draw Phase**.
- **Lightning (闪电)** — Place on your own judgment zone. Passes left each turn. If judged Spade 2-9, deal 3 Lightning damage.

### Equipment Cards
- **Weapons** — Increase attack range and may grant special effects.
- **Armor** — Provides passive protection.
- **+1 Horse (defensive)** — Other players' distance to you is increased by 1.
- **-1 Horse (offensive)** — Your distance to other players is decreased by 1.

## Turn Structure

Each turn consists of **six phases** in order:

1. **Preparation Phase** — Trigger start-of-turn abilities.
2. **Judgment Phase** — Resolve delayed strategy cards in reverse order of placement.
3. **Draw Phase** — Draw 2 cards from the deck.
4. **Play Phase** — Play cards and use hero abilities. At most 1 Slash per turn (unless modified).
5. **Discard Phase** — Discard down to your current health value.
6. **End Phase** — Trigger end-of-turn abilities.

## Key Rules

- **Range**: Adjacent players are at distance 1. Weapons and horses modify range. Dead players are excluded.
- **Dying State**: When health reaches 0, the player enters dying state. Counterclockwise from the dying player, each may play a Peach to save. If unsaved, eliminated.
- **Hand Limit**: During Discard Phase, hand size cannot exceed current health.

## Detailed Rules

### Losing Cards

"Losing a card" means any card originally belonging to you leaves your control. All of the following count:

| Action | Counts as Losing? |
|--------|:-----------------:|
| Using a hand card (Slash, Scroll, etc.) | ✅ |
| Playing in response (Dodge vs Slash) | ✅ |
| Discarding (phase or forced by abilities) | ✅ |
| Point Duel cards (enter discard pile) | ✅ |
| Reforging (discard then draw) | ✅ |
| Equipment removed/replaced | ✅ |

### Point Duel (拼点)

**Conditions:** Both parties must have hand cards. No hand cards = cannot initiate or be targeted.

**Resolution:**
1. Both select one hand card, place face-down simultaneously
2. Reveal simultaneously; compare values (A=1 lowest, K=13 highest):
   - Different → higher **wins**, lower **didn't win**
   - Same → **neither wins**
3. Both cards **simultaneously enter discard pile**
4. Execute effect based on result

### Judgment

1. Reveal top deck card as judgment card
2. Players with modification skills (Demonic Talent, Dark Arts) may modify counterclockwise from current turn player; pass = no more chances
3. Judgment takes effect by suit/number
4. Judgment card **enters discard pile** (unless skill says otherwise, e.g., Envy of Heaven)

> Judgment cards don't belong to the judging player; their discard doesn't trigger "lose card" abilities.

### Health Loss vs Damage

| Difference | Damage | Health Loss |
|------------|--------|-------------|
| Source | Has one (the damager) | None |
| Triggers reactive skills | ✅ (Feedback, Bequeathed Strategy) | ❌ |
| Dying state | ✅ | ✅ |
| Chain propagation | ✅ (elemental) | ❌ |
| Death rewards/penalties | ✅ | ❌ |

### Distance

- Base distance = **shortest path** between two players (clockwise or counter, whichever shorter)
- Dead players **excluded**
- +1 Horse: others to you +1; -1 Horse: you to others -1
- Weapons provide attack range (independent of distance)

### Reforging

- Declared during Play Phase; place card into discard pile, then draw one
- Does **not** count as "using" (no "when you use" triggers)
- Does count as "losing" a card

---

## Sanguosha Language Guide

Every keyword in skill descriptions has a precise official definition.

### Skill Types

| Type | Definition |
|------|-----------|
| **Compulsory (锁定技)** | Must activate/produce effect if able; cannot decline |
| **Limited (限定技)** | At most once per game |
| **Awakening (觉醒技)** | Must activate + only once; permanently changes state and grants/removes skills |
| **Monarch (主公技)** | Only effective when role is Monarch |
| **Conversion (转换技)** | Yang/Yin forms; each activation switches to the other; cannot switch back without activating current form |

> To determine if forced: check for "may" in the description, not the "Compulsory" label.

> "Character's skills" = hero skills only. Equipment skills are "possessed" but not "character's skills."

---

### Choice Keywords

**"May" (可以)** — Has choice; may activate or decline. Once declared, first effect is mandatory.

Example: Guan Yu〖Warrior Saint〗"You **may** use a red card as [Slash]." → Can choose to activate or not.

**"Need" (需)** — Has choice in *how* to respond (must respond).

**"Must" (须)** — Forced; no choice.

**"Any number" (任意数量)** — Can be 0.

---

### Action Keywords

**"Have/Order" (令)** — A issues command, B executes, B cannot refuse. "You **may** have B…" — "may" modifies whether A issues it.

Example: Diao Chan〖Dissension〗"**Have** a male character use [Duel]…" → Commanded party must comply.

**"Treated as" (视为)** — Use as another card; inherits all properties; still counts as "using."

Example: Gan Ning〖Surprise Raid〗"Use a black card as [Dismantle]." → Can be nullified.

**"Transfer" (转移)** — Redirect damage from A to B: prevent A's damage → terminate → B takes same-source/channel/attribute damage.

---

### Use vs Play

| Action | Definition | Triggers |
|--------|-----------|----------|
| **Use** | Declare actively, designate targets, full resolution | "When you use…" abilities |
| **Play** | Respond to event, no targets, no use-effects | Only "when you play/lose…" abilities |

---

### Discard vs Phase Discard

- **Discard (弃置)**: Place any character's card into discard pile
- **Phase discard**: Specifically discarding own cards exceeding hand limit (a subset of discard)

---

### Connective Words

**"Then" (然后)** — Sequential execution of two effects.

**"And" (并)** — Two operations execute **simultaneously**.

**"If you do" (若如此做)** — Subsequent effect only if preceding action succeeded.

---

### One-at-a-time vs Simultaneous

**With "one at a time" (依次):** Operate individually; each resolves before next.

**Without:** All operated **simultaneously**.

Example: Stone Axe discards 2 simultaneously — Lu Xun cannot discard last card to trigger〖Chain〗, draw one, then discard that for the cost.

---

### Choose One (选择一项)

Pick from multiple options. **Rule:** If all effects of an option cannot execute, it cannot be chosen.

Example: A activates〖Gender Blades〗against B with no hand cards — B must choose "let A draw 1."

---

### Damage Terms

**Source:** The character dealing damage. If source dies during resolution, treated as no source.

Example: A uses〖Borrowed Sword〗making B Slash Sima Yi — damage source is B.

**Channel:** The card/skill causing damage. Chain propagation and transfer keep original channel.

**Elemental damage:** Fire/Lightning attribute. Unspecified = normal.

**Chain damage:** Elemental damage from propagation/transfer; won't re-trigger propagation.

---

### Target Character

In use-resolution: the card's target. In damage-resolution: the **current** target (may change via transfer).

Example: Xu Chu〖Bare Chested〗+ [Duel] vs Xiao Qiao (+1 damage); Xiao Qiao〖Heavenly Fragrance〗transfers to A — target is still Xiao Qiao, so A doesn't get +1.

---

### Other Terms

| Term | Meaning |
|------|---------|
| **Recover** | Increase health (≤ max). Full-health characters cannot recover |
| **Wounded** | Health < max health |
| **User** | Character who used the card. If changed, subsequent resolution follows new user |
| **Another character** | Excludes self (vs "a character") |
| **Other characters** | Excludes "you" (the user) |
| **By this method** | As described in this skill's activation |
| **X times per Play Phase** | Max activations in one Play Phase |

---

### Number Conventions

- **Chinese numerals** (一, 两, 三) → card counts, player counts, option counts
- **Arabic numerals** (1, 2, 3) → health, damage, tokens

---

## Resolution Principles

### I. Effect Conflicts

**Priority:** Skill description > Card text > Game rules

Example:〖Berserk〗"no Slash limit" vs [Slash] "once per Play Phase" — skill wins.

**Negation Principle:** Negating effects override affirming effects.

---

### II. Resolution Order

**Insertion:** New event pauses current flow → inserted event resolves fully → original resumes.

Example: Xiahou Dun takes damage → activates〖Unyielding〗→ Guo Jia takes damage → activates〖Bequeathed Strategy〗→ resolves → back to Guo Jia's damage → back to Xiahou Dun's damage.

**Multi-character order:** From current turn player, **counterclockwise**.

**Same-timing limits:**
- Only one character can use (at most one) card
- Same skill at most once per character (except counting-related)

> If current turn player dies, start from "their next player before death."

---

### III. Priority Determination

When multiple things are possible at the same timing:

> **Hero skill > Equipment skill > Use card > Game procedure**

Example: Monarch Cao Cao with [Eight Trigrams] needing [Dodge] → choose〖Royal Escort〗first → then〖Eight Trigrams〗→ then hand card. Skipping higher priority = losing that timing.

Same-priority skills: player chooses order freely.

---

### IV. Condition Check Timing

Conditions are checked **when it's that character's turn to choose**. If another skill changes state within the same timing, a previously unmet condition may become met.
