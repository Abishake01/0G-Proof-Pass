import { Router } from 'express';
import { computeService } from '../services/compute.js';

const router = Router();

// Analyze contribution
router.post('/analyze', async (req, res) => {
  try {
    const { photos, feedback, eventId, walletAddress } = req.body;
    
    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ error: 'Photos array is required' });
    }
    
    if (!feedback || typeof feedback !== 'string') {
      return res.status(400).json({ error: 'Feedback text is required' });
    }
    
    if (!eventId || !walletAddress) {
      return res.status(400).json({ error: 'Event ID and wallet address are required' });
    }
    
    const analysis = await computeService.analyzeContribution({
      photos,
      feedback,
      eventId,
      walletAddress,
    });
    
    res.json(analysis);
  } catch (error: any) {
    console.error('Error in compute analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze contribution' });
  }
});

export default router;

