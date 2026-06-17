import numpy as np
import matplotlib.pyplot as plt

# Function to plot
def f(x):
    return x**2  # Change this to any function

# Generate x values
x = np.linspace(-5, 5, 200)
y = f(x)

# Create plot
plt.figure(figsize=(8, 5))
plt.plot(x, y, 'b-', linewidth=2, label='f(x) = x²')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Function Plot')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()