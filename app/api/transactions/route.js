import { NextResponse } from "next/server";
import { supabase, uploadFile, getFileUrl } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { type, amount, category_id, date, description, receipt_image } = body;
    
    // Validate the required fields
    // category_id and receipt_image are optional
    if (!type || !amount || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields: type, amount, description, and date are required." },
        { status: 400 }
      );
    }
    
    // Prepare transaction data
    const transactionData = {
      type,
      amount: parseFloat(amount), // Ensure amount is a number
      date,
      description: description || "", 
    };

    // Add optional fields if they exist
    if (category_id) {
      transactionData.category_id = category_id;
    }
    if (receipt_image) {
      transactionData.receipt_image = receipt_image; // this is the URL from the client
    }
    
    // Insert transaction into database
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select();
    
    if (error) {
      console.error("Error inserting transaction:", error);
      // Check for specific Supabase errors if needed, e.g., foreign key violation for category_id
      if (error.code === '23503' && error.details.includes('category_id')) {
        return NextResponse.json(
          { error: "Invalid category_id provided." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    if (error instanceof SyntaxError) { // Handle JSON parsing errors
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
