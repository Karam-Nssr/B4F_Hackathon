import { createConnection, type HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';

const demoAccounts = [
  {
    fullName: 'InstaMall Admin',
    email: 'admin@instamall.local',
    password: 'Admin12345!',
    role: 'admin' as const,
  },
  {
    fullName: 'Demo Buyer',
    email: 'buyer@instamall.local',
    password: 'Buyer12345!',
    role: 'user' as const,
    phone: '+963900000001',
    nationalId: '00000000001',
  },
  {
    fullName: 'haidra Buyer',
    email: 'buyer@instamall.local',
    password: 'Buyer12345!',
    role: 'user' as const,
    phone: '+963900000001',
    nationalId: '00000000001',
  },
  {
    fullName: 'Demo Shop Owner',
    email: 'shop@instamall.local',
    password: 'Shop12345!',
    role: 'shop' as const,
  },
];

const demoProducts = [
  {
    title: 'Aleppo Olive Oil',
    description: 'Demo product for local API testing.',
    category: 'Groceries',
    priceSyp: 45000,
    imageUrl: 'https://example.com/images/aleppo-olive-oil.jpg',
  },
  {
    title: 'Traditional Soap Set',
    description: 'Demo product for local API testing.',
    category: 'Personal Care',
    priceSyp: 28000,
    imageUrl: 'https://example.com/images/traditional-soap-set.jpg',
  },
  {
    title: 'Embroidered Cushion',
    description: 'Demo product for local API testing.',
    category: 'Home & Living',
    priceSyp: 65000,
    imageUrl: 'https://example.com/images/embroidered-cushion.jpg',
  },
];

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
  const connection = await createConnection(getLocalDatabaseUri()).asPromise();
  try {
    const userModel = connection.model(User.name, UserSchema);
    const shopModel = connection.model(Shop.name, ShopSchema);
    const productModel = connection.model(Product.name, ProductSchema);

    const users = new Map<string, HydratedDocument<User>>();
    for (const account of demoAccounts) {
      const passwordHash = await bcrypt.hash(account.password, 12);
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

    const shopOwner = users.get('shop@instamall.local');
    if (!shopOwner) {
      throw new Error('Demo shop owner was not created');
    }
    const shop = await shopModel
      .findOneAndUpdate(
        { ownerId: shopOwner._id },
        {
          $set: {
            ownerId: shopOwner._id,
            shopName: 'Damascus Demo Market',
            category: 'General Store',
            description: 'Sample shop for local API testing.',
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
      throw new Error('Failed to seed demo shop');
    }

    const products = [];
    for (const product of demoProducts) {
      const seededProduct = await productModel
        .findOneAndUpdate(
          { shopId: shop._id, title: product.title },
          { $set: { ...product, shopId: shop._id, isActive: true } },
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
      products.push(seededProduct);
    }

    console.log('Demo data seeded in the local instamall database.');
    console.log(
      demoAccounts.map(({ email, password, role }) => ({
        email,
        password,
        role,
      })),
    );
    console.log(`Shop: ${shop.shopName} (${shop._id.toString()})`);
    console.log(
      products.map(({ title, _id, priceSyp }) => ({
        title,
        id: _id.toString(),
        priceSyp,
      })),
    );
  } finally {
    await connection.close();
  }
}

await seed();
