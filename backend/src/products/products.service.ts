import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import { ShopsService } from '../shops/shops.service.js';
import { Shop } from '../shops/schemas/shop.schema.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './schemas/product.schema.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
    private readonly shopsService: ShopsService,
  ) {}

  async browse(query: QueryProductsDto) {
    if (
      query.minPriceSyp !== undefined &&
      query.maxPriceSyp !== undefined &&
      query.minPriceSyp > query.maxPriceSyp
    ) {
      throw new BadRequestException('minPriceSyp cannot exceed maxPriceSyp');
    }

    const activeShops = await this.shopModel
      .find({ isActive: true })
      .select('_id')
      .lean()
      .exec();
    const filter: QueryFilter<Product> = {
      isActive: true,
      shopId: { $in: activeShops.map((shop) => shop._id) },
    };
    if (query.category) {
      filter.category = query.category;
    }
    if (query.shopId) {
      filter.shopId = {
        $in: activeShops.map((shop) => shop._id),
        $eq: new Types.ObjectId(query.shopId),
      };
    }
    if (query.search) {
      const escapedSearch = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
      ];
    }
    if (query.minPriceSyp !== undefined || query.maxPriceSyp !== undefined) {
      filter.priceSyp = {
        ...(query.minPriceSyp !== undefined && { $gte: query.minPriceSyp }),
        ...(query.maxPriceSyp !== undefined && { $lte: query.maxPriceSyp }),
      };
    }

    return this.productModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async listOwned(ownerId: string) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    return this.productModel
      .find({ shopId: shop._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async create(ownerId: string, dto: CreateProductDto) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    return this.productModel.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priceSyp: dto.priceSyp,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive ?? true,
      shopId: shop._id,
    });
  }

  async updateOwned(
    ownerId: string,
    productId: Types.ObjectId,
    dto: UpdateProductDto,
  ) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: productId, shopId: shop._id },
        { $set: dto },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async deleteOwned(ownerId: string, productId: Types.ObjectId) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    const product = await this.productModel
      .findOneAndDelete({ _id: productId, shopId: shop._id })
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { deleted: true };
  }
}
