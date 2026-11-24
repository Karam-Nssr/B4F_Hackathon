import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../products/schemas/product.schema.js';
import { Shop } from '../shops/schemas/shop.schema.js';
import { User } from '../users/schemas/user.schema.js';
import {
  MasterOrder,
} from './schemas/master-order.schema.js';
import {
  ShopSubOrder,
  type OrderStatus,
} from './schemas/shop-sub-order.schema.js';
import { OrdersService } from './orders.service.js';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

const USER_ID = '507f1f77bcf86cd799439011';
const ORDER_ID = new Types.ObjectId('507f1f77bcf86cd799439021');
const SUB_ORDER_ID = new Types.ObjectId('507f1f77bcf86cd799439031');
const OTHER_SUB_ORDER_ID = new Types.ObjectId('507f1f77bcf86cd799439032');

/** A `.lean().exec()` query resolving to `value`. */
const leanQuery = <T>(value: T) => ({
  lean: () => ({ exec: vi.fn().mockResolvedValue(value) }),
});

/** A `.sort(...).lean().exec()` query resolving to `value`. */
const sortedQuery = <T>(value: T) => ({
  sort: () => ({ lean: () => ({ exec: vi.fn().mockResolvedValue(value) }) }),
});

/** A `.populate(...).sort(...).lean().exec()` query resolving to `values`. */
const populatedQuery = <T>(values: T[]) => ({
  populate: () => ({
    sort: () => ({
      lean: () => ({ exec: vi.fn().mockResolvedValue(values) }),
    }),
  }),
});

const masterOrder = (overrides: Record<string, unknown> = {}) => ({
  _id: ORDER_ID,
  userId: new Types.ObjectId(USER_ID),
  totalAmountSyp: 1000,
  ...overrides,
});

const subOrder = (
  status: OrderStatus,
  overrides: Record<string, unknown> = {},
) => ({
  _id: SUB_ORDER_ID,
  masterOrderId: ORDER_ID,
  status,
  ...overrides,
});

function createMasterOrderModel() {
  return {
    findOne: vi.fn(),
    find: vi.fn(),
  };
}

function createShopSubOrderModel() {
  return {
    findOne: vi.fn(),
    find: vi.fn(),
    updateOne: vi.fn(() => ({ exec: vi.fn().mockResolvedValue(undefined) })),
    updateMany: vi.fn(() => ({ exec: vi.fn().mockResolvedValue(undefined) })),
  };
}

