"""
Quick model training script for flood prediction
Creates a simple ML model that can be used by the API
"""

import pickle
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Create synthetic training data for flood prediction
np.random.seed(42)

# Generate 1000 samples
n_samples = 1000

# Features: rainfall%, discharge%, season, soil_moisture, temperature, humidity, latitude, longitude
X = np.random.rand(n_samples, 8) * 100

# Adjust ranges for more realistic values
X[:, 0] = np.random.rand(n_samples) * 100  # rainfall 0-100%
X[:, 1] = np.random.rand(n_samples) * 100  # discharge 0-100%
X[:, 2] = np.random.randint(1, 5, n_samples) * 25  # season 1-4 (1=winter, 2=spring, 3=summer, 4=monsoon)
X[:, 3] = np.random.rand(n_samples) * 1000  # soil_moisture 0-1000mm
X[:, 4] = 15 + np.random.rand(n_samples) * 20  # temperature 15-35°C
X[:, 5] = np.random.rand(n_samples) * 100  # humidity 0-100%
X[:, 6] = 12 + np.random.rand(n_samples) * 2  # latitude (Karnataka region)
X[:, 7] = 75 + np.random.rand(n_samples) * 3  # longitude (Karnataka region)

# Create target variable (1 = flood risk, 0 = no flood risk)
# Flood risk if: high rainfall AND high discharge AND high season value AND adequate soil moisture
y = ((X[:, 0] > 60) & (X[:, 1] > 50) & (X[:, 2] > 50) & (X[:, 3] > 500)).astype(int)

# Add some monsoon season flooding
monsoon_mask = X[:, 2] > 75
y[monsoon_mask] = ((X[monsoon_mask, 0] > 40) | (X[monsoon_mask, 1] > 40)).astype(int)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
print("Training flood prediction model...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Evaluate
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

print(f"\n✓ Model Training Complete")
print(f"  Training Accuracy: {train_score:.2%}")
print(f"  Testing Accuracy: {test_score:.2%}")

# Save model
model_path = os.path.join(os.path.dirname(__file__), 'models', 'flood_model.pkl')
os.makedirs(os.path.dirname(model_path), exist_ok=True)

with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"\n✓ Model saved to: {model_path}")

# Test prediction
print("\n✓ Test Predictions:")
test_params = [
    [25, 75, 60, 500, 15, 5, 12.97, 77.59],  # Examples
    [80, 90, 100, 800, 28, 85, 13.2, 76.5],
    [10, 20, 30, 200, 20, 40, 14.5, 76.8]
]

for params in test_params:
    pred = model.predict_proba([params])[0]
    print(f"  Params {params[:3]}... -> Flood Risk: {pred[1]:.1%}")
