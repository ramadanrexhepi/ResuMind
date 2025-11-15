import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';
import { HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlineCheckCircle } from 'react-icons/hi';

export default function TermsOfService() {
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
            <HiOutlineDocumentText className="header-icon" />
            <h1>Terms of Service</h1>
            <p className="last-updated">Last updated: January 2025</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using ResuMind ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p>
              These Terms of Service ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service") provided by ResuMind ("we," "us," or "our").
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Description of Service</h2>
            <p>
              ResuMind is an AI-powered resume optimization service that helps users improve their resumes by providing:
            </p>
            <ul>
              <li>Resume analysis and scoring</li>
              <li>ATS (Applicant Tracking System) optimization</li>
              <li>Content suggestions and improvements</li>
              <li>Resume generation and formatting</li>
              <li>Professional resume templates</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
            </p>
          </section>

          <section className="privacy-section">
            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>To use certain features of the Service, you must register for an account. When you create an account, you agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept all responsibility for activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3>3.2 Account Responsibility</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to comply with this section.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. User Content</h2>
            <h3>4.1 Your Content</h3>
            <p>
              You retain ownership of all content you upload, submit, or create through the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your User Content solely for the purpose of providing and improving the Service.
            </p>

            <h3>4.2 Content Guidelines</h3>
            <p>You agree not to upload, post, or transmit any User Content that:</p>
            <ul>
              <li>Violates any law or regulation</li>
              <li>Infringes on the rights of others, including intellectual property rights</li>
              <li>Contains malicious code, viruses, or harmful components</li>
              <li>Is fraudulent, false, or misleading</li>
              <li>Contains offensive, discriminatory, or inappropriate content</li>
              <li>Violates any third party's privacy rights</li>
            </ul>

            <h3>4.3 Content Removal</h3>
            <p>
              We reserve the right to remove or refuse to process any User Content that we believe violates these Terms or is otherwise objectionable, without prior notice.
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Payment and Billing</h2>
            <h3>5.1 Fees</h3>
            <p>
              Certain features of the Service may require payment of fees. All fees are stated in U.S. dollars and are non-refundable unless otherwise stated or required by law.
            </p>

            <h3>5.2 Payment Processing</h3>
            <p>
              Payments are processed by third-party payment processors. By making a payment, you agree to the terms and conditions of the payment processor. We are not responsible for any issues arising from payment processing.
            </p>

            <h3>5.3 Refunds</h3>
            <p>
              Refund requests will be evaluated on a case-by-case basis. Please contact us at support@resumind.com for refund inquiries. Refunds, if approved, will be processed within 30 days.
            </p>

            <h3>5.4 Price Changes</h3>
            <p>
              We reserve the right to change our pricing at any time. Price changes will not affect purchases already made, but will apply to future purchases.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Intellectual Property</h2>
            <h3>6.1 Our Property</h3>
            <p>
              The Service, including its original content, features, and functionality, is owned by ResuMind and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3>6.2 Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use, subject to these Terms.
            </p>

            <h3>6.3 Restrictions</h3>
            <p>You may not:</p>
            <ul>
              <li>Copy, modify, or create derivative works of the Service</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Remove any copyright or proprietary notices</li>
              <li>Use the Service for any commercial purpose without our written consent</li>
              <li>Resell or redistribute the Service</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Service Availability</h2>
            <p>
              We strive to provide reliable service, but we do not guarantee that the Service will be available at all times. The Service may be unavailable due to:
            </p>
            <ul>
              <li>Scheduled maintenance</li>
              <li>Unforeseen technical issues</li>
              <li>Circumstances beyond our control</li>
            </ul>
            <p>
              We are not liable for any loss or damage resulting from Service unavailability.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Disclaimers and Limitations of Liability</h2>
            <h3>8.1 Service Disclaimer</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3>8.2 No Guarantee of Results</h3>
            <p>
              We do not guarantee that using our Service will result in job interviews, job offers, or career advancement. Resume optimization is one factor among many in the job application process.
            </p>

            <h3>8.3 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless ResuMind and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
            </p>
            <ul>
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>10. Termination</h2>
            <h3>10.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by contacting us or using the account deletion feature in your account settings.
            </p>

            <h3>10.2 Termination by Us</h3>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
            </p>

            <h3>10.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use the Service will immediately cease. We may delete your account and User Content, and we are not obligated to provide any refund or compensation.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the modified Terms.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ResuMind operates, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
            </p>
          </section>

          <section className="privacy-section">
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> legal@resumind.com</p>
              <p><strong>Address:</strong> ResuMind, Legal Department</p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>14. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and ResuMind regarding the use of the Service and supersede all prior agreements and understandings.
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

