import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserHttpController } from './user-http.controller';

@Module({
  imports: [UserModule],
  controllers: [UserHttpController],
})
export class UserHttpModule {}
