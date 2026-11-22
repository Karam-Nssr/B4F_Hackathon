import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { Product } from '../products/schemas/product.schema.js';
import { Shop } from '../shops/schemas/shop.schema.js';
import { User } from '../users/schemas/user.schema.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import { MasterOrder } from './schemas/master-order.schema.js';
import { ShopSubOrder } from './schemas/shop-sub-order.schema.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
    @InjectModel(MasterOrder.name)
    private readonly masterOrderModel: Model<MasterOrder>,
    @InjectModel(ShopSubOrder.name)
    private readonly shopSubOrderModel: Model<ShopSubOrder>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.phone || !user.nationalId) {
      throw new BadRequestException(
        'Save a phone number and national ID in your profile before ordering',
      );
    }

    const quantities = new Map<string, number>();
    for (const item of dto.items) {
      const quantity = (quantities.get(item.productId) ?? 0) + item.quantity;
      if (quantity > 10000) {
        throw new BadRequestException('A product quantity cannot exceed 10000');
      }
      quantities.set(item.productId, quantity);
    }
    const productIds = [...quantities.keys()].map(
      (id) => new Types.ObjectId(id),
    );
    const products = await this.productModel
      .find({ _id: { $in: productIds }, isActive: true })
      .exec();
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are unavailable');
    }

    const activeShops = await this.shopModel
      .find({
        _id: { $in: products.map((product) => product.shopId) },
        isActive: true,
      })
      .select('_id')
      .exec();
    const activeShopIds = new Set(
      activeShops.map((shop) => shop._id.toString()),
    );
    if (
      products.some((product) => !activeShopIds.has(product.shopId.toString()))
    ) {
      throw new BadRequestException('One or more products are unavailable');
    }

    const productsByShop = new Map<
      string,
      Array<{ productTitle: string; unitPriceSyp: number; quantity: number }>
    >();
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    for (const [productId, quantity] of quantities) {
      const product = productsById.get(productId);
      if (!product) {
        throw new BadRequestException('One or more products are unavailable');
      }
      const shopId = product.shopId.toString();
      const items = productsByShop.get(shopId) ?? [];
      items.push({
        productTitle: product.title,
        unitPriceSyp: product.priceSyp,
        quantity,
      });
      productsByShop.set(shopId, items);
    }

    const subtotals = [...productsByShop.entries()].map(([shopId, items]) => ({
      shopId: new Types.ObjectId(shopId),
      items,
      subtotalSyp: items.reduce(
        (sum, item) => sum + item.unitPriceSyp * item.quantity,
        0,
      ),
    }));
    const totalAmountSyp = subtotals.reduce(
      (sum, order) => sum + order.subtotalSyp,
      0,
    );
    if (!Number.isFinite(totalAmountSyp) || totalAmountSyp <= 0) {
      throw new BadRequestException(
        'Order total must be a positive SYP amount',
      );
    }

    const masterOrder = await this.masterOrderModel.create({
      userId: new Types.ObjectId(userId),
      totalAmountSyp,
      customerPhone: user.phone,
      customerNationalId: user.nationalId,
    });

    try {
      const subOrders = await this.shopSubOrderModel.insertMany(
        subtotals.map((order) => ({
          masterOrderId: masterOrder._id,
          shopId: order.shopId,
          invoiceNumber: `INV-${randomUUID()}`,
          items: order.items,
          subtotalSyp: order.subtotalSyp,
          customerName: user.fullName,
          customerPhone: user.phone,
          customerNationalId: user.nationalId,
          status: 'PENDING',
          confirmationWindowHours: 24,
        })),
      );
      return Object.assign(masterOrder.toObject(), {
        shopSubOrders: subOrders,
      });
    } catch (error) {
      try {
        await this.shopSubOrderModel.deleteMany({
          masterOrderId: masterOrder._id,
        });
        await this.masterOrderModel.deleteOne({ _id: masterOrder._id });
      } catch (cleanupError) {
        this.logger.error(
          `Failed to roll back master order ${masterOrder._id.toString()}`,
          cleanupError instanceof Error ? cleanupError.stack : undefined,
        );
        throw new InternalServerErrorException(
          'Order creation failed and requires database cleanup',
          { cause: error },
        );
      }
      throw error;
    }
  }

  async listMine(userId: string) {
    const masterOrders = await this.masterOrderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    if (masterOrders.length === 0) {
      return [];
    }

    const subOrders = await this.shopSubOrderModel
      .find({
        masterOrderId: { $in: masterOrders.map((order) => order._id) },
      })
      .populate('shopId', 'shopName category')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return masterOrders.map((order) =>
      Object.assign({}, order, {
        shopSubOrders: subOrders.filter(
          (subOrder) =>
            subOrder.masterOrderId.toString() === order._id.toString(),
        ),
      }),
    );
  }
}
