// ═══════════════════════════════════════════════════════════════
// 🎡 SPORT GEAR WHEEL - Fortnite-Style Radial Menu
// ═══════════════════════════════════════════════════════════════

let gearWheel = {
    isOpen: false,
    currentHover: null,
    gears: []
};

// ═══════════════════════════════════════════════════════════════
// 🔊 SOUND FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function playGearSelectSound() {
    const sound = document.getElementById("gearWheelSelectSound");
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.4;
        sound.play().catch(e => console.log("Sound play prevented:", e));
    }
}

function playGearCameraFlashSound() {
    const sound = document.getElementById("gearWheelCameraFlashSound");
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.3; // Lower volume for camera flash
        sound.play().catch(e => console.log("Sound play prevented:", e));
    }
}

// ═══════════════════════════════════════════════════════════════
// 📨 MESSAGE LISTENER
// ═══════════════════════════════════════════════════════════════

window.addEventListener('message', (event) => {
    const data = event.data;

    if (data.action === 'showWheel') {
        showGearWheel(data.gears);
    } else if (data.action === 'hideWheel') {
        hideGearWheel();
    }
});

// ═══════════════════════════════════════════════════════════════
// 🎨 WHEEL DISPLAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function showGearWheel(gears) {
    const container = document.getElementById('gear-wheel-container');
    const segments = document.getElementById('gear-segments');

    // Store gears
    gearWheel.gears = gears;

    // Clear existing segments
    segments.innerHTML = '';

    if (!gears || gears.length === 0) {
        console.error('[Gear Wheel] No gears provided');
        return;
    }

    // FIXED: Always use 8 slots (45 degrees each) regardless of how many gears are available
    const TOTAL_SLOTS = 8;
    const angleStep = 360 / TOTAL_SLOTS;

    // Create segments for each gear using their fixed slot position
    const segmentData = [];
    gears.forEach((gear) => {
        // Use the slotIndex from Lua (0-7) to determine fixed position
        const slotIndex = gear.slotIndex !== undefined ? gear.slotIndex : 0;
        const { segment, label, iconContainer } = createGearSegment(gear, slotIndex, angleStep);
        segments.appendChild(segment);
        segmentData.push({ gear, index: slotIndex, label, iconContainer });
    });

    // Create division lines for ALL 8 slots (fixed wheel structure)
    const wheel = document.getElementById('gear-wheel');
    const dividers = document.createElement('div');
    dividers.id = 'wheel-dividers';
    dividers.style.position = 'absolute';
    dividers.style.width = '100%';
    dividers.style.height = '100%';
    dividers.style.pointerEvents = 'none';
    dividers.style.zIndex = '10';

    // Create dividers for all 8 slots to maintain consistent wheel structure
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const angle = angleStep * i;
        const divider = createDividerLine(angle);
        dividers.appendChild(divider);
    }

    // Remove old dividers, labels, and icons if any
    const oldDividers = document.getElementById('wheel-dividers');
    if (oldDividers) {
        oldDividers.remove();
    }
    const oldLabels = document.getElementById('wheel-labels');
    if (oldLabels) {
        oldLabels.remove();
    }
    const oldIcons = document.getElementById('wheel-icons');
    if (oldIcons) {
        oldIcons.remove();
    }

    wheel.appendChild(dividers);

    // Create labels container (outside clipped segments)
    const labelsContainer = document.createElement('div');
    labelsContainer.id = 'wheel-labels';
    labelsContainer.style.position = 'absolute';
    labelsContainer.style.width = '100%';
    labelsContainer.style.height = '100%';
    labelsContainer.style.pointerEvents = 'none';
    labelsContainer.style.zIndex = '8';

    segmentData.forEach(({ gear, index, label }) => {
        labelsContainer.appendChild(label);
    });

    wheel.appendChild(labelsContainer);

    // Create icons container (outside clipped segments for proper scaling)
    const iconsContainer = document.createElement('div');
    iconsContainer.id = 'wheel-icons';
    iconsContainer.style.position = 'absolute';
    iconsContainer.style.width = '100%';
    iconsContainer.style.height = '100%';
    iconsContainer.style.pointerEvents = 'none';
    iconsContainer.style.zIndex = '9';

    segmentData.forEach(({ gear, index, iconContainer }) => {
        iconsContainer.appendChild(iconContainer);
    });

    wheel.appendChild(iconsContainer);

    // Show container
    container.style.display = 'flex';
    gearWheel.isOpen = true;

    console.log(`[Gear Wheel] Opened with ${gears.length} gears`);
}

