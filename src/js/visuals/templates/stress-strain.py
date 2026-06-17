import numpy as np
import matplotlib.pyplot as plt

# Material properties
E = 200e9  # Young's modulus (Pa)
sigma_y = 250e6  # Yield strength (Pa)
sigma_u = 400e6  # Ultimate strength (Pa)
epsilon_y = sigma_y / E
epsilon_u = epsilon_y * 2
epsilon_f = epsilon_u * 1.5

# Generate stress-strain curve
strain = np.linspace(0, epsilon_f, 200)
stress = np.where(strain <= epsilon_y, E * strain, 
                  np.where(strain <= epsilon_u, sigma_y + (sigma_u - sigma_y) * (strain - epsilon_y) / (epsilon_u - epsilon_y),
                           sigma_u * (1 - (strain - epsilon_u) / (epsilon_f - epsilon_u))))

# Plot
plt.figure(figsize=(8, 6))
plt.plot(strain, stress / 1e6, 'b-', linewidth=2)
plt.axhline(y=sigma_y / 1e6, color='r', linestyle='--', label=f'Yield: {sigma_y/1e6} MPa')
plt.axhline(y=sigma_u / 1e6, color='g', linestyle='--', label=f'Ultimate: {sigma_u/1e6} MPa')
plt.xlabel('Strain')
plt.ylabel('Stress (MPa)')
plt.title('Stress-Strain Curve')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()