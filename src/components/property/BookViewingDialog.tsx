import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Product } from '@/data/static-cms'
import { BookViewingForm } from '@/components/property/BookViewingForm'

type BookViewingDialogProps = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookViewingDialog({ product, open, onOpenChange }: BookViewingDialogProps) {
  function handleOpenChange(next: boolean) {
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-md sm:p-5">
        <DialogHeader>
          <DialogTitle>Book a viewing</DialogTitle>
          <p className="text-sm text-muted">{product.name}</p>
          {product.propertyReference ? (
            <p className="text-xs text-muted">Ref: {product.propertyReference}</p>
          ) : null}
        </DialogHeader>

        {open ? (
          <BookViewingForm
            product={product}
            onSuccess={() => handleOpenChange(false)}
            onCancel={() => handleOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
