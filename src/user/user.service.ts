import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/createUser.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { compare } from 'bcryptjs';
import { ErrorType } from 'src/common/error.enum';
import { BossRaidRecord, UserInfoDTO } from './dto/userInfo.dto';

/* 
  작성자 : 김용민, 박신영
*/
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* 
    - 비밀번호 체크, 중복 이메일 확인 후 사용자를 추가합니다.
  */
  async createUser(createUserDto: CreateUserDTO): Promise<User> {
    const { email, password, nickname, confirmPassword } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException(ErrorType.confirmPasswordDoesNotMatch.msg);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      nickname,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException(ErrorType.emailExists.msg);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * 작성자 : 김지유
   * 유저의 id로 레이드 기록 및 총 점수를 조회합니다.
   */
  async getUserInfo(id: number): Promise<UserInfoDTO | undefined> {
    try {
      // version 1. 살짝 무식한 방법...
      // createQueryBuilder 디깅 후 Refactoring 예정
      // 유저의 총 점수 및 레이드 기록을 불러온 후, 레이드 기록을 Array.prototype.map() 으로 형태 가공
      const users = await this.userRepository.find({
        where: { id },
        relations: ['raids'],
        select: ['totalScore'],
      });

      if (!users.length) {
        throw new NotFoundException(ErrorType.userNotFound.msg);
      }

      const { totalScore, raids } = users[0];
      const bossRaidHistory = raids.map(({ id: raidRecordId, score, enterTime, endTime }) => ({
        raidRecordId,
        score,
        enterTime,
        endTime,
      }));

      const userInfo: UserInfoDTO = { totalScore, bossRaidHistory };

      console.log(userInfo);
      // const user = await this.userRepository
      //   .createQueryBuilder('user')
      //   .innerJoinAndSelect('user.raids', 'raids')
      //   .where('user.id = :id', { id })
      //   .orderBy('raids.endTime', 'ASC')
      //   .addSelect('user.totalScore', 'totalScore')
      //   .addSelect('raids.id', 'raidRecordId')
      //   .addSelect('raids.score', 'score')
      //   .addSelect('raids.enterTime', 'enterTime')
      //   .addSelect('raids.endTime', 'endTime')
      //   .setParameters({})
      //   .getMany();

      // console.log(user[0].raids);

      return userInfo;
    } catch (error) {
      console.error(error);
    }
  }

  /* 
    - 이메일로 사용자를 가져옵니다.
  */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(ErrorType.userNotFound.msg);
    }

    return user;
  }

  /* 
    - DB에 발급받은 Refresh Token을 암호화하여 저장(bycrypt)
  */
  async setCurrentRefreshToken(refreshToken: string, email: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ hashedRefreshToken })
      .where('email = :email', { email })
      .execute();
  }

  /* 
    - 데이터베이스 조회 후 Refresh Token이 유효한지 확인
  */
  async getUserRefreshTokenMatches(refreshToken: string, email: string) {
    const user = await this.getUserByEmail(email);
    const isRefreshTokenMatching = await compare(refreshToken, user.hashedRefreshToken);

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  /* 
    - Refresh Token 값을 null로 바꿈
  */
  async removeRefreshToken(id: number) {
    return await this.userRepository.update(id, {
      hashedRefreshToken: null,
    });
  }
}
