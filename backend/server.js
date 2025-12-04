// ============================================
// IMPORTS AND DEPENDENCIES
// ============================================
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const mongoose = require('mongoose');

require('dotenv').config();

// ============================================
// DATABASE CONNECTION AND MODELS
// ============================================
const connectDB = require('./config/database');
const User = require('./models/User');
const Analysis = require('./models/Analysis');

const PLAN_FEATURES = Object.freeze({
  free: {
    maxUploads: 2,
    maxGenerations: 2,
    hasTemplates: false,
    hasAdvancedAI: false,
    hasPrioritySupport: false
  },
  pro: {
    maxUploads: 999999,
    maxGenerations: 999999,
    hasTemplates: true,
    hasAdvancedAI: true,
    hasPrioritySupport: true
  },
  team: {
    maxUploads: 999999,
    maxGenerations: 999999,
    hasTemplates: true,
    hasAdvancedAI: true,
    hasPrioritySupport: true
  }
});

const DEFAULT_USAGE_STATE = Object.freeze({
  uploadsCount: 0,
  generationsCount: 0,
  lastUpload: null
});

const LIMIT_ERROR_LABELS = {
  analysis: 'Free plan analysis limit reached',
  generation: 'Free plan optimization limit reached'
};

const LIMIT_MESSAGE_FALLBACK = {
  analysis: PLAN_FEATURES.free.maxUploads,
  generation: PLAN_FEATURES.free.maxGenerations
};

const LIMIT_FIELD_CONFIG = {
  analysis: { usageKey: 'uploadsCount', limitKey: 'maxUploads' },
  generation: { usageKey: 'generationsCount', limitKey: 'maxGenerations' }
};

const normalizeUserId = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
  return trimmed;
};

const clonePlanFeatures = (planType = 'free') => {
  const source = PLAN_FEATURES[planType] || PLAN_FEATURES.free;
  return { ...source };
};

const ensureUserPlanAndUsage = (user) => {
  if (!user.plan || !user.plan.type) {
    user.plan = {
      type: 'free',
      status: 'active',
      startDate: user.createdAt || new Date(),
      endDate: null,
      paymentId: null,
      features: clonePlanFeatures('free')
    };
  } else if (!user.plan.features) {
    user.plan.features = clonePlanFeatures(user.plan.type);
  }

  if (!user.usage) {
    user.usage = { ...DEFAULT_USAGE_STATE };
  } else {
    user.usage.uploadsCount = user.usage.uploadsCount || 0;
    user.usage.generationsCount = user.usage.generationsCount || 0;
    user.usage.lastUpload = user.usage.lastUpload || null;
  }
};

const findUserForUsage = async (userId) => {
  const normalized = normalizeUserId(userId);
  if (!normalized) return null;
  const user = await User.findById(normalized);
  if (!user) return null;
  ensureUserPlanAndUsage(user);
  return user;
};

const getLimitMessage = (type, limit) => {
  const resolvedLimit = typeof limit === 'number' ? limit : LIMIT_MESSAGE_FALLBACK[type] || 0;
  if (type === 'generation') {
    return `The free plan includes ${resolvedLimit} optimized resumes. Upgrade to Pro for unlimited downloads.`;
  }
  return `The free plan includes ${resolvedLimit} analyses. Upgrade to Pro for unlimited scans.`;
};

const checkFreeUsageLimit = (user, type) => {
  const config = LIMIT_FIELD_CONFIG[type] || LIMIT_FIELD_CONFIG.analysis;
  const limit = user.plan?.features?.[config.limitKey];
  const used = user.usage?.[config.usageKey] || 0;
  const reached = user.plan?.type === 'free' && typeof limit === 'number' && used >= limit;
  return { reached, limit, used, ...config };
};

const requireUserForAction = async (req, type) => {
  const userId = req.body?.userId || req.query?.userId || req.headers['x-user-id'];
  const user = await findUserForUsage(userId);
  if (!user) {
    return { error: { status: 401, payload: { error: 'Authentication required', message: 'Please log in to continue.' } } };
  }

  const usageCheck = checkFreeUsageLimit(user, type);
  if (usageCheck.reached) {
    return {
      error: {
        status: 403,
        payload: {
          error: LIMIT_ERROR_LABELS[type] || 'Free plan limit reached',
          message: getLimitMessage(type, usageCheck.limit)
        }
      },
      user
    };
  }

  return { user };
};

const incrementUserUsage = async (user, type) => {
  if (!user) return;
  const config = LIMIT_FIELD_CONFIG[type] || LIMIT_FIELD_CONFIG.analysis;
  user.usage[config.usageKey] = (user.usage[config.usageKey] || 0) + 1;
  if (config.usageKey === 'uploadsCount') {
    user.usage.lastUpload = new Date();
  }
  try {
    await user.save();
  } catch (err) {
    console.error('Failed to update user usage counters:', err.message);
  }
};

const cleanupUploadedFile = (file) => {
  if (file?.path) {
    return fs.unlink(file.path).catch(() => {});
  }
  return Promise.resolve();
};

// Connect to MongoDB
connectDB();

// MongoDB connection status logging
try {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  console.log(`MongoDB initial status: ${states[mongoose.connection.readyState] || 'unknown'}`);
  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err.message));
  mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
} catch (_) {}

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================
const app = express();
const PORT = process.env.PORT || 5050;

// ============================================
// OPENAI INITIALIZATION
// ============================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://resu-mind-git-main-ramadanrexhepis-projects.vercel.app',
  'https://resu-mind.vercel.app',
  'https://resumind.ramadanrexhepi.dev', // Custom domain frontend
  process.env.FRONTEND_URL // Allow environment variable override
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // In production, be more permissive with Vercel preview deployments
    if (origin.includes('vercel.app')) {
      return cb(null, true);
    }

    console.warn('⚠️ Blocked by CORS:', origin);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fsSync.existsSync(uploadsDir)) {
    fsSync.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.error('Failed to ensure uploads directory:', uploadsDir, e);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File is too large. Maximum size is 10MB.' 
      });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// ============================================
