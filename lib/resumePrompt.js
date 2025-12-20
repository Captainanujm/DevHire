export function buildResumePrompt({
  templateName,
  templateSections,
  userDetails,
  sectionData
}) {
  return `
You are a professional ATS resume writer and recruiter with expertise across multiple industries.

Your task is to generate a clean, professional, ATS-FRIENDLY resume based strictly on:
1. The selected resume template
2. The sections included in that template
3. The user-provided data only

----------------------------------
NON-NEGOTIABLE RULES
----------------------------------

- Do NOT add fake experience, skills, achievements, or certifications.
- Do NOT assume the user's profession or industry.
- Do NOT invent metrics or impact.
- If a section has no user data → OMIT the section.
- Use simple, ATS-readable text only.
- NO tables, NO columns, NO icons, NO graphics.
- Single-column layout.
- Use professional, neutral language applicable to ANY role.

----------------------------------
INPUT
----------------------------------

SELECTED TEMPLATE:
${templateName}

TEMPLATE SECTIONS (strict order):
${JSON.stringify(templateSections)}

----------------------------------
USER DETAILS
----------------------------------

FULL NAME: ${userDetails.name}
EMAIL: ${userDetails.email}
PHONE: ${userDetails.phone}
LOCATION: ${userDetails.location || ""}
LINKS: ${userDetails.links || ""}

----------------------------------
SECTION DATA
----------------------------------

${JSON.stringify(sectionData, null, 2)}

----------------------------------
CONTENT ENHANCEMENT GUIDELINES
----------------------------------

- Improve grammar and clarity only
- Rewrite into concise bullet points
- Use action verbs
- Do NOT add metrics
- Use "-" for bullets only

----------------------------------
OUTPUT FORMAT
----------------------------------

Return ONLY the resume text.

FORMAT:
1. HEADER
   Name
   Contact info in one line separated by "|"

2. SECTIONS
   - Headings in ALL CAPS
   - Follow template order exactly
   - Bullets using "-"

----------------------------------
FINAL VALIDATION
----------------------------------

Ensure ATS-parseable, no assumptions, no fabricated data.

Now generate the final resume.
`;
}
