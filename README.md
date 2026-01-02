# SimpleCRM – Secure Customer Relationship Manager

A clean, fast, and secure CRM built for freelancers and small teams.  
Manage private customers, track calls/emails, and set follow-ups.

**Live Demo:** https://crm-lyart-seven.vercel.app

---

## 🚀 Features

### 🔒 Secure Authentication
- Email & password Sign Up / Login  
- Forgot password (email reset)
- Row Level Security (RLS)
- Users can access only their own data

### 👥 Customer Management
- Add, edit, delete customers
- Fields: Name, Email, Phone, Status
- Instant search
- Status badges:
  - Lead (Blue)
  - Active (Green)
  - Closed (Gray)

### 📅 Interactions & Follow-ups
- Log calls, meetings, emails
- Notes for every interaction
- Follow-up reminders
- Due follow-ups shown on Dashboard

### 📊 Dashboard
- Total customers
- Active leads
- Closed deals
- Upcoming follow-ups

---

## 🛠 Tech Stack
- Frontend: React 18 + Vite
- Language: TypeScript
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth)
- Icons: Lucide React

---

## 📦 Run Locally

### 1. Prerequisites
- Node.js
- Supabase account

---

### 2. Clone Repository
```bash
git clone https://github.com/varshanth-c/CRM.git
cd simple-crm
npm install


3. Supabase Database Setup

Open Supabase Dashboard → SQL Editor
Run the following:

-- Tables
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  phone text,
  status text check (status in ('Lead','Active','Closed')) default 'Lead',
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create table interactions (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers on delete cascade not null,
  user_id uuid references auth.users not null,
  type text check (type in ('call','meeting','email')),
  notes text,
  interaction_date timestamp with time zone default timezone('utc', now()) not null,
  follow_up_date timestamp with time zone
);

-- Enable RLS
alter table profiles enable row level security;
alter table customers enable row level security;
alter table interactions enable row level security;

-- Policies
create policy "View own profile"
on profiles for select
using (auth.uid() = id);

create policy "Manage own customers"
on customers for all
using (auth.uid() = user_id);

create policy "Manage own interactions"
on interactions for all
using (auth.uid() = user_id);

-- Auto create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

4. Environment Variables

Create .env in root:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

5. Start Application
npm run dev


Open: http://localhost:5173

🧪 Add Test Data (Optional)

Run after signing up:

DO $$
DECLARE
  my_uid uuid;
  cid uuid;
BEGIN
  SELECT id INTO my_uid
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO customers (user_id, name, email, status)
  VALUES (my_uid, 'Sarah Miller', 'sarah@demo.com', 'Active')
  RETURNING id INTO cid;

  INSERT INTO interactions (customer_id, user_id, type, notes, follow_up_date)
  VALUES (
    cid,
    my_uid,
    'call',
    'Initial onboarding call',
    NOW() + INTERVAL '1 day'
  );
END $$;

📂 Project Structure
src/
├── components/
├── contexts/
├── lib/
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ForgotPassword.tsx
│   ├── UpdatePassword.tsx
│   ├── Dashboard.tsx
│   ├── Customers.tsx
│   └── CustomerDetail.tsx
├── types/
└── App.tsx

🚢 Deployment (Vercel)

Create vercel.json:

{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

✅ Finished

SimpleCRM is ready 🚀


---