// STARTUP DIAGNOSTICS
// ============================================
const openAIConfigured = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here');
console.log('Running backend from:', __filename);
console.log(`OpenAI configured: ${openAIConfigured ? 'Yes' : 'No (using mock data)'}`);
console.log(`Uploads directory ready: ${uploadsDir}`);

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateMockOptimizedResume(originalText, fileName) {
  const name = fileName.replace(/\.(pdf|docx)$/i, '').replace(/_/g, ' ').replace(/-/g, ' ');
  
  return `${name.toUpperCase()}
john.doe@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience developing scalable web applications. Proven track record of leading cross-functional teams and delivering high-impact projects that increased user engagement by 40%. Expert in modern JavaScript frameworks and cloud technologies.

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Company Inc.
January 2022 - Present
- Led development of microservices architecture serving 2M+ users, improving system performance by 45%
- Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes
- Mentored team of 5 junior developers, improving code quality and reducing bugs by 30%
- Collaborated with product team to deliver 12+ features, increasing user retention by 25%

Software Engineer | StartUp Solutions
June 2019 - December 2021
- Developed RESTful APIs handling 100K+ daily requests with 99.9% uptime
- Reduced page load time by 60% through optimization and lazy loading implementation
- Built responsive React components used across 50+ pages
- Participated in Agile sprints, consistently delivering features ahead of schedule

Junior Software Engineer | Digital Agency
May 2017 - May 2019
- Contributed to 15+ client projects using React, Node.js, and MongoDB
- Improved website accessibility scores by 35% through WCAG compliance implementation
- Automated testing processes, reducing QA time by 40%

EDUCATION

Bachelor of Science in Computer Science
University of Technology | 2017
GPA: 3.8/4.0

TECHNICAL SKILLS

Languages: JavaScript, Python, TypeScript, Java, SQL
Frameworks: React, Node.js, Express, Django, Next.js
Tools: Git, Docker, AWS, MongoDB, PostgreSQL, Redis
Methodologies: Agile, Scrum, Test-Driven Development (TDD)

CERTIFICATIONS
- AWS Certified Solutions Architect
- MongoDB Certified Developer

---
✓ Optimized for ATS systems
✓ Strong action verbs
✓ Quantifiable achievements
✓ Relevant keywords
✓ Professional formatting`;
}

function calculateResumeScore(resumeText) {
  let score = 70;
  
  if (/\d+%|\$\d+|\d+\+/.test(resumeText)) score += 10;
  
  const actionVerbs = ['Led', 'Developed', 'Implemented', 'Achieved', 'Improved', 'Managed'];
  const hasActionVerbs = actionVerbs.some(verb => resumeText.includes(verb));
  if (hasActionVerbs) score += 5;
  
  if (resumeText.includes('EXPERIENCE') || resumeText.includes('WORK')) score += 5;
  if (resumeText.includes('EDUCATION')) score += 5;
  if (resumeText.includes('SKILLS')) score += 5;
  
  const atsCompatibility = score >= 90 ? 'High' : score >= 75 ? 'Medium' : 'Low';
  
  return { score: Math.min(score, 100), atsCompatibility };
}

function buildResumePrompt(data) {
  return `Create a professional and well designed, ATS-optimized resume for the following candidate based on their information:

PERSONAL INFORMATION:
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
LinkedIn: ${data.linkedinUrl || 'N/A'}
Portfolio: ${data.portfolioUrl || 'N/A'}

PROFESSIONAL SUMMARY:
Current Title: ${data.jobTitle}
Years of Experience: ${data.yearsExperience}
Target Role: ${data.targetRole}
Key Skills: ${data.keySkills}

WORK EXPERIENCE:
${data.experiences.map((exp, i) => `
Experience ${i + 1}:
Company: ${exp.company}
Position: ${exp.position}
Duration: ${exp.startDate} to ${exp.currentlyWorking ? 'Present' : exp.endDate}
Responsibilities:
${exp.responsibilities}
Achievements:
${exp.achievements}
`).join('\n')}

EDUCATION:
${data.education.map((edu, i) => `
Education ${i + 1}:
Institution: ${edu.institution}
Degree: ${edu.degree} in ${edu.field}
Graduation Year: ${edu.graduationYear}
GPA: ${edu.gpa || 'N/A'}
`).join('\n')}

SKILLS:
Technical Skills: ${data.technicalSkills}
Soft Skills: ${data.softSkills || 'N/A'}
Languages: ${data.languages || 'N/A'}
Certifications: ${data.certifications || 'N/A'}

ADDITIONAL:
Projects: ${data.projects || 'N/A'}
Awards: ${data.awards || 'N/A'}
Interests: ${data.interests || 'N/A'}

Please create a professional resume with:
1. A compelling professional summary (3-4 sentences)
2. Well-formatted work experience with strong action verbs
3. Quantified achievements where possible
4. Clear skills section organized by category
5. Professional formatting suitable for ATS systems
6. Proper spacing and section headers

Format the resume in plain text with clear sections and bullet points.`;
}

