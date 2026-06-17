import numpy as np
import matplotlib.pyplot as plt

# Generate random data
data = np.random.rand(10, 10) * 100

# Create heat map
plt.figure(figsize=(8, 6))
im = plt.imshow(data, cmap='hot', aspect='auto')
plt.colorbar(im, label='Value')
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Heat Map')
plt.tight_layout()