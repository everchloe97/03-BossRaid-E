import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/createUser.dto';

import { User } from '../entities/user.entity';
import { UserService } from '../user.service';

type MockUserRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUserRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userMockRepository: MockUserRepository<User>;

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
  beforeEach(async () => {
    const userModule: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    userService = userModule.get<UserService>(UserService);
    userMockRepository = userModule.get('UserRepository') as MockUserRepository<User>;
  });

  describe('회원 가입', () => {
    it('회원 가입 검증', async () => {
      const userData = {
        email: 'test1@naver.com',
        nickname: '한글nickname1234',
        password: 'abcd1234',
        confirmPassword: 'abcd1234',
      };

      userMockRepository.create.mockResolvedValue(userData);
      const UserRepositorySpySave = jest.spyOn(userMockRepository, 'save');
      const UserRepositorySpyCreate = jest.spyOn(userMockRepository, 'create');

      const result = await userService.createUser(userData as CreateUserDTO);
      expect(result.email).toStrictEqual(userData.email);
      expect(result.nickname).toStrictEqual(userData.nickname);
      expect(UserRepositorySpySave).toBeCalledTimes(1);
      expect(UserRepositorySpyCreate).toBeCalledTimes(1);
    });

    it('비밀번호 불일치시', async () => {
      const userData = {
        email: 'test2@naver.com',
        nickname: '한글nickname1234',
        password: 'abcd1234',
        confirmPassword: '1234abcd',
      };

      const UserRepositorySpySave = jest.spyOn(userMockRepository, 'save');
      const UserRepositorySpyCreate = jest.spyOn(userMockRepository, 'create');
      try {
        await userService.createUser(userData as CreateUserDTO);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }

      expect(UserRepositorySpySave).toBeCalledTimes(0);
      expect(UserRepositorySpyCreate).toBeCalledTimes(0);
    });

    it('비밀번호 길이 불일치', async () => {
      const userData = {
        email: 'test3@naver.com',
        nickname: '한글nickname1234',
        password: 'abc',
        confirmPassword: 'abc',
      };

      const UserRepositorySpySave = jest.spyOn(userMockRepository, 'save');
      const UserRepositorySpyCreate = jest.spyOn(userMockRepository, 'create');
      try {
        await userService.createUser(userData as CreateUserDTO);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }

      expect(UserRepositorySpySave).toBeCalledTimes(1);
      expect(UserRepositorySpyCreate).toBeCalledTimes(1);
    });

    it('이미 존재하는 이메일일 때', async () => {
      const userData = {
        email: 'test1@naver.com',
        nickname: '한글nickname1234',
        password: 'abc1234',
        confirmPassword: 'abc1234',
      };
      const UserRepositorySpySave = jest.spyOn(userMockRepository, 'save');
      const UserRepositorySpyCreate = jest.spyOn(userMockRepository, 'create');
      try {
        await userService.createUser(userData as CreateUserDTO);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }

      expect(UserRepositorySpySave).toBeCalledTimes(1);
      expect(UserRepositorySpyCreate).toBeCalledTimes(1);
    });
  });

  describe('회원 조회', () => {
    it('id로 유저 총 점수 및 레이드 기록 조회 검증', async () => {
      const id = 1;
      const dbData = [
        {
          totalScore: 80,
          raids: [
            {
              id: 1,
              enterTime: new Date('2022-07-06T14:49:09.929Z'),
              endTime: new Date('2022-07-06T14:50:09.929Z'),
              score: 30,
              level: 0,
              userId: 1,
            },
            {
              id: 2,
              enterTime: new Date('2022-07-06T14:51:09.929Z'),
              endTime: new Date('2022-07-06T14:53:09.929Z'),
              score: 50,
              level: 1,
              userId: 1,
            },
            {
              id: 3,
              enterTime: new Date('2022-07-06T14:54:09.929Z'),
              endTime: new Date('2022-07-06T14:57:09.929Z'),
              score: 0,
              level: 2,
              userId: 1,
            },
          ],
        },
      ];

      const { totalScore, raids } = dbData[0];
      const bossRaidHistory = raids.map(({ id: raidRecordId, score, enterTime, endTime }) => ({
        raidRecordId,
        score,
        enterTime,
        endTime,
      }));

      userMockRepository.find.mockResolvedValue(dbData);
      const UserRepositorySpyfind = jest.spyOn(userMockRepository, 'find');
      const result = await userService.getUserInfo(id);

      expect(result).toStrictEqual({ totalScore, bossRaidHistory });
      expect(UserRepositorySpyfind).toBeCalledTimes(1);
      expect(UserRepositorySpyfind).toBeCalledWith({
        where: { id },
        relations: ['raids'],
        select: ['totalScore'],
      });
    });

    it('id가 유효하지 않음', async () => {
      const id = 0;
      const dbData = [];

      userMockRepository.find.mockResolvedValue(dbData);
      const UserRepositorySpyfind = jest.spyOn(userMockRepository, 'find');

      try {
        await userService.getUserInfo(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(UserRepositorySpyfind).toBeCalledTimes(1);
      expect(UserRepositorySpyfind).toBeCalledWith({
        where: { id },
        relations: ['raids'],
        select: ['totalScore'],
      });
    });

    it('email로 유저정보 조회 검증', async () => {
      const email = 'team02@naver.com';
      const dbData = {
        id: 1,
        email: 'team02@naver.com',
        password: 'abcd1234',
        createdAt: new Date('2022-07-06T14:49:09.929Z'),
        updatedAt: new Date('2022-07-06T14:49:09.929Z'),
      };

      userMockRepository.findOne.mockResolvedValue(dbData);
      const UserRepositorySpyfindOne = jest.spyOn(userMockRepository, 'findOne');
      const result = await userService.getUserByEmail(email);
      expect(result).toStrictEqual(dbData);
      expect(UserRepositorySpyfindOne).toBeCalledTimes(1);
    });

    it('email이 유효하지 않음', async () => {
      const email = 'abc@gmail.com';
      userMockRepository.findOne.mockRejectedValue(new BadRequestException());
      const UserRepositorySpyfindOne = jest.spyOn(userMockRepository, 'findOne');

      try {
        await userService.getUserByEmail(email);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
      expect(UserRepositorySpyfindOne).toBeCalledTimes(1);
    });
  });

  describe('refresh token 관리', () => {
    // it('refreshToken 암호화 및 저장', () => {
    //   // const result = setCurrentRefreshToken(refreshToken, email) {
    //   //
    //   // }
    //   return;
    // });

    // it('refreshToken 유효성 확인', () => {

    // });

    it('refreshToken 삭제', async () => {
      const id = 1;
      userMockRepository.update.mockResolvedValue(null);
      const UserRepositorySpyUpdate = jest.spyOn(userMockRepository, 'update');
      const result = await userService.removeRefreshToken(id);
      expect(result).toEqual(null);
      expect(UserRepositorySpyUpdate).toBeCalledTimes(1);
    });
  });
});
