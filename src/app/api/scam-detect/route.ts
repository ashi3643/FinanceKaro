import { NextRequest, NextResponse } from 'next/server';

// Pattern-based scam detection (fallback when NLP model is not available)
const SCAM_PATTERNS = [
  {
    pattern: /urgent|immediate|act now|limited time|expiring soon/i,
    name: 'Urgency Language',
    weight: 0.3
  },
  {
    pattern: /pay.*fee|advance.*payment|processing.*fee|registration.*fee|setup.*fee/i,
    name: 'Advance Fee Request',
    weight: 0.8
  },
  {
    pattern: /guaranteed.*return|100%.*profit|risk.*free|no.*loss/i,
    name: 'Guaranteed Returns Claim',
    weight: 0.7
  },
  {
    pattern: /bitcoins?|crypto|investment.*scheme|double.*your.*money/i,
    name: 'Crypto/Investment Scheme',
    weight: 0.6
  },
  {
    pattern: /kyc.*update|account.*blocked|verify.*identity|suspended.*account/i,
    name: 'Account Verification Scam',
    weight: 0.9
  },
  {
    pattern: /work.*from.*home|part.*time.*job|earn.*daily|task.*based.*job/i,
    name: 'Work-from-Home Fraud',
    weight: 0.7
  },
  {
    pattern: /lottery.*winner|inheritance|prize.*claim|won.*million/i,
    name: 'Lottery/Inheritance Scam',
    weight: 0.8
  },
  {
    pattern: /\.xyz|\.net.*bank|\.com.*support|unofficial|fake/i,
    name: 'Suspicious Domain',
    weight: 0.9
  },
  {
    pattern: /whatsapp|telegram|signal.*only|no.*phone.*call/i,
    name: 'Chat-Only Communication',
    weight: 0.5
  },
  {
    pattern: /send.*screenshot|share.*otp|verify.*with.*code/i,
    name: 'Sensitive Data Request',
    weight: 0.95
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, text } = body;

    let textToAnalyze = text || '';

    // If image data is provided, in a real implementation you would:
    // 1. Use OCR (Optical Character Recognition) to extract text
    // 2. For now, we'll use a placeholder since OCR requires additional services
    if (imageData) {
      // In production, integrate with:
      // - Google Cloud Vision API
      // - AWS Textract
      // - Tesseract.js (client-side)
      textToAnalyze = '[Image analysis - OCR would extract text here]';
    }

    // Pattern-based detection
    const detectedPatterns: string[] = [];
    let totalWeight = 0;

    for (const scamPattern of SCAM_PATTERNS) {
      if (scamPattern.pattern.test(textToAnalyze)) {
        detectedPatterns.push(scamPattern.name);
        totalWeight += scamPattern.weight;
      }
    }

    // Calculate scam probability
    const scamProbability = Math.min(totalWeight, 1);
    const confidence = Math.round(scamProbability * 100);
    const isScam = confidence >= 50;

    // Determine scam pattern type
    let patternType = 'Unknown Pattern';
    if (detectedPatterns.includes('Advance Fee Request')) {
      patternType = 'Advance Fee Fraud';
    } else if (detectedPatterns.includes('Account Verification Scam')) {
      patternType = 'Phishing / Account Takeover';
    } else if (detectedPatterns.includes('Work-from-Home Fraud')) {
      patternType = 'Task Fraud / Job Scam';
    } else if (detectedPatterns.includes('Guaranteed Returns Claim')) {
      patternType = 'Investment Fraud';
    } else if (detectedPatterns.includes('Crypto/Investment Scheme')) {
      patternType = 'Cryptocurrency Scam';
    } else if (detectedPatterns.includes('Lottery/Inheritance Scam')) {
      patternType = 'Lottery / Inheritance Fraud';
    }

    return NextResponse.json({
      isScam,
      confidence,
      pattern: patternType,
      redFlags: detectedPatterns.length > 0 ? detectedPatterns : ['No clear scam patterns detected'],
      analysis: {
        patternsFound: detectedPatterns.length,
        totalWeight,
        textLength: textToAnalyze.length
      }
    });

  } catch (error) {
    console.error('Scam detection error:', error);
    return NextResponse.json(
      { error: 'Scam detection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
