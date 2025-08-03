'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { cn, isVariableValid } from '@/lib/utils'
import { slugify } from '@persepolis/slugify'
import { Check, ChevronsUpDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function SearchProductInput({ initialSearch }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [value, setValue] = React.useState('')
   const [debouncedValue, setDebouncedValue] = React.useState('')

   useEffect(() => {
      if (isVariableValid(initialSearch)) setValue(initialSearch)
   }, [initialSearch])

   useEffect(() => {
      const timeout = setTimeout(() => {
         setDebouncedValue(value)
      }, 500)

      return () => clearTimeout(timeout);
   }, [value])

   useEffect(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      if (debouncedValue) {
         current.set('search', debouncedValue)
      } else {
         current.delete('search')
      }

      // cast to string
      const search = current.toString()
      // or const query = `${'?'.repeat(search.length && 1)}${search}`;
      const query = search ? `?${search}` : ''

      router.replace(`${pathname}${query}`, {
         scroll: false,
      })
   }, [debouncedValue])

   return (
      <Input
         type="text"
         placeholder="Search products..."
         value={value}
         onChange={(e) => setValue(e.target.value)}
         className="w-full focus-visible:ring-0"
      />
   )
}

type PriceRangeSliderProps = {
   initialPriceRange: [number, number]
}

export function PriceRangeSlider({ initialPriceRange }: PriceRangeSliderProps) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const DEFAULT_RANGE: [number, number] = [0, 500]

   const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_RANGE)

   useEffect(() => {
      if (
         Array.isArray(initialPriceRange) &&
         initialPriceRange.length === 2 &&
         !isNaN(initialPriceRange[0]) &&
         !isNaN(initialPriceRange[1])
      ) {
        setPriceRange(initialPriceRange)
      }
    }, [initialPriceRange])

   const handleApply = () => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      current.set('minPrice', priceRange[0].toString())
      current.set('maxPrice', priceRange[1].toString())
  
      const search = current.toString()
      const query = search ? `?${search}` : ''
  
      router.replace(`${pathname}${query}`, {
         scroll: false,
      })
   }

   return (
      <div className='flex justify-between'>
         <div className='flex flex-col w-[80%]'>
            <div className="flex justify-between text-[12px]">
               <span>${priceRange[0]}</span>
               <span>Price Range</span>
               <span>${priceRange[1]}</span>
            </div>
            <Slider
               min={0}
               max={500}
               step={10}
               value={priceRange}
               onValueChange={(val: [number, number]) => setPriceRange(val)}
               className="w-full"
            />
         </div>
         <Button variant='outline' onClick={handleApply}>Go</Button>
      </div>
    )
}

export function SortBy({ initialData }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [value, setValue] = React.useState('featured')

   useEffect(() => {
      if (isVariableValid(initialData)) setValue(initialData)
   }, [initialData])

   return (
      <Select
         onValueChange={(currentValue) => {
            const current = new URLSearchParams(
               Array.from(searchParams.entries())
            )

            if (currentValue === value) {
               current.delete('sort')  // Remove the `sort` parameter from the URL
               setValue('')            // Reset internal state (clears the selection)
            } else {
               current.set('sort', currentValue)
               setValue(currentValue)
            }

            // cast to string
            const search = current.toString()
            // or const query = `${'?'.repeat(search.length && 1)}${search}`;
            const query = search ? `?${search}` : ''

            router.replace(`${pathname}${query}`, {
               scroll: false,
            })
         }}
      >
         <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort By" />
         </SelectTrigger>
         <SelectContent>
            {/* <SelectItem value="featured">Featured</SelectItem> */}
            <SelectItem value="most_expensive">Most Expensive</SelectItem>
            <SelectItem value="least_expensive">Least Expensive</SelectItem>
            <SelectItem value="title_asc">Product Title (A-Z)</SelectItem>
            <SelectItem value="title_desc">Product Title (Z-A)</SelectItem>
         </SelectContent>
      </Select>
   )
}

