export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contract_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          template_type: "Locação" | "Venda"
          created_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          template_type?: "Locação" | "Venda"
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          template_type?: "Locação" | "Venda"
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contracts: {
        Row: {
          id: string
          numero: string
          tipo: "Locação" | "Venda"
          status: "Ativo" | "Pendente" | "Vencendo" | "Expirado" | "Cancelado"
          client_id: string | null
          client_name: string
          client_email: string | null
          client_phone: string | null
          client_cpf: string | null
          client_address: string | null
          client_nationality: string | null
          client_marital_status: string | null
          landlord_name: string | null
          landlord_email: string | null
          landlord_phone: string | null
          landlord_cpf: string | null
          landlord_address: string | null
          landlord_nationality: string | null
          landlord_marital_status: string | null
          guarantor_name: string | null
          guarantor_email: string | null
          guarantor_phone: string | null
          guarantor_cpf: string | null
          guarantor_address: string | null
          guarantor_nationality: string | null
          guarantor_marital_status: string | null
          property_id: string | null
          property_title: string
          property_address: string
          property_type: string | null
          property_area: number | null
          property_city: string | null
          property_state: string | null
          property_zip_code: string | null
          template_id: string | null
          template_name: string
          valor: number
          data_inicio: string
          data_fim: string
          data_assinatura: string | null
          proximo_vencimento: string | null
          contract_duration: string | null
          payment_day: string | null
          payment_method: string | null
          contract_city: string | null
          contract_file_path: string | null
          contract_file_name: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          numero: string
          tipo: "Locação" | "Venda"
          status?: "Ativo" | "Pendente" | "Vencendo" | "Expirado" | "Cancelado"
          client_id?: string | null
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          client_cpf?: string | null
          client_address?: string | null
          client_nationality?: string | null
          client_marital_status?: string | null
          landlord_name?: string | null
          landlord_email?: string | null
          landlord_phone?: string | null
          landlord_cpf?: string | null
          landlord_address?: string | null
          landlord_nationality?: string | null
          landlord_marital_status?: string | null
          guarantor_name?: string | null
          guarantor_email?: string | null
          guarantor_phone?: string | null
          guarantor_cpf?: string | null
          guarantor_address?: string | null
          guarantor_nationality?: string | null
          guarantor_marital_status?: string | null
          property_id?: string | null
          property_title: string
          property_address: string
          property_type?: string | null
          property_area?: number | null
          property_city?: string | null
          property_state?: string | null
          property_zip_code?: string | null
          template_id?: string | null
          template_name: string
          valor: number
          data_inicio: string
          data_fim: string
          data_assinatura?: string | null
          proximo_vencimento?: string | null
          contract_duration?: string | null
          payment_day?: string | null
          payment_method?: string | null
          contract_city?: string | null
          contract_file_path?: string | null
          contract_file_name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          numero?: string
          tipo?: "Locação" | "Venda"
          status?: "Ativo" | "Pendente" | "Vencendo" | "Expirado" | "Cancelado"
          client_id?: string | null
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          client_cpf?: string | null
          client_address?: string | null
          client_nationality?: string | null
          client_marital_status?: string | null
          landlord_name?: string | null
          landlord_email?: string | null
          landlord_phone?: string | null
          landlord_cpf?: string | null
          landlord_address?: string | null
          landlord_nationality?: string | null
          landlord_marital_status?: string | null
          guarantor_name?: string | null
          guarantor_email?: string | null
          guarantor_phone?: string | null
          guarantor_cpf?: string | null
          guarantor_address?: string | null
          guarantor_nationality?: string | null
          guarantor_marital_status?: string | null
          property_id?: string | null
          property_title?: string
          property_address?: string
          property_type?: string | null
          property_area?: number | null
          property_city?: string | null
          property_state?: string | null
          property_zip_code?: string | null
          template_id?: string | null
          template_name?: string
          valor?: number
          data_inicio?: string
          data_fim?: string
          data_assinatura?: string | null
          proximo_vencimento?: string | null
          contract_duration?: string | null
          payment_day?: string | null
          payment_method?: string | null
          contract_city?: string | null
          contract_file_path?: string | null
          contract_file_name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          property_id: string
          source: string
          stage: string
          interest: string
          estimated_value: number
          notes: string
          updated_at: string
          cpf: string | null
          endereco: string | null
          estado_civil: string | null
          imovel_interesse: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name: string
          phone?: string
          property_id?: string
          source: string
          stage?: string
          interest?: string
          estimated_value?: number
          notes?: string
          updated_at?: string
          cpf?: string | null
          endereco?: string | null
          estado_civil?: string | null
          imovel_interesse?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          property_id?: string
          source?: string
          stage?: string
          interest?: string
          estimated_value?: number
          notes?: string
          updated_at?: string
          cpf?: string | null
          endereco?: string | null
          estado_civil?: string | null
          imovel_interesse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      properties: {
        Row: {
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          created_at: string
          description: string
          id: string
          price: number
          type: string
          city: string
          state: string
          status: string
          title: string
          updated_at: string
          property_purpose: "Aluguel" | "Venda"
          proprietario_nome: string | null
          proprietario_estado_civil: string | null
          proprietario_cpf: string | null
          proprietario_endereco: string | null
          proprietario_email: string | null
        }
        Insert: {
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          created_at?: string
          description: string
          id?: string
          price: number
          type: string
          city: string
          state: string
          status: string
          title: string
          updated_at?: string
          property_purpose?: "Aluguel" | "Venda"
          proprietario_nome?: string | null
          proprietario_estado_civil?: string | null
          proprietario_cpf?: string | null
          proprietario_endereco?: string | null
          proprietario_email?: string | null
        }
        Update: {
          address?: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          description?: string
          id?: string
          price?: number
          type?: string
          city?: string
          state?: string
          status?: string
          title?: string
          updated_at?: string
          property_purpose?: "Aluguel" | "Venda"
          proprietario_nome?: string | null
          proprietario_estado_civil?: string | null
          proprietario_cpf?: string | null
          proprietario_endereco?: string | null
          proprietario_email?: string | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          property_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          property_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_instances: {
        Row: {
          id: string
          user_id: string
          instance_name: string
          phone_number: string | null
          profile_name: string | null
          profile_pic_url: string | null
          status: 'connected' | 'disconnected' | 'connecting' | 'qr_code' | 'error'
          webhook_url: string | null
          api_key: string | null
          last_seen: string | null
          message_count: number
          contact_count: number
          chat_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instance_name: string
          phone_number?: string | null
          profile_name?: string | null
          profile_pic_url?: string | null
          status?: 'connected' | 'disconnected' | 'connecting' | 'qr_code' | 'error'
          webhook_url?: string | null
          api_key?: string | null
          last_seen?: string | null
          message_count?: number
          contact_count?: number
          chat_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          instance_name?: string
          phone_number?: string | null
          profile_name?: string | null
          profile_pic_url?: string | null
          status?: 'connected' | 'disconnected' | 'connecting' | 'qr_code' | 'error'
          webhook_url?: string | null
          api_key?: string | null
          last_seen?: string | null
          message_count?: number
          contact_count?: number
          chat_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_chats: {
        Row: {
          id: string
          instance_id: string
          user_id: string
          contact_phone: string
          contact_name: string | null
          contact_avatar: string | null
          last_message: string | null
          last_message_time: string | null
          unread_count: number
          is_archived: boolean
          tags: string[] | null
          lead_id: string | null
          property_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instance_id: string
          user_id: string
          contact_phone: string
          contact_name?: string | null
          contact_avatar?: string | null
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number
          is_archived?: boolean
          tags?: string[] | null
          lead_id?: string | null
          property_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instance_id?: string
          user_id?: string
          contact_phone?: string
          contact_name?: string | null
          contact_avatar?: string | null
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number
          is_archived?: boolean
          tags?: string[] | null
          lead_id?: string | null
          property_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_chats_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_messages: {
        Row: {
          id: string
          chat_id: string
          instance_id: string
          user_id: string
          message_id: string | null
          from_me: boolean
          contact_phone: string | null
          message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
          content: string | null
          media_url: string | null
          caption: string | null
          timestamp: string
          read_at: string | null
          delivered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          instance_id: string
          user_id: string
          message_id?: string | null
          from_me?: boolean
          contact_phone?: string | null
          message_type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
          content?: string | null
          media_url?: string | null
          caption?: string | null
          timestamp?: string
          read_at?: string | null
          delivered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          instance_id?: string
          user_id?: string
          message_id?: string | null
          from_me?: boolean
          contact_phone?: string | null
          message_type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
          content?: string | null
          media_url?: string | null
          caption?: string | null
          timestamp?: string
          read_at?: string | null
          delivered_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contract_status: "Ativo" | "Pendente" | "Vencendo" | "Expirado" | "Cancelado"
      contract_type: "Locação" | "Venda"
      lead_stage: "Novo Lead" | "Qualificado" | "Visita Agendada" | "Em Negociação" | "Documentação" | "Contrato" | "Fechamento"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      property_status: ["available", "sold", "rented"],
      property_type: ["house", "apartment", "commercial", "land"],
    },
  },
} as const
