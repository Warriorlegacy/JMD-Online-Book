import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const defaultPaymentMethods = [
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54601",
    name: "UPI",
    type: "upi",
    details: { upi_id: "merchant@upi", display: "Scan QR and Pay" },
    is_active: true,
    for_deposit: true,
    for_withdraw: false,
    sort_order: 1,
    min_amount: 100,
    max_amount: 100000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54602",
    name: "PhonePe",
    type: "upi",
    details: { upi_id: "merchant@ybl", display: "PhonePe UPI" },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 2,
    min_amount: 100,
    max_amount: 50000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54603",
    name: "Google Pay",
    type: "upi",
    details: { upi_id: "merchant@okhdfcbank", display: "Google Pay UPI" },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 3,
    min_amount: 100,
    max_amount: 50000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54604",
    name: "Paytm",
    type: "upi",
    details: { upi_id: "merchant@paytm", display: "Paytm UPI" },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 4,
    min_amount: 100,
    max_amount: 50000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54605",
    name: "Bank Transfer (IMPS)",
    type: "bank",
    details: {
      bank_name: "HDFC Bank",
      account_number: "1234567890",
      ifsc_code: "HDFC0001234",
      account_holder: "Merchant Name",
      transfer_type: "IMPS"
    },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 5,
    min_amount: 500,
    max_amount: 100000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54606",
    name: "Bank Transfer (NEFT)",
    type: "bank",
    details: {
      bank_name: "ICICI Bank",
      account_number: "0987654321",
      ifsc_code: "ICIC0001234",
      account_holder: "Merchant Name",
      transfer_type: "NEFT"
    },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 6,
    min_amount: 1000,
    max_amount: 200000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54607",
    name: "Amazon Pay",
    type: "wallet",
    details: { wallet_id: "merchant@amazonpay", display: "Amazon Pay Wallet" },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 7,
    min_amount: 100,
    max_amount: 50000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54608",
    name: "Net Banking",
    type: "bank",
    details: {
      supported_banks: ["HDFC", "ICICI", "SBI", "Axis", "Kotak"],
      display: "Online Banking Transfer"
    },
    is_active: true,
    for_deposit: true,
    for_withdraw: false,
    sort_order: 8,
    min_amount: 500,
    max_amount: 100000,
    created_at: new Date().toISOString(),
  },
];

async function insertDefaultPaymentMethods() {
  try {
    console.log("Inserting default payment methods...");

    const { data, error } = await supabase
      .from("payment_methods")
      .upsert(defaultPaymentMethods, { onConflict: "id", ignoreDuplicates: false });

    if (error) {
      throw error;
    }

    console.log(`Successfully inserted/updated ${data?.length || defaultPaymentMethods.length} payment methods`);
    console.log("Default payment methods:", defaultPaymentMethods.map(pm => `${pm.name} (${pm.type}) - ₹${pm.min_amount} to ₹${pm.max_amount}`));

  } catch (error) {
    console.error("Error inserting payment methods:", error);
    process.exit(1);
  }
}

insertDefaultPaymentMethods();