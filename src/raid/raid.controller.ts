import { Body, CACHE_MANAGER, Controller, Get, Inject, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { RaidEndDto } from './dto/raidEnd.dto';
import { RaidStatus } from './dto/raidStatus.dto';
import { RaidService } from './raid.service';
import { CreateRaidDTO } from './dto/createRaid.dto';

import { GetUser } from 'src/common/getUserDecorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/passport/guard/jwtAuthGuard';
import { MSG } from 'src/common/response.enum';
import { RequestRaidDto } from './dto/requestRaid.dto';

@ApiBearerAuth('access_token')
@UseGuards(JwtAuthGuard)
@ApiTags('BossRaid')
@Controller('bossRaid')
export class RaidController {
  constructor(
    private readonly raidService: RaidService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /* 
    작성자 : 김태영
  */
  @ApiCreatedResponse({
    status: MSG.getRaidStatus.code,
    description: MSG.getRaidStatus.msg,
  })
  @Get()
  async getRaidStatus() {
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

  @ApiBody({ type: CreateRaidDTO })
  @ApiCreatedResponse({
    description: MSG.enterBossRaid.msg,
  })
  @Post('enter')
  async enterRaid(@Body() createRaidDto: CreateRaidDTO) {
    const result = await this.raidService.enterBossRaid(createRaidDto);
    // 캐시에 항목 추가

    return result;
  }

  /* 
    작성자 : 김용민
  */
  @ApiBody({ type: RaidEndDto })
  @Patch('end')
  endRaid(@Body() raidEndDto: RaidEndDto) {
    return this.raidService.endRaid(raidEndDto);
  }

  /* 
    작성자 : 염하늘
  */
  //  @ApiBody({ type: RequestRaidDto })
    @Post('topRankerList')
    topRankerList(@Body() dto: RequestRaidDto) {
      const result = this.raidService.rankRaid(dto);
      return result
    }
}
