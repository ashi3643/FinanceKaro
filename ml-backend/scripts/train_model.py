#!/usr/bin/env python3
"""
Model training script for FinanceKaro wealth prediction model.
This script can be run manually or scheduled via cron/CI.
"""

import sys
import os
import argparse
import json
from datetime import datetime
import pandas as pd

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_utils.model import WealthPredictionModel
from ml_utils.data_pipeline import DataPipeline
from database.supabase_client import get_supabase_client

def train_new_model(version: str, description: str = None, hyperparameters: dict = None):
    """
    Train a new model version and save it
    """
    print(f"🚀 Starting model training for version {version}")
    
    # Initialize components
    model = WealthPredictionModel()
    pipeline = DataPipeline()
    supabase = get_supabase_client()
    
    # Load training data
    print("📊 Loading training data...")
    data = pipeline.load_training_data()
    
    if data.empty:
        print("❌ No training data available. Exiting.")
        return False
    
    print(f"✅ Loaded {len(data)} samples for training")
    
    # Train model
    print("🧠 Training model...")
    metrics = model.train(data, version, hyperparameters)
    
    # Save model
    model_dir = "models"
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, f"wealth_model_{version}.h5")
    model.save(model_path)
    
    print(f"✅ Model saved to {model_path}")
    print(f"📈 Training metrics: {json.dumps(metrics, indent=2)}")
    
    # Store model version in database
    if supabase:
        try:
            model_record = {
                "id": str(os.urandom(16).hex()),
                "version": version,
                "description": description or f"Model trained on {datetime.now().strftime('%Y-%m-%d')}",
                "metrics": metrics,
                "created_at": datetime.utcnow().isoformat()
            }
            
            supabase.client.table("model_versions").insert(model_record).execute()
            print("✅ Model version stored in database")
        except Exception as e:
            print(f"⚠️  Failed to store model version in database: {e}")
    
    return True

def evaluate_model(version: str):
    """
    Evaluate an existing model
    """
    print(f"📊 Evaluating model version {version}")
    
    model_path = f"models/wealth_model_{version}.h5"
    
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False
    
    # Load model
    model = WealthPredictionModel(model_path)
    
    if not model.is_loaded():
        print("❌ Failed to load model")
        return False
    
    # Load test data
    pipeline = DataPipeline()
    data = pipeline.load_training_data()
    
    if data.empty:
        print("❌ No test data available")
        return False
    
    # Split data
    from sklearn.model_selection import train_test_split
    X, y = pipeline.preprocess_features(data)
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale test data
    if model.scaler:
        X_test_scaled = model.scaler.transform(X_test)
    else:
        X_test_scaled = X_test
    
    # Evaluate
    loss, mae, mse = model.model.evaluate(X_test_scaled, y_test, verbose=0)
    
    # Calculate R²
    y_pred = model.model.predict(X_test_scaled).flatten()
    from sklearn.metrics import r2_score
    r2 = r2_score(y_test, y_pred)
    
    print(f"📈 Evaluation results for {version}:")
    print(f"   Loss: {loss:.4f}")
    print(f"   MAE: {mae:.2f}")
    print(f"   MSE: {mse:.2f}")
    print(f"   R²: {r2:.4f}")
    
    return {
        "loss": float(loss),
        "mae": float(mae),
        "mse": float(mse),
        "r2": float(r2),
        "test_samples": len(X_test)
    }

def collect_training_data():
    """
    Collect and prepare training data from various sources
    """
    print("📥 Collecting training data...")
    
    pipeline = DataPipeline()
    supabase = get_supabase_client()
    
    # Collect data from predictions with feedback
    if supabase:
        try:
            # Get predictions with feedback
            response = supabase.client.table("model_predictions")\
                .select("*")\
                .not_.is_("feedback", "null")\
                .execute()
            
            predictions = response.data if hasattr(response, 'data') else []
            
            print(f"📋 Found {len(predictions)} predictions with feedback")
            
            # Process feedback for training data
            for pred in predictions:
                feedback = pred.get('feedback')
                input_features = pred.get('input_features', {})
                device_id = pred.get('device_id')
                
                # Convert feedback to training label
                # This is a simplified example - in production you'd have more sophisticated logic
                if feedback and 'accurate' in feedback.lower():
                    label = "accurate"
                elif feedback and 'inaccurate' in feedback.lower():
                    label = "inaccurate"
                else:
                    continue
                
                # Store as training data
                supabase.insert_training_data(
                    device_id=device_id,
                    features=input_features,
                    label=label
                )
                
            print("✅ Training data collection completed")
            
        except Exception as e:
            print(f"⚠️  Error collecting training data: {e}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description="FinanceKaro Model Training Pipeline")
    parser.add_argument("--action", choices=["train", "evaluate", "collect-data", "all"], 
                       default="all", help="Action to perform")
    parser.add_argument("--version", default=f"v1.{datetime.now().strftime('%Y%m%d')}",
                       help="Model version (default: v1.YYYYMMDD)")
    parser.add_argument("--description", help="Model description")
    parser.add_argument("--hyperparameters", type=json.loads,
                       default='{"epochs": 50, "batch_size": 32}',
                       help="Hyperparameters as JSON string")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("FinanceKaro Model Training Pipeline")
    print("=" * 60)
    
    if args.action in ["train", "all"]:
        success = train_new_model(
            version=args.version,
            description=args.description,
            hyperparameters=args.hyperparameters
        )
        if not success:
            print("❌ Training failed")
            sys.exit(1)
    
    if args.action in ["evaluate", "all"]:
        evaluate_model(args.version)
    
    if args.action in ["collect-data", "all"]:
        collect_training_data()
    
    print("=" * 60)
    print("✅ Pipeline completed successfully")
    print("=" * 60)

if __name__ == "__main__":
    main()