// utils/renderResumeHTMLToPDF.js
/*const puppeteer = require("puppeteer");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates an AI-designed HTML resume and renders it as a styled PDF.
 * Enriches the resume content using LinkedIn and portfolio URLs.
 
        async function renderResumeHTMLToPDF(res, formData, filename = "AI_Resume.pdf") {
        try {
            console.log("🎨 Generating AI-enhanced resume...");

            let enrichedProfile = { ...formData };

            // ---------- STEP 1: Enrich profile using LinkedIn/Portfolio ----------
            try {
            if (formData.linkedinUrl || formData.portfolioUrl) {
                console.log("🌐 Enriching with LinkedIn/Portfolio info...");

                const enrichmentPrompt = `
        You are a professional data extractor.
        From the public information available in the following links, extract as much structured professional detail as possible:
        LinkedIn: ${formData.linkedinUrl || "N/A"}
        Portfolio: ${formData.portfolioUrl || "N/A"}

        Return only valid JSON with this structure:
        {
        "summary": "",
        "experiences": [{ "company": "", "position": "", "startDate": "", "endDate": "", "responsibilities": [], "achievements": [] }],
        "education": [{ "institution": "", "degree": "", "field": "", "graduationYear": "" }],
        "skills": { "technical": "", "soft": "", "languages": "" },
        "certifications": "",
        "projects": "",
        "awards": ""
        }
        `;

                const enrich = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a LinkedIn and portfolio summarizer." },
                    { role: "user", content: enrichmentPrompt }
                ],
                temperature: 0.3,
                max_tokens: 2000,
                });

                try {
                const parsed = JSON.parse(enrich.choices[0].message.content);
                enrichedProfile = { ...enrichedProfile, ...parsed };
                console.log("✅ Successfully enriched data with AI context.");
                } catch {
                console.warn("⚠️ Enrichment output not valid JSON — skipping merge.");
                }
            }
            } catch (err) {
            console.warn("⚠️ Enrichment step failed:", err.message);
            }

            // ---------- STEP 2: Generate AI-designed HTML ----------
            const prompt = `
        You are a professional resume designer and ATS optimization expert.
        Create a complete, premium-quality, **HTML resume** using the data below.

        ${JSON.stringify(enrichedProfile, null, 2)}

        STYLE RULES:
        - Clean, one-page white layout.
        - Font: Helvetica or Arial.
        - Accent color: #2563eb for section headers and dividers.
        - Bold for section titles (Summary, Experience, Education, Skills, Certifications).
        - Use bullet points for achievements.
        - Remove hyperlink underlines; make links black.
        - Use inline <style> CSS inside <head>.
        - No markdown, no explanations — only valid HTML starting with <!DOCTYPE html>.
        `;

            const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert resume architect." },
                { role: "user", content: prompt },
            ],
            temperature: 0.6,
            max_tokens: 4000,
            });

            let html = completion.choices[0].message.content?.trim() || "";
            html = html.replace(/^```(html)?/gi, "").replace(/```$/g, "").trim();

            // ---------- STEP 3: Validate HTML ----------
            if (!html.startsWith("<!DOCTYPE html")) {
            console.warn("⚠️ Invalid HTML detected, attempting fix...");
            const fixPrompt = `
        Convert the following text into a valid, clean, modern HTML resume layout with inline CSS:
        ${html}
            `;
            const retry = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                { role: "system", content: "You fix and format HTML resumes." },
                { role: "user", content: fixPrompt },
                ],
                temperature: 0.4,
                max_tokens: 3500,
            });
            html = retry.choices[0].message.content
                .replace(/^```(html)?/gi, "")
                .replace(/```$/g, "")
                .trim();
            }

            if (!html.startsWith("<!DOCTYPE html")) {
            res.status(502).json({ error: "AI did not return valid HTML" });
            return;
            }

            console.log("✅ HTML validated. Rendering PDF...");

            // ---------- STEP 4: Render PDF ----------
            const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = await browser.newPage();

            await page.setContent(html, { waitUntil: "networkidle0" });

            const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
            });

            await browser.close();

            if (!pdfBuffer || pdfBuffer.length < 5000) {
            res.status(500).json({ error: "Generated PDF invalid" });
            return;
            }

            // ---------- STEP 5: Send as binary ----------
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Transfer-Encoding", "binary");
            res.end(pdfBuffer, "binary");

            console.log("🎉 Resume PDF successfully generated by AI.");

        } catch (error) {
            console.error("❌ Error rendering resume:", error);
            if (!res.headersSent) {
            res.status(500).json({
                error: "Failed to generate AI-designed resume",
                message: error.message,
            });
            }
        }
        }

    module.exports = { renderResumeHTMLToPDF }; */












