import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateRaidDTO {
  @ApiProperty({ description: '유저 아이디', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({ description: '보스 레이드 레벨', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  // @Min(0)
  // @Max(2)
  readonly level: number;
}
