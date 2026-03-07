import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
import joblib

print("Loading AI training dataset...")

df = pd.read_csv("data/ai_training_data.csv")

X = df[["Rainfall_24h_mm","RiverRisk","area"]]

y = df["FloodProbability"]

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

X_train,X_test,y_train,y_test = train_test_split(
X_scaled,y,test_size=0.2,random_state=42
)

model = xgb.XGBRegressor(
n_estimators=200,
max_depth=5,
learning_rate=0.05
)

model.fit(X_train,y_train)

preds = model.predict(X_test)

rmse = mean_squared_error(y_test,preds)**0.5

print("Model RMSE:",rmse)

joblib.dump(model,"models/flood_xgb_model.pkl")
joblib.dump(scaler,"models/scaler.pkl")

print("AI model saved successfully")