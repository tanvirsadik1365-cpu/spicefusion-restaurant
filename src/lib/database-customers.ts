import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type RequestUser = {
  email?: string | null;
  id: string;
};

type DbError = {
  message: string;
};

function getDbErrorMessage(action: string, error?: DbError | null) {
  return `${action}: ${error?.message ?? "Unknown database error."}`;
}

export async function getRequestUser(accessToken?: string | null) {
  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return {
    email: data.user.email,
    id: data.user.id,
  } satisfies RequestUser;
}

export async function saveCustomerProfile({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone: string;
}) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existingCustomer, error: selectError } = await supabase
    .from("customers")
    .select("id")
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw new Error(
      getDbErrorMessage("Customer profile could not be loaded", selectError),
    );
  }

  if (existingCustomer) {
    const { error } = await supabase
      .from("customers")
      .update({
        email: normalizedEmail,
        name,
        phone,
      })
      .eq("id", existingCustomer.id);

    if (error) {
      throw new Error(
        getDbErrorMessage("Customer profile could not be updated", error),
      );
    }

    return existingCustomer.id as string;
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      email: normalizedEmail,
      name,
      phone,
    })
    .select("id")
    .single();

  if (error || !customer) {
    throw new Error(
      getDbErrorMessage("Customer profile could not be saved", error),
    );
  }

  return customer.id as string;
}
