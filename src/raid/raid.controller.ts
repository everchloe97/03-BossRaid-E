import { Body, CACHE_MANAGER, Controller, Get, Inject, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { RaidEndDto } from './dto/raidEnd.dto';
import { RaidStatus } from './dto/raidStatus.dto';
import { RaidService } from './raid.service';
import { RaidEnterDto } from './dto/raidEnter.dto';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/passport/guard/jwtAuthGuard';
import { MSG } from 'src/common/response.enum';
import { TopRankerListDto } from './dto/topRankerList.dto';

@ApiBearerAuth('access_token')
@UseGuards(JwtAuthGuard)
@ApiTags('BossRaid')
@Controller('bossRaid')
export class RaidController {
  constructor(
    private readonly raidService: RaidService,
  ) {}

  /**
   * @작성자 김태영
   * @description 레이드 상태 조회 컨트롤러
  */
  @ApiCreatedResponse({
    status: MSG.getRaidStatus.code,
    description: MSG.getRaidStatus.msg,
  })
  @Get()
  async getRaidStatus(): Promise<RaidStatus> {
    try {
      // 레디스 조회시 결과
      const redisResult: RaidStatus = await this.raidService.getStatusFromRedis();

      return redisResult;
    } catch (error) {
      console.log(error);
      //레디스 에러 시 DB에서의 상태 조회 결과
      const dbResult = await this.raidService.getStatusFromDB();
      return dbResult;
    }
  }

  /**
   * @작성자 박신영
   * @description 레이드 시작 컨트롤러
  */
  @ApiBody({ type: RaidEnterDto })
  @ApiCreatedResponse({
    description: MSG.enterBossRaid.msg,
  })
  @Post('enter')
  async enterRaid(@Body() raidEnterDto: RaidEnterDto) {
    const result = await this.raidService.enterBossRaid(raidEnterDto);
    // 캐시에 항목 추가

    return result;
  }

  /**
   * @작성자 김용민
   * @description 레이드 종료 컨트롤러
  */
  @ApiBody({ type: RaidEndDto })
  @Patch('end')
  endRaid(@Body() raidEndDto: RaidEndDto): Promise<void> {
    return this.raidService.endRaid(raidEndDto);
  }

  /**
   * @작성자 염하늘
   * @description 레이드 유저 랭킹 조회 컨트롤러
  */
  @ApiBody({ type: TopRankerListDto })
  @Post('topRankerList')
  topRankerList(@Body() dto: TopRankerListDto) {
    const result = this.raidService.rankRaid(dto);
    return result;
  }
}
