export declare class SupabaseService {
    private readonly supabaseUrl;
    private readonly supabaseAnonKey;
    private readonly supabaseServiceRoleKey;
    constructor();
    createServerClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
    createAdminClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
}
