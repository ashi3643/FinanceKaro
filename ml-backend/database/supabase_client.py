import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    _instance = None
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.url or not self.service_role_key:
            raise ValueError("Supabase URL and Service Role Key must be set in environment variables")
        
        self.client: Client = create_client(self.url, self.service_role_key)
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = SupabaseClient()
        return cls._instance
    
    def get_client(self) -> Client:
        return self.client
    
    def insert_training_data(self, device_id: str, features: dict, label: str = None):
        """Insert training data into the database"""
        data = {
            "device_id": device_id,
            "features": features,
            "label": label,
            "created_at": "now()"
        }
        
        response = self.client.table("training_data").insert(data).execute()
        return response
    
    def get_training_data(self, limit: int = 1000):
        """Retrieve training data for model training"""
        response = self.client.table("training_data").select("*").limit(limit).execute()
        return response.data if hasattr(response, 'data') else []
    
    def insert_prediction(self, device_id: str, model_version_id: str, input_features: dict, prediction: str, feedback: str = None):
        """Insert prediction result into database"""
        data = {
            "device_id": device_id,
            "model_version_id": model_version_id,
            "input_features": input_features,
            "prediction": prediction,
            "feedback": feedback,
            "created_at": "now()"
        }
        
        response = self.client.table("model_predictions").insert(data).execute()
        return response
    
    def get_latest_model_version(self):
        """Get the latest model version from database"""
        response = self.client.table("model_versions")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        return response.data[0] if response.data else None

def get_supabase_client() -> SupabaseClient:
    """Get singleton Supabase client instance"""
    try:
        return SupabaseClient.get_instance()
    except ValueError as e:
        print(f"Warning: Supabase client not initialized: {e}")
        return None