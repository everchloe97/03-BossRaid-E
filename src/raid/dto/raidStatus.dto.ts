import { ApiProperty } from '@nestjs/swagger';

export class RaidStatus {
  @ApiProperty({ description: '레이드 입장가능 여부', example: true })
  canEnter: boolean;

  @ApiProperty({ description: '레이드를 이미 진행중인 유저의 id', example: 1 })
  enteredUserId: number;

  @ApiProperty({ description: '진행중인 레이드 id', example: 1 })
  raidRecordId: number;
}
