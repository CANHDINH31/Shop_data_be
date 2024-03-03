import { IsNotEmpty, IsString } from 'class-validator';

export class MigrateKeyDto {
  @IsNotEmpty()
  @IsString()
  keyId: string;

  @IsNotEmpty()
  @IsString()
  serverId: string;
}
