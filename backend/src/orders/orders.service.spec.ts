import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../products/schemas/product.schema.js';
import { Shop } from '../shops/schemas/shop.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { MasterOrder } from './schemas/master-order.schema.js';
import { ShopSubOrder } from './schemas/shop-sub-order.schema.js';
import { OrdersService } from './orders.service.js';
import { BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const userModel = {
      findById: vi.fn(() => ({
        exec: vi.fn().mockResolvedValue({
          fullName: 'Buyer',
          phone: undefined,
          nationalId: undefined,
        }),
      })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Shop.name), useValue: {} },
        { provide: getModelToken(MasterOrder.name), useValue: {} },
        { provide: getModelToken(ShopSubOrder.name), useValue: {} },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('requires saved buyer contact details before creating an order', async () => {
    await expect(
      service.create('507f1f77bcf86cd799439011', {
        items: [{ productId: '507f1f77bcf86cd799439012', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
