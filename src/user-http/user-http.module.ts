import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserHttpController } from './user-http.controller';

import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [UserHttpController],
})
export class UserHttpModule {}
