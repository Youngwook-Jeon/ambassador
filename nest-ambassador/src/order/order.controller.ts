import {
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/orders')
  all() {
    return this.orderService.find({
      relations: ['order_items'],
    });
  }
}
