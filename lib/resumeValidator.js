export function sanitizeSectionData(sectionData) {
  const clean = {};

  for (const key in sectionData) {
    const value = sectionData[key];

    if (Array.isArray(value) && value.length > 0) {
      clean[key] = value;
    } else if (typeof value === "string" && value.trim() !== "") {
      clean[key] = value;
    } else if (typeof value === "object" && value !== null) {
      clean[key] = value;
    }
  }

  return clean;
}
