import { DataSource } from 'typeorm';
import { Expense } from './Expense';

describe('Expense Entity', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'vibeuser',
      password: process.env.DB_PASSWORD || 'vibepassword',
      database: process.env.DB_DATABASE || 'vibedb',
      synchronize: true,
      entities: [Expense],
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create and retrieve an Expense entity', async () => {
    const repo = dataSource.getRepository(Expense);
    const expense = repo.create({
      title: 'Test Expense',
      amount: 123.45,
      category: 'Test',
      date: '2024-06-01',
      description: 'Test description',
    });
    const saved = await repo.save(expense);
    expect(saved.id).toBeDefined();
    expect(saved.title).toBe('Test Expense');
    expect(saved.amount).toBeCloseTo(123.45);
    expect(saved.category).toBe('Test');
    expect(saved.date).toBe('2024-06-01');
    expect(saved.description).toBe('Test description');

    const found = await repo.findOneBy({ id: saved.id });
    expect(found).not.toBeNull();
    expect(found?.title).toBe('Test Expense');
  });
}); 