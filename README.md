# ResuMind - AI Resume Optimizer 🚀

> Transform your resume with AI-powered analysis and optimization. Get professional, ATS-friendly resumes in minutes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)

## 🌟 Features

- ** Resume Upload & Analysis** - Upload PDF or DOCX resumes for instant AI-powered feedback
- ** LinkedIn Profile Analysis** - Analyze LinkedIn profiles directly with URL input
- ** GPT-4o Integration** - Leverage OpenAI's latest model for intelligent resume optimization
- ** Professional PDF Generation** - Create beautifully formatted, ATS-compatible resumes
- ** Detailed Scoring** - Get comprehensive scores across multiple resume categories
- ** ATS Optimization** - Ensure your resume passes Applicant Tracking Systems
- ** Personalized Recommendations** - Receive actionable feedback to improve your resume

## Screenshots

*Coming soon - Add screenshots of your app here*

## Tech Stack

### Frontend
- **React.js** - UI framework
- **CSS3** - Styling with modern design
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **OpenAI GPT-4o** - AI analysis engine
- **Puppeteer** - PDF generation
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Mammoth** - DOCX file processing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (free tier available)
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/ramadanrexhepi/ResuMind.git
   cd ResuMind
```

2. **Install backend dependencies**
```bash
   cd backend
   npm install
```

3. **Install frontend dependencies**
```bash
   cd ../frontend
   npm install
```

4. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
```env
   PORT=5050
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/resumind
   OPENAI_API_KEY=sk-your-openai-api-key-here
   NODE_ENV=development
```

5. **Start the backend server**
```bash
   cd backend
   npm start
```
   Backend will run on `http://localhost:5050`

6. **Start the frontend (in a new terminal)**
```bash
   cd frontend
   npm start
```
   Frontend will run on `http://localhost:3000`

##  Usage

1. **Upload Your Resume**
   - Navigate to the upload page
   - Choose a PDF or DOCX file
   - Click "Analyze Resume"

2. **Or Analyze LinkedIn Profile**
   - Enter your LinkedIn profile URL
   - Click "Analyze Profile"

3. **Review Analysis**
   - View detailed scores and feedback
   - Read personalized recommendations

4. **Generate Optimized Resume**
   - Click "Generate Optimized Resume"
   - Download your professional PDF

##  API Endpoints

### Resume Analysis
```http
POST /api/analyze-resume
Content-Type: multipart/form-data

Parameters:
- resume: File (PDF or DOCX)
```

### LinkedIn Analysis
```http
POST /api/analyze-linkedin
Content-Type: application/json

Body:
{
  "linkedinUrl": "https://www.linkedin.com/in/username"
}
```

### Generate Resume
```http
POST /api/generate-resume
Content-Type: application/json

Body:
{
  "resumeText": "Full resume text...",
  "linkedinUrl": "Optional LinkedIn URL"
}
```

##  Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

##  Project Structure
```
ResuMind/
├── backend/
│   ├── server.js           # Express server
│   ├── routes/            # API routes
│   ├── uploads/           # Temporary file storage
│   ├── package.json
│   └── .env               # Environment variables (not in repo)
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
├── .gitignore
└── README.md
```

##  Known Issues

- Large file uploads (>10MB) may timeout
- LinkedIn scraping may be rate-limited

##  Future Enhancements

- [ ] Multiple resume templates
- [ ] Resume comparison feature
- [ ] Job description matching
- [ ] Cover letter generation
- [ ] Multi-language support
- [ ] Mobile app

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Author

**Ramadan Rexhepi**

- GitHub: [@ramadanrexhepi](https://github.com/ramadanrexhepi)
- Portfolio: [ramadanrexhepi.dev](https://ramadanrexhepi.dev)
- LinkedIn: [linkedin.com/in/ramadanrexhepi](https://linkedin.com/in/ramadanrexhepi)

##  Acknowledgments

- OpenAI for GPT-4o API
- MongoDB Atlas for cloud database
- Create React App for frontend boilerplate
