export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          status: 'Lead' | 'Active' | 'Closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          email?: string | null
          phone?: string | null
          status?: 'Lead' | 'Active' | 'Closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          status?: 'Lead' | 'Active' | 'Closed'
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          customer_id: string
          user_id: string
          type: 'call' | 'meeting' | 'email'
          notes: string | null
          interaction_date: string
          follow_up_date: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          user_id?: string
          type: 'call' | 'meeting' | 'email'
          notes?: string | null
          interaction_date?: string
          follow_up_date?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          user_id?: string
          type?: 'call' | 'meeting' | 'email'
          notes?: string | null
          interaction_date?: string
          follow_up_date?: string | null
        }
      }
    }
  }
}