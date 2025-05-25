import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  category!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 