function generateBasicResume(data) {
  return `
${data.fullName.toUpperCase()}
${data.email} | ${data.phone} | ${data.location}
${data.linkedinUrl ? `LinkedIn: ${data.linkedinUrl}` : ''}
${data.portfolioUrl ? `Portfolio: ${data.portfolioUrl}` : ''}

${'='.repeat(80)}

PROFESSIONAL SUMMARY
${'-'.repeat(80)}
${data.jobTitle} with ${data.yearsExperience} of experience in ${data.targetRole}.
Key expertise: ${data.keySkills}

WORK EXPERIENCE
${'-'.repeat(80)}
${data.experiences.map(exp => `
${exp.position} | ${exp.company}
${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate}

Responsibilities:
${exp.responsibilities}

${exp.achievements ? `Achievements:\n${exp.achievements}` : ''}
`).join('\n')}

EDUCATION
${'-'.repeat(80)}
${data.education.map(edu => `
${edu.degree} in ${edu.field}
${edu.institution} | Graduated: ${edu.graduationYear}
${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\n')}

SKILLS
${'-'.repeat(80)}
Technical Skills: ${data.technicalSkills}
${data.softSkills ? `Soft Skills: ${data.softSkills}` : ''}
${data.languages ? `Languages: ${data.languages}` : ''}

${data.certifications ? `CERTIFICATIONS\n${'-'.repeat(80)}\n${data.certifications}\n` : ''}
${data.projects ? `PROJECTS\n${'-'.repeat(80)}\n${data.projects}\n` : ''}
${data.awards ? `AWARDS & ACHIEVEMENTS\n${'-'.repeat(80)}\n${data.awards}\n` : ''}
${data.interests ? `INTERESTS\n${'-'.repeat(80)}\n${data.interests}` : ''}

${'='.repeat(80)}
Generated by ResuMind - ${new Date().toLocaleDateString()}
`;
}

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    let needsMigration = false;
    if (!user.plan || !user.plan.type) {
      console.log('🔄 Migrating user plan fields for:', email);
      user.plan = {
        type: 'free',
        status: 'active',
        startDate: user.createdAt || new Date(),
        endDate: null,
        paymentId: null,
        features: clonePlanFeatures('free')
      };
      needsMigration = true;
    }

    if (!user.usage) {
      console.log('🔄 Migrating user usage fields for:', email);
      user.usage = {
        uploadsCount: 0,
        generationsCount: 0,
        lastUpload: null
      };
      needsMigration = true;
    }

    user.lastLogin = new Date();

    if (needsMigration) {
      await user.save();
      console.log('✅ User migrated successfully');
    } else {
      await user.save();
    }

    console.log('✅ User logged in:', email);
    console.log('📦 User plan:', user.plan.type, '- Status:', user.plan.status);
    console.log('📊 Usage - Uploads:', user.usage.uploadsCount, 'Generations:', user.usage.generationsCount);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: {
          type: user.plan.type,
          status: user.plan.status,
          startDate: user.plan.startDate,
          endDate: user.plan.endDate,
          paymentId: user.plan.paymentId,
          features: user.plan.features
        },
        usage: {
          uploadsCount: user.usage.uploadsCount,
          generationsCount: user.usage.generationsCount,
          lastUpload: user.usage.lastUpload
        }
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed',
      message: error.message 
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();
    console.log('✅ New user saved to database:', email);
    console.log('📦 User plan:', newUser.plan.type, '- Status:', newUser.plan.status);

    res.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        plan: {
          type: newUser.plan.type,
          status: newUser.plan.status,
          startDate: newUser.plan.startDate,
          features: newUser.plan.features
        },
        usage: {
          uploadsCount: newUser.usage.uploadsCount,
          generationsCount: newUser.usage.generationsCount
        }
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Signup failed',
      message: error.message 
    });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, email, currentPassword, newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
    }
    const query = userId ? { _id: userId } : email ? { email } : null;
    if (!query) {
      return res.status(400).json({ success: false, error: 'userId or email is required' });
    }
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (!currentPassword || user.password !== currentPassword) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// ============================================
// ANALYSIS ROUTES
// ============================================

/*app.post('/api/analyze/file-robust', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('🔥 /api/analyze/file-robust hit');
    console.log('File received:', req.file?.originalname);
    console.log('Path:', req.file?.path);
    console.log('MIME:', req.file?.mimetype);

    const access = await requireUserForAction(req, 'analysis');
    if (access.error) {
      await cleanupUploadedFile(req.file);
      return res.status(access.error.status).json(access.error.payload);
    }
    const actingUser = access.user;

    const legacyAccess = await requireUserForAction(req, 'analysis');
    if (legacyAccess.error) {
      await cleanupUploadedFile(req.file);
      return res.status(legacyAccess.error.status).json(legacyAccess.error.payload);
    }
    const legacyUser = legacyAccess.user;

    let resumeText = '';
    try {
      const ext = (path.extname(req.file.originalname) || '').toLowerCase();

      if (req.file.mimetype === 'application/pdf' || ext === '.pdf') {
        const dataBuffer = fsSync.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        resumeText = pdfData.text || '';
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        req.file.mimetype === 'application/octet-stream' ||
        ext === '.docx'
      ) {
        const result = await mammoth.extractRawText({ path: req.file.path });
        resumeText = result.value || '';
      } else {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX.' });
      }
    } catch (e) {
      console.error('❌ Extraction error:', e);
      await fs.unlink(req.file.path);
      return res.status(500).json({ error: 'Failed to read file content' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      const { renderPlainTextPDF } = require('./utils/renderResumeHTMLToPDF');
      const mockText = `
Mock Resume Analysis
--------------------
File: ${req.file.originalname}
Score: 75
ATS Compatibility: Medium

Strengths:
- Clear sections
- Relevant experience

Improvements:
- Add quantified achievements
- Tighten summary
`;
      const safeName = req.file.originalname.replace(/[^a-z0-9_\-\.]+/gi, '_');
      renderPlainTextPDF(res, 'Mock Resume Analysis', mockText, `mock_${safeName}.pdf`);
      return;
    }

    console.log('🤖 Sending to OpenAI...');

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.error('❌ OpenAI request timed out');
    }, 20000);

    try {
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume analyzer. Return ONLY JSON with keys: score, overallRating, strengths[], improvements[], atsCompatibility, atsScore, suggestedKeywords[].'
            },
            {
              role: 'user',
              content: `Analyze the following resume text and return the requested JSON.\n\nRESUME TEXT:\n${(resumeText || '').slice(0, 12000)}`
            }
          ],
          temperature: 0.6,
          max_tokens: 1200
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('OpenAI request timed out')), 20000)
        )
      ]);

      clearTimeout(timeout);

      let aiResponse = completion.choices[0].message.content.trim();
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(aiResponse);
      } catch (e) {
        const m = aiResponse.match(/\{[\s\S]*\}/);
        aiAnalysis = m ? JSON.parse(m[0]) : null;
      }

      if (!aiAnalysis) {
        return res.status(502).json({ error: 'AI response could not be parsed' });
      }

      console.log('✅ AI analysis complete.');

      const { renderPlainTextPDF } = require('./utils/renderResumeHTMLToPDF');
      const safeName = req.file.originalname.replace(/[^a-z0-9_\-\.]+/gi, '_');
      const text = `
Optimized Resume Report
========================
File: ${safeName}
Score: ${aiAnalysis.score || 'N/A'}/100
Overall Rating: ${aiAnalysis.overallRating || 'N/A'}
ATS Compatibility: ${aiAnalysis.atsCompatibility || 'N/A'}
ATS Score: ${aiAnalysis.atsScore || 'N/A'}

Strengths:
${(aiAnalysis.strengths || []).map(s => `• ${s}`).join('\n')}

Improvements:
${(aiAnalysis.improvements || []).map(s => `• ${s}`).join('\n')}

Suggested Keywords:
${(aiAnalysis.suggestedKeywords || []).join(', ') || 'None'}

---
Generated by ResuMind
`;

      renderPlainTextPDF(res, 'Optimized Resume Report', text, `analysis_${safeName}.pdf`);
    } catch (error) {
      clearTimeout(timeout);
      console.error('❌ OpenAI or parsing error:', error.message);
      if (error.name === 'AbortError') {
        return res.status(504).json({ error: 'OpenAI request timed out' });
      }
      return res.status(500).json({ error: 'Failed to analyze with OpenAI', message: error.message });
    } finally {
      if (req.file) {
        fs.unlink(req.file.path).catch(() => {});
      }
    }
  } catch (outerError) {
    console.error('❌ Analyze file error:', outerError);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Unexpected server error', message: outerError.message });
    }
  }
}); */


app.post('/api/analyze/file-robust', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('🔥 /api/analyze/file-robust hit');
    console.log('File received:', req.file?.originalname);
    console.log('Path:', req.file?.path);
    console.log('MIME:', req.file?.mimetype);

    let resumeText = '';
    try {
      const ext = (path.extname(req.file.originalname) || '').toLowerCase();

      if (req.file.mimetype === 'application/pdf' || ext === '.pdf') {
        const dataBuffer = fsSync.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        resumeText = pdfData.text || '';
        console.log('✅ PDF text extracted:', resumeText.length, 'characters');
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        req.file.mimetype === 'application/octet-stream' ||
        ext === '.docx'
      ) {
        const result = await mammoth.extractRawText({ path: req.file.path });
        resumeText = result.value || '';
        console.log('✅ DOCX text extracted:', resumeText.length, 'characters');
      } else {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX.' });
      }
    } catch (e) {
      console.error('❌ Extraction error:', e);
      await fs.unlink(req.file.path);
      return res.status(500).json({ error: 'Failed to read file content' });
    }

    // Check if we got any text
    if (!resumeText || resumeText.trim().length < 50) {
      console.warn('⚠️ Very little or no text extracted from file');
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        error: 'Could not extract sufficient text from file',
        message: 'The file appears to be empty or unreadable. Please ensure it contains text content.'
      });
    }

    console.log('📝 Resume text preview:', resumeText.substring(0, 200), '...');

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.warn('⚠️ No OpenAI API key - returning mock analysis');
      const mockAnalysis = {
        score: 75,
        overallRating: 'Good',
        atsCompatibility: 'Medium',
        atsScore: 70,
        strengths: [
          'Clear section organization',
          'Relevant work experience listed',
          'Professional formatting'
        ],
        improvements: [
          'Add quantified achievements with metrics',
          'Strengthen professional summary',
          'Include more industry keywords'
        ],
        suggestedKeywords: ['leadership', 'project management', 'team collaboration'],
        fullName: 'Professional',
        email: '',
        phone: '',
        location: ''
      };

      // Clean up file
      await fs.unlink(req.file.path).catch(() => {});

      await incrementUserUsage(actingUser, 'analysis');
      return res.json({
        success: true,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        analysis: mockAnalysis
      });
    }

    console.log('🤖 Sending to OpenAI for analysis...');

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.error('❌ OpenAI request timed out');
    }, 30000); // 30 seconds timeout

    try {
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert resume analyzer and career consultant. Analyze resumes thoroughly and provide actionable feedback.

Return ONLY valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "overallRating": "<Excellent|Very Good|Good|Fair|Needs Improvement>",
  "atsCompatibility": "<High|Medium|Low>",
  "atsScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"],
  "fullName": "<extracted name or empty string>",
  "email": "<extracted email or empty string>",
  "phone": "<extracted phone or empty string>",
  "location": "<extracted location or empty string>"
}

Extract contact information if available in the resume text.`
            },
            {
              role: 'user',
              content: `Analyze this resume and return the JSON structure requested:\n\n${resumeText.slice(0, 12000)}`
            }
          ],
          temperature: 0.6,
          max_tokens: 1500
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('OpenAI request timed out')), 30000)
        )
      ]);

      clearTimeout(timeout);

      let aiResponse = completion.choices[0].message.content.trim();
      console.log('📄 AI response received, length:', aiResponse.length);
      
      // Clean up markdown code blocks
      aiResponse = aiResponse
        .replace(/^```json\s*/gi, '')
        .replace(/^```\s*/gi, '')
        .replace(/```\s*$/g, '')
        .trim();

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(aiResponse);
        console.log('✅ JSON parsed successfully');
      } catch (parseError) {
        console.warn('⚠️ Direct JSON parse failed, trying to extract JSON from response');
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            aiAnalysis = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON extracted and parsed successfully');
          } catch (e) {
            console.error('❌ Failed to parse extracted JSON:', e);
            aiAnalysis = null;
          }
        } else {
          console.error('❌ No JSON object found in response');
          aiAnalysis = null;
        }
      }

      if (!aiAnalysis) {
        console.error('❌ Could not parse AI response as JSON');
        console.log('Raw response:', aiResponse.substring(0, 500));
        
        // Clean up file before error response
        await fs.unlink(req.file.path).catch(() => {});
        
        return res.status(502).json({ 
          error: 'AI response could not be parsed',
          message: 'The AI returned an invalid response format. Please try again.'
        });
      }

      // Ensure all required fields exist with defaults
      const analysis = {
        score: aiAnalysis.score || 0,
        overallRating: aiAnalysis.overallRating || 'N/A',
        atsCompatibility: aiAnalysis.atsCompatibility || 'Unknown',
        atsScore: aiAnalysis.atsScore || 0,
        strengths: Array.isArray(aiAnalysis.strengths) ? aiAnalysis.strengths : [],
        improvements: Array.isArray(aiAnalysis.improvements) ? aiAnalysis.improvements : [],
        suggestedKeywords: Array.isArray(aiAnalysis.suggestedKeywords) ? aiAnalysis.suggestedKeywords : [],
        fullName: aiAnalysis.fullName || '',
        email: aiAnalysis.email || '',
        phone: aiAnalysis.phone || '',
        location: aiAnalysis.location || ''
      };

      console.log('✅ Analysis complete:', {
        score: analysis.score,
        rating: analysis.overallRating,
        name: analysis.fullName || 'Not extracted'
      });

      // Clean up the uploaded file
      await fs.unlink(req.file.path).catch(() => {});

      await incrementUserUsage(actingUser, 'analysis');
      // Return JSON response that frontend expects
      return res.json({
        success: true,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        analysis: analysis
      });

    } catch (error) {
      clearTimeout(timeout);
      console.error('❌ OpenAI or processing error:', error.message);
      console.error('Stack:', error.stack);
      
      // Clean up file
      await fs.unlink(req.file.path).catch(() => {});
      
      if (error.name === 'AbortError') {
        return res.status(504).json({ 
          error: 'Request timeout',
          message: 'The analysis took too long. Please try again with a shorter resume.'
        });
      }
      
      return res.status(500).json({ 
        error: 'Analysis failed',
        message: error.message || 'Failed to analyze resume with AI'
      });
    }

  } catch (outerError) {
    console.error('❌ Unexpected error in /api/analyze/file-robust:', outerError);
    console.error('Stack:', outerError.stack);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Unexpected server error',
        message: outerError.message 
      });
    }
  }
});


app.post('/api/analyze/file', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📄 File received:', req.file.originalname);
    console.log('📍 File path:', req.file.path);

    let resumeText = '';
    
    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log('📖 Reading PDF file...');
        const dataBuffer = fsSync.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        resumeText = pdfData.text;
        console.log('✅ PDF text extracted');
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('📖 Reading DOCX file...');
        const result = await mammoth.extractRawText({ path: req.file.path });
        resumeText = result.value;
        console.log('✅ DOCX text extracted');
      } else {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX.' });
      }
    } catch (extractError) {
      console.error('❌ Text extraction error:', extractError);
      console.error('Error details:', extractError.stack); 
      await fs.unlink(req.file.path);
      return res.status(500).json({ error: 'Failed to read file content' });
    }

    console.log('📝 Extracted text length:', resumeText.length, 'characters');

    if (!resumeText || resumeText.length < 50) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Could not extract enough text from the file' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('⚠️  OpenAI not configured, returning mock optimization');
      
      const mockOptimizedResume = generateMockOptimizedResume(resumeText, req.file.originalname);
      
      await fs.unlink(req.file.path);
      
      return res.json({
        success: true,
        fileName: req.file.originalname,
        analysis: {
          score: 85,
          atsCompatibility: 'High',
          improvements: [
            'Added quantifiable achievements',
            'Improved action verbs',
            'Added relevant keywords',
            'Improved formatting',
            'Enhanced professional summary'
          ]
        },
        optimizedResume: mockOptimizedResume
      });
    }

    console.log('🤖 Sending to OpenAI for optimization...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert resume writer. Optimize resumes for ATS systems.

CRITICAL: Keep responses under 1500 characters.

Return ONLY the optimized resume in this format:

[FULL NAME]
[Email] | [Phone] | [Location]

SUMMARY
[2 sentences about experience]

EXPERIENCE
[Job Title] | [Company] | [Dates]
- [Achievement with numbers]
- [Achievement with numbers]

EDUCATION
[Degree] | [School] | [Year]

SKILLS
[List 5-10 key skills]

Keep it concise and professional.`
        },
        {
          role: "user",
          content: `Optimize this resume (keep under 1500 chars):\n\n${resumeText.substring(0, 3000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const optimizedResume = completion.choices[0].message.content;
    console.log('✅ OpenAI optimization complete');

    const analysisScore = calculateResumeScore(optimizedResume);

    await fs.unlink(req.file.path);

    res.json({
      success: true,
      fileName: req.file.originalname,
      analysis: {
        score: analysisScore.score,
        atsCompatibility: analysisScore.atsCompatibility,
        improvements: [
          'Enhanced with strong action verbs',
          'Added quantifiable achievements',
          'Optimized for ATS systems',
          'Improved professional formatting',
          'Added relevant industry keywords'
        ]
      },
      optimizedResume: optimizedResume
    });

  } catch (error) {
    console.error('❌ Error processing resume:', error);
    
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process resume',
      message: error.message 
    });
  }
});

/*app.post('/api/analyze/linkedin', async (req, res) => {
  try {
    const { url, linkedinText } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'LinkedIn URL is required' });
    }

    if (url) {
      const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|profile)\/[a-zA-Z0-9_-]+\/?$/;
      if (!linkedinPattern.test(url)) {
        return res.status(400).json({ error: 'Invalid LinkedIn URL format' });
      }
    }

    console.log('🔗 LinkedIn URL received:', url);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('⚠️  OpenAI API key not configured, returning mock data');
      
      const mockResult = {
        success: true,
        profileUrl: url,
        analyzedAt: new Date().toISOString(),
        analysis: {
          score: 78,
          profileStrength: 'Strong',
          strengths: [
            '✅ Professional headline is clear and keyword-rich',
            '✅ Good number of connections shows networking',
            '✅ Experience section is well-detailed',
            '✅ Profile photo is professional'
          ],
          improvements: [
            '🔧 Add more detailed project descriptions',
            '🔧 Request recommendations from colleagues',
            '🔧 Publish articles to increase visibility',
            '🔧 Add volunteer experience if applicable'
          ],
          recommendations: [
            '💡 Optimize headline with industry keywords',
            '💡 Showcase measurable achievements',
            '💡 Update profile regularly',
            '💡 Engage with industry content'
          ],
          suggestedKeywords: [
            'software development',
            'full stack',
            'JavaScript',
            'React',
            'Node.js'
          ]
        }
      };

      setTimeout(() => {
        res.json(mockResult);
      }, 1500);
      return;
    }

    console.log('🤖 Using OpenAI for LinkedIn analysis...');

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a LinkedIn optimization expert. Analyze LinkedIn profiles and provide feedback in JSON format.

Response structure:
{
  "score": <number 0-100>,
  "profileStrength": "<Strong/Good/Needs Improvement>",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Respond with ONLY valid JSON, no other text.`
          },
          {
            role: "user",
            content: `Analyze the following LinkedIn profile${url ? ` (URL: ${url})` : ''} and provide the requested JSON.

${linkedinText ? `PROFILE TEXT:\n${linkedinText.slice(0, 12000)}` : 'No profile text provided. Use general best practices.'}

Provide optimization suggestions focusing on:
1. Profile completeness and quality
2. Headline and summary effectiveness
3. Experience descriptions
4. Skills and endorsements
5. Overall visibility and networking

Return ONLY a valid JSON object.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      let aiResponse = completion.choices[0].message.content.trim();
      console.log('🤖 OpenAI response received');

      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response:', parseError);
        
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON successfully');
        } else {
          throw new Error('Could not extract valid JSON');
        }
      }

      if (!aiAnalysis.score || !aiAnalysis.strengths || !aiAnalysis.improvements) {
        throw new Error('Missing required fields in AI response');
      }

      res.json({
        success: true,
        profileUrl: url,
        analyzedAt: new Date().toISOString(),
        analysis: aiAnalysis
      });

    } catch (aiError) {
      console.error('❌ OpenAI Error:', aiError.message);
      
      console.log('⚠️  Falling back to mock data...');
      
      const mockResult = {
        success: true,
        profileUrl: url,
        analyzedAt: new Date().toISOString(),
        analysis: {
          score: 78,
          profileStrength: 'Strong',
          strengths: [
            '✅ Professional headline is clear',
            '✅ Good networking presence',
            '✅ Detailed experience section',
            '✅ Professional profile photo'
          ],
          improvements: [
            '🔧 Add more project descriptions',
            '🔧 Request colleague recommendations',
            '🔧 Publish industry articles',
            '🔧 Add volunteer experience'
          ],
          recommendations: [
            '💡 Optimize headline with keywords',
            '💡 Add measurable achievements',
            '💡 Update profile regularly',
            '💡 Engage with content'
          ],
          suggestedKeywords: [
            'software development',
            'full stack',
            'JavaScript',
            'React',
            'Node.js'
          ]
        }
      };

      res.json(mockResult);
    }

  } catch (error) {
    console.error('❌ Error analyzing LinkedIn:', error);
    res.status(500).json({ 
      error: 'Failed to analyze LinkedIn profile',
      message: error.message 
    });
  }
}); */

// ===============================
// 🔍 Enhanced LinkedIn Analyzer API
// ===============================
app.post('/api/analyze/linkedin', async (req, res) => {
  try {
    const { url, linkedinText, portfolioUrl } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'LinkedIn URL is required' });
    }

    // ✅ Validate LinkedIn URL format
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|profile)\/[a-zA-Z0-9_-]+\/?$/;
    if (!linkedinPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid LinkedIn URL format' });
    }

    console.log('🔗 LinkedIn URL received:', url);
    if (portfolioUrl) console.log('🌐 Portfolio URL:', portfolioUrl);

    // ========== MOCK FALLBACK (if OpenAI not configured) ==========
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('⚠️ OpenAI not configured. Returning mock response.');
      return res.json({
        success: true,
        profileUrl: url,
        analyzedAt: new Date().toISOString(),
        analysis: {
          score: 82,
          profileStrength: 'Excellent',
          strengths: [
            '✅ Clear, keyword-rich headline',
            '✅ Strong networking presence and activity',
            '✅ Well-documented achievements and projects',
            '✅ Profile photo and banner are professional'
          ],
          improvements: [
            '🔧 Add measurable results to experience section',
            '🔧 Include more industry-specific keywords',
            '🔧 Engage with posts weekly to improve visibility'
          ],
          recommendations: [
            '💡 Expand the "About" section with quantified results',
            '💡 List certifications and highlight top 3 skills',
            '💡 Link featured portfolio projects'
          ],
          suggestedKeywords: [
            'leadership', 'software development', 'cloud computing', 'React', 'Node.js'
          ]
        }
      });
    }

    // ========== OPTIONAL: FETCH PAGE CONTENT ==========
    const fetchText = async (u) => {
      if (!u) return '';
      try {
        const r = await fetch(u, { timeout: 10000 });
        if (!r.ok) return '';
        const t = await r.text();
        return t.replace(/<[^>]*>/g, ' ').slice(0, 80000);
      } catch {
        return '';
      }
    };

    const linkedinContent = await fetchText(url);
    const portfolioContent = await fetchText(portfolioUrl);

    // ========== AI PROMPT ==========
    console.log('🤖 Sending enriched LinkedIn data to OpenAI...');

    const prompt = `
You are a professional LinkedIn strategist and profile optimization expert.

TASK:
Analyze the provided LinkedIn profile (and portfolio if present) and generate a structured JSON analysis.

The URLs are fully accessible. Extract factual insights (roles, achievements, tone, engagement level, keywords, etc.)
directly from the page text, not assumptions. Provide practical, data-driven improvement guidance.

DATA:
LinkedIn URL: ${url}
Portfolio URL: ${portfolioUrl || 'none'}

LINKEDIN TEXT (truncated): ${linkedinText ? linkedinText.slice(0, 12000) : 'none'}
PAGE CONTENT (auto-fetched): ${linkedinContent.slice(0, 8000)}
PORTFOLIO CONTENT: ${portfolioContent.slice(0, 8000)}

OUTPUT JSON SCHEMA:
{
  "score": <0-100>,
  "profileStrength": "<Excellent | Strong | Good | Needs Improvement>",
  "summary": "<short overview of candidate tone and professional brand>",
  "strengths": ["..."],
  "improvements": ["..."],
  "recommendations": ["..."],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"],
  "industryMatch": "<which industries the profile aligns with best>",
  "personalBrand": "<few words that describe the personal impression>"
}

RESPONSE RULES:
- Return ONLY valid JSON, no commentary or markdown.
- Ratings and feedback must align with objective profile completeness and clarity.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert LinkedIn profile analyst and strategist.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    let aiResponse = completion.choices[0].message.content.trim();
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // ========== PARSE RESPONSE ==========
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn('⚠️ Parsing error, trying fallback extraction...');
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from AI output');
      }
    }

    res.json({
      success: true,
      profileUrl: url,
      analyzedAt: new Date().toISOString(),
      analysis: aiAnalysis,
    });

  } catch (error) {
    console.error('❌ Error analyzing LinkedIn profile:', error);
    res.status(500).json({
      error: 'Failed to analyze LinkedIn profile',
      message: error.message,
    });
  }
});


