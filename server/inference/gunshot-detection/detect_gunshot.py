import sys
import tensorflow as tf
import tensorflow_hub as hub
import librosa
from collections import defaultdict

# Load YAMNet and class names
model = hub.load("https://tfhub.dev/google/yamnet/1")
class_map_path = model.class_map_path().numpy()
class_names = tf.io.gfile.GFile(class_map_path).read().splitlines()
print(f"Loaded {len(class_names)} sound classes", flush=True)

high_danger_labels = [
    'gunshot', 'gunfire', 'explosion', 'machine gun', 'artillery fire',
    'scream', 'fireworks', 'firecracker', 'bomb', 'siren', 'car alarm', 'emergency vehicle', 'police car (siren)',
    'ambulance (siren)', 'fire engine', 'buzzer', 'fire alarm', 'bang', 'burst', 'thud', 'crash', 'squeal', 'glass', 'breaking', 'boom'
]

danger_threshold = 0.15

def detect_top_danger_labels(file_path):
    print(f"Analyzing: {file_path}", flush=True)

    try:
        waveform, sr = librosa.load(file_path, sr=16000)
    except Exception as e:
        print(f"Error loading audio: {e}", flush=True)
        return

    scores, _, _ = model(waveform)

    danger_stats = defaultdict(lambda: {"count": 0, "max_confidence": 0.0})

    for j, frame_scores in enumerate(scores):

        for i, confidence in enumerate(frame_scores):
            label = class_names[i].lower()
            confidence = float(confidence)

            if (
                not any(d in label for d in high_danger_labels)
            ):
                continue

            if confidence < danger_threshold:
                continue
            danger_stats[label]["count"] += 1
            if confidence > danger_stats[label]["max_confidence"]:
                danger_stats[label]["max_confidence"] = confidence

            # NEW
            # danger_stats[label]["count"] += 1
            # if confidence > danger_stats[label]["max_confidence"]:
            #     danger_stats[label]["max_confidence"] = confidence
            

    if not danger_stats:
        print("No danger sounds detected.", flush=True)
        return

    # for key, value in danger_stats.items():
    #     print(f"{key} — {value['count']} frames, max confidence: {value['max_confidence']:.3f}", flush=True)
    # Combine count and max confidence to sort
    sorted_labels = sorted(
        danger_stats.items(),
        key=lambda item: item[1]["count"] * item[1]["max_confidence"],
        reverse=True
    )

    for i, (label, data) in enumerate(sorted_labels[:3]):
        print(f"{i+1}. {label} — {data['count']} frames, max confidence: {data['max_confidence']:.3f}", flush=True)

# CLI
if __name__ == "__main__":
    detect_top_danger_labels(sys.argv[1])
