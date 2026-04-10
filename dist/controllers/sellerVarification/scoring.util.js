"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
function calculateScore(input) {
    let score = 0;
    if (input.hasUniversityText)
        score += 1;
    if (input.studentIdValid)
        score += 2;
    if (input.qrMatches)
        score += 3;
    if (!input.duplicateId)
        score += 2;
    return score;
}
//# sourceMappingURL=scoring.util.js.map