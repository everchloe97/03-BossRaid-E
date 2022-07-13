import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  Get,
  ValidationPipe,
  Req,
  Inject,
  CACHE_MANAGER,
  Param,
} from '@nestjs/common';
import { JwtRefreshGuard } from 'src/auth/passport/guard/jwtRefreshGuard';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/user/dto/login.dto';
import { UserResponse } from 'src/user/dto/login.response';
import { CreateUserDTO } from './dto/createUser.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { LocalAuthGuard } from 'src/auth/passport/guard/localAuthGuard';
import { GetUser } from 'src/common/getUserDecorator';
import { MSG } from 'src/common/response.enum';
import { defaultTokenOption } from 'src/common/tokenOption.interface';
import { JwtAuthGuard } from 'src/auth/passport/guard/jwtAuthGuard';
import { Cache } from 'cache-manager';

/* 
  작성자 : 박신영, 김용민
*/
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER)
    cacheManager: Cache,
  ) {}

  /* 
    - 사용자를 생성하여 회원가입 처리
  */
  @Post('')
  @ApiBody({ type: CreateUserDTO })
  @ApiCreatedResponse({ description: MSG.createUser.msg, type: UserResponse })
  async signUp(@Body() createUserDto: CreateUserDTO) {
    const result = await this.userService.createUser(createUserDto);

    return UserResponse.response(result, MSG.createUser.code, MSG.createUser.msg);
  }

  /**
   * 작성자 : 김지유
   * 유저 정보 조회
   */
  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Get('/:userId')
  @ApiCreatedResponse({ description: MSG.getUser.msg, type: UserResponse })
  async getUserInfo(@Param('userId') userId: number) {
    const result = await this.userService.getUserInfo(userId);

    return UserResponse.response(result, MSG.getUser.code, MSG.getUser.msg);
  }

  /* 
    - access token, resfresh token 발급하여 로그인 처리
  */
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ description: MSG.loginUser.msg, type: UserResponse })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res({ passthrough: true }) res: Response, @GetUser() user: User) {
    const { accessToken, accessOption, refreshToken, refreshOption } = await this.authService.getTokens(user.email);

    await this.userService.setCurrentRefreshToken(refreshToken, user.email);

    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);
    const result = accessToken;
    return UserResponse.response(result, MSG.loginUser.code, MSG.loginUser.msg);
  }

  /* 
    - 토큰을 제거하여 로그아웃 기능 구현
  */
  @ApiBearerAuth('access_token')
  @ApiCreatedResponse({ description: '성공' })
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: User) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(user.id);

    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);

    const result = UserResponse.response(user, MSG.logoutUser.code, MSG.logoutUser.msg);
    return result;
  }

  /* 
    - 리프레시 토큰으로 액세스 토큰 재요청
  */
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('access_token')
  @Get('/refreshToken')
  async refresh(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
    const accessToken = await this.authService.getJwtAccessToken(user.email);
    const accessOption = defaultTokenOption;

    res.cookie('Authentication', accessToken, accessOption);
    const result = UserResponse.response(user, MSG.refreshTokenWithUser.code, MSG.refreshTokenWithUser.msg);
    return result;
  }
}
