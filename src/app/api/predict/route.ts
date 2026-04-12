import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Backend ML service URL (could be environment variable)
const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { monthlyAmount, years, annualReturn, deviceId, age, income, riskTolerance, financialGoals } = body;
    
    if (!monthlyAmount || !years || !annualReturn) {
      return NextResponse.json(
        { error: 'Missing required fields: monthlyAmount, years, annualReturn' },
        { status: 400 }
      );
    }
    
    // Prepare request to ML backend
    const mlRequest = {
      device_id: deviceId,
      monthly_amount: parseFloat(monthlyAmount),
      years: parseInt(years),
      annual_return: parseFloat(annualReturn),
      age: age ? parseInt(age) : undefined,
      income: income ? parseFloat(income) : undefined,
      risk_tolerance: riskTolerance || 'medium',
      financial_goals: financialGoals || ['retirement']
    };
    
    // Call ML backend
    const response = await fetch(`${ML_BACKEND_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlRequest),
    });
    
    if (!response.ok) {
      // Fallback to local calculation if ML backend is unavailable
      console.warn('ML backend unavailable, using fallback calculation');
      return handleFallbackPrediction(mlRequest);
    }
    
    const predictionResult = await response.json();
    
    // Store prediction in Supabase if deviceId is provided
    if (deviceId && supabase) {
      try {
        // Get latest model version
        const { data: modelVersions } = await supabase
          .from('model_versions')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);
        
        const modelVersionId = modelVersions?.[0]?.id || null;
        
        // Store prediction
        await supabase.from('model_predictions').insert({
          device_id: deviceId,
          model_version_id: modelVersionId,
          input_features: mlRequest,
          prediction: predictionResult.predicted_wealth.toString(),
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to store prediction:', dbError);
        // Continue even if DB storage fails
      }
    }
    
    return NextResponse.json({
      success: true,
      prediction: predictionResult.predicted_wealth,
      confidence: predictionResult.confidence,
      recommendation: predictionResult.recommendation,
      modelVersion: predictionResult.model_version,
      timestamp: predictionResult.timestamp
    });
    
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'FinanceKaro Prediction API',
    status: 'operational',
    endpoints: {
      POST: '/api/predict - Make a wealth prediction',
    },
    ml_backend: ML_BACKEND_URL
  });
}

// Fallback prediction using compound interest formula
function handleFallbackPrediction(request: any) {
  const { monthly_amount, years, annual_return } = request;
  
  // Compound interest formula: A = P * [((1 + r)^n - 1) / r]
  const monthlyRate = annual_return / 100 / 12;
  const months = years * 12;
  
  let futureValue;
  if (monthlyRate === 0) {
    futureValue = monthly_amount * months;
  } else {
    futureValue = monthly_amount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  }
  
  // Generate recommendation
  const recommendation = generateFallbackRecommendation(request, futureValue);
  
  return NextResponse.json({
    success: true,
    prediction: Math.round(futureValue),
    confidence: 0.7,
    recommendation,
    modelVersion: 'fallback-v1.0',
    timestamp: new Date().toISOString(),
    note: 'Using fallback calculation (ML backend unavailable)'
  });
}

function generateFallbackRecommendation(request: any, prediction: number): string {
  const { monthly_amount, years, annual_return } = request;
  
  const expected = monthly_amount * years * 12;
  
  if (prediction < expected * 0.8) {
    return 'Consider increasing your monthly investment or exploring higher-return options.';
  } else if (prediction > expected * 1.5) {
    return 'Great! Your current strategy is working well. Consider diversifying your portfolio.';
  } else {
    return 'You\'re on track. Regular investments and patience will help you reach your goals.';
  }
}