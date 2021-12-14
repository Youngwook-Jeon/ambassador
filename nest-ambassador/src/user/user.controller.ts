import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user';
import { UserService } from './user.service';

@UseGuards(AuthGuard)
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/ambassadors')
  async ambassadors() {
    return this.userService.find({
      is_ambassador: true,
    });
  }

  @Get('ambassador/rankings')
  async rankings() {
    const ambassadors: User[] = await this.userService.find({
      is_ambassador: true,
      relations: ['orders', 'orders.order_items'],
    });

    return ambassadors.map((ambassador) => {
      return {
        name: ambassador.name,
        revenue: ambassador.revenue,
      };
    });
  }
}
