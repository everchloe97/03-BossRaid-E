import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ description: '이메일', example: 'test@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: '비밀번호 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 6~20글자의 영문과 숫자만 가능합니다.',
  })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    description: '닉네임 (2~16 한글/영문/숫자)',
    example: '한글nickname123',
  })
  @MinLength(2)
  @MaxLength(16)
  @Matches(/^[ㄱ-ㅎ가-힣a-zA-Z0-9]*$/, {
    message: '닉네임은 2~16글자의 영문과 숫자만 가능합니다.',
  })
  @IsNotEmpty()
  readonly nickname: string;

  @ApiProperty({
    description: '비밀번호 확인 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 6~20글자에 영문과 숫자만 가능합니다.',
  })
  @IsNotEmpty()
  readonly confirmPassword: string;
}
