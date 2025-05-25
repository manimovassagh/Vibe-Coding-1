import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import expenseRoutes from './routes/expenseRoutes';

// Load environment variables
dotenv.config();


const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Expense Tracker API is running');
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.use('/expenses', expenseRoutes);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  }); 