app.post('/api/analyses/save', async (req, res) => {
  try {
    const { userId, analysisType = 'file', fileName, fileSize = 0, analysis, optimizedResume } = req.body || {};
    if (!fileName) {
      return res.status(400).json({ success: false, error: 'fileName is required' });
    }
    const AnalysisModel = require('./models/Analysis');
    const doc = await AnalysisModel.create({
      userId: userId || undefined,
      analysisType,
      fileName,
      fileSize,
      results: analysis,
      optimizedResume
    });
    res.json({ success: true, id: doc._id });
  } catch (error) {
    console.error('Save analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to save analysis' });
  }
});

app.get('/api/user/analyses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.json({
        success: true,
        analyses: []
      });
    }

    const Analysis = require('./models/Analysis');
    
    const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const mapped = analyses.map(a => ({
      _id: a._id,
      fileName: a.fileName,
      createdAt: a.createdAt,
      score: a.results?.score,
      atsScore: a.results?.atsScore,
      overallRating: a.results?.overallRating,
      analysisType: a.analysisType
    }));

    res.json({ success: true, count: mapped.length, analyses: mapped });
  } catch (error) {
    console.error('❌ Error fetching user analyses:', error);
    res.json({
      success: true,
      analyses: []
    });
  }
});

app.get('/api/analyses', async (req, res) => {
  try {
    const Analysis = require('./models/Analysis');
    const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(20);
    const mapped = analyses.map(a => ({
      _id: a._id,
      fileName: a.fileName,
      createdAt: a.createdAt,
      score: a.results?.score,
      atsScore: a.results?.atsScore,
      overallRating: a.results?.overallRating,
      analysisType: a.analysisType
    }));

    res.json({ success: true, count: mapped.length, analyses: mapped });
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    res.json({
      success: true,
      analyses: []
    });
  }
});

