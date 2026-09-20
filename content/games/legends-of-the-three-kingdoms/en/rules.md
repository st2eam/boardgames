# Sanguosha (Legends of the Three Kingdoms) Rules
<!-- rule-section: 1-overview -->
## 1. Overview

Sanguosha is a Chinese card game inspired by the Romance of the Three Kingdoms. Players assume the identities of legendary heroes, each with unique abilities. Hidden roles determine each player's allegiance and victory condition.
<!-- rule-section: game-objective -->
## Game Objective

In Legends of the Three Kingdoms, you are a hero with a hidden identity and unique skills. Your goal is not always the same: discover your allies, then help your own camp complete its identity-specific victory condition.
<!-- rule-section: 2-components -->
## 2. Components
<!-- rule-ui: sidebar -->
- <!-- rule-item: 2-components-item-1 -->
  **Identity Cards** — 1 Monarch, 2 Loyalists, 4 Rebels, 1 Traitor (for 8 players)
- <!-- rule-item: 2-components-item-2 -->
  **Hero Cards** — 25+ heroes from the Three Kingdoms era, each with unique skills
- <!-- rule-item: 2-components-item-3 -->
  **Game Cards** — Basic cards (Slash, Dodge, Peach), Strategy cards (Scrolls), and Equipment cards
- <!-- rule-item: 2-components-item-4 -->
  **Health Cards** — To track each hero's remaining health
<!-- rule-section: 3-roles-victory-conditions -->
## 3. Roles & Victory Conditions

![Monarch and loyalists vs rebels; traitor wins alone](/images/rules/legends-of-the-three-kingdoms/identity-win.svg)
| Role | Team | Objective |
|------|------|-----------|
| **Monarch (主公)** | Ruler | Eliminate all Rebels and the Traitor |
| **Loyalist (忠臣)** | Ruler | Protect the Monarch; eliminate Rebels and Traitor |
| **Rebel (反贼)** | Rebel | Eliminate the Monarch |
| **Traitor (内奸)** | Solo | Be the last player standing (Monarch eliminated last) |

Roles are kept secret except the Monarch, who reveals immediately.
<!-- rule-section: 4-setup -->
## 4. Setup

1. Select identity cards based on player count. Each player draws one face down. The Monarch reveals their identity.
2. The Monarch receives 5 hero cards to choose from; other players receive 3 each.
3. Each player selects a hero and reveals it. The Monarch gets +1 maximum health.
4. Starting from the Monarch (counterclockwise), each player draws 4 starting cards.
<!-- rule-section: 5-game-flow -->
## 5. Game Flow

![Play Sha in range; Shan cancels it](/images/rules/legends-of-the-three-kingdoms/turn-flow.svg)
Each turn consists of **six phases** in order:

```
Preparation Phase
  ├─ Start-of-turn skills trigger
  └─ "At the start of your turn" effects

Judgment Phase
  ├─ Resolve delayed strategy cards (reverse order of placement)
  ├─ Contentment (乐不思蜀)
  ├─ Supply Shortage (兵粮寸断)
  └─ Lightning (闪电)

Draw Phase
  └─ Draw 2 cards from the deck

Play Phase
  ├─ Use cards (at most 1 Slash per turn unless modified)
  ├─ Activate hero skills
  └─ Reforge

Discard Phase
  └─ Discard down to current health value

End Phase
  └─ End-of-turn skills trigger
```
<!-- rule-ui: tabs -->
<!-- rule-section: 6-game-cards -->
## 6. Game Cards
<!-- rule-section: basic-cards -->
### Basic Cards

---

**Slash (杀)**

| | |
|---|---|
| **Timing** | Play Phase |
| **Target** | One character within attack range |
| **Effect** | Target must play a Dodge or take 1 normal damage |
| **Limit** | Once per turn (unless hero ability says otherwise) |

---

**Dodge (闪)**

| | |
|---|---|
| **Timing** | In response to a Slash |
| **Target** | None (response card) |
| **Effect** | Negate one Slash |

---

**Peach (桃)**

| | |
|---|---|
| **Timing** | Your Play Phase, or any time when a character is dying |
| **Target** | Yourself (Play Phase) or any dying character |
| **Effect** | Restore 1 health |

> **Rule:** Cannot restore health beyond maximum. On a dying character: restores to 1 health and removes dying state.

---

**Wine (酒)**

| | |
|---|---|
| **Timing** | Play Phase, or when you are dying |
| **Target** | Yourself |
| **Effect** | Play Phase: your next Slash this turn deals +1 damage. Dying: restores 1 health (like Peach) |
| **Limit** | Once per turn (Play Phase use) |

> **Rule:** If the Slash after Wine is dodged or prevented, the +1 damage is wasted — there is no damage to increase.

---
<!-- rule-section: strategy-cards-non-delayed -->
### Strategy Cards (Non-Delayed)

---

**Something from Nothing (无中生有)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | Yourself |
| **Effect** | Draw 2 cards |

---

**Duel (决斗)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | One other character |
| **Process** | The target plays a Slash first. Then both sides alternate playing Slashes. |
| **Result** | Whoever cannot play a Slash takes 1 damage from the other party |

---

