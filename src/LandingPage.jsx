import React from 'react';
import { useNavigate, Link } from 'react-router-dom';  // Add this import
import './LandingPage.css';
import Carousel from './Carousel'
//import resumeImage from './hero-resume.jpg';
import { FiUpload } from 'react-icons/fi';
import { LuSparkles } from 'react-icons/lu';
import { FiDownload } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import {
  HiOutlineCheckCircle,
  HiOutlineKey,
  HiOutlinePencil,
  HiOutlineChartBar,
  HiOutlineTemplate,
  HiOutlineShieldCheck,
  HiOutlineCheck
} from 'react-icons/hi';
import Magnet from './Magnet'
import Folder from './Folder'



export default function LandingPage() {
  const navigate = useNavigate();  // Add this hook

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-logo">
            <span className="logo-text">ResuMind</span>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="navbar-cta"
          >
            Get Started
          </button>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-left">
              <h1>Optimize Your Resume with AI</h1>
              <p>Instant AI feedback and ATS score</p>
              <div className="cta-buttons">
                <button 
                  onClick={() => navigate('/auth')}  // Changed
                  className="btn-primary"
                >
                  Analyze Existing Resume
                </button>
                <Magnet padding={50} disabled={false} magnetStrength={10}>
                    <button 
                      onClick={() => navigate('/auth')}  // Changed
                      className="btn-secondary"
                    >
                      <HiOutlineSparkles />
                      Generate New Resume
                    </button>
                </Magnet>
               
                  
                
              </div>
              
            </div>
            
            <div className="hero-right">
               {/* <div style={{ height: '150px', position: 'fixed' }} className='folderFather'>
                  <Folder size={1} color="#2563EB" className="custom-folder" />
                </div>*/}
              <img 
                src="/thumbnail.png"
                alt="Resume Preview Example"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon">
                <FiUpload className="icon"></FiUpload>
              </div>
              <h3>Upload</h3>
              <p>Simply upload your resume in PDF or Word format to get started with AI analysis.</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <LuSparkles className="icon"></LuSparkles>
              </div>
              <h3>Analyze</h3>
              <p>Our AI instantly analyzes your resume and provides detailed feedback with ATS scoring.</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <FiDownload className="icon"></FiDownload>
              </div>
              <h3>Download</h3>
              <p>Get your optimized resume with actionable improvements ready to impress employers.</p>
            </div>
          </div>
        </div>
      </section>

{/* Features Section - NEW */}
      {/* Features Section - Fancy Animated Version */}
<section className="features">
  <div className="container">
    <div className="features-header">
      <h2 className="fade-in">Why Professionals Choose ResuMind</h2>
      <p className="features-subtitle fade-in-delay">Get more interviews with less effort</p>
    </div>
    
    <div className="features-grid-fancy">
      {/* Feature 1 */}
      <div className="feature-card-fancy" data-aos="fade-up" data-aos-delay="0">
        <div className="card-glow"></div>
        <div className="feature-icon-fancy">
          <HiOutlineCheckCircle className="icon" />
        </div>
        <h3>Pass Applicant Tracking Systems</h3>
        <p>Your resume is optimized for parsing by top HR software like Workday or Greenhouse.</p>
        <div className="card-shine"></div>
      </div>

      {/* Feature 2 */}
      <div className="feature-card-fancy" data-aos="fade-up" data-aos-delay="100">
        <div className="card-glow"></div>
        <div className="feature-icon-fancy">
          <HiOutlineKey className="icon" />
        </div>
        <h3>Match Job Descriptions</h3>
        <p>AI highlights missing keywords and adds relevant ones automatically.</p>
        <div className="card-shine"></div>
      </div>

      {/* Feature 3 */}
      <div className="feature-card-fancy" data-aos="fade-up" data-aos-delay="200">
        <div className="card-glow"></div>
        <div className="feature-icon-fancy">
          <HiOutlinePencil className="icon" />
        </div>
        <h3>Sound Professional, Stand Out</h3>
        <p>Get a rewritten version with improved tone, clarity, and measurable impact.</p>
        <div className="card-shine"></div>
      </div>

      {/* Feature 4 */}
      <div className="feature-card-fancy" data-aos="fade-up" data-aos-delay="0">
        <div className="card-glow"></div>
        <div className="feature-icon-fancy">
          <HiOutlineChartBar className="icon" />
        </div>
        <h3>See What Needs Work</h3>
        <p>Get an overall score with clear improvement suggestions in seconds.</p>
        <div className="card-shine"></div>
      </div>

      {/* Feature 5 */}
      <div className="feature-card-fancy" data-aos="fade-up" data-aos-delay="100">
        <div className="card-glow"></div>
        <div className="feature-icon-fancy">
          <HiOutlineTemplate className="icon" />
        </div>
        <h3>Professional Templates</h3>
        <p>Download your resume in modern, recruiter-approved designs.</p>
        <div className="card-shine"></div>
      </div>

      {/* Feature 6 */}
      <div className="feature-card-fancy" data-aos="fade-up" data-aos-delay="200">
        <div className="card-glow"></div>
        <div className="feature-icon-fancy">
          <HiOutlineShieldCheck className="icon" />
        </div>
        <h3>Your Data, Your Control</h3>
        <p>We don't store or train on your documents. Ever.</p>
        <div className="card-shine"></div>
      </div>
    </div>
  </div>
</section>

      {/* Reviews Marquee */}
      <section className="reviews">
        <div className="container">
          <h2 className="reviews-title">What Our Users Say</h2>
          <div className="reviews-viewport">
            <div className="reviews-track">
              {/* One set */}
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“Got an interview within a week after using the suggestions. Totally worth it.”</p>
                <div className="review-author">— Alex M., Product Manager</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“The AI rewrite made my experience sound concise and impactful.”</p>
                <div className="review-author">— Priya S., Data Analyst</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★☆</div>
                <p className="review-text">“Loved the ATS score and keyword insights. Super practical.”</p>
                <div className="review-author">— Daniel K., Software Engineer</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“Clean templates and very easy to export a polished PDF.”</p>
                <div className="review-author">— Maria L., UX Designer</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★☆</div>
                <p className="review-text">“Clear checklist of improvements. Felt confident applying again.”</p>
                <div className="review-author">— Chris T., Marketing Specialist</div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“Got an interview within a week after using the suggestions. Totally worth it.”</p>
                <div className="review-author">— Alex M., Product Manager</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“The AI rewrite made my experience sound concise and impactful.”</p>
                <div className="review-author">— Priya S., Data Analyst</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★☆</div>
                <p className="review-text">“Loved the ATS score and keyword insights. Super practical.”</p>
                <div className="review-author">— Daniel K., Software Engineer</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“Clean templates and very easy to export a polished PDF.”</p>
                <div className="review-author">— Maria L., UX Designer</div>
              </div>
              <div className="review-card">
                <div className="review-stars">★★★★☆</div>
                <p className="review-text">“Clear checklist of improvements. Felt confident applying again.”</p>
                <div className="review-author">— Chris T., Marketing Specialist</div>
              </div>
            </div>

            {/* Center indicator like a roulette line */}
            <div className="reviews-indicator" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Pricing Section - 2 Plans Only */}
      <section className="pricing">
        <div className="container">
          <h2 className="pricing-title">Simple, Transparent Pricing</h2>
          
          <div className="pricing-cards-two">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="plan-header">
                <h3 className="plan-name">Free Scan</h3>
                <div className="plan-price">
                  <span className="price">$0</span>
                </div>
              </div>
              
              <ul className="plan-features">
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>AI review of your resume</span>
                </li>
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>Keyword match score</span>
                </li>
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>Basic improvement tips</span>
                </li>
              </ul>
              
              <button 
                onClick={() => navigate('/upload')}  // Changed from <a> to button
                className="btn-outline"
              >
                Start Free Scan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card featured">
              
              <div className="popular-badge">Most Popular</div>
              <div className="plan-header">
                <h3 className="plan-name">Pro Optimization</h3>
                <div className="plan-price">
                  <span className="price">$9</span>
                  <span className="price-period">one-time</span>
                </div>
              </div>
              
              <ul className="plan-features">
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>Full AI rewrite</span>
                </li>
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>ATS formatting</span>
                </li>
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>Downloadable PDF</span>
                </li>
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>Professional templates</span>
                </li>
                <li>
                  <HiOutlineCheck className="check-icon" />
                  <span>Unlimited revisions</span>
                </li>
              </ul>
              
              <button 
                onClick={() => navigate('/auth')}  // Changed from <a> to button (checkout goes to auth)
                className="btn-outline"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section - Cool Grid Design */}
      <section className="faq">
        <div className="container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about ResuMind</p>
          </div>
          
          <div className="faq-cards">
            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">01</div>
                  <h3>How does the AI analyze my resume?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>Our AI scans your resume for ATS compatibility, keyword optimization, formatting issues, and content quality. It compares your resume against thousands of successful examples and industry standards to provide personalized recommendations.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">02</div>
                  <h3>Is my data secure and private?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>Absolutely. We never store your resume or personal information. Your documents are analyzed in real-time and immediately deleted after processing. We don't train our AI on your data, and we never share your information with third parties.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">03</div>
                  <h3>What file formats do you support?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>We support PDF, DOCX (Microsoft Word), DOC, and TXT formats. For best results, we recommend uploading a PDF or DOCX file with your most up-to-date resume.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">04</div>
                  <h3>Can I use the free version multiple times?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>Yes! The free scan is unlimited. You can analyze as many resumes as you want and get basic feedback. Upgrade to Pro when you're ready for the full AI rewrite and premium features.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">05</div>
                  <h3>What's included in the Pro version?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>Pro includes a complete AI rewrite of your resume, ATS-optimized formatting, professional templates, unlimited revisions, and downloadable PDFs. It's a one-time payment with lifetime access to your optimized resume.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">06</div>
                  <h3>How long does the analysis take?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>The AI analysis is instant! You'll get your feedback within seconds. The Pro rewrite typically takes 30-60 seconds to generate a fully optimized version of your resume.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">07</div>
                  <h3>Do you offer refunds?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>Yes! We offer a 7-day money-back guarantee. If you're not satisfied with your Pro optimization, just contact us within 7 days of purchase for a full refund—no questions asked.</p>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <div className="faq-card-inner">
                <div className="faq-card-front">
                  <div className="faq-number">08</div>
                  <h3>Can I edit the AI-generated resume?</h3>
                  <div className="faq-hover-hint">Click to reveal</div>
                </div>
                <div className="faq-card-back">
                  <p>Yes! With Pro, you can make unlimited edits and regenerate your resume as many times as you need. The AI will maintain ATS optimization while incorporating your changes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <h3 className="footer-logo">ResuMind</h3>
            <p className="footer-tagline">
              Empowering professionals with AI-driven resume optimization. 
              Land your dream job faster.
            </p>
            <div className="footer-social">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-links">
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/templates">Templates</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/resume-tips">Resume Tips</Link></li>
              <li><Link to="/career-advice">Career Advice</Link></li>
              <li><Link to="/guides">Guides</Link></li>
              <li><Link to="/api">API Docs</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/status">System Status</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/gdpr">GDPR</Link></li>
              <li><Link to="/security">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 ResuMind. All rights reserved.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">Secure & Private</span>
            <span className="footer-badge">AI-Powered</span>
            <span className="footer-badge">ATS Optimized</span>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}
