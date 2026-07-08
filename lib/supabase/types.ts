// Hand-written types mirroring supabase/migrations/0001_schema.sql.
// Regenerate with `supabase gen types typescript --local > lib/supabase/types.ts`
// once you have a running Supabase instance (local or hosted) — this
// sandbox could not run `supabase start` (Docker registry access is
// blocked), so these were written to match the SQL by hand instead.
//
// Shape must satisfy supabase-js's GenericSchema constraint: each table
// needs Row/Insert/Update/Relationships, and the schema needs
// Tables/Views/Functions — otherwise every query resolves to `never`.

export type Role = "admin" | "master";
export type OrderStatus = "scheduled" | "done" | "paid";
export type CalculatorCategory = "size" | "style" | "color_complexity";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          display_name: string | null;
          business_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: Role;
          display_name?: string | null;
          business_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Role;
          display_name?: string | null;
          business_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      master_settings: {
        Row: {
          master_id: string;
          hourly_rate: number;
          currency: string;
          min_price: number;
          updated_at: string;
        };
        Insert: {
          master_id: string;
          hourly_rate?: number;
          currency?: string;
          min_price?: number;
          updated_at?: string;
        };
        Update: {
          master_id?: string;
          hourly_rate?: number;
          currency?: string;
          min_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "master_settings_master_id_fkey";
            columns: ["master_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      calculator_options: {
        Row: {
          id: string;
          master_id: string;
          category: CalculatorCategory;
          label: string;
          multiplier: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          master_id: string;
          category: CalculatorCategory;
          label: string;
          multiplier?: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          master_id?: string;
          category?: CalculatorCategory;
          label?: string;
          multiplier?: number;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "calculator_options_master_id_fkey";
            columns: ["master_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          id: string;
          master_id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          instagram: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          master_id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_master_id_fkey";
            columns: ["master_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_items: {
        Row: {
          id: string;
          master_id: string;
          storage_path: string;
          title: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          storage_path: string;
          title?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          master_id?: string;
          storage_path?: string;
          title?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_items_master_id_fkey";
            columns: ["master_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      calculations: {
        Row: {
          id: string;
          master_id: string;
          client_id: string | null;
          hours: number;
          size_label: string | null;
          size_multiplier: number;
          style_label: string | null;
          style_multiplier: number;
          color_label: string | null;
          color_multiplier: number;
          hourly_rate_snapshot: number;
          computed_price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          client_id?: string | null;
          hours: number;
          size_label?: string | null;
          size_multiplier?: number;
          style_label?: string | null;
          style_multiplier?: number;
          color_label?: string | null;
          color_multiplier?: number;
          hourly_rate_snapshot: number;
          computed_price: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          master_id?: string;
          client_id?: string | null;
          hours?: number;
          size_label?: string | null;
          size_multiplier?: number;
          style_label?: string | null;
          style_multiplier?: number;
          color_label?: string | null;
          color_multiplier?: number;
          hourly_rate_snapshot?: number;
          computed_price?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calculations_master_id_fkey";
            columns: ["master_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calculations_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          master_id: string;
          client_id: string;
          calculation_id: string | null;
          title: string;
          description: string | null;
          status: OrderStatus;
          price: number | null;
          scheduled_at: string | null;
          completed_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          client_id: string;
          calculation_id?: string | null;
          title: string;
          description?: string | null;
          status?: OrderStatus;
          price?: number | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          master_id?: string;
          client_id?: string;
          calculation_id?: string | null;
          title?: string;
          description?: string | null;
          status?: OrderStatus;
          price?: number | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_master_id_fkey";
            columns: ["master_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_calculation_id_fkey";
            columns: ["calculation_id"];
            referencedRelation: "calculations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