**Archery Attack (万箭齐发)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | All other characters |
| **Effect** | Each target must play a Dodge or take 1 damage |

---

**Barbarian Assault (南蛮入侵)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | All other characters |
| **Effect** | Each target must play a Slash or take 1 damage |

---

**Dismantle (过河拆桥)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | One character |
| **Effect** | Discard one card from the target (hand or equipped) |

---

**Snatch (顺手牵羊)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | One character within distance 1 |
| **Effect** | Take one card from the target (hand or equipped) into your hand |

---

**Borrowed Sword (借刀杀人)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | One other character with a weapon equipped |
| **Effect** | Target must use a Slash on a character you designate. If they refuse, you take their weapon. |

> **Rule:** The damage source is the weapon's owner, not you.

---

**Bountiful Harvest (五谷丰登)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | All characters |
| **Effect** | Reveal cards from the deck equal to the number of characters. Starting from you and going counterclockwise, each character picks one and adds it to their hand. |

---

**Peach Garden (桃园结义)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | All characters |
| **Effect** | Each character restores 1 health (cannot exceed max) |

---

**Nullification (无懈可击)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Timing** | After a Strategy card is played but before it resolves (for delayed: before the judgment card is revealed) |
| **Target** | One Strategy card |
| **Effect** | Cancel that Strategy card's effect |

> **Rule:** Nullification can be countered by another Nullification. It cannot cancel a Strategy card that has already resolved.

---

**Iron Shackles (铁索连环)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | 1–2 characters |
| **Effect** | Toggle each target's chain state (chained ↔ unchained). When a chained character takes elemental (Fire/Lightning) damage, it propagates to the next chained character in seat order. May also be reforged (discard to draw 1). |

> **Rule:** Chain-propagated damage does not re-trigger chain propagation.

---

**Fire Attack (火攻)**

| | |
|---|---|
| **Type** | Non-delayed Strategy |
| **Target** | One character (including yourself) |
| **Effect** | Target reveals a hand card. You may discard a card of the same suit to deal 1 Fire damage to them. |

---
<!-- rule-section: strategy-cards-delayed -->
### Strategy Cards (Delayed)

---

**Contentment (乐不思蜀)**

| | |
|---|---|
| **Type** | Delayed Strategy |
| **Placement** | Place on another character's judgment zone |
| **Judgment** | If result is NOT Hearts → skip **Play Phase** |
| **Disposal** | Discarded after resolution (whether effective or not) |

---

**Supply Shortage (兵粮寸断)**

| | |
|---|---|
| **Type** | Delayed Strategy |
| **Placement** | Place on another character within distance 1 |
| **Judgment** | If result is NOT Clubs → skip **Draw Phase** |
| **Disposal** | Discarded after resolution |

---

**Lightning (闪电)**

| | |
|---|---|
| **Type** | Delayed Strategy |
| **Placement** | Place on your own judgment zone |
| **Passing** | At the start of each Judgment Phase, if not yet resolved, passes to the next character on the left |
| **Judgment** | If result is Spade 2–9 → deal 3 Lightning damage to the character |
| **Disposal** | Discarded after striking (or if another Lightning enters play) |

> **Rule:** Nullification can only cancel Lightning when it first enters the judgment zone, NOT when the judgment card is revealed.

---
<!-- rule-section: equipment-cards -->
### Equipment Cards

| Type | Effect |
|------|--------|
| **Weapon** | Sets attack range (typically 2–5). May grant special effects. |
| **Armor** | Provides passive protection (e.g., Eight Trigrams: when you need to play Dodge, judge — if red, treated as having played Dodge). |
| **+1 Horse** (defensive) | Other characters' distance to you is increased by 1 |
| **-1 Horse** (offensive) | Your distance to other characters is decreased by 1 |

> **Rule:** Equipment skills are "possessed" by your character but are NOT "character skills." Effects that reference "character skills" do not include equipment skills.

---
<!-- rule-ui: tabs -->
<!-- rule-section: 7-basic-rules -->
## 7. Basic Rules
<!-- rule-section: distance -->
### Distance

Distance equals the **shortest path** between two characters, counting seats clockwise or counterclockwise. Adjacent characters are at distance 1.

```
A —— B —— C —— D —— E

A to C: clockwise 2, counterclockwise 3 → distance = 2
A to D: clockwise 3, counterclockwise 2 → distance = 2
```

Dead characters are excluded from all distance calculations:

```
C dies:  A —— B      D —— E

A to D: no continuous path → unreachable
B to D: B → D = distance 1 (C no longer exists)
```

**Modifiers:**

| Modifier | Effect |
|----------|--------|
| Weapon | Sets attack range (independent of distance) |
| -1 Horse | Your distance to others -1 |
| +1 Horse | Others' distance to you +1 |
<!-- rule-section: dying-state -->
### Dying State

When health reaches 0, the character enters **dying state**:

1. Starting from the dying character and going counterclockwise, each character may play one Peach (or Wine used as Peach) to attempt rescue.
2. If the dying character is healed to at least 1 health, they are saved and the dying state ends.
3. If all players pass, the character dies.

A character with 0 or negative health can only be saved by Peach/Wine — damage prevention does not stop dying.
<!-- rule-section: hand-limit -->
### Hand Limit

