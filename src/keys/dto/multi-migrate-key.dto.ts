import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class MultiMigrateKeyDto {
  @IsNotEmpty()
  @IsArray()
  listKeyId: string[];

  @IsNotEmpty()
  @IsString()
  serverId: string;
}
