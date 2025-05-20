import { NextResponse } from "next/server";
import { supabase, uploadFile, getFileUrl } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const type = formData.get("type");
    const amount = parseFloat(formData.get("amount"));
    const category = formData.get("category");
    const date = formData.get("date");
    const notes = formData.get("notes");
    const receiptImage = formData.get("receiptImage");
    
    // Validate the required fields
    if (!type || !amount || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Prepare transaction data
    const transactionData = {
      type,
      amount,
      category,
      date,
      notes: notes || "",
    };
    
    // Handle receipt image upload if provided
    if (receiptImage && receiptImage.size > 0) {
      const BUCKET_NAME = "transaction-receipts";
      const timestamp = Date.now();
      const fileExt = receiptImage.name.split(".").pop();
      const fileName = `${timestamp}-${uuidv4().substring(0, 12)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;
      
      try {
        console.log(`Uploading file to ${BUCKET_NAME}/${filePath}`);
        // Upload file to Supabase storage
        await uploadFile(BUCKET_NAME, filePath, receiptImage);
        
        // Get the public URL
        const receiptUrl = getFileUrl(BUCKET_NAME, filePath);
        console.log(`File uploaded successfully, URL: ${receiptUrl}`);
        transactionData.receipt_url = receiptUrl;
      } catch (error) {
        console.error("Error uploading receipt:", error);
        // Continue with transaction creation even if image upload fails
      }
    }
    
    // Insert transaction into database
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select();
    
    if (error) {
      console.error("Error inserting transaction:", error);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
