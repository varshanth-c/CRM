

---

```markdown
# SimpleCRM - Minimalist Customer Relationship Manager

A lightweight, clean, and fast CRM built with **React (Vite)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Designed for freelancers and small businesses to manage leads, track interactions, and set follow-up reminders.

## 🚀 Features

* **Authentication:** Secure Sign Up, Login, and Logout (powered by Supabase Auth).
* **Dashboard:** Real-time overview of total customers, active leads, and upcoming follow-ups.
* **Customer Management:**
    * Add, Edit, and Delete customers.
    * **Instant Search:** Filter customers by name or email.
    * Status tracking (Lead, Active, Closed).
* **Interaction Logging:**
    * Log calls, emails, and meetings.
    * Write notes for every interaction.
    * **Follow-up System:** Set dates for future follow-ups and see them appear on your dashboard.
* **Security:** Row Level Security (RLS) ensures users can **only** access their own data.
* **UI/UX:** Fully responsive, minimalist design with white-label styling.

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Backend:** Supabase (PostgreSQL, Auth, Realtime)
* **Routing:** React Router DOM

---

## 📦 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* A free [Supabase](https://supabase.com/) account

### 1. Clone the Repository
```bash
git clone https://github.com/varshanth-c/CRM.git
cd simple-crm

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Supabase (Database Setup)

1. Go to your Supabase Dashboard and create a new project.
2. Go to the **SQL Editor** in Supabase.
3. Copy and paste the following SQL script to set up the Tables, Security, and Automation:

```sql
-- 1. Create Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Customers Table
create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  phone text,
  status text check (status in ('Lead', 'Active', 'Closed')) default 'Lead',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Interactions Table
create table interactions (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers on delete cascade not null,
  user_id uuid references auth.users not null,
  type text check (type in ('call', 'meeting', 'email')),
  notes text,
  interaction_date timestamp with time zone default timezone('utc'::text, now()) not null,
  follow_up_date timestamp with time zone
);

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table customers enable row level security;
alter table interactions enable row level security;

-- 5. Create Policies (Users see only their own data)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can manage own customers" on customers for all using (auth.uid() = user_id);
create policy "Users can manage own interactions" on interactions for all using (auth.uid() = user_id);

-- 6. Auto-create Profile on Signup Trigger
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

```

### 4. Environment Variables

Create a file named `.env` in the root of your project and add your Supabase keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 5. Run the App

```bash
npm run dev

```

Open `http://localhost:5173` in your browser.

---

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components (Layout, ProtectedRoute)
├── contexts/         # Global state (AuthContext)
├── hooks/            # Custom React hooks
├── lib/              # Supabase client configuration
├── pages/            # Main application pages
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Customers.tsx
│   └── CustomerDetail.tsx
├── types/            # TypeScript interfaces (Database types)
└── App.tsx           # Main router setup

```

## 🚢 Deployment

The easiest way to deploy this app is using **Vercel** or **Netlify**.

1. Push your code to GitHub.
2. Import the repository into Vercel/Netlify.
3. **Important:** Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the deployment settings (Environment Variables).
4. Deploy!



```

```
