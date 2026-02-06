export function calculateScore(input: {
  hasUniversityText: boolean;
  studentIdValid: boolean;
  qrMatches: boolean;
  duplicateId: boolean;
}): number {
  let score = 0;
  if (input.hasUniversityText) score += 1;
  if (input.studentIdValid) score += 2;
  if (input.qrMatches) score += 3;
  if (!input.duplicateId) score += 2;
  return score;
}
