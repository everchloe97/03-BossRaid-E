import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, Min } from 'class-validator';

/**
 * 작성자 : 김지유
 */
export abstract class BossRaidRecord {
  @ApiProperty({ description: '레이드 기록 id', example: '1' })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsNotEmpty()
  raidRecordId: number;

  @ApiProperty({ description: '레이드 획득 점수', example: 30 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsNotEmpty()
  score: number;

  @ApiProperty({ description: '레이드 입장 시간', example: '레이드 입장 시간' })
  @IsDateString()
  @IsNotEmpty()
  enterTime: Date;

  @ApiProperty({ description: '레이드 종료 시간', example: '레이드 종료 시간' })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;
}

/**
 * 작성자 : 김지유
 */
export class UserInfoDTO {
  @ApiProperty({ description: '총 점수', example: 30 })
  @Min(0)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsNotEmpty()
  readonly totalScore: number;

  @ApiProperty({
    description: '레이드 기록',
    example: [
      {
        raidRecordId: 1,
        score: 30,
        enterTime: '입장 시간',
        endTime: '종료 시간',
      },
      {
        raidRecordId: 2,
        score: 50,
        enterTime: '입장 시간',
        endTime: '종료 시간',
      },
      {
        raidRecordId: 3,
        score: 0,
        enterTime: '입장 시간',
        endTime: '종료 시간',
      },
    ],
  })
  @IsObject({ each: true })
  @IsNotEmptyObject({ nullable: false }, { each: true })
  @IsNotEmpty()
  readonly bossRaidHistory: BossRaidRecord[];
}
