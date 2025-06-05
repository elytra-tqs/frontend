import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useCars } from "@/contexts/CarsContext"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  batteryCapacity: z.string().min(1, "Battery capacity is required"),
  chargerType: z.string().min(1, "Charger type is required"),
})

export function AddCarPage() {
  const { addCar, loading, error } = useCars();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      licensePlate: "",
      batteryCapacity: "",
      chargerType: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      await addCar({
        ...values,
        batteryCapacity: parseFloat(values.batteryCapacity)
      });
      // Navigate back to EVDriver page after successful submission
      navigate("/evdriver");
    } catch (error) {
      console.error("Failed to add car:", error);
      // Error is handled by the context and displayed via the error state
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter car model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter license plate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batteryCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Battery Capacity (kWh)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter battery capacity"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chargerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Charger Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select charger type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="type1">Type 1 (J1772)</SelectItem>
                      <SelectItem value="type2">Type 2 (Mennekes)</SelectItem>
                      <SelectItem value="ccs">CCS</SelectItem>
                      <SelectItem value="chademo">CHAdeMO</SelectItem>
                      <SelectItem value="tesla">Tesla</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Adding..." : "Add Car"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  )
} 