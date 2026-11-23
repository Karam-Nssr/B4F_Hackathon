import { createConnection, type HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserSchema,
  type UserRole,
} from '../users/schemas/user.schema.js';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';

type DemoAccount = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  nationalId?: string;
};

type ProductSetKey =
  | 'pantry'
  | 'personalCare'
  | 'spices'
  | 'textiles'
  | 'home'
  | 'crafts'
  | 'coffee'
  | 'sweets'
  | 'produce'
  | 'leather';

type DemoProductTemplate = {
  title: string;
  priceSyp: number;
  category?: string;
  description?: string;
  imageUrl?: string;
};

type DemoProductSet = {
  category: string;
  description: string;
  images: string[];
  products: DemoProductTemplate[];
};

type DemoShop = {
  ownerName: string;
  shopName: string;
  category: string;
  description: string;
  imageUrl: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  productSet: ProductSetKey;
};

function pexelsImage(photoId: number): string {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
}

const productSets: Record<ProductSetKey, DemoProductSet> = {
  pantry: {
    category: 'Groceries',
    description:
      'A carefully selected pantry staple from Syrian growers and makers.',
    images: [
      pexelsImage(25745506),
      pexelsImage(7296399),
      pexelsImage(32281630),
      pexelsImage(34561170),
      pexelsImage(7420513),
      pexelsImage(11135641),
    ],
    products: [
      {
        title: 'Aleppo Olive Oil',
        priceSyp: 45000,
        description: 'Cold-pressed olive oil from family groves near Aleppo.',
        imageUrl:
          'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Bottle_of_olive_oil.jpg/960px-Bottle_of_olive_oil.jpg',
      },
      {
        title: 'Traditional Soap Set',
        priceSyp: 28000,
        category: 'Personal Care',
        description:
          'Hand-cut Aleppo laurel soap bars made with olive oil and laurel oil.',
        imageUrl:
          'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Bars_of_pure_Marseille_and_Aleppo_soap%2C_2024.jpg/960px-Bars_of_pure_Marseille_and_Aleppo_soap%2C_2024.jpg',
      },
      {
        title: 'Embroidered Cushion',
        priceSyp: 65000,
        category: 'Home Decor',
        description:
          'A cushion cover finished with traditional Syrian embroidery.',
        imageUrl:
          'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Cushion_Cover_MET_3863.jpg/960px-Cushion_Cover_MET_3863.jpg',
      },
      {
        title: 'Green Za’atar Blend',
        priceSyp: 12000,
        imageUrl: pexelsImage(32281630),
      },
      {
        title: 'Aleppo Pistachio Halva',
        priceSyp: 26000,
        category: 'Sweets',
        imageUrl: pexelsImage(36355419),
      },
      {
        title: 'Pomegranate Molasses',
        priceSyp: 18000,
        imageUrl: pexelsImage(38044473),
      },
      {
        title: 'Extra Virgin Olive Oil 1L',
        priceSyp: 78000,
        imageUrl: pexelsImage(25745506),
      },
      {
        title: 'Stone-Ground Freekeh',
        priceSyp: 22000,
        imageUrl: pexelsImage(7420513),
      },
      {
        title: 'Syrian Black Olive Jar',
        priceSyp: 20000,
        imageUrl: pexelsImage(25745506),
      },
      {
        title: 'Dried Apricots from Homs',
        priceSyp: 35000,
        imageUrl: pexelsImage(11135641),
      },
    ],
  },
  personalCare: {
    category: 'Personal Care',
    description:
      'A small-batch care product made with familiar olive, laurel, and rose ingredients.',
    images: [
      pexelsImage(6690839),
      pexelsImage(5938598),
      pexelsImage(7055158),
      pexelsImage(40557468),
    ],
    products: [
      { title: 'Aleppo Laurel Soap Bar', priceSyp: 9000 },
      {
        title: 'Olive Oil Soap Gift Set',
        priceSyp: 32000,
        category: 'Gifts',
      },
      { title: 'Natural Olive Shampoo Bar', priceSyp: 18000 },
      { title: 'Damascus Rose Water', priceSyp: 15000 },
      { title: 'Laurel Soap Travel Pack', priceSyp: 14000 },
      { title: 'Olive Oil Hand Balm', priceSyp: 22000 },
      { title: 'Herbal Bath Soap', priceSyp: 11000 },
      { title: 'Rose Hand Cream', priceSyp: 28000 },
      {
        title: 'Natural Soap Dish',
        priceSyp: 17000,
        category: 'Household Supplies',
        imageUrl: pexelsImage(17962521),
      },
      { title: 'Olive and Laurel Body Bar', priceSyp: 12000 },
    ],
  },
  spices: {
    category: 'Spices',
    description:
      'Freshly packed Syrian spices and herbs selected for Levantine cooking.',
    images: [
      pexelsImage(32281630),
      pexelsImage(34561170),
      pexelsImage(4198755),
      pexelsImage(28411491),
      pexelsImage(7925819),
    ],
    products: [
      { title: 'Aleppo Red Pepper Flakes', priceSyp: 14000 },
      { title: 'Seven Spice Blend', priceSyp: 12000 },
      { title: 'Wild Thyme Za’atar', priceSyp: 10000 },
      { title: 'Ground Sumac', priceSyp: 11000 },
      { title: 'Cumin Seed Pouch', priceSyp: 9000 },
      { title: 'Green Cardamom', priceSyp: 24000 },
      { title: 'Ground Coriander', priceSyp: 8500 },
      { title: 'Cinnamon Sticks', priceSyp: 13000 },
      { title: 'Black Seed (Nigella)', priceSyp: 10000 },
      { title: 'Dried Mint Leaves', priceSyp: 8000 },
    ],
  },
  textiles: {
    category: 'Clothing',
    description:
      'A textile piece stitched or woven by Syrian makers using durable, traditional techniques.',
    images: [
      pexelsImage(35263485),
      pexelsImage(29893325),
      pexelsImage(36730419),
      pexelsImage(35596695),
    ],
    products: [
      { title: 'Embroidered Cotton Scarf', priceSyp: 48000 },
      {
        title: 'Damascus Hand-Stitched Table Runner',
        priceSyp: 72000,
        category: 'Household Supplies',
      },
      { title: 'Traditional Cotton Kaftan', priceSyp: 180000 },
      {
        title: 'Hand-Embroidered Cushion Cover',
        priceSyp: 68000,
        category: 'Home Decor',
      },
      { title: 'Woven Cotton Shawl', priceSyp: 95000 },
      {
        title: 'Aleppo Cross-Stitch Wall Panel',
        priceSyp: 115000,
        category: 'Ornaments',
      },
      {
        title: 'Linen Kitchen Towel Pair',
        priceSyp: 32000,
        category: 'Household Supplies',
      },
      { title: 'Traditional Embroidered Vest', priceSyp: 210000 },
      {
        title: 'Handwoven Cotton Tote',
        priceSyp: 55000,
        category: 'Accessories',
      },
      {
        title: 'Decorative Embroidered Pillow',
        priceSyp: 78000,
        category: 'Home Decor',
      },
    ],
  },
  home: {
    category: 'Home Decor',
    description:
      'A practical home piece inspired by Syrian weaving, ceramics, and inlay work.',
    images: [
      pexelsImage(15896109),
      pexelsImage(8318195),
      pexelsImage(13575092),
      pexelsImage(17962521),
    ],
    products: [
      {
        title: 'Handwoven Kilim Rug',
        priceSyp: 420000,
        imageUrl: pexelsImage(15896109),
      },
      {
        title: 'Small Hama Ceramic Bowl',
        priceSyp: 38000,
        category: 'Household Supplies',
        imageUrl: pexelsImage(13575092),
      },
      {
        title: 'Damascene Mosaic Tray',
        priceSyp: 125000,
        imageUrl: pexelsImage(4690306),
      },
      {
        title: 'Traditional Wool Prayer Rug',
        priceSyp: 195000,
        imageUrl: pexelsImage(8318195),
      },
      {
        title: 'Hand-Painted Ceramic Vase',
        priceSyp: 85000,
        category: 'Ornaments',
        imageUrl: pexelsImage(13575092),
      },
      {
        title: 'Woven Table Runner',
        priceSyp: 69000,
        category: 'Household Supplies',
        imageUrl: pexelsImage(29893325),
      },
      {
        title: 'Patterned Ceramic Serving Plate',
        priceSyp: 54000,
        category: 'Household Supplies',
        imageUrl: pexelsImage(13575092),
      },
      {
        title: 'Small Kilim Cushion',
        priceSyp: 78000,
        imageUrl: pexelsImage(15896109),
      },
      {
        title: 'Handmade Clay Coffee Cups',
        priceSyp: 46000,
        category: 'Household Supplies',
        imageUrl: pexelsImage(13575092),
      },
      {
        title: 'Geometric Wool Rug',
        priceSyp: 580000,
        imageUrl: pexelsImage(8318195),
      },
    ],
  },
  crafts: {
    category: 'Gifts',
    description:
      'A locally made gift finished by hand in a small Syrian workshop.',
    images: [
      pexelsImage(4690306),
      pexelsImage(744972),
      pexelsImage(6334697),
      pexelsImage(35263485),
    ],
    products: [
      {
        title: 'Handmade Olive-Wood Serving Board',
        priceSyp: 78000,
        category: 'Household Supplies',
      },
      { title: 'Miniature Aleppo Soap Gift Box', priceSyp: 42000 },
      {
        title: 'Embroidered Coin Purse',
        priceSyp: 36000,
        category: 'Accessories',
      },
      {
        title: 'Painted Ceramic Ornament',
        priceSyp: 28000,
        category: 'Ornaments',
      },
      {
        title: 'Handwoven Market Basket',
        priceSyp: 65000,
        category: 'Household Supplies',
      },
      {
        title: 'Mosaic Coaster Set',
        priceSyp: 48000,
        category: 'Household Supplies',
      },
      { title: 'Traditional Embroidery Bookmark', priceSyp: 18000 },
      {
        title: 'Olive-Wood Kitchen Spoon Set',
        priceSyp: 52000,
        category: 'Household Supplies',
      },
      { title: 'Syrian Craft Gift Bundle', priceSyp: 95000 },
      {
        title: 'Handmade Fabric Pouch',
        priceSyp: 33000,
        category: 'Accessories',
      },
    ],
  },
  coffee: {
    category: 'Coffee & Tea',
    description:
      'A freshly packed coffee or tea selected for everyday Syrian hospitality.',
    images: [
      pexelsImage(27860686),
      pexelsImage(4157763),
      pexelsImage(35553032),
      pexelsImage(38523136),
    ],
    products: [
      { title: 'Arabic Coffee with Cardamom', priceSyp: 24000 },
      { title: 'Aleppo Medium-Roast Coffee', priceSyp: 32000 },
      { title: 'Dark Roast Coffee Beans', priceSyp: 38000 },
      { title: 'Ground Coffee for Dallah', priceSyp: 29000 },
      { title: 'Syrian Green Tea', priceSyp: 18000 },
      { title: 'Cardamom Coffee Gift Tin', priceSyp: 46000 },
      { title: 'Roasted Coffee 500g', priceSyp: 62000 },
      { title: 'Mountain Herbal Tea', priceSyp: 22000 },
      { title: 'Coffee and Cardamom Bundle', priceSyp: 54000 },
      {
        title: 'Traditional Coffee Cup Pair',
        priceSyp: 35000,
        category: 'Household Supplies',
        imageUrl: pexelsImage(13575092),
      },
    ],
  },
  sweets: {
    category: 'Sweets & Bakery',
    description:
      'A freshly prepared Syrian sweet made with regional ingredients and traditional recipes.',
    images: [
      pexelsImage(25810607),
      pexelsImage(36355419),
      pexelsImage(36355420),
    ],
    products: [
      { title: 'Aleppo Pistachio Baklava', priceSyp: 42000 },
      { title: 'Damascus Walnut Maamoul', priceSyp: 26000 },
      { title: 'Pistachio Bird’s Nest Pastry', priceSyp: 48000 },
      { title: 'Sesame Barazek Biscuits', priceSyp: 22000 },
      { title: 'Ghraybeh Butter Cookies', priceSyp: 24000 },
      { title: 'Date-Filled Maamoul', priceSyp: 23000 },
      { title: 'Mixed Aleppo Sweets Box', priceSyp: 68000 },
      { title: 'Pistachio Halva Slice', priceSyp: 18000 },
      { title: 'Rosewater Semolina Cake', priceSyp: 30000 },
      { title: 'Sesame and Pistachio Brittle', priceSyp: 16000 },
    ],
  },
  produce: {
    category: 'Fresh Produce',
    description:
      'Seasonal produce sourced from Syrian farms and packed for local delivery.',
    images: [
      pexelsImage(38044473),
      pexelsImage(7656854),
      pexelsImage(37321079),
      pexelsImage(34523107),
    ],
    products: [
      {
        title: 'Ghouta Sweet Oranges 1kg',
        priceSyp: 12000,
        imageUrl: pexelsImage(38044473),
      },
      {
        title: 'Seasonal Mandarins 1kg',
        priceSyp: 14000,
        imageUrl: pexelsImage(7656854),
      },
      {
        title: 'Fresh Lemons 1kg',
        priceSyp: 9000,
        imageUrl: pexelsImage(38044473),
      },
      {
        title: 'Damascus Pomegranate 1kg',
        priceSyp: 16000,
        imageUrl: pexelsImage(34523107),
      },
      {
        title: 'Market Vegetable Basket',
        priceSyp: 24000,
        imageUrl: pexelsImage(37321079),
      },
      {
        title: 'Fresh Cucumbers 1kg',
        priceSyp: 8000,
        imageUrl: pexelsImage(37321079),
      },
      {
        title: 'Red Tomatoes 1kg',
        priceSyp: 10000,
        imageUrl: pexelsImage(37321079),
      },
      {
        title: 'Greenhouse Peppers 1kg',
        priceSyp: 11000,
        imageUrl: pexelsImage(37321079),
      },
      {
        title: 'Fresh Parsley and Mint Bundle',
        priceSyp: 5000,
        imageUrl: pexelsImage(37321079),
      },
      {
        title: 'Seasonal Fruit Box',
        priceSyp: 36000,
        imageUrl: pexelsImage(34523107),
      },
    ],
  },
  leather: {
    category: 'Accessories',
    description:
      'A durable leather accessory cut and finished by a Syrian craft workshop.',
    images: [
      pexelsImage(6650001),
      pexelsImage(27046146),
      pexelsImage(5352628),
      pexelsImage(36931056),
    ],
    products: [
      { title: 'Handmade Leather Crossbody Bag', priceSyp: 280000 },
      { title: 'Leather Card Holder', priceSyp: 65000 },
      { title: 'Classic Leather Belt', priceSyp: 95000 },
      { title: 'Hand-Stitched Leather Wallet', priceSyp: 110000 },
      { title: 'Leather Market Tote', priceSyp: 230000 },
      { title: 'Leather Satchel', priceSyp: 125000 },
      { title: 'Leather Passport Cover', priceSyp: 72000 },
      { title: 'Small Leather Shoulder Bag', priceSyp: 210000 },
      { title: 'Leather Key Fob', priceSyp: 28000 },
      { title: 'Handmade Leather Satchel', priceSyp: 390000 },
    ],
  },
};

