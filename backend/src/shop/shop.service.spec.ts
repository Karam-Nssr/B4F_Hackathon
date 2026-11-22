import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ShopSubOrder } from '../orders/schemas/shop-sub-order.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { ShopsService } from '../shops/shops.service.js';
import { ShopService } from './shop.service.js';
import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ShopService', () => {
  let service: ShopService;

  beforeEach(async () => {
    const order = {
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      confirmationWindowHours: 24,
      save: vi.fn(),
    };
    const shopSubOrderModel = {
      findOne: vi.fn(() => ({
        exec: vi.fn().mockResolvedValue(order),
      })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        { provide: getModelToken(Product.name), useValue: {} },
        {
          provide: getModelToken(ShopSubOrder.name),
          useValue: shopSubOrderModel,
        },
        {
          provide: ShopsService,
          useValue: {
            findOwnedShop: vi.fn().mockResolvedValue({
              _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects confirmation after the confirmation window expires', async () => {
    await expect(
      service.updateOrderStatus(
        '507f1f77bcf86cd799439011',
        new Types.ObjectId('507f1f77bcf86cd799439012'),
        'CONFIRMED',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
