<div align="center"><h3>Developer Assessment Test: ProductFiltering, Admin Reporting, and Prisma Model Extension</p></div>
<div align="center"><h3>Full-Stack E-Commerce Platform</h3><p>Built using Typescript with Next.js, Prisma ORM and TailwindCSS.</p></div>
<div align="center"><h3>This test is designed to evaluate my ability to integrate filtering and ordering on the frontend, extend backend database models, and enhance user experience by incorporating interactive suggestions and feedback mechanisms—all within a modern Next.js framework</p></div>


## 🏃‍♂️ Getting Started Locally

Clone the repository.

```bash
git clone https://github.com/v88Alfie/next-prisma-tailwind-ecommerce.git
```

Navigate to each folder in the `apps` folder and and set the variables.

```sh
cd apps/storefront
cp .env.example .env
```

```sh
cd apps/admin
cp .env.example .env
```

Get all dependencies sorted.

```sh
bun install
```

If you don't have bun installed on your local machine, you can check the installation guide here.
[Bun Installation](https://bun.com/docs/installation)

## 🔑 Database

Prisma ORM can use any PostgreSQL database. [Supabase is the easiest to work with.](https://www.prisma.io/docs/guides/database/supabase) Simply set `DATABASE_URL` in your `.env` file to work.

Create and login an account in [Supabase](https://supabase.com/)
Start your project, then 'New Project'
- Create Project Name
- Setup password
- Connect your projectm select the 'ORM' tab and copy the `Direct connection to the database. Used for migrations` and paste in your `DATABASE_URL` in your `.env`

You can check Prisma Database Guide here [Prisma](https://supabase.com/docs/guides/database/prisma)

-  After setting up your DATABASE_URL in .env file

-  In both folder `admin` and `storefront`
```sh
bun run db:push
```


- Populate data in admin
```sh
bun run db:seed
```

- Run the project
```sh
cd apps/admin
bun run dev
```
```sh
cd apps/storefront
bun run dev
```

## Part 1: Rebuild the Product Page Filter

- Go to [Products Page](http://localhost:7777/products) <br>
Note: Here, I'm receiving react-hydration-error. However, the products page's features and functionalities continue to function.

- I notice that category and brand filter has some errors. So I update its UI component and also overwrite its other UI dependencies.
- Created a `SearchProductInput` function that shows an input. Implement setting and deleting of searchParams similar to what is implemented in other functions. I used a debounced controlled input to delay updates until the user stops typing. This is efficient and user-friendly as the user don't need to click a button or press an enter just to search a keyword to filter products.
- Created a `PriceRangeSlider` function that shows a slider of price range to filter product prices. Similar to other functions on setting up searchParams. I decided to use a slider to as it is easy to adjust minimum and maximum price values. I used a ‘Go’ button to manually trigger the update.
- I set the price range 0-500 due to few product data, But my plan is to make it dynamic depends on filtered categories.
- I update the `CategoriesCombobox` function to multi-select. Did the same approach in setting up searchParams. Since the categories are now an array. I changed the `contains` to `in` in querying products to filter products that matches value within the given categories. Additionally, I modified the button user interface so that it now just displays the two categories +(number) of categories that have been selected, rather displaying all categories.
- Added `Product Title A-Z` and `Product Title Z-A` sorting. Update the orderBy by title.
- Removed the `AvailableToggle` in the UI as it was not needed on required filters.
- To accommodate all updated filters, set the UI grid column to 5 on wide screens. Modify it accordingly on smaller devices. Check/Test for dark/light mode too.

## Part 2: Admin Reporting Page
- In this part, I am getting errors on implementing JWT and login feature. As the repository don't have detailed documentations on implementing login feature. I just update the `middleware.ts` for me to access some routes to implement this part.

- Go to `middleware.ts` in admin folder, temporarily comment out the following
  - `/products/:path*`
  - `/api/:path*`
  - Added another route for the Reports feature `/admin/reports/:path*`
- Create a admin/reports folders in (routes) to create a new ReportsPage.
- To make sure that the ReportsPage can only access by administrators, I can update and uncomment the `/admin/reports/:path*` in `middleware.ts`.
- Also add the Reports button on the main-nav for quick access in Reports page.
- Install and update needed UI components from shadcn.
- Reports Overview
  - Display the orders group by date in a bar chart so the administrator may see the orders reports fast and for easy visualization.
  - Display the top selling products in a table list with the total sold products as well as other details of the products.
- Filter Options for Reports
  - Date Range, implemented a `DateRangePicker` function that uses Calendar UI component from shadcn, implement setting searchParams like in the Part 1.
  - Implement Categories and Brand filters in ReportsPage like in storefront.
  - Creating a map from prisma orders data to store/set the date as key and the orders as value. Implement this to create data needed for a BarChart.
  - In order to get data of top selling products with filtering of dates, I fetch the data from orderItem, since orderItem has a relation to products. Then, I built a map to count how often each product was sold. Based on the information that has been entered into the database, I simply filter the products that have a sales value of more than 0, Implemented this in `ReportsPage` where I get the productIds and filter the count > 0. I fetched all detailed product info, and apply categories and brand filters as needed to dynamically updates the data. Finally formatted the data to populate the table.


## Part 3: Extend Prisma DB Model and Enhance Cross-Sell Functionality

**Subtask 3.1 Update Prisma DB Model to Support Cross-Sell Products**

- Update the Prisma DB Modal. added the crossSellProducts Product[] @relation("CrossSell", references: [id]) but getting an error, to find out that removing the references fixes it and Prisma will handle the many-to-many join table automatically.
- Added crossSell in `seed.ts` to populate crossSell products in Created Products.
  ```sh
  for (const product of createdProducts) {
         // Pick 1-3 other products to cross-sell (excluding self and available)
         const crossSellCandidates = createdProducts.filter(p => p.id !== product.id && p.isAvailable)
         const randomCrossSells = crossSellCandidates
            .sort(() => 0.5 - Math.random())
            .slice(0, getRandomIntInRange(1, 3))
         await prisma.product.update({
            where: { id: product.id },
            data: {
               crossSellProducts: {
                  connect: randomCrossSells.map(product => ({ id: product.id })),
               },
            },
         })
      }
  ```
- Make it random of 1-3 crossSell products per Product Item.
- I run a fresh data population for products after resetting the database.
  ```sh
    bun run db:reset
    bun run db:seed
  ```
**Subtask 3.2: Enhance Frontend for Cross-Sell Products and Improved Cart Feedback**

- Check for designs of other e-commerce site to get idea on implementing cross-sell/suggested products.
- Created a UI to display cross-sell products on Product Details page.
- Created a UI to display cross-sell products on Cart page.
- Ensure that all cross-sell suggestions are clickable by linking it to product detail page.
- Improved the cart feedback by a adding a toast notification when adding a product to cart from Product Details page.
- Fixed an issue encounterd in cart items.
  - Scenario: Added 3 products in cart. When removing the first product listed in the cart, the last product is removed.
- Update the API endpoint for creating a product. Implementing the product creation just like in `seed.ts`
  - Temporarily comment out the api authentication to test the API. In products `route.ts`, comment out on both GET and POST API.
  ```sh
    if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }
  ```
- Created a next cloudinary account to fix errors in Product creation. You can creat an account [here](https://next.cloudinary.dev/) and installation guide [here](https://next.cloudinary.dev/installation). Paste the `cloudinary_cloud_name` to your `env`.
- Created a new component in the `product-form` for the user to `search` for a product that the user wants to cross-sell.
- Make the search input behavior like the search in the Products page. I used a debounced controlled input to delay updates until the user stops typing. I updated the API end point to fetch products with filtering the product keyword. Just comment also the 
- The searched products will show with an add button. I also make a added cross-sell product an option to remove.
- I also noticed that I am still getting an error in uploading image using next-cloudinary. So I make all product related components with Images to show a 'No Image' if the product has no image instead of a displaying the alt of the image.
- Ensure nice UI and functionality on creating a product with a cross-sell product/s.

**Thank you for the opportunity to work through that. It was definitely a challenging task, but I enjoyed tackling it.**