const demoShops: DemoShop[] = [
  {
    ownerName: 'Demo Shop Owner',
    shopName: 'Damascus Demo Market',
    category: 'General Store',
    description:
      'A sample Damascus shop featuring pantry staples and local crafts.',
    imageUrl: '/images/shops/damascus-demo-market.jpg',
    imageCredit: 'aiace telamonio · CC BY 2.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:200712_syria-6.jpg',
    productSet: 'pantry',
  },
  {
    ownerName: 'Omar Haddad',
    shopName: 'Homs Pantry',
    category: 'Pantry & Household Goods',
    description:
      'A neighborhood market carrying pantry staples, Aleppo soap, and locally made home goods.',
    imageUrl: pexelsImage(25745506),
    productSet: 'pantry',
  },
  {
    ownerName: 'Mariam Khalil',
    shopName: 'Aleppo Soap House',
    category: 'Aleppo Soap',
    description:
      'Traditional laurel and olive oil soaps made in the Aleppo style.',
    imageUrl: pexelsImage(6690839),
    productSet: 'personalCare',
  },
  {
    ownerName: 'Fadi Mansour',
    shopName: 'Damascus Natural Care',
    category: 'Natural Care',
    description:
      'Olive, laurel, and rose-based personal care from local makers.',
    imageUrl: pexelsImage(5938598),
    productSet: 'personalCare',
  },
  {
    ownerName: 'Rana Darwish',
    shopName: 'Bab Touma Spices',
    category: 'Spices & Herbs',
    description: 'Freshly packed spices inspired by Damascus market kitchens.',
    imageUrl: pexelsImage(34561170),
    productSet: 'spices',
  },
  {
    ownerName: 'Nabil Barakat',
    shopName: 'Old City Herbs',
    category: 'Syrian Spices',
    description: 'Herbs and spice blends for classic Levantine recipes.',
    imageUrl: pexelsImage(32281630),
    productSet: 'spices',
  },
  {
    ownerName: 'Lina Nasser',
    shopName: 'Damascus Tailoring',
    category: 'Clothing',
    description: 'Traditional and contemporary clothing sewn by local tailors.',
    imageUrl: pexelsImage(36730419),
    productSet: 'textiles',
  },
  {
    ownerName: 'Yazan Suleiman',
    shopName: 'Aleppo Embroidery',
    category: 'Clothing',
    description:
      'Hand-embroidered textiles and cotton pieces from Aleppo makers.',
    imageUrl: pexelsImage(35263485),
    productSet: 'textiles',
  },
  {
    ownerName: 'Huda Saad',
    shopName: 'Levant Rugs',
    category: 'Home Decor',
    description:
      'Woven rugs, runners, and cushions in traditional Levantine patterns.',
    imageUrl: pexelsImage(15896109),
    productSet: 'home',
  },
  {
    ownerName: 'Khaled Issa',
    shopName: 'Hama Homeware',
    category: 'Household Supplies',
    description: 'Ceramics and practical home pieces from Syrian workshops.',
    imageUrl: pexelsImage(13575092),
    productSet: 'home',
  },
  {
    ownerName: 'Dima Mustafa',
    shopName: 'Souq Handmade Gifts',
    category: 'Gifts',
    description: 'Small handmade gifts inspired by the old Damascus souqs.',
    imageUrl: pexelsImage(4690306),
    productSet: 'crafts',
  },
  {
    ownerName: 'Tareq Jaber',
    shopName: 'Artisan Corner',
    category: 'Gifts',
    description:
      'Hand-finished ceramics, embroidery, and gifts from local artisans.',
    imageUrl: pexelsImage(8033894),
    productSet: 'crafts',
  },
  {
    ownerName: 'Salma Darwish',
    shopName: 'Damascus Coffee Roasters',
    category: 'Coffee & Roastery',
    description: 'Freshly roasted coffee prepared for Syrian hospitality.',
    imageUrl: pexelsImage(27860686),
    productSet: 'coffee',
  },
  {
    ownerName: 'Bassel Khoury',
    shopName: 'Aleppo Tea House',
    category: 'Tea & Coffee',
    description: 'Arabic coffee, tea, and cardamom blends packed in Aleppo.',
    imageUrl: pexelsImage(4157763),
    productSet: 'coffee',
  },
  {
    ownerName: 'Maya Qassem',
    shopName: 'Aleppo Baklava House',
    category: 'Aleppo Sweets',
    description:
      'Pistachio baklava and traditional sweets prepared in small batches.',
    imageUrl: pexelsImage(36355419),
    productSet: 'sweets',
  },
  {
    ownerName: 'Adel Hamwi',
    shopName: 'Damascus Maamoul Bakery',
    category: 'Bakery & Sweets',
    description: 'Maamoul, barazek, and Syrian bakery favorites made fresh.',
    imageUrl: pexelsImage(36355420),
    productSet: 'sweets',
  },
  {
    ownerName: 'Nour Youssef',
    shopName: 'Ghouta Citrus & Preserves',
    category: 'Citrus & Preserves',
    description:
      'Seasonal citrus, fruit, vegetables, and preserves sourced from farms around Damascus.',
    imageUrl: pexelsImage(38044473),
    productSet: 'produce',
  },
  {
    ownerName: 'Wael Ibrahim',
    shopName: 'Homs Fresh Harvest',
    category: 'Fresh Produce',
    description: 'Seasonal fruit and vegetables selected from nearby growers.',
    imageUrl: pexelsImage(37321079),
    productSet: 'produce',
  },
  {
    ownerName: 'Rima Shami',
    shopName: 'Damascus Leatherworks',
    category: 'Accessories',
    description:
      'Hand-stitched bags and accessories made by Damascus leatherworkers.',
    imageUrl: pexelsImage(6650001),
    productSet: 'leather',
  },
  {
    ownerName: 'Samer Alwan',
    shopName: 'Aleppo Leather Bags',
    category: 'Accessories',
    description:
      'Everyday leather bags and accessories finished by Aleppo makers.',
    imageUrl: pexelsImage(27046146),
    productSet: 'leather',
  },
];

