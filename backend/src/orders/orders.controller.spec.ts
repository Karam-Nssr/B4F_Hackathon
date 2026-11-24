import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

const USER = { sub: '507f1f77bcf86cd799439011', role: 'user' as const };
const ORDER_ID = new Types.ObjectId('507f1f77bcf86cd799439021');
const SUB_ORDER_ID = new Types.ObjectId('507f1f77bcf86cd799439031');

function createOrdersService() {
  return {
    create: vi.fn(),
    listMine: vi.fn(),
    getOrder: vi.fn(),
    cancelSubOrder: vi.fn(),
    cancelOrder: vi.fn(),
  };
}

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: ReturnType<typeof createOrdersService>;

  beforeEach(async () => {
    ordersService = createOrdersService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: ordersService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('loads one order of the caller', async () => {
    ordersService.getOrder.mockResolvedValue({ _id: ORDER_ID });

    await expect(controller.getMine(USER, ORDER_ID)).resolves.toEqual({
      _id: ORDER_ID,
    });
    expect(ordersService.getOrder).toHaveBeenCalledWith(USER.sub, ORDER_ID);
  });

  it('cancels one sub-order of the caller', async () => {
    ordersService.cancelSubOrder.mockResolvedValue({ _id: ORDER_ID });

    await controller.cancelSubOrderMine(USER, SUB_ORDER_ID);

    expect(ordersService.cancelSubOrder).toHaveBeenCalledWith(
      USER.sub,
      SUB_ORDER_ID,
    );
  });

  it('cancels the whole order of the caller', async () => {
    ordersService.cancelOrder.mockResolvedValue({ _id: ORDER_ID });

    await controller.cancelMine(USER, ORDER_ID);

    expect(ordersService.cancelOrder).toHaveBeenCalledWith(USER.sub, ORDER_ID);
  });

  it('propagates the 404 for an order that is not the caller\'s', async () => {
    ordersService.cancelOrder.mockRejectedValue(
      new NotFoundException('Order not found'),
    );

    await expect(controller.cancelMine(USER, ORDER_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('propagates the 409 for an order that is no longer pending', async () => {
    ordersService.cancelSubOrder.mockRejectedValue(
      new ConflictException('Only pending sub-orders can be cancelled'),
    );

    await expect(
      controller.cancelSubOrderMine(USER, SUB_ORDER_ID),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
