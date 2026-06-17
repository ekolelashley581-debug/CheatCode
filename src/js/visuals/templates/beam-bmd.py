import numpy as np
import matplotlib.pyplot as plt

# Beam parameters
L = 6  # length (m)
P = 10  # point load (kN)
a = 3  # load position from left (m)

# Calculate reactions
R1 = P * (L - a) / L
R2 = P * a / L

# Generate x coordinates
x = np.linspace(0, L, 200)

# Calculate shear force
V = np.where(x < a, R1, -R2)

# Calculate bending moment
M = np.where(x < a, R1 * x, R1 * x - P * (x - a))

# Create plots
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

# Shear force diagram
ax1.plot(x, V, 'b-', linewidth=2)
ax1.fill_between(x, 0, V, where=(V>0), color='blue', alpha=0.3)
ax1.fill_between(x, 0, V, where=(V<0), color='red', alpha=0.3)
ax1.axhline(y=0, color='black', linewidth=0.5)
ax1.set_ylabel('Shear Force (kN)')
ax1.set_title('Shear Force Diagram')
ax1.grid(True, alpha=0.3)

# Bending moment diagram
ax2.plot(x, M, 'r-', linewidth=2)
ax2.fill_between(x, 0, M, where=(M>0), color='red', alpha=0.3)
ax2.axhline(y=0, color='black', linewidth=0.5)
ax2.set_ylabel('Bending Moment (kNm)')
ax2.set_xlabel('Position (m)')
ax2.set_title('Bending Moment Diagram')
ax2.grid(True, alpha=0.3)

plt.tight_layout()