const buyerNames = [
  'Demo Buyer',
  'Abdullah Khalil',
  'Rima Haddad',
  'Youssef Nasser',
  'Maha Darwish',
  'Fares Hamwi',
  'Nour Barakat',
  'Samer Qassem',
  'Dima Khoury',
  'Omar Mustafa',
  'Layan Issa',
  'Tareq Saleh',
  'Rana Mansour',
  'Khaled Saad',
  'Maya Suleiman',
  'Bassel Jaber',
  'Huda Ibrahim',
  'Nabil Youssef',
  'Salma Alwan',
  'Wael Shami',
  'Lina Qassem',
  'Adel Haddad',
  'Mariam Khoury',
  'Yazan Darwish',
  'Nour Mansour',
  'Fadi Khalil',
  'Dima Saad',
  'Rami Barakat',
];

function shopOwnerEmail(index: number): string {
  return index === 0
    ? 'shop@instamall.local'
    : `shop-owner-${String(index + 1).padStart(2, '0')}@instamall.local`;
}

const demoAccounts: DemoAccount[] = [
  {
    fullName: 'InstaMall Admin',
    email: 'admin@instamall.local',
    password: 'Admin12345!',
    role: 'admin',
  },
  {
    fullName: 'InstaMall Admin Two',
    email: 'admin-2@instamall.local',
    password: 'Admin23456!',
    role: 'admin',
  },
  {
    fullName: buyerNames[0],
    email: 'buyer@instamall.local',
    password: 'Buyer12345!',
    role: 'user',
    phone: '+963900000001',
    nationalId: '00000000001',
  },
  ...buyerNames.slice(1).map((fullName, index): DemoAccount => {
    const buyerNumber = index + 2;
    return {
      fullName,
      email: `buyer-${String(buyerNumber).padStart(2, '0')}@instamall.local`,
      password: 'Buyer12345!',
      role: 'user',
      phone: `+963${900000000 + buyerNumber}`,
      nationalId: String(buyerNumber).padStart(11, '0'),
    };
  }),
  ...demoShops.map((shop, index): DemoAccount => ({
    fullName: shop.ownerName,
    email: shopOwnerEmail(index),
    password: 'Shop12345!',
    role: 'shop',
  })),
];