// ============================================
// GENERATION ROUTES
// ============================================

/*app.post('/api/generate/resume-from-scratch', async (req, res) => {
  try {
    const formData = req.body;
    console.log('🎨 AI designing resume for:', formData.fullName);

    const prompt = `
    You are a professional resume designer and ATS optimization expert.
    TASK: Create a complete, beautifully styled resume as **HTML + inline CSS**.
    It must look premium, modern, and recruiter-ready.

    DATA TO USE:
    ${JSON.stringify(formData, null, 2)}

    DESIGN REQUIREMENTS:
    - Clean, single-column layout, white background, dark text.
    - Accent color: #2563eb for section headers and dividers.
    - Use Helvetica or Arial fonts.
    - Include spacing, bold names, and subtle section separators.
    - Sections: Header (name + contact info), Summary, Experience, Education, Skills, Certifications (if any).
    - Use bullet points for achievements.
    - Make sure it’s visually balanced and **one page**.

    OUTPUT:
    Return only valid HTML (no explanations, no Markdown fences).
    It must start with <!DOCTYPE html> and include <style> with inline CSS inside <head>.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert resume designer." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    let html = completion.choices[0].message.content.trim();
    html = html.replace(/^```html|```$/g, '').trim();

    console.log('✅ AI HTML resume generated. Rendering PDF...');

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    const fileName = `${(formData.fullName || 'Candidate').replace(/\s+/g, '_')}_AI_Resume.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error generating AI-designed resume:', error);
    res.status(500).json({ error: 'Failed to generate AI-designed resume', message: error.message });
  }
}); */



