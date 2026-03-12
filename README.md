# Mental Health System

A comprehensive mental health management system for students, counselors, and administrators.

## Structure

- **Frontend**: React application with Vite
- **Backend**: Node.js/Express API
- **Database**: Supabase (PostgreSQL)
- **AI**: Grok AI integration

## Modules

The system includes 30+ modules covering:
- User authentication (Modules 1-3)
- Profile management (Module 4)
- Mental health surveys (Module 5)
- Mood tracking (Module 6)
- Symptom analysis (Module 7)
- AI recommendations (Module 8)
- Stress monitoring (Module 9)
- Attendance correlation (Module 10)
- AI chatbot (Module 11)
- Appointment scheduling (Module 12)
- Counselor dashboard (Module 13)
- Notifications (Module 14)
- Crisis alerts (Module 15)
- Peer forum (Module 16)
- Sleep tracking (Module 17)
- Academic integration (Module 18)
- Lifestyle tracking (Module 19)
- Gamified stress relief (Module 20)
- Weekly reports (Module 21)
- Journal with sentiment analysis (Module 22)
- Goal setting (Module 23)
- Mood prediction (Module 24)
- Feedback system (Module 25)
- Multi-language support (Module 26)
- Data backup & recovery (Module 27)
- Role-based access control (Module 28)
- Report export (Module 29)
- Analytics dashboard (Module 30)

## Getting Started

1. Install dependencies:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Set up environment variables (.env files)

3. Run the application:
   ```
   # Frontend
   cd frontend && npm run dev

   # Backend
   cd backend && npm run dev
   ```

## Database

Run migrations:
```
psql -f database/migrations/*.sql
```

Apply RLS policies:
```
psql -f database/rls/*.sql
```
