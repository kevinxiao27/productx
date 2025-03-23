import sys
import tensorflow as tf
import tensorflow_hub as hub
import librosa
from collections import defaultdict
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# Load YAMNet model and class names
model = hub.load("https://tfhub.dev/google/yamnet/1")
class_map_path = model.class_map_path().numpy()
class_names = tf.io.gfile.GFile(class_map_path).read().splitlines()
print(f"Loaded {len(class_names)} sound classes", flush=True)

# Danger threshold
danger_threshold = 0.15

# Map of YAMNet index -> label for dangerous sounds
danger_classes = {
    304: "car alarm",
    316: "emergency vehicle",
    317: "police car (siren)",
    318: "ambulance (siren)",
    319: "fire engine",
    390: "siren",
    392: "buzzer",
    394: "fire alarm",
    420: "explosion",
    421: "gunshot",
    422: "machine gun",
    424: "artillery fire",
    426: "fireworks",
    427: "firecracker",
    428: "burst, pop",
    430: "boom",
    435: "glass",
    454: "thud",
    460: "bang",
    463: "smash, crash",
    464: "breaking",
    479: "squeal"
}

def detect_top_danger_labels(file_path):
    print(f"Analyzing: {file_path}", flush=True)

    try:
        waveform, sr = librosa.load(file_path, sr=16000)
    except Exception as e:
        print(f"Error loading audio: {e}", flush=True)
        return

    # Run YAMNet
    scores, _, _ = model(waveform)

    # Collect detection stats
    danger_stats = defaultdict(lambda: {"count": 0, "max_confidence": 0.0})

    for frame_scores in scores:
        for i, label in danger_classes.items():
            confidence = float(frame_scores[i])
            if confidence < danger_threshold:
                continue

            danger_stats[label]["count"] += 1
            danger_stats[label]["max_confidence"] = max(
                danger_stats[label]["max_confidence"], confidence
            )

    if not danger_stats:
        print("No danger sounds detected.", flush=True)
        return

    # Sort by score = count × max confidence
    sorted_labels = sorted(
        danger_stats.items(),
        key=lambda item: item[1]["count"] * item[1]["max_confidence"],
        reverse=True
    )

    # Print top 3 danger detections
    for i, (label, data) in enumerate(sorted_labels[:3]):
        print(f"{i+1}. {label} — {data['count']} frames, max confidence: {data['max_confidence']:.3f}", flush=True)

# CLI usage
if __name__ == "__main__":
    detect_top_danger_labels(sys.argv[1])