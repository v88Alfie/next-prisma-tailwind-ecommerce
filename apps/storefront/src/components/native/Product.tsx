import { ImageSkeleton } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
} from '@/components/ui/card'
import { ProductWithIncludes } from '@/types/prisma'
import Image from 'next/image'
import Link from 'next/link'

export const ProductGrid = ({
   products,
}: {
   products: ProductWithIncludes[]
}) => {
   return (
      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
         {products.map((product) => (
            <Product product={product} key={product.id} />
         ))}
      </div>
   )
}

export const ProductSkeletonGrid = () => {
   return (
      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
         {[...Array(12)].map(() => (
            <ProductSkeleton key={Math.random()} />
         ))}
      </div>
   )
}

export const Product = ({ product }: { product: ProductWithIncludes }) => {
   function Price() {
      if (product?.discount > 0) {
         const price = product?.price - product?.discount
         const percentage = (product?.discount / product?.price) * 100
         return (
            <div className="flex items-center gap-2">
               <Badge className="flex gap-4" variant="destructive">
                  <div className="line-through">${product?.price}</div>
                  <div>%{percentage.toFixed(2)}</div>
               </Badge>
               <h2 className="">${price.toFixed(2)}</h2>
            </div>
         )
      }

      return <h2>${product?.price}</h2>
   }

   return (
      <Link className="" href={`/products/${product.id}`}>
         <Card className="h-full">
            <CardHeader className="p-0">
               <div className="relative w-full h-60">
                  {
                     product?.images.length ? 
                        <Image
                           className="rounded-t-lg"
                           src={product?.images[0]}
                           alt="product image"
                           fill
                           sizes="(min-width: 1000px) 30vw, 50vw"
                           style={{ objectFit: 'cover' }}
                        />
                     :
                        <div className="flex items-center justify-center w-full h-full text-sm text-gray-400">
                           No Image
                        </div>
                  }
               </div>
            </CardHeader>
            <CardContent className="grid gap-1 p-4">
               <Badge variant="outline" className="w-min text-neutral-500">
                  {product?.categories[0]?.title}
               </Badge>

               <h2 className="mt-2">{product.title}</h2>
               <p className="text-xs text-justify text-neutral-500">
                  {product.description}
               </p>
            </CardContent>
            <CardFooter>
               {product?.isAvailable ? (
                  <Price />
               ) : (
                  <Badge variant="secondary">Out of stock</Badge>
               )}
            </CardFooter>
         </Card>
      </Link>
   )
}

export function ProductSkeleton() {
   return (
      <Link href="#">
         <div className="bg-white border rounded-lg animate-pulse border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="relative w-full h-full">
               <div className="flex items-center justify-center w-full h-40 rounded bg-neutral-300 dark:bg-neutral-700 ">
                  <ImageSkeleton />
               </div>
            </div>
            <div className="p-5">
               <div className="w-full">
                  <div className="mb-4 h-2.5 w-48 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[440px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[460px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="h-2 max-w-[360px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
               </div>
            </div>
         </div>
      </Link>
   )
}
