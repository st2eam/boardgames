# Sanguosha (Legends of the Three Kingdoms) Rules

## 1. Overview

Sanguosha is a Chinese card game inspired by the Romance of the Three Kingdoms. Players assume the identities of legendary heroes, each with unique abilities. Hidden roles determine each player's allegiance and victory condition.

## 2. Components

- **Identity Cards** — 1 Monarch, 2 Loyalists, 4 Rebels, 1 Traitor (for 8 players)
- **Hero Cards** — 25+ heroes from the Three Kingdoms era, each with unique skills
- **Game Cards** — Basic cards (Slash, Dodge, Peach), Strategy cards (Scrolls), and Equipment cards
- **Health Cards** — To track each hero's remaining health

## 3. Roles & Victory Conditions

| Role | Team | Objective |
|------|------|-----------|
| **Monarch (主公)** | Ruler | Eliminate all Rebels and the Traitor |
| **Loyalist (忠臣)** | Ruler | Protect the Monarch; eliminate Rebels and Traitor |
| **Rebel (反贼)** | Rebel | Eliminate the Monarch |
| **Traitor (内奸)** | Solo | Be the last player standing (Monarch eliminated last) |

Roles are kept secret except the Monarch, who reveals immediately.

## 4. Setup

1. Select identity cards based on player count. Each player draws one face down. The Monarch reveals their identity.
2. The Monarch receives 5 hero cards to choose from; other players receive 3 each.
3. Each player selects a hero and reveals it. The Monarch gets +1 maximum health.
4. Starting from the Monarch (counterclockwise), each player draws 4 starting cards.

## 5. Game Flow

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

## 6. Game Cards

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

### Equipment Cards

| Type | Effect |
|------|--------|
| **Weapon** | Sets attack range (typically 2–5). May grant special effects. |
| **Armor** | Provides passive protection (e.g., Eight Trigrams: when you need to play Dodge, judge — if red, treated as having played Dodge). |
| **+1 Horse** (defensive) | Other characters' distance to you is increased by 1 |
| **-1 Horse** (offensive) | Your distance to other characters is decreased by 1 |

> **Rule:** Equipment skills are "possessed" by your character but are NOT "character skills." Effects that reference "character skills" do not include equipment skills.

---

## 7. Basic Rules

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

### Dying State

When health reaches 0, the character enters **dying state**:

1. Starting from the dying character and going counterclockwise, each character may play one Peach (or Wine used as Peach) to attempt rescue.
2. If the dying character is healed to at least 1 health, they are saved and the dying state ends.
3. If all players pass, the character dies.

A character with 0 or negative health can only be saved by Peach/Wine — damage prevention does not stop dying.

### Hand Limit

During Discard Phase, hand size must not exceed current health. Excess cards are discarded.

> "Phase discard" refers specifically to this mandatory discard. It is a subset of "discard" (弃置), which also includes discarding caused by skills or cards.

---

## 8. Game Terminology

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

### Use vs Play

| Action | Definition | Triggers |
|--------|-----------|----------|
| **Use (使用)** | Declare actively, designate targets, full resolution | "When you use…" abilities |
| **Play (打出)** | Respond to an event by revealing a card; no targets, no use-effects | Only "when you play/lose…" abilities |

---

### Discard (弃置) vs Phase Discard

- **Discard (弃置):** Place cards from any character's zone into the discard pile
- **Phase discard:** Specifically discarding your own cards exceeding the hand limit during Discard Phase (a subset of discard)

---

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

### Recover (回复)

Increase health (cannot exceed maximum). A character at full health cannot recover.

> **Wounded (受伤):** Health < maximum health.

---

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

### Judgment (判定)

1. Reveal the top card of the deck as the **judgment card**.
2. Characters with judgment-modification skills (e.g., Demonic Talent, Dark Arts) may modify, going counterclockwise from the current turn player. Once a player passes, they cannot re-enter.
3. The judgment takes effect based on suit/number.
4. The judgment card enters the discard pile (unless a skill says otherwise, e.g., Envy of Heaven takes it to hand).