During Discard Phase, hand size must not exceed current health. Excess cards are discarded.

> "Phase discard" refers specifically to this mandatory discard. It is a subset of "discard" (弃置), which also includes discarding caused by skills or cards.

---
<!-- rule-ui: tabs -->
<!-- rule-section: 8-game-terminology -->
## 8. Game Terminology
<!-- rule-section: skill-types -->
### Skill Types

| Type | Definition |
|------|-----------|
| **Compulsory (锁定技)** | Must activate or produce effect if able; cannot decline |
| **Limited (限定技)** | At most once per game |
| **Awakening (觉醒技)** | Must activate and only once; permanently changes state and grants/removes skills |
| **Monarch (主公技)** | Only effective when role is Monarch |
| **Conversion (转换技)** | Yang/Yin forms; each activation switches to the other; cannot switch back without activating the current form |

> To determine if a skill is forced: check for **"may" (可以)** in the description, not the "Compulsory" label. A skill without "may" is mandatory regardless of its type tag.

> "Character's skills" = hero skills only. Equipment skills are distinct.

---
<!-- rule-section: use-vs-play -->
### Use vs Play

| Action | Definition | Triggers |
|--------|-----------|----------|
| **Use (使用)** | Declare actively, designate targets, full resolution | "When you use…" abilities |
| **Play (打出)** | Respond to an event by revealing a card; no targets, no use-effects | Only "when you play/lose…" abilities |

---
<!-- rule-section: discard-vs-phase-discard -->
### Discard (弃置) vs Phase Discard

- **Discard (弃置):** Place cards from any character's zone into the discard pile
- **Phase discard:** Specifically discarding your own cards exceeding the hand limit during Discard Phase (a subset of discard)

---
<!-- rule-section: losing-cards -->
### Losing Cards

"Losing a card" means any card originally belonging to you leaves your control. All of the following count:

| Action | Counts as Losing? |
|--------|:-----------------:|
| Using a hand card (Slash, Strategy, etc.) | Yes |
| Playing in response (Dodge vs Slash) | Yes |
| Discarding (phase or forced by abilities) | Yes |
| Point Duel cards (enter discard pile) | Yes |
| Reforging (discard then draw) | Yes |
| Equipment removed or replaced | Yes |

---
<!-- rule-section: recover -->
### Recover (回复)

Increase health (cannot exceed maximum). A character at full health cannot recover.

> **Wounded (受伤):** Health < maximum health.

---
<!-- rule-section: damage -->
### Damage

| Term | Meaning |
|------|---------|
| **Source** | The character dealing damage. If source dies during resolution, treated as no source. |
| **Channel** | The card or skill causing the damage. Chain propagation and transfer keep the original channel. |
| **Elemental damage** | Fire or Lightning attribute. Unspecified = normal damage. |
| **Chain damage** | Elemental damage from propagation or transfer; does NOT re-trigger chain propagation. |

**Health Loss vs Damage:**

| Difference | Damage | Health Loss |
|------------|--------|-------------|
| Has source | Yes (the damager) | None |
| Triggers reactive skills | Yes (Feedback, Bequeathed Strategy) | No |
| Enters dying state | Yes | Yes |
| Chain propagation | Yes (elemental only) | No |
| Death rewards/penalties | Yes | No |

**Prevent Damage ≠ Recover:**

> When damage is prevented, it is treated as if no damage was dealt. No damage triggers fire (reactive skills, dying state, chain propagation). Damage prevention occurs *before* damage is dealt; recovery occurs *after* damage is dealt.

---
<!-- rule-section: judgment -->
### Judgment (判定)

1. Reveal the top card of the deck as the **judgment card**.
2. Characters with judgment-modification skills (e.g., Demonic Talent, Dark Arts) may modify, going counterclockwise from the current turn player. Once a player passes, they cannot re-enter.
3. The judgment takes effect based on suit/number.
4. The judgment card enters the discard pile (unless a skill says otherwise, e.g., Envy of Heaven takes it to hand).

> **Judgment cards do not belong to any character.** They cannot be targeted, cannot be obtained (unless a skill specifically allows it), and their discard does not trigger "lose card" abilities.

---
<!-- rule-section: point-duel -->
### Point Duel (拼点)

**Conditions:** Both parties must have hand cards. A character with no hand cards cannot initiate or be targeted.

> **Point duel cards have no suit.** Only the number matters (A = 1 smallest, K = 13 largest), unless a skill states otherwise.

**Resolution:**
1. Both parties select one hand card and place it face-down in the processing zone simultaneously.
2. Reveal simultaneously; compare values:
   - Different → higher **wins**, lower **did not win**
   - Same → **neither wins**
3. Both cards simultaneously enter the discard pile.
4. Execute the effect based on the result.

---
<!-- rule-section: reforging -->
### Reforging (重铸)

- Declared during Play Phase: place a card into the discard pile, then draw one.
- Does NOT count as "using" (no "when you use…" triggers).
- DOES count as "losing" a card.

---
<!-- rule-section: action-keywords -->
### Action Keywords

**"Have/Order" (令)** — A issues a command, B executes. B cannot refuse.

> Example: Diao Chan〖Dissension〗"**Have** a male character use [Duel]…" → The commanded party must comply.

