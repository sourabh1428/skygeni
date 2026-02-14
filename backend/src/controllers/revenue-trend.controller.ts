import { Request, Response } from 'express';
import * as revenueTrendService from '../services/revenue-trend.service';

export async function get(_req: Request, res: Response): Promise<void> {
  try {
    const data = await revenueTrendService.getRevenueTrend();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