> **Judgment cards do not belong to any character.** They cannot be targeted, cannot be obtained (unless a skill specifically allows it), and their discard does not trigger "lose card" abilities.

---

### Point Duel (拼点)

**Conditions:** Both parties must have hand cards. A character with no hand cards cannot initiate or be targeted.

**Card values:**

| A | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | J | Q | K |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |

> A = 1 (smallest), K = 13 (largest).

> **Point duel cards have no suit.** Only the number matters, unless a skill states otherwise.

**Resolution:**
1. Both parties select one hand card and place it face-down in the processing zone simultaneously.
2. Reveal simultaneously; compare values:
   - Different → higher **wins**, lower **did not win**
   - Same → **neither wins**
3. Both cards simultaneously enter the discard pile.
4. Execute the effect based on the result.

---

### Reforging (重铸)

- Declared during Play Phase: place a card into the discard pile, then draw one.
- Does NOT count as "using" (no "when you use…" triggers).
- DOES count as "losing" a card.

---

### Action Keywords

**"Have/Order" (令)** — A issues a command, B executes. B cannot refuse.

> Example: Diao Chan〖Dissension〗"**Have** a male character use [Duel]…" → The commanded party must comply.

> "You **may** have B…" — "may" modifies whether A issues the command, not whether B complies.

**"Treated as" (视为)** — Used as another card; inherits all properties; still counts as "using."

> Example: Gan Ning〖Surprise Raid〗"Use a black card as [Dismantle]." → Can be nullified.

**"Transfer" (转移)** — Redirect damage from A to B: prevent A's damage → terminate its resolution → B takes damage from the same source, channel, and attribute.

---

### Choice Keywords

**"May" (可以)** — Has choice; may activate or decline. Once declared, the first effect is mandatory.

**"Need" (需)** — Has choice in *how* to respond, but must respond.

**"Must" (须)** — Forced; no choice.

**"Any number" (任意数量)** — Can be 0.

---

### Connective Words

| Word | Meaning |
|------|---------|
| **"Then" (然后)** | Two effects execute sequentially |
| **"And" (并)** | Two operations execute **simultaneously** |
| **"If you do" (若如此做)** | Subsequent effect only if the preceding action succeeded |

---

### One-at-a-Time vs Simultaneous

**With "one at a time" (依次):** Operate individually; each resolves completely before the next.

**Without:** All operated simultaneously.

> Example: Stone Axe discards 2 cards simultaneously — Lu Xun cannot discard their last card, trigger〖Chain〗to draw one, then discard the new card to pay the cost.

---

### Choose One (选择一项)

Pick from multiple options. **Core rule:** If all effects of an option cannot execute, that option cannot be chosen.

> Example: A activates〖Gender Blades〗against B who has no hand cards — B must choose "let A draw 1," because "discard a hand card" cannot be executed.

---

### Target Character

In use-resolution: the card's target. In damage-resolution: the **current** target (may change via transfer).

> Example: Xu Chu〖Bare Chested〗+ [Duel] vs Xiao Qiao (+1 damage); Xiao Qiao〖Heavenly Fragrance〗transfers to A — the target is still Xiao Qiao, so A does not get +1 damage.

---

### Other Terms

| Term | Meaning |
|------|---------|
| **Another character** | Excludes self (vs "a character") |
| **Other characters** | Excludes "you" (the user) |
| **User** | The character who used the card. If changed, subsequent resolution follows the new user. |
| **By this method** | As described in this skill's activation |
| **X times per Play Phase** | Maximum activations in one Play Phase |

### Number Conventions

- **Chinese numerals** (一, 两, 三) → card counts, player counts, option counts
- **Arabic numerals** (1, 2, 3) → health, damage, tokens

---

## 9. Resolution Rules

### 9.1 Effect Conflicts

**Priority:** Skill description > Card text > Game rules

> Example:〖Berserk〗"no Slash limit" vs [Slash] "once per Play Phase" — skill wins.

**Negation Principle:** Negating effects override affirming effects. "Cannot use" > "can use."

---

### 9.2 Resolution Order

