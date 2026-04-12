# FinanceKaro ML Backend

Deep learning backend for financial predictions in the FinanceKaro application.

## Overview

This backend provides AI-powered wealth prediction capabilities using TensorFlow/Keras models. It includes:

- **Model Training**: Neural network models for wealth prediction
- **Inference API**: REST API for making predictions
- **Data Pipeline**: Collection and preprocessing of training data
- **Monitoring**: Automated monitoring of model performance and data drift
- **Retraining**: Scheduled retraining based on performance metrics

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   API Routes    │────▶│   ML Backend    │
│   (Frontend)    │◀────│   (/api/predict)│◀────│   (FastAPI)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                         │
                              ▼                         ▼
                       ┌─────────────────┐     ┌─────────────────┐
                       │   Supabase      │◀────│   Model Store   │
                       │   (Database)    │────▶│   & Training    │
                       └─────────────────┘     └─────────────────┘
```

## Setup

### Prerequisites

- Python 3.11+
- TensorFlow 2.15+
- Supabase account with service role key

### Installation

1. Clone the repository
2. Navigate to the ml-backend directory:
   ```bash
   cd ml-backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
5. Edit `.env` with your Supabase credentials

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
docker build -t financekaro-ml .
docker run -p 8000:8000 --env-file .env financekaro-ml
```

## Usage

### Starting the Backend

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `POST /predict` - Make wealth prediction
- `POST /train` - Trigger model training
- `GET /model/info` - Get model information

### Making Predictions

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_amount": 500,
    "years": 40,
    "annual_return": 12,
    "age": 30,
    "income": 50000,
    "risk_tolerance": "medium"
  }'
```

### Training Models

```bash
# Manual training
python scripts/train_model.py --action train --version v1.0

# Scheduled retraining
python scripts/scheduled_retraining.py

# Force retraining
python scripts/scheduled_retraining.py --force
```

## Monitoring

### Manual Monitoring

```bash
# Check model health
python scripts/monitor.py --action health

# Check data drift
python scripts/monitor.py --action drift

# Full monitoring cycle
python scripts/monitor.py --action full
```

### Automated Monitoring

Set up a cron job for automated monitoring:

```bash
# Daily monitoring at 2 AM
0 2 * * * cd /path/to/ml-backend && python scripts/scheduled_retraining.py >> logs/cron.log 2>&1

# Weekly retraining check on Sundays at 3 AM
0 3 * * 0 cd /path/to/ml-backend && python scripts/scheduled_retraining.py --cleanup >> logs/retraining.log 2>&1
```

## Model Architecture

The wealth prediction model uses a neural network with:

- Input: 6 features (monthly_amount, years, annual_return, age, income, risk_tolerance)
- Hidden layers: 64 → 32 → 16 neurons with ReLU activation
- Output: 1 neuron (predicted wealth)
- Loss: Mean Squared Error (MSE)
- Optimizer: Adam

## Data Flow

1. **Data Collection**: User predictions and feedback stored in Supabase
2. **Data Preprocessing**: Features extracted and normalized
3. **Model Training**: Neural network trained on historical data
4. **Model Serving**: Predictions made via REST API
5. **Feedback Loop**: User feedback used to improve future models

## Database Schema

The backend uses the following Supabase tables:

- `training_data`: Historical data for model training
- `model_versions`: Metadata about trained models
- `model_predictions`: Prediction results and user feedback

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `ML_BACKEND_URL` | Backend URL for API calls | `http://localhost:8000` |
| `MODEL_VERSION` | Current model version | `v1.0` |
| `TRAINING_EPOCHS` | Training epochs | `50` |
| `TRAINING_BATCH_SIZE` | Training batch size | `32` |

### Model Configuration

Edit `ml_utils/model.py` to modify:
- Neural network architecture
- Training hyperparameters
- Feature engineering
- Confidence calculation

## Deployment

### Vercel/Serverless

For serverless deployment, consider:
- Converting to ONNX format for smaller size
- Using TensorFlow.js for browser inference
- Implementing edge functions for low-latency predictions

### Cloud Providers

- **AWS**: SageMaker for training, Lambda for inference
- **GCP**: AI Platform for training, Cloud Functions for inference
- **Azure**: Machine Learning for training, Functions for inference

## Testing

```bash
# Run unit tests
python -m pytest tests/

# Test API endpoints
python scripts/test_api.py

# Load testing
locust -f scripts/load_test.py
```

## Troubleshooting

### Common Issues

1. **TensorFlow import errors**: Ensure TensorFlow 2.15+ is installed
2. **Supabase connection errors**: Verify service role key has proper permissions
3. **Memory issues during training**: Reduce batch size or use data generators
4. **Slow predictions**: Enable model caching or use GPU acceleration

### Logs

Check log files in the `logs/` directory:
- `ml_backend.log`: Application logs
- `monitoring.log`: Monitoring results
- `training.log`: Training progress
- `errors.log`: Error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details