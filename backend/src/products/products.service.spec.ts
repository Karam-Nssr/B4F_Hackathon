import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Shop } from '../shops/schemas/shop.schema.js';
import { ShopsService } from '../shops/shops.service.js';
import { Product } from './schemas/product.schema.js';
import { ProductsService } from './products.service.js';
import { BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Shop.name), useValue: {} },
        { provide: ShopsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a product price range whose minimum exceeds its maximum', async () => {
    await expect(
      service.browse({ minPriceSyp: 10, maxPriceSyp: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