**Insertion (插入结算):** A new event pauses the current flow → the inserted event resolves fully → the original resumes.

> Example: Xiahou Dun takes damage → activates〖Unyielding〗→ Guo Jia takes damage → activates〖Bequeathed Strategy〗→ resolves → back to Guo Jia's damage → back to Xiahou Dun's damage.

**Multi-character order:** From the current turn player, going **counterclockwise**.

**Same-timing limits:**
- Only one character can use at most one card at a given timing
- The same skill at most once per character (except counting-related skills)

> If the current turn player dies during resolution, start from "their next player before death."

---

### 9.3 Priority Determination

When multiple things are possible at the same timing:

> **Hero skill > Equipment skill > Use card > Game procedure**

> Example: Monarch Cao Cao with [Eight Trigrams] needing [Dodge] → choose〖Royal Escort〗first → then〖Eight Trigrams〗→ then hand card. Skipping a higher priority means losing that timing.

Same-priority skills: the player chooses the order freely.

---

### 9.4 Condition Check Timing

Conditions are checked **when it is that character's turn to choose**. If another skill changes state within the same timing window, a previously unmet condition may become met.

---

### 9.5 Compulsory Skills Do Not Miss Timing

Compulsory skills (锁定技) trigger and execute immediately when their condition is met. Even if a player forgets to declare the skill, it must still be applied retroactively — the effect is not lost.

> This applies to all Compulsory skills and Awakening skills (觉醒技). They cannot be "skipped" by oversight.

---

### 9.6 Cannot Respond to Resolved Events

Once an event has finished resolving, it cannot be responded to.

> Nullification (无懈可击) can only be played **before** a Strategy card resolves. It cannot cancel a Strategy card whose effect has already completed.

> Similarly, Dodge can only be played in response to a Slash **before** damage is dealt. Once damage has been applied, the window to dodge is closed.

---

### 9.7 Prevent Damage ≠ Recover

When damage is **prevented**, it is treated as if no damage was dealt:

- No "after taking damage" triggers fire
- No dying state check
- No chain propagation
- No death rewards/penalties

When health is **recovered**, all of the above have already occurred — recovery only restores the health value after the fact.

---

### 9.8 Death: Immediate Removal

When a character dies, the following happens immediately:

1. Discard all cards (hand, equipment, judgment zone)
2. Remove the hero card
3. Remove from distance calculation
4. The character no longer exists in the game

> A dead character cannot activate skills unless the skill explicitly states it works after death.

---

## 10. Timing Reference

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
```

---

## 11. FAQ

**Q: If Slash after Wine is dodged, is the +1 damage wasted?**
A: Yes. There is no damage to increase — the Wine's effect is consumed but has no impact.

**Q: Can Nullification cancel another Nullification?**
A: Yes. Nullification can target any Strategy card, including another Nullification.

**Q: Can a dead character still activate skills?**
A: Only if the skill explicitly states it can be used after death. Otherwise, all hero skills cease upon death.

**Q: Can Lightning be nullified?**
A: Nullification can cancel Lightning when it first enters the judgment zone. It cannot cancel the judgment result after the judgment card is revealed.

**Q: If my hand is empty, can I be targeted by Point Duel?**
A: No. Point Duel requires both parties to have at least one hand card.

**Q: Does losing health from a skill (体力流失) trigger "sell-blood" abilities?**
A: No. Health loss has no source and does not trigger reactive skills like Feedback or Bequeathed Strategy.

**Q: Can I use Peach on myself during someone else's turn?**
A: Only during your own Play Phase, or when you are in the dying state (any turn). You cannot use Peach on yourself during another player's turn unless you are dying.

**Q: What happens if the Monarch dies from Lightning?**
A: Rebels win immediately. Death rewards/penalties are determined by damage attribution, but victory conditions check the final state regardless.

**Q: Does removing equipment count as "losing" a card?**
A: Yes. Whether removed by Dismantle, Snatch, or replacement, equipment leaving your zone counts as losing a card.

**Q: If two Compulsory skills trigger at the same time, which resolves first?**
A: They follow the standard multi-character order: starting from the current turn player, going counterclockwise.
