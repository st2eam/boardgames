import { describe, expect, it } from "vitest";
import { parseLoveLetterAiContent } from "./parse-love-letter-decision";

describe("parseLoveLetterAiContent", () => {
  it("parses playCard with speak field", () => {
    const d = parseLoveLetterAiContent(
      JSON.stringify({
        type: "playCard",
        playerId: "wrong",
        payload: { cardId: "c4", targetId: "host", guessRank: 8 },
        speak: "打出守卫，我猜 Host 是「伯爵夫人」。",
      }),
      "ai-1",
    );
    expect(d.action).toEqual({
      type: "playCard",
      playerId: "ai-1",
      payload: { cardId: "c4", targetId: "host", guessRank: 8 },
    });
    expect(d.speak).toBe("打出守卫，我猜 Host 是「伯爵夫人」。");
  });

  it("parses array with type speak", () => {
    const d = parseLoveLetterAiContent(
      `[
        {"type":"playCard","playerId":"ai-1","payload":{"cardId":"c8","targetId":"ai-2"}},
        {"type":"speak","text":"偷看一下。"}
      ]`,
      "ai-1",
    );
    expect(d.action.type).toBe("playCard");
    expect(d.speak).toBe("偷看一下。");
  });

  it("allows action without speak", () => {
    const d = parseLoveLetterAiContent(
      `{"type":"playCard","payload":{"cardId":"c1"}}`,
      "ai-1",
    );
    expect(d.speak).toBeUndefined();
    expect(d.action.playerId).toBe("ai-1");
  });
});
