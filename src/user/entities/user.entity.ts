import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { RaidRecord } from 'src/raid/entities/raid.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '이메일', example: 'test@mail.com' })
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ description: '닉네임', example: '한글nickname123' })
  @Column({ unique: true })
  nickname: string;

  @ApiProperty({ description: '총 점수' })
  @Column({ default: 0 })
  totalScore: number;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  hashedRefreshToken!: 'string';

  @OneToMany(() => RaidRecord, (raidRecord) => raidRecord.user, {
    nullable: true,
  })
  raids: RaidRecord[];
}