// utils/renderResumeHTMLToPDF.js
const puppeteer = require("puppeteer");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function renderResumeHTMLToPDF(res, formData, filename = "AI_Resume.pdf") {
  try {
    console.log("🎨 Generating AI resume...");
    // Instead of separate enrichment, just log for debugging
    console.log("🌐 LinkedIn:", formData.linkedinUrl || "none");
    console.log("🌐 Portfolio:", formData.portfolioUrl || "none");


    // ---------- PROMPT ----------
    const prompt = `
   -
                    PROFESSIONAL RESUME GENERATION TASK
                         Expert-Level Assignment
-

        ROLE & EXPERTISE:
        You are a world-class resume writer and career strategist with extensive experience working with executives, senior professionals, and top-tier talent across all industries. You have successfully placed candidates at Fortune 500 companies, leading tech firms (FAANG), prestigious consulting firms (McKinsey, BCG, Bain), and innovative startups. Your resumes have a 95% interview callback rate.

        -
        PRIMARY OBJECTIVE:
        -

        Analyze the provided URLs (LinkedIn profile, portfolio website, GitHub, personal site, etc.) and create an EXCEPTIONAL, modern, and strategically-crafted resume that positions the candidate as a top-choice professional in their field. This resume must be the absolute best representation of their career achievements and potential.

        -
        PHASE 1: COMPREHENSIVE URL ANALYSIS
        -

        STEP 1 - DEEP DIVE RESEARCH:
        Thoroughly examine EVERY piece of information from the provided URLs:

        A) BASIC INFORMATION:
        □ Full legal name (exactly as they present professionally)
        □ Current professional title or desired position
        □ Email address (professional format)
        □ Phone number (with country code if international)
        □ Location (City, State/Country)
        □ LinkedIn URL (clean format)
        □ Portfolio/Website URL
        □ GitHub profile (if applicable)
        □ Any other professional social media

        B) PROFESSIONAL SUMMARY:
        □ Current role and level of seniority
        □ Years of total experience
        □ Core areas of expertise
        □ Industry specialization
        □ Unique value proposition
        □ Career aspirations (if evident)

        C) WORK EXPERIENCE:
        For EACH position, extract:
        □ Exact job title
        □ Company name (with proper formatting)
        □ Company location (City, State/Country)
        □ Employment dates (Month Year format)
        □ Whether currently employed (mark as "Present")
        □ Detailed responsibilities
        □ Quantifiable achievements
        □ Technologies/tools used
        □ Team size managed (if applicable)
        □ Budget managed (if applicable)
        □ Key projects or initiatives led
        □ Awards or recognition received
        □ Promotions or career growth

        D) EDUCATION:
        For EACH degree/certification:
        □ Degree type (Bachelor's, Master's, PhD, etc.)
        □ Field of study or major
        □ University/Institution name
        □ Location of institution
        □ Graduation year (or expected graduation)
        □ GPA (if 3.5+ or equivalent)
        □ Academic honors (Dean's List, Cum Laude, etc.)
        □ Relevant coursework (if recent graduate)
        □ Thesis or research focus (if advanced degree)

        E) SKILLS INVENTORY:
        □ Technical skills (programming languages, tools, platforms, software)
        □ Soft skills (leadership, communication, problem-solving)
        □ Languages spoken (with proficiency level)
        □ Frameworks and libraries
        □ Methodologies (Agile, Scrum, Six Sigma, etc.)
        □ Certifications and licenses

        F) PROJECTS & PORTFOLIO:
        □ Project names and descriptions
        □ Role in each project
        □ Technologies utilized
        □ Project outcomes and impact
        □ Links to live projects or demos
        □ Open-source contributions
        □ Publications or articles

        G) CERTIFICATIONS & AWARDS:
        □ Professional certifications (name, issuer, date)
        □ Industry awards
        □ Recognition or honors
        □ Professional memberships
        □ Speaking engagements
        □ Publications

        STEP 2 - SYNTHESIZE & ORGANIZE:
        Once all information is extracted, organize it chronologically (reverse chronological order - most recent first) and categorize by relevance and impact.

        -
        PHASE 2: STRATEGIC CONTENT DEVELOPMENT
        -

        CONTENT TRANSFORMATION RULES:

        1. ACHIEVEMENT-ORIENTED WRITING:
        ✓ Transform every responsibility into an achievement
        ✓ Start bullet points with powerful action verbs
        ✓ Use the CAR method: Challenge-Action-Result
        ✓ Quantify everything possible (percentages, dollar amounts, time saved, users impacted)

        EXAMPLES:
        ❌ WEAK: "Responsible for managing a team"
        ✅ STRONG: "Led cross-functional team of 12 developers, delivering 5 major product releases that increased user engagement by 47%"

        ❌ WEAK: "Worked on improving website performance"
        ✅ STRONG: "Optimized website architecture reducing page load time by 60%, resulting in 25% increase in conversion rates and $2M additional annual revenue"

        2. POWER VERBS TO USE:
        Leadership: Spearheaded, Orchestrated, Championed, Pioneered, Directed
        Achievement: Delivered, Achieved, Exceeded, Accomplished, Attained
        Innovation: Innovated, Developed, Designed, Architected, Engineered
        Improvement: Optimized, Enhanced, Streamlined, Transformed, Revolutionized
        Growth: Scaled, Expanded, Grew, Accelerated, Amplified
        Management: Orchestrated, Coordinated, Facilitated, Supervised, Mentored

        3. QUANTIFICATION STRATEGY:
        Always include numbers when possible:
        ✓ Team size (Led team of X people)
        ✓ Budget (Managed $X budget)
        ✓ Percentages (Increased efficiency by X%)
        ✓ Time frames (Delivered in X weeks, ahead of schedule)
        ✓ Scale (Serving X users, Processing X transactions)
        ✓ Revenue impact (Generated $X in revenue, Saved $X in costs)

        4. PROFESSIONAL SUMMARY FORMULA:
        Create a 3-4 sentence summary that includes:
        • [Job Title/Level] with [X years] of experience in [Industry/Field]
        • Core expertise in [Key Skills/Technologies]
        • Track record of [Key Achievements/Impact]
        • Known for [Unique Strengths/Differentiators]

        -
        PHASE 3: RESUME STRUCTURE & SECTIONS
        -

        BUILD THE RESUME IN THIS EXACT ORDER:

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 1. HEADER SECTION                                                           │
        └─────────────────────────────────────────────────────────────────────────────┘
        • Full Name (large, bold, prominent)
        • Professional Title (if applicable)
        • Contact: Email | Phone | Location
        • Links: LinkedIn | Portfolio | GitHub (if applicable)

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 2. PROFESSIONAL SUMMARY                                                     │
        └─────────────────────────────────────────────────────────────────────────────┘
        • 3-4 impactful sentences
        • Highlight years of experience and expertise
        • Showcase key achievements and value proposition
        • Make it compelling and specific to their field

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 3. PROFESSIONAL EXPERIENCE                                                  │
        └─────────────────────────────────────────────────────────────────────────────┘
        For EACH position:
        • Job Title | Company Name, Location
        • Employment Dates (right-aligned on same line as title)
        • 4-6 achievement-focused bullet points
        • Order by impact (most impressive first)
        • Use varied action verbs
        • Include quantifiable results

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 4. EDUCATION                                                                │
        └─────────────────────────────────────────────────────────────────────────────┘
        For EACH degree:
        • Degree Type in Field of Study | Institution Name, Location
        • Graduation Date (right-aligned)
        • GPA: X.X/4.0 (only if 3.5+)
        • Relevant honors, awards, or distinctions

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 5. SKILLS & EXPERTISE                                                       │
        └─────────────────────────────────────────────────────────────────────────────┘
        Organize into clear categories:
        • Technical: [comma-separated list]
        • Soft Skills: [comma-separated list]
        • Languages: [language (proficiency level)]

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 6. PROJECTS (Include if impressive and relevant)                           │
        └─────────────────────────────────────────────────────────────────────────────┘
        For EACH project:
        • Project Name | Technologies Used
        • Brief description (1-2 sentences)
        • 2-4 bullet points highlighting impact and outcomes

        ┌─────────────────────────────────────────────────────────────────────────────┐
        │ 7. CERTIFICATIONS & AWARDS (Include if applicable)                         │
        └─────────────────────────────────────────────────────────────────────────────┘
        • Certification/Award Name | Issuing Organization | Date

        -
        PHASE 4: CRITICAL FORMATTING REQUIREMENTS
        -

        ⚠️ MANDATORY FORMATTING RULES - FOLLOW EXACTLY:

        1. LEFT ALIGNMENT RULE (CRITICAL):
        ✓ ALL text content MUST start from the left margin
        ✓ NO text should be positioned on the right side except dates
        ✓ ONLY employment dates and graduation dates can be right-aligned
        ✓ All descriptions, bullet points, and paragraphs MUST be left-aligned
        ✓ NO centered text except in the header section (name and contact info)

        2. BULLET POINT RULES:
        ✓ Use simple, small circular bullets (•)
        ✓ NO nested bullets or sub-bullets under any circumstances
        ✓ ALL bullets must be at the same indentation level (flat list)
        ✓ Maximum 6 bullets per job position
        ✓ Each bullet should be 1-2 lines maximum

        3. SPACING RULES:
        ✓ Consistent spacing between sections (0.5-0.8 inches)
        ✓ Adequate white space for readability
        ✓ Section headers clearly separated from content
        ✓ No cramped or cluttered appearance

        4. TYPOGRAPHY RULES:
        ✓ Professional sans-serif font (Helvetica, Arial, or Calibri)
        ✓ Name: 28-32pt, bold
        ✓ Section headers: 13-15pt, bold, uppercase
        ✓ Job titles: 11-13pt, bold
        ✓ Body text: 10-11pt, regular
        ✓ Dates and secondary info: 9-10pt

        5. COLOR SCHEME:
        ✓ Use professional, modern colors
        ✓ Primary text: Dark gray or black (#1e293b, #334155)
        ✓ Accent color: Professional blue (#2563eb, #3b82f6)
        ✓ Secondary text: Medium gray (#64748b)
        ✓ Dividers: Light gray (#e2e8f0, #cbd5e1)

        6. PAGE LAYOUT:
        ✓ Standard margins: 0.5-0.75 inches all around
        ✓ Maximum 2 pages (1 page preferred for <10 years experience)
        ✓ No orphaned lines or awkward page breaks
        ✓ Content should flow naturally

        -
        PHASE 5: QUALITY ASSURANCE CHECKLIST
        -

        Before finalizing, verify EVERY item below:

        CONTENT QUALITY:
        □ All information accurately extracted from provided URLs
        □ No fabricated or embellished information
        □ Every bullet point starts with a strong action verb
        □ At least 60% of bullets include quantifiable metrics
        □ No spelling errors or typos
        □ No grammatical mistakes
        □ Consistent verb tense (past for previous roles, present for current role)
        □ No first-person pronouns (I, me, my)
        □ Professional tone throughout
        □ Industry-appropriate terminology

        FORMATTING QUALITY:
        □ ALL content is left-aligned (except dates)
        □ NO nested bullet points
        □ Consistent spacing throughout
        □ Section headers clearly distinguished
        □ Dates formatted consistently (Month Year – Month Year)
        □ Font sizes appropriate and consistent
        □ Colors used professionally and sparingly
        □ Clean, modern visual appearance
        □ Easy to scan in 6 seconds

        ATS COMPATIBILITY:
        □ Simple, clean formatting (no tables, text boxes, or graphics)
        □ Standard section headers
        □ Keywords from job descriptions naturally incorporated
        □ No headers or footers
        □ Standard fonts used
        □ Bullet points properly formatted
        □ No unusual characters or symbols

        STRATEGIC POSITIONING:
        □ Professional summary is compelling and specific
        □ Most impressive achievements highlighted first
        □ Career progression is clear and logical
        □ Skills match industry standards and expectations
        □ Resume tells a cohesive career story
        □ Candidate positioned as top-tier professional
        □ Unique value proposition is evident

        -
        PHASE 6: FINAL OUTPUT REQUIREMENTS
        -

        DELIVERABLE SPECIFICATIONS:

        1. FORMAT:
        Generate the resume in the requested format:
        • PDF (using provided PDF generation code)
        • HTML (using provided HTML generation code)
        • Both formats if requested

        2. FILE NAMING:
        • Format: [FirstName]_[LastName]_Resume_[Date]
        • Example: John_Doe_Resume_2024.pdf

        3. METADATA:
        • Title: [Full Name] - Professional Resume
        • Author: ResuMind
        • Keywords: Relevant job titles and skills

        4. FINAL QUALITY STANDARD:
        This resume must be:
        ✓ Interview-worthy at top-tier companies (Google, Amazon, Microsoft, McKinsey, etc.)
        ✓ ATS-compliant and optimized for applicant tracking systems
        ✓ Visually impressive and easy to read
        ✓ Strategically positioned to highlight strengths
        ✓ Error-free and professionally polished
        ✓ Ready to submit immediately without any edits needed

        -
        EXECUTION INSTRUCTIONS
        -

        BEGIN TASK NOW:

        1. Analyze the provided URLs thoroughly
        2. Extract all relevant information systematically
        3. Transform content using achievement-oriented writing
        4. Structure the resume according to specifications
        5. Apply all formatting rules (especially left-alignment)
        6. Run through quality assurance checklist
        7. Generate final output in requested format

        REMEMBER: This resume represents someone's career and future opportunities. Make it EXCEPTIONAL. Every word should add value. Every line should impress. This should be the best resume this candidate has ever had.

        Your goal: Create a resume that makes hiring managers say "We need to interview this person immediately."

                                    BEGIN ANALYSIS NOW

    
    DATA PROVIDED:
    ${JSON.stringify(formData, null, 2)}
    
    LINKEDIN: ${formData.linkedinUrl || "none"}
    PORTFOLIO: ${formData.portfolioUrl || "none"}
    
    RESUME GENERATION STYLE RULES:

LAYOUT & STRUCTURE:
    - Single-page, clean white background layout
    - All content left-aligned (ONLY dates can be right-aligned)
    - NO two-column layouts or sidebars
    - NO nested bullet points - all bullets at same indentation level
    - Standard margins: 0.5-0.75 inches all sides
    - Maximum 2 pages (1 page preferred for <10 years experience)

TYPOGRAPHY:
    - Font family: Helvetica, Helvetica Neue, or Arial
    - Name: 28-32pt, bold, centered or left-aligned
    - Section headers: 13-15pt, bold, uppercase
    - Job titles: 11-13pt, bold
    - Body text/bullets: 10-11pt, regular
    - Dates: 9-10pt, regular, right-aligned only
    - Contact info: 9-10pt, regular

COLOR SCHEME:
    - Primary text: #1e293b or #334155 (dark slate/gray)
    - Accent color: #2563eb (professional blue) for section bars, bullets, company names
    - Secondary text: #64748b (medium gray) for dates
    - Divider lines: #cbd5e1 or #e2e8f0 (light gray)
    - Links: #2563eb, no underlines

SECTION FORMATTING:
    - Bold section titles: PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS, CERTIFICATIONS
    - Left accent bar (4px width, #2563eb) before each section header
    - Top accent bar (4px height, full width, #2563eb) at very top of page
    - Consistent spacing between sections (0.6-1.0 inches)

HEADER SECTION:
    - Name: Large, bold, centered
    - Professional title: Medium size, centered, blue accent color (optional)
    - Contact: Email | Phone | Location (separated by |)
    - Links: LinkedIn | Portfolio | GitHub (blue color, no underlines, separated by |)
    - Divider line below header (1px, light gray)

EXPERIENCE ENTRIES:
    - Job Title | Company Name, Location [Date Range right-aligned]
    - Company name in blue accent color
    - 4-6 bullet points per position (flat structure, NO nesting)
    - Bullets: Small circles (•), 2-4px, blue accent color
    - Start each bullet with action verb
    - Include quantifiable metrics

EDUCATION ENTRIES:
    - Degree in Field | Institution, Location [Graduation Year right-aligned]
    - Institution name in blue accent color
    - GPA line optional (only if 3.5+)
    - One line per degree

SKILLS SECTION:
    - Categories: Technical:, Soft Skills:, Languages:
    - Category labels bold, followed by comma-separated list
    - NO bullet points in skills section
    - NO skill bars or visual ratings

BULLET POINTS (CRITICAL):
    - Simple circular bullets (•) only
    - ALL bullets at SAME indentation level
    - NO nested or sub-bullets
    - NO hierarchical structure
    - Consistent 12-18px left indent
    - 0.15-0.25 inches spacing between bullets

PROHIBITED ELEMENTS:
    - NO nested bullets or sub-bullets
    - NO right-aligned content except dates
    - NO tables for layout
    - NO text boxes or containers
    - NO photos or graphics
    - NO decorative fonts
    - NO underlined text (except hover on links)
    - NO colored backgrounds
    - NO headers/footers with critical info

OUTPUT FORMAT:
    - Inline <style> CSS in <head>
    - Valid HTML5 structure starting with <!DOCTYPE html>
    - No explanations or markdown
    - Clean, semantic HTML
    - Print-ready and ATS-compatible
    - Functional hyperlinks

CONTENT RULES:
    - Start bullets with strong action verbs
    - Use past tense for previous roles, present for current
    - Include quantifiable achievements (numbers, percentages, metrics)
    - NO first-person pronouns (I, me, my)
    - Professional tone throughout
    - NO spelling or grammar errors

SPACING:
    - Line height: 1.5-1.7 for body text
    - Section spacing: 20-30px between sections
    - Bullet spacing: 8-15px between bullets
    - Adequate white space for readability

FOOTER:
    - Small, centered text: "Generated by ResuMind"
    - Light gray color (#94a3b8)
    - 8-9pt font size

ATS COMPATIBILITY:
    - Simple, clean structure
    - Standard section headers
    - No images or graphics
    - Searchable text
    - Logical content hierarchy
    `;

    // ---------- CALL OPENAI ----------
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert resume architect." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    let html = completion.choices[0].message.content?.trim() || "";
    html = html.replace(/^```(html)?/gi, "").replace(/```$/g, "").trim();

    // ---------- VALIDATE OUTPUT ----------
    if (!html.startsWith("<!DOCTYPE html")) {
      console.warn("⚠️ Invalid HTML from AI, reformatting...");
      const fixPrompt = `
The following content is not valid HTML. Convert it into a **fully valid resume HTML document**
that follows modern professional design using inline CSS and improved information from the data and the linkedin link together with the portfolio link.

Content to fix:
${html}
      `;
      const retry = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an HTML resume formatter." },
          { role: "user", content: fixPrompt },
        ],
        temperature: 0.4,
        max_tokens: 3500,
      });
      html = retry.choices[0].message.content
        .replace(/^```(html)?/gi, "")
        .replace(/```$/g, "")
        .trim();
    }

    // ---------- FINAL CHECK ----------
    if (!html.startsWith("<!DOCTYPE html")) {
      console.error("❌ AI still failed to return valid HTML.");
      res.status(502).json({ error: "AI did not return valid HTML" });
      return;
    }

    console.log("✅ Valid HTML received. Rendering PDF...");

    // ---------- PUPPETEER ----------
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length < 5000) {
      console.error("⚠️ Empty or invalid PDF generated.");
      res.status(500).json({ error: "Generated PDF invalid" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Transfer-Encoding", "binary");
    res.end(pdfBuffer, "binary");

    console.log("🎉 AI resume PDF ready.");

  } catch (error) {
    console.error("❌ Error rendering resume:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate AI-designed resume",
        message: error.message,
      });
    }
  }
}

module.exports = { renderResumeHTMLToPDF }; 