const { renderResumeHTMLToPDF } = require('./utils/renderResumeHTMLToPDF');

app.post('/api/generate/resume-from-scratch', async (req, res) => {
  try {
    const formData = req.body;
    console.log('🎨 AI designing resume for:', formData.fullName);

    const fileName = `${(formData.fullName || 'Candidate')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-\.]/gi, '')}_AI_Resume.pdf`;

    // Explicitly set response as binary PDF before sending to Puppeteer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Transfer-Encoding', 'binary');

    // Ensure Express doesn’t try to parse JSON again (avoids corruption)
    req.setEncoding(null);

    // Run the generator
    await renderResumeHTMLToPDF(res, formData, fileName);

  } catch (error) {
    console.error('❌ Error in /api/generate/resume-from-scratch:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate AI-designed resume',
        message: error.message,
      });
    }
  }
});

 

/*app.post('/api/generate/resume-optimized', upload.single('resume'), async (req, res) => {
  console.log('🔥 /api/generate/resume-optimized hit');
  console.log('File:', req.file && req.file.originalname);
  console.log('Body keys:', Object.keys(req.body));

  try {
    const body = req.body || {};

    const parseMaybeJson = (v) => {
      if (!v) return null;
      if (typeof v === 'object') return v;
      try { return JSON.parse(v); } catch (_) { return null; }
    };

    const analysis = parseMaybeJson(body.analysis);
    const questionnaire = parseMaybeJson(body.questionnaire);
    const linkedinUrl = body.linkedinUrl || '';
    const linkedinText = body.linkedinText || '';
    const originalFileName = body.fileName || (req.file ? req.file.originalname : 'resume');

    let fileText = '';
    if (req.file) {
      try {
        const ext = (path.extname(req.file.originalname) || '').toLowerCase();
        const mime = req.file.mimetype;

        console.log('📄 Uploaded file MIME type:', mime, 'Extension:', ext);

        if (mime === 'application/pdf' || ext === '.pdf') {
          const dataBuffer = fsSync.readFileSync(req.file.path);
          const pdfData = await pdfParse(dataBuffer);
          fileText = pdfData.text || '';
        } else if (
          mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          mime === 'application/octet-stream' ||
          ext === '.docx'
        ) {
          const result = await mammoth.extractRawText({ path: req.file.path });
          fileText = result.value?.trim() || '';

          if (!fileText) {
            console.warn('⚠️ Mammoth returned empty text, using XML fallback...');
            const raw = fsSync.readFileSync(req.file.path);
            fileText = raw.toString('utf8').replace(/<[^>]+>/g, ' ').slice(0, 20000);
          }
        } else {
          console.warn('⚠️ Unsupported MIME type:', mime);
        }

        fileText = fileText.replace(/\s+/g, ' ').trim();
      } catch (e) {
        console.error('❌ File extraction error:', e);
      }
    }

    console.log('🧾 Extracted resume text preview:\n', (fileText || '[EMPTY]').slice(0, 600));

    const truncate = (s, n = 6000) => (s || '').toString().slice(0, n);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      const { renderResumePDF, renderPlainTextPDF } = require('./utils/resumePdf');
      if (questionnaire) {
        const base = (questionnaire.fullName || 'Candidate').replace(/\s+/g, '_').replace(/[^a-z0-9_\-\.]+/gi, '');
        const filename = `${base || 'Candidate'}_Resume.pdf`;
        renderResumePDF(res, questionnaire, filename);
        return;
      }
      const safeName = (originalFileName || 'resume').replace(/[^a-z0-9_\-\.]+/gi, '_');
      renderPlainTextPDF(res, 'Optimized Resume (Basic)', truncate(fileText) || 'Resume content unavailable.', `optimized_${safeName}.pdf`);
      return;
    }

    const systemPrompt = `
You are a professional resume writer and ATS optimization expert.
Create a modern, complete resume in clean STRUCTURED JSON. DO NOT include explanations.

JSON format:
{
  "basics": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": ""},
  "summary": "",
  "experiences": [
    {"company": "", "position": "", "startDate": "", "endDate": "", "currentlyWorking": false,
     "responsibilities": ["..."], "achievements": ["..."]}
  ],
  "education": [
    {"institution": "", "degree": "", "field": "", "graduationYear": "", "gpa": ""}
  ],
  "skills": {"technical": "", "soft": "", "languages": ""},
  "projects": "",
  "certifications": "",
  "awards": "",
  "interests": ""
}
`;

    const userContent = [
      questionnaire ? `QUESTIONNAIRE DATA:\n${JSON.stringify(questionnaire)}` : null,
      fileText ? `UPLOADED RESUME TEXT:\n${truncate(fileText)}` : null,
      linkedinUrl ? `LINKEDIN URL: ${linkedinUrl}` : null,
      linkedinText ? `LINKEDIN PROFILE TEXT:\n${truncate(linkedinText)}` : null,
      analysis ? `ANALYSIS DATA:\n${JSON.stringify(analysis)}` : null,
      'Instructions: Use all available information to create a concise, professional, ready-to-use resume in JSON format.'
    ].filter(Boolean).join('\n\n');

    console.log('🤖 Sending data to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    let content = completion.choices[0].message.content.trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let structured;
    try {
      structured = JSON.parse(content);
    } catch (e) {
      console.warn('⚠️ JSON parse failed, returning raw text PDF');
      const { renderPlainTextPDF } = require('./utils/resumePdf');
      const safeName = (originalFileName || 'resume').replace(/[^a-z0-9_\-\.]+/gi, '_');
      renderPlainTextPDF(res, 'Optimized Resume (Raw)', content, `optimized_${safeName}.pdf`);
      return;
    }

    const { renderResumePDF } = require('./utils/resumePdf');
    const baseName = (structured?.basics?.name || questionnaire?.fullName || 'Candidate')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-\.]+/gi, '');
    const finalName = `${baseName || 'Candidate'}_Resume.pdf`;

    console.log('✅ Structured resume generated. Rendering PDF...');
    renderResumePDF(res, structured, finalName);

  } catch (error) {
    console.error('❌ Error generating optimized resume:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate optimized resume', message: error.message });
    }
  } finally {
    if (req.file) {
      fs.unlink(req.file.path).catch(() => {});
    }
  }
});  */





