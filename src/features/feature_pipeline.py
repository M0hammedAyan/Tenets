import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os


class FloodFeatureEngineering:
    
    def __init__(self, input_path, output_path="processed_data"):
        self.input_path = input_path
        self.output_path = output_path
        os.makedirs(output_path, exist_ok=True)

    # Load Dataset
    def load_data(self):
        print("Loading dataset...")
        df = pd.read_csv(self.input_path)
        print("Dataset Loaded:", df.shape)
        return df

    # Data Cleaning
    def clean_data(self, df):
        print("Cleaning dataset...")

        # Fill missing rainfall values
        df["rainfall"] = df["rainfall"].fillna(0)

        # Fill missing soil moisture with mean
        df["soil_moisture"] = df["soil_moisture"].fillna(df["soil_moisture"].mean())

        # Fill slope with median
        df["slope"] = df["slope"].fillna(df["slope"].median())

        # Drop rows with missing elevation
        df = df.dropna(subset=["elevation"])

        return df

    # Feature Engineering
    def create_features(self, df):

        print("Creating rainfall aggregation features...")

        df["rainfall_last_3hr"] = df["rainfall"].rolling(window=3, min_periods=1).sum()
        df["rainfall_last_24hr"] = df["rainfall"].rolling(window=24, min_periods=1).sum()

        df["rainfall_intensity"] = df["rainfall_last_3hr"] / 3

        print("Creating flood risk index...")

        df["flood_index"] = (
            df["rainfall_last_3hr"] * df["soil_moisture"] /
            (df["slope"] + 1)
        )

        return df

    # Encode Categorical Features
    def encode_features(self, df):

        print("Encoding soil type...")

        if "soil_type" in df.columns:
            encoder = LabelEncoder()
            df["soil_type_encoded"] = encoder.fit_transform(df["soil_type"])

        return df

    # Scale Numeric Features
    def scale_features(self, df):

        print("Scaling numerical features...")

        feature_columns = [
            "rainfall",
            "rainfall_last_3hr",
            "rainfall_last_24hr",
            "rainfall_intensity",
            "elevation",
            "slope",
            "soil_moisture",
            "flood_index"
        ]

        scaler = StandardScaler()

        df[feature_columns] = scaler.fit_transform(df[feature_columns])

        return df, feature_columns


    def save_dataset(self, df, features):

        print("Saving processed dataset...")

        processed_file = os.path.join(self.output_path, "feature_engineered_dataset.csv")
        feature_list_file = os.path.join(self.output_path, "feature_list.txt")

        df.to_csv(processed_file, index=False)

        with open(feature_list_file, "w") as f:
            for feature in features:
                f.write(feature + "\n")

        print("Saved:", processed_file)
        print("Feature list saved:", feature_list_file)


    def run_pipeline(self):

        df = self.load_data()
        df = self.clean_data(df)
        df = self.create_features(df)
        df = self.encode_features(df)
        df, features = self.scale_features(df)

        self.save_dataset(df, features)

        print("Feature engineering pipeline completed successfully!")



if __name__ == "__main__":

    INPUT_DATASET = "raw_flood_data.csv"

    pipeline = FloodFeatureEngineering(INPUT_DATASET)

    pipeline.run_pipeline()