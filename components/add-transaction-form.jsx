"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, CheckIcon, ChevronsUpDown } from "lucide-react"
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

export function AddTransactionForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)

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

  const onSubmit = async (values) => {
    setLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: values.type,
          amount: Number.parseFloat(values.amount),
          description: values.description,
          category_id: values.category_id,
          date: format(values.date, "yyyy-MM-dd"),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add transaction")
      }

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

      // Redirect to transactions page
      router.push("/transactions")
      router.refresh()
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
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
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 neon-glow"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  )
}
