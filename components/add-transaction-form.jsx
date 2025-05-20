"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, CheckIcon, ChevronsUpDown, Upload, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { getSupabaseClient } from "@/lib/supabase"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Maximum file size (3MB)
const MAX_FILE_SIZE = 3 * 1024 * 1024
// Allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

export function AddTransactionForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [receiptImage, setReceiptImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const fileInputRef = useRef(null)

  // Initialize the form
  const form = useForm({
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      category_id: "",
      date: new Date(),
    },
  })

  // Get the current type value from the form
  const type = form.watch("type")

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to load categories")
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Filter categories based on selected type
  const filteredCategories = categories.filter((cat) => cat.type === type)

  // When type changes, reset the selected category
  useEffect(() => {
    form.setValue("category_id", "")
  }, [type, form])

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Reset previous errors
    setUploadError(null)

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "The receipt image must be less than 3MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      })
      return
    }

    setReceiptImage(file)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Clear selected image
  const clearImage = () => {
    setReceiptImage(null)
    setImagePreview(null)
    setUploadError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    try {
      setUploadError(null)
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `receipts/${fileName}`

      console.log("Uploading file:", filePath)
      setUploadProgress(10) // Start progress

      // Try to create the bucket if it doesn't exist (this might fail due to permissions)
      try {
        await supabase.storage.createBucket("transaction-receipts", {
          public: true,
          fileSizeLimit: 3000000, // 3MB
        })
      } catch (err) {
        console.log("Bucket might already exist or insufficient permissions:", err)
        // Continue anyway as the bucket might already exist
      }

      // Upload the file
      const { data, error } = await supabase.storage.from("transaction-receipts").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Changed to true to overwrite if file exists
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          console.log(`Upload progress: ${percent}%`)
          setUploadProgress(percent)
        },
      })

      if (error) {
        console.error("Upload error:", error)
        throw error
      }

      setUploadProgress(100) // Complete progress

      // Get the public URL
      const { data: urlData } = supabase.storage.from("transaction-receipts").getPublicUrl(filePath)

      console.log("Upload successful, URL:", urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError(error.message || "Failed to upload image")
      throw error
    }
  }

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      setUploadProgress(0)
      setUploadError(null)
      setDebugInfo(null)

      console.log("Form submission started with values:", values)
      let receiptImageUrl = null

      // Upload image if selected
      if (receiptImage) {
        console.log("Uploading receipt image...")
        try {
          receiptImageUrl = await uploadImage(receiptImage)
          console.log("Image uploaded successfully:", receiptImageUrl)
        } catch (error) {
          console.error("Image upload failed:", error)
          setUploadError(error.message || "Failed to upload image")
          toast({
            title: "Image Upload Failed",
            description: error.message || "Failed to upload receipt image. Please try again.",
            variant: "destructive",
          })
          setLoading(false)
          return // Stop form submission if image upload fails
        }
      }

      // Prepare transaction data
      const transactionData = {
        type: values.type,
        amount: Number.parseFloat(values.amount),
        description: values.description,
        date: format(values.date, "yyyy-MM-dd"),
      }

      // Only add category_id if it's selected
      if (values.category_id) {
        transactionData.category_id = values.category_id
      }

      // Only add receipt_image if it was uploaded
      if (receiptImageUrl) {
        transactionData.receipt_image = receiptImageUrl
      }

      console.log("Submitting transaction data:", transactionData)

      // Submit the transaction
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add transaction")
      }

      console.log("Transaction added successfully:", responseData)
      setDebugInfo("Transaction added successfully: " + JSON.stringify(responseData))

      toast({
        title: "Transaction added",
        description: "Your transaction has been successfully recorded.",
      })

      // Reset form
      form.reset({
        type: "expense",
        amount: "",
        description: "",
        category_id: "",
        date: new Date(),
      })
      clearImage()

      // Redirect to transactions page
      router.push("/transactions")
      router.refresh()
    } catch (error) {
      console.error("Error adding transaction:", error)
      setDebugInfo("Error: " + error.message)
      toast({
        title: "Error",
        description: `Failed to add transaction: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingCategories) {
    return <div className="py-10 text-center">Loading categories...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground/80">Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#2a2a3c] dark:bg-[#13131a]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-[#13131a] border-[#2a2a3c]">
                      <SelectItem value="income" className="hover:dark:bg-[#1c1c2a]">
                        Income
                      </SelectItem>
                      <SelectItem value="expense" className="hover:dark:bg-[#1c1c2a]">
                        Expense
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} required min="0.01" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="What was this transaction for?" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Category</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {field.value
                          ? filteredCategories.find((cat) => cat.id === Number.parseInt(field.value))?.name
                          : "Select category..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              value={cat.name}
                              onSelect={() => {
                                form.setValue("category_id", cat.id.toString())
                                setOpen(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === cat.id.toString() ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {cat.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Receipt Image Upload */}
          <FormItem className="space-y-2">
            <FormLabel>Receipt Image (Optional)</FormLabel>
            <div className="flex flex-col gap-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full max-w-md mx-auto">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[#2a2a3c]">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Receipt preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <p className="text-xs text-center mt-1">
                        {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : "Upload complete"}
                      </p>
                    </div>
                  )}

                  {uploadError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Upload Button */}
              {!imagePreview && (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="receipt-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer border-[#2a2a3c] bg-[#13131a] hover:bg-[#1c1c2a] transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">JPEG, PNG or WebP (MAX. 3MB)</p>
                    </div>
                    <input
                      id="receipt-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              )}
            </div>
          </FormItem>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 neon-glow"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Processing..."}
            </div>
          ) : (
            "Add Transaction"
          )}
        </Button>

        {/* Debug info - will be hidden in production */}
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-gray-300 overflow-auto max-h-32">
            <pre>{debugInfo}</pre>
          </div>
        )}
      </form>
    </Form>
  )
}
