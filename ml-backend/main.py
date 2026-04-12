from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import json
import numpy as np
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

# Import ML modules
from ml_utils.model import WealthPredictionModel
from ml_utils.data_pipeline import DataPipeline
from database.supabase_client import get_supabase_client

app = FastAPI(
    title="FinanceKaro ML Backend",
    description="Deep learning backend for financial predictions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://financekaro.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML components
model = WealthPredictionModel()
data_pipeline = DataPipeline()

# Request/Response Models
class PredictionRequest(BaseModel):
    device_id: Optional[str] = None
    monthly_amount: float
    years: int
    annual_return: float
    age: Optional[int] = None
    income: Optional[float] = None
    risk_tolerance: Optional[str] = "medium"
    financial_goals: Optional[List[str]] = None

class PredictionResponse(BaseModel):
    prediction_id: str
    predicted_wealth: float
    confidence: float
    recommendation: str
    model_version: str
    timestamp: str

class TrainingRequest(BaseModel):
    model_version: str = "v1.0"
    description: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None

class TrainingResponse(BaseModel):
    training_id: str
    status: str
    model_version: str
    metrics: Dict[str, Any]
    timestamp: str

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "FinanceKaro ML Backend",
        "status": "healthy",
        "model_loaded": model.is_loaded(),
        "model_version": model.get_version() if model.is_loaded() else "none"
    }

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Make a wealth prediction based on user inputs
    """
    try:
        # Prepare features
        features = {
            "monthly_amount": request.monthly_amount,
            "years": request.years,
            "annual_return": request.annual_return,
            "age": request.age or 30,
            "income": request.income or 50000,
            "risk_tolerance": request.risk_tolerance,
            "financial_goals": request.financial_goals or ["retirement"]
        }
        
        # Make prediction
        prediction, confidence = model.predict(features)
        
        # Generate recommendation
        recommendation = generate_recommendation(features, prediction)
        
        # Store prediction in database (async)
        prediction_id = str(uuid.uuid4())
        
        # Return response
        return PredictionResponse(
            prediction_id=prediction_id,
            predicted_wealth=prediction,
            confidence=confidence,
            recommendation=recommendation,
            model_version=model.get_version(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Training endpoint (trigger training)
@app.post("/train", response_model=TrainingResponse)
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """
    Trigger model training with latest data
    """
    try:
        training_id = str(uuid.uuid4())
        
        # Start training in background
        background_tasks.add_task(
            train_model_task,
            training_id,
            request.model_version,
            request.description,
            request.hyperparameters
        )
        
        return TrainingResponse(
            training_id=training_id,
            status="started",
            model_version=request.model_version,
            metrics={},
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed to start: {str(e)}")

# Get model info
@app.get("/model/info")
async def get_model_info():
    """
    Get information about the current model
    """
    return {
        "loaded": model.is_loaded(),
        "version": model.get_version() if model.is_loaded() else "none",
        "last_trained": model.get_last_trained() if model.is_loaded() else None,
        "metrics": model.get_metrics() if model.is_loaded() else {}
    }

# Helper functions
def generate_recommendation(features: Dict[str, Any], prediction: float) -> str:
    """
    Generate personalized recommendation based on prediction
    """
    monthly_amount = features["monthly_amount"]
    years = features["years"]
    
    if prediction < monthly_amount * years * 12 * 0.8:
        return "Consider increasing your monthly investment or exploring higher-return options."
    elif prediction > monthly_amount * years * 12 * 1.5:
        return "Great! Your current strategy is working well. Consider diversifying your portfolio."
    else:
        return "You're on track. Regular investments and patience will help you reach your goals."

async def train_model_task(training_id: str, version: str, description: str, hyperparameters: Dict[str, Any]):
    """
    Background task for model training
    """
    try:
        # Load and prepare data
        data = await data_pipeline.load_training_data()
        
        # Train model
        metrics = model.train(data, version, hyperparameters)
        
        # Save model
        model.save(f"models/wealth_model_{version}.h5")
        
        # Update database with training results
        supabase = get_supabase_client()
        if supabase:
            supabase.table("model_versions").insert({
                "id": str(uuid.uuid4()),
                "version": version,
                "description": description,
                "metrics": metrics,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
    except Exception as e:
        print(f"Training task failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)