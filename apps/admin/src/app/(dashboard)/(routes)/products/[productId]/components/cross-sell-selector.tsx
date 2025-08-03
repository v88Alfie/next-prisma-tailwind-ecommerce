import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Product } from '@prisma/client'
import { Plus, X } from 'lucide-react'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'

interface CrossSellSelectorProps {
   value: string[]
   onChange: (value: string[]) => void
   preload?: Product[]
}

export const CrossSellSelector: React.FC<CrossSellSelectorProps> = ({ value, onChange, preload }) => {
   const [search, setSearch] = useState('')
   const [results, setResults] = useState<Product[]>([])
   const [loading, setLoading] = useState(false)
   const [selectedProduct, setSelectedProduct] = useState<Map<string, Product>>(new Map())

   useEffect(() => {
      const preloadMap = new Map(preload?.map(product => [product.id, product]))

      setSelectedProduct(preloadMap)
    }, [preload])

   useEffect(() => {
      const delayDebounce = setTimeout(() => {
        if (!search.trim()) {
          setResults([])

          return
        }
  
        setLoading(true)

        fetch(`/api/products?search=${encodeURIComponent(search)}`)
            .then(res => res.json())
            .then(data => setResults(data))
            .catch(console.error)
            .finally(() => setLoading(false))
      }, 400)
  
      return () => clearTimeout(delayDebounce)
    }, [search])

   const addProduct = (product: Product) => {
      if (!value.includes(product.id)) {
         onChange([...value, product.id])
         setSelectedProduct(prev => new Map(prev.set(product.id, product)))
         setSearch("")
      }
   }

   const removeProduct = (id: string) => {
      onChange(value.filter(productId => productId !== id))
   }

   return (
      <div className="space-y-2">
         <div className="flex w-full gap-2">
            <Input
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search products..."
            />
         </div>
         {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
         <div className="space-y-1">
            {results?.map((product) => (
               <div className='flex gap-4'>
                  <Card key={product.id} className="relative w-[30%]">
                     <CardContent className="p-4 space-y-2">
                        <div className="relative w-full h-32 overflow-hidden bg-gray-100 rounded">
                           {product?.images?.length ? (
                              <Image
                                 src={product?.images[0]}
                                 alt={product.title}
                                 fill
                                 style={{ objectFit: 'contain' }}
                              />
                           ) : (
                              <div className="flex items-center justify-center w-full h-full text-sm text-gray-400">
                                 No Image
                              </div>
                           )}
                        </div>
                        <div className="text-sm font-semibold truncate">{product.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                           {product.description || 'No description'}
                        </div>
                        <div className="text-sm font-medium text-primary">${product.price.toFixed(2)}</div>
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addProduct(product)}>
                           Add Product
                        </Button>
                     </CardContent>

                  </Card>
               </div>
            ))}
         </div>

         {value.length > 0 && (
            <div className="mt-4 space-y-2">
               <p className="text-sm font-medium">Selected Products:</p>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {value.map(id => {
                  const product = selectedProduct.get(id)
                  if (!product) return null

                  return (
                     <Card key={id} className="relative">
                        <CardContent className="p-4 space-y-2">
                        <div className="relative w-full h-32 overflow-hidden bg-gray-100 rounded">
                           {product?.images?.length ? (
                              <Image
                                 src={product?.images[0]}
                                 alt={product.title}
                                 fill
                                 style={{ objectFit: 'contain' }}
                              />
                           ) : (
                              <div className="flex items-center justify-center w-full h-full text-sm text-gray-400">
                                 No Image
                              </div>
                           )}
                        </div>
                        <div className="text-sm font-semibold truncate">{product.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                           {product.description || 'No description'}
                        </div>
                        <div className="text-sm font-medium text-primary">₱{product.price.toFixed(2)}</div>
                        <Button
                           type="button"
                           variant="destructive"
                           size="sm"
                           className="w-full"
                           onClick={() => removeProduct(id)}
                        >
                           Remove Product
                        </Button>
                        </CardContent>
                     </Card>
                  )
                  })}
               </div>
            </div>
         )}
      </div>
   )
}