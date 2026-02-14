import { Router } from 'express';
import * as summaryController from '../controllers/summary.controller';
import * as driversController from '../controllers/drivers.controller';
import * as riskFactorsController from '../controllers/risk-factors.controller';
import * as recommendationsController from '../controllers/recommendations.controller';
import * as revenueTrendController from '../controllers/revenue-trend.controller';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    routes: ['/api/summary', '/api/drivers', '/api/risk-factors', '/api/recommendations', '/api/revenue-trend'],
  });
});
router.get('/summary', summaryController.get);
router.get('/drivers', driversController.get);
router.get('/risk-factors', riskFactorsController.get);
router.get('/recommendations', recommendationsController.get);
router.get('/revenue-trend', revenueTrendController.get);

export default router;
