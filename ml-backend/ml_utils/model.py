import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import os
import json
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
import warnings

warnings.filterwarnings('ignore')

class WealthPredictionModel:
    def __init__(self, model_path: str = None):
        self.model = None
        self.scaler = None
        self.version = "v1.0"
        self.last_trained = None
        self.metrics = {}
        self.feature_names = ['monthly_amount', 'years', 'annual_return', 'age', 'income', 'risk_tolerance']
        
        # Try to load existing model
        if model_path and os.path.exists(model_path):
            self.load(model_path)
        else:
            # Try to load from default location
            default_path = "models/wealth_model_v1.0.h5"
            if os.path.exists(default_path):
                self.load(default_path)
            else:
                print("No pre-trained model found. Initialize with default architecture.")
                self._initialize_default_model()
    
    def _initialize_default_model(self):
        """Initialize a simple neural network model"""
        self.model = keras.Sequential([
            layers.Dense(64, activation='relu', input_shape=(6,)),
            layers.Dropout(0.2),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dense(1)  # Output: predicted wealth
        ])
        
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae', 'mse']
        )
        
        # Initialize scaler
        from sklearn.preprocessing import StandardScaler
        self.scaler = StandardScaler()
        
        # Set default metrics
        self.metrics = {
            "mse": 0.0,
            "mae": 0.0,
            "r2": 0.0,
            "training_samples": 0
        }
    
    def train(self, data: pd.DataFrame, version: str = "v1.0", hyperparameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Train the model on provided data
        """
        try:
            print(f"Starting model training for version {version}...")
            
            # Preprocess data
            from ml_utils.data_pipeline import DataPipeline
            pipeline = DataPipeline()
            X, y = pipeline.preprocess_features(data)
            
            if y is None:
                raise ValueError("No target variable found in training data")
            
            # Split data
            from sklearn.model_selection import train_test_split
            X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            self.scaler = self.scaler or self._create_scaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Update model architecture if hyperparameters provided
            if hyperparameters:
                self._update_architecture(hyperparameters)
            
            # Train model
            history = self.model.fit(
                X_train_scaled, y_train,
                validation_data=(X_val_scaled, y_val),
                epochs=hyperparameters.get('epochs', 50) if hyperparameters else 50,
                batch_size=hyperparameters.get('batch_size', 32) if hyperparameters else 32,
                verbose=1
            )
            
            # Evaluate model
            val_loss, val_mae, val_mse = self.model.evaluate(X_val_scaled, y_val, verbose=0)
            
            # Calculate R² score
            y_pred = self.model.predict(X_val_scaled).flatten()
            from sklearn.metrics import r2_score
            r2 = r2_score(y_val, y_pred)
            
            # Update model metadata
            self.version = version
            self.last_trained = datetime.utcnow().isoformat()
            self.metrics = {
                "mse": float(val_mse),
                "mae": float(val_mae),
                "r2": float(r2),
                "training_samples": len(X_train),
                "validation_samples": len(X_val),
                "final_loss": float(val_loss),
                "epochs_trained": len(history.history['loss'])
            }
            
            print(f"Model training completed. R²: {r2:.4f}, MAE: {val_mae:.2f}")
            
            return self.metrics
            
        except Exception as e:
            print(f"Error during training: {e}")
            raise
    
    def predict(self, features: Dict[str, Any]) -> Tuple[float, float]:
        """
        Make a prediction based on input features
        Returns: (prediction, confidence)
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded or trained")
            
            # Convert features to array
            feature_array = self._features_to_array(features)
            
            # Scale features
            if self.scaler:
                feature_array_scaled = self.scaler.transform(feature_array)
            else:
                feature_array_scaled = feature_array
            
            # Make prediction
            prediction = self.model.predict(feature_array_scaled, verbose=0)[0][0]
            
            # Calculate confidence (simplified - based on feature ranges)
            confidence = self._calculate_confidence(features)
            
            return float(prediction), float(confidence)
            
        except Exception as e:
            print(f"Error during prediction: {e}")
            # Fallback to rule-based prediction
            return self._rule_based_prediction(features), 0.5
    
    def save(self, path: str):
        """Save model and scaler"""
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Save model
        self.model.save(path)
        
        # Save scaler
        scaler_path = path.replace('.h5', '_scaler.joblib')
        if self.scaler:
            joblib.dump(self.scaler, scaler_path)
        
        # Save metadata
        metadata_path = path.replace('.h5', '_metadata.json')
        metadata = {
            "version": self.version,
            "last_trained": self.last_trained,
            "metrics": self.metrics,
            "feature_names": self.feature_names
        }
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model saved to {path}")
    
    def load(self, path: str):
        """Load model and scaler"""
        try:
            # Load model
            self.model = keras.models.load_model(path)
            
            # Load scaler
            scaler_path = path.replace('.h5', '_scaler.joblib')
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            # Load metadata
            metadata_path = path.replace('.h5', '_metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    self.version = metadata.get("version", "v1.0")
                    self.last_trained = metadata.get("last_trained")
                    self.metrics = metadata.get("metrics", {})
                    self.feature_names = metadata.get("feature_names", self.feature_names)
            
            print(f"Model loaded from {path}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self._initialize_default_model()
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None
    
    def get_version(self) -> str:
        """Get model version"""
        return self.version
    
    def get_last_trained(self) -> Optional[str]:
        """Get last training timestamp"""
        return self.last_trained
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get model metrics"""
        return self.metrics
    
    # Helper methods
    def _create_scaler(self):
        """Create a new scaler instance"""
        from sklearn.preprocessing import StandardScaler
        return StandardScaler()
    
    def _update_architecture(self, hyperparameters: Dict[str, Any]):
        """Update model architecture based on hyperparameters"""
        # This is a simplified implementation
        # In production, you would rebuild the model based on hyperparameters
        pass
    
    def _features_to_array(self, features: Dict[str, Any]) -> np.ndarray:
        """Convert features dictionary to numpy array"""
        # Ensure all required features are present
        feature_values = []
        for feature_name in self.feature_names:
            if feature_name in features:
                value = features[feature_name]
                # Convert categorical to numeric
                if feature_name == 'risk_tolerance':
                    risk_mapping = {'low': 0, 'medium': 1, 'high': 2}
                    value = risk_mapping.get(value, 1)
                feature_values.append(float(value))
            else:
                # Use default value
                defaults = {
                    'monthly_amount': 500,
                    'years': 40,
                    'annual_return': 12,
                    'age': 30,
                    'income': 50000,
                    'risk_tolerance': 1
                }
                feature_values.append(defaults[feature_name])
        
        return np.array([feature_values])
    
    def _calculate_confidence(self, features: Dict[str, Any]) -> float:
        """Calculate confidence score for prediction"""
        # Simplified confidence calculation
        # In production, this could be based on prediction variance, feature novelty, etc.
        
        confidence = 0.7  # Base confidence
        
        # Adjust based on feature validity
        if features.get('monthly_amount', 0) > 0:
            confidence += 0.1
        
        if 1 <= features.get('years', 0) <= 70:
            confidence += 0.1
        
        if 0 <= features.get('annual_return', 0) <= 50:
            confidence += 0.1
        
        return min(confidence, 0.95)
    
    def _rule_based_prediction(self, features: Dict[str, Any]) -> float:
        """Fallback rule-based prediction"""
        monthly_amount = features.get('monthly_amount', 500)
        years = features.get('years', 40)
        annual_return = features.get('annual_return', 12)
        
        # Simple compound interest calculation
        monthly_rate = annual_return / 100 / 12
        months = years * 12
        
        if monthly_rate == 0:
            return monthly_amount * months
        
        future_value = monthly_amount * (((1 + monthly_rate) ** months - 1) / monthly_rate)
        return future_value