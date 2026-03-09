export function calculateVideoState({ upvotes, downvotes }) {
  const score = upvotes - downvotes;
  const totalVotes = upvotes + downvotes;
  const positiveRatio = totalVotes === 0 ? 0 : upvotes / totalVotes;

  if (score <= 0 || (downvotes > 0 && positiveRatio < 0.6)) {
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

