import pandas as pd
import numpy as np

print("Generating training dataset...")

n = 5000

data = pd.DataFrame({

"Rainfall_24h_mm": np.random.uniform(0,200,n),

"RiverRisk": np.random.uniform(0,1,n),

"area": np.random.uniform(0.001,0.01,n)

})

# create synthetic flood probability
data["FloodProbability"] = (
0.6*(data["Rainfall_24h_mm"]/200)
+
0.3*(data["RiverRisk"])
+
0.1*(data["area"]/0.01)
)

data.to_csv("data/ai_training_data.csv",index=False)

print("Training dataset created")