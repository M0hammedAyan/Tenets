import subprocess
import time
import sys

print("Starting Flood Monitoring System...")

while True:

    print("Updating rainfall forecast...")

    subprocess.run([sys.executable,"src/live_monitor.py"])

    subprocess.run([sys.executable,"src/river_monitor.py"])

    subprocess.run([sys.executable,"src/live_map.py"])

    subprocess.run([sys.executable,"src/evacuation_routes.py"])

    subprocess.run([sys.executable,"src/telegram_alert.py"])

    print("Next update in 5 minutes...")

    time.sleep(300)