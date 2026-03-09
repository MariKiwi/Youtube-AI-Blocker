import test from "node:test";
import assert from "node:assert/strict";

import { calculateVideoState } from "../server/src/lib/confidence.js";

test("calculateVideoState returns low confidence for small positive scores", () => {
  assert.deepEqual(calculateVideoState({ upvotes: 1, downvotes: 0 }), {
    score: 1,
    confidenceLevel: "LOW",
    status: "FLAGGED",
  });
});

test("calculateVideoState returns medium confidence for mid positive scores", () => {
  assert.deepEqual(calculateVideoState({ upvotes: 7, downvotes: 1 }), {
    score: 6,
    confidenceLevel: "MEDIUM",
    status: "FLAGGED",
  });
});

test("calculateVideoState returns high confidence for large positive scores", () => {
  assert.deepEqual(calculateVideoState({ upvotes: 20, downvotes: 2 }), {
    score: 18,
    confidenceLevel: "HIGH",
    status: "FLAGGED",
  });
});

test("calculateVideoState returns disputed when the score is not positive", () => {
  assert.deepEqual(calculateVideoState({ upvotes: 3, downvotes: 3 }), {
    score: 0,
    confidenceLevel: "DISPUTED",
    status: "DISPUTED",
  });
});

test("calculateVideoState returns disputed for negative scores down to -5", () => {
  assert.deepEqual(calculateVideoState({ upvotes: 2, downvotes: 5 }), {
    score: -3,
    confidenceLevel: "DISPUTED",
    status: "DISPUTED",
  });
});

test("calculateVideoState returns unflagged below -5", () => {
  assert.deepEqual(calculateVideoState({ upvotes: 2, downvotes: 8 }), {
    score: -6,
    confidenceLevel: "UNFLAGGED",
    status: "UNFLAGGED",
  });
});