const demoProducts = demoShops.flatMap((shop) => {
  const productSet = productSets[shop.productSet];
  return productSet.products.map((product, index) => ({
    shopName: shop.shopName,
    title: product.title,
    description:
      product.description ?? `${product.title}. ${productSet.description}`,
    category: product.category ?? productSet.category,
    priceSyp: product.priceSyp,
    imageUrl:
      product.imageUrl ?? productSet.images[index % productSet.images.length],
  }));
});

function validateDemoData(): void {
  const roleCounts = demoAccounts.reduce<Record<UserRole, number>>(
    (counts, account) => {
      counts[account.role] += 1;
      return counts;
    },
    { user: 0, shop: 0, admin: 0 },
  );
  const ownerEmails = demoShops.map((_, index) => shopOwnerEmail(index));
  const shopOwnerAccountEmails = new Set(
    demoAccounts
      .filter((account) => account.role === 'shop')
      .map((account) => account.email),
  );
  const shopImages = demoShops.map((shop) => shop.imageUrl);

  if (
    roleCounts.admin < 2 ||
    roleCounts.shop < 20 ||
    roleCounts.user < 28 ||
    demoAccounts.length < 50 ||
    demoShops.length < 20 ||
    demoProducts.length < 200
  ) {
    throw new Error(
      'Demo seed data does not meet the minimum account/shop/product counts',
    );
  }
  if (
    new Set(demoAccounts.map((account) => account.email)).size !==
      demoAccounts.length ||
    new Set(shopImages).size !== demoShops.length ||
    new Set(ownerEmails).size !== demoShops.length ||
    ownerEmails.some((email) => !shopOwnerAccountEmails.has(email))
  ) {
    throw new Error(
      'Demo seed data contains duplicate account, owner, or shop image values',
    );
  }

  for (const account of demoAccounts) {
    if (
      !account.fullName.trim() ||
      account.fullName.length > 120 ||
      !account.email.trim() ||
      !account.password.trim()
    ) {
      throw new Error(`Invalid demo account data for ${account.email}`);
    }
  }
  for (const shop of demoShops) {
    if (
      !shop.shopName.trim() ||
      shop.shopName.length > 120 ||
      !shop.category.trim() ||
      shop.category.length > 80 ||
      !shop.description.trim() ||
      shop.description.length > 2000 ||
      !shop.imageUrl.trim() ||
      shop.imageUrl.length > 2048 ||
      (shop.imageCredit?.length ?? 0) > 160 ||
      (shop.imageCreditUrl?.length ?? 0) > 2048
    ) {
      throw new Error(`Invalid demo shop data for ${shop.shopName}`);
    }
  }
  for (const product of demoProducts) {
    if (
      !product.title.trim() ||
      product.title.length > 160 ||
      !product.description.trim() ||
      product.description.length > 4000 ||
      !product.category.trim() ||
      product.category.length > 80 ||
      !Number.isFinite(product.priceSyp) ||
      product.priceSyp <= 0.01 ||
      !product.imageUrl ||
      !product.imageUrl.trim()
    ) {
      throw new Error(`Invalid demo product data for ${product.title}`);
    }
  }
}

function getLocalDatabaseUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required to seed demo data');
  }

  let parsedUri: URL;
  try {
    parsedUri = new URL(uri);
  } catch (error) {
    throw new Error('MONGODB_URI must be a valid MongoDB URL', {
      cause: error,
    });
  }

  const localHosts = ['localhost', '127.0.0.1', '[::1]'];
  if (
    !localHosts.includes(parsedUri.hostname) ||
    parsedUri.pathname.replace(/^\/+/, '').split('/')[0] !== 'instamall'
  ) {
    throw new Error(
      'Demo seeding is restricted to the local instamall database',
    );
  }

  return uri;
}

async function seed() {
  validateDemoData();
  const connection = await createConnection(getLocalDatabaseUri()).asPromise();
  try {
    const userModel = connection.model(User.name, UserSchema);
    const shopModel = connection.model(Shop.name, ShopSchema);
    const productModel = connection.model(Product.name, ProductSchema);

    const users = new Map<string, HydratedDocument<User>>();
    const passwordHashes = new Map<string, string>();
    for (const account of demoAccounts) {
      let passwordHash = passwordHashes.get(account.password);
      if (!passwordHash) {
        passwordHash = await bcrypt.hash(account.password, 12);
        passwordHashes.set(account.password, passwordHash);
      }
      const user = await userModel
        .findOneAndUpdate(
          { email: account.email },
          {
            $set: {
              fullName: account.fullName,
              email: account.email,
              passwordHash,
              role: account.role,
              ...(account.phone && { phone: account.phone }),
              ...(account.nationalId && { nationalId: account.nationalId }),
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            runValidators: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec();
      if (!user) {
        throw new Error(`Failed to seed account ${account.email}`);
      }
      users.set(account.email, user);
    }

    const shops = new Map<string, HydratedDocument<Shop>>();
    for (const [index, shopSeed] of demoShops.entries()) {
      const ownerEmail = shopOwnerEmail(index);
      const shopOwner = users.get(ownerEmail);
      if (!shopOwner) {
        throw new Error(`Demo shop owner ${ownerEmail} was not created`);
      }
      const shop = await shopModel
        .findOneAndUpdate(
          { ownerId: shopOwner._id },
          {
            $set: {
              ownerId: shopOwner._id,
              shopName: shopSeed.shopName,
              category: shopSeed.category,
              description: shopSeed.description,
              imageUrl: shopSeed.imageUrl,
              ...(shopSeed.imageCredit && {
                imageCredit: shopSeed.imageCredit,
              }),
              ...(shopSeed.imageCreditUrl && {
                imageCreditUrl: shopSeed.imageCreditUrl,
              }),
              isActive: true,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            runValidators: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec();
      if (!shop) {
        throw new Error(`Failed to seed shop ${shopSeed.shopName}`);
      }
      shops.set(shopSeed.shopName, shop);
    }

    let seededProductCount = 0;
    for (const product of demoProducts) {
      const shop = shops.get(product.shopName);
      if (!shop) {
        throw new Error(`Demo shop ${product.shopName} was not created`);
      }
      const seededProduct = await productModel
        .findOneAndUpdate(
          { shopId: shop._id, title: product.title },
          {
            $set: {
              title: product.title,
              description: product.description,
              category: product.category,
              priceSyp: product.priceSyp,
              imageUrl: product.imageUrl,
              shopId: shop._id,
              isActive: true,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            runValidators: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec();
      if (!seededProduct) {
        throw new Error(`Failed to seed product ${product.title}`);
      }
      seededProductCount += 1;
    }

    const primaryShop = shops.get('Damascus Demo Market');
    console.log(
      `Seeded ${demoAccounts.length} users (${demoAccounts.filter(({ role }) => role === 'admin').length} admins, ${demoAccounts.filter(({ role }) => role === 'user').length} buyers, ${demoAccounts.filter(({ role }) => role === 'shop').length} shop owners), ${shops.size} shops, and ${seededProductCount} products in the local instamall database.`,
    );
    console.log(
      'Demo logins: admin@instamall.local / Admin12345!, buyer@instamall.local / Buyer12345!, shop@instamall.local / Shop12345!',
    );
    if (primaryShop) {
      console.log(`Primary shop: ${primaryShop.shopName}`);
    }
  } finally {
    await connection.close();
  }
}

await seed();