> "You **may** have B…" — "may" modifies whether A issues the command, not whether B complies.

**"Treated as" (视为)** — Used as another card; inherits all properties; still counts as "using."

> Example: Gan Ning〖Surprise Raid〗"Use a black card as [Dismantle]." → Can be nullified.

**"Transfer" (转移)** — Redirect damage from A to B: prevent A's damage → terminate its resolution → B takes damage from the same source, channel, and attribute.

---
<!-- rule-section: choice-keywords -->
### Choice Keywords

**"May" (可以)** — Has choice; may activate or decline. Once declared, the first effect is mandatory.

**"Need" (需)** — Has choice in *how* to respond, but must respond.

**"Must" (须)** — Forced; no choice.

**"Any number" (任意数量)** — Can be 0.

---
<!-- rule-section: connective-words -->
### Connective Words

| Word | Meaning |
|------|---------|
| **"Then" (然后)** | Two effects execute sequentially |
| **"And" (并)** | Two operations execute **simultaneously** |
| **"If you do" (若如此做)** | Subsequent effect only if the preceding action succeeded |

---
<!-- rule-section: one-at-a-time-vs-simultaneous -->
### One-at-a-Time vs Simultaneous

**With "one at a time" (依次):** Operate individually; each resolves completely before the next.

**Without:** All operated simultaneously.

> Example: Stone Axe discards 2 cards simultaneously — Lu Xun cannot discard their last card, trigger〖Chain〗to draw one, then discard the new card to pay the cost.

---
<!-- rule-section: choose-one -->
### Choose One (选择一项)

Pick from multiple options. **Core rule:** If all effects of an option cannot execute, that option cannot be chosen.

> Example: A activates〖Gender Blades〗against B who has no hand cards — B must choose "let A draw 1," because "discard a hand card" cannot be executed.

---
<!-- rule-section: target-character -->
### Target Character

In use-resolution: the card's target. In damage-resolution: the **current** target (may change via transfer).

> Example: Xu Chu〖Bare Chested〗+ [Duel] vs Xiao Qiao (+1 damage); Xiao Qiao〖Heavenly Fragrance〗transfers to A — the target is still Xiao Qiao, so A does not get +1 damage.

---
<!-- rule-section: other-terms -->
### Other Terms

| Term | Meaning |
|------|---------|
| **Another character** | Excludes self (vs "a character") |
| **Other characters** | Excludes "you" (the user) |
| **User** | The character who used the card. If changed, subsequent resolution follows the new user. |
| **By this method** | As described in this skill's activation |
| **X times per Play Phase** | Maximum activations in one Play Phase |
<!-- rule-section: number-conventions -->
### Number Conventions

- **Chinese numerals** (一, 两, 三) → card counts, player counts, option counts
- **Arabic numerals** (1, 2, 3) → health, damage, tokens

---
<!-- rule-ui: tabs -->
<!-- rule-section: 9-resolution-rules -->
## 9. Resolution Rules
<!-- rule-section: 9-1-effect-conflicts -->
### 9.1 Effect Conflicts

**Priority:** Skill description > Card text > Game rules

> Example:〖Berserk〗"no Slash limit" vs [Slash] "once per Play Phase" — skill wins.

**Negation Principle:** Negating effects override affirming effects. "Cannot use" > "can use."

---
<!-- rule-section: 9-2-resolution-order -->
### 9.2 Resolution Order

**Insertion (插入结算):** A new event pauses the current flow → the inserted event resolves fully → the original resumes.

> Example: Xiahou Dun takes damage → activates〖Unyielding〗→ Guo Jia takes damage → activates〖Bequeathed Strategy〗→ resolves → back to Guo Jia's damage → back to Xiahou Dun's damage.

**Multi-character order:** From the current turn player, going **counterclockwise**.

**Same-timing limits:**
- Only one character can use at most one card at a given timing
- The same skill at most once per character (except counting-related skills)

> If the current turn player dies during resolution, start from "their next player before death."

---
<!-- rule-section: 9-3-priority-determination -->
### 9.3 Priority Determination

When multiple things are possible at the same timing:

> **Hero skill > Equipment skill > Use card > Game procedure**

> Example: Monarch Cao Cao with [Eight Trigrams] needing [Dodge] → choose〖Royal Escort〗first → then〖Eight Trigrams〗→ then hand card. Skipping a higher priority means losing that timing.

Same-priority skills: the player chooses the order freely.

---
<!-- rule-section: 9-4-condition-check-timing -->
### 9.4 Condition Check Timing

Conditions are checked **when it is that character's turn to choose**. If another skill changes state within the same timing window, a previously unmet condition may become met.

---
<!-- rule-section: 9-5-compulsory-skills-do-not-miss-timing -->
### 9.5 Compulsory Skills Do Not Miss Timing

Compulsory skills (锁定技) trigger and execute immediately when their condition is met. Even if a player forgets to declare the skill, it must still be applied retroactively — the effect is not lost.

> This applies to all Compulsory skills and Awakening skills (觉醒技). They cannot be "skipped" by oversight.

---
<!-- rule-section: 9-6-cannot-respond-to-resolved-events -->
### 9.6 Cannot Respond to Resolved Events

Once an event has finished resolving, it cannot be responded to.