/*const { renderOptimizedResumeHTMLToPDF } = require("./utils/renderOptimizedResumeHTMLToPDF");

app.post("/api/generate/resume-optimized", upload.none(), async (req, res) => {
  try {
    const formData = req.body;
    console.log("🎨 AI designing resume for:", formData.fullName);
    console.log("🔗 LinkedIn received:", formData.linkedinUrl);

    const fileName = `${(formData.fullName || "Candidate")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_\-\.]/gi, "")}_AI_Resume.pdf`;

    await renderOptimizedResumeHTMLToPDF(res, formData, fileName);

  } catch (error) {
    console.error("❌ Error in /api/generate/resume-optimized", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate AI-designed resume",
        message: error.message,
      });
    }
  }
}); */

const { renderOptimizedResumeHTMLToPDF } = require("./utils/renderOptimizedResumeHTMLToPDF");

app.post("/api/generate/resume-optimized", upload.single('resume'), async (req, res) => {
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🎨 AI Resume Generation Endpoint Hit");
    console.log("═══════════════════════════════════════════════════════");
    
    // ✅ Extract all form data
    const formData = {
      ...req.body,
      file: req.file // Include uploaded file if present
    };
    
    // ✅ Parse analysis if it's a JSON string
    if (formData.analysis && typeof formData.analysis === 'string') {
      try {
        formData.analysis = JSON.parse(formData.analysis);
        console.log("✅ Analysis data parsed successfully");
      } catch (e) {
        console.warn("⚠️ Could not parse analysis JSON:", e.message);
      }
    }
    
    // ✅ Log what we received
    console.log("📊 Form Data Received:");
    console.log("   - LinkedIn URL:", formData.linkedinUrl || "Not provided");
    console.log("   - Portfolio URL:", formData.portfolioUrl || "Not provided");
    console.log("   - LinkedIn Text:", formData.linkedinText ? "Provided" : "Not provided");
    console.log("   - Full Name (optional):", formData.fullName || "AI will extract");
    console.log("   - Email (optional):", formData.email || "AI will extract");
    console.log("   - Phone (optional):", formData.phone || "AI will extract");
    console.log("   - Location (optional):", formData.location || "AI will extract");
    console.log("   - File Name:", formData.fileName || "Not provided");
    console.log("   - Analysis Type:", formData.analysisType || "Not provided");
    console.log("   - Has File:", req.file ? `Yes (${req.file.originalname})` : "No");
    console.log("   - Has Analysis:", formData.analysis ? "Yes" : "No");
    
    // ✅ Validate required data - Accept LinkedIn URL OR file OR analysis data
    if (!formData.linkedinUrl && !req.file && !formData.analysis) {
      console.error("❌ Missing required data: No LinkedIn URL, file, or analysis provided");
      return res.status(400).json({
        error: "Missing required data",
        message: "Please provide a LinkedIn URL, resume file, or analysis data"
      });
    }
    
    console.log("✅ Data validation passed");
    
    // ✅ Generate filename
    const fileName = `AI_Generated_Resume_${Date.now()}.pdf`;
    
    console.log("📄 Generated Filename:", fileName);
    console.log("🚀 Starting PDF generation...");
    console.log("═══════════════════════════════════════════════════════");

    // ✅ Call the PDF generation function
    await renderOptimizedResumeHTMLToPDF(res, formData, fileName);

  } catch (error) {
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ Error in /api/generate/resume-optimized");
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
});