describe('OrdersService', () => {
  let service: OrdersService;
  let masterOrderModel: ReturnType<typeof createMasterOrderModel>;
  let shopSubOrderModel: ReturnType<typeof createShopSubOrderModel>;

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
    masterOrderModel = createMasterOrderModel();
    shopSubOrderModel = createShopSubOrderModel();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Shop.name), useValue: {} },
        {
          provide: getModelToken(MasterOrder.name),
          useValue: masterOrderModel,
        },
        {
          provide: getModelToken(ShopSubOrder.name),
          useValue: shopSubOrderModel,
        },
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

  it('keeps shaping the items of listMine with their sub-orders', async () => {
    masterOrderModel.find.mockReturnValue(sortedQuery([masterOrder()]));
    shopSubOrderModel.find.mockReturnValue(
      populatedQuery([subOrder('PENDING')]),
    );

    const orders = await service.listMine(USER_ID);

    expect(orders).toHaveLength(1);
    expect(orders[0].shopSubOrders).toHaveLength(1);
    expect(shopSubOrderModel.find).toHaveBeenCalledWith({
      masterOrderId: { $in: [ORDER_ID] },
    });
  });

  it('treats an order the user does not own as missing', async () => {
    masterOrderModel.findOne.mockReturnValue(leanQuery(null));

    await expect(service.getOrder(USER_ID, ORDER_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.cancelOrder(USER_ID, ORDER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(shopSubOrderModel.updateMany).not.toHaveBeenCalled();
  });

  it('returns a master order together with its populated sub-orders', async () => {
    masterOrderModel.findOne.mockReturnValue(leanQuery(masterOrder()));
    shopSubOrderModel.find.mockReturnValue(
      populatedQuery([subOrder('PENDING')]),
    );

    const order = await service.getOrder(USER_ID, ORDER_ID);

    expect(order.shopSubOrders).toHaveLength(1);
    expect(order.shopSubOrders[0].status).toBe('PENDING');
  });

  it('treats a sub-order of an order the user does not own as missing', async () => {
    shopSubOrderModel.findOne.mockReturnValue(leanQuery(subOrder('PENDING')));
    masterOrderModel.findOne.mockReturnValue(leanQuery(null));

    await expect(
      service.cancelSubOrder(USER_ID, SUB_ORDER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(shopSubOrderModel.updateOne).not.toHaveBeenCalled();
  });

  it.each(['CONFIRMED', 'COMPLETED', 'CANCELLED'] as const)(
    'refuses to cancel a %s sub-order',
    async (status) => {
      shopSubOrderModel.findOne.mockReturnValue(leanQuery(subOrder(status)));
      masterOrderModel.findOne.mockReturnValue(leanQuery(masterOrder()));

      await expect(
        service.cancelSubOrder(USER_ID, SUB_ORDER_ID),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(shopSubOrderModel.updateOne).not.toHaveBeenCalled();
      expect(masterOrderModel.findOne).toHaveBeenCalledTimes(1);
    },
  );

  it('refuses to cancel an order while any sub-order is not pending', async () => {
    masterOrderModel.findOne.mockReturnValue(leanQuery(masterOrder()));
    shopSubOrderModel.find.mockReturnValue(
      populatedQuery([
        subOrder('PENDING'),
        subOrder('CONFIRMED', { _id: OTHER_SUB_ORDER_ID }),
      ]),
    );

    await expect(
      service.cancelOrder(USER_ID, ORDER_ID),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(shopSubOrderModel.updateMany).not.toHaveBeenCalled();
  });

  it('cancels every pending sub-order and returns the refreshed order', async () => {
    const pending = [
      subOrder('PENDING'),
      subOrder('PENDING', { _id: OTHER_SUB_ORDER_ID }),
    ];
    const cancelled = pending.map((order) => ({
      ...order,
      status: 'CANCELLED' as const,
    }));
    masterOrderModel.findOne.mockReturnValue(leanQuery(masterOrder()));
    shopSubOrderModel.find
      .mockReturnValueOnce(populatedQuery(pending))
      .mockReturnValueOnce(populatedQuery(cancelled));

    const order = await service.cancelOrder(USER_ID, ORDER_ID);

    expect(shopSubOrderModel.updateMany).toHaveBeenCalledWith(
      { masterOrderId: ORDER_ID },
      { $set: { status: 'CANCELLED' } },
    );
    expect(order.shopSubOrders.map((sub) => sub.status)).toEqual([
      'CANCELLED',
      'CANCELLED',
    ]);
    expect(masterOrderModel.findOne).toHaveBeenCalledTimes(2);
  });

  it('cancels one pending sub-order and returns the refreshed order', async () => {
    shopSubOrderModel.findOne.mockReturnValue(leanQuery(subOrder('PENDING')));
    masterOrderModel.findOne
      .mockReturnValueOnce(leanQuery(masterOrder()))
      .mockReturnValueOnce(leanQuery(masterOrder()));
    shopSubOrderModel.find.mockReturnValue(
      populatedQuery([subOrder('CANCELLED')]),
    );

    const order = await service.cancelSubOrder(USER_ID, SUB_ORDER_ID);

    expect(shopSubOrderModel.updateOne).toHaveBeenCalledWith(
      { _id: SUB_ORDER_ID },
      { $set: { status: 'CANCELLED' } },
    );
    expect(order.shopSubOrders[0].status).toBe('CANCELLED');
  });
});