> Nullification (无懈可击) can only be played **before** a Strategy card resolves. It cannot cancel a Strategy card whose effect has already completed.

> Similarly, Dodge can only be played in response to a Slash **before** damage is dealt. Once damage has been applied, the window to dodge is closed.

---
<!-- rule-section: 9-7-prevent-damage-recover -->
### 9.7 Prevent Damage ≠ Recover

When damage is **prevented**, it is treated as if no damage was dealt:

- No "after taking damage" triggers fire
- No dying state check
- No chain propagation
- No death rewards/penalties

When health is **recovered**, all of the above have already occurred — recovery only restores the health value after the fact.

---
<!-- rule-section: 9-8-death-immediate-removal -->
### 9.8 Death: Immediate Removal

When a character dies, the following happens immediately:

1. Discard all cards (hand, equipment, judgment zone)
2. Remove the hero card
3. Remove from distance calculation
4. The character no longer exists in the game

> A dead character cannot activate skills unless the skill explicitly states it works after death.

---
<!-- rule-ui: tabs -->
<!-- rule-section: 10-timing-reference -->
## 10. Timing Reference
<!-- rule-section: turn-phase-timing -->
### Turn Phase Timing

```
Preparation Phase
  ├─ Start-of-turn Compulsory skills
  └─ "At the start of your turn" optional skills

Judgment Phase
  ├─ Lightning (if present in judgment zone)
  ├─ Contentment (if present)
  ├─ Supply Shortage (if present)
  └─ Other delayed cards

Draw Phase
  └─ Draw 2 cards (skills may modify this number)

Play Phase
  ├─ Use cards
  ├─ Activate skills
  └─ Reforge

Discard Phase
  ├─ Discard to hand limit
  └─ "After discarding" triggers

End Phase
  ├─ End-of-turn Compulsory skills
  └─ "At the end of your turn" optional skills
```
<!-- rule-section: damage-event-chain -->
### Damage Event Chain

```
Damage about to be dealt
  ↓
Damage prevention window (skills like〖Heavenly Fragrance〗)
  ↓
[If prevented → end, no damage]
  ↓
Damage dealt
  ↓
"After taking damage" triggers (reactive/sell-blood skills)
  ↓
Health check:
  ├─ Health > 0 → end
  └─ Health ≤ 0 → Enter Dying State
       ↓
     Dying resolution (Peach/Wine, counterclockwise)
       ├─ Saved → Recover to ≥ 1 health → end
       └─ Not saved → Death (immediate removal)
```
<!-- rule-section: slash-resolution-chain -->
### Slash Resolution Chain

