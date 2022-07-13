import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RaidRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  enterTime: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  endTime: Date;

  @Column()
  score: number;

  @Column()
  level: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.raids, {
    nullable: false,
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
