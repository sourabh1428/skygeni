import { Request, Response } from 'express';
import * as recommendationsService from '../services/recommendations.service';

export async function get(_req: Request, res: Response): Promise<void> {
  try {
    const data = await recommendationsService.getRecommendations();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
