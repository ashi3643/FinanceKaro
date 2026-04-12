#!/usr/bin/env python3
"""
Scheduled retraining script for FinanceKaro ML models.
This script should be run periodically (e.g., daily/weekly) via cron or scheduler.
"""

import sys
import os
import json
import logging
from datetime import datetime, timedelta
import argparse

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.monitor import ModelMonitor
from scripts.train_model import train_new_model

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scheduled_retraining.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ScheduledRetraining:
    def __init__(self):
        self.monitor = ModelMonitor()
        
    def should_retrain(self, force: bool = False) -> tuple[bool, str]:
        """
        Determine if retraining is needed based on monitoring results.
        Returns: (should_retrain, reason)
        """
        if force:
            return True, "forced_by_user"
        
        # Check model health
        health = self.monitor.check_model_health()
        if health.get("status") != "healthy":
            return True, f"model_unhealthy_{health.get('status')}"
        
        # Check data drift
        drift = self.monitor.check_data_drift(window_days=7)  # Check last week
        if drift.get("drift_detected", False):
            return True, "data_drift_detected"
        
        # Check accuracy from feedback
        feedback_stats = drift.get("feedback_stats", {})
        accuracy_rate = feedback_stats.get("accuracy_rate", 1.0)
        if accuracy_rate < 0.7:  # 70% threshold
            return True, f"low_accuracy_{accuracy_rate:.2f}"
        
        # Check model age
        performance = self.monitor.check_model_performance()
        model_info = performance.get("model_info", {})
        last_trained = model_info.get("last_trained")
        
        if last_trained:
            try:
                last_trained_date = datetime.fromisoformat(last_trained.replace('Z', '+00:00'))
                days_since_training = (datetime.utcnow() - last_trained_date).days
                
                # Retrain if model is older than 30 days
                if days_since_training > 30:
                    return True, f"stale_model_{days_since_training}_days"
                
                # Retrain if we have significant new data
                total_predictions = drift.get("total_predictions", 0)
                if total_predictions > 1000:  # If we have 1000+ new predictions
                    return True, f"significant_new_data_{total_predictions}_predictions"
                    
            except Exception as e:
                logger.warning(f"Could not parse last_trained date: {e}")
        
        return False, "no_retraining_needed"
    
    def run_scheduled_retraining(self, force: bool = False) -> dict:
        """
        Run scheduled retraining if conditions are met.
        """
        logger.info("Starting scheduled retraining check")
        
        should_retrain, reason = self.should_retrain(force)
        
        results = {
            "timestamp": datetime.utcnow().isoformat(),
            "should_retrain": should_retrain,
            "reason": reason,
            "retraining_result": None,
            "monitoring_results": {}
        }
        
        if should_retrain:
            logger.info(f"Retraining needed: {reason}")
            
            # Generate version based on date
            version = f"v1.{datetime.now().strftime('%Y%m%d_%H%M')}"
            
            try:
                # Train new model
                success = train_new_model(
                    version=version,
                    description=f"Scheduled retraining: {reason}",
                    hyperparameters={
                        "epochs": 100,
                        "batch_size": 32,
                        "learning_rate": 0.001
                    }
                )
                
                if success:
                    results["retraining_result"] = {
                        "status": "success",
                        "model_version": version,
                        "reason": reason
                    }
                    logger.info(f"Successfully trained model version {version}")
                else:
                    results["retraining_result"] = {
                        "status": "failed",
                        "model_version": version,
                        "reason": reason
                    }
                    logger.error(f"Failed to train model version {version}")
                    
            except Exception as e:
                results["retraining_result"] = {
                    "status": "error",
                    "error": str(e),
                    "model_version": version,
                    "reason": reason
                }
                logger.error(f"Error during retraining: {e}")
        else:
            logger.info(f"No retraining needed: {reason}")
        
        # Run monitoring to update status
        try:
            monitoring_results = self.monitor.run_monitoring_cycle()
            results["monitoring_results"] = monitoring_results
        except Exception as e:
            logger.error(f"Monitoring failed after retraining check: {e}")
            results["monitoring_error"] = str(e)
        
        # Log results
        logger.info(f"Scheduled retraining check completed: {json.dumps(results, indent=2)}")
        
        # Store results
        self.store_results(results)
        
        return results
    
    def store_results(self, results: dict):
        """Store retraining results"""
        try:
            # Create results directory if it doesn't exist
            os.makedirs("logs/results", exist_ok=True)
            
            # Save to file
            filename = f"logs/results/retraining_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"Results saved to {filename}")
            
            # Also store in database if available
            # (Implementation depends on your database setup)
            
        except Exception as e:
            logger.error(f"Failed to store results: {e}")
    
    def cleanup_old_models(self, keep_last_n: int = 5):
        """Clean up old model files, keeping only the most recent ones"""
        try:
            import glob
            import os
            
            model_files = glob.glob("models/wealth_model_*.h5")
            model_files.sort(key=os.path.getmtime, reverse=True)
            
            if len(model_files) > keep_last_n:
                files_to_delete = model_files[keep_last_n:]
                for file in files_to_delete:
                    # Also delete associated files
                    base_name = file.replace('.h5', '')
                    for ext in ['.h5', '_scaler.joblib', '_metadata.json']:
                        associated_file = f"{base_name}{ext}"
                        if os.path.exists(associated_file):
                            os.remove(associated_file)
                            logger.info(f"Deleted old model file: {associated_file}")
                
                logger.info(f"Cleaned up {len(files_to_delete)} old model files")
                
        except Exception as e:
            logger.error(f"Failed to cleanup old models: {e}")

def main():
    """Main function for scheduled retraining"""
    parser = argparse.ArgumentParser(description="FinanceKaro Scheduled Retraining")
    parser.add_argument("--force", action="store_true", 
                       help="Force retraining regardless of conditions")
    parser.add_argument("--cleanup", action="store_true",
                       help="Clean up old model files after retraining")
    parser.add_argument("--keep-models", type=int, default=5,
                       help="Number of recent models to keep (default: 5)")
    
    args = parser.parse_args()
    
    scheduler = ScheduledRetraining()
    
    # Run retraining check
    results = scheduler.run_scheduled_retraining(force=args.force)
    
    # Cleanup old models if requested
    if args.cleanup:
        scheduler.cleanup_old_models(keep_last_n=args.keep_models)
    
    # Print results
    print(json.dumps(results, indent=2))
    
    # Exit with appropriate code
    if results.get("should_retrain") and results.get("retraining_result", {}).get("status") == "success":
        sys.exit(0)
    elif results.get("should_retrain"):
        sys.exit(1)  # Retraining was needed but failed
    else:
        sys.exit(0)  # No retraining needed

if __name__ == "__main__":
    main()