export function generateLinePlot(params) {
    const { fn, range = [-5, 5], points = 200, title = 'Line Plot', xLabel = 'x', yLabel = 'y' } = params;
    
    if (fn) {
        return `
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(${range[0]}, ${range[1]}, ${points})
y = ${fn.replace('x', 'x')}

plt.figure(figsize=(8, 5))
plt.plot(x, y, 'b-', linewidth=2)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
    }
    
    const { x = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], y = [25, 16, 9, 4, 1, 0, 1, 4, 9, 16, 25] } = params;
    
    return `
import numpy as np
import matplotlib.pyplot as plt

x = ${JSON.stringify(x)}
y = ${JSON.stringify(y)}

plt.figure(figsize=(8, 5))
plt.plot(x, y, 'bo-', linewidth=2, markersize=6)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
}

export function generateBarChart(params) {
    const { labels = ['A', 'B', 'C', 'D', 'E'], values = [10, 20, 15, 25, 18], title = 'Bar Chart', xLabel = 'Category', yLabel = 'Value' } = params;
    
    return `
import numpy as np
import matplotlib.pyplot as plt

categories = ${JSON.stringify(labels)}
values = ${JSON.stringify(values)}

plt.figure(figsize=(8, 5))
plt.bar(categories, values, color='#d4a000', alpha=0.7, edgecolor='#d4a000', linewidth=1)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
`;
}

export function generateScatterPlot(params) {
    const { x = null, y = null, title = 'Scatter Plot', xLabel = 'X', yLabel = 'Y' } = params;
    
    if (x && y) {
        return `
import numpy as np
import matplotlib.pyplot as plt

x = ${JSON.stringify(x)}
y = ${JSON.stringify(y)}

plt.figure(figsize=(8, 5))
plt.scatter(x, y, c='#d4a000', alpha=0.6, s=50)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
    }
    
    return `
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
x = np.random.randn(50) * 2
y = 2 * x + 1 + np.random.randn(50)

plt.figure(figsize=(8, 5))
plt.scatter(x, y, c='#d4a000', alpha=0.6, s=50)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
}

export function generateHeatMap(params) {
    const { data = null, title = 'Heat Map', xLabel = 'X', yLabel = 'Y' } = params;
    
    if (data) {
        return `
import numpy as np
import matplotlib.pyplot as plt

data = ${JSON.stringify(data)}

plt.figure(figsize=(8, 6))
im = plt.imshow(data, cmap='hot', aspect='auto')
plt.colorbar(im, label='Value')
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.tight_layout()
`;
    }
    
    return `
import numpy as np
import matplotlib.pyplot as plt

data = np.random.rand(10, 10) * 100

plt.figure(figsize=(8, 6))
im = plt.imshow(data, cmap='hot', aspect='auto')
plt.colorbar(im, label='Value')
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.tight_layout()
`;
}

export function generateSurface3D(params) {
    const { fn = 'np.sin(np.sqrt(x**2 + y**2))', range = [-5, 5], points = 50, title = '3D Surface' } = params;
    
    return `
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

x = np.linspace(${range[0]}, ${range[1]}, ${points})
y = np.linspace(${range[0]}, ${range[1]}, ${points})
X, Y = np.meshgrid(x, y)
Z = ${fn}

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(X, Y, Z, cmap='viridis', edgecolor='none', alpha=0.8)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('${title}')
fig.colorbar(surf, shrink=0.5, aspect=5)
plt.tight_layout()
`;
}