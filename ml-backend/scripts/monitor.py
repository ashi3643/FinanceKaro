#!/usr/bin/env python3
"""
Monitoring script for FinanceKaro ML models.
Checks model performance, data drift, and triggers retraining if needed.
"""

import sys
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
from typing import Dict, Any, Optional
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.supabase_client import get_supabase_client

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ModelMonitor:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.ml_backend_url = os.getenv('ML_BACKEND_URL', 'http://localhost:8000')
        
    def check_model_health(self) -> Dict[str, Any]:
        """Check if the ML backend is healthy"""
        try:
            response = requests.get(f"{self.ml_backend_url}/health", timeout=5)
            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "response_time": response.elapsed.total_seconds(),
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "status": "unhealthy",
                    "status_code": response.status_code,
                    "timestamp": datetime.utcnow().isoformat()
                }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unreachable",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def check_data_drift(self, window_days: int = 30) -> Dict[str, Any]:
        """Check for data drift in recent predictions vs training data"""
        try:
            if not self.supabase:
                return {"error": "Supabase client not available"}
            
            # Get recent predictions
            recent_predictions = self.supabase.client.table("model_predictions")\
                .select("*")\
                .gte('created_at', (datetime.utcnow() - timedelta(days=window_days)).isoformat())\
                .execute()
            
            predictions_data = recent_predictions.data if hasattr(recent_predictions, 'data') else []
            
            if not predictions_data:
                return {"status": "no_recent_data", "message": f"No predictions in last {window_days} days"}
            
            # Extract features from predictions
            features_list = []
            for pred in predictions_data:
                input_features = pred.get('input_features', {})
                if input_features:
                    features_list.append(input_features)
            
            if not features_list:
                return {"status": "no_features", "message": "No features in recent predictions"}
            
            # Convert to DataFrame for analysis
            df_recent = pd.DataFrame(features_list)
            
            # Get training data statistics (from a sample)
            training_data = self.supabase.get_training_data(limit=1000)
            df_training = pd.DataFrame(training_data) if training_data else pd.DataFrame()
            
            drift_metrics = {}
            
            if not df_training.empty and not df_recent.empty:
                # Compare distributions for numeric features
                numeric_features = ['monthly_amount', 'years', 'annual_return', 'age', 'income']
                
                for feature in numeric_features:
                    if feature in df_training.columns and feature in df_recent.columns:
                        # Calculate KL divergence or simple statistical difference
                        train_mean = df_training[feature].mean()
                        recent_mean = df_recent[feature].mean()
                        train_std = df_training[feature].std()
                        recent_std = df_recent[feature].std()
                        
                        # Simple drift detection: significant change in mean or std
                        mean_diff_pct = abs((recent_mean - train_mean) / train_mean * 100) if train_mean != 0 else 0
                        std_diff_pct = abs((recent_std - train_std) / train_std * 100) if train_std != 0 else 0
                        
                        drift_metrics[feature] = {
                            "train_mean": float(train_mean),
                            "recent_mean": float(recent_mean),
                            "mean_diff_pct": float(mean_diff_pct),
                            "train_std": float(train_std),
                            "recent_std": float(recent_std),
                            "std_diff_pct": float(std_diff_pct),
                            "drift_detected": mean_diff_pct > 20 or std_diff_pct > 30  # Thresholds
                        }
            
            # Check prediction feedback
            feedback_counts = {}
            for pred in predictions_data:
                feedback = pred.get('feedback')
                if feedback:
                    feedback_counts[feedback] = feedback_counts.get(feedback, 0) + 1
            
            total_feedback = sum(feedback_counts.values())
            accuracy_rate = 0
            if total_feedback > 0:
                accurate_feedback = feedback_counts.get('accurate', 0) + feedback_counts.get('Accurate', 0)
                accuracy_rate = accurate_feedback / total_feedback
            
            return {
                "status": "analyzed",
                "window_days": window_days,
                "total_predictions": len(predictions_data),
                "drift_metrics": drift_metrics,
                "feedback_stats": {
                    "total_feedback": total_feedback,
                    "accuracy_rate": accuracy_rate,
                    "breakdown": feedback_counts
                },
                "drift_detected": any(
                    metric.get("drift_detected", False) 
                    for metric in drift_metrics.values()
                ) or accuracy_rate < 0.7,  # Threshold for low accuracy
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Data drift check failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def check_model_performance(self) -> Dict[str, Any]:
        """Check current model performance metrics"""
        try:
            response = requests.get(f"{self.ml_backend_url}/model/info", timeout=5)
            if response.status_code == 200:
                model_info = response.json()
                return {
                    "status": "success",
                    "model_info": model_info,
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "status_code": response.status_code,
                    "timestamp": datetime.utcnow().isoformat()
                }
        except Exception as e:
            logger.error(f"Model performance check failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def trigger_retraining(self, reason: str) -> Dict[str, Any]:
        """Trigger model retraining"""
        try:
            version = f"v1.{datetime.now().strftime('%Y%m%d_%H%M')}"
            
            response = requests.post(
                f"{self.ml_backend_url}/train",
                json={
                    "model_version": version,
                    "description": f"Retrained due to: {reason}",
                    "hyperparameters": {
                        "epochs": 100,
                        "batch_size": 32
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Retraining triggered: {result}")
                return {
                    "status": "triggered",
                    "training_id": result.get("training_id"),
                    "model_version": version,
                    "reason": reason,
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                logger.error(f"Failed to trigger retraining: {response.status_code}")
                return {
                    "status": "failed",
                    "status_code": response.status_code,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error triggering retraining: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def run_monitoring_cycle(self) -> Dict[str, Any]:
        """Run complete monitoring cycle"""
        logger.info("Starting monitoring cycle")
        
        results = {
            "health": self.check_model_health(),
            "performance": self.check_model_performance(),
            "data_drift": self.check_data_drift(),
            "actions_taken": [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Check if retraining is needed
        drift_detected = results["data_drift"].get("drift_detected", False)
        accuracy_rate = results["data_drift"].get("feedback_stats", {}).get("accuracy_rate", 1.0)
        
        retraining_reasons = []
        
        if drift_detected:
            retraining_reasons.append("data_drift")
        
        if accuracy_rate < 0.7:  # 70% accuracy threshold
            retraining_reasons.append(f"low_accuracy_{accuracy_rate:.2f}")
        
        # Check if model is more than 30 days old
        model_info = results["performance"].get("model_info", {})
        last_trained = model_info.get("last_trained")
        if last_trained:
            try:
                last_trained_date = datetime.fromisoformat(last_trained.replace('Z', '+00:00'))
                days_since_training = (datetime.utcnow() - last_trained_date).days
                if days_since_training > 30:
                    retraining_reasons.append(f"stale_model_{days_since_training}_days")
            except:
                pass
        
        # Trigger retraining if needed
        if retraining_reasons:
            reason = ", ".join(retraining_reasons)
            retrain_result = self.trigger_retraining(reason)
            results["actions_taken"].append({
                "action": "retraining_triggered",
                "reason": reason,
                "result": retrain_result
            })
            logger.info(f"Retraining triggered: {reason}")
        
        # Log results
        logger.info(f"Monitoring cycle completed: {json.dumps(results, indent=2)}")
        
        # Store monitoring results
        self.store_monitoring_results(results)
        
        return results
    
    def store_monitoring_results(self, results: Dict[str, Any]):
        """Store monitoring results in database"""
        try:
            if self.supabase:
                monitoring_record = {
                    "id": str(os.urandom(16).hex()),
                    "results": results,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                # Create monitoring table if it doesn't exist
                # For now, we'll just log it
                logger.info(f"Monitoring results: {json.dumps(monitoring_record, indent=2)}")
                
        except Exception as e:
            logger.error(f"Failed to store monitoring results: {e}")

def main():
    """Main monitoring function"""
    parser = argparse.ArgumentParser(description="FinanceKaro Model Monitoring")
    parser.add_argument("--action", choices=["health", "drift", "performance", "full"], 
                       default="full", help="Monitoring action to perform")
    
    args = parser.parse_args()
    
    monitor = ModelMonitor()
    
    if args.action == "health":
        result = monitor.check_model_health()
    elif args.action == "drift":
        result = monitor.check_data_drift()
    elif args.action == "performance":
        result = monitor.check_model_performance()
    else:  # full
        result = monitor.run_monitoring_cycle()
    
    print(json.dumps(result, indent=2))
    
    # Exit with error code if unhealthy
    if args.action == "health" and result.get("status") != "healthy":
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    main()