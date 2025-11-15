import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineUser, HiOutlineGlobe } from 'react-icons/hi';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-policy-page">
      <div className="privacy-container">
        {/* Header */}
        <div className="privacy-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft />
            Back
          </button>
          <div className="header-content">
            <HiOutlineShieldCheck className="header-icon" />
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last updated: January 2025</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to ResuMind ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our resume optimization service.
            </p>
            <p>
              By using ResuMind, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our service.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide to Us</h3>
            <ul>
              <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.</li>
              <li><strong>Resume Data:</strong> When you upload or generate a resume, we process the content of your resume, including personal information, work experience, education, skills, and other details you provide.</li>
              <li><strong>Payment Information:</strong> If you make a purchase, we collect billing information. However, payment processing is handled by secure third-party payment processors, and we do not store your full credit card information.</li>
              <li><strong>Communications:</strong> When you contact us for support or inquiries, we collect the information you provide in those communications.</li>
            </ul>

            <h3>2.2 Information We Collect Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> We collect information about how you access and use our service, including your IP address, browser type, device information, pages visited, time spent on pages, and the dates and times of your visits.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>
            <ul>
              <li>To provide, maintain, and improve our resume optimization service</li>
              <li>To process your transactions and send you related information</li>
              <li>To send you technical notices, updates, security alerts, and support messages</li>
              <li>To respond to your comments, questions, and requests</li>
              <li>To monitor and analyze trends, usage, and activities in connection with our service</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To personalize your experience and provide content and features relevant to your interests</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Data Storage and Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
            </p>
            <ul>
              <li>Your resume data is encrypted in transit and at rest</li>
              <li>We use secure servers and databases to store your information</li>
              <li>Access to your personal information is restricted to authorized personnel only</li>
              <li>We regularly review and update our security practices</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> You can request access to your personal information that we hold</li>
              <li><strong>Correction:</strong> You can update or correct your personal information through your account settings</li>
              <li><strong>Deletion:</strong> You can request deletion of your personal information by deleting your account</li>
              <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Opt-Out:</strong> You can opt-out of certain communications from us by following the unsubscribe instructions in our emails</li>
              <li><strong>Cookie Preferences:</strong> You can control cookies through your browser settings</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Third-Party Services</h2>
            <p>
              We may use third-party services to help us operate our service and administer activities on our behalf, such as:
            </p>
            <ul>
              <li><strong>Cloud Storage Providers:</strong> We use cloud services to store your resume data securely</li>
              <li><strong>Analytics Services:</strong> We use analytics tools to understand how our service is used</li>
              <li><strong>Payment Processors:</strong> We use secure payment processors to handle transactions</li>
              <li><strong>Email Services:</strong> We use email services to send you notifications and updates</li>
            </ul>
            <p>
              These third-party service providers have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. AI and Machine Learning</h2>
            <p>
              ResuMind uses artificial intelligence and machine learning to analyze and optimize your resume. We want to be transparent about how we handle your data:
            </p>
            <ul>
              <li>Your resume content is processed by our AI systems to provide optimization recommendations</li>
              <li>We do not use your resume data to train or improve our AI models without your explicit consent</li>
              <li>Your data is not shared with third parties for AI training purposes</li>
              <li>We may use anonymized, aggregated data for service improvement purposes</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will delete such information from our systems.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our service, you consent to the transfer of your information to our facilities and those third parties with whom we share it as described in this policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@resumind.com</p>
              <p><strong>Address:</strong> ResuMind, Privacy Department</p>
              <p>We will respond to your inquiry within 30 days.</p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>13. Your Consent</h2>
            <p>
              By using ResuMind, you consent to our Privacy Policy and agree to its terms. If you do not agree to this policy, please do not use our service.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="privacy-footer-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

