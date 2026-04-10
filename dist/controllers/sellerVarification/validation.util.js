"use strict";
// export function extractStudentId(text: string): string | null {
//   const match = text.match(/(ETS|ET|ENG)\d{3,5}\/\d{2}/);
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractName = extractName;
//   return match ? match[0] : null;;
// }
function extractName(text) {
    const match = text.match(/Full Name\s+([A-Z\s]+)/i);
    return match && match[1] ? match[1].trim() : null;
}
//# sourceMappingURL=validation.util.js.map