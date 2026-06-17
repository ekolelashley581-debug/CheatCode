export function generateHistogram(params) {
    const { data = null, bins = 10, title = 'Histogram', xLabel = 'Value', yLabel = 'Frequency' } = params;
    
    if (data) {
        return `
import numpy as np
import matplotlib.pyplot as plt

data = ${JSON.stringify(data)}

plt.figure(figsize=(8, 5))
plt.hist(data, bins=${bins}, color='#d4a000', alpha=0.7, edgecolor='#d4a000', linewidth=1)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
`;
    }
    
    return `
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
data = np.random.randn(1000)

plt.figure(figsize=(8, 5))
plt.hist(data, bins=${bins}, color='#d4a000', alpha=0.7, edgecolor='#d4a000', linewidth=1)
plt.xlabel('${xLabel}')
plt.ylabel('${yLabel}')
plt.title('${title}')
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
`;
}

export function generatePieChart(params) {
    const { labels = ['Category A', 'Category B', 'Category C', 'Category D'], values = [30, 25, 20, 25], title = 'Pie Chart' } = params;
    
    return `
import matplotlib.pyplot as plt

labels = ${JSON.stringify(labels)}
sizes = ${JSON.stringify(values)}
colors = ['#d4a000', '#4a90d9', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b']

plt.figure(figsize=(8, 6))
plt.pie(sizes, labels=labels, colors=colors[:len(sizes)], autopct='%1.1f%%', startangle=90, explode=[0.05] * len(sizes))
plt.title('${title}')
plt.axis('equal')
plt.tight_layout()
`;
}

export function generateNetworkGraph(params) {
    const { nodes = ['A', 'B', 'C', 'D', 'E'], edges = [[0,1], [1,2], [2,3], [3,4], [4,0], [0,2]], title = 'Network Graph' } = params;
    
    return `
import matplotlib.pyplot as plt
import numpy as np

nodes = ${JSON.stringify(nodes)}
edges = ${JSON.stringify(edges)}

# Calculate node positions (circular layout)
n = len(nodes)
angles = np.linspace(0, 2 * np.pi, n, endpoint=False)
pos = {i: (np.cos(angles[i]), np.sin(angles[i])) for i in range(n)}

plt.figure(figsize=(8, 8))

# Draw edges
for edge in edges:
    x = [pos[edge[0]][0], pos[edge[1]][0]]
    y = [pos[edge[0]][1], pos[edge[1]][1]]
    plt.plot(x, y, 'gray', linewidth=1, alpha=0.5)

# Draw nodes
for i, node in enumerate(nodes):
    plt.plot(pos[i][0], pos[i][1], 'o', markersize=15, color='#d4a000', markeredgecolor='black')
    plt.text(pos[i][0], pos[i][1], node, ha='center', va='center', fontsize=10, fontweight='bold')

plt.title('${title}')
plt.axis('off')
plt.tight_layout()
`;
}