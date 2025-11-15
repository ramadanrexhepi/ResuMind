// utils/renderOptimizedResumeHTMLToPDF.js
const puppeteer = require("puppeteer");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function renderOptimizedResumeHTMLToPDF(res, formData, filename = "AI_Resume.pdf") {
  try {
    console.log("🎨 Generating AI resume from LinkedIn profile...");
    console.log("📦 Received formData keys:", Object.keys(formData));

    // ✅ Extract LinkedIn URL (PRIMARY DATA SOURCE)
    const linkedinUrl =
      formData.linkedinUrl ||
      formData.linkedin ||
      formData.url ||
      (formData.data && formData.data.linkedinUrl) ||
      (formData.analysis && formData.analysis.linkedinUrl) ||
      "";

    // ✅ Extract optional supplementary data
    const portfolioUrl =
      formData.portfolioUrl ||
      formData.portfolio ||
      (formData.data && formData.data.portfolioUrl) ||
      (formData.analysis && formData.analysis.portfolioUrl) ||
      "";
    
    const linkedinText = formData.linkedinText || "";
    
    // ✅ Optional pre-filled data (AI will extract if not provided)
    const providedFullName = formData.fullName || (formData.analysis && formData.analysis.fullName) || "";
    const providedEmail = formData.email || (formData.analysis && formData.analysis.email) || "";
    const providedPhone = formData.phone || (formData.analysis && formData.analysis.phone) || "";
    const providedLocation = formData.location || (formData.analysis && formData.analysis.location) || "";

    console.log("═══════════════════════════════════════════════════════");
    console.log("📋 Data Sources for AI:");
    console.log("   🔗 LinkedIn URL (PRIMARY):", linkedinUrl || "❌ NOT PROVIDED");
    console.log("   🌐 Portfolio URL:", portfolioUrl || "Not provided");
    console.log("   📝 LinkedIn Text Data:", linkedinText ? "✅ Provided" : "Not provided");
    console.log("   📊 Analysis Data:", formData.analysis ? "✅ Provided" : "Not provided");
    console.log("");
    console.log("📋 Optional Pre-filled Data (AI will extract if missing):");
    console.log("   👤 Name:", providedFullName || "AI will extract from LinkedIn");
    console.log("   📧 Email:", providedEmail || "AI will extract from LinkedIn");
    console.log("   📞 Phone:", providedPhone || "AI will extract from LinkedIn");
    console.log("   📍 Location:", providedLocation || "AI will extract from LinkedIn");
    console.log("═══════════════════════════════════════════════════════");

    // ✅ Validate we have either LinkedIn URL OR analysis data
    if (!linkedinUrl && !formData.analysis) {
      console.error("❌ No LinkedIn URL or analysis data provided!");
      throw new Error("Either LinkedIn URL or analysis data is required to generate resume");
    }
    
    if (linkedinUrl) {
      console.log("✅ LinkedIn URL provided. AI will extract profile data...");
    } else {
      console.log("✅ Analysis data provided. AI will use extracted data...");
    }

    // ---------- ENHANCED PROMPT ----------
    const prompt = `
═══════════════════════════════════════════════════════════════════════════════
                    PROFESSIONAL RESUME GENERATION
                    AI-Powered Resume Optimization
═══════════════════════════════════════════════════════════════════════════════

ROLE & EXPERTISE:
You are an elite resume writer with 15+ years of experience creating interview-generating resumes for Fortune 500 companies, FAANG organizations, and top-tier consulting firms. You transform resume data into exceptional, professionally-formatted HTML documents. Your resumes have a 95% interview callback rate.

═══════════════════════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════════════════════

Generate a world-class, professionally-formatted HTML resume from the data provided below.

${linkedinUrl ? `
📌 DATA SOURCE: LinkedIn Profile
LinkedIn URL: ${linkedinUrl}
${portfolioUrl ? `Portfolio: ${portfolioUrl}` : ''}
` : ''}

${formData.analysis ? `
📌 DATA SOURCE: Uploaded Resume Analysis
The candidate uploaded their resume and it has been analyzed. Use this data:
${JSON.stringify(formData.analysis, null, 2)}
` : ''}

${linkedinText ? `
📝 Additional Text Data:
${linkedinText}
` : ''}

CANDIDATE INFORMATION:
- Name: ${providedFullName || 'Extract from data'}
- Email: ${providedEmail || 'Extract from data'}  
- Phone: ${providedPhone || 'Extract from data'}
- Location: ${providedLocation || 'Extract from data'}

═══════════════════════════════════════════════════════════════════════════════
STEP 1: EXTRACT & TRANSFORM DATA
═══════════════════════════════════════════════════════════════════════════════

${linkedinUrl ? `
Access the LinkedIn profile and extract ALL information, then transform it.
` : `
Use the analysis data provided above. This contains:
- Contact information (name, email, phone, location)
- Work experience with descriptions
- Education details
- Skills
- Any other relevant information

Extract all this data and transform it into professional resume language.
`}

TRANSFORMATION RULES:
1. Convert casual language to professional resume language
2. Start every bullet with a powerful action verb
3. Add quantifiable metrics (numbers, percentages, dollar amounts)
4. Use Challenge-Action-Result (CAR) framework
5. Create 4-6 bullets per job (most recent gets 6, older gets 4)

EXAMPLES:
❌ "Helped team improve processes"
✅ "Led process optimization initiative reducing deployment time by 40%"

❌ "Worked on mobile app"
✅ "Architected iOS application serving 500K+ users with 4.8-star rating"

═══════════════════════════════════════════════════════════════════════════════
STEP 2: GENERATE PROFESSIONAL HTML RESUME
═══════════════════════════════════════════════════════════════════════════════

⚠️ CRITICAL: Output ONLY valid HTML starting with <!DOCTYPE html>

LAYOUT:
✓ Single-page, white background
✓ ALL content LEFT-ALIGNED (only dates right-aligned)
✓ NO nested bullets - ALL bullets at SAME level
✓ Professional margins: 40-50px

TYPOGRAPHY:
✓ Font: Helvetica, Arial, sans-serif
✓ Name: 30px, bold, centered
✓ Section headers: 14px, bold, uppercase
✓ Job titles: 13px, bold
✓ Body: 10-11px

COLORS (EXACT):
✓ #2563eb - Blue accent (top bar, bullets, company names, links)
✓ #1e293b - Dark text (name, headers, titles)
✓ #64748b - Gray text (dates)
✓ #cbd5e1 - Light gray (dividers)

STRUCTURE:
✓ 4px blue bar at top (full width)
✓ Header: Name | Title | Contact | Links
✓ Sections with 4px blue left bar
✓ Experience: Job Title | Company, Location [Date]
✓ 4-6 flat bullets per role
✓ Education: Degree in Field | Institution [Year]
✓ Skills: Category: comma-separated

CRITICAL RULES:
✗ NO nested bullets under any circumstances
✗ NO placeholder text like [Your Name]
✗ NO tables for layout
✗ NO first-person pronouns (I, me, my)
✗ ALL bullets start with action verbs
✗ 60%+ bullets must have metrics

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════════════════════

Return ONLY complete HTML. No explanations. No markdown. No code blocks.

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${providedFullName || 'Professional'} - Resume</title>
  <style>
    /* All inline CSS here */
  </style>
</head>
<body>
  <!-- Complete professional resume -->
</body>
</html>

═══════════════════════════════════════════════════════════════════════════════
QUALITY CHECKLIST:
═══════════════════════════════════════════════════════════════════════════════

Before outputting, verify:
□ Valid HTML starting with <!DOCTYPE html>
□ All CSS inline in <style> tag
□ Real data extracted (no placeholders)
□ All content left-aligned except dates
□ NO nested bullets anywhere
□ All bullets at same level
□ Top blue bar present
□ Section headers have blue left bar
□ Colors match (#2563eb, #1e293b, #64748b)
□ Every bullet starts with action verb
□ 60%+ bullets have metrics
□ Professional language throughout

═══════════════════════════════════════════════════════════════════════════════
BEGIN RESUME GENERATION NOW
═══════════════════════════════════════════════════════════════════════════════

${linkedinUrl ? `Extract data from: ${linkedinUrl}` : 'Use the analysis data provided above'}

Output ONLY the HTML code. Nothing else.
`;

    console.log("🤖 Calling OpenAI API...");

    // ---------- CALL OPENAI ----------
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an elite resume writer and HTML expert. 

CRITICAL OUTPUT REQUIREMENTS:
- You MUST output complete, valid HTML starting with <!DOCTYPE html>
- You MUST include ALL CSS inline in <style> tags within <head>
- You NEVER use nested bullets - all bullets at same indentation level
- You ALWAYS left-align content (only dates can be right-aligned)
- You NEVER use markdown, code blocks, or backticks in your output
- You ALWAYS extract real data from LinkedIn - NEVER use placeholders
- Your output is ONLY the HTML document, nothing else

Your HTML will be converted to PDF, so formatting must be perfect.`
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 4096,
    });

    let html = completion.choices[0].message.content?.trim() || "";
    console.log("📄 Received response from OpenAI (length:", html.length, "chars)");
    
    // ✅ Clean up the HTML
    html = html
      .replace(/^```html\s*/gi, "")
      .replace(/^```\s*/gi, "")
      .replace(/```\s*$/g, "")
      .trim();

    // ---------- VALIDATE OUTPUT ----------
    if (!html.toLowerCase().startsWith("<!doctype html")) {
      console.warn("⚠️ Invalid HTML from AI, attempting to fix...");
      
      const fixPrompt = `
The following content is not valid HTML. Convert it into a COMPLETE, VALID HTML document for a professional resume.

CRITICAL REQUIREMENTS:
1. Start with <!DOCTYPE html>
2. Include ALL CSS inline in <style> tag in <head>
3. Use colors: #2563eb (accent blue), #1e293b (dark text), #64748b (gray text)
4. ALL bullets at SAME indentation level (NO nesting)
5. Left-align all content except dates (right-aligned)
6. Professional, modern design with blue accent bar at top

Content to convert:
${html}

Return ONLY the complete HTML document, nothing else.
`;

      const retry = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an HTML expert. You ONLY output valid HTML." },
          { role: "user", content: fixPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      });
      
      html = retry.choices[0].message.content
        .replace(/^```(html)?/gi, "")
        .replace(/```$/g, "")
        .trim();
      
      console.log("🔧 Received fixed HTML (length:", html.length, "chars)");
    }

    // ---------- FINAL VALIDATION ----------
    if (!html.toLowerCase().startsWith("<!doctype html")) {
      console.error("❌ Still invalid HTML after retry");
      console.log("First 200 chars:", html.substring(0, 200));
      
      // Last resort: wrap in template
      const displayName = providedFullName || "Professional Resume";
      html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      color: #1e293b;
      padding: 40px;
      line-height: 1.6;
      background: white;
    }
    .accent-bar {
      height: 4px;
      background: #2563eb;
      width: 100%;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 30px;
      color: #1e293b;
      text-align: center;
      margin-bottom: 10px;
    }
    .contact {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      margin-bottom: 20px;
    }
    h2 {
      color: #2563eb;
      font-size: 14px;
      text-transform: uppercase;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
      margin: 20px 0 10px 0;
    }
    p, li { font-size: 10px; color: #334155; line-height: 1.6; }
    ul { list-style: none; padding-left: 15px; }
    li::before {
      content: "•";
      color: #2563eb;
      font-weight: bold;
      display: inline-block;
      width: 15px;
      margin-left: -15px;
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <h1>${displayName}</h1>
  <div class="contact">
    ${providedEmail ? `${providedEmail}` : ''}${providedEmail && (providedPhone || providedLocation) ? ' | ' : ''}${providedPhone ? `${providedPhone}` : ''}${providedPhone && providedLocation ? ' | ' : ''}${providedLocation || ''}
    ${linkedinUrl ? `<br><a href="${linkedinUrl}" style="color: #2563eb; text-decoration: none;">LinkedIn Profile</a>` : ''}
  </div>
  <h2>Professional Summary</h2>
  <p>Experienced professional with expertise in multiple domains. Proven track record of delivering results and driving success.</p>
  ${html.replace(/<\/?[^>]+(>|$)/g, "").replace(/\n/g, "<br/>")}
</body>
</html>`;
    }

    console.log("✅ Valid HTML confirmed. Rendering PDF with Puppeteer...");

    // ---------- PUPPETEER PDF GENERATION ----------
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
    });
    
    const page = await browser.newPage();
    
    // Set viewport for better rendering
    await page.setViewport({ width: 1200, height: 1600 });
    
    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { 
        top: "10mm", 
        bottom: "10mm", 
        left: "10mm", 
        right: "10mm" 
      },
      preferCSSPageSize: false,
    });

    await browser.close();

    // ---------- VALIDATE PDF ----------
    if (!pdfBuffer || pdfBuffer.length < 5000) {
      console.error("⚠️ Generated PDF seems too small:", pdfBuffer?.length, "bytes");
      throw new Error("Generated PDF is invalid or too small");
    }

    console.log("✅ PDF generated successfully:", pdfBuffer.length, "bytes");

    // ---------- SEND RESPONSE ----------
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Transfer-Encoding", "binary");
    res.end(pdfBuffer, "binary");

    console.log("🎉 AI resume PDF sent successfully!");

  } catch (error) {
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ Error in renderOptimizedResumeHTMLToPDF:");
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    console.error("═══════════════════════════════════════════════════════");
    
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate AI-designed resume",
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = { renderOptimizedResumeHTMLToPDF };