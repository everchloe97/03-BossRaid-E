import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RaidEndDto {
  @ApiProperty({ description: '유저 아이디', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({ description: '레이드 기록 아이디', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly raidRecordId: number;
}