export function CategoriesCombobox({ categories, initialCategory }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [open, setOpen] = React.useState(false)
   const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

   function getSelectedCategoryTitle() {
      const selected = categories.filter((category) =>
         selectedCategories.includes(slugify(category.title))
      );
    
      const categoryTitles = selected.map((category) => category.title);
    
      if (categoryTitles.length > 2) {
         const [first, second, ...rest] = categoryTitles;

         return `${first}, ${second}, +${rest.length} other${rest.length > 1 ? 's' : ''}`;
      }
    
      return categoryTitles.join(', ');
   }

   useEffect(() => {
      if (!initialCategory) return
      const initial = initialCategory.split(',').map((slug) => slug.trim())

      setSelectedCategories(initial)
   }, [initialCategory])

   function toggleCategorySelection(slug: string) {
      let updatedSelections = [...selectedCategories]
      if (selectedCategories.includes(slug)) {
         updatedSelections = updatedSelections.filter((s) => s !== slug)
      } else {
         updatedSelections.push(slug)
      }

      setSelectedCategories(updatedSelections)

      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (updatedSelections.length === 0) {
         current.delete('category')
      } else {
         current.set('category', updatedSelections.join(','))
      }

      const search = current.toString()
      const query = search ? `?${search}` : ''
      router.replace(`${pathname}${query}`, { scroll: false })
   }

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="justify-between w-full"
            >
               {selectedCategories.length > 0
                  ? getSelectedCategoryTitle()
                  : 'Select categories...'}
               <ChevronsUpDown className="h-4 ml-2 opacity-50 shrink-0" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command>
               <CommandInput placeholder="Search categories..." />
               <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                     {categories.map((category) => {
                        const slug = slugify(category.title)
                        const isSelected = selectedCategories.includes(slug)

                        return (
                           <CommandItem
                              key={category.title}
                              onSelect={() => {
                                 toggleCategorySelection(slug)
                              }}
                           >
                              <Check
                                 className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                 )}
                              />
                              {category.title}
                           </CommandItem>
                        )
                     })}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   )
}

export function BrandCombobox({ brands, initialBrand }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [open, setOpen] = React.useState(false)
   const [value, setValue] = React.useState('')

   function getBrandTitle() {
      for (const brand of brands) {
         if (slugify(brand.title) === slugify(value)) return brand.title
      }
   }

   useEffect(() => {
      setValue(initialBrand)
   }, [initialBrand])

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="justify-between w-full"
            >
               {value ? getBrandTitle() : 'Select brand...'}
               <ChevronsUpDown className="h-4 ml-2 opacity-50 shrink-0" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command>
               <CommandInput placeholder="Search brand..." />
               <CommandList>
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandGroup>
                     {brands.map((brand) => (
                        <CommandItem
                           key={brand.title}
                           onSelect={(currentValue) => {
                              const current = new URLSearchParams(
                                 Array.from(searchParams.entries())
                              )

                              if (currentValue === value) {
                                 current.delete('brand')
                                 setValue('')
                              } else {
                                 current.set('brand', currentValue)
                                 setValue(currentValue)
                              }

                              // cast to string
                              const search = current.toString()
                              // or const query = `${'?'.repeat(search.length && 1)}${search}`;
                              const query = search ? `?${search}` : ''

                              router.replace(`${pathname}${query}`, {
                                 scroll: false,
                              })

                              setOpen(false)
                           }}
                        >
                           <Check
                              className={cn(
                                 'mr-2 h-4',
                                 value === brand.title
                                    ? 'opacity-100'
                                    : 'opacity-0'
                              )}
                           />
                           {brand.title}
                        </CommandItem>
                     ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   )
}

export function AvailableToggle({ initialData }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [value, setValue] = React.useState(false)

   useEffect(() => {
      setValue(initialData === 'true' ? true : false)
   }, [initialData])

   return (
      <div className="flex items-center w-full space-x-2 border rounded-md">
         <div className="flex items-center gap-2 mx-auto">
            <Switch
               checked={value}
               onCheckedChange={(currentValue: boolean) => {
                  const current = new URLSearchParams(
                     Array.from(searchParams.entries())
                  )

                  current.set(
                     'isAvailable',
                     currentValue == true ? 'true' : 'false'
                  )
                  setValue(currentValue)

                  // cast to string
                  const search = current.toString()
                  // or const query = `${'?'.repeat(search.length && 1)}${search}`;
                  const query = search ? `?${search}` : ''

                  router.replace(`${pathname}${query}`, {
                     scroll: false,
                  })
               }}
               id="available"
            />
            <Label htmlFor="available">Only Available</Label>
         </div>
      </div>
   )
}
