// Enhanced script to improve Jammu and Kashmir region with better geographic accuracy
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../public/india_path_normalized.txt');
const outputFile = path.join(__dirname, '../src/components/landing/pulse/india-path-constant.ts');

try {
  let pathContent = fs.readFileSync(inputFile, 'utf-8').trim();
  
  console.log('Enhancing Jammu and Kashmir region...');
  
  // Parse all coordinates
  const coordPattern = /(\d+\.\d+),(\d+\.\d+)/g;
  const replacements = [];
  
  // Track which coordinates we've seen to avoid duplicate replacements
  const processedCoords = new Set();
  
  let match;
  while ((match = coordPattern.exec(pathContent)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    const coordStr = match[0];
    
    // Skip if we've already processed this exact coordinate
    if (processedCoords.has(coordStr)) continue;
    
    // Jammu and Kashmir region identification
    // The region is in the northwestern part: X: 150-450, Y: 40-280
    const isJKRegion = x < 450 && y < 280;
    
    if (isJKRegion) {
      let newX = x;
      let newY = y;
      let shouldAdjust = false;
      
      // Region 1: Extreme northwestern corner (Ladakh/Aksai Chin)
      // Coordinates roughly X: 180-280, Y: 50-130
      if (x < 280 && y < 130) {
        // Extend north and west for better Ladakh representation
        if (y < 100) {
          newY = y - 6; // Extend north significantly
          shouldAdjust = true;
        }
        if (x < 220) {
          newX = x - 4; // Extend west significantly
          shouldAdjust = true;
        }
      }
      
      // Region 2: Western Jammu and Kashmir boundary
      // Coordinates roughly X: 180-280, Y: 130-200
      if (x < 280 && y >= 130 && y < 200) {
        // Improve western edge definition
        newX = x - 3; // Extend west
        shouldAdjust = true;
      }
      
      // Region 3: Northern Kashmir region
      // Coordinates roughly X: 280-380, Y: 80-180
      if (x >= 280 && x < 380 && y < 180) {
        // Extend north for better northern border
        if (y < 140) {
          newY = y - 4; // Extend north
          shouldAdjust = true;
        }
      }
      
      // Region 4: Transition area (Jammu region)
      // Coordinates roughly X: 280-380, Y: 180-250
      if (x >= 280 && x < 380 && y >= 180 && y < 250) {
        // Slight refinement for smoother transition
        if (x < 320) {
          newX = x - 2; // Slight west adjustment
          shouldAdjust = true;
        }
      }
      
      if (shouldAdjust) {
        // Round to 2 decimal places
        newX = Math.round(newX * 100) / 100;
        newY = Math.round(newY * 100) / 100;
        
        const newCoordStr = `${newX.toFixed(2)},${newY.toFixed(2)}`;
        
        // Store replacement (we'll do all replacements at once)
        replacements.push({
          old: coordStr,
          new: newCoordStr
        });
        
        processedCoords.add(coordStr);
      }
    }
  }
  
  console.log(`Found ${processedCoords.size} unique J&K region coordinates to adjust`);
  
  // Apply all replacements
  let modifiedPath = pathContent;
  let replacementCount = 0;
  
  replacements.forEach(replacement => {
    // Replace all occurrences of this coordinate pattern
    // Use word boundary to ensure we replace exact matches
    const regex = new RegExp(`\\b${replacement.old.replace(/\./g, '\\.')}\\b`, 'g');
    const matches = modifiedPath.match(regex);
    if (matches) {
      modifiedPath = modifiedPath.replace(regex, replacement.new);
      replacementCount += matches.length;
    }
  });
  
  console.log(`Made ${replacementCount} coordinate adjustments in J&K region`);
  
  const tsContent = `// India outline path (normalized to 1000x1200 viewBox)
// Source: public/india_path_normalized.txt
// This path is fitted into a 1000px width × 1200px height coordinate system
// NOTE: Jammu and Kashmir region has been enhanced for better geographic representation

export const INDIA_PATH = \`${modifiedPath}\`;
`;

  fs.writeFileSync(outputFile, tsContent, 'utf-8');
  console.log('✅ Path constant updated with enhanced J&K region');
  console.log('   Improved: Northwestern Ladakh region, Western boundary, Northern Kashmir border');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