function hideGearWheel() {
    const container = document.getElementById('gear-wheel-container');

    // Play camera flash sound when closing
    playGearCameraFlashSound();

    // Add hiding class for fade-out animation
    container.classList.add('hiding');

    // Wait for animation to complete before hiding
    setTimeout(() => {
        container.style.display = 'none';
        container.classList.remove('hiding');
    }, 200); // Match CSS transition duration

    gearWheel.isOpen = false;
    gearWheel.currentHover = null;

    console.log('[Gear Wheel] Closed');
}

// ═══════════════════════════════════════════════════════════════
// 🛠️ SEGMENT CREATION
// ═══════════════════════════════════════════════════════════════

function createGearSegment(gear, index, angleStep) {
    // Create segment container
    const segment = document.createElement('div');
    segment.className = 'gear-segment';
    segment.dataset.gearId = gear.id;

    // Calculate rotation angle - offset by half angleStep to center between dividers
    const angle = (angleStep * index) + (angleStep / 2);
    segment.style.transform = `rotate(${angle}deg)`;

    // Create wedge-shaped clip path for proper hover detection
    const halfAngle = angleStep / 2;
    const clipPath = createWedgeClipPath(halfAngle);
    segment.style.clipPath = clipPath;
    segment.style.webkitClipPath = clipPath;

    // Create icon container (will be added to separate container, not segment)
    const iconContainer = document.createElement('div');
    iconContainer.className = 'gear-icon-container';
    iconContainer.dataset.gearId = gear.id;

    // Create icon (image instead of emoji)
    const icon = document.createElement('img');
    icon.className = 'gear-icon';
    icon.src = `https://raw.githubusercontent.com/Bodh1x/bdx-sport-hub/main/images/wheel/${gear.icon || 'default.png'}`;
    icon.alt = gear.label || 'Unknown';
    icon.onerror = function() {
        this.src = 'https://raw.githubusercontent.com/Bodh1x/bdx-sport-hub/main/images/wheel/default.png'; // Fallback if image not found
    };

    iconContainer.appendChild(icon);

    // Position icon at the center of this segment's pie slice
    // Calculate position based on segment angle - closer to outer edge
    const iconDistance = 175; // Distance from center to icon (closer to outer edge)
    const iconX = Math.sin((angle * Math.PI) / 180) * iconDistance;
    const iconY = -Math.cos((angle * Math.PI) / 180) * iconDistance;

    // Position icon without rotation (keep natural orientation)
    iconContainer.style.position = 'absolute';
    iconContainer.style.top = '50%';
    iconContainer.style.left = '50%';
    iconContainer.style.transform = `translate(calc(-50% + ${iconX}px), calc(-50% + ${iconY}px))`;

    // Create empty label element (for compatibility with existing code)
    const label = document.createElement('div');
    label.className = 'gear-label';
    label.dataset.gearId = gear.id;

    // Add hover event listeners (no click - V key controls everything)
    segment.addEventListener('mouseenter', () => handleGearHover(gear.id));
    segment.addEventListener('mouseleave', () => handleGearUnhover(gear.id));

    // Prevent any click events from interfering
    segment.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    return { segment, label, iconContainer };
}

