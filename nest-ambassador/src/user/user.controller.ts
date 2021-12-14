import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RedisService } from '../shared/redis.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user';
import { UserService } from './user.service';
import { Response } from 'express';

@UseGuards(AuthGuard)
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private redisService: RedisService,
  ) {}

  @Get('admin/ambassadors')
  async ambassadors() {
    return this.userService.find({
      is_ambassador: true,
    });
  }

  @Get('ambassador/rankings')
  async rankings(@Res() response: Response) {
    const client = this.redisService.getClient();
    client.zrevrangebyscore(
      'rankings',
      '+inf',
      '-inf',
      'withscores',
      (err, result) => {
        let name;
        response.send(
          result.reduce((o, r) => {
            if (!isNaN(r)) {
              return {
                ...o,
                [name]: parseInt(r),
              };
            } else {
              name = r;
              return o;
            }
          }, {}),
        );
      },
    );
  }
}
