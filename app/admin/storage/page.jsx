import { BucketManager } from "@/components/bucket-manager"

export default function StorageAdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Storage Management</h1>
      <p className="text-muted-foreground">Manage storage buckets for receipt images and other files.</p>

      <div className="mt-4">
        <BucketManager />
      </div>
    </div>
  )
}
