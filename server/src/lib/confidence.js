export function calculateVideoState({ upvotes, downvotes }) {
  const score = upvotes - downvotes;

  if (score < -5) {
    return {
      score,
      confidenceLevel: "UNFLAGGED",
      status: "UNFLAGGED",
    };
  }

  if (score <= 0) {
    return {
      score,
      confidenceLevel: "DISPUTED",
      status: "DISPUTED",
    };
  }

  if (score >= 15) {
    return {
      score,
      confidenceLevel: "HIGH",
      status: "FLAGGED",
    };
  }

  if (score >= 5) {
    return {
      score,
      confidenceLevel: "MEDIUM",
      status: "FLAGGED",
    };
  }

  return {
    score,
    confidenceLevel: "LOW",
    status: "FLAGGED",
  };
}
