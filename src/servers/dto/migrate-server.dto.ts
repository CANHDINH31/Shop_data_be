import { IsNotEmpty, IsString } from 'class-validator';

export class MigrateServerDto {
  @IsNotEmpty()
  @IsString()
  oldServerId: string;

  @IsNotEmpty()
  @IsString()
  newServerId: string;
}
