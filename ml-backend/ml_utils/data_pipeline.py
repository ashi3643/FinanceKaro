import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
import json
from datetime import datetime
import asyncio

from database.supabase_client import get_supabase_client

class DataPipeline:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def load_training_data(self) -> pd.DataFrame:
        """
        Load training data from Supabase and prepare it for model training
        """
        try:
            # Get data from Supabase
            if not self.supabase:
                raise ValueError("Supabase client not available")
            
            data = self.supabase.get_training_data(limit=5000)
            
            if not data:
                print("No training data found. Using synthetic data for initial training.")
                return self.generate_synthetic_data()
            
            # Convert to DataFrame
            df = pd.DataFrame(data)
            
            # Extract features from JSONB
            features_list = []
            labels = []
            
            for _, row in df.iterrows():
                features = row.get('features', {})
                label = row.get('label')
                
                if features:
                    features_list.append(features)
                    labels.append(label)
            
            # Create feature DataFrame
            features_df = pd.DataFrame(features_list)
            
            # Add labels if available
            if labels and all(l is not None for l in labels):
                features_df['label'] = labels
            
            return features_df
            
        except Exception as e:
            print(f"Error loading training data: {e}")
            return self.generate_synthetic_data()
    
    def generate_synthetic_data(self, n_samples: int = 1000) -> pd.DataFrame:
        """
        Generate synthetic training data for initial model training
        """
        np.random.seed(42)
        
        data = {
            'monthly_amount': np.random.uniform(100, 50000, n_samples),
            'years': np.random.randint(1, 50, n_samples),
            'annual_return': np.random.uniform(5, 20, n_samples),
            'age': np.random.randint(18, 70, n_samples),
            'income': np.random.uniform(20000, 200000, n_samples),
            'risk_tolerance': np.random.choice(['low', 'medium', 'high'], n_samples),
            'financial_goals': ['retirement'] * n_samples
        }
        
        # Calculate target (wealth) using compound interest formula with some noise
        df = pd.DataFrame(data)
        
        # Compound interest: A = P * [((1 + r)^n - 1) / r]
        monthly_rate = df['annual_return'] / 100 / 12
        months = df['years'] * 12
        
        # Handle zero interest rate
        mask = monthly_rate == 0
        df['wealth'] = np.where(
            mask,
            df['monthly_amount'] * months,
            df['monthly_amount'] * (((1 + monthly_rate) ** months - 1) / monthly_rate)
        )
        
        # Add noise (10% of value)
        noise = np.random.normal(0, 0.1, n_samples)
        df['wealth'] = df['wealth'] * (1 + noise)
        
        # Clip negative values
        df['wealth'] = df['wealth'].clip(lower=1000)
        
        return df
    
    def preprocess_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess features for model training
        Returns: (X_features, y_target)
        """
        # Create copy to avoid modifying original
        df_processed = df.copy()
        
        # Encode categorical variables
        if 'risk_tolerance' in df_processed.columns:
            risk_mapping = {'low': 0, 'medium': 1, 'high': 2}
            df_processed['risk_tolerance'] = df_processed['risk_tolerance'].map(risk_mapping)
            df_processed['risk_tolerance'] = df_processed['risk_tolerance'].fillna(1)
        
        # Handle missing values
        numeric_cols = ['monthly_amount', 'years', 'annual_return', 'age', 'income']
        for col in numeric_cols:
            if col in df_processed.columns:
                df_processed[col] = df_processed[col].fillna(df_processed[col].median())
        
        # Select feature columns
        feature_cols = ['monthly_amount', 'years', 'annual_return', 'age', 'income', 'risk_tolerance']
        available_cols = [col for col in feature_cols if col in df_processed.columns]
        
        X = df_processed[available_cols].values
        
        # Get target if available
        y = None
        if 'wealth' in df_processed.columns:
            y = df_processed['wealth'].values
        
        return X, y
    
    def extract_features_from_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and validate features from prediction request
        """
        features = {
            'monthly_amount': float(request_data.get('monthly_amount', 0)),
            'years': int(request_data.get('years', 0)),
            'annual_return': float(request_data.get('annual_return', 0)),
            'age': int(request_data.get('age', 30)),
            'income': float(request_data.get('income', 50000)),
            'risk_tolerance': request_data.get('risk_tolerance', 'medium'),
            'financial_goals': request_data.get('financial_goals', ['retirement'])
        }
        
        # Validate ranges
        features['monthly_amount'] = max(0, min(features['monthly_amount'], 1000000))
        features['years'] = max(1, min(features['years'], 70))
        features['annual_return'] = max(0, min(features['annual_return'], 50))
        features['age'] = max(18, min(features['age'], 100))
        features['income'] = max(0, min(features['income'], 10000000))
        
        return features
    
    async def collect_training_data_from_predictions(self):
        """
        Collect user feedback from predictions to improve training data
        """
        try:
            if not self.supabase:
                return
            
            # Get predictions with feedback
            response = self.supabase.client.table("model_predictions")\
                .select("*")\
                .not_.is_("feedback", "null")\
                .execute()
            
            predictions = response.data if hasattr(response, 'data') else []
            
            for pred in predictions:
                # Convert feedback to label if applicable
                feedback = pred.get('feedback')
                input_features = pred.get('input_features', {})
                
                if feedback and input_features:
                    # Here you could implement logic to convert feedback to training labels
                    # For example, if feedback is "accurate", use the actual outcome as label
                    pass
                    
        except Exception as e:
            print(f"Error collecting training data from predictions: {e}")