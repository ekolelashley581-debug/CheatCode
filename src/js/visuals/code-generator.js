export function generateMatplotlibCode(visualType, params) {
    switch (visualType) {
        case 'line_plot':
            return generateLinePlot(params);
        case 'bar_chart':
            return generateBarChart(params);
        case 'scatter_plot':
            return generateScatterPlot(params);
        case 'heat_map':
            return generateHeatMap(params);
        default:
            return generateGenericPlot(params);
    }
}

function generateLinePlot(params) {
    const { function: fn, range = [-5, 5], numbers = [] } = params;
    
    if (fn) {
        return `
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(${range[0]}, ${range[1]}, 200)
y = ${fn.replace('x', 'x')}

plt.figure(figsize=(8, 5))
plt.plot(x, y, 'b-', linewidth=2)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Function Plot')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
    }
    
    if (numbers.length >= 2) {
        const x = numbers.filter((_, i) => i % 2 === 0);
        const y = numbers.filter((_, i) => i % 2 === 1);
        return `
import numpy as np
import matplotlib.pyplot as plt

x = ${JSON.stringify(x)}
y = ${JSON.stringify(y)}

plt.figure(figsize=(8, 5))
plt.plot(x, y, 'bo-', linewidth=2, markersize=6)
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Data Plot')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
    }
    
    return `
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-5, 5, 100)
y = x**2

plt.figure(figsize=(8, 5))
plt.plot(x, y, 'b-', linewidth=2)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Plot of y = x²')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
}

function generateBarChart(params) {
    const { numbers = [10, 20, 15, 25, 18] } = params;
    
    return `
import numpy as np
import matplotlib.pyplot as plt

categories = ['A', 'B', 'C', 'D', 'E']
values = ${JSON.stringify(numbers.slice(0, 5))}

plt.figure(figsize=(8, 5))
plt.bar(categories, values, color='#d4a000', alpha=0.7)
plt.xlabel('Category')
plt.ylabel('Value')
plt.title('Bar Chart')
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
`;
}

function generateScatterPlot(params) {
    return `
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
x = np.random.randn(50) * 2
y = 2 * x + 1 + np.random.randn(50)

plt.figure(figsize=(8, 5))
plt.scatter(x, y, c='#d4a000', alpha=0.6, s=50)
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Scatter Plot')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
}

function generateHeatMap(params) {
    return `
import numpy as np
import matplotlib.pyplot as plt

data = np.random.rand(10, 10) * 100

plt.figure(figsize=(8, 6))
im = plt.imshow(data, cmap='hot', aspect='auto')
plt.colorbar(im, label='Value')
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Heat Map')
plt.tight_layout()
`;
}

function generateGenericPlot(params) {
    return `
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-5, 5, 100)
y1 = np.sin(x)
y2 = np.cos(x)

plt.figure(figsize=(8, 5))
plt.plot(x, y1, 'b-', label='sin(x)', linewidth=2)
plt.plot(x, y2, 'r-', label='cos(x)', linewidth=2)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Trigonometric Functions')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
}