#!/usr/bin/env python3
"""
Verification script for FinanceKaro ML integration.
Tests all components to ensure they work correctly.
"""

import sys
import os
import json
import requests
import time
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_ml_backend():
    """Test ML backend health and basic functionality"""
    print("🧪 Testing ML Backend...")
    
    ml_backend_url = os.getenv('ML_BACKEND_URL', 'http://localhost:8000')
    
    # Test 1: Health endpoint
    try:
        response = requests.get(f"{ml_backend_url}/health", timeout=5)
        if response.status_code == 200:
            print("  ✅ Health check passed")
        else:
            print(f"  ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Health check error: {e}")
        return False
    
    # Test 2: Model info
    try:
        response = requests.get(f"{ml_backend_url}/model/info", timeout=5)
        if response.status_code == 200:
            model_info = response.json()
            print(f"  ✅ Model info: version={model_info.get('version', 'unknown')}")
        else:
            print(f"  ⚠️  Model info failed: {response.status_code}")
    except Exception as e:
        print(f"  ⚠️  Model info error: {e}")
    
    # Test 3: Prediction endpoint
    try:
        test_data = {
            "monthly_amount": 500,
            "years": 40,
            "annual_return": 12,
            "age": 30,
            "income": 50000,
            "risk_tolerance": "medium"
        }
        
        response = requests.post(
            f"{ml_backend_url}/predict",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            prediction = response.json()
            print(f"  ✅ Prediction test passed: {prediction.get('predicted_wealth', 0):.2f}")
            return True
        else:
            print(f"  ❌ Prediction test failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ Prediction test error: {e}")
        return False

def test_nextjs_api():
    """Test Next.js API route"""
    print("\n🧪 Testing Next.js API Route...")
    
    nextjs_url = os.getenv('NEXTJS_URL', 'http://localhost:3000')
    
    try:
        # Test GET endpoint
        response = requests.get(f"{nextjs_url}/api/predict", timeout=5)
        if response.status_code == 200:
            print("  ✅ API GET endpoint works")
        else:
            print(f"  ⚠️  API GET endpoint: {response.status_code}")
        
        # Test POST endpoint
        test_data = {
            "monthlyAmount": 500,
            "years": 40,
            "annualReturn": 12,
            "age": 30,
            "income": 50000,
            "riskTolerance": "medium"
        }
        
        response = requests.post(
            f"{nextjs_url}/api/predict",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"  ✅ API POST endpoint works: prediction={result.get('prediction', 0)}")
                return True
            else:
                print(f"  ⚠️  API POST returned error: {result.get('error')}")
                return False
        else:
            print(f"  ❌ API POST failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ API test error: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    print("\n🧪 Testing Supabase Connection...")
    
    try:
        from database.supabase_client import get_supabase_client
        
        supabase = get_supabase_client()
        if supabase:
            # Try to fetch a small amount of data
            response = supabase.client.table("model_versions").select("*").limit(1).execute()
            print(f"  ✅ Supabase connection works")
            return True
        else:
            print(f"  ⚠️  Supabase client not initialized (check env vars)")
            return False
            
    except Exception as e:
        print(f"  ❌ Supabase test error: {e}")
        return False

def test_model_training():
    """Test model training pipeline"""
    print("\n🧪 Testing Model Training Pipeline...")
    
    try:
        from ml_utils.data_pipeline import DataPipeline
        from ml_utils.model import WealthPredictionModel
        
        # Test data pipeline
        pipeline = DataPipeline()
        data = pipeline.load_training_data()
        
        if data is not None and not data.empty:
            print(f"  ✅ Data pipeline works: {len(data)} samples")
        else:
            print(f"  ⚠️  Data pipeline returned empty data")
        
        # Test model initialization
        model = WealthPredictionModel()
        if model.is_loaded():
            print(f"  ✅ Model loaded successfully")
        else:
            print(f"  ⚠️  Model not loaded (may need training)")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Model training test error: {e}")
        return False

def run_comprehensive_test():
    """Run all tests"""
    print("=" * 60)
    print("FinanceKaro ML Integration Verification")
    print("=" * 60)
    
    results = {
        "timestamp": datetime.utcnow().isoformat(),
        "tests": {}
    }
    
    # Run tests
    tests = [
        ("ML Backend", test_ml_backend),
        ("Next.js API", test_nextjs_api),
        ("Supabase", test_supabase_connection),
        ("Model Training", test_model_training)
    ]
    
    all_passed = True
    
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results["tests"][test_name] = {
                "passed": passed,
                "timestamp": datetime.utcnow().isoformat()
            }
            if not passed:
                all_passed = False
        except Exception as e:
            print(f"  ❌ {test_name} test crashed: {e}")
            results["tests"][test_name] = {
                "passed": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            all_passed = False
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed_count = sum(1 for test in results["tests"].values() if test.get("passed"))
    total_count = len(results["tests"])
    
    print(f"Tests passed: {passed_count}/{total_count}")
    
    if all_passed:
        print("🎉 All tests passed! Integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
    
    # Save results
    os.makedirs("logs", exist_ok=True)
    results_file = f"logs/verification_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to: {results_file}")
    
    return all_passed

def check_environment():
    """Check environment setup"""
    print("\n🔍 Checking Environment...")
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "ML_BACKEND_URL"
    ]
    
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: Set")
        else:
            print(f"  ❌ {var}: Missing")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n⚠️  Missing environment variables: {', '.join(missing_vars)}")
        print("   Copy .env.example to .env and fill in the values")
        return False
    
    return True

def main():
    """Main verification function"""
    # Check environment first
    if not check_environment():
        print("\n❌ Environment not properly configured. Exiting.")
        sys.exit(1)
    
    # Run tests
    success = run_comprehensive_test()
    
    if success:
        print("\n✅ Verification completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Verification failed. See above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()