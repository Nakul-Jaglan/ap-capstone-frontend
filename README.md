# CollabSpace: Real-Time Corporate Collaboration Platform

## AP Capstone Project Proposal

## Project Overview

**CollabSpace** is an affordable, secure, and scalable real-time chat platform designed for corporate communication. This repository contains the frontend application built with Next.js and React, delivering enterprise-grade collaboration features including chat, voice/video calls, dynamic channels, and media sharing.

## Problem Statement

Many organizations struggle with effective team communication and collaboration because popular tools like Slack are expensive and often inflexible for growing startups and businesses. CollabSpace aims to deliver an affordable, secure, and scalable real-time chat platform for corporate communication, with chat, voice/video calls, dynamic channels, and media sharing.

## System Architecture

- **Frontend**: Next.js (with React), hosted on Vercel
- **Backend**: Express.js (Node.js), hosted on Railway
- **Database**: MongoDB (cloud hosted with MongoDB Atlas)
- **Authentication**: Clerk (for secure, ready-to-use authentication)
- **Image Storage**: Cloudinary (for storing and optimizing user-uploaded images)
- **Real-Time Communication**: WebSocket (socket.io) for instant messaging, WebRTC for voice/video calls
- **Other Integrations**: Email notifications (SendGrid), Media previews

## Tech Stack

| Layer | Technologies/Platforms |
|-------|------------------------|
| **Frontend** | Next.js, React.js, TailwindCSS, Clerk SDK, Axios/Fetch |
| **Backend** | Node.js, Express.js, Socket.IO, WebRTC, Multer |
| **Database** | MongoDB, hosted on MongoDB Atlas |
| **Authentication** | Clerk |
| **Image Storage** | Cloudinary |
| **Hosting** | Frontend: Vercel; Backend: Railway; Database: MongoDB Atlas |

## Key Features

| Category | Features |
|----------|----------|
| **Authentication** | Secure sign-up/sign-in, session management, role-based access (admin/user) using Clerk |
| **Messaging** | Real-time direct and group chat with instant delivery |
| **Voice/Video Calls** | WebRTC-powered voice and video communication |
| **CRUD Operations** | Create, Read, Update, Delete Channels, Messages, User profiles |
| **Media Sharing** | Upload and manage images/files via Cloudinary |
| **Search/Filter/Sort** | Efficient message, user, and channel search and filtering |
| **Pagination** | Paginated display for channels and chat histories |
| **Frontend Routing** | Multi-page navigation: Login, Register, Home, Channels, Chat, Call, Settings |
| **Admin Controls** | Manage users, delete channels, control access |
| **Hosting** | Deployed, accessible frontend and backend at public URLs |

## Project Structure

```
ap-capstone/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── login/
│   │   └── signup/
│   ├── public/       # Static assets
│   └── package.json
└── backend/          # Backend API
    ├── src/
    ├── prisma/       # Database schema
    └── generated/    # Prisma client
```

## API Overview

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/users/me` | GET | Fetch current user profile | Authenticated |
| `/api/users/:id` | GET | Get user profile | Authenticated |
| `/api/channels` | POST | Create channel | Authenticated |
| `/api/channels/:id` | GET | Get channel details | Authenticated |
| `/api/channels/:id` | PUT | Update channel | Admin Only |
| `/api/channels/:id` | DELETE | Delete channel | Admin Only |
| `/api/messages` | POST | Send message | Authenticated |
| `/api/messages?channel_id=` | GET | Fetch messages (with filters, pagination) | Authenticated |
| `/api/upload` | POST | Upload image/message media | Authenticated |

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB Atlas account
- Clerk account (for authentication)
- Cloudinary account (for media storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Nakul-Jaglan/ap-capstone-frontend.git
cd ap-capstone-frontend
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables
   - Configure Clerk API keys
   - Set up MongoDB Atlas connection string
   - Add Cloudinary credentials
   - Configure Socket.IO settings

### Development

Run the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

Run the backend server:
```bash
cd backend
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Project Goals

This AP Capstone project aims to:
- Create an affordable alternative to expensive enterprise communication tools
- Implement real-time communication using WebSocket and WebRTC technologies
- Demonstrate full-stack development skills with modern frameworks
- Build a scalable and maintainable SaaS application
- Apply software engineering best practices and design patterns

## Deliverables

1. ✅ **Fully functional live demo** (hosted on Vercel and Railway)
2. ✅ **Code repository** (GitHub, well-documented)
3. 📝 **Final project documentation/report**
4. 📝 **API documentation** (Postman/Swagger)

## Expected Outcomes

- A production-ready real-time collaboration platform
- Comprehensive API documentation
- Scalable architecture supporting multiple concurrent users
- Secure authentication and authorization system
- Rich media sharing capabilities
- Responsive, modern user interface

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## Contributing

This is an academic project for AP Capstone. 

## License

This project is part of an academic submission for AP Capstone.

## Author

**Nakul Jaglan**
- GitHub: [@Nakul-Jaglan](https://github.com/Nakul-Jaglan)

---

*Last Updated: December 7, 2025*