// Create a wedge-shaped clip path for pie slice
function createWedgeClipPath(halfAngle) {
    // Convert angle to radians
    const rad = (halfAngle * Math.PI) / 180;

    // Calculate points for the wedge
    // Center point
    const cx = 50;
    const cy = 50;

    // Outer radius percentage
    const radius = 50;

    // Calculate edge points
    const x1 = cx + radius * Math.sin(-rad);
    const y1 = cy - radius * Math.cos(-rad);
    const x2 = cx + radius * Math.sin(rad);
    const y2 = cy - radius * Math.cos(rad);

    // Create polygon path (center -> left edge -> arc -> right edge -> center)
    return `polygon(${cx}% ${cy}%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
}

// Create a division line for the wheel
function createDividerLine(angle) {
    const divider = document.createElement('div');
    divider.className = 'wheel-divider';
    divider.style.position = 'absolute';
    divider.style.top = '50%';
    divider.style.left = '50%';
    divider.style.width = '2px';
    divider.style.height = '50%';
    divider.style.background = 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.5) 10%, rgba(255, 255, 255, 0.9) 100%)';
    divider.style.transform = `translate(-50%, 0) rotate(${angle}deg)`;
    divider.style.transformOrigin = 'top center';
    divider.style.pointerEvents = 'none';
    divider.style.zIndex = '10';
    return divider;
}

// ═══════════════════════════════════════════════════════════════
// 🖱️ HOVER HANDLING
// ═══════════════════════════════════════════════════════════════

function handleGearHover(gearId) {
    // Play select sound on hover
    playGearSelectSound();

    // Remove hover class from all segments and icons
    const allSegments = document.querySelectorAll('.gear-segment');
    allSegments.forEach(seg => {
        seg.classList.remove('hover');
    });

    const allIcons = document.querySelectorAll('.gear-icon-container');
    allIcons.forEach(iconContainer => {
        const currentTransform = iconContainer.style.transform;
        iconContainer.style.transform = currentTransform.replace(/ scale\(1\.2\)/, '').trim();
    });

    // Add hover class to current segment
    const currentSegment = document.querySelector(`.gear-segment[data-gear-id="${gearId}"]`);
    if (currentSegment) {
        currentSegment.classList.add('hover');
    }

    // Scale up the icon while preserving position and rotation
    const iconContainer = document.querySelector(`.gear-icon-container[data-gear-id="${gearId}"]`);
    if (iconContainer) {
        const currentTransform = iconContainer.style.transform;
        if (!currentTransform.includes('scale')) {
            iconContainer.style.transform = currentTransform + ' scale(1.2)';
        }
    }

    // Update current hover
    gearWheel.currentHover = gearId;

    // Send hover event to Lua
    fetch(`https://${GetParentResourceName()}/gearHover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gearId: gearId })
    });

    console.log(`[Gear Wheel] Hovered: ${gearId}`);
}

function handleGearUnhover(gearId) {
    const currentSegment = document.querySelector(`.gear-segment[data-gear-id="${gearId}"]`);
    if (currentSegment) {
        currentSegment.classList.remove('hover');
    }

    // Remove scale from icon container
    const iconContainer = document.querySelector(`.gear-icon-container[data-gear-id="${gearId}"]`);
    if (iconContainer) {
        const currentTransform = iconContainer.style.transform;
        iconContainer.style.transform = currentTransform.replace(/ scale\(1\.2\)/, '').trim();
    }
}

// ═══════════════════════════════════════════════════════════════
// ⌨️ KEYBOARD HANDLING
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gearWheel.isOpen) {
        // Close wheel without selecting
        fetch(`https://${GetParentResourceName()}/closeWheel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        hideGearWheel();
    }
});

// Prevent all click events on the wheel container
document.getElementById('gear-wheel-container').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function GetParentResourceName() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('resource') || 'BDX-Sport-Hub';
}

// ═══════════════════════════════════════════════════════════════
// 🚀 INITIALIZATION
// ═══════════════════════════════════════════════════════════════

console.log('✅ [Gear Wheel] Script loaded successfully');
