import sys
import pandas as pd


def update_river_alerts(
    input_path: str = "data/karnataka_rivers.csv",
    output_path: str = "data/river_alerts.csv",
) -> None:
    """Read river level data, classify alerts, and write results to CSV."""
    try:
        rivers = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"Error: river data file not found: {input_path}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading river data: {e}", file=sys.stderr)
        sys.exit(1)

    alerts = []

    for _, row in rivers.iterrows():
        if row["CurrentLevel"] >= row["DangerLevel"]:
            alerts.append({
                "District": row["District"],
                "River": row["River"],
                "Alert": "HIGH",
            })
        elif row["CurrentLevel"] >= row["SafeLevel"]:
            alerts.append({
                "District": row["District"],
                "River": row["River"],
                "Alert": "MEDIUM",
            })

    df = pd.DataFrame(alerts)
    df.to_csv(output_path, index=False)
    print("River monitoring updated")


if __name__ == "__main__":
    update_river_alerts()
