import {
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { LinkService } from '../link/link.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './order';
import { OrderService } from './order.service';
import { Link } from '../link/link';
import { ProductService } from '../product/product.service';
import { OrderItem } from './order-item';
import { Product } from '../product/product';
import { OrderItemService } from './order-item.service';

@Controller()
export class OrderController {
  constructor(
    private orderService: OrderService,
    private linkService: LinkService,
    private productService: ProductService,
    private orderItemService: OrderItemService,
  ) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/orders')
  all() {
    return this.orderService.find({
      relations: ['order_items'],
    });
  }

  @Post('checkout/orders')
  async create(@Body() body: CreateOrderDto) {
    const link: Link = await this.linkService.findOne({
      code: body.code,
      relations: ['user'],
    });

    if (!link) {
      throw new BadRequestException('Invalid link!');
    }

    const o = new Order();
    o.user_id = link.user.id;
    o.ambassador_email = link.user.email;
    o.first_name = body.first_name;
    o.last_name = body.last_name;
    o.email = body.email;
    o.address = body.address;
    o.country = body.country;
    o.city = body.city;
    o.zip = body.zip;
    o.code = body.code;

    const order = await this.orderService.save(o);

    for (const p of body.products) {
      const product: Product = await this.productService.findOne({
        id: p.product_id,
      });

      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.product_title = product.title;
      orderItem.price = product.price;
      orderItem.quantity = p.quantity;
      orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
      orderItem.admin_revenue = 0.9 * product.price * p.quantity;

      await this.orderItemService.save(orderItem);
    }

    return order;
  }
}