// ============================================
// ADMIN ROUTES
// ============================================

app.post('/api/admin/change-user-plan', async (req, res) => {
  try {
    const { userId, planType } = req.body;

    if (!['free', 'pro', 'team'].includes(planType)) {
      return res.status(400).json({ 
        error: 'Invalid plan type. Must be: free, pro, or team' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldPlan = user.plan.type;
    user.plan.type = planType;
    user.plan.status = 'active';
    user.plan.startDate = new Date();
    user.plan.features = clonePlanFeatures(planType);

    await user.save();

    console.log(`✅ Plan changed: ${user.email} - ${oldPlan} → ${planType}`);

    res.json({
      success: true,
      message: `Plan changed from ${oldPlan} to ${planType}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('❌ Plan change error:', error);
    res.status(500).json({ error: 'Failed to change plan' });
  }
});

app.get('/api/admin/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        usage: user.usage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email plan.type plan.status usage createdAt')
      .sort({ createdAt: -1 });   

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/migrate-users', async (req, res) => {
  try {
    console.log('🔄 Starting user migration...');
    
    const users = await User.find({});
    let migratedCount = 0;
    let errors = [];

    for (const user of users) {
      try {
        let needsUpdate = false;

        if (!user.plan || !user.plan.type) {
          user.plan = {
            type: 'free',
            status: 'active',
            startDate: user.createdAt || new Date(),
            endDate: null,
            paymentId: null,
            features: clonePlanFeatures('free')
          };
          needsUpdate = true;
        }

        if (!user.usage) {
          user.usage = {
            uploadsCount: 0,
            generationsCount: 0,
            lastUpload: null
          };
          needsUpdate = true;
        }

        if (needsUpdate) {
          await user.save();
          migratedCount++;
          console.log(`✅ Migrated user: ${user.email}`);
        }
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Migration complete. ${migratedCount} users migrated.`,
      migratedCount,
      totalUsers: users.length,
      errors: errors.length > 0 ? errors : undefined
    });

    console.log(`✅ Migration complete: ${migratedCount}/${users.length} users migrated`);
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error.message
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /api/health',
      'POST /api/analyze/file',
      'POST /api/analyze/file-robust',
      'POST /api/analyze/linkedin',
      'POST /api/auth/login',
      'POST /api/auth/signup',
      'POST /api/auth/change-password',
      'POST /api/generate/resume-from-scratch',
      'POST /api/generate/resume-optimized',
      'POST /api/analyses/save',
      'GET /api/user/analyses/:userId',
      'GET /api/analyses',
      'POST /api/admin/change-user-plan',
      'GET /api/admin/user/:email',
      'GET /api/admin/users',
      'POST /api/admin/migrate-users'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================
// SERVER START
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ========================================');
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🤖 OpenAI configured: ${openAIConfigured ? 'Yes ✅' : 'No ❌ (using mock data)'}`);
  console.log('🚀 ========================================');
  console.log('📋 Available routes:');
  console.log('   GET  /api/health');
  console.log('   POST /api/analyze/file');
  console.log('   POST /api/analyze/file-robust');
  console.log('   POST /api/analyze/linkedin');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/auth/signup');
  console.log('   POST /api/auth/change-password');
  console.log('   POST /api/generate/resume-from-scratch');
  console.log('   POST /api/generate/resume-optimized');
  console.log('   POST /api/analyses/save');
  console.log('   GET  /api/user/analyses/:userId');
  console.log('   GET  /api/analyses');
  console.log('   POST /api/admin/change-user-plan');
  console.log('   GET  /api/admin/user/:email');
  console.log('   GET  /api/admin/users');
  console.log('   POST /api/admin/migrate-users');
  console.log('🚀 ========================================');
});
