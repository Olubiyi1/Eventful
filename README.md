# 📌 Eventful — Event Management & Ticketing Platform

Eventful is a modern event management and ticketing platform that allows users to create, discover, and attend events seamlessly. It provides event creators with tools to manage events, track attendees, view analytics, and receive payments, while eventees can browse events, purchase tickets, receive QR codes, and get reminders.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User registration and login (Event creators & attendees)
- Role-based access control (Creator, Attendee, Admin)
- Secure authentication using JWT

---

### 🎟️ Event Management
- Create, update, and delete events
- Set event details (title, description, location, date, capacity)
- Manage event visibility (public/private)

---

### 🎫 Ticketing System
- Purchase event tickets
- Automatic QR code generation for each ticket
- QR code validation for event check-in

---

### 📊 Analytics (For Event Creators)
- Total attendees per event
- Total tickets sold per event
- Check-in statistics (valid vs used tickets)
- Revenue tracking per event

---

### 🔔 Notifications & Reminders
- Event reminders (custom timing: 1 day, 1 week, etc.)
- Ticket confirmation notifications
- Event updates and announcements

---

### 💳 Payments
- Paystack integration for ticket purchases
- Payment tracking per user and event
- Revenue insights for creators

---

### 🔗 Shareability
- Share events via social media links
- Public event discovery and browsing

---

## 🧱 Tech Stack

- Backend: Node.js + TypeScript  
- Framework: Express.js  
- Database: PostgreSQL (Prisma ORM)  
- Cache: Redis  
- Background Jobs: BullMQ  
- Payments: Paystack API  
- Authentication: JWT + bcrypt  
- QR Code: qrcode library  
- Documentation: Swagger / Postman  

---

## 🗄️ Database Overview

Core entities:
- User
- Event
- Ticket
- Payment
- Notification
- Review
- EventAttendee (junction table)

---

## 🔄 Core System Flow

1. User registers and logs in  
2. Event creator creates an event  
3. User browses and selects event  
4. Ticket is purchased  
5. Payment is processed via Paystack  
6. QR code ticket is generated  
7. Notifications and reminders are scheduled  
8. User checks in using QR code  
9. Analytics are updated for event creators  

---

## ⚙️ Architecture Highlights

- Role-Based Access Control (RBAC)
- Event-driven notifications system
- Redis caching for performance optimization
- BullMQ for background jobs (reminders, emails)
- Secure payment handling with Paystack
- QR-based ticket validation system

---

## 📦 Project Structure

```bash
src/
 ├── config/
 ├── modules/
 │    ├── auth/
 │    ├── users/
 │    ├── events/
 │    ├── tickets/
 │    ├── payments/
 │    ├── notifications/
 ├── services/
 ├── jobs/
 ├── utils/
 ├── middlewares/
 ├── prisma/