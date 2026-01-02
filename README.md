# SimpleCRM - Secure Customer Relationship Manager

A clean, fast, and secure CRM built for freelancers and small teams. It allows users to manage their own private list of customers, track phone calls and emails, and set reminders for future follow-ups.

**Live Demo:** [https://crm-lyart-seven.vercel.app](https://crm-lyart-seven.vercel.app)

---

## 🚀 Features at a Glance

### 1. 🔒 Secure Authentication
* **Sign Up & Login:** Create an account using email/password.
* **Forgot Password:** Secure email-based password reset flow.
* **Data Privacy:** Uses **Row Level Security (RLS)**. This means User A cannot see User B's customers. Your data is 100% private to you.

### 2. 👥 Customer Management
* **Profiles:** Add, Edit, and Delete customer details (Name, Email, Phone, Status).
* **Smart Search:** Instantly filter your list by typing a name or email.
* **Status Tracking:** Visual badges for **Lead** (Blue), **Active** (Green), and **Closed** (Grey).

### 3. 📅 Interactions & Reminders
* **History:** Log every call, meeting, or email.
* **Notes:** Keep detailed notes on what was discussed.
* **Follow-ups:** Set a future date for a follow-up. These automatically appear on your Dashboard when due.

### 4. 📊 Dashboard
* **Stats:** See total customers, active leads, and closed deals at a glance.
* **Upcoming Tasks:** A widget showing exactly who you need to contact next.

---

## 🛠️ Tech Stack

* **Frontend:** React 18 + Vite (Fast & Lightweight)
* **Language:** TypeScript (Fewer bugs)
* **Styling:** Tailwind CSS (Clean, modern UI)
* **Backend:** Supabase (PostgreSQL Database + Auth)
* **Icons:** Lucide React

---

## 📦 How to Run Locally

### 1. Prerequisites
* Node.js installed.
* A free [Supabase](https://supabase.com/) account.

### 2. Clone the Project
```bash
git clone [https://github.com/varshanth-c/CRM.git](https://github.com/varshanth-c/CRM.git)
cd simple-crm
npm install
3. Database Setup (Supabase)
Create a new project in Supabase.

Go to the SQL Editor (icon on the left).

Copy and Run this script to build the database:

SQL

-- 1. Create Tables
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  phone text,
  status text check (status in ('Lead', 'Active', 'Closed')) default 'Lead',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table interactions (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers on delete cascade not null,
  user_id uuid references auth.users not null,
  type text check (type in ('call', 'meeting', 'email')),
  notes text,
  interaction_date timestamp with time zone default timezone('utc'::text, now()) not null,
  follow_up_date timestamp with time zone
);

-- 2. Enable Security (RLS)
alter table profiles enable row level security;
alter table customers enable row level security;
alter table interactions enable row level security;

-- 3. Create Security Policies (Private Data)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can manage own customers" on customers for all using (auth.uid() = user_id);
create policy "Users can manage own interactions" on interactions for all using (auth.uid() = user_id);

-- 4. Auto-create Profile on Signup
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
4. Connect the App
Create a file named .env in the root folder and add your keys (found in Supabase Settings > API):

Code snippet

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
5. Start the App
Bash

npm run dev
Open http://localhost:5173 to see it working!

🧪 How to Add Test Data
Want to see the dashboard fill up instantly? Run this script in your Supabase SQL Editor after you sign up in the app:

SQL

-- Adds 5 dummy customers and interactions to your account
DO $$
DECLARE
  my_uid uuid;
  cid uuid;
BEGIN
  SELECT id INTO my_uid FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  -- Add a Lead
  INSERT INTO customers (user_id, name, email, status)
  VALUES (my_uid, 'Sarah Miller', 'sarah@demo.com', 'Active') RETURNING id INTO cid;
  
  -- Add a Follow-up for tomorrow
  INSERT INTO interactions (customer_id, user_id, type, notes, follow_up_date)
  VALUES (cid, my_uid, 'call', 'Initial onboarding call.', NOW() + INTERVAL '1 day');
END $$;
📂 Project Structure
src/
├── components/       # Layout, ProtectedRoute, Navbar
├── contexts/         # AuthContext (Manages login state)
├── lib/              # Supabase connection setup
├── pages/            # All screens
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ForgotPassword.tsx  # <--- Request Reset Link
│   ├── UpdatePassword.tsx  # <--- Enter New Password
│   ├── Dashboard.tsx       # <--- Stats & Follow-ups
│   ├── Customers.tsx       # <--- Search & List
│   └── CustomerDetail.tsx  # <--- Timeline & Notes
├── types/            # Database Type Definitions
└── App.tsx           # Routing & Navigation logic
🚢 Deployment (Vercel)
If you deploy this, you might see a "404 Not Found" error when refreshing pages. To fix this, ensure you have a vercel.json file in your root folder:

JSON

{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}