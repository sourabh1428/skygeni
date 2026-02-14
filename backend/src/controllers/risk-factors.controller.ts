import { Request, Response } from 'express';
import * as riskFactorsService from '../services/risk-factors.service';

export async function get(_req: Request, res: Response): Promise<void> {
  try {
    const data = await riskFactorsService.getRiskFactors();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
