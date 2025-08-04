import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
   try {
      const userId = req.headers.get('X-USER-ID')

      /* Commented Out, So that I can test the product creation */
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json();

      const { title, images, price, discount, stock, categoryId, brandName, isAvailable, crossSellProductIds } = body;

      await prisma.product.create({
         data: {
            isAvailable,
            title,
            price,
            stock,
            discount,
            brand: {
               connectOrCreate: {
                  where: {
                     title: brandName,
                  },
                  create: {
                     title: brandName,
                     description: 'Description of this brand.',
                     logo: 'https://cdn.logojoy.com/wp-content/uploads/20221122125557/morridge-coffee-vintage-logo-600x392.png',
                  },
               },
            },
            description: 'Description of this product.',
            images,
            keywords: [],
            categories: {
               connect: {
                  id: categoryId,
               },
            },
            crossSellProducts: {
               connect: crossSellProductIds.map(id => ({ id }))
            }
         },
         include: {
            categories: true,
         },
      })

      const products = await prisma.product.findMany()

      return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCTS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const isFeatured = searchParams.get('isFeatured')
      const search = searchParams.get('search')?.trim() || undefined

      if (!search) {
         return NextResponse.json([])
      }

      const products = await prisma.product.findMany({
         where: {
            title: {
               contains: search,
               mode: 'insensitive',
            },
            isAvailable: true, // show only available products
         },
         take: 10,
      })

      return NextResponse.json(products)
      
   } catch (error) {
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
