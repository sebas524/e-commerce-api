import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', { unique: true })
  email: string;

  @Column('text', {
    // * so password doesnt appear in response:
    select: false,
  })
  password: string;
  @Column('text')
  name: string;
  @Column('text', { array: true, default: ['user'] })
  roles: string[];
  //   * we dont want to delete users, we just make them inactive so thats why we create this column as well:
  @Column('boolean', { default: true })
  isActive: boolean;
}
