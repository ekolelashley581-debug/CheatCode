export function generateBMD(params) {
    const { length = 6, loads = [{ type: 'point', magnitude: 10, position: 3 }], title = 'Bending Moment Diagram' } = params;
    
    // Generate Python code for BMD
    let loadCode = '';
    for (const load of loads) {
        if (load.type === 'point') {
            loadCode += `    loads.append({'type': 'point', 'P': ${load.magnitude}, 'a': ${load.position}})\n`;
        } else if (load.type === 'udl') {
            loadCode += `    loads.append({'type': 'udl', 'w': ${load.magnitude}, 'start': ${load.start}, 'end': ${load.end}})\n`;
        }
    }
    
    return `
import numpy as np
import matplotlib.pyplot as plt

def calculate_beam(L, loads):
    # Calculate reactions (simply supported)
    R1 = 0
    R2 = 0
    
    for load in loads:
        if load['type'] == 'point':
            R1 += load['P'] * (L - load['a']) / L
            R2 += load['P'] * load['a'] / L
        elif load['type'] == 'udl':
            total = load['w'] * (load['end'] - load['start'])
            center = (load['start'] + load['end']) / 2
            R1 += total * (L - center) / L
            R2 += total * center / L
    
    # Generate x coordinates
    x = np.linspace(0, L, 200)
    V = np.zeros_like(x)
    M = np.zeros_like(x)
    
    # Calculate shear and moment
    for i, xi in enumerate(x):
        shear = R1
        moment = R1 * xi
        
        for load in loads:
            if load['type'] == 'point':
                if xi > load['a']:
                    shear -= load['P']
                    moment -= load['P'] * (xi - load['a'])
            elif load['type'] == 'udl':
                if xi > load['start']:
                    length_loaded = min(xi, load['end']) - load['start']
                    if length_loaded > 0:
                        shear -= load['w'] * length_loaded
                        moment -= load['w'] * length_loaded * (xi - load['start'] - length_loaded/2)
        
        V[i] = shear
        M[i] = moment
    
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
    ax2.set_xlabel('Position along beam (m)')
    ax2.set_title('Bending Moment Diagram')
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    `;
}

export function generateSFD(params) {
    // Similar to BMD but focused on shear force
    return generateBMD(params); // Reuse BMD function as it generates both
}

export function generateTrussDiagram(params) {
    const { nodes = [[0,0], [4,0], [8,0], [2,3], [6,3]], members = [[0,3], [1,3], [1,4], [2,4], [3,4]], title = 'Truss Diagram' } = params;
    
    return `
import matplotlib.pyplot as plt
import numpy as np

nodes = ${JSON.stringify(nodes)}
members = ${JSON.stringify(members)}

plt.figure(figsize=(10, 6))

# Draw members
for member in members:
    x = [nodes[member[0]][0], nodes[member[1]][0]]
    y = [nodes[member[0]][1], nodes[member[1]][1]]
    plt.plot(x, y, 'b-', linewidth=2, marker='o', markersize=8, markerfacecolor='#d4a000', markeredgecolor='black')

# Label nodes
for i, node in enumerate(nodes):
    plt.text(node[0] + 0.1, node[1] + 0.1, str(i+1), fontsize=10, fontweight='bold')

plt.xlabel('X (m)')
plt.ylabel('Y (m)')
plt.title('${title}')
plt.axis('equal')
plt.grid(True, alpha=0.3)
plt.tight_layout()
`;
}

export function generateMohrCircle(params) {
    const { sigma_x = 100, sigma_y = 20, tau_xy = 30, title = "Mohr's Circle" } = params;
    
    return `
import numpy as np
import matplotlib.pyplot as plt

sigma_x = ${sigma_x}
sigma_y = ${sigma_y}
tau_xy = ${tau_xy}

# Calculate center and radius
center = (sigma_x + sigma_y) / 2
radius = np.sqrt(((sigma_x - sigma_y) / 2)**2 + tau_xy**2)

# Generate circle points
theta = np.linspace(0, 2 * np.pi, 100)
sigma = center + radius * np.cos(theta)
tau = radius * np.sin(theta)

# Calculate principal stresses
sigma1 = center + radius
sigma2 = center - radius
theta_p = 0.5 * np.arctan2(2 * tau_xy, sigma_x - sigma_y)

plt.figure(figsize=(8, 8))
plt.plot(sigma, tau, 'b-', linewidth=2)
plt.axhline(y=0, color='black', linewidth=0.5)
plt.axvline(x=0, color='black', linewidth=0.5)
plt.plot(center, 0, 'ro', label='Center')
plt.plot(sigma1, 0, 'go', label=f'σ₁ = {sigma1:.1f}')
plt.plot(sigma2, 0, 'mo', label=f'σ₂ = {sigma2:.1f}')
plt.plot(sigma_x, tau_xy, 'co', label=f'(σ_x, τ_xy) = ({sigma_x}, {tau_xy})')
plt.plot(sigma_y, -tau_xy, 'yo', label=f'(σ_y, -τ_xy) = ({sigma_y}, {-tau_xy})')

plt.xlabel('σ (Stress)')
plt.ylabel('τ (Shear Stress)')
plt.title("${title}")
plt.legend()
plt.grid(True, alpha=0.3)
plt.axis('equal')
plt.tight_layout()
`;
}