```
Use Slash → specify target
  ↓
Target response window:
  ├─ Play Dodge (negates Slash)
  ├─ Activate armor skill (e.g., Eight Trigrams)
  ├─ Activate hero skill (e.g.,〖Royal Escort〗)
  └─ None → Slash hits
  ↓
Damage calculation (modifiers: Wine +1,〖Bare Chested〗+1, etc.)
  ↓

Apply damage
  ↓
Post-damage triggers
<!-- rule-section: topic-guide -->
## Quick reference
<!-- rule-ui: sidebar -->

Jump directly to the rule topic you need.

- <!-- rule-item: flow-setup -->
  **Game Setup**

  ## Components
  
  - **Identity cards** — Monarch, Loyalist, Rebel, Traitor
  - **Hero cards** — Three Kingdoms characters with unique skills
  - **Game cards** — Basic (Slash, Dodge, Peach, Wine), Strategy (instant + delayed), Equipment (weapon, armor, +1/-1 horse)
  - **Health cards** — track remaining health
  
  ## Setup
  
  1. **Draw identity** — each player draws one face down. The **Monarch reveals immediately**.
  2. **Select hero** — Monarch chooses from **5**; others from **3 each**. Reveal your hero.
  3. **Monarch bonus** — Monarch gets **+1 maximum health**.
  4. **Starting hand** — from the Monarch counterclockwise, each draws **4 cards**.
  
  ## Standard 8-Player Distribution
  
  | Role | Count |
  |------|-------|
  | Monarch (主公) | 1 |
  | Loyalist (忠臣) | 2 |
  | Rebel (反贼) | 4 |
  | Traitor (内奸) | 1 |

  Related topics: 
  - [Roles & Victory](#flow-roles)
  - [Game Flow](#flow-game-flow)
  - [Game Cards](#flow-basic-cards)

- <!-- rule-item: flow-roles -->
  **Roles & Victory**

  ## Identity Overview
  
  | Role | Team | Victory Condition |
  |------|------|-------------------|
  | **Monarch (主公)** | Ruler | Eliminate all Rebels and the Traitor |
  | **Loyalist (忠臣)** | Ruler | Protect Monarch; eliminate Rebels and Traitor |
  | **Rebel (反贼)** | Rebel | Eliminate the Monarch |
  | **Traitor (内奸)** | Solo | Be the **last player standing** (Monarch dies last) |
  
  ## Key Rules
  
  - Only the **Monarch** reveals identity at the start.
  - Loyalists and Traitor are **hidden** — deduce allegiance from behavior.
  - **Rebels win immediately** when the Monarch dies.
  - **Traitor** must be the sole survivor; killing Monarch too early lets Rebels win.
  
  ## Death Rewards & Penalties
  
  | Who Died | Effect |
  |----------|--------|
  | **Rebel** killed | Killer draws **3 cards** |
  | **Loyalist** killed by Monarch | Monarch **discards all cards** |

  ![Monarch and loyalists vs rebels; traitor wins alone](/images/rules/legends-of-the-three-kingdoms/identity-win.svg)

  Related topics: 
  - [Dying & Death](#flow-dying-death)
  - [Game Flow](#flow-game-flow)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-game-flow -->
  **Game Flow**

  ## Six Phases (in order)
  
  | # | Phase | What Happens |
  |---|-------|--------------|
  | 1 | **Preparation** | Start-of-turn skills trigger |
  | 2 | **Judgment** | Resolve delayed cards (Contentment, Supply Shortage, Lightning) in reverse placement order |
  | 3 | **Draw** | Draw **2 cards** from the deck |
  | 4 | **Play** | Use cards, activate skills, reforge. Max **1 Slash per turn**. |
  | 5 | **Discard** | Discard hand down to **current health** |
  | 6 | **End** | End-of-turn skills trigger |
  
  ## Judgment Phase Detail
  
  1. Resolve delayed cards in **reverse order of placement**.
  2. Reveal top deck card → apply effect by suit/number.
  3. Judgment-modification skills (e.g. 鬼才, 鬼道) may alter the result.
  4. Judgment card enters discard pile.
  
  > Judgment cards do not belong to any character. They cannot be targeted or obtained (unless a skill specifically allows).
  
  ## Play Phase Detail
  
  - Use Basic and Strategy cards
  - Equip weapons, armor, horses
  - Activate hero skills
  - **Reforge**: discard a card to draw one (does NOT count as "using")
  
  **Key limit:** At most 1 Slash per turn (unless modified by skills or weapons).
  
  ## Turn Direction
  
  Counterclockwise, starting from the Monarch.

  ![Play Sha in range; Shan cancels it](/images/rules/legends-of-the-three-kingdoms/turn-flow.svg)

  Related topics: 
  - [Basic Cards](#flow-basic-cards)
  - [Strategy Cards](#flow-strategy-cards)
  - [Equipment](#flow-equipment)
  - [Distance & Range](#flow-distance)
  - [Roles & Victory](#flow-roles)

- <!-- rule-item: flow-basic-cards -->
  **Basic Cards**

  ## Slash (杀)
  
  | | |
  |---|---|
  | **Timing** | Play Phase |
  | **Target** | One character within attack range |
  | **Effect** | Target must play Dodge or take 1 normal damage |
  | **Limit** | Once per turn (unless modified) |
  
  ## Dodge (闪)
  
  | | |
  |---|---|
  | **Timing** | In response to Slash or Archery Attack |
  | **Target** | None (response card) |
  | **Effect** | Negate one Slash |
  
  ## Peach (桃)
  
  | | |
  |---|---|
  | **Timing** | Your Play Phase, or any time a character is dying |
  | **Target** | Yourself (Play Phase) or any dying character |
  | **Effect** | Restore 1 health (cannot exceed max) |
  
  > On a dying character: restores to 1 health and ends dying state.
  
  ## Wine (酒)
  
  | | |
  |---|---|
  | **Timing** | Play Phase, or when you are dying |
  | **Target** | Yourself |
  | **Effect** | Play Phase: next Slash this turn deals **+1 damage**. Dying: restores 1 health (like Peach). |
  | **Limit** | Once per turn (Play Phase) |
  
  > If the Slash after Wine is dodged, the +1 damage is wasted — there is no damage to increase.

  Related topics: 
  - [Strategy Cards](#flow-strategy-cards)
  - [Equipment](#flow-equipment)
  - [Game Flow](#flow-game-flow)
  - [Dying & Death](#flow-dying-death)

- <!-- rule-item: flow-strategy-cards -->
  **Strategy Cards**

  ## Non-Delayed Strategy Cards
  
  | Card | Type | Effect |
  |------|------|--------|
  | **Something from Nothing (无中生有)** | Self | Draw **2 cards** |
  | **Duel (决斗)** | Targeted | Target plays Slash first, then alternate. Whoever can't → takes **1 damage** |
  | **Archery Attack (万箭齐发)** | AoE | All others must play **Dodge** or take 1 damage |
  | **Barbarian Assault (南蛮入侵)** | AoE | All others must play **Slash** or take 1 damage |
  | **Dismantle (过河拆桥)** | Targeted | Discard **1 card** from target (hand or equipment) |
  | **Snatch (顺手牵羊)** | Targeted | Take **1 card** from target within **distance 1** |
  | **Borrowed Sword (借刀杀人)** | Targeted | Order weapon-equipped character to Slash your designated target. If they refuse → you take their weapon. |
  | **Bountiful Harvest (五谷丰登)** | AoE | Reveal cards = player count; each picks one counterclockwise |
  | **Peach Garden (桃园结义)** | AoE | All characters recover **1 health** (max) |
  | **Nullification (无懈可击)** | Counter | Cancel any Strategy card **before it resolves**. Can counter another Nullification. |
  | **Iron Shackles (铁索连环)** | Targeted | Toggle chain state on 1–2 characters. Chained characters propagate elemental damage. May also reforge. |
  | **Fire Attack (火攻)** | Targeted | Target reveals hand card; you discard same suit → **1 Fire damage** |
  
  ## Delayed Strategy Cards
  
  | Card | Placement | Judgment |
  |------|-----------|----------|
  | **Contentment (乐不思蜀)** | Another character's zone | NOT Hearts → skip **Play Phase** |
  | **Supply Shortage (兵粮寸断)** | Another char within dist 1 | NOT Clubs → skip **Draw Phase** |
  | **Lightning (闪电)** | Your own zone | Spade 2–9 → **3 Lightning damage**; otherwise pass left |
  
  > Nullification can cancel a delayed card when it **enters the judgment zone**, not when the judgment card is revealed.

  Related topics: 
  - [Basic Cards](#flow-basic-cards)
  - [Equipment](#flow-equipment)
  - [Game Flow](#flow-game-flow)
  - [Terminology](#flow-terminology)

- <!-- rule-item: flow-equipment -->
  **Equipment**

  ## Equipment Slots
  
  Each character has 4 equipment slots (one of each type):
  
  | Slot | Effect |
  |------|--------|
  | **Weapon** | Sets **attack range** (typically 2–5). Some grant special effects (e.g. extra Slashes). |
  | **Armor** | Passive protection (e.g. Eight Trigrams: judge — if red, treated as playing Dodge). |
  | **+1 Horse** (defensive) | Others' **distance to you** +1 |
  | **-1 Horse** (offensive) | Your **distance to others** -1 |
  
  ## Range vs Distance
  
  - **Distance** = shortest path between two characters (clockwise or counterclockwise).
  - **Attack range** = set by weapon; determines who you can target with Slash.
  - Adjacent characters are at distance **1**.
  - Dead characters are **excluded** from distance calculation.
  - **Snatch (顺手牵羊)** requires distance **1**.
  - Equipping a new item in the same slot **replaces** the old one (discarded).
  
  > Equipment skills are "possessed" by your character but are NOT "character skills." Effects referencing "character skills" do not include equipment.

  Related topics: 
  - [Distance & Range](#flow-distance)
  - [Basic Cards](#flow-basic-cards)
  - [Strategy Cards](#flow-strategy-cards)
  - [Game Flow](#flow-game-flow)

- <!-- rule-item: flow-distance -->
  **Distance & Range**

  ## How Distance Works
  
  Distance = the **shortest path** between two characters, counting seats clockwise or counterclockwise.
  
  ```
  A —— B —— C —— D —— E
  
  A to C: clockwise 2, counterclockwise 3 → distance = 2
  A to D: clockwise 3, counterclockwise 2 → distance = 2
  ```
  
  ## Dead Characters Are Excluded
  
  ```
  C dies:  A —— B      D —— E
  
  A to D: no continuous path → unreachable
  B to D: B → D = distance 1 (C no longer exists)
  ```
  
  ## Modifiers
  
  | Modifier | Effect |
  |----------|--------|
  | **Weapon** | Sets attack range (independent of distance) |
  | **-1 Horse** | Your distance to others -1 |
  | **+1 Horse** | Others' distance to you +1 |
  
  ## Key Implications
  
  - Adjacent characters are at distance **1**.
  - You can only Slash targets within your **attack range**.
  - **Snatch (顺手牵羊)** requires the target to be within distance **1**.
  - **Supply Shortage (兵粮寸断)** can only be placed on characters within distance **1**.

  Related topics: 
  - [Equipment](#flow-equipment)
  - [Game Flow](#flow-game-flow)
  - [Terminology](#flow-terminology)

- <!-- rule-item: flow-dying-death -->
  **Dying & Death**

  ## Dying State
  
  When health reaches **0**, the character enters **dying state**:
  
  1. Starting from the dying character counterclockwise, each may play **one Peach** (or Wine used as Peach) to attempt rescue.
  2. If healed to ≥ **1 health**, saved and dying state ends.
  3. If all pass → the character **dies**.
  
  > Damage prevention does NOT stop dying. Only Peach/Wine restores health from 0.
  
  ## Death: Immediate Removal
  
  When a character dies:
  
  1. Discard **all cards** (hand, equipment, judgment zone)
  2. Remove the hero card
  3. Exit distance calculation
  4. The character no longer exists in the game
  
  > Dead characters cannot activate skills unless the skill explicitly states it works after death.
  
  ## Rewards & Penalties
  
  | Who Died | Effect |
  |----------|--------|
  | **Rebel (反贼)** killed by anyone | Killer **draws 3 cards** |
  | **Loyalist (忠臣)** killed by Monarch | Monarch **discards all cards** |
  
  ## Victory Check
  
  - **Rebels win** the moment the Monarch dies (even if all Rebels are also dead).
  - Monarch + Loyalists win when all Rebels AND the Traitor are eliminated.
  - Traitor wins when they are the only character remaining.

  Related topics: 
  - [Roles & Victory](#flow-roles)
  - [Basic Cards](#flow-basic-cards)
  - [Terminology](#flow-terminology)
  - [Back to Setup](#flow-setup)

- <!-- rule-item: flow-terminology -->
  **Game Terminology**

  ## Skill Types
  
  | Type | Definition |
  |------|-----------|
  | **Compulsory (锁定技)** | Must activate if able; cannot decline |
  | **Limited (限定技)** | At most once per game |
  | **Awakening (觉醒技)** | Must activate + only once; permanently changes state |
  | **Monarch (主公技)** | Only effective when role is Monarch |
  | **Conversion (转换技)** | Yang/Yin forms; each activation switches |
  
  > To determine if forced: look for **"may" (可以)**, not the "Compulsory" label.
  
  ## Use vs Play
  
  | Action | Definition |
  |--------|-----------|
  | **Use (使用)** | Declare actively, designate targets, full resolution |
  | **Play (打出)** | Respond to event; no targets, no use-effects |
  
  ## Losing Cards
  
  "Losing a card" = any card leaving your control: using, playing, discarding, point duel, reforging, equipment removed/replaced — all count.
  
  ## Damage Terms
  
  | Term | Meaning |
  |------|---------|
  | **Source** | Character dealing damage. If source dies → no source. |
  | **Channel** | Card/skill causing damage. Transfer preserves channel. |
  | **Elemental** | Fire or Lightning. Unspecified = normal. |
  | **Health Loss** | Has NO source. Doesn't trigger reactive skills. |
  
  > **Prevent damage ≠ Recover.** Prevention = no damage happened. Recovery = restoring health after damage.
  
  ## Judgment (判定)
  
  Reveal top deck → modification window → apply effect → card to discard pile.
  
  > Judgment cards don't belong to any character. Can't be targeted or obtained.
  
  ## Point Duel (拼点)
  
  Both must have hand cards. Values: A=1 … K=13. Higher wins. Point duel cards have **no suit**.
  
  ## Choice Keywords
  
  | Word | Meaning |
  |------|---------|
  | **May (可以)** | Has choice; once declared, first effect is mandatory |
  | **Need (需)** | Has choice in *how* to respond, but must respond |
  | **Must (须)** | Forced; no choice |
  
  ## Connective Words
  
  | Word | Meaning |
  |------|---------|
  | **Then (然后)** | Sequential execution |
  | **And (并)** | Simultaneous execution |
  | **If you do (若如此做)** | Subsequent effect only if preceding succeeded |

  Related topics: 
  - [Resolution Rules](#flow-resolution)
  - [Timing Reference](#flow-timing)
  - [Game Flow](#flow-game-flow)

- <!-- rule-item: flow-resolution -->
  **Resolution Rules**

  ## Effect Conflicts
  
  **Priority:** Skill description > Card text > Game rules
  
  **Negation Principle:** Negating effects override affirming effects. "Cannot use" > "can use."
  
  ## Resolution Order
  
  **Insertion:** New event pauses current flow → inserted event resolves → original resumes.
  
  **Multi-character order:** From current turn player, going **counterclockwise**.
  
  ## Priority Determination
  
  > **Hero skill > Equipment skill > Use card > Game procedure**
  
  Skipping a higher priority = losing that timing forever.
  
  ## Compulsory Skills Don't Miss Timing
  
  Compulsory skills trigger immediately when conditions are met. Even if forgotten, the effect must still be applied.
  
  ## Cannot Respond to Resolved Events
  
  Once an event finishes resolving, it cannot be responded to. Nullification must be played **before** the Strategy card resolves.
  
  ## Prevent Damage ≠ Recover
  
  Preventing damage = no damage occurred (no triggers, no dying, no chain). Recovery = restoring health after the fact.
  
  ## Death: Immediate Removal
  
  All cards discarded. Hero removed. Exits distance calculation. No skills unless explicitly stated.

  Related topics: 
  - [Terminology](#flow-terminology)
  - [Timing Reference](#flow-timing)

- <!-- rule-item: flow-timing -->
  **Timing Reference**

  ## Turn Phase Timing
  
  ```
  Preparation Phase
    ├─ Start-of-turn Compulsory skills
    └─ "At the start of your turn" optional skills
  
  Judgment Phase
    ├─ Lightning (if present)
    ├─ Contentment (if present)
    └─ Supply Shortage (if present)
  
  Draw Phase
    └─ Draw 2 cards
  
  Play Phase
    ├─ Use cards / activate skills / reforge
    └─ Max 1 Slash per turn
  
  Discard Phase
    └─ Discard to hand limit
  
  End Phase
    └─ End-of-turn skills
  ```
  
  ## Damage Event Chain
  
  ```
  Damage about to be dealt
    ↓ Prevention window
    ↓ [If prevented → end]
    ↓ Damage dealt
    ↓ "After taking damage" triggers
    ↓ Health check:
      ├─ >0 → end
      └─ ≤0 → Dying → Peach/Wine → Saved or Dead
  ```
  
  ## Slash Resolution Chain
  
  ```
  Use Slash → specify target
    ↓ Response window (Dodge / armor / hero skill)
    ↓ If not dodged → Damage calculation
    ↓ Apply damage → Post-damage triggers
  ```

  Related topics: 
  - [Resolution Rules](#flow-resolution)
  - [Terminology](#flow-terminology)
  - [Game Flow](#flow-game-flow)

